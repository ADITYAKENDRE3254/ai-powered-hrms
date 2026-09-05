from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base

class RecommendationPriority(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class TrainingRecommendation(Base):
    __tablename__ = "training_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    training_id = Column(Integer, ForeignKey("training_programs.id", ondelete="CASCADE"), nullable=True)
    training_name = Column(String(200), nullable=False)
    skill_name = Column(String(100), nullable=False)
    priority = Column(SQLEnum(RecommendationPriority), default=RecommendationPriority.MEDIUM, nullable=False)
    reason = Column(Text, nullable=False)
    expected_benefit = Column(Text, nullable=False)
    confidence = Column(Float, default=85.0, nullable=False)
    is_dismissed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    employee = relationship("Employee", foreign_keys=[employee_id])
    training = relationship("TrainingProgram", foreign_keys=[training_id])
