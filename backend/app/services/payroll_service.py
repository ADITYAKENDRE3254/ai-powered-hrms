import os
import calendar
from datetime import date, datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.payroll import Payroll, PayrollItem, PayrollStatus
from app.models.employee import Employee, EmploymentStatus
from app.models.attendance import Attendance, VerificationStatus
from app.models.leave import LeaveRequest, LeaveStatus, LeaveType
from app.models.user import User
from app.models.notification import Notification, NotificationType
from app.services.pdf_service import generate_payslip_pdf
from app.services.audit_service import log_audit

def calculate_employee_payroll(
    db: Session,
    employee: Employee,
    month: int,
    year: int,
    total_working_days: int = 22
) -> dict:
    """Calculates payroll figures for a single employee for a given month and year"""
    # Start and end date of month
    _, num_days = calendar.monthrange(year, month)
    month_start = date(year, month, 1)
    month_end = date(year, month, num_days)

    # 1. Count verified present days in month
    present_days = db.query(Attendance).filter(
        Attendance.employee_id == employee.id,
        Attendance.date >= month_start,
        Attendance.date <= month_end,
        Attendance.verification_status == VerificationStatus.VERIFIED
    ).count()

    # 2. Count approved paid leaves in month
    approved_leaves = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee.id,
        LeaveRequest.status == LeaveStatus.APPROVED,
        LeaveRequest.leave_type.in_([LeaveType.CASUAL, LeaveType.SICK, LeaveType.EARNED]),
        LeaveRequest.start_date <= month_end,
        LeaveRequest.end_date >= month_start
    ).all()

    approved_leave_days = sum(l.duration_days for l in approved_leaves)

    # If employee was hired recently or demo attendance is lower, ensure payable days calculation is accurate
    payable_days = min(total_working_days, present_days + approved_leave_days)
    lwp_days = max(0, total_working_days - payable_days)

    # 3. Resolve active salary structure using 3-tier Priority Engine (Individual -> Position -> Department -> Base)
    from app.services.compensation_service import resolve_employee_effective_salary
    eff_salary = resolve_employee_effective_salary(db, employee, month_end)

    if eff_salary.get("source") == "EMPLOYEE_DEFAULT":
        basic_salary = float(employee.monthly_salary or 0.0)
        allowances = float(employee.allowances or 0.0)
        gross_salary = round(basic_salary + allowances, 2)
        per_day_rate = round(basic_salary / float(total_working_days), 2)
        pf_deduction = round(basic_salary * ((employee.pf_percentage or 12.0) / 100.0), 2)
        tax_deduction = round(gross_salary * ((employee.tax_percentage or 10.0) / 100.0), 2)
        other_deductions = 0.0
    else:
        gross_salary = eff_salary["gross_salary"]
        basic_salary = eff_salary["basic_salary"]
        allowances = round(
            eff_salary.get("hra", 0.0) +
            eff_salary.get("transport_allowance", 0.0) +
            eff_salary.get("medical_allowance", 0.0) +
            eff_salary.get("other_allowances", 0.0) +
            eff_salary.get("bonus", 0.0), 2
        )
        per_day_rate = round(gross_salary / float(total_working_days), 2)
        pf_deduction = round(eff_salary.get("pf_deduction", 0.0), 2)
        tax_deduction = round(eff_salary.get("tax_deduction", 0.0), 2)
        other_deductions = round(eff_salary.get("professional_tax", 0.0) + eff_salary.get("other_deductions", 0.0), 2)

    lwp_deduction = round(per_day_rate * lwp_days, 2)
    total_earnings = round(gross_salary, 2)
    total_deductions = round(lwp_deduction + pf_deduction + tax_deduction + other_deductions, 2)
    net_salary = max(0.0, round(total_earnings - total_deductions, 2))

    return {
        "monthly_salary": gross_salary,
        "working_days": total_working_days,
        "present_days": present_days,
        "approved_leave_days": approved_leave_days,
        "lwp_days": lwp_days,
        "per_day_rate": per_day_rate,
        "basic_salary": basic_salary,
        "allowances": allowances,
        "lwp_deduction": lwp_deduction,
        "pf_deduction": pf_deduction,
        "tax_deduction": tax_deduction,
        "other_deductions": other_deductions,
        "total_earnings": total_earnings,
        "total_deductions": total_deductions,
        "net_salary": net_salary
    }

def generate_monthly_payroll(
    db: Session,
    month: int,
    year: int,
    total_working_days: int = 22,
    processed_by: Optional[User] = None,
    notes: Optional[str] = None,
    ip_address: Optional[str] = None
) -> Payroll:
    """Generates complete monthly payroll for all active employees and generates PDF payslips"""
    # Check if payroll already exists for month/year
    existing = db.query(Payroll).filter(
        Payroll.month == month,
        Payroll.year == year
    ).first()

    if existing:
        # Delete old items if re-generating
        db.delete(existing)
        db.commit()

    now = datetime.now(timezone.utc)
    payroll = Payroll(
        month=month,
        year=year,
        total_working_days=total_working_days,
        status=PayrollStatus.PROCESSED,
        processed_by=processed_by.id if processed_by else None,
        processed_at=now,
        notes=notes
    )
    db.add(payroll)
    db.commit()
    db.refresh(payroll)

    active_employees = db.query(Employee).filter(
        Employee.employment_status.in_([EmploymentStatus.ACTIVE, EmploymentStatus.PROBATION])
    ).all()

    for emp in active_employees:
        calc = calculate_employee_payroll(
            db=db,
            employee=emp,
            month=month,
            year=year,
            total_working_days=total_working_days
        )

        item = PayrollItem(
            payroll_id=payroll.id,
            employee_id=emp.id,
            monthly_salary=calc["monthly_salary"],
            working_days=calc["working_days"],
            present_days=calc["present_days"],
            approved_leave_days=calc["approved_leave_days"],
            lwp_days=calc["lwp_days"],
            per_day_rate=calc["per_day_rate"],
            basic_salary=calc["basic_salary"],
            allowances=calc["allowances"],
            lwp_deduction=calc["lwp_deduction"],
            pf_deduction=calc["pf_deduction"],
            tax_deduction=calc["tax_deduction"],
            other_deductions=calc["other_deductions"],
            total_earnings=calc["total_earnings"],
            total_deductions=calc["total_deductions"],
            net_salary=calc["net_salary"]
        )
        db.add(item)
        db.flush()

        # Generate PDF payslip
        try:
            pdf_path = generate_payslip_pdf(item, payroll, emp)
            item.payslip_url = f"/api/payslips/{item.id}/download"
        except Exception as e:
            print(f"Error generating PDF payslip for {emp.employee_code}: {e}")

        # Send notification to employee
        db.add(Notification(
            user_id=emp.user_id,
            title="Monthly Payslip Generated",
            message=f"Your payslip for {month:02d}/{year} is ready! Net salary: ${calc['net_salary']:,.2f}. You can view and download your payslip now.",
            type=NotificationType.PAYROLL
        ))

    db.commit()
    db.refresh(payroll)

    log_audit(
        db=db,
        action="PAYROLL_GENERATED",
        module="PAYROLL",
        user=processed_by,
        record_id=str(payroll.id),
        details={"month": month, "year": year, "employees_count": len(active_employees)},
        ip_address=ip_address
    )
    return payroll
