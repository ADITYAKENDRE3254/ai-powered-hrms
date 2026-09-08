from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime
from app.models.employee import EmploymentStatus, Gender
from app.models.user import UserRole

class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    gender: Optional[Gender] = Gender.OTHER
    dob: Optional[date] = None
    address: Optional[str] = None
    department_id: Optional[int] = None
    team_id: Optional[int] = None
    designation: str
    manager_id: Optional[int] = None
    team_leader_id: Optional[int] = None
    joining_date: date
    monthly_salary: float = 0.0
    tax_percentage: float = 10.0
    pf_percentage: float = 12.0
    allowances: float = 0.0
    employment_status: EmploymentStatus = EmploymentStatus.ACTIVE
    profile_image_url: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    password: Optional[str] = "Employee@123"
    role: Optional[UserRole] = UserRole.EMPLOYEE

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[Gender] = None
    dob: Optional[date] = None
    address: Optional[str] = None
    department_id: Optional[int] = None
    team_id: Optional[int] = None
    designation: Optional[str] = None
    manager_id: Optional[int] = None
    team_leader_id: Optional[int] = None
    joining_date: Optional[date] = None
    monthly_salary: Optional[float] = None
    tax_percentage: Optional[float] = None
    pf_percentage: Optional[float] = None
    allowances: Optional[float] = None
    employment_status: Optional[EmploymentStatus] = None
    profile_image_url: Optional[str] = None
    role: Optional[UserRole] = None

class EmployeeOut(EmployeeBase):
    id: int
    user_id: int
    employee_code: str
    created_at: datetime
    updated_at: datetime
    department_name: Optional[str] = None
    team_name: Optional[str] = None
    manager_name: Optional[str] = None
    team_leader_name: Optional[str] = None
    user_role: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EmployeeListOut(BaseModel):
    total: int
    items: list[EmployeeOut]
