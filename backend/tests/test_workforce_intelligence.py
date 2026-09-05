import pytest
from fastapi.testclient import TestClient
from datetime import date, datetime, timezone
from app.core.security import create_access_token
from app.models.employee_skill import SkillCategory, Skill, EmployeeSkill, SkillLevel, SkillSource
from app.models.training import TrainingProgram, TrainingAssignment, TrainingDifficulty, AssignmentStatus
from app.models.attendance import Attendance, VerificationStatus
from app.models.user import UserRole
from app.ai.performance_predictor import predict_employee_performance
from app.ai.attrition_predictor import predict_employee_attrition
from app.ai.skill_gap_analyzer import analyze_employee_skill_gaps
from app.ai.skill_predictor import predict_future_skills
from app.ai.training_recommender import recommend_training_for_employee
from app.services.ai_service import handle_ai_hr_assistant_chat

def get_auth_headers(user):
    token = create_access_token(subject=str(user.id), role=user.role.value)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def seed_workforce_data(db, seed_test_data):
    data = seed_test_data
    emp = data["emp"]

    # Skill Categories & Skills
    cat = SkillCategory(name="Engineering & Backend", description="Core engineering skills")
    db.add(cat)
    db.commit()

    s1 = Skill(name="Python", category_id=cat.id)
    s2 = Skill(name="FastAPI", category_id=cat.id)
    s3 = Skill(name="Docker", category_id=cat.id)
    s4 = Skill(name="PostgreSQL", category_id=cat.id)
    db.add_all([s1, s2, s3, s4])
    db.commit()

    # Employee Skills for emp
    es1 = EmployeeSkill(employee_id=emp.id, skill_id=s1.id, skill_name="Python", skill_level=SkillLevel.ADVANCED, confidence=90, source=SkillSource.PROFILE)
    es2 = EmployeeSkill(employee_id=emp.id, skill_id=s2.id, skill_name="FastAPI", skill_level=SkillLevel.INTERMEDIATE, confidence=85, source=SkillSource.PROFILE)
    db.add_all([es1, es2])
    db.commit()

    # Attendance history for data sufficiency
    for d in [1, 2, 3, 4, 5]:
        att = Attendance(
            employee_id=emp.id,
            date=date(2023, 5, d),
            punch_in=datetime(2023, 5, d, 9, 0, tzinfo=timezone.utc),
            punch_out=datetime(2023, 5, d, 18, 0, tzinfo=timezone.utc),
            verification_status=VerificationStatus.VERIFIED,
            distance_in_meters=10.0,
            work_duration_hours=9.0
        )
        db.add(att)
    db.commit()

    # Training program
    t_prog = TrainingProgram(
        title="Docker & Containerization Accelerator",
        description="Master containerization for backend systems",
        skill_name="Docker",
        skill_id=s3.id,
        category_id=cat.id,
        difficulty=TrainingDifficulty.INTERMEDIATE,
        duration_hours=12,
        provider="Internal Academy",
        deadline_days=30,
        is_active=True
    )
    db.add(t_prog)
    db.commit()

    return {
        **data,
        "cat": cat,
        "skills": [s1, s2, s3, s4],
        "training_program": t_prog
    }

