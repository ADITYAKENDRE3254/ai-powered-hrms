from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from app.models.attendance import VerificationStatus

class PunchInRequest(BaseModel):
    latitude: float = Field(..., description="Current GPS latitude")
    longitude: float = Field(..., description="Current GPS longitude")
    notes: Optional[str] = None

class PunchOutRequest(BaseModel):
    latitude: float = Field(..., description="Current GPS latitude")
    longitude: float = Field(..., description="Current GPS longitude")
    notes: Optional[str] = None

class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department_name: Optional[str] = None
    date: date
    punch_in: Optional[datetime] = None
    punch_out: Optional[datetime] = None
    punch_in_lat: Optional[float] = None
    punch_in_lng: Optional[float] = None
    punch_out_lat: Optional[float] = None
    punch_out_lng: Optional[float] = None
    distance_in_meters: Optional[float] = None
    verification_status: VerificationStatus
    work_duration_hours: float = 0.0
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AttendanceSummary(BaseModel):
    total_days: int
    present_days: int
    late_days: int
    rejected_attempts: int
    total_hours_worked: float
    average_daily_hours: float
