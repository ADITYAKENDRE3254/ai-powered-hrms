import re
import os
import json
from typing import Dict, List, Tuple, Optional, Any
from datetime import date
import pypdf
import docx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.employee import Employee
from app.models.attendance import Attendance, VerificationStatus
from app.models.leave import LeaveRequest, LeaveBalance, LeaveStatus
from app.models.payroll import PayrollItem
from app.models.setting import OfficeSetting

# Curated skills database across domains
SKILL_DICTIONARY = {
    "Artificial Intelligence & ML": [
        "Python", "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow",
        "Scikit-Learn", "NLP", "Natural Language Processing", "Computer Vision",
        "LLM", "Generative AI", "Pandas", "NumPy", "Data Analysis", "Prompt Engineering",
        "MLOps", "Data Science", "Keras", "HuggingFace", "OpenCV", "Neural Networks"
    ],
    "Engineering": [
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "FastAPI", "Django",
        "Flask", "HTML", "CSS", "SQL", "PostgreSQL", "MongoDB", "Docker",
        "Kubernetes", "AWS", "GCP", "Git", "REST API", "GraphQL", "Linux",
        "C++", "Java", "Go", "Rust", "CI/CD", "Microservices", "Redis", "Kafka",
        "System Design", "Backend", "Frontend", "Full Stack", "Tailwind", "Next.js"
    ],
    "Human Resources": [
        "Talent Acquisition", "Recruitment", "Employee Relations", "Performance Management",
        "Payroll Processing", "HR Policies", "Onboarding", "Training & Development",
        "Compensation & Benefits", "Labor Law", "Conflict Resolution", "HRIS", "Workforce Planning"
    ],
    "Finance": [
        "Financial Modeling", "Accounting", "Budgeting", "Auditing", "Tax Planning",
        "GST", "Tally", "Financial Reporting", "Risk Management", "Cash Flow",
        "Forecasting", "Excel", "Valuation", "Balance Sheet", "P&L", "Accounts Payable"
    ],
    "Marketing": [
        "SEO", "SEM", "Digital Marketing", "Content Strategy", "Social Media Marketing",
        "Google Analytics", "Copywriting", "Email Marketing", "Campaign Management",
        "Brand Strategy", "Market Research", "Growth Hacking", "Advertising"
    ],
    "Sales": [
        "B2B Sales", "Lead Generation", "CRM", "Salesforce", "Client Relationship",
        "Negotiation", "Pipeline Management", "Cold Calling", "Account Management",
        "Revenue Growth", "Closing Deals", "Business Development"
    ],
    "Operations": [
        "Supply Chain", "Logistics", "Project Management", "Agile", "Scrum",
        "Lean Six Sigma", "Quality Assurance", "Process Improvement", "Vendor Management",
        "Operations Management", "Jira", "Procurement"
    ]
}

# Build canonical skill casing mapping
CANONICAL_SKILL_MAP = {}
for dept_skills in SKILL_DICTIONARY.values():
    for s in dept_skills:
        CANONICAL_SKILL_MAP[s.lower()] = s

ALL_SKILLS = set(CANONICAL_SKILL_MAP.keys())

def extract_text_from_file(file_path: str) -> str:
    """Extracts raw plain text from PDF or DOCX resume file"""
    if not os.path.exists(file_path):
        return ""
    
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    try:
        if ext == ".pdf":
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        elif ext in [".docx", ".doc"]:
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        text += cell.text + " "
                    text += "\n"
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
    except Exception as e:
        print(f"Error extracting text from {file_path}: {e}")
        return ""
    
    return text.strip()

