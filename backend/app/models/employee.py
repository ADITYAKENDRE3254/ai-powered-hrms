from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base

class EmploymentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    PROBATION = "PROBATION"
    TERMINATED = "TERMINATED"

class Gender(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    employee_code = Column(String(50), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    gender = Column(SQLEnum(Gender), default=Gender.OTHER, nullable=True)
    dob = Column(Date, nullable=True)
    address = Column(Text, nullable=True)
    
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    designation = Column(String(100), nullable=False)
    manager_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    team_leader_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)
    
    joining_date = Column(Date, nullable=False)
    monthly_salary = Column(Float, default=0.0, nullable=False)
    tax_percentage = Column(Float, default=10.0, nullable=False)
    pf_percentage = Column(Float, default=12.0, nullable=False)
    allowances = Column(Float, default=0.0, nullable=False)
    
    employment_status = Column(SQLEnum(EmploymentStatus), default=EmploymentStatus.ACTIVE, nullable=False)
    profile_image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User")
    department = relationship("Department", foreign_keys=[department_id], back_populates="employees")
    team = relationship("Team", foreign_keys=[team_id], back_populates="members")
    attendances = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")
    leaves = relationship("LeaveRequest", back_populates="employee", cascade="all, delete-orphan")
    leave_balance = relationship("LeaveBalance", back_populates="employee", uselist=False, cascade="all, delete-orphan")
    payroll_items = relationship("PayrollItem", back_populates="employee", cascade="all, delete-orphan")
