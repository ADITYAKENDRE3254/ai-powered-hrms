from pydantic import BaseModel, Field, ConfigDict, field_serializer
from typing import Optional, List
from datetime import date, datetime, timezone, timedelta
from app.models.attendance import VerificationStatus

# IST offset — UTC+5:30
_IST = timezone(timedelta(hours=5, minutes=30))

def _to_ist_str(dt: Optional[datetime]) -> Optional[str]:
    """Convert a datetime (naive or tz-aware) to an ISO string with +05:30 offset."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        # Naive — assume it was stored as UTC (old records) or already IST (new records).
        # Supabase/Postgres with DateTime (no tz) stores UTC; attach UTC then convert.
        dt = dt.replace(tzinfo=timezone.utc).astimezone(_IST)
    else:
        dt = dt.astimezone(_IST)
    return dt.isoformat()

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

    model_config = ConfigDict(from_attributes=True)

    @field_serializer('punch_in', 'punch_out', 'created_at')
    def serialize_ist(self, dt: Optional[datetime]) -> Optional[str]:
        """Always return timestamps as IST ISO strings (e.g. 2026-10-26T22:11:00+05:30)."""
        return _to_ist_str(dt)

class AttendanceSummary(BaseModel):
    total_days: int
    present_days: int
    late_days: int
    rejected_attempts: int
    total_hours_worked: float
    average_daily_hours: float
