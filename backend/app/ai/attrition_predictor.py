from datetime import date, datetime, timedelta, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.employee import Employee
from app.models.attendance import Attendance, VerificationStatus
from app.models.leave import LeaveRequest, LeaveStatus
from app.models.training import TrainingAssignment, AssignmentStatus
from app.models.employee_skill import EmployeeSkill
from app.models.attrition_prediction import AttritionRiskLevel

MODEL_VERSION = "attr-gb-v1.1"

def predict_employee_attrition(db: Session, employee: Employee) -> Dict[str, Any]:
    """
    Estimates employee attrition risk using ethical, job-related workforce indicators.
    Strictly excludes all sensitive characteristics (gender, religion, race, disability, etc.).
    """
    today = date.today()
    tenure_days = max(1, (today - employee.joining_date).days)
    tenure_months = tenure_days / 30.0

    # 1. Historical Signals
    attendances = db.query(Attendance).filter(Attendance.employee_id == employee.id).all()
    leaves = db.query(LeaveRequest).filter(LeaveRequest.employee_id == employee.id).all()
    trainings = db.query(TrainingAssignment).filter(TrainingAssignment.employee_id == employee.id).all()
    skills = db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == employee.id).all()

    total_attendance = len(attendances)

    # 2. Data Sufficiency Guard
    if tenure_days < 14 and total_attendance < 3:
        return {
            "employee_id": employee.id,
            "period": "Next 6 Months",
            "risk_score": 0.0,
            "risk_level": AttritionRiskLevel.INSUFFICIENT_DATA.value,
            "confidence": 0.0,
            "main_factors": ["New hire onboarding period (< 14 days tenure)"],
            "protective_factors": ["Initial structured onboarding phase active"],
            "recommended_interventions": [
                "Schedule 30-day onboarding check-in with manager",
                "Ensure mentor assignment and team integration"
            ],
            "model_version": MODEL_VERSION,
            "is_data_sufficient": False,
            "explanation": "Insufficient tenure and historical workforce engagement data for reliable attrition risk prediction."
        }

    main_factors: List[str] = []
    protective_factors: List[str] = []
    recommended_interventions: List[str] = []

    base_risk = 20.0 # Standard baseline risk

    # A. Tenure & Career Stagnation Risk
    if tenure_months > 24.0:
        base_risk += 15.0
        main_factors.append(f"Extended tenure ({tenure_months:.1f} months) in current designation without recent role re-evaluation")
        recommended_interventions.append("Schedule career progression and seniority promotion review")
    elif tenure_months >= 6.0:
        protective_factors.append(f"Stable medium-term organizational tenure ({tenure_months:.1f} months)")
    else:
        protective_factors.append("Recent hire within early engagement window")

    # B. Training & Upskilling Participation
    completed_trainings = [t for t in trainings if t.status == AssignmentStatus.COMPLETED]
    if len(trainings) == 0:
        base_risk += 15.0
        main_factors.append("No active or completed professional development programs in current cycle")
        recommended_interventions.append("Recommend skill-aligned training programs to foster career growth")
    elif len(completed_trainings) >= 1:
        base_risk -= 12.0
        protective_factors.append(f"Active learning engagement with {len(completed_trainings)} completed training program(s)")

    # C. Attendance & Punctuality Trends
    verified_att = [a for a in attendances if a.verification_status == VerificationStatus.VERIFIED]
    att_rate = (len(verified_att) / max(1, total_attendance)) if total_attendance > 0 else 0.85

    if att_rate < 0.75:
        base_risk += 15.0
        main_factors.append("Fluctuating attendance patterns and lower on-site verification consistency")
        recommended_interventions.append("Hold supportive 1-on-1 check-in to identify workload or flexibility hurdles")
    else:
        base_risk -= 8.0
        protective_factors.append(f"Consistent and verified on-site attendance ({att_rate*100:.1f}%)")

    # D. Leave Patterns
    approved_leaves = [l for l in leaves if l.status == LeaveStatus.APPROVED]
    total_leave_days = sum(l.duration_days for l in approved_leaves)
    if total_leave_days > 8:
        base_risk += 10.0
        main_factors.append(f"Elevated leave frequency ({total_leave_days} days taken)")
    elif total_leave_days <= 3:
        protective_factors.append("Low absenteeism and steady project continuity")

    # E. Department Compensation Context (Purely job-related)
    if employee.department_id:
        avg_dept_sal = db.query(func.avg(Employee.monthly_salary)).filter(
            Employee.department_id == employee.department_id,
            Employee.id != employee.id
        ).scalar() or employee.monthly_salary

        if employee.monthly_salary < (avg_dept_sal * 0.85):
            base_risk += 10.0
            main_factors.append("Compensation is below department peer average for comparable scope")
            recommended_interventions.append("Evaluate market compensation parity and performance bonus eligibility")
        else:
            protective_factors.append("Competitive compensation alignment within department band")

    # Clamp Risk Score between 5.0 and 95.0
    risk_score = round(max(5.0, min(95.0, base_risk)), 1)

    # Risk Level Determination
    if risk_score >= 60.0:
        risk_level = AttritionRiskLevel.HIGH.value
    elif risk_score >= 35.0:
        risk_level = AttritionRiskLevel.MEDIUM.value
    else:
        risk_level = AttritionRiskLevel.LOW.value

    # Confidence calculation
    confidence = round(min(94.0, max(68.0, 68.0 + min(20.0, total_attendance * 1.5) + min(6.0, tenure_months * 0.4))), 1)

    if not main_factors:
        main_factors.append("No adverse workforce signals detected in current evaluation cycle")

    if not recommended_interventions:
        recommended_interventions.append("Continue regular monthly 1-on-1 check-ins and performance recognition")

    explanation = (
        f"Employee has a predicted attrition risk score of {risk_score}/100 ({risk_level} Risk) "
        f"derived from tenure indicators, training participation, and historical attendance patterns. "
        f"This prediction is an advisory decision-support tool for HR leadership."
    )

    return {
        "employee_id": employee.id,
        "period": "Next 6 Months",
        "risk_score": risk_score,
        "risk_level": risk_level,
        "confidence": confidence,
        "main_factors": main_factors,
        "protective_factors": protective_factors,
        "recommended_interventions": recommended_interventions,
        "model_version": MODEL_VERSION,
        "is_data_sufficient": True,
        "explanation": explanation
    }
