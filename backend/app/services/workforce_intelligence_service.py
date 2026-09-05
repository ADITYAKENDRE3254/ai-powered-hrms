import json
import time
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.employee import Employee, EmploymentStatus
from app.models.department import Department
from app.models.employee_skill import EmployeeSkill, SkillCategory, Skill
from app.models.skill_gap import SkillGap
from app.models.future_skill import FutureSkillPrediction
from app.models.performance_prediction import PerformancePrediction, PerformanceCategory, PerformanceTrend
from app.models.attrition_prediction import AttritionPrediction, AttritionRiskLevel
from app.models.training import TrainingProgram, TrainingAssignment, AssignmentStatus
from app.models.training_recommendation import TrainingRecommendation
from app.models.workforce_model_run import WorkforceModelRun

from app.ai.performance_predictor import predict_employee_performance
from app.ai.attrition_predictor import predict_employee_attrition
from app.ai.skill_predictor import predict_future_skills
from app.ai.skill_gap_analyzer import analyze_employee_skill_gaps
from app.ai.training_recommender import recommend_training_for_employee
from app.services.audit_service import log_audit

def _check_employee_access_permission(db: Session, current_user: User, target_employee: Employee, is_confidential_attrition: bool = False):
    """
    Enforces strict privacy and dual-layer RBAC permissions for workforce intelligence.
    """
    # 1. Confidential Attrition: Employees can NEVER view any attrition risk (including their own)
    if is_confidential_attrition and current_user.role == UserRole.EMPLOYEE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Attrition risk predictions are confidential advisory tools restricted to authorized HR and Management."
        )

    # 2. Super Admin & HR Manager have full access
    if current_user.role in [UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]:
        return

    # 3. Employee can only access own data (for permitted non-confidential endpoints)
    current_emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if current_user.role == UserRole.EMPLOYEE:
        if not current_emp or current_emp.id != target_employee.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Employees may only view their own performance and skill insights."
            )
        return

    # 4. Department Manager: Only access employees in their own department
    if current_user.role == UserRole.DEPARTMENT_MANAGER:
        if not current_emp or current_emp.department_id != target_employee.department_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Department Managers may only view workforce intelligence for employees in their department."
            )
        return

    # 5. Team Leader: Only access direct team members
    if current_user.role == UserRole.TEAM_LEADER:
        if not current_emp or (current_emp.team_id != target_employee.team_id and target_employee.team_leader_id != current_emp.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Team Leaders may only view intelligence for authorized direct-report team members."
            )
        return

    # Default reject
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Insufficient permissions for workforce intelligence.")

def get_employee_performance_prediction(db: Session, employee_id: int, current_user: User) -> Dict[str, Any]:
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    _check_employee_access_permission(db, current_user, emp, is_confidential_attrition=False)

    # Compute prediction using modular engine
    pred = predict_employee_performance(db, emp)
    pred["employee_name"] = f"{emp.first_name} {emp.last_name}"
    pred["department_name"] = emp.department.name if emp.department else "General"
    pred["designation"] = emp.designation
    return pred

def get_employee_attrition_prediction(db: Session, employee_id: int, current_user: User) -> Dict[str, Any]:
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    _check_employee_access_permission(db, current_user, emp, is_confidential_attrition=True)

    # Compute prediction using modular engine
    pred = predict_employee_attrition(db, emp)
    pred["employee_name"] = f"{emp.first_name} {emp.last_name}"
    pred["department_name"] = emp.department.name if emp.department else "General"
    pred["designation"] = emp.designation

    log_audit(
        db=db,
        action="VIEW_ATTRITION_PREDICTION",
        module="WORKFORCE_INTELLIGENCE",
        user=current_user,
        record_id=str(emp.id),
        details={"risk_level": pred["risk_level"]}
    )
    return pred

def get_employee_skills(db: Session, employee_id: int, current_user: User) -> List[EmployeeSkill]:
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    _check_employee_access_permission(db, current_user, emp, is_confidential_attrition=False)
    skills = db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == employee_id).all()
    return skills

