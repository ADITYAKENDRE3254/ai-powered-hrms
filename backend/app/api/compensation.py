from typing import List, Optional
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_employee, require_roles
from app.models.user import User, UserRole
from app.models.employee import Employee, EmploymentStatus
from app.models.department import Department
from app.models.compensation import (
    DepartmentSalaryRule,
    PositionSalaryRule,
    EmployeeSalary,
    SalaryHistory,
    SalaryType,
    SalaryApprovalStatus
)
from app.schemas.compensation import (
    DepartmentSalaryRuleCreate,
    DepartmentSalaryRuleUpdate,
    DepartmentSalaryRuleOut,
    PositionSalaryRuleCreate,
    PositionSalaryRuleUpdate,
    PositionSalaryRuleOut,
    EmployeeSalaryCreate,
    EmployeeSalaryOut,
    EmployeeCompensationSummaryOut,
    SalaryApprovalRequest,
    SalaryHistoryOut,
    AISalaryRecommendationRequest,
    AISalaryRecommendationOut,
    CompensationDashboardOut
)
from app.services.compensation_service import (
    calculate_salary_components,
    resolve_employee_effective_salary,
    record_salary_history,
    generate_ai_salary_recommendation,
    get_compensation_dashboard_analytics
)
from app.services.audit_service import log_audit
from app.models.notification import Notification, NotificationType

router = APIRouter(prefix="/compensation", tags=["Compensation & Salary Management"])

# ----------------- DASHBOARD ANALYTICS -----------------

@router.get("/dashboard", response_model=CompensationDashboardOut)
def get_compensation_dashboard(
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER)),
    db: Session = Depends(get_db)
):
    """Returns executive compensation KPI metrics and graphical chart datasets"""
    return get_compensation_dashboard_analytics(db)

# ----------------- DEPARTMENT SALARY RULES -----------------

@router.get("/departments", response_model=List[DepartmentSalaryRuleOut])
def list_department_salary_rules(
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER)),
    db: Session = Depends(get_db)
):
    """Lists configured department salary bands"""
    rules = db.query(DepartmentSalaryRule).order_by(DepartmentSalaryRule.id.desc()).all()
    results = []
    for r in rules:
        out = DepartmentSalaryRuleOut.model_validate(r)
        out.department_name = r.department.name if r.department else None
        results.append(out)
    return results

@router.post("/departments", response_model=DepartmentSalaryRuleOut, status_code=status.HTTP_201_CREATED)
def create_or_update_department_salary_rule(
    request: Request,
    rule_in: DepartmentSalaryRuleCreate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Configures salary minimum and maximum boundaries for a department"""
    dept = db.query(Department).filter(Department.id == rule_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    if rule_in.min_salary > rule_in.max_salary:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Minimum salary cannot exceed maximum salary")

    # Check existing rule for department
    existing = db.query(DepartmentSalaryRule).filter(
        DepartmentSalaryRule.department_id == rule_in.department_id,
        DepartmentSalaryRule.is_active == True
    ).first()

    if existing:
        existing.min_salary = rule_in.min_salary
        existing.max_salary = rule_in.max_salary
        existing.currency = rule_in.currency
        existing.effective_date = rule_in.effective_date
        existing.notes = rule_in.notes
        existing.updated_at = datetime.now(timezone.utc)
        rule = existing
    else:
        rule = DepartmentSalaryRule(
            department_id=rule_in.department_id,
            min_salary=rule_in.min_salary,
            max_salary=rule_in.max_salary,
            currency=rule_in.currency,
            effective_date=rule_in.effective_date,
            is_active=rule_in.is_active,
            notes=rule_in.notes,
            created_by=current_user.id
        )
        db.add(rule)

    db.commit()
    db.refresh(rule)

    log_audit(
        db=db,
        action="SALARY_DEPARTMENT_CONFIGURED",
        module="COMPENSATION",
        user=current_user,
        record_id=str(rule.id),
        details={"department": dept.name, "min": rule.min_salary, "max": rule.max_salary},
        ip_address=request.client.host if request.client else None
    )

    out = DepartmentSalaryRuleOut.model_validate(rule)
    out.department_name = dept.name
    return out

@router.delete("/departments/{id}")
def delete_department_salary_rule(
    request: Request,
    id: int,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Deletes or deactivates a department salary rule"""
    rule = db.query(DepartmentSalaryRule).filter(DepartmentSalaryRule.id == id).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department salary rule not found")

    db.delete(rule)
    db.commit()

    log_audit(
        db=db,
        action="SALARY_DEPARTMENT_DELETED",
        module="COMPENSATION",
        user=current_user,
        record_id=str(id),
        details={"rule_id": id},
        ip_address=request.client.host if request.client else None
    )
    return {"message": "Department salary rule removed successfully"}

# ----------------- POSITION SALARY RULES -----------------

@router.get("/positions", response_model=List[PositionSalaryRuleOut])
def list_position_salary_rules(
    department_id: Optional[int] = None,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER)),
    db: Session = Depends(get_db)
):
    """Lists configured position/designation salary rules and benchmarks"""
    query = db.query(PositionSalaryRule)
    if department_id:
        query = query.filter(PositionSalaryRule.department_id == department_id)

    rules = query.order_by(PositionSalaryRule.id.desc()).all()
    results = []
    for r in rules:
        out = PositionSalaryRuleOut.model_validate(r)
        out.department_name = r.department.name if r.department else "All Departments"
        results.append(out)
    return results

