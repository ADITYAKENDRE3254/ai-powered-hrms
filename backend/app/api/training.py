from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.training import TrainingDifficulty, AssignmentStatus
from app.schemas.training import (
    TrainingProgramCreate,
    TrainingProgramUpdate,
    TrainingProgramOut,
    TrainingAssignmentCreate,
    TrainingAssignmentOut,
    TrainingProgressUpdate
)
from app.services import training_service

router = APIRouter(prefix="/training", tags=["Training Management"])

@router.get("", response_model=List[TrainingProgramOut])
def get_training_programs(
    search: Optional[str] = Query(None),
    difficulty: Optional[TrainingDifficulty] = Query(None),
    is_active: Optional[bool] = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists training catalog courses with enrollment metrics."""
    return training_service.list_training_programs(
        db=db, search=search, difficulty=difficulty, is_active=is_active
    )

@router.post("", response_model=TrainingProgramOut, status_code=status.HTTP_201_CREATED)
def create_training_program(
    data: TrainingProgramCreate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Creates a new training catalog course (HR / Super Admin only)."""
    prog = training_service.create_training_program(db=db, data=data, current_user=current_user)
    return {
        "id": prog.id,
        "title": prog.title,
        "description": prog.description,
        "skill_name": prog.skill_name,
        "skill_id": prog.skill_id,
        "category_id": prog.category_id,
        "difficulty": prog.difficulty,
        "duration_hours": prog.duration_hours,
        "provider": prog.provider,
        "deadline_days": prog.deadline_days,
        "is_active": prog.is_active,
        "created_at": prog.created_at,
        "updated_at": prog.updated_at,
        "enrolled_count": 0,
        "completed_count": 0
    }

@router.put("/{training_id}", response_model=TrainingProgramOut)
def update_training_program(
    training_id: int,
    data: TrainingProgramUpdate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Updates an existing training program course."""
    prog = training_service.update_training_program(db=db, training_id=training_id, data=data, current_user=current_user)
    return {
        "id": prog.id,
        "title": prog.title,
        "description": prog.description,
        "skill_name": prog.skill_name,
        "skill_id": prog.skill_id,
        "category_id": prog.category_id,
        "difficulty": prog.difficulty,
        "duration_hours": prog.duration_hours,
        "provider": prog.provider,
        "deadline_days": prog.deadline_days,
        "is_active": prog.is_active,
        "created_at": prog.created_at,
        "updated_at": prog.updated_at,
        "enrolled_count": 0,
        "completed_count": 0
    }

@router.post("/assign", response_model=List[TrainingAssignmentOut], status_code=status.HTTP_201_CREATED)
def assign_training_program(
    data: TrainingAssignmentCreate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER, UserRole.TEAM_LEADER)),
    db: Session = Depends(get_db)
):
    """Assigns training course to one or more employees."""
    assigned = training_service.assign_training(
        db=db,
        training_id=data.training_id,
        employee_ids=data.employee_ids,
        assigned_by_user=current_user,
        deadline=data.deadline
    )
    # Return mapped assignment outputs
    return training_service.list_assignments(db=db, current_user=current_user, training_id=data.training_id)

@router.get("/assignments", response_model=List[TrainingAssignmentOut])
def list_training_assignments(
    employee_id: Optional[int] = Query(None),
    training_id: Optional[int] = Query(None),
    status_filter: Optional[AssignmentStatus] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists employee training assignments filtered by role permissions."""
    return training_service.list_assignments(
        db=db,
        current_user=current_user,
        employee_id=employee_id,
        training_id=training_id,
        status_filter=status_filter
    )

@router.get("/my-assignments", response_model=List[TrainingAssignmentOut])
def get_my_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns training assignments enrolled for current employee."""
    return training_service.list_assignments(db=db, current_user=current_user)

@router.put("/assignments/{assignment_id}/progress", response_model=TrainingAssignmentOut)
def update_training_progress(
    assignment_id: int,
    data: TrainingProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates progress percentage or completion for a training assignment."""
    training_service.update_assignment_progress(
        db=db,
        assignment_id=assignment_id,
        current_user=current_user,
        data=data
    )
    assignments = training_service.list_assignments(db=db, current_user=current_user)
    for a in assignments:
        if a["id"] == assignment_id:
            return a
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
