from datetime import date, datetime, timezone
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.leave import LeaveRequest, LeaveBalance, LeaveType, LeaveStatus
from app.models.employee import Employee
from app.models.user import User, UserRole
from app.models.notification import Notification, NotificationType
from app.services.audit_service import log_audit

def calculate_duration_days(start_date: date, end_date: date) -> int:
    """Calculates inclusive duration in days between start and end dates"""
    if end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date cannot be earlier than start date."
        )
    return (end_date - start_date).days + 1

def create_leave_request(
    db: Session,
    employee: Employee,
    leave_type: LeaveType,
    start_date: date,
    end_date: date,
    reason: str,
    ip_address: Optional[str] = None
) -> LeaveRequest:
    """Creates a leave request and applies the multi-tier approval workflow"""
    duration = calculate_duration_days(start_date, end_date)

    # ── CASUAL LEAVE CAP: Maximum 8 casual leave days per year ──────────────
    CASUAL_LEAVE_MAX_DAYS = 8
    if leave_type == LeaveType.CASUAL:
        # Count all approved + pending casual leave days this year to prevent gaming
        current_year = start_date.year
        used_casual = db.query(LeaveRequest).filter(
            LeaveRequest.employee_id == employee.id,
            LeaveRequest.leave_type == LeaveType.CASUAL,
            LeaveRequest.status.in_([
                LeaveStatus.APPROVED,
                LeaveStatus.PENDING_TL,
                LeaveStatus.PENDING_MANAGER
            ]),
            LeaveRequest.start_date >= date(current_year, 1, 1),
            LeaveRequest.end_date <= date(current_year, 12, 31)
        ).all()

        used_days = sum(req.duration_days for req in used_casual)
        remaining = CASUAL_LEAVE_MAX_DAYS - used_days

        if duration > remaining:
            if remaining <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Casual leave limit reached: You have used all {CASUAL_LEAVE_MAX_DAYS} casual leave days allowed this year. Please apply for Sick Leave or Earned Leave instead."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Casual leave limit exceeded: You can only take {remaining} more casual leave day(s) this year (maximum {CASUAL_LEAVE_MAX_DAYS} days per year). You have used {used_days} day(s) so far."
                )
    # ────────────────────────────────────────────────────────────────────────

    # Check for overlapping leave requests
    overlapping = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee.id,
        LeaveRequest.status.in_([LeaveStatus.PENDING_TL, LeaveStatus.PENDING_MANAGER, LeaveStatus.APPROVED]),
        LeaveRequest.start_date <= end_date,
        LeaveRequest.end_date >= start_date
    ).first()

    if overlapping:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Overlapping leave request already exists from {overlapping.start_date} to {overlapping.end_date}."
        )

    now = datetime.now(timezone.utc)
    leave_req = LeaveRequest(
        employee_id=employee.id,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        duration_days=duration,
        reason=reason
    )

    # Apply Workflow Business Rules:
    # 1 Day: Auto-approve immediately
    if duration == 1:
        leave_req.status = LeaveStatus.APPROVED
        leave_req.approved_at = now
        leave_req.approver_id = None  # System auto-approval
        db.add(leave_req)
        db.commit()
        db.refresh(leave_req)

        # Notify Employee
        db.add(Notification(
            user_id=employee.user_id,
            title="Leave Auto-Approved",
            message=f"Your 1-day {leave_type.value} leave request for {start_date} has been automatically approved.",
            type=NotificationType.LEAVE
        ))

        # Notify Team Leader if exists
        if employee.team_leader_id:
            tl_emp = db.query(Employee).filter(Employee.id == employee.team_leader_id).first()
            if tl_emp:
                db.add(Notification(
                    user_id=tl_emp.user_id,
                    title="Team Member Leave Auto-Approved",
                    message=f"{employee.first_name} {employee.last_name}'s 1-day leave for {start_date} was auto-approved.",
                    type=NotificationType.LEAVE
                ))

        # Notify HR Managers
        hr_users = db.query(User).filter(User.role.in_([UserRole.HR_MANAGER, UserRole.SUPER_ADMIN])).all()
        for hr in hr_users:
            db.add(Notification(
                user_id=hr.id,
                title="Leave Auto-Approved (1-Day)",
                message=f"Employee {employee.first_name} {employee.last_name} ({employee.employee_code}) was auto-approved for 1-day {leave_type.value} leave on {start_date}.",
                type=NotificationType.LEAVE
            ))

        db.commit()

        log_audit(
            db=db,
            action="LEAVE_AUTO_APPROVED",
            module="LEAVE",
            user=employee.user,
            record_id=str(leave_req.id),
            details={"duration": 1, "type": leave_type.value, "status": "APPROVED"},
            ip_address=ip_address
        )

    # 2 Days: Route to Team Leader
    elif duration == 2:
        leave_req.status = LeaveStatus.PENDING_TL
        db.add(leave_req)
        db.commit()
        db.refresh(leave_req)

        # Notify Employee
        db.add(Notification(
            user_id=employee.user_id,
            title="Leave Submitted (Pending Team Leader Approval)",
            message=f"Your 2-day leave request from {start_date} to {end_date} has been routed to your Team Leader for review.",
            type=NotificationType.LEAVE
        ))

        # Notify Team Leader
        if employee.team_leader_id:
            tl_emp = db.query(Employee).filter(Employee.id == employee.team_leader_id).first()
            if tl_emp:
                db.add(Notification(
                    user_id=tl_emp.user_id,
                    title="Leave Approval Required (2 Days)",
                    message=f"{employee.first_name} {employee.last_name} requested a 2-day leave ({start_date} to {end_date}). Action required.",
                    type=NotificationType.LEAVE
                ))
        db.commit()

        log_audit(
            db=db,
            action="LEAVE_SUBMITTED_PENDING_TL",
            module="LEAVE",
            user=employee.user,
            record_id=str(leave_req.id),
            details={"duration": 2, "type": leave_type.value},
            ip_address=ip_address
        )

    # 3+ Days: Route to Department Manager / HR Manager
    else:
        leave_req.status = LeaveStatus.PENDING_MANAGER
        db.add(leave_req)
        db.commit()
        db.refresh(leave_req)

        # Notify Employee
        db.add(Notification(
            user_id=employee.user_id,
            title="Leave Submitted (Pending Manager Approval)",
            message=f"Your {duration}-day leave request from {start_date} to {end_date} has been routed to your Department Manager / HR for review.",
            type=NotificationType.LEAVE
        ))

        # Notify Department Manager
        if employee.manager_id:
            mgr_emp = db.query(Employee).filter(Employee.id == employee.manager_id).first()
            if mgr_emp:
                db.add(Notification(
                    user_id=mgr_emp.user_id,
                    title=f"Leave Approval Required ({duration} Days)",
                    message=f"{employee.first_name} {employee.last_name} requested {duration} days leave from {start_date} to {end_date}.",
                    type=NotificationType.LEAVE
                ))

        # Also notify HR
        hr_users = db.query(User).filter(User.role.in_([UserRole.HR_MANAGER, UserRole.SUPER_ADMIN])).all()
        for hr in hr_users:
            db.add(Notification(
                user_id=hr.id,
                title=f"Leave Request Pending ({duration} Days)",
                message=f"{employee.first_name} {employee.last_name} submitted a {duration}-day leave request from {start_date} to {end_date}.",
                type=NotificationType.LEAVE
            ))
        db.commit()

        log_audit(
            db=db,
            action="LEAVE_SUBMITTED_PENDING_MANAGER",
            module="LEAVE",
            user=employee.user,
            record_id=str(leave_req.id),
            details={"duration": duration, "type": leave_type.value},
            ip_address=ip_address
        )

    return leave_req

