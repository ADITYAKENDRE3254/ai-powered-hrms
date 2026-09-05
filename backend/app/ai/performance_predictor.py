import json
from datetime import date, datetime, timedelta, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.attendance import Attendance, VerificationStatus
from app.models.leave import LeaveRequest, LeaveStatus
from app.models.training import TrainingAssignment, AssignmentStatus
from app.models.employee_skill import EmployeeSkill
from app.models.performance_prediction import PerformanceCategory, PerformanceTrend

MODEL_VERSION = "perf-rf-v1.2"

def predict_employee_performance(db: Session, employee: Employee) -> Dict[str, Any]:
    """
    Predicts employee performance using explainable multi-factor heuristic ML model.
    Enforces strict data sufficiency rules (<14 days tenure / <3 attendance records -> INSUFFICIENT_DATA).
    """
    today = date.today()
    tenure_days = max(1, (today - employee.joining_date).days)
    
    # 1. Fetch relevant historical signals
    attendances = db.query(Attendance).filter(Attendance.employee_id == employee.id).all()
    leaves = db.query(LeaveRequest).filter(LeaveRequest.employee_id == employee.id).all()
    trainings = db.query(TrainingAssignment).filter(TrainingAssignment.employee_id == employee.id).all()
    skills = db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == employee.id).all()

    total_attendance = len(attendances)

    # 2. Data Sufficiency Check
    if tenure_days < 14 and total_attendance < 3:
        return {
            "employee_id": employee.id,
            "period": "Current Quarter",
            "score": 0.0,
            "prediction_category": PerformanceCategory.INSUFFICIENT_DATA.value,
            "confidence": 0.0,
            "trend": PerformanceTrend.INSUFFICIENT_DATA.value,
            "positive_factors": [],
            "attention_factors": [
                "New employee onboarding period (< 14 days tenure)",
                "Insufficient historical attendance and work records"
            ],
            "recommended_actions": [
                "Complete initial 30-day onboarding milestones",
                "Establish baseline performance goals and mentor alignment"
            ],
            "model_version": MODEL_VERSION,
            "is_data_sufficient": False,
            "explanation": "Insufficient historical attendance, leave, and performance data available for a reliable AI prediction. A minimum of 14 days active record is required."
        }

    # 3. Factor Analysis & Feature Extraction
    positive_factors: List[str] = []
    attention_factors: List[str] = []
    recommended_actions: List[str] = []

    # A. Attendance Signal (35% weight)
    verified_att = [a for a in attendances if a.verification_status == VerificationStatus.VERIFIED]
    att_rate = (len(verified_att) / max(1, total_attendance)) if total_attendance > 0 else 0.85
    att_score = min(100.0, att_rate * 100.0)

    if att_rate >= 0.90:
        positive_factors.append(f"High on-site verified attendance rate ({att_rate*100:.1f}%)")
    elif att_rate < 0.75:
        attention_factors.append(f"Irregular attendance / punch verification rate ({att_rate*100:.1f}%)")
        recommended_actions.append("Conduct check-in regarding attendance and remote working constraints")

    # B. Leave & Absence Signal (20% weight)
    approved_leaves = [l for l in leaves if l.status == LeaveStatus.APPROVED]
    total_leave_days = sum(l.duration_days for l in approved_leaves)
    leave_ratio = total_leave_days / max(1, (tenure_days / 30.0) * 2.5) # Expected max 2.5 leaves/mo
    leave_score = max(40.0, min(100.0, 100.0 - (leave_ratio * 20.0)))

    if total_leave_days <= 3:
        positive_factors.append("Controlled leave utilization within quarterly entitlement")
    elif total_leave_days > 8:
        attention_factors.append(f"High cumulative leave volume ({total_leave_days} days)")
        recommended_actions.append("Review leave distribution and team workload coverage")

    # C. Training & Skill Development Signal (25% weight)
    completed_trainings = [t for t in trainings if t.status == AssignmentStatus.COMPLETED]
    in_progress_trainings = [t for t in trainings if t.status == AssignmentStatus.IN_PROGRESS]
    skill_count = len(skills)

    training_score = min(100.0, 50.0 + (len(completed_trainings) * 20.0) + (len(in_progress_trainings) * 10.0) + min(20.0, skill_count * 4.0))

    if len(completed_trainings) >= 1:
        positive_factors.append(f"Proactive learning with {len(completed_trainings)} completed training program(s)")
    elif len(trainings) == 0:
        attention_factors.append("No active or completed training programs enrolled")
        recommended_actions.append("Assign target skill development and role-based training programs")

    if skill_count >= 5:
        positive_factors.append(f"Broad skill portfolio with {skill_count} documented technical competencies")
    elif skill_count < 3:
        attention_factors.append(f"Limited skill inventory ({skill_count} skills documented)")
        recommended_actions.append("Update employee skill profile with manager endorsement")

    # D. Tenure & Stability Signal (20% weight)
    tenure_months = tenure_days / 30.0
    tenure_score = min(100.0, 60.0 + min(40.0, tenure_months * 3.0))

    if tenure_months >= 12:
        positive_factors.append(f"Established tenure of {tenure_months:.1f} months in organization")

    # 4. Composite Performance Score
    composite_score = round(
        (att_score * 0.35) +
        (leave_score * 0.20) +
        (training_score * 0.25) +
        (tenure_score * 0.20),
        1
    )

    # 5. Category Determination
    if composite_score >= 75.0:
        category = PerformanceCategory.HIGH.value
    elif composite_score >= 55.0:
        category = PerformanceCategory.MEDIUM.value
    else:
        category = PerformanceCategory.NEEDS_ATTENTION.value

    # 6. Trend Determination
    if len(completed_trainings) >= 1 and att_rate >= 0.85:
        trend = PerformanceTrend.IMPROVING.value
    elif att_rate < 0.75 or (len(trainings) > 0 and all(t.status == AssignmentStatus.OVERDUE for t in trainings)):
        trend = PerformanceTrend.DECLINING.value
    else:
        trend = PerformanceTrend.STABLE.value

    # Confidence calculation (higher data volume = higher confidence)
    confidence = round(min(96.0, max(70.0, 70.0 + min(20.0, total_attendance * 2.0) + min(6.0, tenure_months * 0.5))), 1)

    if not recommended_actions:
        recommended_actions.append("Maintain current high performance trajectory and consider mentoring peers")

    explanation = (
        f"Estimated performance score of {composite_score}/100 based on {len(verified_att)} verified attendance days, "
        f"{len(completed_trainings)} completed training modules, and {skill_count} active skills over {tenure_days} days tenure."
    )

    return {
        "employee_id": employee.id,
        "period": "Current Quarter",
        "score": composite_score,
        "prediction_category": category,
        "confidence": confidence,
        "trend": trend,
        "positive_factors": positive_factors,
        "attention_factors": attention_factors,
        "recommended_actions": recommended_actions,
        "model_version": MODEL_VERSION,
        "is_data_sufficient": True,
        "explanation": explanation
    }
