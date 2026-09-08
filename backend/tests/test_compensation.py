import pytest
from datetime import date, timedelta
from app.core.security import create_access_token, get_password_hash
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
from app.models.audit import AuditLog
from app.services.compensation_service import (
    calculate_salary_components,
    resolve_employee_effective_salary,
    generate_ai_salary_recommendation
)

def auth_header(user_id: int, role: str):
    token = create_access_token(subject=user_id, role=role)
    return {"Authorization": f"Bearer {token}"}

class TestSalaryAndCompensationModule:
    
    def test_department_salary_configuration(self, client, seed_test_data, db):
        hr_user = seed_test_data["hr_user"]
        dept = seed_test_data["dept"]
        headers = auth_header(hr_user.id, "HR_MANAGER")

        # 1. Create/Configure Department Salary Rule
        res = client.post(
            "/api/compensation/departments",
            json={
                "department_id": dept.id,
                "min_salary": 30000.0,
                "max_salary": 90000.0,
                "currency": "INR",
                "notes": "Engineering compensation band 2026"
            },
            headers=headers
        )
        assert res.status_code == 201
        data = res.json()
        assert data["department_id"] == dept.id
        assert data["min_salary"] == 30000.0
        assert data["max_salary"] == 90000.0

        # 2. List department rules
        list_res = client.get("/api/compensation/departments", headers=headers)
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 1

    def test_position_salary_configuration(self, client, seed_test_data, db):
        hr_user = seed_test_data["hr_user"]
        dept = seed_test_data["dept"]
        headers = auth_header(hr_user.id, "HR_MANAGER")

        # 1. Create Position Salary Rule
        res = client.post(
            "/api/compensation/positions",
            json={
                "department_id": dept.id,
                "position_title": "Senior Software Engineer",
                "min_salary": 60000.0,
                "max_salary": 110000.0,
                "default_salary": 80000.0,
                "salary_type": "MONTHLY",
                "notes": "Senior dev market benchmark"
            },
            headers=headers
        )
        assert res.status_code == 201
        data = res.json()
        assert data["position_title"] == "Senior Software Engineer"
        assert data["default_salary"] == 80000.0

        # 2. Validation: Min cannot exceed max
        invalid_res = client.post(
            "/api/compensation/positions",
            json={
                "department_id": dept.id,
                "position_title": "Lead Architect",
                "min_salary": 150000.0,
                "max_salary": 100000.0,
                "default_salary": 120000.0
            },
            headers=headers
        )
        assert invalid_res.status_code == 400

    def test_salary_components_calculation(self):
        # Gross = 80,000
        comp = calculate_salary_components(
            gross_salary=80000.0,
            basic_salary=40000.0,
            hra=16000.0,
            transport_allowance=4000.0,
            medical_allowance=3000.0,
            bonus=2000.0,
            pf_deduction=4800.0,
            tax_deduction=8000.0,
            professional_tax=200.0
        )
        assert comp["gross_salary"] == 80000.0
        assert comp["basic_salary"] == 40000.0
        assert comp["hra"] == 16000.0
        assert comp["transport_allowance"] == 4000.0
        assert comp["medical_allowance"] == 3000.0
        assert comp["bonus"] == 2000.0
        # other_allowances = 80000 - (40000 + 16000 + 4000 + 3000 + 2000) = 15000
        assert comp["other_allowances"] == 15000.0
        assert comp["total_deductions"] == (4800.0 + 8000.0 + 200.0)
        assert comp["net_salary"] == round(80000.0 - 13000.0, 2)

    def test_salary_priority_resolution_hierarchy(self, client, seed_test_data, db):
        # Create fresh employee for priority hierarchy test
        user = User(email="priority.test@hrms.local", hashed_password=get_password_hash("Pass@123"), role=UserRole.EMPLOYEE, is_active=True)
        db.add(user)
        db.commit()
        db.refresh(user)

        dept = Department(name="R&D Department Test", code="RNDT", is_active=True)
        db.add(dept)
        db.commit()
        db.refresh(dept)

        emp = Employee(
            user_id=user.id,
            employee_code="EMP-PRIORITY",
            first_name="Priority",
            last_name="Tester",
            email=user.email,
            designation="AI Research Engineer",
            department_id=dept.id,
            joining_date=date.today() - timedelta(days=365),
            monthly_salary=50000.0,
            employment_status=EmploymentStatus.ACTIVE
        )
        db.add(emp)
        db.commit()
        db.refresh(emp)

        hr_user = seed_test_data["hr_user"]
        headers = auth_header(hr_user.id, "HR_MANAGER")

        # Step A: No specific rules -> Fallback to Employee Base
        res_a = resolve_employee_effective_salary(db, emp)
        assert res_a["source"] == "EMPLOYEE_DEFAULT"
        assert res_a["gross_salary"] == 50000.0

        # Step B: Add Department Rule -> Department Priority overrides Employee Default
        dept_rule = DepartmentSalaryRule(
            department_id=dept.id,
            min_salary=40000.0,
            max_salary=60000.0,
            is_active=True,
            effective_date=date.today() - timedelta(days=10)
        )
        db.add(dept_rule)
        db.commit()

        res_b = resolve_employee_effective_salary(db, emp)
        assert res_b["source"] == "DEPARTMENT"
        assert res_b["gross_salary"] == 50000.0  # Average of 40k and 60k

        # Step C: Add Position Rule -> Position Priority overrides Department Rule
        pos_rule = PositionSalaryRule(
            department_id=dept.id,
            position_title="AI Research Engineer",
            min_salary=60000.0,
            max_salary=90000.0,
            default_salary=75000.0,
            is_active=True,
            effective_date=date.today() - timedelta(days=5)
        )
        db.add(pos_rule)
        db.commit()

        res_c = resolve_employee_effective_salary(db, emp)
        assert res_c["source"] == "POSITION"
        assert res_c["gross_salary"] == 75000.0

        # Step D: Configure Individual Employee Salary -> Individual overrides Position & Department
        client.post(
            f"/api/compensation/employees/{emp.id}",
            json={
                "employee_id": emp.id,
                "gross_salary": 85000.0,
                "reason": "Top performer merit adjustment",
                "effective_date": str(date.today())
            },
            headers=headers
        )

        res_d = resolve_employee_effective_salary(db, emp)
        assert res_d["source"] == "INDIVIDUAL"
        assert res_d["gross_salary"] == 85000.0

    def test_salary_history_preservation(self, client, seed_test_data, db):
        user = User(email="hist.test@hrms.local", hashed_password=get_password_hash("Pass@123"), role=UserRole.EMPLOYEE, is_active=True)
        db.add(user)
        db.commit()
        db.refresh(user)

        dept = seed_test_data["dept"]
        emp = Employee(
            user_id=user.id,
            employee_code="EMP-HIST",
            first_name="History",
            last_name="Tester",
            email=user.email,
            designation="Backend Developer",
            department_id=dept.id,
            joining_date=date.today() - timedelta(days=200),
            monthly_salary=60000.0,
            employment_status=EmploymentStatus.ACTIVE
        )
        db.add(emp)
        db.commit()
        db.refresh(emp)

        hr_user = seed_test_data["hr_user"]
        headers = auth_header(hr_user.id, "HR_MANAGER")

        # Initial salary configuration (65,000)
        res1 = client.post(
            f"/api/compensation/employees/{emp.id}",
            json={
                "employee_id": emp.id,
                "gross_salary": 65000.0,
                "reason": "Starting CTC"
            },
            headers=headers
        )
        assert res1.status_code == 201

        # Increment salary (72,000)
        res2 = client.post(
            f"/api/compensation/employees/{emp.id}",
            json={
                "employee_id": emp.id,
                "gross_salary": 72000.0,
                "reason": "Annual increment"
            },
            headers=headers
        )
        assert res2.status_code == 201

        # Query history
        hist_res = client.get(f"/api/compensation/employees/{emp.id}/history", headers=headers)
        assert hist_res.status_code == 200
        records = hist_res.json()
        assert len(records) == 2
        latest = records[0]
        assert latest["new_gross_salary"] == 72000.0
        assert latest["previous_gross_salary"] == 65000.0
        assert latest["change_amount"] == 7000.0
        assert latest["change_percentage"] == round((7000.0 / 65000.0) * 100.0, 2)
        assert latest["reason"] == "Annual increment"

    def test_salary_approval_workflow(self, client, seed_test_data, db):
        user = User(email="approval.test@hrms.local", hashed_password=get_password_hash("Pass@123"), role=UserRole.EMPLOYEE, is_active=True)
        db.add(user)
        db.commit()
        db.refresh(user)

        dept = seed_test_data["dept"]
        emp = Employee(
            user_id=user.id,
            employee_code="EMP-APPR",
            first_name="Approval",
            last_name="Tester",
            email=user.email,
            designation="Dev Specialist",
            department_id=dept.id,
            joining_date=date.today() - timedelta(days=100),
            monthly_salary=50000.0,
            employment_status=EmploymentStatus.ACTIVE
        )
        db.add(emp)
        db.commit()
        db.refresh(emp)

        hr_user = seed_test_data["hr_user"]
        headers = auth_header(hr_user.id, "HR_MANAGER")

        # Create a pending salary revision directly
        pending_salary = EmployeeSalary(
            employee_id=emp.id,
            gross_salary=95000.0,
            basic_salary=47500.0,
            net_salary=80000.0,
            status=SalaryApprovalStatus.PENDING,
            reason="Proposed promotion increment",
            effective_date=date.today()
        )
        db.add(pending_salary)
        db.commit()
        db.refresh(pending_salary)

        # 1. Verify pending status in approvals list
        app_list = client.get("/api/compensation/approvals?status_filter=PENDING", headers=headers)
        assert app_list.status_code == 200
        assert any(r["id"] == pending_salary.id for r in app_list.json())

        # 2. Verify priority engine ignores PENDING salary
        resolved = resolve_employee_effective_salary(db, emp)
        assert resolved["gross_salary"] != 95000.0

        # 3. Approve salary revision
        approve_res = client.post(
            f"/api/compensation/approvals/{pending_salary.id}",
            json={"approved": True, "notes": "Approved by HR Director"},
            headers=headers
        )
        assert approve_res.status_code == 200
        assert approve_res.json()["status"] == "APPROVED"

        # 4. Now priority engine uses the approved 95k salary
        resolved_after = resolve_employee_effective_salary(db, emp)
        assert resolved_after["gross_salary"] == 95000.0

    def test_ai_salary_recommendation_logic(self, client, seed_test_data, db):
        hr_user = seed_test_data["hr_user"]
        dept = seed_test_data["dept"]
        headers = auth_header(hr_user.id, "HR_MANAGER")

        # Configure position rule benchmark
        pos_rule = PositionSalaryRule(
            department_id=dept.id,
            position_title="DevOps Engineer",
            min_salary=50000.0,
            max_salary=90000.0,
            default_salary=65000.0,
            is_active=True
        )
        db.add(pos_rule)
        db.commit()

        # 1. Recommendation with sufficient data
        res = client.post(
            "/api/compensation/ai-recommendation",
            json={
                "department_id": dept.id,
                "position_title": "DevOps Engineer",
                "experience_years": 4.5,
                "skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform"]
            },
            headers=headers
        )
        assert res.status_code == 200
        data = res.json()
        assert data["is_insufficient_data"] is False
        assert 50000.0 <= data["recommended_salary"] <= 90000.0
        assert data["confidence_score"] >= 75.0
        assert len(data["factors"]) >= 2

        # 2. Recommendation with insufficient data -> Does not invent numbers
        no_data_res = client.post(
            "/api/compensation/ai-recommendation",
            json={
                "position_title": "Unknown Nonexistent Position 999",
                "experience_years": 0.0,
                "skills": []
            },
            headers=headers
        )
        assert no_data_res.status_code == 200
        no_data = no_data_res.json()
        assert no_data["is_insufficient_data"] is True
        assert "Insufficient data" in no_data["explanation"]

    def test_rbac_security_boundaries(self, client, seed_test_data, db):
        emp_user = seed_test_data["emp_user"]
        other_user = seed_test_data["emp_other_user"]
        emp = seed_test_data["emp"]
        emp_other = seed_test_data["emp_other"]

        emp_headers = auth_header(emp_user.id, "EMPLOYEE")

        # 1. Employee accessing own salary -> 200 OK
        own_res = client.get(f"/api/compensation/employees/{emp.id}", headers=emp_headers)
        assert own_res.status_code == 200

        # 2. Employee self-service /my-salary -> 200 OK
        my_res = client.get("/api/compensation/my-salary", headers=emp_headers)
        assert my_res.status_code == 200

        # 3. Employee attempting to access other employee's salary -> 403 Forbidden
        other_res = client.get(f"/api/compensation/employees/{emp_other.id}", headers=emp_headers)
        assert other_res.status_code == 403

        # 4. Employee attempting to configure salary -> 403 Forbidden
        hack_res = client.post(
            f"/api/compensation/employees/{emp.id}",
            json={"employee_id": emp.id, "gross_salary": 999999.0},
            headers=emp_headers
        )
        assert hack_res.status_code == 403
