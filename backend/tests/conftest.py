import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.core.security import get_password_hash, create_access_token
from app.models.user import User, UserRole
from app.models.department import Department, Team
from app.models.employee import Employee, EmploymentStatus, Gender
from app.models.attendance import Attendance, VerificationStatus
from app.models.leave import LeaveRequest, LeaveBalance, LeaveType, LeaveStatus
from app.models.setting import OfficeSetting
from app.models.payroll import Payroll, PayrollItem, PayrollStatus
from app.models.recruitment import Job, Candidate, JobStatus, CandidateStatus
from datetime import date, datetime, timezone

# Use PostgreSQL for tests (or SQLite if PG not available)
SQLALCHEMY_TEST_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/ai_hrms_test"
# Fallback to SQLite if PostgreSQL is unavailable
try:
    engine = create_engine(
        SQLALCHEMY_TEST_DATABASE_URL,
        connect_args={"connect_timeout": 2},
        echo=False
    )
    # Test connection
    with engine.connect() as conn:
        pass
except Exception:
    # Fallback to SQLite
    SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_hrms.db"
    engine = create_engine(
        SQLALCHEMY_TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def seed_test_data(db):
    # Office
    office = OfficeSetting(
        office_name="Test Bangalore Hub",
        latitude=12.9715987,
        longitude=77.5945627,
        geofence_radius=100.0
    )
    db.add(office)

    # Users
    admin_user = User(email="admin_test@hrms.local", hashed_password=get_password_hash("Admin@123"), role=UserRole.SUPER_ADMIN, is_active=True)
    hr_user = User(email="hr_test@hrms.local", hashed_password=get_password_hash("Hr@123"), role=UserRole.HR_MANAGER, is_active=True)
    mgr_user = User(email="mgr_test@hrms.local", hashed_password=get_password_hash("Manager@123"), role=UserRole.DEPARTMENT_MANAGER, is_active=True)
    tl_user = User(email="tl_test@hrms.local", hashed_password=get_password_hash("Leader@123"), role=UserRole.TEAM_LEADER, is_active=True)
    emp_user = User(email="emp_test@hrms.local", hashed_password=get_password_hash("Employee@123"), role=UserRole.EMPLOYEE, is_active=True)
    emp_other_user = User(email="emp_other_test@hrms.local", hashed_password=get_password_hash("Employee@123"), role=UserRole.EMPLOYEE, is_active=True)

    db.add_all([admin_user, hr_user, mgr_user, tl_user, emp_user, emp_other_user])
    db.commit()

    # Department & Team
    dept = Department(name="Engineering Test", code="ENGT", is_active=True)
    db.add(dept)
    db.commit()

    team = Team(name="Core Backend Test", department_id=dept.id)
    db.add(team)
    db.commit()

    # Employees
    mgr_emp = Employee(
        user_id=mgr_user.id, employee_code="EMP-MGR", first_name="Marcus", last_name="Mgr",
        email="mgr_test@hrms.local", designation="Director", department_id=dept.id,
        joining_date=date(2022, 1, 1), monthly_salary=120000.0, employment_status=EmploymentStatus.ACTIVE
    )
    tl_emp = Employee(
        user_id=tl_user.id, employee_code="EMP-TL", first_name="Vikram", last_name="Lead",
        email="tl_test@hrms.local", designation="Team Leader", department_id=dept.id, team_id=team.id,
        joining_date=date(2022, 2, 1), monthly_salary=90000.0, employment_status=EmploymentStatus.ACTIVE
    )
    emp = Employee(
        user_id=emp_user.id, employee_code="EMP-001", first_name="Ananya", last_name="Roy",
        email="emp_test@hrms.local", designation="Software Engineer", department_id=dept.id, team_id=team.id,
        manager_id=None, team_leader_id=None,
        joining_date=date(2023, 1, 1), monthly_salary=66000.0, tax_percentage=10.0, pf_percentage=12.0, allowances=4000.0,
        employment_status=EmploymentStatus.ACTIVE
    )
    emp_other = Employee(
        user_id=emp_other_user.id, employee_code="EMP-002", first_name="Other", last_name="User",
        email="emp_other_test@hrms.local", designation="Software Engineer", department_id=dept.id, team_id=team.id,
        joining_date=date(2023, 1, 1), monthly_salary=55000.0, tax_percentage=10.0, pf_percentage=12.0, allowances=2000.0,
        employment_status=EmploymentStatus.ACTIVE
    )

    db.add_all([mgr_emp, tl_emp, emp, emp_other])
    db.commit()

    # Link hierarchy
    dept.manager_id = mgr_emp.id
    team.team_leader_id = tl_emp.id
    emp.team_leader_id = tl_emp.id
    emp.manager_id = mgr_emp.id
    db.commit()

    return {
        "admin_user": admin_user,
        "hr_user": hr_user,
        "mgr_user": mgr_user,
        "tl_user": tl_user,
        "emp_user": emp_user,
        "emp_other_user": emp_other_user,
        "emp": emp,
        "emp_other": emp_other,
        "dept": dept,
        "team": team
    }
