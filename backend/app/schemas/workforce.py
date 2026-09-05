from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.employee_skill import SkillLevel, SkillSource
from app.models.skill_gap import GapPriority
from app.models.performance_prediction import PerformanceCategory, PerformanceTrend
from app.models.attrition_prediction import AttritionRiskLevel
from app.models.training_recommendation import RecommendationPriority

# Skill Schemas
class SkillCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class SkillCategoryCreate(SkillCategoryBase):
    pass

class SkillCategoryOut(SkillCategoryBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SkillBase(BaseModel):
    name: str
    category_id: Optional[int] = None
    description: Optional[str] = None
    is_active: bool = True

class SkillCreate(SkillBase):
    pass

class SkillOut(SkillBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EmployeeSkillBase(BaseModel):
    skill_name: str
    skill_id: Optional[int] = None
    skill_level: SkillLevel = SkillLevel.INTERMEDIATE
    confidence: float = 85.0
    source: SkillSource = SkillSource.PROFILE

class EmployeeSkillCreate(EmployeeSkillBase):
    employee_id: int

class EmployeeSkillOut(EmployeeSkillBase):
    id: int
    employee_id: int
    last_verified: datetime
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Performance Prediction Schemas
class PerformancePredictionOut(BaseModel):
    id: Optional[int] = None
    employee_id: int
    employee_name: Optional[str] = None
    department_name: Optional[str] = None
    designation: Optional[str] = None
    period: str
    score: float
    prediction_category: PerformanceCategory
    confidence: float
    trend: PerformanceTrend
    positive_factors: List[str]
    attention_factors: List[str]
    recommended_actions: List[str]
    model_version: str
    is_data_sufficient: bool
    explanation: Optional[str] = None
    prediction_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

# Attrition Prediction Schemas
class AttritionPredictionOut(BaseModel):
    id: Optional[int] = None
    employee_id: int
    employee_name: Optional[str] = None
    department_name: Optional[str] = None
    designation: Optional[str] = None
    period: str
    risk_score: float
    risk_level: AttritionRiskLevel
    confidence: float
    main_factors: List[str]
    protective_factors: List[str]
    recommended_interventions: List[str]
    model_version: str
    is_data_sufficient: bool
    explanation: Optional[str] = None
    prediction_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

# Skill Gap Schemas
class SkillGapOut(BaseModel):
    id: Optional[int] = None
    employee_id: int
    employee_name: Optional[str] = None
    target_role: str
    required_skills: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    gap_percentage: float
    priority: GapPriority
    confidence: float = 90.0
    analysis_date: Optional[datetime] = None

# Future Skills Schemas
class FutureSkillOut(BaseModel):
    id: Optional[int] = None
    employee_id: int
    employee_name: Optional[str] = None
    predicted_skills: List[str]
    career_path: Optional[str] = None
    relevance_score: float
    reason: str
    confidence: float

# Training Recommendation Schemas
class TrainingRecommendationOut(BaseModel):
    id: Optional[int] = None
    employee_id: int
    training_id: Optional[int] = None
    training_name: str
    skill_name: str
    priority: RecommendationPriority
    reason: str
    expected_benefit: str
    confidence: float

# Employee Self-Service Insights Schema
class EmployeeAIInsightsOut(BaseModel):
    employee_id: int
    employee_name: str
    designation: str
    department_name: Optional[str] = None
    performance: PerformancePredictionOut
    skills: List[EmployeeSkillOut]
    skill_gaps: SkillGapOut
    future_skills: FutureSkillOut
    recommended_trainings: List[TrainingRecommendationOut]

# Executive Workforce Intelligence Dashboard Schema
class WorkforceDashboardSummaryOut(BaseModel):
    total_employees: int
    analyzed_employees: int
    performance_distribution: Dict[str, int] # HIGH, MEDIUM, NEEDS_ATTENTION, INSUFFICIENT_DATA
    attrition_risk_distribution: Dict[str, int] # LOW, MEDIUM, HIGH, INSUFFICIENT_DATA
    average_performance_score: float
    average_attrition_risk: float
    high_attrition_count: int
    needs_attention_count: int
    total_skills_tracked: int
    total_training_programs: int
    completed_trainings_count: int
    training_completion_rate: float
    department_analytics: List[Dict[str, Any]]
    top_skill_gaps: List[Dict[str, Any]]
    top_recommended_trainings: List[Dict[str, Any]]
    latest_analysis_run: Optional[Dict[str, Any]] = None

class DepartmentWorkforceAnalyticsOut(BaseModel):
    department_id: int
    department_name: str
    headcount: int
    average_performance: float
    performance_tier_breakdown: Dict[str, int]
    attrition_risk_breakdown: Dict[str, int]
    top_missing_skills: List[str]
    top_department_trainings: List[str]
    employees: List[Dict[str, Any]]