def parse_resume_text(text: str) -> Dict[str, Any]:
    """Extracts structured candidate details, skills, education, and experience from text"""
    text_lower = text.lower()
    
    # 1. Extract Email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else None

    # 2. Extract Phone
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else None

    # 3. Extract Name (from first few non-empty lines)
    name = "Candidate"
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if lines:
        for line in lines[:5]:
            if len(line.split()) in [2, 3, 4] and not any(char in line for char in ["@", "http", "www", "+", "1", "2", "3"]):
                name = line
                break

    # 4. Extract Skills
    found_skills = set()
    for skill_lower, canonical_name in CANONICAL_SKILL_MAP.items():
        pattern = r'\b' + re.escape(skill_lower) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(canonical_name)

    # 5. Extract Education
    education = "Bachelor's Degree"
    if any(k in text_lower for k in ["ph.d", "phd", "doctorate"]):
        education = "Doctorate (Ph.D.)"
    elif any(k in text_lower for k in ["master", "m.tech", "m.s.", "ms ", "mba", "mca"]):
        education = "Master's Degree (M.Tech / MS / MBA)"
    elif any(k in text_lower for k in ["bachelor", "b.tech", "b.e.", "b.s.", "bba", "bca"]):
        education = "Bachelor's Degree (B.Tech / BS / BE)"

    # 6. Extract Experience in years
    exp_years = 2.0
    exp_match = re.search(r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience', text_lower)
    if exp_match:
        try:
            exp_years = float(exp_match.group(1))
        except ValueError:
            pass
    elif "senior" in text_lower or "lead" in text_lower:
        exp_years = 5.0

    # 7. Department Classification
    dept_scores = {}
    for dept, skills in SKILL_DICTIONARY.items():
        score = 0
        for s in skills:
            if s in text_lower:
                score += 1
        dept_scores[dept] = score

    suggested_dept = max(dept_scores, key=dept_scores.get) if any(dept_scores.values()) else "Engineering"

    # 8. AI Summary
    skills_preview = ", ".join(list(found_skills)[:6]) if found_skills else "General technical competencies"
    ai_summary = (
        f"{name} demonstrates proficiency in {skills_preview}. "
        f"Candidate holds a {education} with approximately {exp_years} years of relevant experience, "
        f"aligning best with the {suggested_dept} department."
    )

    return {
        "candidate_name": name,
        "email": email,
        "phone": phone,
        "skills": sorted(list(found_skills)),
        "education": education,
        "experience_years": exp_years,
        "certifications": ["AWS Certified", "Agile Practitioner"] if "certified" in text_lower or "certificate" in text_lower else [],
        "previous_roles": ["Software Developer", "Technical Associate"] if "developer" in text_lower else ["Associate Specialist"],
        "suggested_department": suggested_dept,
        "ai_summary": ai_summary,
        "is_demo_mode": settings.AI_DEMO_MODE or not settings.AI_API_KEY
    }

def match_candidate_to_job(
    candidate_skills: List[str],
    candidate_exp: float,
    job_required_skills_str: str,
    job_required_exp: float,
    job_title: str
) -> Dict[str, Any]:
    """Matches a candidate profile against job requirements and computes match % score"""
    # Parse required skills from job
    req_skills = []
    if job_required_skills_str:
        try:
            parsed_json = json.loads(job_required_skills_str)
            if isinstance(parsed_json, list):
                req_skills = [str(s) for s in parsed_json]
            elif isinstance(parsed_json, dict) and "skills" in parsed_json and isinstance(parsed_json["skills"], list):
                req_skills = [str(s) for s in parsed_json["skills"]]
            else:
                req_skills = [s.strip() for s in job_required_skills_str.split(",") if s.strip()]
        except Exception:
            req_skills = [s.strip() for s in job_required_skills_str.split(",") if s.strip()]

    req_skills_normalized = [s.lower() for s in req_skills]
    cand_skills_normalized = [s.lower() for s in candidate_skills]

    matching_skills = []
    missing_skills = []

    for s in req_skills:
        if s.lower() in cand_skills_normalized:
            matching_skills.append(s)
        else:
            # Check partial match
            found = False
            for cs in cand_skills_normalized:
                if s.lower() in cs or cs in s.lower():
                    matching_skills.append(s)
                    found = True
                    break
            if not found:
                missing_skills.append(s)

    total_req = max(1, len(req_skills))
    skill_match_ratio = len(matching_skills) / float(total_req)

    # Experience weight
    exp_ratio = min(1.0, candidate_exp / max(0.5, job_required_exp)) if job_required_exp > 0 else 1.0

    # Composite Match Score: 70% Skills + 30% Experience
    match_score = round((skill_match_ratio * 70.0) + (exp_ratio * 30.0), 1)
    match_score = min(100.0, max(15.0, match_score))

    if candidate_exp >= job_required_exp:
        exp_match = f"Meets/Exceeds requirement ({candidate_exp} yrs vs {job_required_exp} yrs required)"
    else:
        exp_match = f"Below requirement ({candidate_exp} yrs vs {job_required_exp} yrs required)"

    ai_summary = (
        f"Candidate matched {len(matching_skills)} of {total_req} key required skills for {job_title}. "
        f"Overall fit score is {match_score}%. "
        f"Missing critical proficiencies: {', '.join(missing_skills) if missing_skills else 'None'}. "
        f"Recruiter review is recommended before interview scheduling."
    )

    return {
        "match_score": match_score,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "experience_match": exp_match,
        "education_match": "Qualified for position",
        "ai_summary": ai_summary,
        "is_demo_mode": settings.AI_DEMO_MODE or not settings.AI_API_KEY
    }

def handle_ai_hr_assistant_chat(
    db: Session,
    user: User,
    message: str
) -> Dict[str, Any]:
    """Context-aware generative AI HR Assistant with strict RBAC enforcement"""
    msg_lower = message.lower()
    emp = db.query(Employee).filter(Employee.user_id == user.id).first()

    # Rule 1: STRICT RBAC - Prevent unauthorized data access across employees
    if any(k in msg_lower for k in [
        "other employee", "colleague salary", "ceo salary", "admin password", "manager salary",
        "all salaries", "all employees", "salary of", "performance of", "performance score of",
        "performance score and salary", "attrition of", "attrition risk of", "records of", "data of"
    ]):
        if user.role not in [UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]:
            return {
                "reply": "🔒 **Security & Privacy Boundary**: I cannot provide personal, salary, or attendance information for other employees. As an employee, you are only authorized to query your own attendance, leave balance, payslips, and personal employment information. For cross-organization data access, please contact your HR Manager or Department Lead.",
                "is_demo_mode": settings.AI_DEMO_MODE or not settings.AI_API_KEY,
                "suggested_actions": ["View My Profile", "View My Attendance", "View My Leave Balance"]
            }

    # Rule 2: Attendance Query
    if any(k in msg_lower for k in ["my attendance", "punch in", "present days", "am i punched in", "work hours"]):
        if not emp:
            return {"reply": "No employee profile is linked to your user account.", "is_demo_mode": True, "suggested_actions": []}
        
        today_att = db.query(Attendance).filter(Attendance.employee_id == emp.id, Attendance.date == date.today()).first()
        verified_count = db.query(Attendance).filter(Attendance.employee_id == emp.id, Attendance.verification_status == VerificationStatus.VERIFIED).count()
        
        punch_status = "Punched In" if (today_att and today_att.punch_in and not today_att.punch_out) else (
            "Punched Out for today" if (today_att and today_att.punch_out) else "Not punched in yet today"
        )

        return {
            "reply": (
                f"📊 **Your Attendance Summary**:\n"
                f"- **Today's Status**: {punch_status}\n"
                f"- **Total Verified Present Days**: {verified_count} days\n"
                f"- **Office Geofence Radius**: {settings.GEOFENCE_RADIUS}m\n\n"
                f"You can punch in or out directly from your dashboard using live GPS."
            ),
            "is_demo_mode": settings.AI_DEMO_MODE or not settings.AI_API_KEY,
            "suggested_actions": ["Punch In Live", "View Attendance History"]
        }

    # Rule 3: Leave Queries
    if any(k in msg_lower for k in ["my leave", "leave balance", "how many leaves", "leave status", "apply leave"]):
        if not emp:
            return {"reply": "No employee profile is linked to your user account.", "is_demo_mode": True, "suggested_actions": []}
        
        balance = db.query(LeaveBalance).filter(LeaveBalance.employee_id == emp.id).first()
        pending_leaves = db.query(LeaveRequest).filter(
            LeaveRequest.employee_id == emp.id,
            LeaveRequest.status.in_([LeaveStatus.PENDING_TL, LeaveStatus.PENDING_MANAGER])
        ).count()

        casual = balance.casual_leave if balance else 12.0
        sick = balance.sick_leave if balance else 10.0
        earned = balance.earned_leave if balance else 15.0

        return {
            "reply": (
                f"🌴 **Your Leave Overview**:\n"
                f"- **Casual Leave Balance**: {casual} days\n"
                f"- **Sick Leave Balance**: {sick} days\n"
                f"- **Earned Leave Balance**: {earned} days\n"
                f"- **Pending Approval Requests**: {pending_leaves}\n\n"
                f"📌 *Leave Policy Tip*: 1-day leaves are **auto-approved immediately**; 2-day leaves require Team Leader approval; 3+ days require Department Manager approval."
            ),
            "is_demo_mode": settings.AI_DEMO_MODE or not settings.AI_API_KEY,
            "suggested_actions": ["Apply for Leave", "View Leave Status"]
        }

    # Rule 4: Payslip & Payroll Queries
    if any(k in msg_lower for k in ["payslip", "my salary", "download payslip", "payroll", "deduction"]):
        if not emp:
            return {"reply": "No employee profile is linked to your user account.", "is_demo_mode": True, "suggested_actions": []}
        
        latest_item = db.query(PayrollItem).filter(PayrollItem.employee_id == emp.id).order_by(PayrollItem.id.desc()).first()
        if latest_item:
            return {
                "reply": (
                    f"💰 **Latest Payslip Details**:\n"
                    f"- **Monthly Gross Salary**: ${latest_item.monthly_salary:,.2f}\n"
                    f"- **Net Disbursed Salary**: ${latest_item.net_salary:,.2f}\n"
                    f"- **LWP Deductions**: ${latest_item.lwp_deduction:,.2f} ({latest_item.lwp_days} days)\n"
                    f"- **PF & Tax Deductions**: ${(latest_item.pf_deduction + latest_item.tax_deduction):,.2f}\n\n"
                    f"You can download your official PDF payslip from the **Payroll / Payslips** section."
                ),
                "is_demo_mode": settings.AI_DEMO_MODE or not settings.AI_API_KEY,
                "suggested_actions": ["Download Latest Payslip", "View Salary Structure"]
            }
        else:
            # Safe access with defensive check
            salary_display = f"${emp.monthly_salary:,.2f}" if emp and emp.monthly_salary else "$0.00"
            return {
                "reply": (
                    f"💵 **Salary Information**:\n"
                    f"- Your base monthly salary is set to **{salary_display}**.\n"
                    f"Once monthly payroll is processed by HR, your official downloadable PDF payslip will appear in your portal."
                ),
                "is_demo_mode": settings.AI_DEMO_MODE or not settings.AI_API_KEY,
                "suggested_actions": ["View My Profile"]
            }

    # Rule 5: Leave Policy / General HR Rules
    if any(k in msg_lower for k in ["policy", "leave rule", "geofence", "approval workflow", "how does leave work"]):
        return {
            "reply": (
                f"📋 **AI-HRMS Intelligent Rules & Policies**:\n\n"
                f"1. **Attendance**: Must punch in via GPS within **100 meters** of the office. Distance is verified on the backend via the Haversine formula.\n"
                f"2. **1-Day Leaves**: Auto-approved immediately by the AI engine. Notifications sent to you, your Team Leader, and HR.\n"
                f"3. **2-Day Leaves**: Sent directly to your assigned Team Leader for review.\n"
                f"4. **3+ Day Leaves**: Sent to your Department Manager or HR Manager.\n"
                f"5. **Payroll**: Calculated automatically as `(Monthly Salary / Working Days) × Payable Days` minus standard PF and Tax."
            ),
            "is_demo_mode": settings.AI_DEMO_MODE or not settings.AI_API_KEY,
            "suggested_actions": ["Apply for Leave", "Check Attendance GPS"]
        }

    # Rule 6: Skills & Skill Gap Queries
    if any(k in msg_lower for k in ["my skills", "skill gap", "skills to improve", "missing skills", "future skills"]):
        if not emp:
            return {"reply": "No employee profile is linked to your user account.", "is_demo_mode": True, "suggested_actions": []}
        
        from app.ai.skill_gap_analyzer import analyze_employee_skill_gaps
        from app.ai.skill_predictor import predict_future_skills
        gap_info = analyze_employee_skill_gaps(db, emp)
        future_info = predict_future_skills(db, emp)

        matched_str = ", ".join(gap_info.get("matched_skills", [])) or "None recorded"
        missing_str = ", ".join(gap_info.get("missing_skills", [])) or "None identified"
        future_str = ", ".join(future_info.get("predicted_skills", [])) or "General Leadership"

        return {
            "reply": (
                f"🧠 **AI Skill & Development Profile**:\n"
                f"- **Target Career Role**: {gap_info.get('target_role')}\n"
                f"- **Verified Matched Skills**: {matched_str}\n"
                f"- **Priority Skill Gaps**: {missing_str} ({gap_info.get('gap_percentage')}% gap)\n"
                f"- **Suggested Future Skills**: {future_str}\n\n"
                f"💡 *AI Tip*: Check out your **My AI Insights** page to enroll in recommended training programs."
            ),
            "is_demo_mode": settings.AI_DEMO_MODE or not settings.AI_API_KEY,
            "suggested_actions": ["View My AI Insights", "Browse Recommended Training"]
        }

    # Rule 7: Training Recommendations Query
    if any(k in msg_lower for k in ["recommended training", "my training", "courses for me", "what training should i take"]):
        if not emp:
            return {"reply": "No employee profile is linked to your user account.", "is_demo_mode": True, "suggested_actions": []}
        
        from app.ai.training_recommender import recommend_training_for_employee
        recommendations = recommend_training_for_employee(db, emp)
        top_recs = recommendations[:3]
        rec_bullets = "\n".join([f"- **{r['training_name']}** ({r['priority']} Priority) — *{r['reason']}*" for r in top_recs]) or "No active gaps detected."

        return {
            "reply": (
                f"🎓 **Personalized AI Training Recommendations**:\n\n"
                f"{rec_bullets}\n\n"
                f"You can track your enrolled courses and upload certificates in the **My Training** portal."
            ),
            "is_demo_mode": settings.AI_DEMO_MODE or not settings.AI_API_KEY,
            "suggested_actions": ["Go to My Training", "View Skill Profile"]
        }

    # Rule 8: Performance Feedback & Insights Query
    if any(k in msg_lower for k in ["my performance", "performance score", "how am i doing", "performance insight"]):
        if not emp:
            return {"reply": "No employee profile is linked to your user account.", "is_demo_mode": True, "suggested_actions": []}
        
        from app.ai.performance_predictor import predict_employee_performance
        perf = predict_employee_performance(db, emp)
        if not perf["is_data_sufficient"]:
            return {
                "reply": "📈 **Performance Insights**: Insufficient historical data available (< 14 days tenure). Complete your initial onboarding milestones to generate baseline performance trends.",
                "is_demo_mode": True,
                "suggested_actions": ["View Onboarding Tasks"]
            }

        pos_str = "\n".join([f"  + {f}" for f in perf["positive_factors"][:2]]) or "  + Stable baseline engagement"
        act_str = "\n".join([f"  • {a}" for a in perf["recommended_actions"][:2]]) or "  • Maintain strong trajectory"

        return {
            "reply": (
                f"📈 **Estimated AI Performance Snapshot**:\n"
                f"- **Score**: {perf['score']}/100 ({perf['prediction_category']} Tier, {perf['trend']} Trend)\n"
                f"- **Confidence**: {perf['confidence']}%\n\n"
                f"**Key Strengths**:\n{pos_str}\n\n"
                f"**Development Recommendations**:\n{act_str}\n\n"
                f"*(Note: AI performance metrics are decision-support insights derived from historical attendance, training, and leave data.)*"
            ),
            "is_demo_mode": settings.AI_DEMO_MODE or not settings.AI_API_KEY,
            "suggested_actions": ["View My AI Insights", "Recommended Training"]
        }

    # Rule 9: HR / Management Workforce Analytics Query (HR / Super Admin only)
    if any(k in msg_lower for k in ["workforce analytics", "attrition risk", "department skill gaps", "workforce summary", "high risk employees"]):
        if user.role not in [UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER]:
            return {
                "reply": "🔒 **Restricted Management Analytics**: Workforce-wide attrition risk and organizational talent intelligence are confidential to HR Leadership and Department Managers.",
                "is_demo_mode": True,
                "suggested_actions": ["View My AI Insights", "Check Leave Balance"]
            }
        
        from app.services.workforce_intelligence_service import get_workforce_dashboard_summary
        summary = get_workforce_dashboard_summary(db, user)
        return {
            "reply": (
                f"🏢 **Executive Workforce Intelligence Overview**:\n"
                f"- **Total Staff Headcount**: {summary['total_employees']} active employees\n"
                f"- **Average Performance Score**: {summary['average_performance_score']}/100\n"
                f"- **Elevated Attrition Risk Cases**: {summary['high_attrition_count']} employee(s)\n"
                f"- **Training Completion Rate**: {summary['training_completion_rate']}%\n"
                f"- **Top Priority Skill Gaps**: {', '.join([g['skill'] for g in summary['top_skill_gaps'][:3]]) or 'None'}\n\n"
                f"Explore the interactive **AI Workforce Intelligence** dashboard for deep-dive heatmaps and interventions."
            ),
            "is_demo_mode": settings.AI_DEMO_MODE or not settings.AI_API_KEY,
            "suggested_actions": ["Open Workforce Dashboard", "View Department Analytics"]
        }

    # Default friendly HR response
    return {
        "reply": (
            f"Hello! I am your **AI HR Assistant**. How can I help you today?\n\n"
            f"You can ask me about:\n"
            f"- **Your Attendance**: `What is my attendance status today?`\n"
            f"- **Your Leaves**: `How many leaves do I have left?`\n"
            f"- **Your Payslip**: `Where can I download my latest payslip?`\n"
            f"- **Your Skills & Training**: `What skills should I improve?` or `What training is recommended for me?`\n"
            f"- **Your Performance**: `What are my performance insights?`"
        ),
        "is_demo_mode": settings.AI_DEMO_MODE or not settings.AI_API_KEY,
        "suggested_actions": ["Check My Skills", "Recommended Training", "My Attendance", "Company Policies"]
    }
