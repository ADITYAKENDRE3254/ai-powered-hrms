from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.security import get_password_hash
from app.core.deps import get_current_user, require_roles, get_current_employee
from app.models.user import User, UserRole
from app.models.employee import Employee, EmploymentStatus
from app.models.department import Department, Team
from app.models.leave import LeaveBalance
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeOut, EmployeeListOut
from app.services.audit_service import log_audit

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.get("", response_model=EmployeeListOut)
def list_employees(
    department_id: Optional[int] = None,
    team_id: Optional[int] = None,
    status: Optional[EmploymentStatus] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_roles(
        UserRole.SUPER_ADMIN,
        UserRole.HR_MANAGER,
        UserRole.DEPARTMENT_MANAGER,
        UserRole.TEAM_LEADER,
        UserRole.RECRUITER
    )),
    db: Session = Depends(get_db)
):
    """Lists employees with search, department filtering, and pagination"""
    query = db.query(Employee)

    # Department Manager scoping: only see employees in their department if not HR/Admin
    if current_user.role == UserRole.DEPARTMENT_MANAGER:
        dept_mgr_emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if dept_mgr_emp and dept_mgr_emp.department_id:
            query = query.filter(Employee.department_id == dept_mgr_emp.department_id)

    # Team Leader scoping: only see members of their team if not HR/Admin
    elif current_user.role == UserRole.TEAM_LEADER:
        tl_emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if tl_emp and tl_emp.team_id:
            query = query.filter(Employee.team_id == tl_emp.team_id)

    if department_id:
        query = query.filter(Employee.department_id == department_id)
    if team_id:
        query = query.filter(Employee.team_id == team_id)
    if status:
        query = query.filter(Employee.employment_status == status)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Employee.first_name.ilike(search_fmt),
                Employee.last_name.ilike(search_fmt),
                Employee.email.ilike(search_fmt),
                Employee.employee_code.ilike(search_fmt),
                Employee.designation.ilike(search_fmt)
            )
        )

    total = query.count()
    employees = query.order_by(Employee.id.desc()).offset(skip).limit(limit).all()

    items = []
    for emp in employees:
        dept = db.query(Department).filter(Department.id == emp.department_id).first() if emp.department_id else None
        team = db.query(Team).filter(Team.id == emp.team_id).first() if emp.team_id else None
        mgr = db.query(Employee).filter(Employee.id == emp.manager_id).first() if emp.manager_id else None
        tl = db.query(Employee).filter(Employee.id == emp.team_leader_id).first() if emp.team_leader_id else None

        item = EmployeeOut.model_validate(emp)
        item.department_name = dept.name if dept else None
        item.team_name = team.name if team else None
        item.manager_name = f"{mgr.first_name} {mgr.last_name}" if mgr else None
        item.team_leader_name = f"{tl.first_name} {tl.last_name}" if tl else None
        item.user_role = emp.user.role.value if emp.user else "EMPLOYEE"
        items.append(item)

    return EmployeeListOut(total=total, items=items)

