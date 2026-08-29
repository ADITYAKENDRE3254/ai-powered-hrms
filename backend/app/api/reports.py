import io
import csv
from datetime import date, datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_employee, require_roles
from app.models.user import User, UserRole
from app.models.employee import Employee, EmploymentStatus
from app.models.department import Department, Team
from app.models.attendance import Attendance, VerificationStatus
from app.models.leave import LeaveRequest, LeaveBalance, LeaveStatus
from app.models.recruitment import Job, Candidate, JobStatus, CandidateStatus
from app.models.payroll import Payroll, PayrollItem

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    current_employee: Optional[Employee] = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """Returns dynamic KPI metrics and analytics based on caller's role"""
    today = date.today()

    # SUPER ADMIN / HR KPI METRICS
    if current_user.role in [UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]:
        total_employees = db.query(Employee).filter(Employee.employment_status == EmploymentStatus.ACTIVE).count()
        total_departments = db.query(Department).count()
        total_teams = db.query(Team).count()
        open_jobs = db.query(Job).filter(Job.status == JobStatus.OPEN).count()
        total_candidates = db.query(Candidate).count()
        today_present = db.query(Attendance).filter(Attendance.date == today, Attendance.verification_status == VerificationStatus.VERIFIED).count()
        pending_leaves = db.query(LeaveRequest).filter(LeaveRequest.status.in_([LeaveStatus.PENDING_TL, LeaveStatus.PENDING_MANAGER])).count()
        payrolls_processed = db.query(Payroll).count()

        # Department distribution
        departments = db.query(Department).all()
        dept_dist = []
        for d in departments:
            cnt = db.query(Employee).filter(Employee.department_id == d.id).count()
            dept_dist.append({"name": d.name, "count": cnt})

        # Recruitment pipeline
        pipeline = {
            "applied": db.query(Candidate).filter(Candidate.status == CandidateStatus.APPLIED).count(),
            "ai_screened": db.query(Candidate).filter(Candidate.status == CandidateStatus.AI_SCREENED).count(),
            "shortlisted": db.query(Candidate).filter(Candidate.status == CandidateStatus.SHORTLISTED).count(),
            "interview": db.query(Candidate).filter(Candidate.status == CandidateStatus.INTERVIEW).count(),
            "selected": db.query(Candidate).filter(Candidate.status == CandidateStatus.SELECTED).count(),
            "rejected": db.query(Candidate).filter(Candidate.status == CandidateStatus.REJECTED).count(),
        }

        return {
            "role": current_user.role.value,
            "total_employees": total_employees,
            "total_departments": total_departments,
            "total_teams": total_teams,
            "open_jobs": open_jobs,
            "total_candidates": total_candidates,
            "today_present": today_present,
            "pending_leaves": pending_leaves,
            "payrolls_processed": payrolls_processed,
            "department_distribution": dept_dist,
            "recruitment_pipeline": pipeline
        }

    # DEPARTMENT MANAGER
    elif current_user.role == UserRole.DEPARTMENT_MANAGER:
        dept_id = current_employee.department_id if current_employee else None
        dept_emp_ids = [e.id for e in db.query(Employee).filter(Employee.department_id == dept_id).all()] if dept_id else []
        
        dept_emp_count = len(dept_emp_ids)
        dept_present = db.query(Attendance).filter(Attendance.date == today, Attendance.employee_id.in_(dept_emp_ids), Attendance.verification_status == VerificationStatus.VERIFIED).count() if dept_emp_ids else 0
        dept_pending_leaves = db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.PENDING_MANAGER, LeaveRequest.employee_id.in_(dept_emp_ids)).count() if dept_emp_ids else 0

        return {
            "role": current_user.role.value,
            "department_name": current_employee.department.name if (current_employee and current_employee.department) else "My Department",
            "department_employees": dept_emp_count,
            "department_present_today": dept_present,
            "department_pending_leaves": dept_pending_leaves,
        }

    # TEAM LEADER
    elif current_user.role == UserRole.TEAM_LEADER:
        team_id = current_employee.team_id if current_employee else None
        team_emp_ids = [e.id for e in db.query(Employee).filter(Employee.team_id == team_id).all()] if team_id else []
        
        team_members = len(team_emp_ids)
        team_present = db.query(Attendance).filter(Attendance.date == today, Attendance.employee_id.in_(team_emp_ids), Attendance.verification_status == VerificationStatus.VERIFIED).count() if team_emp_ids else 0
        team_pending_leaves = db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.PENDING_TL, LeaveRequest.employee_id.in_(team_emp_ids)).count() if team_emp_ids else 0

        return {
            "role": current_user.role.value,
            "team_name": current_employee.team.name if (current_employee and current_employee.team) else "My Team",
            "team_members": team_members,
            "team_present_today": team_present,
            "team_pending_leaves": team_pending_leaves
        }

    # RECRUITER
    elif current_user.role == UserRole.RECRUITER:
        open_jobs = db.query(Job).filter(Job.status == JobStatus.OPEN).count()
        total_candidates = db.query(Candidate).count()
        ai_screened = db.query(Candidate).filter(Candidate.status == CandidateStatus.AI_SCREENED).count()
        shortlisted = db.query(Candidate).filter(Candidate.status == CandidateStatus.SHORTLISTED).count()

        return {
            "role": current_user.role.value,
            "open_jobs": open_jobs,
            "total_candidates": total_candidates,
            "ai_screened": ai_screened,
            "shortlisted": shortlisted
        }

    # EMPLOYEE
    elif current_user.role == UserRole.EMPLOYEE:
        if not current_employee:
            return {"role": current_user.role.value}

        present_days = db.query(Attendance).filter(Attendance.employee_id == current_employee.id, Attendance.verification_status == VerificationStatus.VERIFIED).count()
        balance = db.query(LeaveBalance).filter(LeaveBalance.employee_id == current_employee.id).first()
        pending_leaves = db.query(LeaveRequest).filter(LeaveRequest.employee_id == current_employee.id, LeaveRequest.status.in_([LeaveStatus.PENDING_TL, LeaveStatus.PENDING_MANAGER])).count()
        latest_payroll = db.query(PayrollItem).filter(PayrollItem.employee_id == current_employee.id).order_by(PayrollItem.id.desc()).first()
        today_att = db.query(Attendance).filter(Attendance.employee_id == current_employee.id, Attendance.date == today).first()

        return {
            "role": current_user.role.value,
            "employee_name": f"{current_employee.first_name} {current_employee.last_name}",
            "employee_code": current_employee.employee_code,
            "present_days": present_days,
            "casual_leave_balance": balance.casual_leave if balance else 12.0,
            "sick_leave_balance": balance.sick_leave if balance else 10.0,
            "earned_leave_balance": balance.earned_leave if balance else 15.0,
            "pending_leaves": pending_leaves,
            "latest_net_salary": latest_payroll.net_salary if latest_payroll else None,
            "today_punched_in": bool(today_att and today_att.punch_in and today_att.verification_status == VerificationStatus.VERIFIED),
            "today_punched_out": bool(today_att and today_att.punch_out)
        }

    # CANDIDATE
    else:
        open_jobs = db.query(Job).filter(Job.status == JobStatus.OPEN).count()
        my_apps = db.query(Candidate).filter(Candidate.user_id == current_user.id).all()
        
        return {
            "role": current_user.role.value,
            "available_jobs": open_jobs,
            "my_applications": len(my_apps),
            "shortlisted_count": sum(1 for a in my_apps if a.status in [CandidateStatus.SHORTLISTED, CandidateStatus.INTERVIEW, CandidateStatus.SELECTED])
        }

