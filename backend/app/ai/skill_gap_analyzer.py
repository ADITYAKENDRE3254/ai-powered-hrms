import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.employee_skill import EmployeeSkill
from app.models.skill_gap import GapPriority

# Target Role Standard Skill Requirements
TARGET_ROLE_REQUIREMENTS: Dict[str, List[str]] = {
    "Senior Full-Stack Engineer": ["Python", "FastAPI", "React", "TypeScript", "SQL", "PostgreSQL", "Docker", "Kubernetes", "System Design"],
    "Lead Backend Architect": ["Python", "FastAPI", "PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes", "Microservices", "System Design"],
    "Lead AI / MLOps Engineer": ["Python", "PyTorch", "HuggingFace", "LangChain", "FastAPI", "Vector DB", "Docker", "MLOps"],
    "People Operations Director": ["Talent Acquisition", "Performance Management", "HRIS", "Workforce Planning", "Employee Relations", "Labor Law"],
    "Finance Director / Controller": ["Financial Modeling", "Budgeting", "Auditing", "Tax Planning", "Financial Reporting", "Risk Management"],
    "Technical Product Manager": ["Agile", "Scrum", "Jira", "System Design", "User Research", "Data Analysis", "Roadmap Planning"]
}

def analyze_employee_skill_gaps(db: Session, employee: Employee, target_role: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyzes skill gaps between current employee skills and a designated target or aspirational role.
    """
    dept_name = employee.department.name if employee.department else "Engineering"
    
    # Determine default target role if none supplied
    if not target_role:
        if dept_name == "Artificial Intelligence & ML":
            target_role = "Lead AI / MLOps Engineer"
        elif dept_name == "Human Resources":
            target_role = "People Operations Director"
        elif dept_name == "Finance":
            target_role = "Finance Director / Controller"
        else:
            if "Senior" in employee.designation:
                target_role = "Lead Backend Architect"
            else:
                target_role = "Senior Full-Stack Engineer"

    required_skills = TARGET_ROLE_REQUIREMENTS.get(
        target_role,
        ["Python", "FastAPI", "React", "TypeScript", "SQL", "Docker", "System Design"]
    )

    current_skills_objs = db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == employee.id).all()
    current_skill_set = {s.skill_name.lower(): s.skill_name for s in current_skills_objs}

    matched_skills: List[str] = []
    missing_skills: List[str] = []

    for req in required_skills:
        if req.lower() in current_skill_set:
            matched_skills.append(req)
        else:
            missing_skills.append(req)

    total_req = max(1, len(required_skills))
    gap_percentage = round((len(missing_skills) / total_req) * 100.0, 1)

    if gap_percentage >= 50.0:
        priority = GapPriority.HIGH.value
    elif gap_percentage >= 25.0:
        priority = GapPriority.MEDIUM.value
    else:
        priority = GapPriority.LOW.value

    return {
        "employee_id": employee.id,
        "target_role": target_role,
        "required_skills": required_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "gap_percentage": gap_percentage,
        "priority": priority,
        "confidence": 90.0
    }
