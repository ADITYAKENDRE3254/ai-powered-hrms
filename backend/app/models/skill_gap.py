from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base

class GapPriority(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    target_role = Column(String(150), nullable=False)
    required_skills = Column(Text, nullable=False) # JSON list of strings
    matched_skills = Column(Text, nullable=False)  # JSON list of strings
    missing_skills = Column(Text, nullable=False)  # JSON list of strings
    gap_percentage = Column(Float, default=0.0, nullable=False) # 0 to 100%
    priority = Column(SQLEnum(GapPriority), default=GapPriority.MEDIUM, nullable=False)
    analysis_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    employee = relationship("Employee", foreign_keys=[employee_id])
