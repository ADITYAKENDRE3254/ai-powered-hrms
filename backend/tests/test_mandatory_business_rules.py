import pytest
from datetime import date, timedelta
from app.core.security import create_access_token
from app.models.leave import LeaveStatus
from app.models.attendance import VerificationStatus
from app.services.attendance_service import calculate_haversine_distance
from app.services.payroll_service import calculate_employee_payroll
from app.services.ai_service import parse_resume_text, match_candidate_to_job

def auth_header(user_id: int, role: str):
    token = create_access_token(subject=user_id, role=role)
    return {"Authorization": f"Bearer {token}"}

# ============================================================
# MANDATORY TEST 1: 1-Day Leave -> Auto-Approved
# ============================================================
def test_1_day_leave_auto_approved(client, seed_test_data):
    emp_user = seed_test_data["emp_user"]
    headers = auth_header(emp_user.id, "EMPLOYEE")

    start = date.today() + timedelta(days=1)
    response = client.post(
        "/api/leaves",
        json={
            "leave_type": "CASUAL",
            "start_date": str(start),
            "end_date": str(start),  # 1 day
            "reason": "1-day dental checkup"
        },
        headers=headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["duration_days"] == 1
    assert data["status"] == "APPROVED"  # Auto-approved

# ============================================================
# MANDATORY TEST 2: 2-Day Leave -> Team Leader Approval
# ============================================================
def test_2_day_leave_routed_to_team_leader(client, seed_test_data):
    emp_user = seed_test_data["emp_user"]
    tl_user = seed_test_data["tl_user"]

    start = date.today() + timedelta(days=3)
    end = date.today() + timedelta(days=4)

    # Submit 2-day leave
    response = client.post(
        "/api/leaves",
        json={
            "leave_type": "SICK",
            "start_date": str(start),
            "end_date": str(end),  # 2 days
            "reason": "Flu and viral fever"
        },
        headers=auth_header(emp_user.id, "EMPLOYEE")
    )

    assert response.status_code == 201
    data = response.json()
    assert data["duration_days"] == 2
    assert data["status"] == "PENDING_TL"  # Routed to TL

    # Team Leader approves it
    leave_id = data["id"]
    approve_resp = client.put(
        f"/api/leaves/{leave_id}/approve",
        headers=auth_header(tl_user.id, "TEAM_LEADER")
    )
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "APPROVED"

# ============================================================
# MANDATORY TEST 3: 3+ Day Leave -> Manager / HR Approval
# ============================================================
def test_3_plus_day_leave_routed_to_manager(client, seed_test_data):
    emp_user = seed_test_data["emp_user"]
    mgr_user = seed_test_data["mgr_user"]

    start = date.today() + timedelta(days=7)
    end = date.today() + timedelta(days=10)

    # Submit 4-day leave
    response = client.post(
        "/api/leaves",
        json={
            "leave_type": "EARNED",
            "start_date": str(start),
            "end_date": str(end),  # 4 days
            "reason": "Family vacation"
        },
        headers=auth_header(emp_user.id, "EMPLOYEE")
    )

    assert response.status_code == 201
    data = response.json()
    assert data["duration_days"] == 4
    assert data["status"] == "PENDING_MANAGER"  # Routed to Manager

    # Department Manager approves it
    leave_id = data["id"]
    approve_resp = client.put(
        f"/api/leaves/{leave_id}/approve",
        headers=auth_header(mgr_user.id, "DEPARTMENT_MANAGER")
    )
    assert approve_resp.status_code == 200
    assert approve_resp.json()["status"] == "APPROVED"

# ============================================================
# MANDATORY TEST 4: Employee Accessing HR-Only API -> 403 Forbidden
# ============================================================
def test_employee_accessing_hr_only_api_forbidden(client, seed_test_data):
    emp_user = seed_test_data["emp_user"]
    headers = auth_header(emp_user.id, "EMPLOYEE")

    # Payroll list endpoint (HR/Admin only)
    resp1 = client.get("/api/payroll", headers=headers)
    assert resp1.status_code == 403

    # Audit logs endpoint (HR/Admin only)
    resp2 = client.get("/api/audit-logs", headers=headers)
    assert resp2.status_code == 403

# ============================================================
# MANDATORY TEST 5: Employee Outside 100m -> Attendance Rejected
# ============================================================
def test_attendance_rejected_outside_geofence(client, seed_test_data):
    emp_user = seed_test_data["emp_user"]
    headers = auth_header(emp_user.id, "EMPLOYEE")

    # Office is at (12.9715987, 77.5945627). Coordinate 5 km away:
    outside_lat = 12.935000
    outside_lng = 77.620000

    dist = calculate_haversine_distance(outside_lat, outside_lng, 12.9715987, 77.5945627)
    assert dist > 100.0

    response = client.post(
        "/api/attendance/punch-in",
        json={"latitude": outside_lat, "longitude": outside_lng, "notes": "Punch from remote coffee shop"},
        headers=headers
    )
    assert response.status_code == 400
    assert "Attendance Rejected" in response.json()["detail"]

# ============================================================
# MANDATORY TEST 6: Employee Inside 100m -> Attendance Accepted
# ============================================================
def test_attendance_accepted_inside_geofence(client, seed_test_data):
    emp_user = seed_test_data["emp_user"]
    headers = auth_header(emp_user.id, "EMPLOYEE")

    # Coordinate ~10m from office
    inside_lat = 12.971600
    inside_lng = 77.594563

    dist = calculate_haversine_distance(inside_lat, inside_lng, 12.9715987, 77.5945627)
    assert dist <= 100.0

    response = client.post(
        "/api/attendance/punch-in",
        json={"latitude": inside_lat, "longitude": inside_lng, "notes": "Office Desk punch"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["verification_status"] == "VERIFIED"
    assert data["distance_in_meters"] <= 100.0

# ============================================================
# MANDATORY TEST 7: Payroll with LWP -> Correct Deduction
# ============================================================
def test_payroll_calculation_with_lwp(db, seed_test_data):
    emp = seed_test_data["emp"]  # Monthly salary: 66,000, Allowances: 4,000, PF: 12%, Tax: 10%
    working_days = 22

    # Monthly salary 66,000 / 22 working days = 3,000 per-day rate
    # Zero attendance records created in DB for next month -> 0 present days -> 22 LWP days
    calc = calculate_employee_payroll(
        db=db,
        employee=emp,
        month=8,
        year=2026,
        total_working_days=working_days
    )

    per_day_rate = round(66000.0 / 22.0, 2)
    assert calc["per_day_rate"] == 3000.0
    assert calc["lwp_days"] == 22
    assert calc["lwp_deduction"] == 3000.0 * 22  # 66,000 deduction
    assert calc["basic_salary"] == 66000.0
    assert calc["total_earnings"] == 70000.0  # 66,000 + 4,000 allowances

# ============================================================
# MANDATORY TEST 8: Employee Cannot Access Another's Payslip
# ============================================================
def test_employee_cannot_download_another_employee_payslip(client, db, seed_test_data):
    emp = seed_test_data["emp"]
    emp_other = seed_test_data["emp_other"]
    emp_user = seed_test_data["emp_user"]

    # Create dummy payroll & payroll item for emp_other
    from app.models.payroll import Payroll, PayrollItem, PayrollStatus
    payroll = Payroll(month=5, year=2026, total_working_days=22, status=PayrollStatus.PROCESSED)
    db.add(payroll)
    db.commit()

    item_other = PayrollItem(
        payroll_id=payroll.id,
        employee_id=emp_other.id,
        monthly_salary=55000.0,
        working_days=22,
        present_days=20,
        approved_leave_days=2,
        lwp_days=0,
        per_day_rate=2500.0,
        basic_salary=55000.0,
        allowances=2000.0,
        lwp_deduction=0.0,
        pf_deduction=6600.0,
        tax_deduction=5500.0,
        other_deductions=0.0,
        total_earnings=57000.0,
        total_deductions=12100.0,
        net_salary=44900.0
    )
    db.add(item_other)
    db.commit()
    db.refresh(item_other)

    # Employee 1 tries to download Employee 2's payslip
    response = client.get(
        f"/api/payslips/{item_other.id}/download",
        headers=auth_header(emp_user.id, "EMPLOYEE")
    )
    assert response.status_code == 403  # Forbidden

# ============================================================
# TEST 9: AI Resume Parser & Matcher
# ============================================================
def test_ai_resume_parser_and_matching():
    sample_resume = """
    Jane Smith
    Email: jane.smith@example.com
    Phone: +1 555-123-4567
    Experience: 4 years of experience as a Software Engineer.
    Education: Bachelor of Technology in Computer Science.
    Skills: Python, FastAPI, React, SQL, Docker, Machine Learning, Git.
    """

    parsed = parse_resume_text(sample_resume)
    assert parsed["candidate_name"] == "Jane Smith"
    assert parsed["email"] == "jane.smith@example.com"
    assert "Python" in parsed["skills"]
    assert "FastAPI" in parsed["skills"]
    assert parsed["experience_years"] == 4.0

    match_res = match_candidate_to_job(
        candidate_skills=parsed["skills"],
        candidate_exp=parsed["experience_years"],
        job_required_skills_str='{"skills": ["Python", "FastAPI", "SQL", "PostgreSQL", "Kubernetes"]}',
        job_required_exp=3.0,
        job_title="Senior Backend Engineer"
    )

    assert match_res["match_score"] > 60.0
    assert "Python" in match_res["matching_skills"]
    assert "Kubernetes" in match_res["missing_skills"]