class TestWorkforceIntelligenceAI:
    def test_performance_predictor_engine(self, db, seed_workforce_data):
        emp = seed_workforce_data["emp"]
        prediction = predict_employee_performance(db, emp)
        assert prediction["is_data_sufficient"] is True
        assert 0 <= prediction["score"] <= 100
        assert prediction["prediction_category"] in ["HIGH", "MEDIUM", "NEEDS_ATTENTION"]
        assert len(prediction["positive_factors"]) > 0 or len(prediction["attention_factors"]) > 0
        assert len(prediction["recommended_actions"]) > 0
        assert prediction["model_version"] == "perf-rf-v1.2"

    def test_performance_data_insufficiency_guard(self, db, seed_test_data):
        emp = seed_test_data["emp_other"]
        # emp_other has no attendance records and we test when tenure < 14
        emp.joining_date = date.today()
        db.commit()
        prediction = predict_employee_performance(db, emp)
        assert prediction["is_data_sufficient"] is False
        assert prediction["prediction_category"] == "INSUFFICIENT_DATA"
        assert "insufficient" in prediction["explanation"].lower()

    def test_attrition_predictor_engine(self, db, seed_workforce_data):
        emp = seed_workforce_data["emp"]
        prediction = predict_employee_attrition(db, emp)
        assert prediction["is_data_sufficient"] is True
        assert 0 <= prediction["risk_score"] <= 100
        assert prediction["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
        assert len(prediction["main_factors"]) > 0
        assert len(prediction["protective_factors"]) > 0
        assert len(prediction["recommended_interventions"]) > 0
        assert prediction["model_version"] == "attr-gb-v1.1"

    def test_skill_gap_analysis(self, db, seed_workforce_data):
        emp = seed_workforce_data["emp"]
        gaps = analyze_employee_skill_gaps(db, emp, target_role="Senior Full-Stack Engineer")
        assert "Python" in gaps["matched_skills"] or "FastAPI" in gaps["matched_skills"]
        assert len(gaps["missing_skills"]) > 0
        assert 0 <= gaps["gap_percentage"] <= 100
        assert gaps["priority"] in ["HIGH", "MEDIUM", "LOW"]

    def test_future_skills_prediction(self, db, seed_workforce_data):
        emp = seed_workforce_data["emp"]
        future = predict_future_skills(db, emp)
        assert len(future["predicted_skills"]) > 0
        assert future["career_path"] is not None
        assert 0 <= future["confidence"] <= 100
        assert len(future["reason"]) > 0

    def test_training_recommendation_engine(self, db, seed_workforce_data):
        emp = seed_workforce_data["emp"]
        recs = recommend_training_for_employee(db, emp)
        assert isinstance(recs, list)
        if len(recs) > 0:
            assert recs[0]["training_name"] == "Docker & Containerization Accelerator"
            assert recs[0]["priority"] in ["HIGH", "MEDIUM", "LOW"]

class TestWorkforceIntelligenceAPIRoutes:
    def test_get_dashboard_summary_as_hr(self, client, seed_workforce_data):
        headers = get_auth_headers(seed_workforce_data["hr_user"])
        res = client.get("/api/workforce-intelligence/dashboard", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "total_employees" in data
        assert "average_performance_score" in data
        assert "average_attrition_risk" in data
        assert "performance_distribution" in data

    def test_get_employee_performance_as_admin(self, client, seed_workforce_data):
        emp = seed_workforce_data["emp"]
        headers = get_auth_headers(seed_workforce_data["admin_user"])
        res = client.get(f"/api/workforce-intelligence/employees/{emp.id}/performance", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["employee_id"] == emp.id
        assert "score" in data

    def test_get_employee_attrition_as_hr(self, client, seed_workforce_data):
        emp = seed_workforce_data["emp"]
        headers = get_auth_headers(seed_workforce_data["hr_user"])
        res = client.get(f"/api/workforce-intelligence/employees/{emp.id}/attrition", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "risk_score" in data
        assert "risk_level" in data

    def test_employee_forbidden_from_viewing_attrition(self, client, seed_workforce_data):
        emp = seed_workforce_data["emp"]
        headers = get_auth_headers(seed_workforce_data["emp_user"])
        # Employee cannot access attrition endpoints (ethical and privacy boundary)
        res = client.get(f"/api/workforce-intelligence/employees/{emp.id}/attrition", headers=headers)
        assert res.status_code == 403

    def test_employee_my_insights_route(self, client, seed_workforce_data):
        headers = get_auth_headers(seed_workforce_data["emp_user"])
        res = client.get("/api/workforce-intelligence/my-insights", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["employee_id"] == seed_workforce_data["emp"].id
        assert "performance" in data
        assert "skills" in data
        assert "skill_gaps" in data
        assert "future_skills" in data
        assert "recommended_trainings" in data

    def test_department_manager_scoped_analytics(self, client, seed_workforce_data):
        dept = seed_workforce_data["dept"]
        headers = get_auth_headers(seed_workforce_data["mgr_user"])
        res = client.get(f"/api/workforce-intelligence/departments/{dept.id}/analytics", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["department_id"] == dept.id
        assert "headcount" in data
        assert "average_performance" in data

class TestTrainingModuleAPIRoutes:
    def test_create_and_list_training_programs(self, client, seed_workforce_data):
        headers = get_auth_headers(seed_workforce_data["hr_user"])
        # Create
        payload = {
            "title": "Kubernetes Orchestration Pro",
            "description": "Production Kubernetes deployments",
            "skill_name": "Kubernetes",
            "difficulty": "ADVANCED",
            "duration_hours": 16,
            "provider": "Cloud Native Academy",
            "deadline_days": 45,
            "is_active": True
        }
        create_res = client.post("/api/training", json=payload, headers=headers)
        assert create_res.status_code == 201
        created = create_res.json()
        assert created["title"] == payload["title"]

        # List
        list_res = client.get("/api/training", headers=headers)
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 2

    def test_assign_and_track_training_progress(self, client, seed_workforce_data):
        hr_headers = get_auth_headers(seed_workforce_data["hr_user"])
        emp_headers = get_auth_headers(seed_workforce_data["emp_user"])
        emp = seed_workforce_data["emp"]
        t_prog = seed_workforce_data["training_program"]

        # Assign training
        assign_payload = {
            "training_id": t_prog.id,
            "employee_ids": [emp.id],
            "deadline": "2026-12-31"
        }
        assign_res = client.post("/api/training/assign", json=assign_payload, headers=hr_headers)
        assert assign_res.status_code == 201
        assignments = assign_res.json()
        assert len(assignments) == 1
        assign_id = assignments[0]["id"]

        # Employee views my assignments
        my_res = client.get("/api/training/my-assignments", headers=emp_headers)
        assert my_res.status_code == 200
        assert len(my_res.json()) >= 1

        # Employee updates progress to 100% and completed with certificate
        prog_payload = {
            "progress_percentage": 100,
            "status": "COMPLETED",
            "certificate_url": "https://certificates.org/verify/docker-12345"
        }
        update_res = client.put(f"/api/training/assignments/{assign_id}/progress", json=prog_payload, headers=emp_headers)
        assert update_res.status_code == 200
        updated = update_res.json()
        assert updated["progress_percentage"] == 100
        assert updated["status"] == "COMPLETED"
        assert updated["certificate_url"] == prog_payload["certificate_url"]

class TestAIHRAssistantWorkforceQA:
    def test_assistant_skill_and_training_qa(self, db, seed_workforce_data):
        emp_user = seed_workforce_data["emp_user"]
        
        # Test skill query
        res1 = handle_ai_hr_assistant_chat(db, emp_user, "What are my current verified skills?")
        reply1 = res1.get("reply", "")
        assert "skill" in reply1.lower() or "python" in reply1.lower() or "fastapi" in reply1.lower()

        # Test training query
        res2 = handle_ai_hr_assistant_chat(db, emp_user, "What trainings are recommended for me?")
        reply2 = res2.get("reply", "")
        assert "training" in reply2.lower() or "docker" in reply2.lower() or "course" in reply2.lower()

    def test_assistant_privacy_boundary(self, db, seed_workforce_data):
        emp_user = seed_workforce_data["emp_user"]
        # Employee querying another employee's performance or salary should trigger privacy boundary
        res = handle_ai_hr_assistant_chat(db, emp_user, "What is the performance score and salary of Marcus?")
        reply = res.get("reply", "")
        assert "privacy" in reply.lower() or "security" in reply.lower() or "authorized" in reply.lower()
