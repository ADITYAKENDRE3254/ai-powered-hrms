from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class FutureSkillPrediction(Base):
    __tablename__ = "future_skill_predictions"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    predicted_skills = Column(Text, nullable=False) # JSON list of strings
    career_path = Column(String(150), nullable=True)
    relevance_score = Column(Float, default=80.0, nullable=False) # 0 to 100%
    reason = Column(Text, nullable=False)
    confidence = Column(Float, default=85.0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    employee = relationship("Employee", foreign_keys=[employee_id])
