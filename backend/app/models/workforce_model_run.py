from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class WorkforceModelRun(Base):
    __tablename__ = "workforce_model_runs"

    id = Column(Integer, primary_key=True, index=True)
    run_type = Column(String(50), default="FULL_WORKFORCE_ANALYSIS", nullable=False) # FULL_WORKFORCE_ANALYSIS, PERFORMANCE, ATTRITION, SKILLS, TRAINING
    triggered_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="COMPLETED", nullable=False) # STARTED, COMPLETED, FAILED
    employees_analyzed = Column(Integer, default=0, nullable=False)
    duration_seconds = Column(Float, default=0.0, nullable=False)
    summary_json = Column(Text, nullable=True) # JSON object
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    triggered_by = relationship("User", foreign_keys=[triggered_by_id])
