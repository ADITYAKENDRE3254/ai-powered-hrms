from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.department import Department, Team
from app.models.employee import Employee
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentOut, TeamOut
from app.services.audit_service import log_audit

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("", response_model=List[DepartmentOut])
def list_departments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists all departments with managers, employee counts, and child teams"""
    departments = db.query(Department).all()
    results = []

    for dept in departments:
        mgr = db.query(Employee).filter(Employee.id == dept.manager_id).first() if dept.manager_id else None
        emp_count = db.query(Employee).filter(Employee.department_id == dept.id).count()

        teams_out = []
        for t in dept.teams:
            tl = db.query(Employee).filter(Employee.id == t.team_leader_id).first() if t.team_leader_id else None
            member_count = db.query(Employee).filter(Employee.team_id == t.id).count()
            t_out = TeamOut.model_validate(t)
            t_out.team_leader_name = f"{tl.first_name} {tl.last_name}" if tl else None
            t_out.department_name = dept.name
            t_out.member_count = member_count
            teams_out.append(t_out)

        dept_out = DepartmentOut.model_validate(dept)
        dept_out.manager_name = f"{mgr.first_name} {mgr.last_name}" if mgr else None
        dept_out.employee_count = emp_count
        dept_out.teams = teams_out
        results.append(dept_out)

    return results

@router.post("", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    request: Request,
    dept_in: DepartmentCreate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Creates a new department"""
    existing = db.query(Department).filter(Department.name.ilike(dept_in.name)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department with this name already exists")

    dept = Department(**dept_in.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)

    log_audit(
        db=db,
        action="DEPARTMENT_CREATED",
        module="DEPARTMENT",
        user=current_user,
        record_id=str(dept.id),
        details={"name": dept.name, "code": dept.code},
        ip_address=request.client.host if request.client else None
    )

    out = DepartmentOut.model_validate(dept)
    out.teams = []
    return out

@router.put("/{id}", response_model=DepartmentOut)
def update_department(
    request: Request,
    id: int,
    dept_in: DepartmentUpdate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Updates department details or assigns a Department Manager"""
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    for key, value in dept_in.model_dump(exclude_unset=True).items():
        setattr(dept, key, value)

    db.commit()
    db.refresh(dept)

    log_audit(
        db=db,
        action="DEPARTMENT_UPDATED",
        module="DEPARTMENT",
        user=current_user,
        record_id=str(dept.id),
        details={"name": dept.name},
        ip_address=request.client.host if request.client else None
    )
    return DepartmentOut.model_validate(dept)
