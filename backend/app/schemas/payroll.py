from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.payroll import PayrollStatus

class PayrollGenerateRequest(BaseModel):
    month: int = Field(..., ge=1, le=12, description="Month 1-12")
    year: int = Field(..., ge=2020, le=2030, description="Year")
    total_working_days: int = Field(22, ge=1, le=31)
    notes: Optional[str] = None

class PayrollItemOut(BaseModel):
    id: int
    payroll_id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department_name: Optional[str] = None
    designation: Optional[str] = None
    monthly_salary: float
    working_days: int
    present_days: int
    approved_leave_days: int
    lwp_days: int
    per_day_rate: float
    basic_salary: float
    allowances: float
    lwp_deduction: float
    pf_deduction: float
    tax_deduction: float
    other_deductions: float
    total_earnings: float
    total_deductions: float
    net_salary: float
    payslip_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PayrollOut(BaseModel):
    id: int
    month: int
    year: int
    total_working_days: int
    status: PayrollStatus
    processed_by: Optional[int] = None
    processor_name: Optional[str] = None
    processed_at: datetime
    notes: Optional[str] = None
    total_employees: Optional[int] = 0
    total_net_disbursed: Optional[float] = 0.0
    items: List[PayrollItemOut] = []

    class Config:
        from_attributes = True