def approve_leave_request(
    db: Session,
    leave_id: int,
    approver: User,
    ip_address: Optional[str] = None
) -> LeaveRequest:
    """Approves a pending leave request with role validation"""
    leave_req = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found.")

    if leave_req.status not in [LeaveStatus.PENDING_TL, LeaveStatus.PENDING_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve leave request with status '{leave_req.status.value}'."
        )

    # Validate Approver Permissions
    emp = leave_req.employee
    if approver.role not in [UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]:
        if leave_req.status == LeaveStatus.PENDING_TL:
            # Must be the team leader of the employee
            approver_emp = db.query(Employee).filter(Employee.user_id == approver.id).first()
            if not approver_emp or emp.team_leader_id != approver_emp.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the assigned Team Leader, HR Manager, or Admin can approve this 2-day leave request."
                )
        elif leave_req.status == LeaveStatus.PENDING_MANAGER:
            # Must be the manager of the department
            approver_emp = db.query(Employee).filter(Employee.user_id == approver.id).first()
            if not approver_emp or emp.manager_id != approver_emp.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the assigned Department Manager, HR Manager, or Admin can approve this 3+ day leave request."
                )

    leave_req.status = LeaveStatus.APPROVED
    leave_req.approver_id = approver.id
    leave_req.approved_at = datetime.now(timezone.utc)
    leave_req.rejection_reason = None
    db.commit()
    db.refresh(leave_req)

    # Notify Employee
    db.add(Notification(
        user_id=emp.user_id,
        title="Leave Request Approved",
        message=f"Your {leave_req.duration_days}-day leave request ({leave_req.start_date} to {leave_req.end_date}) was APPROVED.",
        type=NotificationType.LEAVE
    ))
    db.commit()

    log_audit(
        db=db,
        action="LEAVE_APPROVED",
        module="LEAVE",
        user=approver,
        record_id=str(leave_req.id),
        details={"approved_by": approver.email, "duration": leave_req.duration_days},
        ip_address=ip_address
    )
    return leave_req