@router.get("/my/profile", response_model=EmployeeOut)
def get_my_employee_profile(
    current_employee: Optional[Employee] = Depends(get_current_employee),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows currently logged in employee to view their own profile"""
    if not current_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee profile not found for the logged in user."
        )
    
    dept = db.query(Department).filter(Department.id == current_employee.department_id).first() if current_employee.department_id else None
    team = db.query(Team).filter(Team.id == current_employee.team_id).first() if current_employee.team_id else None
    mgr = db.query(Employee).filter(Employee.id == current_employee.manager_id).first() if current_employee.manager_id else None
    tl = db.query(Employee).filter(Employee.id == current_employee.team_leader_id).first() if current_employee.team_leader_id else None

    item = EmployeeOut.model_validate(current_employee)
    item.department_name = dept.name if dept else None
    item.team_name = team.name if team else None
    item.manager_name = f"{mgr.first_name} {mgr.last_name}" if mgr else None
    item.team_leader_name = f"{tl.first_name} {tl.last_name}" if tl else None
    item.user_role = current_user.role.value
    return item

@router.get("/{id}", response_model=EmployeeOut)
def get_employee(
    id: int,
    current_user: User = Depends(require_roles(
        UserRole.SUPER_ADMIN,
        UserRole.HR_MANAGER,
        UserRole.DEPARTMENT_MANAGER,
        UserRole.TEAM_LEADER,
        UserRole.EMPLOYEE
    )),
    db: Session = Depends(get_db)
):
    """Gets details of a specific employee"""
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Regular employee can only view their own profile
    if current_user.role == UserRole.EMPLOYEE and emp.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only view your own profile."
        )

    dept = db.query(Department).filter(Department.id == emp.department_id).first() if emp.department_id else None
    team = db.query(Team).filter(Team.id == emp.team_id).first() if emp.team_id else None
    mgr = db.query(Employee).filter(Employee.id == emp.manager_id).first() if emp.manager_id else None
    tl = db.query(Employee).filter(Employee.id == emp.team_leader_id).first() if emp.team_leader_id else None

    item = EmployeeOut.model_validate(emp)
    item.department_name = dept.name if dept else None
    item.team_name = team.name if team else None
    item.manager_name = f"{mgr.first_name} {mgr.last_name}" if mgr else None
    item.team_leader_name = f"{tl.first_name} {tl.last_name}" if tl else None
    item.user_role = emp.user.role.value if emp.user else "EMPLOYEE"
    return item

@router.post("", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(
    request: Request,
    emp_in: EmployeeCreate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Creates a new employee record and corresponding login user"""
    # Check duplicate email
    if db.query(User).filter(User.email == emp_in.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use by another user.")

    # Generate employee code e.g. EMP-1001
    last_emp = db.query(Employee).order_by(Employee.id.desc()).first()
    next_id = (last_emp.id + 1) if last_emp else 1
    emp_code = f"EMP-{1000 + next_id}"

    # Create User
    user = User(
        email=emp_in.email,
        hashed_password=get_password_hash(emp_in.password or "Employee@123"),
        role=emp_in.role or UserRole.EMPLOYEE,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create Employee
    emp_data = emp_in.model_dump(exclude={"password", "role"})
    emp_data["user_id"] = user.id
    emp_data["employee_code"] = emp_code

    employee = Employee(**emp_data)
    db.add(employee)
    db.commit()
    db.refresh(employee)

    # Create initial Leave Balance
    leave_balance = LeaveBalance(
        employee_id=employee.id,
        casual_leave=12.0,
        sick_leave=10.0,
        earned_leave=15.0,
        year=2026
    )
    db.add(leave_balance)
    db.commit()

    log_audit(
        db=db,
        action="EMPLOYEE_CREATED",
        module="EMPLOYEE",
        user=current_user,
        record_id=str(employee.id),
        details={"code": emp_code, "name": f"{employee.first_name} {employee.last_name}", "role": user.role.value},
        ip_address=request.client.host if request.client else None
    )

    item = EmployeeOut.model_validate(employee)
    item.user_role = user.role.value
    return item

@router.put("/{id}", response_model=EmployeeOut)
def update_employee(
    request: Request,
    id: int,
    emp_in: EmployeeUpdate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Updates an existing employee and user role"""
    employee = db.query(Employee).filter(Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    update_data = emp_in.model_dump(exclude_unset=True)
    if "role" in update_data and update_data["role"]:
        employee.user.role = update_data.pop("role")

    for key, value in update_data.items():
        setattr(employee, key, value)

    db.commit()
    db.refresh(employee)

    log_audit(
        db=db,
        action="EMPLOYEE_UPDATED",
        module="EMPLOYEE",
        user=current_user,
        record_id=str(employee.id),
        details={"updated_fields": list(update_data.keys())},
        ip_address=request.client.host if request.client else None
    )

    item = EmployeeOut.model_validate(employee)
    item.user_role = employee.user.role.value
    return item

@router.delete("/{id}")
def delete_employee(
    request: Request,
    id: int,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Deactivates/terminates an employee"""
    employee = db.query(Employee).filter(Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    employee.employment_status = EmploymentStatus.TERMINATED
    if employee.user:
        employee.user.is_active = False
    db.commit()

    log_audit(
        db=db,
        action="EMPLOYEE_TERMINATED",
        module="EMPLOYEE",
        user=current_user,
        record_id=str(employee.id),
        ip_address=request.client.host if request.client else None
    )
    return {"message": f"Employee {employee.employee_code} has been deactivated."}