# ----------------- CSV EXPORT ENDPOINTS -----------------

@router.get("/attendance/export")
def export_attendance_csv(
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Exports attendance report as CSV"""
    attendances = db.query(Attendance).order_by(Attendance.date.desc()).limit(1000).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Employee Code", "Employee Name", "Date", "Punch In", "Punch Out", "Distance (m)", "Status", "Work Hours"])

    for a in attendances:
        emp = a.employee
        name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
        code = emp.employee_code if emp else ""
        writer.writerow([
            a.id, code, name, a.date,
            a.punch_in.strftime("%Y-%m-%d %H:%M:%S") if a.punch_in else "",
            a.punch_out.strftime("%Y-%m-%d %H:%M:%S") if a.punch_out else "",
            f"{a.distance_in_meters:.1f}" if a.distance_in_meters is not None else "",
            a.verification_status.value,
            a.work_duration_hours
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=attendance_report.csv"}
    )

@router.get("/payroll/export")
def export_payroll_csv(
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Exports payroll items report as CSV"""
    items = db.query(PayrollItem).order_by(PayrollItem.id.desc()).limit(1000).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Employee Code", "Name", "Month/Year", "Working Days", "Present Days", "LWP Days", "Basic Salary", "LWP Deduction", "PF", "Tax", "Net Salary"])

    for item in items:
        emp = item.employee
        p = item.payroll
        writer.writerow([
            item.id,
            emp.employee_code if emp else "",
            f"{emp.first_name} {emp.last_name}" if emp else "",
            f"{p.month:02d}/{p.year}" if p else "",
            item.working_days,
            item.present_days,
            item.lwp_days,
            item.basic_salary,
            item.lwp_deduction,
            item.pf_deduction,
            item.tax_deduction,
            item.net_salary
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=payroll_report.csv"}
    )
