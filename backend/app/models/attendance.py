from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base

class VerificationStatus(str, enum.Enum):
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    MANUAL_OVERRIDE = "MANUAL_OVERRIDE"

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    
    punch_in = Column(DateTime, nullable=True)
    punch_out = Column(DateTime, nullable=True)
    
    punch_in_lat = Column(Float, nullable=True)
    punch_in_lng = Column(Float, nullable=True)
    punch_out_lat = Column(Float, nullable=True)
    punch_out_lng = Column(Float, nullable=True)
    
    distance_in_meters = Column(Float, nullable=True)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.VERIFIED, nullable=False)
    work_duration_hours = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    employee = relationship("Employee", back_populates="attendances")
