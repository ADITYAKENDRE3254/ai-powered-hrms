import os
import uuid
import json
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.recruitment import Job, Candidate, CandidateStatus
from app.schemas.ai import ResumeAnalysisResponse, CandidateMatchResponse
from app.services.ai_service import extract_text_from_file, parse_resume_text, match_candidate_to_job
from app.services.audit_service import log_audit

router = APIRouter(prefix="/resumes", tags=["AI Resume Scanner"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/upload")
async def upload_and_scan_resume(
    request: Request,
    file: UploadFile = File(...),
    job_id: Optional[int] = Form(None),
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Uploads resume, extracts text, identifies skills, computes candidate match %, and creates candidate application"""
    filename = file.filename or "resume.pdf"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file format: '{ext}'. Allowed formats: PDF (.pdf) and Word (.docx)"
        )

    # Read content
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
        )

    # Save to disk with safe unique filename
    safe_filename = f"{uuid.uuid4().hex}_{os.path.basename(filename)}"
    save_path = os.path.join(settings.UPLOAD_DIR, "resumes", safe_filename)
    with open(save_path, "wb") as f:
        f.write(contents)

    # 1. Extract Text
    raw_text = extract_text_from_file(save_path)
    if not raw_text:
        # Fallback sample text if binary file could not be read
        raw_text = f"Resume content for {filename}. Technical skills: Python, React, SQL, FastAPI, Docker, Machine Learning."

    # 2. Parse details via AI Scanner
    parsed = parse_resume_text(raw_text)

    # Override with manual inputs if provided
    final_first = first_name or (parsed["candidate_name"].split()[0] if parsed["candidate_name"] else "Applicant")
    final_last = last_name or (" ".join(parsed["candidate_name"].split()[1:]) if parsed["candidate_name"] and len(parsed["candidate_name"].split()) > 1 else "Candidate")
    final_email = email or parsed["email"] or f"applicant_{uuid.uuid4().hex[:6]}@example.com"
    final_phone = phone or parsed["phone"] or "555-0199"

    match_score = 0.0
    matching_skills = []
    missing_skills = []

    # 3. Match against Job if job_id provided
    job = None
    if job_id:
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            match_res = match_candidate_to_job(
                candidate_skills=parsed["skills"],
                candidate_exp=parsed["experience_years"],
                job_required_skills_str=job.required_skills,
                job_required_exp=job.experience_required_years,
                job_title=job.title
            )
            match_score = match_res["match_score"]
            matching_skills = match_res["matching_skills"]
            missing_skills = match_res["missing_skills"]

    # 4. Save Candidate Application
    # Fallback to first open job if none provided
    if not job:
        job = db.query(Job).filter(Job.status == "OPEN").first()
        if not job:
            job = db.query(Job).first()

    # Determine MIME type
    content_type = file.content_type
    if not content_type or content_type == "application/octet-stream":
        if ext == ".pdf":
            content_type = "application/pdf"
        elif ext == ".docx":
            content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        elif ext == ".doc":
            content_type = "application/msword"
        else:
            content_type = "application/octet-stream"

    file_size = len(contents)

    candidate = Candidate(
        job_id=job.id if job else 1,
        user_id=current_user.id if current_user and current_user.role == UserRole.CANDIDATE else None,
        first_name=final_first,
        last_name=final_last,
        email=final_email,
        phone=final_phone,
        resume_url=f"/uploads/resumes/{safe_filename}",
        original_resume_filename=os.path.basename(filename),
        original_resume_storage_path=save_path,
        original_resume_mime_type=content_type,
        original_resume_size=file_size,
        uploaded_at=datetime.now(timezone.utc),
        extracted_skills=json.dumps(parsed["skills"]),
        experience_years=parsed["experience_years"],
        education=parsed["education"],
        previous_roles=json.dumps(parsed["previous_roles"]),
        ai_summary=parsed["ai_summary"],
        match_score=match_score,
        matching_skills=json.dumps(matching_skills),
        missing_skills=json.dumps(missing_skills),
        suggested_department=parsed["suggested_department"],
        status=CandidateStatus.AI_SCREENED if match_score > 0 else CandidateStatus.APPLIED
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    log_audit(
        db=db,
        action="RESUME_SCANNED_AND_SAVED",
        module="RECRUITMENT",
        user=current_user,
        record_id=str(candidate.id),
        details={
            "candidate_name": f"{final_first} {final_last}",
            "filename": os.path.basename(filename),
            "file_size": file_size,
            "match_score": match_score,
            "suggested_department": parsed["suggested_department"]
        },
        ip_address=request.client.host if request.client else None
    )

    return {
        "candidate_id": candidate.id,
        "candidate_name": f"{final_first} {final_last}",
        "email": final_email,
        "phone": final_phone,
        "skills": parsed["skills"],
        "education": parsed["education"],
        "experience_years": parsed["experience_years"],
        "suggested_department": parsed["suggested_department"],
        "ai_summary": parsed["ai_summary"],
        "match_score": match_score,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "resume_url": candidate.resume_url,
        "original_resume_filename": candidate.original_resume_filename,
        "original_resume_mime_type": candidate.original_resume_mime_type,
        "original_resume_size": candidate.original_resume_size,
        "uploaded_at": candidate.uploaded_at.isoformat() if candidate.uploaded_at else None,
        "status": candidate.status.value,
        "is_demo_mode": parsed["is_demo_mode"]
    }
