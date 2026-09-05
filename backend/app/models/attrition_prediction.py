from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base

class AttritionRiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"

class AttritionPrediction(Base):
    __tablename__ = "attrition_predictions"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    period = Column(String(50), default="Next 6 Months", nullable=False)
    risk_score = Column(Float, default=0.0, nullable=False) # 0 to 100
    risk_level = Column(SQLEnum(AttritionRiskLevel), default=AttritionRiskLevel.LOW, nullable=False)
    confidence = Column(Float, default=85.0, nullable=False) # 0 to 100%
    main_factors = Column(Text, nullable=False) # JSON list
    protective_factors = Column(Text, nullable=False) # JSON list
    recommended_interventions = Column(Text, nullable=False) # JSON list
    model_version = Column(String(50), default="attr-gb-v1.1", nullable=False)
    is_data_sufficient = Column(Boolean, default=True, nullable=False)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    employee = relationship("Employee", foreign_keys=[employee_id])
