from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base

class JobStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class CandidateStatus(str, enum.Enum):
    APPLIED = "APPLIED"
    AI_SCREENED = "AI_SCREENED"
    SHORTLISTED = "SHORTLISTED"
    INTERVIEW = "INTERVIEW"
    SELECTED = "SELECTED"
    REJECTED = "REJECTED"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    description = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=False)  # JSON or comma-separated list of skills
    experience_required_years = Column(Float, default=0.0, nullable=False)
    location = Column(String(100), default="Bangalore / Hybrid", nullable=False)
    employment_type = Column(String(50), default="Full-time", nullable=False)
    salary_range = Column(String(100), nullable=True)
    status = Column(SQLEnum(JobStatus), default=JobStatus.OPEN, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    department = relationship("Department")
    candidates = relationship("Candidate", back_populates="job", cascade="all, delete-orphan")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    
    resume_url = Column(String(255), nullable=True)
    original_resume_filename = Column(String(255), nullable=True)
    original_resume_storage_path = Column(String(500), nullable=True)
    original_resume_mime_type = Column(String(100), nullable=True)
    original_resume_size = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=True)

    extracted_skills = Column(Text, nullable=True)  # JSON array string
    experience_years = Column(Float, default=0.0, nullable=False)
    education = Column(String(255), nullable=True)
    previous_roles = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    
    match_score = Column(Float, default=0.0, nullable=False)  # 0 to 100%
    matching_skills = Column(Text, nullable=True)  # JSON array string
    missing_skills = Column(Text, nullable=True)   # JSON array string
    suggested_department = Column(String(100), nullable=True)
    
    status = Column(SQLEnum(CandidateStatus), default=CandidateStatus.APPLIED, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    job = relationship("Job", back_populates="candidates")
