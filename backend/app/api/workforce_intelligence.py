from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.employee_skill import SkillLevel, SkillSource
from app.schemas.workforce import (
    WorkforceDashboardSummaryOut,
    DepartmentWorkforceAnalyticsOut,
    PerformancePredictionOut,
    AttritionPredictionOut,
    EmployeeSkillOut,
    EmployeeSkillCreate,
    SkillGapOut,
    FutureSkillOut,
    TrainingRecommendationOut,
    EmployeeAIInsightsOut,
    SkillCategoryOut,
    SkillCategoryCreate,
    SkillOut,
    SkillCreate
)
from app.services import workforce_intelligence_service as wis
from app.models.employee_skill import SkillCategory, Skill, EmployeeSkill

router = APIRouter(prefix="/workforce-intelligence", tags=["AI Workforce Intelligence"])

@router.get("/dashboard", response_model=WorkforceDashboardSummaryOut)
def get_workforce_dashboard(
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER, UserRole.TEAM_LEADER)),
    db: Session = Depends(get_db)
):
    """Returns organizational workforce analytics, performance tiers, attrition risks, and skill matrix."""
    return wis.get_workforce_dashboard_summary(db=db, current_user=current_user)

@router.get("/my-insights", response_model=EmployeeAIInsightsOut)
def get_my_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns personalized AI insights, skills, and course recommendations for the currently authenticated employee."""
    return wis.get_employee_self_service_insights(db=db, current_user=current_user)

@router.get("/employees/{employee_id}/performance", response_model=PerformancePredictionOut)
def get_employee_performance(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns explainable performance prediction and factor breakdown for an authorized employee."""
    return wis.get_employee_performance_prediction(db=db, employee_id=employee_id, current_user=current_user)

@router.get("/employees/{employee_id}/attrition", response_model=AttritionPredictionOut)
def get_employee_attrition(
    employee_id: int,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER, UserRole.TEAM_LEADER)),
    db: Session = Depends(get_db)
):
    """Returns confidential attrition risk estimation with contributing & protective factors."""
    return wis.get_employee_attrition_prediction(db=db, employee_id=employee_id, current_user=current_user)

@router.get("/employees/{employee_id}/skills", response_model=List[EmployeeSkillOut])
def get_employee_skills(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns cataloged skills and confidence scores for an employee."""
    return wis.get_employee_skills(db=db, employee_id=employee_id, current_user=current_user)

@router.get("/employees/{employee_id}/skill-gaps", response_model=SkillGapOut)
def get_employee_skill_gaps(
    employee_id: int,
    target_role: Optional[str] = Query(None, description="Optional target or aspirational job title"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compares employee competencies against target role requirements and returns matched vs missing skills."""
    return wis.get_employee_skill_gaps(db=db, employee_id=employee_id, current_user=current_user, target_role=target_role)

@router.get("/employees/{employee_id}/future-skills", response_model=FutureSkillOut)
def get_employee_future_skills(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns AI-forecasted future skills tailored to career roadmap and industry evolution."""
    return wis.get_employee_future_skills(db=db, employee_id=employee_id, current_user=current_user)

@router.get("/employees/{employee_id}/training-recommendations", response_model=List[TrainingRecommendationOut])
def get_employee_training_recommendations(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns prioritized training course recommendations generated from verified skill gaps."""
    return wis.get_employee_training_recommendations(db=db, employee_id=employee_id, current_user=current_user)

@router.get("/departments/{department_id}/analytics", response_model=DepartmentWorkforceAnalyticsOut)
def get_department_workforce_analytics(
    department_id: int,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER)),
    db: Session = Depends(get_db)
):
    """Returns department-level workforce talent matrix, skill gaps, and risk heatmaps."""
    return wis.get_department_analytics(db=db, department_id=department_id, current_user=current_user)

@router.post("/analyze/all")
def trigger_batch_analysis(
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Manually triggers complete organization-wide AI workforce analysis batch run."""
    return wis.run_full_workforce_analysis(db=db, current_user=current_user)

# Skill Catalog Management Endpoints
@router.get("/skill-categories", response_model=List[SkillCategoryOut])
def list_skill_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SkillCategory).filter(SkillCategory.is_active == True).all()

@router.post("/skill-categories", response_model=SkillCategoryOut)
def create_skill_category(
    data: SkillCategoryCreate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    cat = SkillCategory(name=data.name, description=data.description)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.get("/skills", response_model=List[SkillOut])
def list_skills(
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Skill).filter(Skill.is_active == True)
    if category_id:
        query = query.filter(Skill.category_id == category_id)
    return query.all()

@router.post("/skills", response_model=SkillOut)
def create_skill(
    data: SkillCreate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    skill = Skill(name=data.name, category_id=data.category_id, description=data.description)
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

@router.post("/employees/skills", response_model=EmployeeSkillOut)
def add_employee_skill(
    data: EmployeeSkillCreate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER)),
    db: Session = Depends(get_db)
):
    emp_skill = EmployeeSkill(
        employee_id=data.employee_id,
        skill_id=data.skill_id,
        skill_name=data.skill_name,
        skill_level=data.skill_level,
        confidence=data.confidence,
        source=data.source
    )
    db.add(emp_skill)
    db.commit()
    db.refresh(emp_skill)
    return emp_skill
