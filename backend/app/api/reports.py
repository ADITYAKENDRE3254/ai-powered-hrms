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
from app.models.audit import AuditLog

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
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER)),
    db: Session = Depends(get_db)
):
    """Exports attendance report as CSV"""
    attendances = db.query(Attendance).order_by(Attendance.date.desc()).limit(2000).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Employee Code", "Employee Name", "Department", "Date", "Punch In", "Punch Out", "GPS Distance (m)", "Status", "Work Hours"])

    for a in attendances:
        emp = a.employee
        name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
        code = emp.employee_code if emp else ""
        dept = emp.department.name if (emp and emp.department) else "N/A"
        writer.writerow([
            a.id, code, name, dept, a.date,
            a.punch_in.strftime("%Y-%m-%d %H:%M:%S") if a.punch_in else "",
            a.punch_out.strftime("%Y-%m-%d %H:%M:%S") if a.punch_out else "",
            f"{a.distance_in_meters:.1f}" if a.distance_in_meters is not None else "",
            a.verification_status.value if hasattr(a.verification_status, 'value') else str(a.verification_status),
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
    items = db.query(PayrollItem).order_by(PayrollItem.id.desc()).limit(2000).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Employee Code", "Employee Name", "Department", "Month/Year", "Working Days", "Present Days", "LWP Days", "Basic Salary", "Allowances", "LWP Deduction", "PF", "Tax", "Net Salary"])

    for item in items:
        emp = item.employee
        p = item.payroll
        dept = emp.department.name if (emp and emp.department) else "N/A"
        writer.writerow([
            item.id,
            emp.employee_code if emp else "",
            f"{emp.first_name} {emp.last_name}" if emp else "",
            dept,
            f"{p.month:02d}/{p.year}" if p else "",
            item.working_days,
            item.present_days,
            item.lwp_days,
            f"{item.basic_salary:.2f}",
            f"{item.allowances:.2f}",
            f"{item.lwp_deduction:.2f}",
            f"{item.pf_deduction:.2f}",
            f"{item.tax_deduction:.2f}",
            f"{item.net_salary:.2f}"
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=payroll_report.csv"}
    )

@router.get("/candidates/export")
def export_candidates_csv(
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.RECRUITER)),
    db: Session = Depends(get_db)
):
    """Exports talent pipeline and applicant screening data as CSV"""
    candidates = db.query(Candidate).order_by(Candidate.id.desc()).limit(2000).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Candidate ID", "First Name", "Last Name", "Email", "Phone", "Applied Position", "Experience (Years)", "Education", "Match Score (%)", "Status", "Extracted Skills", "Application Date"])

    for c in candidates:
        job_title = c.job.title if c.job else "General Pool"
        writer.writerow([
            c.id,
            c.first_name,
            c.last_name,
            c.email,
            c.phone or "",
            job_title,
            c.experience_years,
            c.education or "",
            f"{c.match_score:.1f}",
            c.status.value if hasattr(c.status, 'value') else str(c.status),
            c.extracted_skills or "",
            c.created_at.strftime("%Y-%m-%d %H:%M:%S") if c.created_at else ""
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=talent_pipeline_report.csv"}
    )

@router.get("/audit/export")
def export_audit_csv(
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Exports system security and compliance audit logs as CSV"""
    logs = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(5000).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp (UTC)", "User Email", "Action", "Module", "Record ID", "IP Address", "Details"])

    for log in logs:
        writer.writerow([
            log.id,
            log.timestamp.strftime("%Y-%m-%d %H:%M:%S") if log.timestamp else "",
            log.user_email or (log.user.email if log.user else "System"),
            log.action,
            log.module,
            log.record_id or "",
            log.ip_address or "",
            log.details or ""
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=audit_trail_report.csv"}
    )

@router.get("/executive-summary/export")
def export_executive_summary_csv(
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER)),
    db: Session = Depends(get_db)
):
    """Exports comprehensive executive HR & Operations snapshot as CSV"""
    today = date.today()
    total_active_emp = db.query(Employee).filter(Employee.employment_status == EmploymentStatus.ACTIVE).count()
    total_dept = db.query(Department).count()
    total_teams = db.query(Team).count()
    present_today = db.query(Attendance).filter(Attendance.date == today, Attendance.verification_status == VerificationStatus.VERIFIED).count()
    attendance_rate = (present_today / total_active_emp * 100) if total_active_emp > 0 else 0
    
    open_jobs = db.query(Job).filter(Job.status == JobStatus.OPEN).count()
    total_candidates = db.query(Candidate).count()
    shortlisted_candidates = db.query(Candidate).filter(Candidate.status.in_([CandidateStatus.SHORTLISTED, CandidateStatus.INTERVIEW, CandidateStatus.SELECTED])).count()
    
    pending_leaves = db.query(LeaveRequest).filter(LeaveRequest.status.in_([LeaveStatus.PENDING_TL, LeaveStatus.PENDING_MANAGER])).count()
    total_payrolls = db.query(Payroll).count()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["AI-HRMS Executive Operations Summary", f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"])
    writer.writerow([])
    writer.writerow(["Metric Category", "Indicator", "Value"])
    writer.writerow(["Workforce", "Total Active Employees", total_active_emp])
    writer.writerow(["Workforce", "Departments", total_dept])
    writer.writerow(["Workforce", "Functional Teams", total_teams])
    writer.writerow(["Attendance", "Present Today (Verified)", present_today])
    writer.writerow(["Attendance", "Today's Attendance Rate (%)", f"{attendance_rate:.1f}%"])
    writer.writerow(["Governance", "Pending Leave Requests", pending_leaves])
    writer.writerow(["Recruitment", "Active Job Vacancies", open_jobs])
    writer.writerow(["Recruitment", "Total Candidates in Pipeline", total_candidates])
    writer.writerow(["Recruitment", "Shortlisted & Advanced Candidates", shortlisted_candidates])
    writer.writerow(["Payroll", "Total Processed Payroll Cycles", total_payrolls])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=executive_summary_report.csv"}
    )

