import os
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.department import Department
from app.models.recruitment import Job, Candidate, JobStatus, CandidateStatus
from app.schemas.recruitment import JobCreate, JobUpdate, JobOut, CandidateCreate, CandidateUpdate, CandidateOut, CandidateStatusUpdate
from app.services.audit_service import log_audit

router = APIRouter(prefix="/recruitment", tags=["Recruitment"])

# ----------------- JOBS -----------------

@router.get("/jobs", response_model=List[JobOut])
def list_jobs(
    status: Optional[JobStatus] = None,
    department_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists job postings with applicant count"""
    query = db.query(Job)

    # Candidates or unauthenticated users can only see OPEN jobs
    if current_user.role == UserRole.CANDIDATE:
        query = query.filter(Job.status == JobStatus.OPEN)
    elif status:
        query = query.filter(Job.status == status)

    if department_id:
        query = query.filter(Job.department_id == department_id)

    jobs = query.order_by(Job.id.desc()).all()
    results = []
    for j in jobs:
        count = db.query(Candidate).filter(Candidate.job_id == j.id).count()
        out = JobOut.model_validate(j)
        out.department_name = j.department.name if j.department else None
        out.applicant_count = count
        results.append(out)
    return results

@router.get("/jobs/{id}", response_model=JobOut)
def get_job(id: int, db: Session = Depends(get_db)):
    """Retrieves single job details"""
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    count = db.query(Candidate).filter(Candidate.job_id == job.id).count()
    out = JobOut.model_validate(job)
    out.department_name = job.department.name if job.department else None
    out.applicant_count = count
    return out

@router.post("/jobs", response_model=JobOut, status_code=status.HTTP_201_CREATED)
def create_job(
    request: Request,
    job_in: JobCreate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)),
    db: Session = Depends(get_db)
):
    """Creates a new job opening"""
    job_data = job_in.model_dump()
    job_data["created_by"] = current_user.id
    job = Job(**job_data)
    db.add(job)
    db.commit()
    db.refresh(job)

    log_audit(
        db=db,
        action="JOB_CREATED",
        module="RECRUITMENT",
        user=current_user,
        record_id=str(job.id),
        details={"title": job.title, "department_id": job.department_id},
        ip_address=request.client.host if request.client else None
    )

    out = JobOut.model_validate(job)
    out.department_name = job.department.name if job.department else None
    out.applicant_count = 0
    return out

@router.put("/jobs/{id}", response_model=JobOut)
def update_job(
    request: Request,
    id: int,
    job_in: JobUpdate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)),
    db: Session = Depends(get_db)
):
    """Updates a job opening"""
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    for key, value in job_in.model_dump(exclude_unset=True).items():
        setattr(job, key, value)

    db.commit()
    db.refresh(job)

    log_audit(
        db=db,
        action="JOB_UPDATED",
        module="RECRUITMENT",
        user=current_user,
        record_id=str(job.id),
        details={"title": job.title, "status": job.status.value},
        ip_address=request.client.host if request.client else None
    )

    out = JobOut.model_validate(job)
    out.department_name = job.department.name if job.department else None
    out.applicant_count = db.query(Candidate).filter(Candidate.job_id == job.id).count()
    return out

@router.delete("/jobs/{id}")
def delete_job(
    request: Request,
    id: int,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)),
    db: Session = Depends(get_db)
):
    """Closes or deletes a job opening"""
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    db.delete(job)
    db.commit()

    log_audit(
        db=db,
        action="JOB_DELETED",
        module="RECRUITMENT",
        user=current_user,
        record_id=str(id),
        ip_address=request.client.host if request.client else None
    )
    return {"message": "Job deleted successfully"}

# ----------------- CANDIDATES -----------------

@router.get("/candidates", response_model=List[CandidateOut])
def list_candidates(
    job_id: Optional[int] = None,
    status: Optional[CandidateStatus] = None,
    suggested_department: Optional[str] = None,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER, UserRole.DEPARTMENT_MANAGER, UserRole.CANDIDATE)),
    db: Session = Depends(get_db)
):
    """Lists candidates with AI matching scores and filter criteria"""
    query = db.query(Candidate)

    # Candidate role can only see their own applications
    if current_user.role == UserRole.CANDIDATE:
        query = query.filter(Candidate.user_id == current_user.id)
    else:
        if job_id:
            query = query.filter(Candidate.job_id == job_id)
        if status:
            query = query.filter(Candidate.status == status)
        if suggested_department:
            query = query.filter(Candidate.suggested_department.ilike(f"%{suggested_department}%"))

    candidates = query.order_by(Candidate.match_score.desc(), Candidate.id.desc()).all()
    results = []
    for c in candidates:
        out = CandidateOut.model_validate(c)
        out.job_title = c.job.title if c.job else None
        results.append(out)
    return results

@router.get("/candidates/{id}", response_model=CandidateOut)
def get_candidate(
    id: int,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER, UserRole.DEPARTMENT_MANAGER, UserRole.CANDIDATE)),
    db: Session = Depends(get_db)
):
    """Gets candidate profile and AI score breakdown"""
    candidate = db.query(Candidate).filter(Candidate.id == id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")

    if current_user.role == UserRole.CANDIDATE and candidate.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    out = CandidateOut.model_validate(candidate)
    out.job_title = candidate.job.title if candidate.job else None
    return out

@router.put("/candidates/{id}/status", response_model=CandidateOut)
def update_candidate_status(
    request: Request,
    id: int,
    status_in: CandidateStatusUpdate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)),
    db: Session = Depends(get_db)
):
    """Shortlists, selects, or rejects a candidate"""
    candidate = db.query(Candidate).filter(Candidate.id == id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")

    candidate.status = status_in.status
    db.commit()
    db.refresh(candidate)

    log_audit(
        db=db,
        action="CANDIDATE_STATUS_UPDATED",
        module="RECRUITMENT",
        user=current_user,
        record_id=str(candidate.id),
        details={"new_status": status_in.status.value, "candidate_name": f"{candidate.first_name} {candidate.last_name}"},
        ip_address=request.client.host if request.client else None
    )

    out = CandidateOut.model_validate(candidate)
    out.job_title = candidate.job.title if candidate.job else None
    return out

@router.get("/candidates/{id}/resume")
def get_candidate_resume(
    request: Request,
    id: int,
    download: bool = Query(False, description="If true, returns file as download attachment; otherwise inline stream"),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER, UserRole.DEPARTMENT_MANAGER, UserRole.CANDIDATE)),
    db: Session = Depends(get_db)
):
    """Securely streams or downloads candidate's original uploaded resume with audit logging and RBAC"""
    candidate = db.query(Candidate).filter(Candidate.id == id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")

    if current_user.role == UserRole.CANDIDATE and candidate.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Locate resume file path on disk
    file_path = None
    if candidate.original_resume_storage_path and os.path.exists(candidate.original_resume_storage_path):
        file_path = candidate.original_resume_storage_path
    elif candidate.resume_url:
        rel_path = candidate.resume_url.replace("/uploads/", "").lstrip("/\\")
        candidate_path = os.path.join(settings.UPLOAD_DIR, rel_path)
        if os.path.exists(candidate_path):
            file_path = candidate_path
        elif os.path.exists(os.path.join(settings.UPLOAD_DIR, "resumes", os.path.basename(candidate.resume_url))):
            file_path = os.path.join(settings.UPLOAD_DIR, "resumes", os.path.basename(candidate.resume_url))

    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Original resume document file not found on server storage."
        )

    filename = candidate.original_resume_filename or os.path.basename(file_path)
    mime_type = candidate.original_resume_mime_type
    if not mime_type:
        ext = os.path.splitext(filename)[1].lower()
        if ext == ".pdf":
            mime_type = "application/pdf"
        elif ext == ".docx":
            mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        elif ext == ".doc":
            mime_type = "application/msword"
        else:
            mime_type = "application/octet-stream"

    action = "RESUME_DOWNLOADED" if download else "RESUME_VIEWED"
    log_audit(
        db=db,
        action=action,
        module="RECRUITMENT",
        user=current_user,
        record_id=str(candidate.id),
        details={
            "candidate_name": f"{candidate.first_name} {candidate.last_name}",
            "filename": filename,
            "download_mode": download
        },
        ip_address=request.client.host if request.client else None
    )

    disposition = "attachment" if download else "inline"
    headers = {
        "Content-Disposition": f'{disposition}; filename="{filename}"',
        "Cache-Control": "private, max-age=3600",
    }

    return FileResponse(
        path=file_path,
        media_type=mime_type,
        filename=filename,
        headers=headers
    )
