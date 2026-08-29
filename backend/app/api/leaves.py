from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_employee, require_roles
from app.models.user import User, UserRole
from app.models.employee import Employee
from app.models.leave import LeaveRequest, LeaveBalance, LeaveStatus
from app.schemas.leave import LeaveCreate, LeaveActionRequest, LeaveOut, LeaveBalanceOut
from app.services.leave_service import create_leave_request, approve_leave_request, reject_leave_request

router = APIRouter(prefix="/leaves", tags=["Leaves"])

@router.post("", response_model=LeaveOut, status_code=status.HTTP_201_CREATED)
def apply_leave(
    request: Request,
    leave_in: LeaveCreate,
    current_employee: Optional[Employee] = Depends(get_current_employee),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submits a new leave request and executes the 1-day auto, 2-day TL, 3+ day Manager workflow"""
    if not current_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No employee profile found for logged in user."
        )

    leave_req = create_leave_request(
        db=db,
        employee=current_employee,
        leave_type=leave_in.leave_type,
        start_date=leave_in.start_date,
        end_date=leave_in.end_date,
        reason=leave_in.reason,
        ip_address=request.client.host if request.client else None
    )

    out = LeaveOut.model_validate(leave_req)
    out.employee_name = f"{current_employee.first_name} {current_employee.last_name}"
    out.employee_code = current_employee.employee_code
    out.department_name = current_employee.department.name if current_employee.department else None
    return out

@router.get("/my", response_model=List[LeaveOut])
def get_my_leaves(
    current_employee: Optional[Employee] = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """Returns leave history for the logged in employee"""
    if not current_employee:
        return []

    leaves = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == current_employee.id
    ).order_by(LeaveRequest.id.desc()).all()

    results = []
    for l in leaves:
        out = LeaveOut.model_validate(l)
        out.employee_name = f"{current_employee.first_name} {current_employee.last_name}"
        out.employee_code = current_employee.employee_code
        out.department_name = current_employee.department.name if current_employee.department else None
        if l.approver:
            out.approver_name = l.approver.email.split("@")[0].capitalize()
        results.append(out)
    return results

@router.get("/my/balance", response_model=LeaveBalanceOut)
def get_my_leave_balance(
    current_employee: Optional[Employee] = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """Returns available leave balances for the logged in employee"""
    if not current_employee:
        return LeaveBalanceOut(casual_leave=12.0, sick_leave=10.0, earned_leave=15.0, year=2026)

    balance = db.query(LeaveBalance).filter(LeaveBalance.employee_id == current_employee.id).first()
    if not balance:
        balance = LeaveBalance(
            employee_id=current_employee.id,
            casual_leave=12.0,
            sick_leave=10.0,
            earned_leave=15.0,
            year=2026
        )
        db.add(balance)
        db.commit()
        db.refresh(balance)

    return LeaveBalanceOut.model_validate(balance)

@router.get("/pending", response_model=List[LeaveOut])
def get_pending_leaves(
    current_user: User = Depends(require_roles(
        UserRole.SUPER_ADMIN,
        UserRole.HR_MANAGER,
        UserRole.DEPARTMENT_MANAGER,
        UserRole.TEAM_LEADER
    )),
    db: Session = Depends(get_db)
):
    """Returns pending leave requests filtered by the caller's role and hierarchy"""
    query = db.query(LeaveRequest).filter(
        LeaveRequest.status.in_([LeaveStatus.PENDING_TL, LeaveStatus.PENDING_MANAGER])
    )

    if current_user.role == UserRole.TEAM_LEADER:
        tl_emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if tl_emp:
            query = query.filter(
                LeaveRequest.status == LeaveStatus.PENDING_TL,
                LeaveRequest.employee_id.in_([e.id for e in db.query(Employee).filter(Employee.team_leader_id == tl_emp.id).all()])
            )
    elif current_user.role == UserRole.DEPARTMENT_MANAGER:
        dept_emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if dept_emp:
            query = query.filter(
                LeaveRequest.status == LeaveStatus.PENDING_MANAGER,
                LeaveRequest.employee_id.in_([e.id for e in db.query(Employee).filter(Employee.department_id == dept_emp.department_id).all()])
            )

    pending_leaves = query.order_by(LeaveRequest.id.desc()).all()
    results = []
    for l in pending_leaves:
        emp = l.employee
        out = LeaveOut.model_validate(l)
        out.employee_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
        out.employee_code = emp.employee_code if emp else ""
        out.department_name = emp.department.name if emp and emp.department else None
        results.append(out)
    return results

@router.get("/all", response_model=List[LeaveOut])
def get_all_leaves(
    status: Optional[LeaveStatus] = None,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Returns all leave requests across company for HR/Admin"""
    query = db.query(LeaveRequest)
    if status:
        query = query.filter(LeaveRequest.status == status)

    leaves = query.order_by(LeaveRequest.id.desc()).limit(200).all()
    results = []
    for l in leaves:
        emp = l.employee
        out = LeaveOut.model_validate(l)
        out.employee_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
        out.employee_code = emp.employee_code if emp else ""
        out.department_name = emp.department.name if emp and emp.department else None
        if l.approver:
            out.approver_name = l.approver.email.split("@")[0].capitalize()
        results.append(out)
    return results

@router.put("/{id}/approve", response_model=LeaveOut)
def approve_leave(
    request: Request,
    id: int,
    current_user: User = Depends(require_roles(
        UserRole.SUPER_ADMIN,
        UserRole.HR_MANAGER,
        UserRole.DEPARTMENT_MANAGER,
        UserRole.TEAM_LEADER
    )),
    db: Session = Depends(get_db)
):
    """Approves a pending leave request"""
    leave_req = approve_leave_request(
        db=db,
        leave_id=id,
        approver=current_user,
        ip_address=request.client.host if request.client else None
    )

    emp = leave_req.employee
    out = LeaveOut.model_validate(leave_req)
    out.employee_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
    out.employee_code = emp.employee_code if emp else ""
    out.department_name = emp.department.name if emp and emp.department else None
    out.approver_name = current_user.email.split("@")[0].capitalize()
    return out

@router.put("/{id}/reject", response_model=LeaveOut)
def reject_leave(
    request: Request,
    id: int,
    action_in: LeaveActionRequest,
    current_user: User = Depends(require_roles(
        UserRole.SUPER_ADMIN,
        UserRole.HR_MANAGER,
        UserRole.DEPARTMENT_MANAGER,
        UserRole.TEAM_LEADER
    )),
    db: Session = Depends(get_db)
):
    """Rejects a pending leave request with reason"""
    leave_req = reject_leave_request(
        db=db,
        leave_id=id,
        approver=current_user,
        rejection_reason=action_in.rejection_reason,
        ip_address=request.client.host if request.client else None
    )

    emp = leave_req.employee
    out = LeaveOut.model_validate(leave_req)
    out.employee_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
    out.employee_code = emp.employee_code if emp else ""
    out.department_name = emp.department.name if emp and emp.department else None
    out.approver_name = current_user.email.split("@")[0].capitalize()
    return out
