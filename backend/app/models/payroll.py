from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base

class PayrollStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PROCESSED = "PROCESSED"
    PAID = "PAID"

class Payroll(Base):
    __tablename__ = "payrolls"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(Integer, nullable=False)  # 1 to 12
    year = Column(Integer, nullable=False)   # e.g., 2026
    total_working_days = Column(Integer, default=22, nullable=False)
    status = Column(SQLEnum(PayrollStatus), default=PayrollStatus.PROCESSED, nullable=False)
    processed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    processed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    items = relationship("PayrollItem", back_populates="payroll", cascade="all, delete-orphan")
    processor = relationship("User", foreign_keys=[processed_by])

class PayrollItem(Base):
    __tablename__ = "payroll_items"

    id = Column(Integer, primary_key=True, index=True)
    payroll_id = Column(Integer, ForeignKey("payrolls.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    
    monthly_salary = Column(Float, nullable=False)
    working_days = Column(Integer, nullable=False)
    present_days = Column(Integer, default=0, nullable=False)
    approved_leave_days = Column(Integer, default=0, nullable=False)
    lwp_days = Column(Integer, default=0, nullable=False)
    
    per_day_rate = Column(Float, nullable=False)
    basic_salary = Column(Float, nullable=False)
    allowances = Column(Float, default=0.0, nullable=False)
    
    lwp_deduction = Column(Float, default=0.0, nullable=False)
    pf_deduction = Column(Float, default=0.0, nullable=False)
    tax_deduction = Column(Float, default=0.0, nullable=False)
    other_deductions = Column(Float, default=0.0, nullable=False)
    
    total_earnings = Column(Float, nullable=False)
    total_deductions = Column(Float, nullable=False)
    net_salary = Column(Float, nullable=False)
    
    payslip_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    payroll = relationship("Payroll", back_populates="items")
    employee = relationship("Employee", back_populates="payroll_items")
