from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_employee, require_roles
from app.models.user import User, UserRole
from app.models.employee import Employee
from app.models.attendance import Attendance, VerificationStatus
from app.schemas.attendance import PunchInRequest, PunchOutRequest, AttendanceOut, AttendanceSummary
from app.services.attendance_service import process_punch_in, process_punch_out

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/punch-in", response_model=AttendanceOut)
def punch_in(
    request: Request,
    punch_data: PunchInRequest,
    current_employee: Optional[Employee] = Depends(get_current_employee),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Processes browser GPS Geofenced Punch-In"""
    if not current_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No employee record associated with your user account."
        )

    attendance = process_punch_in(
        db=db,
        employee=current_employee,
        latitude=punch_data.latitude,
        longitude=punch_data.longitude,
        notes=punch_data.notes,
        ip_address=request.client.host if request.client else None
    )

    out = AttendanceOut.model_validate(attendance)
    out.employee_name = f"{current_employee.first_name} {current_employee.last_name}"
    out.employee_code = current_employee.employee_code
    out.department_name = current_employee.department.name if current_employee.department else None
    return out

@router.post("/punch-out", response_model=AttendanceOut)
def punch_out(
    request: Request,
    punch_data: PunchOutRequest,
    current_employee: Optional[Employee] = Depends(get_current_employee),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Processes Punch-Out and calculates daily work hours"""
    if not current_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No employee record associated with your user account."
        )

    attendance = process_punch_out(
        db=db,
        employee=current_employee,
        latitude=punch_data.latitude,
        longitude=punch_data.longitude,
        notes=punch_data.notes,
        ip_address=request.client.host if request.client else None
    )

    out = AttendanceOut.model_validate(attendance)
    out.employee_name = f"{current_employee.first_name} {current_employee.last_name}"
    out.employee_code = current_employee.employee_code
    out.department_name = current_employee.department.name if current_employee.department else None
    return out

@router.get("/my", response_model=List[AttendanceOut])
def get_my_attendance(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_employee: Optional[Employee] = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """Returns the attendance history for the currently logged in employee"""
    if not current_employee:
        return []

    query = db.query(Attendance).filter(Attendance.employee_id == current_employee.id)
    if year:
        query = query.filter(Attendance.date >= date(year, 1, 1), Attendance.date <= date(year, 12, 31))
    if month and year:
        query = query.filter(Attendance.date >= date(year, month, 1))

    attendances = query.order_by(Attendance.date.desc()).all()
    results = []
    for att in attendances:
        out = AttendanceOut.model_validate(att)
        out.employee_name = f"{current_employee.first_name} {current_employee.last_name}"
        out.employee_code = current_employee.employee_code
        out.department_name = current_employee.department.name if current_employee.department else None
        results.append(out)
    return results

@router.get("/team", response_model=List[AttendanceOut])
def get_team_attendance(
    target_date: Optional[date] = None,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER, UserRole.TEAM_LEADER)),
    db: Session = Depends(get_db)
):
    """Returns attendance for team members or department members"""
    query = db.query(Attendance)
    if target_date:
        query = query.filter(Attendance.date == target_date)

    if current_user.role == UserRole.TEAM_LEADER:
        tl_emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if tl_emp:
            team_emp_ids = [e.id for e in db.query(Employee).filter(Employee.team_id == tl_emp.team_id).all()]
            query = query.filter(Attendance.employee_id.in_(team_emp_ids))
    elif current_user.role == UserRole.DEPARTMENT_MANAGER:
        dept_emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if dept_emp:
            dept_emp_ids = [e.id for e in db.query(Employee).filter(Employee.department_id == dept_emp.department_id).all()]
            query = query.filter(Attendance.employee_id.in_(dept_emp_ids))

    attendances = query.order_by(Attendance.date.desc(), Attendance.id.desc()).limit(100).all()
    results = []
    for att in attendances:
        emp = att.employee
        out = AttendanceOut.model_validate(att)
        out.employee_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
        out.employee_code = emp.employee_code if emp else ""
        out.department_name = emp.department.name if emp and emp.department else None
        results.append(out)
    return results

@router.get("/all", response_model=List[AttendanceOut])
def get_all_attendance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    department_id: Optional[int] = None,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Returns all attendance records across the organization with filters"""
    query = db.query(Attendance)
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    if department_id:
        dept_emp_ids = [e.id for e in db.query(Employee).filter(Employee.department_id == department_id).all()]
        query = query.filter(Attendance.employee_id.in_(dept_emp_ids))

    attendances = query.order_by(Attendance.date.desc(), Attendance.id.desc()).limit(200).all()
    results = []
    for att in attendances:
        emp = att.employee
        out = AttendanceOut.model_validate(att)
        out.employee_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
        out.employee_code = emp.employee_code if emp else ""
        out.department_name = emp.department.name if emp and emp.department else None
        results.append(out)
    return results
