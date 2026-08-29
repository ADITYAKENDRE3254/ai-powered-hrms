from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base

class LeaveType(str, enum.Enum):
    CASUAL = "CASUAL"
    SICK = "SICK"
    EARNED = "EARNED"
    UNPAID = "UNPAID"

class LeaveStatus(str, enum.Enum):
    PENDING_TL = "PENDING_TL"              # 2-day leaves routed to Team Leader
    PENDING_MANAGER = "PENDING_MANAGER"    # 3+ day leaves routed to Manager / HR
    APPROVED = "APPROVED"                  # 1-day auto-approved or approved by approver
    REJECTED = "REJECTED"

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    leave_type = Column(SQLEnum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    duration_days = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    
    status = Column(SQLEnum(LeaveStatus), default=LeaveStatus.PENDING_TL, nullable=False, index=True)
    approver_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    employee = relationship("Employee", back_populates="leaves")
    approver = relationship("User", foreign_keys=[approver_id])

class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), unique=True, nullable=False)
    casual_leave = Column(Float, default=12.0, nullable=False)
    sick_leave = Column(Float, default=10.0, nullable=False)
    earned_leave = Column(Float, default=15.0, nullable=False)
    year = Column(Integer, default=2026, nullable=False)
    
    employee = relationship("Employee", back_populates="leave_balance")