def get_employee_skill_gaps(db: Session, employee_id: int, current_user: User, target_role: Optional[str] = None) -> Dict[str, Any]:
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    _check_employee_access_permission(db, current_user, emp, is_confidential_attrition=False)
    gap_data = analyze_employee_skill_gaps(db, emp, target_role=target_role)
    gap_data["employee_name"] = f"{emp.first_name} {emp.last_name}"
    return gap_data

def get_employee_future_skills(db: Session, employee_id: int, current_user: User) -> Dict[str, Any]:
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    _check_employee_access_permission(db, current_user, emp, is_confidential_attrition=False)
    future_data = predict_future_skills(db, emp)
    future_data["employee_name"] = f"{emp.first_name} {emp.last_name}"
    return future_data

def get_employee_training_recommendations(db: Session, employee_id: int, current_user: User) -> List[Dict[str, Any]]:
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    _check_employee_access_permission(db, current_user, emp, is_confidential_attrition=False)
    return recommend_training_for_employee(db, emp)

def get_employee_self_service_insights(db: Session, current_user: User) -> Dict[str, Any]:
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No employee profile linked to current user.")

    perf = predict_employee_performance(db, emp)
    perf["employee_name"] = f"{emp.first_name} {emp.last_name}"
    perf["department_name"] = emp.department.name if emp.department else "General"
    perf["designation"] = emp.designation

    skills = db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == emp.id).all()
    skill_gaps = analyze_employee_skill_gaps(db, emp)
    skill_gaps["employee_name"] = f"{emp.first_name} {emp.last_name}"

    future_skills = predict_future_skills(db, emp)
    future_skills["employee_name"] = f"{emp.first_name} {emp.last_name}"

    recommended_trainings = recommend_training_for_employee(db, emp)

    return {
        "employee_id": emp.id,
        "employee_name": f"{emp.first_name} {emp.last_name}",
        "designation": emp.designation,
        "department_name": emp.department.name if emp.department else "General",
        "performance": perf,
        "skills": skills,
        "skill_gaps": skill_gaps,
        "future_skills": future_skills,
        "recommended_trainings": recommended_trainings
    }

