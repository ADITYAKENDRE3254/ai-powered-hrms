import os
import sys
from datetime import date, datetime, timedelta, timezone

# Add parent directory to path so app modules import cleanly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.department import Department, Team
from app.models.employee import Employee, EmploymentStatus, Gender
from app.models.attendance import Attendance, VerificationStatus
from app.models.leave import LeaveRequest, LeaveBalance, LeaveType, LeaveStatus
from app.models.recruitment import Job, Candidate, JobStatus, CandidateStatus
from app.models.payroll import Payroll, PayrollItem, PayrollStatus
from app.models.notification import Notification, NotificationType
from app.models.setting import OfficeSetting
from app.services.pdf_service import generate_payslip_pdf

def seed_database():
    print("🌱 Initializing database tables and seeding demo data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@hrms.local").first():
            print("Database already contains seed data. Refreshing office settings and balances...")
            db.close()
            return

        # 1. Office Geofence Setting (Bangalore Tech Park)
        office = OfficeSetting(
            office_name="Bangalore Innovation Hub",
            latitude=12.9715987,
            longitude=77.5945627,
            geofence_radius=100.0
        )
        db.add(office)
        db.commit()

        # 2. Create User Accounts
        users_data = [
            ("admin@hrms.local", "Admin@123", UserRole.SUPER_ADMIN),
            ("hr@hrms.local", "Hr@123", UserRole.HR_MANAGER),
            ("deptmanager@hrms.local", "Manager@123", UserRole.DEPARTMENT_MANAGER),
            ("teamlead@hrms.local", "Leader@123", UserRole.TEAM_LEADER),
            ("recruiter@hrms.local", "Recruiter@123", UserRole.RECRUITER),
            ("employee@hrms.local", "Employee@123", UserRole.EMPLOYEE),
            ("candidate@hrms.local", "Candidate@123", UserRole.CANDIDATE),
            ("john.doe@hrms.local", "Employee@123", UserRole.EMPLOYEE),
            ("priya.sharma@hrms.local", "Employee@123", UserRole.EMPLOYEE),
            ("david.miller@hrms.local", "Employee@123", UserRole.EMPLOYEE),
        ]

        users = {}
        for email, pwd, role in users_data:
            u = User(
                email=email,
                hashed_password=get_password_hash(pwd),
                role=role,
                is_active=True
            )
            db.add(u)
            db.commit()
            db.refresh(u)
            users[email] = u

        # 3. Create Departments
        depts_data = [
            ("Engineering", "ENG", "Core software development, backend architecture, and platform engineering."),
            ("Artificial Intelligence & ML", "AIML", "Machine learning research, LLMs, computer vision, and neural systems."),
            ("Human Resources", "HR", "People operations, talent acquisition, culture, and employee welfare."),
            ("Finance", "FIN", "Financial planning, accounting, tax compliance, and payroll management."),
            ("Marketing", "MKT", "Digital branding, content strategy, SEO, and social engagement."),
            ("Sales", "SLS", "Enterprise client acquisition, B2B partnerships, and account growth."),
            ("Operations", "OPS", "Supply chain, logistical coordination, and business infrastructure.")
        ]

        depts = {}
        for name, code, desc in depts_data:
            d = Department(name=name, code=code, description=desc, is_active=True)
            db.add(d)
            db.commit()
            db.refresh(d)
            depts[code] = d

        # 4. Create Teams
        teams_data = [
            ("Backend Architecture Team", depts["ENG"].id),
            ("Frontend & Mobile Experience", depts["ENG"].id),
            ("Applied AI & NLP Team", depts["AIML"].id),
            ("Talent Operations Team", depts["HR"].id),
            ("Corporate Accounting", depts["FIN"].id),
            ("Digital Growth Team", depts["MKT"].id),
        ]

        teams = {}
        for name, d_id in teams_data:
            t = Team(name=name, department_id=d_id)
            db.add(t)
            db.commit()
            db.refresh(t)
            teams[name] = t

        # 5. Create Employees
        employees_data = [
            # Super Admin / Executive
            {
                "user_id": users["admin@hrms.local"].id,
                "code": "EMP-1000",
                "first_name": "Alexander",
                "last_name": "Vance",
                "email": "admin@hrms.local",
                "phone": "+91 9876543210",
                "gender": Gender.MALE,
                "dob": date(1985, 4, 12),
                "designation": "Chief Technology Officer / Super Admin",
                "dept_id": depts["ENG"].id,
                "team_id": teams["Backend Architecture Team"].id,
                "salary": 180000.0,
                "allowances": 20000.0,
                "joining": date(2020, 1, 15)
            },
            # HR Manager
            {
                "user_id": users["hr@hrms.local"].id,
                "code": "EMP-1001",
                "first_name": "Sarah",
                "last_name": "Jenkins",
                "email": "hr@hrms.local",
                "phone": "+91 9876543211",
                "gender": Gender.FEMALE,
                "dob": date(1990, 6, 22),
                "designation": "Head of Human Resources",
                "dept_id": depts["HR"].id,
                "team_id": teams["Talent Operations Team"].id,
                "salary": 110000.0,
                "allowances": 10000.0,
                "joining": date(2021, 3, 1)
            },
            # Department Manager (Engineering)
            {
                "user_id": users["deptmanager@hrms.local"].id,
                "code": "EMP-1002",
                "first_name": "Marcus",
                "last_name": "Sterling",
                "email": "deptmanager@hrms.local",
                "phone": "+91 9876543212",
                "gender": Gender.MALE,
                "dob": date(1988, 9, 14),
                "designation": "Director of Engineering",
                "dept_id": depts["ENG"].id,
                "team_id": teams["Backend Architecture Team"].id,
                "salary": 140000.0,
                "allowances": 15000.0,
                "joining": date(2021, 5, 10)
            },
            # Team Leader (Backend)
            {
                "user_id": users["teamlead@hrms.local"].id,
                "code": "EMP-1003",
                "first_name": "Vikram",
                "last_name": "Patel",
                "email": "teamlead@hrms.local",
                "phone": "+91 9876543213",
                "gender": Gender.MALE,
                "dob": date(1992, 11, 5),
                "designation": "Lead Backend Architect",
                "dept_id": depts["ENG"].id,
                "team_id": teams["Backend Architecture Team"].id,
                "salary": 95000.0,
                "allowances": 8000.0,
                "joining": date(2022, 2, 15)
            },
            # Recruiter
            {
                "user_id": users["recruiter@hrms.local"].id,
                "code": "EMP-1004",
                "first_name": "Elena",
                "last_name": "Rostova",
                "email": "recruiter@hrms.local",
                "phone": "+91 9876543214",
                "gender": Gender.FEMALE,
                "dob": date(1994, 2, 18),
                "designation": "Senior Talent Recruiter",
                "dept_id": depts["HR"].id,
                "team_id": teams["Talent Operations Team"].id,
                "salary": 75000.0,
                "allowances": 5000.0,
                "joining": date(2022, 8, 1)
            },
            # Employee (Software Engineer reporting to Vikram Patel & Marcus Sterling)
            {
                "user_id": users["employee@hrms.local"].id,
                "code": "EMP-1005",
                "first_name": "Ananya",
                "last_name": "Roy",
                "email": "employee@hrms.local",
                "phone": "+91 9876543215",
                "gender": Gender.FEMALE,
                "dob": date(1997, 8, 25),
                "designation": "Senior Full-Stack Engineer",
                "dept_id": depts["ENG"].id,
                "team_id": teams["Backend Architecture Team"].id,
                "salary": 70000.0,
                "allowances": 6000.0,
                "joining": date(2023, 1, 10)
            },
            # John Doe (AI Engineer)
            {
                "user_id": users["john.doe@hrms.local"].id,
                "code": "EMP-1006",
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@hrms.local",
                "phone": "+91 9876543216",
                "gender": Gender.MALE,
                "dob": date(1995, 3, 30),
                "designation": "AI/ML Systems Researcher",
                "dept_id": depts["AIML"].id,
                "team_id": teams["Applied AI & NLP Team"].id,
                "salary": 85000.0,
                "allowances": 7000.0,
                "joining": date(2023, 4, 1)
            },
            # Priya Sharma (Financial Analyst)
            {
                "user_id": users["priya.sharma@hrms.local"].id,
                "code": "EMP-1007",
                "first_name": "Priya",
                "last_name": "Sharma",
                "email": "priya.sharma@hrms.local",
                "phone": "+91 9876543217",
                "gender": Gender.FEMALE,
                "dob": date(1996, 12, 19),
                "designation": "Senior Financial Analyst",
                "dept_id": depts["FIN"].id,
                "team_id": teams["Corporate Accounting"].id,
                "salary": 68000.0,
                "allowances": 4000.0,
                "joining": date(2023, 6, 15)
            },
            # David Miller (Digital Marketing Lead)
            {
                "user_id": users["david.miller@hrms.local"].id,
                "code": "EMP-1008",
                "first_name": "David",
                "last_name": "Miller",
                "email": "david.miller@hrms.local",
                "phone": "+91 9876543218",
                "gender": Gender.MALE,
                "dob": date(1993, 7, 8),
                "designation": "Growth Marketing Specialist",
                "dept_id": depts["MKT"].id,
                "team_id": teams["Digital Growth Team"].id,
                "salary": 65000.0,
                "allowances": 5000.0,
                "joining": date(2023, 9, 1)
            }
        ]

        emps = {}
        for ed in employees_data:
            emp = Employee(
                user_id=ed["user_id"],
                employee_code=ed["code"],
                first_name=ed["first_name"],
                last_name=ed["last_name"],
                email=ed["email"],
                phone=ed["phone"],
                gender=ed["gender"],
                dob=ed["dob"],
                address="Tech Park Avenue, Bangalore, India",
                department_id=ed["dept_id"],
                team_id=ed["team_id"],
                designation=ed["designation"],
                joining_date=ed["joining"],
                monthly_salary=ed["salary"],
                tax_percentage=10.0,
                pf_percentage=12.0,
                allowances=ed["allowances"],
                employment_status=EmploymentStatus.ACTIVE
            )
            db.add(emp)
            db.commit()
            db.refresh(emp)
            emps[ed["email"]] = emp

            # Leave Balance
            bal = LeaveBalance(
                employee_id=emp.id,
                casual_leave=12.0,
                sick_leave=10.0,
                earned_leave=15.0,
                year=2026
            )
            db.add(bal)
            db.commit()

        # Link Department Managers and Team Leaders
        depts["ENG"].manager_id = emps["deptmanager@hrms.local"].id
        depts["HR"].manager_id = emps["hr@hrms.local"].id
        teams["Backend Architecture Team"].team_leader_id = emps["teamlead@hrms.local"].id
        db.commit()

        # Link Employee hierarchy
        emps["employee@hrms.local"].team_leader_id = emps["teamlead@hrms.local"].id
        emps["employee@hrms.local"].manager_id = emps["deptmanager@hrms.local"].id
        db.commit()

        # 6. Sample Attendance records for past 15 days
        today = date.today()
        for i in range(1, 15):
            att_date = today - timedelta(days=i)
            # Skip Sundays
            if att_date.weekday() == 6:
                continue

            for emp in emps.values():
                in_time = datetime(att_date.year, att_date.month, att_date.day, 9, 15, 0, tzinfo=timezone.utc)
                out_time = datetime(att_date.year, att_date.month, att_date.day, 18, 0, 0, tzinfo=timezone.utc)
                att = Attendance(
                    employee_id=emp.id,
                    date=att_date,
                    punch_in=in_time,
                    punch_out=out_time,
                    punch_in_lat=12.971600,
                    punch_in_lng=77.594560,
                    punch_out_lat=12.971600,
                    punch_out_lng=77.594560,
                    distance_in_meters=14.2,
                    verification_status=VerificationStatus.VERIFIED,
                    work_duration_hours=8.75,
                    notes="GPS verified on-site"
                )
                db.add(att)
        db.commit()

        # Today's live punch record for employee@hrms.local
        today_punch = Attendance(
            employee_id=emps["employee@hrms.local"].id,
            date=today,
            punch_in=datetime.now(timezone.utc) - timedelta(hours=3),
            punch_in_lat=12.971598,
            punch_in_lng=77.594563,
            distance_in_meters=5.8,
            verification_status=VerificationStatus.VERIFIED,
            notes="Live demo punch in"
        )
        db.add(today_punch)
        db.commit()

        # 7. Sample Leave Requests (Demonstrating all 3 workflows)
        # 1-Day Auto-Approved Leave
        l1 = LeaveRequest(
            employee_id=emps["employee@hrms.local"].id,
            leave_type=LeaveType.CASUAL,
            start_date=today + timedelta(days=5),
            end_date=today + timedelta(days=5),
            duration_days=1,
            reason="Personal appointment",
            status=LeaveStatus.APPROVED,
            approved_at=datetime.now(timezone.utc),
            approver_id=None
        )
        db.add(l1)

        # 2-Day Leave routed to Team Leader
        l2 = LeaveRequest(
            employee_id=emps["employee@hrms.local"].id,
            leave_type=LeaveType.SICK,
            start_date=today + timedelta(days=10),
            end_date=today + timedelta(days=11),
            duration_days=2,
            reason="Medical recovery and rest",
            status=LeaveStatus.PENDING_TL
        )
        db.add(l2)

        # 3-Day Leave routed to Department Manager / HR
        l3 = LeaveRequest(
            employee_id=emps["employee@hrms.local"].id,
            leave_type=LeaveType.EARNED,
            start_date=today + timedelta(days=20),
            end_date=today + timedelta(days=23),
            duration_days=4,
            reason="Family function and annual leave",
            status=LeaveStatus.PENDING_MANAGER
        )
        db.add(l3)
        db.commit()

        # 8. Sample Job Openings
        jobs_data = [
            {
                "title": "Senior Python & FastAPI Engineer",
                "dept_id": depts["ENG"].id,
                "desc": "Lead our cloud services backend architecture, building high-throughput microservices using FastAPI, SQLAlchemy, PostgreSQL, and Docker.",
                "skills": '["Python", "FastAPI", "SQL", "PostgreSQL", "Docker", "REST API", "Git"]',
                "exp": 3.0,
                "salary": "$80,000 - $110,000"
            },
            {
                "title": "Machine Learning & NLP Specialist",
                "dept_id": depts["AIML"].id,
                "desc": "Design and fine-tune NLP and GenAI pipelines with PyTorch, Scikit-Learn, Transformers, and vector search systems.",
                "skills": '["Python", "PyTorch", "Machine Learning", "NLP", "LLM", "Pandas", "Scikit-Learn"]',
                "exp": 2.0,
                "salary": "$90,000 - $125,000"
            },
            {
                "title": "Human Resources & Talent Lead",
                "dept_id": depts["HR"].id,
                "desc": "Manage talent acquisition, employee relations, onboarding, compensation, and performance management.",
                "skills": '["Talent Acquisition", "Recruitment", "Employee Relations", "Payroll Processing", "HR Policies"]',
                "exp": 3.0,
                "salary": "$65,000 - $85,000"
            },
            {
                "title": "Financial Analyst & Auditor",
                "dept_id": depts["FIN"].id,
                "desc": "Oversee corporate budgeting, financial modeling, tax planning, cash flow forecasting, and accounting operations.",
                "skills": '["Financial Modeling", "Accounting", "Budgeting", "Tally", "Excel", "GST"]',
                "exp": 2.0,
                "salary": "$60,000 - $80,000"
            }
        ]

        jobs = []
        for jd in jobs_data:
            j = Job(
                title=jd["title"],
                department_id=jd["dept_id"],
                description=jd["desc"],
                required_skills=jd["skills"],
                experience_required_years=jd["exp"],
                location="Bangalore / Hybrid",
                employment_type="Full-time",
                salary_range=jd["salary"],
                status=JobStatus.OPEN,
                created_by=users["recruiter@hrms.local"].id
            )
            db.add(j)
            db.commit()
            db.refresh(j)
            jobs.append(j)

        # 9. Sample Candidates with AI Matching
        candidates_data = [
            {
                "job_id": jobs[0].id,
                "user_id": users["candidate@hrms.local"].id,
                "first": "Aarav",
                "last": "Mehta",
                "email": "candidate@hrms.local",
                "phone": "+91 9988776655",
                "skills": '["Python", "FastAPI", "SQL", "PostgreSQL", "React", "Git"]',
                "matching": '["Python", "FastAPI", "SQL", "PostgreSQL", "Git"]',
                "missing": '["Docker"]',
                "score": 87.5,
                "exp": 3.5,
                "education": "B.Tech in Computer Science",
                "roles": '["Backend Developer", "Software Engineer"]',
                "dept": "Engineering",
                "summary": "Strong backend candidate with extensive FastAPI, SQL, and database experience. Missing Docker containerization proficiency. High candidate match score.",
                "status": CandidateStatus.AI_SCREENED
            },
            {
                "job_id": jobs[1].id,
                "user_id": None,
                "first": "Sophia",
                "last": "Chen",
                "email": "sophia.chen@example.com",
                "phone": "+1 415-555-0182",
                "skills": '["Python", "Machine Learning", "PyTorch", "NLP", "Pandas", "Scikit-Learn", "Deep Learning"]',
                "matching": '["Python", "PyTorch", "Machine Learning", "NLP", "Pandas", "Scikit-Learn"]',
                "missing": '["LLM"]',
                "score": 92.0,
                "exp": 4.0,
                "education": "Master of Science in Artificial Intelligence",
                "roles": '["ML Researcher", "Data Scientist"]',
                "dept": "Artificial Intelligence & ML",
                "summary": "Exceptional fit for AI/ML role with deep experience in PyTorch and NLP research.",
                "status": CandidateStatus.SHORTLISTED
            },
            {
                "job_id": jobs[2].id,
                "user_id": None,
                "first": "Rohan",
                "last": "Verma",
                "email": "rohan.verma@example.com",
                "phone": "+91 9811223344",
                "skills": '["Talent Acquisition", "Recruitment", "Employee Relations", "Onboarding"]',
                "matching": '["Talent Acquisition", "Recruitment", "Employee Relations"]',
                "missing": '["Payroll Processing", "HR Policies"]',
                "score": 76.0,
                "exp": 2.5,
                "education": "MBA in Human Resource Management",
                "roles": '["HR Executive", "Recruitment Specialist"]',
                "dept": "Human Resources",
                "summary": "Solid recruitment profile with strong talent acquisition skills.",
                "status": CandidateStatus.APPLIED
            }
        ]

        for cd in candidates_data:
            c = Candidate(
                job_id=cd["job_id"],
                user_id=cd["user_id"],
                first_name=cd["first"],
                last_name=cd["last"],
                email=cd["email"],
                phone=cd["phone"],
                extracted_skills=cd["skills"],
                matching_skills=cd["matching"],
                missing_skills=cd["missing"],
                match_score=cd["score"],
                experience_years=cd["exp"],
                education=cd["education"],
                previous_roles=cd["roles"],
                suggested_department=cd["dept"],
                ai_summary=cd["summary"],
                status=cd["status"]
            )
            db.add(c)
        db.commit()

        # 10. Sample Payroll Generation for Previous Month
        last_month = today.month - 1 if today.month > 1 else 12
        last_year = today.year if today.month > 1 else today.year - 1

        payroll = Payroll(
            month=last_month,
            year=last_year,
            total_working_days=22,
            status=PayrollStatus.PROCESSED,
            processed_by=users["hr@hrms.local"].id,
            notes="Standard monthly company-wide payroll processing"
        )
        db.add(payroll)
        db.commit()
        db.refresh(payroll)

        # Generate Payroll Items and PDF payslips for employees
        for emp in emps.values():
            per_day = round(emp.monthly_salary / 22.0, 2)
            present_days = 20
            leave_days = 2
            lwp_days = 0
            basic = emp.monthly_salary
            allowances = emp.allowances
            lwp_ded = 0.0
            pf_ded = round(basic * 0.12, 2)
            tax_ded = round(basic * 0.10, 2)
            total_earn = round(basic + allowances, 2)
            total_ded = round(lwp_ded + pf_ded + tax_ded, 2)
            net = round(total_earn - total_ded, 2)

            item = PayrollItem(
                payroll_id=payroll.id,
                employee_id=emp.id,
                monthly_salary=basic,
                working_days=22,
                present_days=present_days,
                approved_leave_days=leave_days,
                lwp_days=lwp_days,
                per_day_rate=per_day,
                basic_salary=basic,
                allowances=allowances,
                lwp_deduction=lwp_ded,
                pf_deduction=pf_ded,
                tax_deduction=tax_ded,
                other_deductions=0.0,
                total_earnings=total_earn,
                total_deductions=total_ded,
                net_salary=net
            )
            db.add(item)
            db.flush()

            # Generate real PDF payslip file
            try:
                generate_payslip_pdf(item, payroll, emp)
                item.payslip_url = f"/api/payslips/{item.id}/download"
            except Exception as e:
                print(f"Payslip PDF note: {e}")

        db.commit()

        # 11. Sample Notifications
        notifs = [
            (users["employee@hrms.local"].id, "Welcome to AI-HRMS", "Your employee account has been created. You can punch in with GPS and explore your dashboard.", NotificationType.GENERAL),
            (users["employee@hrms.local"].id, "Monthly Payslip Ready", f"Your payslip for {last_month:02d}/{last_year} has been processed and is ready for download.", NotificationType.PAYROLL),
            (users["teamlead@hrms.local"].id, "Pending Leave Request", "Ananya Roy submitted a 2-day sick leave request requiring your approval.", NotificationType.LEAVE),
            (users["hr@hrms.local"].id, "New Candidate Application", "Aarav Mehta applied for Senior Python & FastAPI Engineer (AI match: 87.5%).", NotificationType.RECRUITMENT),
        ]

        for uid, title, msg, ntype in notifs:
            db.add(Notification(user_id=uid, title=title, message=msg, type=ntype))
        db.commit()

        print("✅ Database successfully seeded with demo accounts, departments, employees, jobs, attendance, leaves, and payslips!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during seed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
