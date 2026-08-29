from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.recruitment import JobStatus, CandidateStatus

class JobBase(BaseModel):
    title: str
    department_id: Optional[int] = None
    description: str
    required_skills: str  # Comma separated or JSON
    experience_required_years: float = 0.0
    location: str = "Bangalore / Hybrid"
    employment_type: str = "Full-time"
    salary_range: Optional[str] = None
    status: JobStatus = JobStatus.OPEN

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department_id: Optional[int] = None
    description: Optional[str] = None
    required_skills: Optional[str] = None
    experience_required_years: Optional[float] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    salary_range: Optional[str] = None
    status: Optional[JobStatus] = None

class JobOut(JobBase):
    id: int
    created_by: Optional[int] = None
    department_name: Optional[str] = None
    applicant_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CandidateBase(BaseModel):
    job_id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None

class CandidateCreate(CandidateBase):
    user_id: Optional[int] = None

class CandidateUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[CandidateStatus] = None
    suggested_department: Optional[str] = None

class CandidateStatusUpdate(BaseModel):
    status: CandidateStatus

class CandidateOut(CandidateBase):
    id: int
    user_id: Optional[int] = None
    job_title: Optional[str] = None
    resume_url: Optional[str] = None
    extracted_skills: Optional[str] = None
    experience_years: float = 0.0
    education: Optional[str] = None
    previous_roles: Optional[str] = None
    ai_summary: Optional[str] = None
    match_score: float = 0.0
    matching_skills: Optional[str] = None
    missing_skills: Optional[str] = None
    suggested_department: Optional[str] = None
    status: CandidateStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