def get_workforce_dashboard_summary(db: Session, current_user: User) -> Dict[str, Any]:
    """
    Aggregates full workforce intelligence analytics scoped to current user's role.
    """
    emp_query = db.query(Employee).filter(Employee.employment_status == EmploymentStatus.ACTIVE)
    
    # Scoping
    current_emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if current_user.role == UserRole.DEPARTMENT_MANAGER:
        if current_emp and current_emp.department_id:
            emp_query = emp_query.filter(Employee.department_id == current_emp.department_id)
    elif current_user.role == UserRole.TEAM_LEADER:
        if current_emp and current_emp.team_id:
            emp_query = emp_query.filter(Employee.team_id == current_emp.team_id)

    active_employees = emp_query.all()
    total_employees = len(active_employees)

    perf_dist = {"HIGH": 0, "MEDIUM": 0, "NEEDS_ATTENTION": 0, "INSUFFICIENT_DATA": 0}
    attr_dist = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "INSUFFICIENT_DATA": 0}
    perf_scores = []
    attr_scores = []
    missing_skill_counts: Dict[str, int] = {}
    recommended_training_counts: Dict[str, int] = {}

    for emp in active_employees:
        # Performance
        p = predict_employee_performance(db, emp)
        perf_dist[p["prediction_category"]] = perf_dist.get(p["prediction_category"], 0) + 1
        if p["is_data_sufficient"]:
            perf_scores.append(p["score"])

        # Attrition
        a = predict_employee_attrition(db, emp)
        attr_dist[a["risk_level"]] = attr_dist.get(a["risk_level"], 0) + 1
        if a["is_data_sufficient"]:
            attr_scores.append(a["risk_score"])

        # Skill gaps
        g = analyze_employee_skill_gaps(db, emp)
        for m in g.get("missing_skills", []):
            missing_skill_counts[m] = missing_skill_counts.get(m, 0) + 1

        # Recommended trainings
        trainings_rec = recommend_training_for_employee(db, emp)
        for t in trainings_rec[:2]:
            t_name = t["training_name"]
            recommended_training_counts[t_name] = recommended_training_counts.get(t_name, 0) + 1

    avg_perf = round(sum(perf_scores) / max(1, len(perf_scores)), 1) if perf_scores else 0.0
    avg_attr = round(sum(attr_scores) / max(1, len(attr_scores)), 1) if attr_scores else 0.0

    total_skills = db.query(EmployeeSkill).count()
    total_programs = db.query(TrainingProgram).count()
    total_assignments = db.query(TrainingAssignment).count()
    completed_assignments = db.query(TrainingAssignment).filter(TrainingAssignment.status == AssignmentStatus.COMPLETED).count()
    comp_rate = round((completed_assignments / max(1, total_assignments)) * 100.0, 1)

    # Department Analytics Breakdown
    depts = db.query(Department).filter(Department.is_active == True).all()
    if current_user.role == UserRole.DEPARTMENT_MANAGER and current_emp and current_emp.department_id:
        depts = [d for d in depts if d.id == current_emp.department_id]

    dept_analytics = []
    for d in depts:
        d_emps = [e for e in active_employees if e.department_id == d.id]
        if not d_emps:
            continue
        d_perf = [predict_employee_performance(db, e)["score"] for e in d_emps if predict_employee_performance(db, e)["is_data_sufficient"]]
        d_high_attr = sum(1 for e in d_emps if predict_employee_attrition(db, e)["risk_level"] == "HIGH")
        dept_analytics.append({
            "department_id": d.id,
            "department_name": d.name,
            "headcount": len(d_emps),
            "average_performance": round(sum(d_perf) / max(1, len(d_perf)), 1) if d_perf else 0.0,
            "high_attrition_count": d_high_attr,
            "top_missing_skills": [k for k, _ in sorted(missing_skill_counts.items(), key=lambda x: x[1], reverse=True)[:3]]
        })

    # Sort Top Skill Gaps & Recommended Trainings
    top_skill_gaps = [{"skill": k, "affected_employees": v} for k, v in sorted(missing_skill_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
    top_trainings = [{"training_name": k, "demand_count": v} for k, v in sorted(recommended_training_counts.items(), key=lambda x: x[1], reverse=True)[:5]]

    latest_run = db.query(WorkforceModelRun).order_by(WorkforceModelRun.id.desc()).first()

    return {
        "total_employees": total_employees,
        "analyzed_employees": len(perf_scores),
        "performance_distribution": perf_dist,
        "attrition_risk_distribution": attr_dist,
        "average_performance_score": avg_perf,
        "average_attrition_risk": avg_attr,
        "high_attrition_count": attr_dist.get("HIGH", 0),
        "needs_attention_count": perf_dist.get("NEEDS_ATTENTION", 0),
        "total_skills_tracked": total_skills,
        "total_training_programs": total_programs,
        "completed_trainings_count": completed_assignments,
        "training_completion_rate": comp_rate,
        "department_analytics": dept_analytics,
        "top_skill_gaps": top_skill_gaps,
        "top_recommended_trainings": top_trainings,
        "latest_analysis_run": {
            "id": latest_run.id,
            "run_type": latest_run.run_type,
            "duration_seconds": latest_run.duration_seconds,
            "created_at": latest_run.created_at
        } if latest_run else None
    }

def get_department_analytics(db: Session, department_id: int, current_user: User) -> Dict[str, Any]:
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    # Scoping: Department Manager can only view own department
    current_emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if current_user.role == UserRole.DEPARTMENT_MANAGER:
        if not current_emp or current_emp.department_id != department_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: You may only view analytics for your own department.")

    dept_emps = db.query(Employee).filter(
        Employee.department_id == department_id,
        Employee.employment_status == EmploymentStatus.ACTIVE
    ).all()

    perf_tiers = {"HIGH": 0, "MEDIUM": 0, "NEEDS_ATTENTION": 0, "INSUFFICIENT_DATA": 0}
    attr_tiers = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "INSUFFICIENT_DATA": 0}
    perf_scores = []
    missing_skills: Dict[str, int] = {}
    emp_cards = []

    for e in dept_emps:
        p = predict_employee_performance(db, e)
        perf_tiers[p["prediction_category"]] = perf_tiers.get(p["prediction_category"], 0) + 1
        if p["is_data_sufficient"]:
            perf_scores.append(p["score"])

        a = predict_employee_attrition(db, e)
        attr_tiers[a["risk_level"]] = attr_tiers.get(a["risk_level"], 0) + 1

        g = analyze_employee_skill_gaps(db, e)
        for m in g.get("missing_skills", []):
            missing_skills[m] = missing_skills.get(m, 0) + 1

        emp_cards.append({
            "id": e.id,
            "name": f"{e.first_name} {e.last_name}",
            "designation": e.designation,
            "performance_score": p["score"],
            "performance_category": p["prediction_category"],
            "attrition_risk_level": a["risk_level"],
            "attrition_risk_score": a["risk_score"],
            "skill_gap_percentage": g["gap_percentage"]
        })

    avg_perf = round(sum(perf_scores) / max(1, len(perf_scores)), 1) if perf_scores else 0.0

    return {
        "department_id": dept.id,
        "department_name": dept.name,
        "headcount": len(dept_emps),
        "average_performance": avg_perf,
        "performance_tier_breakdown": perf_tiers,
        "attrition_risk_breakdown": attr_tiers,
        "top_missing_skills": [k for k, _ in sorted(missing_skills.items(), key=lambda x: x[1], reverse=True)[:5]],
        "top_department_trainings": [f"{k} Fundamentals" for k, _ in sorted(missing_skills.items(), key=lambda x: x[1], reverse=True)[:3]],
        "employees": emp_cards
    }

def run_full_workforce_analysis(db: Session, current_user: User) -> Dict[str, Any]:
    """
    Executes and records a complete AI Workforce Analysis batch run.
    """
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only HR Managers and Admins can trigger batch AI analysis.")

    start_time = time.time()
    active_employees = db.query(Employee).filter(Employee.employment_status == EmploymentStatus.ACTIVE).all()

    analyzed_count = 0
    for emp in active_employees:
        predict_employee_performance(db, emp)
        predict_employee_attrition(db, emp)
        predict_future_skills(db, emp)
        analyze_employee_skill_gaps(db, emp)
        recommend_training_for_employee(db, emp)
        analyzed_count += 1

    duration = round(time.time() - start_time, 2)

    model_run = WorkforceModelRun(
        run_type="FULL_WORKFORCE_ANALYSIS",
        triggered_by_id=current_user.id,
        status="COMPLETED",
        employees_analyzed=analyzed_count,
        duration_seconds=duration,
        summary_json=json.dumps({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "analyzed_count": analyzed_count,
            "duration": duration,
            "models": ["perf-rf-v1.2", "attr-gb-v1.1", "skill-gap-v1.0", "train-rec-v1.0"]
        })
    )
    db.add(model_run)
    db.commit()
    db.refresh(model_run)

    log_audit(
        db=db,
        action="RUN_WORKFORCE_AI_ANALYSIS",
        module="WORKFORCE_INTELLIGENCE",
        user=current_user,
        record_id=str(model_run.id),
        details={"employees_analyzed": analyzed_count, "duration_seconds": duration}
    )

    return {
        "run_id": model_run.id,
        "status": "COMPLETED",
        "employees_analyzed": analyzed_count,
        "duration_seconds": duration,
        "timestamp": model_run.created_at
    }
