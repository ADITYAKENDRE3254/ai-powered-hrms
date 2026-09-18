from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.employee import Employee
from app.schemas.auth import LoginRequest, TokenResponse, UserOut, PasswordChangeRequest
from app.services.audit_service import log_audit

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticates user credentials and issues a signed JWT access token"""
    clean_email = login_data.email.strip().lower()
    clean_password = login_data.password.strip()
    user = db.query(User).filter(func.lower(User.email) == clean_email).first()
    if not user or not verify_password(clean_password, user.hashed_password):
        log_audit(
            db=db,
            action="LOGIN_FAILED",
            module="AUTH",
            details={"email": login_data.email, "reason": "Invalid credentials"},
            ip_address=request.client.host if request.client else None
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact HR."
        )

    # Fetch associated employee info if exists
    employee = db.query(Employee).filter(Employee.user_id == user.id).first()
    emp_id = employee.id if employee else None
    full_name = f"{employee.first_name} {employee.last_name}" if employee else user.email.split("@")[0].capitalize()

    access_token = create_access_token(subject=user.id, role=user.role.value)

    log_audit(
        db=db,
        action="LOGIN_SUCCESS",
        module="AUTH",
        user=user,
        record_id=str(user.id),
        details={"role": user.role.value},
        ip_address=request.client.host if request.client else None
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        user_id=user.id,
        email=user.email,
        employee_id=emp_id,
        full_name=full_name
    )

@router.post("/logout")
def logout(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Logs out user and registers audit event"""
    log_audit(
        db=db,
        action="LOGOUT",
        module="AUTH",
        user=current_user,
        record_id=str(current_user.id),
        ip_address=request.client.host if request.client else None
    )
    return {"message": "Successfully logged out"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns profile information for currently authenticated user"""
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    dept_name = employee.department.name if employee and employee.department else None
    team_name = employee.team.name if employee and employee.team else None

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value,
        "is_active": current_user.is_active,
        "employee_id": employee.id if employee else None,
        "employee_code": employee.employee_code if employee else None,
        "first_name": employee.first_name if employee else None,
        "last_name": employee.last_name if employee else None,
        "full_name": f"{employee.first_name} {employee.last_name}" if employee else current_user.email.split("@")[0].capitalize(),
        "designation": employee.designation if employee else current_user.role.value,
        "department_id": employee.department_id if employee else None,
        "department_name": dept_name,
        "team_id": employee.team_id if employee else None,
        "team_name": team_name,
        "monthly_salary": employee.monthly_salary if employee else 0.0,
        "joining_date": employee.joining_date if employee else None
    }

@router.post("/change-password")
def change_password(
    pwd_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows authenticated user to change their password"""
    if not verify_password(pwd_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    current_user.hashed_password = get_password_hash(pwd_data.new_password)
    db.commit()

    log_audit(
        db=db,
        action="PASSWORD_CHANGED",
        module="AUTH",
        user=current_user,
        record_id=str(current_user.id)
    )
    return {"message": "Password changed successfully"}
