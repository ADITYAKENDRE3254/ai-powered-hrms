from pydantic import BaseModel
from typing import List, Optional

class ResumeAnalysisResponse(BaseModel):
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    education: Optional[str] = None
    experience_years: float = 0.0
    certifications: List[str] = []
    previous_roles: List[str] = []
    suggested_department: str
    ai_summary: str
    is_demo_mode: bool = True

class CandidateMatchRequest(BaseModel):
    candidate_id: int
    job_id: int

class CandidateMatchResponse(BaseModel):
    match_score: float
    matching_skills: List[str]
    missing_skills: List[str]
    experience_match: str
    education_match: str
    ai_summary: str
    suggested_department: str
    is_demo_mode: bool = True

class AIChatRequest(BaseModel):
    message: str

class AIChatResponse(BaseModel):
    reply: str
    is_demo_mode: bool = True
    suggested_actions: List[str] = []

class DepartmentClassificationResponse(BaseModel):
    department: str
    confidence: float
    matched_keywords: List[str]
    is_demo_mode: bool = True
