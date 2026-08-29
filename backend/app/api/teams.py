from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.department import Department, Team
from app.models.employee import Employee
from app.schemas.department import TeamCreate, TeamUpdate, TeamOut
from app.services.audit_service import log_audit

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.get("", response_model=List[TeamOut])
def list_teams(
    department_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists teams with team leaders, department, and member counts"""
    query = db.query(Team)
    if department_id:
        query = query.filter(Team.department_id == department_id)
    
    teams = query.all()
    results = []
    for t in teams:
        tl = db.query(Employee).filter(Employee.id == t.team_leader_id).first() if t.team_leader_id else None
        member_count = db.query(Employee).filter(Employee.team_id == t.id).count()
        
        t_out = TeamOut.model_validate(t)
        t_out.team_leader_name = f"{tl.first_name} {tl.last_name}" if tl else None
        t_out.department_name = t.department.name if t.department else None
        t_out.member_count = member_count
        results.append(t_out)

    return results

@router.post("", response_model=TeamOut, status_code=status.HTTP_201_CREATED)
def create_team(
    request: Request,
    team_in: TeamCreate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER)),
    db: Session = Depends(get_db)
):
    """Creates a new team under a department"""
    dept = db.query(Department).filter(Department.id == team_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    team = Team(**team_in.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)

    log_audit(
        db=db,
        action="TEAM_CREATED",
        module="TEAM",
        user=current_user,
        record_id=str(team.id),
        details={"name": team.name, "department_id": team.department_id},
        ip_address=request.client.host if request.client else None
    )

    t_out = TeamOut.model_validate(team)
    t_out.department_name = dept.name
    return t_out

@router.put("/{id}", response_model=TeamOut)
def update_team(
    request: Request,
    id: int,
    team_in: TeamUpdate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER)),
    db: Session = Depends(get_db)
):
    """Updates team details or reassigns Team Leader"""
    team = db.query(Team).filter(Team.id == id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    for key, value in team_in.model_dump(exclude_unset=True).items():
        setattr(team, key, value)

    db.commit()
    db.refresh(team)

    log_audit(
        db=db,
        action="TEAM_UPDATED",
        module="TEAM",
        user=current_user,
        record_id=str(team.id),
        details={"name": team.name},
        ip_address=request.client.host if request.client else None
    )
    return TeamOut.model_validate(team)