@router.post("/positions", response_model=PositionSalaryRuleOut, status_code=status.HTTP_201_CREATED)
def create_or_update_position_salary_rule(
    request: Request,
    rule_in: PositionSalaryRuleCreate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Configures salary minimum, maximum, and default recommended compensation for a position"""
    if rule_in.min_salary > rule_in.max_salary:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Minimum salary cannot exceed maximum salary")

    if not (rule_in.min_salary <= rule_in.default_salary <= rule_in.max_salary):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Recommended salary must be within min and max boundaries")

    dept_name = "All Departments"
    if rule_in.department_id:
        dept = db.query(Department).filter(Department.id == rule_in.department_id).first()
        if not dept:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
        dept_name = dept.name

    # Check existing position rule
    existing = db.query(PositionSalaryRule).filter(
        PositionSalaryRule.position_title.ilike(rule_in.position_title.strip()),
        PositionSalaryRule.department_id == rule_in.department_id,
        PositionSalaryRule.is_active == True
    ).first()

    if existing:
        existing.min_salary = rule_in.min_salary
        existing.max_salary = rule_in.max_salary
        existing.default_salary = rule_in.default_salary
        existing.salary_type = rule_in.salary_type
        existing.effective_date = rule_in.effective_date
        existing.notes = rule_in.notes
        existing.updated_at = datetime.now(timezone.utc)
        rule = existing
    else:
        rule = PositionSalaryRule(
            department_id=rule_in.department_id,
            position_title=rule_in.position_title.strip(),
            min_salary=rule_in.min_salary,
            max_salary=rule_in.max_salary,
            default_salary=rule_in.default_salary,
            salary_type=rule_in.salary_type,
            effective_date=rule_in.effective_date,
            is_active=rule_in.is_active,
            notes=rule_in.notes,
            created_by=current_user.id
        )
        db.add(rule)

    db.commit()
    db.refresh(rule)

    log_audit(
        db=db,
        action="SALARY_POSITION_CONFIGURED",
        module="COMPENSATION",
        user=current_user,
        record_id=str(rule.id),
        details={"position": rule.position_title, "department": dept_name, "default": rule.default_salary},
        ip_address=request.client.host if request.client else None
    )

    out = PositionSalaryRuleOut.model_validate(rule)
    out.department_name = dept_name
    return out

@router.delete("/positions/{id}")
def delete_position_salary_rule(
    request: Request,
    id: int,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Deletes or deactivates a position salary rule"""
    rule = db.query(PositionSalaryRule).filter(PositionSalaryRule.id == id).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Position salary rule not found")

    db.delete(rule)
    db.commit()

    log_audit(
        db=db,
        action="SALARY_POSITION_DELETED",
        module="COMPENSATION",
        user=current_user,
        record_id=str(id),
        details={"rule_id": id},
        ip_address=request.client.host if request.client else None
    )
    return {"message": "Position salary rule removed successfully"}

# ----------------- EMPLOYEE SALARY CONFIGURATION & STRUCTURE -----------------

@router.get("/employees", response_model=List[EmployeeCompensationSummaryOut])
def list_employee_compensation_summaries(
    department_id: Optional[int] = None,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER)),
    db: Session = Depends(get_db)
):
    """Lists company employees with their current active salary, benchmark ranges, and status"""
    query = db.query(Employee).filter(
        Employee.employment_status.in_([EmploymentStatus.ACTIVE, EmploymentStatus.PROBATION])
    )
    if current_user.role == UserRole.DEPARTMENT_MANAGER:
        # Department managers can only see their department's employees
        mgr_dept = db.query(Department).filter(Department.manager_id == current_user.id).first()
        if mgr_dept:
            query = query.filter(Employee.department_id == mgr_dept.id)

    if department_id:
        query = query.filter(Employee.department_id == department_id)

    employees = query.order_by(Employee.id.asc()).all()
    results = []

    for emp in employees:
        resolved = resolve_employee_effective_salary(db, emp)

        # Department Range
        dept_str = "Not Set"
        if emp.department_id:
            d_rule = db.query(DepartmentSalaryRule).filter(
                DepartmentSalaryRule.department_id == emp.department_id,
                DepartmentSalaryRule.is_active == True
            ).first()
            if d_rule:
                dept_str = f"₹{d_rule.min_salary:,.0f} – ₹{d_rule.max_salary:,.0f}"

        # Position Range
        pos_str = "Not Set"
        pos_suggested = resolved["gross_salary"]
        p_rule = db.query(PositionSalaryRule).filter(
            PositionSalaryRule.position_title.ilike(emp.designation.strip()),
            PositionSalaryRule.is_active == True
        ).first()
        if p_rule:
            pos_str = f"₹{p_rule.min_salary:,.0f} – ₹{p_rule.max_salary:,.0f}"
            pos_suggested = p_rule.default_salary

        results.append(EmployeeCompensationSummaryOut(
            employee_id=emp.id,
            employee_name=f"{emp.first_name} {emp.last_name}",
            employee_code=emp.employee_code,
            department_id=emp.department_id,
            department_name=emp.department.name if emp.department else "Unassigned",
            position=emp.designation,
            current_gross_salary=resolved["gross_salary"],
            current_net_salary=resolved["net_salary"],
            department_range=dept_str,
            position_range=pos_str,
            suggested_salary=pos_suggested,
            actual_salary=resolved["gross_salary"],
            salary_source=resolved["source"],
            status=resolved.get("status", SalaryApprovalStatus.APPROVED),
            effective_date=resolved["effective_date"]
        ))
    return results