def reject_leave_request(
    db: Session,
    leave_id: int,
    approver: User,
    rejection_reason: Optional[str] = None,
    ip_address: Optional[str] = None
) -> LeaveRequest:
    """Rejects a pending leave request with role validation"""
    leave_req = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found.")

    if leave_req.status not in [LeaveStatus.PENDING_TL, LeaveStatus.PENDING_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject leave request with status '{leave_req.status.value}'."
        )

    emp = leave_req.employee
    if approver.role not in [UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]:
        if leave_req.status == LeaveStatus.PENDING_TL:
            approver_emp = db.query(Employee).filter(Employee.user_id == approver.id).first()
            if not approver_emp or emp.team_leader_id != approver_emp.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the assigned Team Leader, HR Manager, or Admin can reject this 2-day leave request."
                )
        elif leave_req.status == LeaveStatus.PENDING_MANAGER:
            approver_emp = db.query(Employee).filter(Employee.user_id == approver.id).first()
            if not approver_emp or emp.manager_id != approver_emp.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the assigned Department Manager, HR Manager, or Admin can reject this 3+ day leave request."
                )

    leave_req.status = LeaveStatus.REJECTED
    leave_req.approver_id = approver.id
    leave_req.approved_at = datetime.now(timezone.utc)
    leave_req.rejection_reason = rejection_reason or "Leave request declined by approver."
    db.commit()
    db.refresh(leave_req)

    # Notify Employee
    db.add(Notification(
        user_id=emp.user_id,
        title="Leave Request Rejected",
        message=f"Your {leave_req.duration_days}-day leave request ({leave_req.start_date} to {leave_req.end_date}) was REJECTED. Reason: {leave_req.rejection_reason}",
        type=NotificationType.LEAVE
    ))
    db.commit()

    log_audit(
        db=db,
        action="LEAVE_REJECTED",
        module="LEAVE",
        user=approver,
        record_id=str(leave_req.id),
        details={"rejected_by": approver.email, "reason": leave_req.rejection_reason},
        ip_address=ip_address
    )
    return leave_req
