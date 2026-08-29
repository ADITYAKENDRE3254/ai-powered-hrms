import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.payroll import PayrollItem
from app.schemas.payroll import PayrollItemOut
from app.services.pdf_service import generate_payslip_pdf

router = APIRouter(prefix="/payslips", tags=["Payslips"])

@router.get("/{id}", response_model=PayrollItemOut)
def get_payslip(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves metadata of a specific payslip record with RBAC protection"""
    item = db.query(PayrollItem).filter(PayrollItem.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payslip not found")

    # Regular employee can only view their own payslip
    if current_user.role == UserRole.EMPLOYEE:
        if not item.employee or item.employee.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You can only view your own payslips."
            )

    emp = item.employee
    out = PayrollItemOut.model_validate(item)
    out.employee_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
    out.employee_code = emp.employee_code if emp else ""
    out.department_name = emp.department.name if emp and emp.department else None
    out.designation = emp.designation if emp else None
    return out

@router.get("/{id}/download")
def download_payslip_pdf(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Downloads the official PDF payslip with ReportLab generation and RBAC authorization"""
    item = db.query(PayrollItem).filter(PayrollItem.id == id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payslip not found")

    # Strict RBAC: Employee requesting another employee's payslip -> 403 Forbidden
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]:
        if not item.employee or item.employee.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You cannot access or download another employee's payslip."
            )

    # Check / Generate PDF file
    emp = item.employee
    payroll = item.payroll
    filename = f"payslip_{emp.employee_code}_{payroll.year}_{payroll.month:02d}.pdf"
    output_dir = os.path.join("./uploads", "payslips")
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, filename)

    if not os.path.exists(filepath):
        filepath = generate_payslip_pdf(item, payroll, emp)

    return FileResponse(
        path=filepath,
        filename=filename,
        media_type="application/pdf"
    )