@router.get("/employees/{employee_id}", response_model=EmployeeSalaryOut)
def get_employee_salary_details(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves full salary structure breakdown, benchmark bands, and approval status for an employee"""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Authorization Check
    if current_user.role == UserRole.EMPLOYEE:
        if emp.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Cannot view other employee compensation")
    elif current_user.role not in [UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    resolved = resolve_employee_effective_salary(db, emp)

    # Department benchmarks
    dept_min, dept_max = None, None
    if emp.department_id:
        d_rule = db.query(DepartmentSalaryRule).filter(
            DepartmentSalaryRule.department_id == emp.department_id,
            DepartmentSalaryRule.is_active == True
        ).first()
        if d_rule:
            dept_min, dept_max = d_rule.min_salary, d_rule.max_salary

    # Position benchmarks
    pos_min, pos_max, pos_default = None, None, None
    p_rule = db.query(PositionSalaryRule).filter(
        PositionSalaryRule.position_title.ilike(emp.designation.strip()),
        PositionSalaryRule.is_active == True
    ).first()
    if p_rule:
        pos_min, pos_max, pos_default = p_rule.min_salary, p_rule.max_salary, p_rule.default_salary

    # Fetch latest individual salary record if exists
    latest_emp_sal = db.query(EmployeeSalary).filter(
        EmployeeSalary.employee_id == emp.id
    ).order_by(EmployeeSalary.id.desc()).first()

    status_val = latest_emp_sal.status if latest_emp_sal else SalaryApprovalStatus.APPROVED
    reason_val = latest_emp_sal.reason if latest_emp_sal else "Initial baseline"
    req_by = latest_emp_sal.requested_by if latest_emp_sal else None
    app_by = latest_emp_sal.approved_by if latest_emp_sal else None
    app_at = latest_emp_sal.approved_at if latest_emp_sal else None
    rej_reason = latest_emp_sal.rejection_reason if latest_emp_sal else None
    record_id = latest_emp_sal.id if latest_emp_sal else 0
    created_ts = latest_emp_sal.created_at if latest_emp_sal else datetime.now(timezone.utc)
    updated_ts = latest_emp_sal.updated_at if latest_emp_sal else datetime.now(timezone.utc)

    return EmployeeSalaryOut(
        id=record_id,
        employee_id=emp.id,
        employee_name=f"{emp.first_name} {emp.last_name}",
        employee_code=emp.employee_code,
        department_name=emp.department.name if emp.department else None,
        position=emp.designation,
        gross_salary=resolved["gross_salary"],
        basic_salary=resolved["basic_salary"],
        hra=resolved["hra"],
        transport_allowance=resolved["transport_allowance"],
        medical_allowance=resolved["medical_allowance"],
        other_allowances=resolved["other_allowances"],
        bonus=resolved["bonus"],
        pf_deduction=resolved["pf_deduction"],
        tax_deduction=resolved["tax_deduction"],
        professional_tax=resolved["professional_tax"],
        other_deductions=resolved["other_deductions"],
        total_deductions=round(resolved["pf_deduction"] + resolved["tax_deduction"] + resolved["professional_tax"] + resolved["other_deductions"], 2),
        net_salary=resolved["net_salary"],
        salary_type=resolved["salary_type"],
        effective_date=resolved["effective_date"],
        status=status_val,
        reason=reason_val,
        requested_by=req_by,
        approved_by=app_by,
        approved_at=app_at,
        rejection_reason=rej_reason,
        department_min_salary=dept_min,
        department_max_salary=dept_max,
        position_min_salary=pos_min,
        position_max_salary=pos_max,
        position_default_salary=pos_default,
        salary_source=resolved["source"],
        created_at=created_ts,
        updated_at=updated_ts
    )

@router.post("/employees/{employee_id}", response_model=EmployeeSalaryOut, status_code=status.HTTP_201_CREATED)
def configure_employee_salary(
    request: Request,
    employee_id: int,
    salary_in: EmployeeSalaryCreate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Sets or revises an individual employee's salary structure with audit history"""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Get previous effective salary before update
    prev_resolved = resolve_employee_effective_salary(db, emp)
    prev_gross = prev_resolved["gross_salary"]
    prev_net = prev_resolved["net_salary"]

    # Compute components
    comp = calculate_salary_components(
        gross_salary=salary_in.gross_salary,
        basic_salary=salary_in.basic_salary,
        hra=salary_in.hra,
        transport_allowance=salary_in.transport_allowance,
        medical_allowance=salary_in.medical_allowance,
        other_allowances=salary_in.other_allowances,
        bonus=salary_in.bonus,
        pf_deduction=salary_in.pf_deduction,
        tax_deduction=salary_in.tax_deduction,
        professional_tax=salary_in.professional_tax,
        other_deductions=salary_in.other_deductions,
        pf_percentage=emp.pf_percentage or 12.0,
        tax_percentage=emp.tax_percentage or 10.0
    )

    now = datetime.now(timezone.utc)
    emp_salary = EmployeeSalary(
        employee_id=emp.id,
        gross_salary=comp["gross_salary"],
        basic_salary=comp["basic_salary"],
        hra=comp["hra"],
        transport_allowance=comp["transport_allowance"],
        medical_allowance=comp["medical_allowance"],
        other_allowances=comp["other_allowances"],
        bonus=comp["bonus"],
        pf_deduction=comp["pf_deduction"],
        tax_deduction=comp["tax_deduction"],
        professional_tax=comp["professional_tax"],
        other_deductions=comp["other_deductions"],
        net_salary=comp["net_salary"],
        salary_type=salary_in.salary_type,
        effective_date=salary_in.effective_date,
        status=SalaryApprovalStatus.APPROVED,
        reason=salary_in.reason,
        requested_by=current_user.id,
        approved_by=current_user.id,
        approved_at=now
    )
    db.add(emp_salary)

    # Update base employee monthly_salary model field for legacy sync
    emp.monthly_salary = comp["gross_salary"]
    emp.allowances = comp["other_allowances"]
    db.commit()
    db.refresh(emp_salary)

    # Record Salary History
    record_salary_history(
        db=db,
        employee_id=emp.id,
        previous_gross_salary=prev_gross,
        new_gross_salary=comp["gross_salary"],
        previous_net_salary=prev_net,
        new_net_salary=comp["net_salary"],
        reason=salary_in.reason,
        effective_date=salary_in.effective_date,
        changed_by_user_id=current_user.id
    )

    log_audit(
        db=db,
        action="SALARY_REVISED",
        module="COMPENSATION",
        user=current_user,
        record_id=str(emp.id),
        details={
            "employee_name": f"{emp.first_name} {emp.last_name}",
            "previous_gross": prev_gross,
            "new_gross": comp["gross_salary"],
            "net_salary": comp["net_salary"],
            "reason": salary_in.reason
        },
        ip_address=request.client.host if request.client else None
    )

    out = EmployeeSalaryOut.model_validate(emp_salary)
    out.employee_name = f"{emp.first_name} {emp.last_name}"
    out.employee_code = emp.employee_code
    out.department_name = emp.department.name if emp.department else None
    out.position = emp.designation
    out.total_deductions = comp["total_deductions"]
    out.salary_source = "INDIVIDUAL"
    return out

# ----------------- APPROVALS WORKFLOW -----------------

@router.get("/approvals", response_model=List[EmployeeSalaryOut])
def list_salary_approvals(
    status_filter: Optional[SalaryApprovalStatus] = None,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Lists pending, approved, and rejected salary adjustments"""
    query = db.query(EmployeeSalary)
    if status_filter:
        query = query.filter(EmployeeSalary.status == status_filter)

    records = query.order_by(EmployeeSalary.id.desc()).all()
    results = []
    for r in records:
        emp = r.employee
        out = EmployeeSalaryOut.model_validate(r)
        out.employee_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
        out.employee_code = emp.employee_code if emp else ""
        out.department_name = emp.department.name if emp and emp.department else None
        out.position = emp.designation if emp else ""
        out.total_deductions = round(r.pf_deduction + r.tax_deduction + r.professional_tax + r.other_deductions, 2)
        out.salary_source = "INDIVIDUAL"
        results.append(out)
    return results

@router.post("/approvals/{salary_id}", response_model=EmployeeSalaryOut)
def process_salary_approval(
    request: Request,
    salary_id: int,
    approval_in: SalaryApprovalRequest,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Approves or rejects a pending salary revision request"""
    salary_rec = db.query(EmployeeSalary).filter(EmployeeSalary.id == salary_id).first()
    if not salary_rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Salary revision request not found")

    emp = salary_rec.employee
    now = datetime.now(timezone.utc)

    if approval_in.approved:
        salary_rec.status = SalaryApprovalStatus.APPROVED
        salary_rec.approved_by = current_user.id
        salary_rec.approved_at = now
        salary_rec.rejection_reason = None

        if emp:
            emp.monthly_salary = salary_rec.gross_salary
            emp.allowances = salary_rec.other_allowances

        # Record in history
        record_salary_history(
            db=db,
            employee_id=salary_rec.employee_id,
            previous_gross_salary=emp.monthly_salary if emp else 0.0,
            new_gross_salary=salary_rec.gross_salary,
            previous_net_salary=0.0,
            new_net_salary=salary_rec.net_salary,
            reason=salary_rec.reason or "Approved salary revision",
            effective_date=salary_rec.effective_date,
            changed_by_user_id=current_user.id
        )

        action = "SALARY_APPROVED"
    else:
        salary_rec.status = SalaryApprovalStatus.REJECTED
        salary_rec.approved_by = current_user.id
        salary_rec.approved_at = now
        salary_rec.rejection_reason = approval_in.rejection_reason or "Rejected by HR"
        action = "SALARY_REJECTED"

    db.commit()
    db.refresh(salary_rec)

    log_audit(
        db=db,
        action=action,
        module="COMPENSATION",
        user=current_user,
        record_id=str(salary_rec.id),
        details={"status": salary_rec.status.value, "employee_id": salary_rec.employee_id},
        ip_address=request.client.host if request.client else None
    )

    out = EmployeeSalaryOut.model_validate(salary_rec)
    out.employee_name = f"{emp.first_name} {emp.last_name}" if emp else "Unknown"
    out.employee_code = emp.employee_code if emp else ""
    out.department_name = emp.department.name if emp and emp.department else None
    out.position = emp.designation if emp else ""
    out.total_deductions = round(salary_rec.pf_deduction + salary_rec.tax_deduction + salary_rec.professional_tax + salary_rec.other_deductions, 2)
    out.salary_source = "INDIVIDUAL"
    return out

# ----------------- SALARY HISTORY -----------------

@router.get("/employees/{employee_id}/history", response_model=List[SalaryHistoryOut])
def get_employee_salary_history(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves non-destructive chronological salary changes timeline for an employee"""
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Security check: employees can only view own history
    if current_user.role == UserRole.EMPLOYEE and emp.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    history = db.query(SalaryHistory).filter(
        SalaryHistory.employee_id == employee_id
    ).order_by(SalaryHistory.effective_date.desc(), SalaryHistory.id.desc()).all()

    results = []
    for h in history:
        out = SalaryHistoryOut.model_validate(h)
        out.employee_name = f"{emp.first_name} {emp.last_name}"
        out.employee_code = emp.employee_code
        out.changed_by_name = h.changed_by.email.split("@")[0].capitalize() if h.changed_by else "System"
        results.append(out)
    return results

# ----------------- AI SALARY RECOMMENDATION -----------------

@router.post("/ai-recommendation", response_model=AISalaryRecommendationOut)
def get_ai_salary_recommendation(
    req_in: AISalaryRecommendationRequest,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER)),
    db: Session = Depends(get_db)
):
    """Generates decision-support advisory AI salary recommendation based on non-sensitive parameters"""
    res = generate_ai_salary_recommendation(
        db=db,
        employee_id=req_in.employee_id,
        department_id=req_in.department_id,
        position_title=req_in.position_title,
        experience_years=req_in.experience_years,
        skills=req_in.skills
    )
    return AISalaryRecommendationOut(**res)

# ----------------- EMPLOYEE SELF SERVICE -----------------

@router.get("/my-salary", response_model=EmployeeSalaryOut)
def get_my_own_salary(
    current_employee: Optional[Employee] = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """Employee self-service endpoint for viewing active salary structure and components"""
    if not current_employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee profile not found")

    resolved = resolve_employee_effective_salary(db, current_employee)

    # Department benchmarks
    dept_min, dept_max = None, None
    if current_employee.department_id:
        d_rule = db.query(DepartmentSalaryRule).filter(
            DepartmentSalaryRule.department_id == current_employee.department_id,
            DepartmentSalaryRule.is_active == True
        ).first()
        if d_rule:
            dept_min, dept_max = d_rule.min_salary, d_rule.max_salary

    # Position benchmarks
    pos_min, pos_max, pos_default = None, None, None
    p_rule = db.query(PositionSalaryRule).filter(
        PositionSalaryRule.position_title.ilike(current_employee.designation.strip()),
        PositionSalaryRule.is_active == True
    ).first()
    if p_rule:
        pos_min, pos_max, pos_default = p_rule.min_salary, p_rule.max_salary, p_rule.default_salary

    latest_emp_sal = db.query(EmployeeSalary).filter(
        EmployeeSalary.employee_id == current_employee.id
    ).order_by(EmployeeSalary.id.desc()).first()

    return EmployeeSalaryOut(
        id=latest_emp_sal.id if latest_emp_sal else 0,
        employee_id=current_employee.id,
        employee_name=f"{current_employee.first_name} {current_employee.last_name}",
        employee_code=current_employee.employee_code,
        department_name=current_employee.department.name if current_employee.department else None,
        position=current_employee.designation,
        gross_salary=resolved["gross_salary"],
        basic_salary=resolved["basic_salary"],
        hra=resolved["hra"],
        transport_allowance=resolved["transport_allowance"],
        medical_allowance=resolved["medical_allowance"],
        other_allowances=resolved["other_allowances"],
        bonus=resolved["bonus"],
        pf_deduction=resolved["pf_deduction"],
        tax_deduction=resolved["tax_deduction"],
        professional_tax=resolved["professional_tax"],
        other_deductions=resolved["other_deductions"],
        total_deductions=round(resolved["pf_deduction"] + resolved["tax_deduction"] + resolved["professional_tax"] + resolved["other_deductions"], 2),
        net_salary=resolved["net_salary"],
        salary_type=resolved["salary_type"],
        effective_date=resolved["effective_date"],
        status=latest_emp_sal.status if latest_emp_sal else SalaryApprovalStatus.APPROVED,
        reason=latest_emp_sal.reason if latest_emp_sal else "Active salary structure",
        department_min_salary=dept_min,
        department_max_salary=dept_max,
        position_min_salary=pos_min,
        position_max_salary=pos_max,
        position_default_salary=pos_default,
        salary_source=resolved["source"],
        created_at=latest_emp_sal.created_at if latest_emp_sal else datetime.now(timezone.utc),
        updated_at=latest_emp_sal.updated_at if latest_emp_sal else datetime.now(timezone.utc)
    )
