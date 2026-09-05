from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.employee import Employee
from app.models.training import TrainingProgram, TrainingAssignment, AssignmentStatus, TrainingDifficulty
from app.models.notification import Notification, NotificationType
from app.schemas.training import TrainingProgramCreate, TrainingProgramUpdate, TrainingProgressUpdate
from app.services.audit_service import log_audit

def list_training_programs(
    db: Session,
    search: Optional[str] = None,
    difficulty: Optional[TrainingDifficulty] = None,
    is_active: Optional[bool] = None
) -> List[Dict[str, Any]]:
    query = db.query(TrainingProgram)
    if is_active is not None:
        query = query.filter(TrainingProgram.is_active == is_active)
    if difficulty:
        query = query.filter(TrainingProgram.difficulty == difficulty)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (TrainingProgram.title.ilike(s)) |
            (TrainingProgram.skill_name.ilike(s)) |
            (TrainingProgram.provider.ilike(s))
        )
    
    programs = query.order_by(TrainingProgram.created_at.desc()).all()
    results = []
    for p in programs:
        enrolled = db.query(TrainingAssignment).filter(TrainingAssignment.training_id == p.id).count()
        completed = db.query(TrainingAssignment).filter(
            TrainingAssignment.training_id == p.id,
            TrainingAssignment.status == AssignmentStatus.COMPLETED
        ).count()
        results.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "skill_name": p.skill_name,
            "skill_id": p.skill_id,
            "category_id": p.category_id,
            "difficulty": p.difficulty,
            "duration_hours": p.duration_hours,
            "provider": p.provider,
            "deadline_days": p.deadline_days,
            "is_active": p.is_active,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "enrolled_count": enrolled,
            "completed_count": completed
        })
    return results

def create_training_program(db: Session, data: TrainingProgramCreate, current_user: User) -> TrainingProgram:
    prog = TrainingProgram(
        title=data.title,
        description=data.description,
        skill_name=data.skill_name,
        skill_id=data.skill_id,
        category_id=data.category_id,
        difficulty=data.difficulty,
        duration_hours=data.duration_hours,
        provider=data.provider,
        deadline_days=data.deadline_days,
        is_active=data.is_active
    )
    db.add(prog)
    db.commit()
    db.refresh(prog)

    log_audit(
        db=db,
        action="CREATE_TRAINING_PROGRAM",
        module="TRAINING",
        user=current_user,
        record_id=str(prog.id),
        details={"title": prog.title, "skill": prog.skill_name}
    )
    return prog

def update_training_program(db: Session, training_id: int, data: TrainingProgramUpdate, current_user: User) -> TrainingProgram:
    prog = db.query(TrainingProgram).filter(TrainingProgram.id == training_id).first()
    if not prog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Training program not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(prog, key, value)
    
    prog.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(prog)

    log_audit(
        db=db,
        action="UPDATE_TRAINING_PROGRAM",
        module="TRAINING",
        user=current_user,
        record_id=str(prog.id),
        details={"updated_fields": list(update_dict.keys())}
    )
    return prog

def assign_training(
    db: Session,
    training_id: int,
    employee_ids: List[int],
    assigned_by_user: User,
    deadline: Optional[date] = None
) -> List[TrainingAssignment]:
    prog = db.query(TrainingProgram).filter(TrainingProgram.id == training_id).first()
    if not prog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Training program not found")

    assigned_records = []
    final_deadline = deadline or (date.today() + timedelta(days=prog.deadline_days))

    for emp_id in employee_ids:
        emp = db.query(Employee).filter(Employee.id == emp_id).first()
        if not emp:
            continue

        # Check existing assignment
        existing = db.query(TrainingAssignment).filter(
            TrainingAssignment.training_id == training_id,
            TrainingAssignment.employee_id == emp_id
        ).first()

        if existing:
            continue # Already assigned

        assignment = TrainingAssignment(
            employee_id=emp_id,
            training_id=training_id,
            assigned_by_id=assigned_by_user.id,
            status=AssignmentStatus.NOT_STARTED,
            progress_percentage=0.0,
            deadline=final_deadline
        )
        db.add(assignment)
        assigned_records.append(assignment)

        # Create in-app notification for employee
        if emp.user_id:
            notif = Notification(
                user_id=emp.user_id,
                title="New Training Program Assigned",
                message=f"You have been enrolled in '{prog.title}' ({prog.skill_name}). Deadline: {final_deadline.strftime('%Y-%m-%d')}.",
                type=NotificationType.GENERAL,
                is_read=False
            )
            db.add(notif)

    db.commit()
    for a in assigned_records:
        db.refresh(a)

    log_audit(
        db=db,
        action="ASSIGN_TRAINING",
        module="TRAINING",
        user=assigned_by_user,
        record_id=str(prog.id),
        details={"training_title": prog.title, "assigned_employee_count": len(assigned_records)}
    )
    return assigned_records

