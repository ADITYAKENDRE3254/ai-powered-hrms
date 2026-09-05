from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base

class PerformanceCategory(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    NEEDS_ATTENTION = "NEEDS_ATTENTION"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"

class PerformanceTrend(str, enum.Enum):
    IMPROVING = "IMPROVING"
    STABLE = "STABLE"
    DECLINING = "DECLINING"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"

class PerformancePrediction(Base):
    __tablename__ = "performance_predictions"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    period = Column(String(50), default="Current Quarter", nullable=False)
    score = Column(Float, default=0.0, nullable=False) # 0 to 100
    prediction_category = Column(SQLEnum(PerformanceCategory), default=PerformanceCategory.MEDIUM, nullable=False)
    confidence = Column(Float, default=85.0, nullable=False) # 0 to 100%
    trend = Column(SQLEnum(PerformanceTrend), default=PerformanceTrend.STABLE, nullable=False)
    positive_factors = Column(Text, nullable=False) # JSON list
    attention_factors = Column(Text, nullable=False) # JSON list
    recommended_actions = Column(Text, nullable=False) # JSON list
    model_version = Column(String(50), default="perf-rf-v1.2", nullable=False)
    is_data_sufficient = Column(Boolean, default=True, nullable=False)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    employee = relationship("Employee", foreign_keys=[employee_id])
