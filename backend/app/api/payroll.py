from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_employee, require_roles
from app.models.user import User, UserRole
from app.models.employee import Employee
from app.models.payroll import Payroll, PayrollItem
from app.schemas.payroll import PayrollGenerateRequest, PayrollOut, PayrollItemOut
from app.services.payroll_service import generate_monthly_payroll

router = APIRouter(prefix="/payroll", tags=["Payroll"])

@router.get("", response_model=List[PayrollOut])
def list_payrolls(
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Lists all processed company payrolls"""
    payrolls = db.query(Payroll).order_by(Payroll.year.desc(), Payroll.month.desc()).all()
    results = []
    for p in payrolls:
        items_out = []
        total_disbursed = 0.0
        for item in p.items:
            emp = item.employee
            i_out = PayrollItemOut.model_validate(item)
            i_out.employee_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
            i_out.employee_code = emp.employee_code if emp else ""
            i_out.department_name = emp.department.name if emp and emp.department else None
            i_out.designation = emp.designation if emp else None
            items_out.append(i_out)
            total_disbursed += item.net_salary

        p_out = PayrollOut.model_validate(p)
        p_out.processor_name = p.processor.email.split("@")[0].capitalize() if p.processor else "System Auto"
        p_out.total_employees = len(items_out)
        p_out.total_net_disbursed = round(total_disbursed, 2)
        p_out.items = items_out
        results.append(p_out)
    return results

@router.post("/generate", response_model=PayrollOut, status_code=status.HTTP_201_CREATED)
def trigger_generate_payroll(
    request: Request,
    req_in: PayrollGenerateRequest,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Manually triggers full attendance-based payroll calculation and PDF generation for a month"""
    payroll = generate_monthly_payroll(
        db=db,
        month=req_in.month,
        year=req_in.year,
        total_working_days=req_in.total_working_days,
        processed_by=current_user,
        notes=req_in.notes,
        ip_address=request.client.host if request.client else None
    )

    items_out = []
    total_disbursed = 0.0
    for item in payroll.items:
        emp = item.employee
        i_out = PayrollItemOut.model_validate(item)
        i_out.employee_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
        i_out.employee_code = emp.employee_code if emp else ""
        i_out.department_name = emp.department.name if emp and emp.department else None
        i_out.designation = emp.designation if emp else None
        items_out.append(i_out)
        total_disbursed += item.net_salary

    p_out = PayrollOut.model_validate(payroll)
    p_out.processor_name = current_user.email.split("@")[0].capitalize()
    p_out.total_employees = len(items_out)
    p_out.total_net_disbursed = round(total_disbursed, 2)
    p_out.items = items_out
    return p_out

@router.get("/my", response_model=List[PayrollItemOut])
def get_my_payroll_records(
    current_employee: Optional[Employee] = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """Returns payroll item history and net salary breakdowns for currently logged in employee"""
    if not current_employee:
        return []

    items = db.query(PayrollItem).filter(
        PayrollItem.employee_id == current_employee.id
    ).order_by(PayrollItem.id.desc()).all()

    results = []
    for item in items:
        i_out = PayrollItemOut.model_validate(item)
        i_out.employee_name = f"{current_employee.first_name} {current_employee.last_name}"
        i_out.employee_code = current_employee.employee_code
        i_out.department_name = current_employee.department.name if current_employee.department else None
        i_out.designation = current_employee.designation
        results.append(i_out)
    return results

@router.get("/{id}", response_model=PayrollOut)
def get_payroll_details(
    id: int,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Gets single payroll batch with employee item list"""
    payroll = db.query(Payroll).filter(Payroll.id == id).first()
    if not payroll:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payroll batch not found")

    items_out = []
    total_disbursed = 0.0
    for item in payroll.items:
        emp = item.employee
        i_out = PayrollItemOut.model_validate(item)
        i_out.employee_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
        i_out.employee_code = emp.employee_code if emp else ""
        i_out.department_name = emp.department.name if emp and emp.department else None
        i_out.designation = emp.designation if emp else None
        items_out.append(i_out)
        total_disbursed += item.net_salary

    p_out = PayrollOut.model_validate(payroll)
    p_out.processor_name = payroll.processor.email.split("@")[0].capitalize() if payroll.processor else "System"
    p_out.total_employees = len(items_out)
    p_out.total_net_disbursed = round(total_disbursed, 2)
    p_out.items = items_out
    return p_out
