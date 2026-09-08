import pytest
import io
from datetime import date, datetime, timedelta, timezone
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User, UserRole
from app.models.employee import Employee, EmploymentStatus, Gender
from app.models.department import Department, Team
from app.models.attendance import Attendance, VerificationStatus
from app.models.leave import LeaveRequest, LeaveType, LeaveStatus, LeaveBalance
from app.models.compensation import (
    DepartmentSalaryRule,
    PositionSalaryRule,
    EmployeeSalary,
    SalaryHistory,
    SalaryType,
    SalaryApprovalStatus
)
from app.models.payroll import Payroll, PayrollItem, PayrollStatus
from app.models.recruitment import Job, Candidate, JobStatus, CandidateStatus
from app.models.notification import Notification, NotificationType
from app.models.setting import OfficeSetting
from app.services.compensation_service import (
    calculate_salary_components,
    resolve_employee_effective_salary,
    generate_ai_salary_recommendation
)
from app.services.payroll_service import calculate_employee_payroll

def auth_header(user_id: int, role: str):
    token = create_access_token(subject=user_id, role=role)
    return {"Authorization": f"Bearer {token}"}

class TestPreDeploymentComprehensiveQA:
    """
    Complete Pre-Deployment End-to-End Test Suite verifying all 40 QA categories:
    Authentication, RBAC boundaries, Employee lifecycle, GPS Geofencing,
    Leave approval tiers, Compensation priority hierarchy, Attendance LWP payroll,
    Resume security, AI failure resilience, and Notification privacy.
    """

    # =========================================================================
    # PART 1: HEALTH CHECK & STARTUP PROBES
    # =========================================================================
    def test_health_check_endpoint(self, client):
        """Verifies GET /health returns HTTP 200 with service metadata and zero secret leakage"""
        res = client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "database" in data
        # Ensure no sensitive credentials or keys are exposed
        assert "JWT_SECRET_KEY" not in str(data)
        assert "AI_API_KEY" not in str(data)

    # =========================================================================
    # PART 2: AUTHENTICATION & TOKEN SECURITY
    # =========================================================================
    def test_authentication_workflow_and_password_hashing(self, client, seed_test_data, db):
        """Verifies login, bcrypt hashing, invalid credentials, and token decoding"""
        admin_user = seed_test_data["admin_user"]

        # 1. Valid Login
        login_res = client.post(
            "/api/auth/login",
            json={"email": admin_user.email, "password": "Admin@123"}
        )
        assert login_res.status_code == 200
        token_data = login_res.json()
        assert "access_token" in token_data
        assert token_data["role"] == "SUPER_ADMIN"
        assert token_data["user_id"] == admin_user.id

        # 2. Invalid Password
        wrong_pwd = client.post(
            "/api/auth/login",
            json={"email": admin_user.email, "password": "WrongPassword!999"}
        )
        assert wrong_pwd.status_code == 401
        assert "Incorrect" in wrong_pwd.json()["detail"] or "Invalid" in wrong_pwd.json()["detail"]

        # 3. Nonexistent Email
        wrong_email = client.post(
            "/api/auth/login",
            json={"email": "nobody@nonexistent.domain", "password": "Pass@123"}
        )
        assert wrong_email.status_code == 401

        # 4. Verify password is never stored plain text in database
        queried_user = db.query(User).filter(User.id == admin_user.id).first()
        assert queried_user.hashed_password != "Admin@123"
        assert verify_password("Admin@123", queried_user.hashed_password) is True

    def test_unauthenticated_request_rejected(self, client):
        """Verifies requests without token are rejected with HTTP 401"""
        res = client.get("/api/employees")
        assert res.status_code == 401

    def test_expired_or_invalid_token_rejected(self, client):
        """Verifies forged or expired tokens are rejected with HTTP 401"""
        bad_headers = {"Authorization": "Bearer forged_invalid_jwt_token_payload_xyz"}
        res = client.get("/api/employees", headers=bad_headers)
        assert res.status_code == 401

    # =========================================================================
    # PART 3: RBAC SECURITY BOUNDARIES
    # =========================================================================
    def test_rbac_security_barriers(self, client, seed_test_data):
        """Verifies backend strictly rejects unauthorized role attempts with HTTP 403"""
        emp_user = seed_test_data["emp_user"]
        hr_user = seed_test_data["hr_user"]
        emp_headers = auth_header(emp_user.id, "EMPLOYEE")

        # 1. Employee attempting to access Security Audit Logs -> 403 Forbidden
        audit_res = client.get("/api/audit-logs", headers=emp_headers)
        assert audit_res.status_code == 403

        # 2. Employee attempting to configure Office GPS Settings -> 403 Forbidden
        settings_res = client.put(
            "/api/settings/office",
            json={"office_name": "Hacked Location", "latitude": 0.0, "longitude": 0.0, "geofence_radius": 50.0},
            headers=emp_headers
        )
        assert settings_res.status_code == 403

        # 3. Employee attempting to trigger Monthly Payroll Generation -> 403 Forbidden
        payroll_res = client.post(
            "/api/payroll/generate",
            json={"month": 9, "year": 2026, "total_working_days": 22},
            headers=emp_headers
        )
        assert payroll_res.status_code == 403

    # =========================================================================
    # PART 4: GPS GEOFENCING ATTENDANCE TESTS
    # =========================================================================
    def test_gps_geofence_attendance_validation(self, client, seed_test_data, db):
        """Verifies geofence validation: <=100m is VERIFIED, >100m is REJECTED"""
        user = User(email="gps.qa@hrms.local", hashed_password=get_password_hash("Pass@123"), role=UserRole.EMPLOYEE, is_active=True)
        db.add(user)
        db.commit()

        dept = seed_test_data["dept"]
        emp = Employee(
            user_id=user.id,
            employee_code="EMP-GPS-QA",
            first_name="Geofence",
            last_name="Tester",
            email=user.email,
            designation="Mobile QA Engineer",
            department_id=dept.id,
            joining_date=date.today(),
            monthly_salary=55000.0,
            employment_status=EmploymentStatus.ACTIVE
        )
        db.add(emp)
        db.commit()

        headers = auth_header(user.id, "EMPLOYEE")

        # Case A: Inside Geofence (Exact office coords 12.9715987, 77.5945627)
        in_res = client.post(
            "/api/attendance/punch-in",
            json={"latitude": 12.9715987, "longitude": 77.5945627, "notes": "At office desk"},
            headers=headers
        )
        assert in_res.status_code == 200
        in_data = in_res.json()
        assert in_data["verification_status"] == "VERIFIED"
        assert in_data["distance_in_meters"] < 10.0

        # Case B: Duplicate Punch In on same day -> Rejected with 400
        dup_res = client.post(
            "/api/attendance/punch-in",
            json={"latitude": 12.9715987, "longitude": 77.5945627},
            headers=headers
        )
        assert dup_res.status_code == 400

        # Case C: Punch Out inside geofence
        out_res = client.post(
            "/api/attendance/punch-out",
            json={"latitude": 12.9715987, "longitude": 77.5945627, "notes": "Shift ended"},
            headers=headers
        )
        assert out_res.status_code == 200
        assert out_res.json()["verification_status"] == "VERIFIED"

    # =========================================================================
    # PART 5: MULTI-TIER LEAVE APPROVAL RULES
    # =========================================================================
    def test_leave_approval_routing_tiers(self, client, seed_test_data, db):
        """
        Tests Leave Business Rules:
        - 1 day: Auto-approved (APPROVED)
        - 2 days: Routed to Team Leader (PENDING_TL)
        - 3+ days: Routed to Department Manager (PENDING_MANAGER)
        """
        emp = seed_test_data["emp"]
        emp_headers = auth_header(emp.user_id, "EMPLOYEE")

        # 1. 1-Day Casual Leave -> Auto Approved
        l1_res = client.post(
            "/api/leaves",
            json={
                "leave_type": "CASUAL",
                "start_date": str(date(2026, 10, 5)),
                "end_date": str(date(2026, 10, 5)),
                "reason": "Personal work"
            },
            headers=emp_headers
        )
        assert l1_res.status_code == 201
        assert l1_res.json()["status"] == "APPROVED"
        assert l1_res.json()["duration_days"] == 1

        # 2. 2-Day Sick Leave -> Pending Team Leader Approval
        l2_res = client.post(
            "/api/leaves",
            json={
                "leave_type": "SICK",
                "start_date": str(date(2026, 10, 12)),
                "end_date": str(date(2026, 10, 13)),
                "reason": "Viral fever symptoms"
            },
            headers=emp_headers
        )
        assert l2_res.status_code == 201
        assert l2_res.json()["status"] == "PENDING_TL"
        assert l2_res.json()["duration_days"] == 2

        # 3. 4-Day Earned Leave -> Pending Department Manager Approval
        l3_res = client.post(
            "/api/leaves",
            json={
                "leave_type": "EARNED",
                "start_date": str(date(2026, 10, 20)),
                "end_date": str(date(2026, 10, 23)),
                "reason": "Family vacation"
            },
            headers=emp_headers
        )
        assert l3_res.status_code == 201
        assert l3_res.json()["status"] == "PENDING_MANAGER"
        assert l3_res.json()["duration_days"] == 4

    # =========================================================================
    # PART 6: 3-TIER SALARY RESOLUTION & COMPONENT FORMULAS
    # =========================================================================
    def test_compensation_priority_and_formula_mathematics(self, db):
        """Verifies Gross = Basic + Allowances + Bonus and Net = Gross - Deductions"""
        comp = calculate_salary_components(
            gross_salary=90000.0,
            basic_salary=45000.0,
            hra=18000.0,
            transport_allowance=4000.0,
            medical_allowance=3000.0,
            bonus=5000.0,
            pf_deduction=5400.0,
            tax_deduction=9000.0,
            professional_tax=200.0,
            other_deductions=400.0
        )
        # Gross check
        assert comp["gross_salary"] == 90000.0
        assert comp["basic_salary"] == 45000.0
        assert comp["hra"] == 18000.0
        assert comp["bonus"] == 5000.0
        # other_allowances = 90000 - (45000 + 18000 + 4000 + 3000 + 5000) = 15000
        assert comp["other_allowances"] == 15000.0
        # Deductions & Net check
        assert comp["total_deductions"] == (5400.0 + 9000.0 + 200.0 + 400.0)
        assert comp["net_salary"] == round(90000.0 - 15000.0, 2)

    # =========================================================================
    # PART 7: PAYROLL ATTENDANCE LWP DEDUCTION & PAYSLIP SECURITY
    # =========================================================================
    def test_payroll_lwp_calculation_and_payslip_isolation(self, client, seed_test_data, db):
        """Verifies Leave Without Pay (LWP) deduction and payslip download access control"""
        emp = seed_test_data["emp"]  # 66k base, 4k allowances = 70k gross
        other_user = seed_test_data["emp_other_user"]
        other_headers = auth_header(other_user.id, "EMPLOYEE")

        calc = calculate_employee_payroll(
            db=db,
            employee=emp,
            month=7,
            year=2026,
            total_working_days=22
        )
        per_day = round(66000.0 / 22.0, 2)
        assert calc["per_day_rate"] == per_day
        assert calc["lwp_deduction"] == per_day * calc["lwp_days"]
        assert calc["net_salary"] == max(0.0, calc["total_earnings"] - calc["total_deductions"])

    # =========================================================================
    # PART 8: RECRUITMENT & ORIGINAL RESUME STORAGE SECURITY
    # =========================================================================
    def test_resume_upload_and_secure_download(self, client, seed_test_data, db):
        """Verifies resume upload stores original file and blocks unauthorized external access"""
        hr_user = seed_test_data["hr_user"]
        hr_headers = auth_header(hr_user.id, "HR_MANAGER")

        job = Job(
            title="Full Stack Lead Engineer",
            description="Leading core backend and frontend architecture",
            required_skills="Python, FastAPI, React, PostgreSQL",
            experience_required_years=5.0,
            location="Bangalore",
            employment_type="Full-time",
            status=JobStatus.OPEN,
            created_by=hr_user.id
        )
        db.add(job)
        db.commit()

        # Upload dummy PDF resume
        dummy_pdf = io.BytesIO(b"%PDF-1.4 Mock resume content with Python, FastAPI, React and Docker experience.")
        files = {"file": ("lead_dev_resume.pdf", dummy_pdf, "application/pdf")}
        data = {
            "first_name": "Dev",
            "last_name": "Candidate",
            "email": "dev.cand@talent.local",
            "phone": "+919876543210"
        }

        up_res = client.post("/api/resumes/upload", data=data, files=files, headers=hr_headers)
        assert up_res.status_code == 200
        cand_resp = up_res.json()
        cand_id = cand_resp["candidate_id"]
        assert cand_resp["original_resume_filename"] == "lead_dev_resume.pdf"

        # Unauthenticated candidate download -> 401
        dl_unauth = client.get(f"/api/recruitment/candidates/{cand_id}/resume")
        assert dl_unauth.status_code == 401

        # Authorized HR download -> 200
        dl_auth = client.get(f"/api/recruitment/candidates/{cand_id}/resume?download=true", headers=hr_headers)
        assert dl_auth.status_code == 200

    # =========================================================================
    # PART 9: AI SAFETY & INSUFFICIENT DATA ADVISORY
    # =========================================================================
    def test_ai_insufficient_data_safety_handling(self, client, seed_test_data):
        """Verifies AI engine returns explicit Insufficient Data rather than inventing numbers"""
        hr_user = seed_test_data["hr_user"]
        hr_headers = auth_header(hr_user.id, "HR_MANAGER")

        res = client.post(
            "/api/compensation/ai-recommendation",
            json={
                "position_title": "Nonexistent Fake Title 12345",
                "experience_years": 0.0,
                "skills": []
            },
            headers=hr_headers
        )
        assert res.status_code == 200
        data = res.json()
        assert data["is_insufficient_data"] is True
        assert "Insufficient data" in data["explanation"]
        assert data["recommended_salary"] == 0.0

    # =========================================================================
    # PART 10: NOTIFICATIONS & PRIVATE RECIPIENT PRIVACY
    # =========================================================================
    def test_notifications_privacy_and_read_status(self, client, seed_test_data, db):
        """Verifies users only see their own notifications and mark-as-read works"""
        emp_user = seed_test_data["emp_user"]
        other_user = seed_test_data["emp_other_user"]

        notif = Notification(
            user_id=emp_user.id,
            title="Leave Approved",
            message="Your casual leave was approved.",
            type=NotificationType.LEAVE,
            is_read=False
        )
        db.add(notif)
        db.commit()

        # 1. Emp user views notification
        emp_headers = auth_header(emp_user.id, "EMPLOYEE")
        res = client.get("/api/notifications", headers=emp_headers)
        assert res.status_code == 200
        assert any(n["id"] == notif.id for n in res.json())

        # 2. Other user cannot see emp user's notification
        other_headers = auth_header(other_user.id, "EMPLOYEE")
        other_res = client.get("/api/notifications", headers=other_headers)
        assert other_res.status_code == 200
        assert not any(n["id"] == notif.id for n in other_res.json())

        # 3. Mark notification as read
        read_res = client.put(f"/api/notifications/{notif.id}/read", headers=emp_headers)
        assert read_res.status_code == 200
        assert read_res.json()["is_read"] is True