def list_assignments(
    db: Session,
    current_user: User,
    employee_id: Optional[int] = None,
    training_id: Optional[int] = None,
    status_filter: Optional[AssignmentStatus] = None
) -> List[Dict[str, Any]]:
    query = db.query(TrainingAssignment)
    
    # RBAC Scoping
    if current_user.role == UserRole.EMPLOYEE:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if not emp:
            return []
        query = query.filter(TrainingAssignment.employee_id == emp.id)
    elif current_user.role == UserRole.DEPARTMENT_MANAGER:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if emp and emp.department_id:
            dept_emp_ids = [e.id for e in db.query(Employee.id).filter(Employee.department_id == emp.department_id).all()]
            query = query.filter(TrainingAssignment.employee_id.in_(dept_emp_ids))
    elif current_user.role == UserRole.TEAM_LEADER:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if emp and emp.team_id:
            team_emp_ids = [e.id for e in db.query(Employee.id).filter(Employee.team_id == emp.team_id).all()]
            query = query.filter(TrainingAssignment.employee_id.in_(team_emp_ids))

    if employee_id and current_user.role in [UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]:
        query = query.filter(TrainingAssignment.employee_id == employee_id)
    if training_id:
        query = query.filter(TrainingAssignment.training_id == training_id)
    if status_filter:
        query = query.filter(TrainingAssignment.status == status_filter)

    assignments = query.order_by(TrainingAssignment.created_at.desc()).all()
    results = []
    today = date.today()

    for a in assignments:
        emp = a.employee
        prog = a.training
        
        # Check overdue status dynamically
        current_status = a.status
        if current_status != AssignmentStatus.COMPLETED and a.deadline and a.deadline < today:
            current_status = AssignmentStatus.OVERDUE

        results.append({
            "id": a.id,
            "employee_id": a.employee_id,
            "employee_name": f"{emp.first_name} {emp.last_name}" if emp else f"EMP #{a.employee_id}",
            "department_name": emp.department.name if emp and emp.department else "General",
            "training_id": a.training_id,
            "training_title": prog.title if prog else "Training Module",
            "skill_name": prog.skill_name if prog else "Skill",
            "difficulty": prog.difficulty if prog else TrainingDifficulty.INTERMEDIATE,
            "duration_hours": prog.duration_hours if prog else 10.0,
            "provider": prog.provider if prog else "Internal Academy",
            "status": current_status,
            "progress_percentage": a.progress_percentage,
            "deadline": a.deadline,
            "certificate_url": a.certificate_url,
            "completed_at": a.completed_at,
            "created_at": a.created_at
        })
    return results

def update_assignment_progress(
    db: Session,
    assignment_id: int,
    current_user: User,
    data: TrainingProgressUpdate
) -> TrainingAssignment:
    assignment = db.query(TrainingAssignment).filter(TrainingAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Training assignment not found")

    # Permission check: Employee can only update own assignment; HR/Admin can update any
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if current_user.role == UserRole.EMPLOYEE:
        if not emp or assignment.employee_id != emp.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update your own assigned trainings.")

    assignment.progress_percentage = max(0.0, min(100.0, data.progress_percentage))
    if data.certificate_url:
        assignment.certificate_url = data.certificate_url

    if assignment.progress_percentage >= 100.0 or data.status == AssignmentStatus.COMPLETED:
        assignment.status = AssignmentStatus.COMPLETED
        if not assignment.completed_at:
            assignment.completed_at = datetime.now(timezone.utc)
            # Send completion notification
            if assignment.employee and assignment.employee.user_id:
                prog_title = assignment.training.title if assignment.training else "training program"
                notif = Notification(
                    user_id=assignment.employee.user_id,
                    title="Training Successfully Completed 🎉",
                    message=f"Congratulations! You completed '{prog_title}'. Your skill record has been updated.",
                    type=NotificationType.GENERAL,
                    is_read=False
                )
                db.add(notif)
    elif assignment.progress_percentage > 0:
        assignment.status = AssignmentStatus.IN_PROGRESS
    elif data.status:
        assignment.status = data.status

    assignment.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(assignment)

    log_audit(
        db=db,
        action="UPDATE_TRAINING_PROGRESS",
        module="TRAINING",
        user=current_user,
        record_id=str(assignment.id),
        details={"progress": assignment.progress_percentage, "status": assignment.status.value}
    )
    return assignment
