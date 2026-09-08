from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, date
import enum
from app.core.database import Base

class SalaryType(str, enum.Enum):
    MONTHLY = "MONTHLY"
    ANNUAL = "ANNUAL"
    HOURLY = "HOURLY"

class SalaryApprovalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class DepartmentSalaryRule(Base):
    __tablename__ = "department_salary_rules"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    min_salary = Column(Float, nullable=False)
    max_salary = Column(Float, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    effective_date = Column(Date, default=date.today, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    department = relationship("Department")
    creator = relationship("User", foreign_keys=[created_by])

class PositionSalaryRule(Base):
    __tablename__ = "position_salary_rules"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=True, index=True)
    position_title = Column(String(100), nullable=False, index=True)  # Designation / Position name
    min_salary = Column(Float, nullable=False)
    max_salary = Column(Float, nullable=False)
    default_salary = Column(Float, nullable=False)  # Recommended / Target Base
    salary_type = Column(SQLEnum(SalaryType), default=SalaryType.MONTHLY, nullable=False)
    effective_date = Column(Date, default=date.today, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    department = relationship("Department")
    creator = relationship("User", foreign_keys=[created_by])

class EmployeeSalary(Base):
    __tablename__ = "employee_salaries"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Structure Components
    gross_salary = Column(Float, nullable=False)
    basic_salary = Column(Float, nullable=False)
    hra = Column(Float, default=0.0, nullable=False)
    transport_allowance = Column(Float, default=0.0, nullable=False)
    medical_allowance = Column(Float, default=0.0, nullable=False)
    other_allowances = Column(Float, default=0.0, nullable=False)
    bonus = Column(Float, default=0.0, nullable=False)
    
    # Deductions
    pf_deduction = Column(Float, default=0.0, nullable=False)
    tax_deduction = Column(Float, default=0.0, nullable=False)
    professional_tax = Column(Float, default=0.0, nullable=False)
    other_deductions = Column(Float, default=0.0, nullable=False)
    
    net_salary = Column(Float, nullable=False)
    salary_type = Column(SQLEnum(SalaryType), default=SalaryType.MONTHLY, nullable=False)
    effective_date = Column(Date, default=date.today, nullable=False)
    
    # Approval Workflow
    status = Column(SQLEnum(SalaryApprovalStatus), default=SalaryApprovalStatus.APPROVED, nullable=False, index=True)
    reason = Column(Text, nullable=True)  # e.g., "Annual appraisal", "Negotiated hire", "Promotion"
    requested_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    employee = relationship("Employee")
    requester = relationship("User", foreign_keys=[requested_by])
    approver = relationship("User", foreign_keys=[approved_by])

class SalaryHistory(Base):
    __tablename__ = "salary_history"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_gross_salary = Column(Float, nullable=False)
    new_gross_salary = Column(Float, nullable=False)
    previous_net_salary = Column(Float, nullable=False)
    new_net_salary = Column(Float, nullable=False)
    change_amount = Column(Float, nullable=False)
    change_percentage = Column(Float, nullable=False)
    reason = Column(Text, nullable=True)
    effective_date = Column(Date, nullable=False)
    changed_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    employee = relationship("Employee")
    changed_by = relationship("User", foreign_keys=[changed_by_user_id])
