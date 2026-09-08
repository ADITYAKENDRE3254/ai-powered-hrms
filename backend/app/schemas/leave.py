from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, datetime
from app.models.leave import LeaveType, LeaveStatus

class LeaveCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str = Field(..., min_length=3)

class LeaveActionRequest(BaseModel):
    rejection_reason: Optional[str] = None

class LeaveOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department_name: Optional[str] = None
    leave_type: LeaveType
    start_date: date
    end_date: date
    duration_days: int
    reason: str
    status: LeaveStatus
    approver_id: Optional[int] = None
    approver_name: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class LeaveBalanceOut(BaseModel):
    casual_leave: float
    sick_leave: float
    earned_leave: float
    year: int

    model_config = ConfigDict(from_attributes=True)
