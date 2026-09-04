import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.recruitment import Job, Candidate
from app.schemas.ai import AIChatRequest, AIChatResponse, CandidateMatchRequest, CandidateMatchResponse, DepartmentClassificationResponse
from app.services.ai_service import parse_resume_text, match_candidate_to_job, handle_ai_hr_assistant_chat, SKILL_DICTIONARY
from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/hr-assistant/chat", response_model=AIChatResponse)
def ai_assistant_chat(
    chat_in: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Processes conversational messages with the AI HR Assistant with dual-layer privacy & RBAC protection"""
    res = handle_ai_hr_assistant_chat(
        db=db,
        user=current_user,
        message=chat_in.message
    )
    return AIChatResponse(
        reply=res["reply"],
        is_demo_mode=res["is_demo_mode"],
        suggested_actions=res.get("suggested_actions", [])
    )

@router.post("/resume/match", response_model=CandidateMatchResponse)
def match_candidate(
    match_req: CandidateMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculates matching score, matching skills, missing skills, and fit summary between Candidate and Job"""
    candidate = db.query(Candidate).filter(Candidate.id == match_req.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")

    job = db.query(Job).filter(Job.id == match_req.job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    candidate_skills = []
    if candidate.extracted_skills:
        try:
            candidate_skills = json.loads(candidate.extracted_skills)
        except Exception:
            candidate_skills = [s.strip() for s in candidate.extracted_skills.split(",") if s.strip()]

    res = match_candidate_to_job(
        candidate_skills=candidate_skills,
        candidate_exp=candidate.experience_years,
        job_required_skills_str=job.required_skills,
        job_required_exp=job.experience_required_years,
        job_title=job.title
    )

    # Update candidate record with latest calculation
    candidate.match_score = res["match_score"]
    candidate.matching_skills = json.dumps(res["matching_skills"])
    candidate.missing_skills = json.dumps(res["missing_skills"])
    db.commit()

    return CandidateMatchResponse(
        match_score=res["match_score"],
        matching_skills=res["matching_skills"],
        missing_skills=res["missing_skills"],
        experience_match=res["experience_match"],
        education_match=res["education_match"],
        ai_summary=res["ai_summary"],
        suggested_department=candidate.suggested_department or "Engineering",
        is_demo_mode=res["is_demo_mode"]
    )

@router.post("/classify-department", response_model=DepartmentClassificationResponse)
def classify_department_from_skills(
    skills: List[str]
):
    """Classifies a list of candidate skills into the most appropriate department"""
    skills_text = " ".join([s.lower() for s in skills])
    dept_scores = {}
    matched_keywords = []

    for dept, dept_skills in SKILL_DICTIONARY.items():
        score = 0
        for s in dept_skills:
            if s in skills_text:
                score += 1
                matched_keywords.append(s.title())
        dept_scores[dept] = score

    suggested_dept = max(dept_scores, key=dept_scores.get) if any(dept_scores.values()) else "Engineering"
    max_score = max(dept_scores.values()) if dept_scores else 0
    confidence = min(0.98, max(0.65, round(max_score / max(1, len(skills)), 2)))

    return DepartmentClassificationResponse(
        department=suggested_dept,
        confidence=confidence,
        matched_keywords=list(set(matched_keywords)),
        is_demo_mode=settings.AI_DEMO_MODE or not settings.AI_API_KEY
    )
