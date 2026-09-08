from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from app.models.compensation import SalaryType, SalaryApprovalStatus

# ----------------- DEPARTMENT SALARY SCHEMAS -----------------

class DepartmentSalaryRuleBase(BaseModel):
    department_id: int
    min_salary: float = Field(..., ge=0, description="Minimum monthly base compensation")
    max_salary: float = Field(..., ge=0, description="Maximum monthly base compensation")
    currency: str = "INR"
    effective_date: date = Field(default_factory=date.today)
    is_active: bool = True
    notes: Optional[str] = None

class DepartmentSalaryRuleCreate(DepartmentSalaryRuleBase):
    pass

class DepartmentSalaryRuleUpdate(BaseModel):
    min_salary: Optional[float] = Field(None, ge=0)
    max_salary: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = None
    effective_date: Optional[date] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class DepartmentSalaryRuleOut(DepartmentSalaryRuleBase):
    id: int
    department_name: Optional[str] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- POSITION SALARY SCHEMAS -----------------

class PositionSalaryRuleBase(BaseModel):
    department_id: Optional[int] = None
    position_title: str
    min_salary: float = Field(..., ge=0)
    max_salary: float = Field(..., ge=0)
    default_salary: float = Field(..., ge=0)
    salary_type: SalaryType = SalaryType.MONTHLY
    effective_date: date = Field(default_factory=date.today)
    is_active: bool = True
    notes: Optional[str] = None

class PositionSalaryRuleCreate(PositionSalaryRuleBase):
    pass

class PositionSalaryRuleUpdate(BaseModel):
    department_id: Optional[int] = None
    position_title: Optional[str] = None
    min_salary: Optional[float] = Field(None, ge=0)
    max_salary: Optional[float] = Field(None, ge=0)
    default_salary: Optional[float] = Field(None, ge=0)
    salary_type: Optional[SalaryType] = None
    effective_date: Optional[date] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class PositionSalaryRuleOut(PositionSalaryRuleBase):
    id: int
    department_name: Optional[str] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- EMPLOYEE SALARY & STRUCTURE SCHEMAS -----------------

class SalaryComponentBreakdown(BaseModel):
    basic_salary: float
    hra: float = 0.0
    transport_allowance: float = 0.0
    medical_allowance: float = 0.0
    other_allowances: float = 0.0
    bonus: float = 0.0
    pf_deduction: float = 0.0
    tax_deduction: float = 0.0
    professional_tax: float = 0.0
    other_deductions: float = 0.0
    gross_salary: float
    total_deductions: float
    net_salary: float

class EmployeeSalaryCreate(BaseModel):
    employee_id: int
    gross_salary: float = Field(..., ge=0)
    basic_salary: Optional[float] = None
    hra: Optional[float] = None
    transport_allowance: Optional[float] = None
    medical_allowance: Optional[float] = None
    other_allowances: Optional[float] = None
    bonus: Optional[float] = None
    pf_deduction: Optional[float] = None
    tax_deduction: Optional[float] = None
    professional_tax: Optional[float] = None
    other_deductions: Optional[float] = None
    salary_type: SalaryType = SalaryType.MONTHLY
    effective_date: date = Field(default_factory=date.today)
    reason: Optional[str] = "Salary configuration"

class EmployeeSalaryOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department_name: Optional[str] = None
    position: Optional[str] = None
    
    gross_salary: float
    basic_salary: float
    hra: float
    transport_allowance: float
    medical_allowance: float
    other_allowances: float
    bonus: float
    
    pf_deduction: float
    tax_deduction: float
    professional_tax: float
    other_deductions: float
    
    total_deductions: float = 0.0
    net_salary: float
    salary_type: SalaryType
    effective_date: date
    status: SalaryApprovalStatus
    reason: Optional[str] = None
    
    requested_by: Optional[int] = None
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    
    # Benchmark Context
    department_min_salary: Optional[float] = None
    department_max_salary: Optional[float] = None
    position_min_salary: Optional[float] = None
    position_max_salary: Optional[float] = None
    position_default_salary: Optional[float] = None
    salary_source: str = "INDIVIDUAL"  # "INDIVIDUAL", "POSITION", "DEPARTMENT", "EMPLOYEE_DEFAULT"
    
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EmployeeCompensationSummaryOut(BaseModel):
    employee_id: int
    employee_name: str
    employee_code: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    position: str
    current_gross_salary: float
    current_net_salary: float
    department_range: str
    position_range: str
    suggested_salary: float
    actual_salary: float
    salary_source: str
    status: SalaryApprovalStatus
    effective_date: date

# ----------------- APPROVAL & HISTORY SCHEMAS -----------------

class SalaryApprovalRequest(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None

class SalaryHistoryOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    previous_gross_salary: float
    new_gross_salary: float
    previous_net_salary: float
    new_net_salary: float
    change_amount: float
    change_percentage: float
    reason: Optional[str] = None
    effective_date: date
    changed_by_user_id: Optional[int] = None
    changed_by_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- AI RECOMMENDATION SCHEMAS -----------------

class AISalaryRecommendationRequest(BaseModel):
    employee_id: Optional[int] = None
    department_id: Optional[int] = None
    position_title: str
    experience_years: float = Field(0.0, ge=0)
    skills: List[str] = []

class AISalaryRecommendationOut(BaseModel):
    recommended_salary: float
    recommended_range_min: float
    recommended_range_max: float
    confidence_score: float  # 0 to 100
    factors: List[str]
    explanation: str
    is_insufficient_data: bool = False
    notes: str = "AI advisory recommendation is decision support only. Requires HR confirmation."

# ----------------- DASHBOARD ANALYTICS SCHEMAS -----------------

class DepartmentSalaryMetric(BaseModel):
    department: str
    employee_count: int
    min_salary: float
    max_salary: float
    avg_salary: float
    total_budget: float

class PositionSalaryMetric(BaseModel):
    position_title: str
    department: str
    min_salary: float
    recommended_salary: float
    max_salary: float
    avg_actual_salary: float
    employee_count: int

class CompensationDashboardOut(BaseModel):
    total_monthly_payroll_budget: float
    avg_company_salary: float
    total_configured_departments: int
    total_configured_positions: int
    pending_approvals_count: int
    salary_growth_yoy_percent: float
    department_metrics: List[DepartmentSalaryMetric]
    position_metrics: List[PositionSalaryMetric]
    salary_distribution_buckets: List[Dict[str, Any]]
    monthly_growth_trend: List[Dict[str, Any]]
