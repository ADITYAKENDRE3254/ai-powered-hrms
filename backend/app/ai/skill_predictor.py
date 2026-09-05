import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.employee_skill import EmployeeSkill

# Role-to-Future-Skill Mapping Matrix
FUTURE_SKILL_ROADMAPS: Dict[str, Dict[str, Any]] = {
    "Engineering": {
        "Software Engineer": {
            "career_path": "Senior Full-Stack / Cloud Engineer",
            "future_skills": ["Docker", "Kubernetes", "AWS", "System Design", "Microservices", "GraphQL"],
            "reason": "Evolution towards cloud-native distributed backend systems and scalable containerized architectures."
        },
        "Senior Full-Stack Engineer": {
            "career_path": "Principal Engineer / Technical Architect",
            "future_skills": ["System Design", "Kubernetes", "Kafka", "MLOps", "Distributed Systems", "Cloud Security"],
            "reason": "Preparation for enterprise system architecture, streaming infrastructure, and tech leadership."
        },
        "Team Leader": {
            "career_path": "Engineering Director / VP of Engineering",
            "future_skills": ["Agile Leadership", "System Design", "Executive Communication", "Budgeting", "Product Strategy"],
            "reason": "Strengthening cross-functional engineering management and technical roadmap governance."
        }
    },
    "Artificial Intelligence & ML": {
        "AI/ML Research Engineer": {
            "career_path": "Lead Generative AI & MLOps Architect",
            "future_skills": ["LLM Fine-Tuning", "LangChain", "Vector DB", "MLOps", "Kubernetes", "Prompt Engineering"],
            "reason": "Rapid industry transition towards production LLM agents, RAG pipelines, and automated model serving."
        }
    },
    "Human Resources": {
        "Lead Talent Recruiter": {
            "career_path": "People Operations Director",
            "future_skills": ["Workforce Analytics", "HRIS Strategy", "Labor Law Compliance", "Compensation Strategy"],
            "reason": "Transitioning from tactical recruiting to data-driven organizational workforce planning."
        },
        "VP of Human Resources": {
            "career_path": "Chief People Officer (CPO)",
            "future_skills": ["Strategic People Analytics", "Executive Coaching", "Global Compliance", "Total Rewards Design"],
            "reason": "Executive human capital strategy and board-level talent governance."
        }
    },
    "Finance": {
        "Financial Analyst": {
            "career_path": "Senior Finance Manager / Controller",
            "future_skills": ["Python for Finance", "Advanced PowerBI", "Strategic Tax Planning", "Mergers & Acquisitions"],
            "reason": "Integrating automated financial analytics and enterprise risk modeling."
        }
    }
}

# General department fallbacks
DEPARTMENT_FUTURE_SKILLS: Dict[str, List[str]] = {
    "Engineering": ["Cloud Computing", "Docker", "System Design", "CI/CD", "Cybersecurity Basics"],
    "Artificial Intelligence & ML": ["Generative AI", "MLOps", "Vector Databases", "Model Optimization"],
    "Human Resources": ["People Analytics", "Talent Intelligence", "Agile HR", "Employee Experience"],
    "Finance": ["Automated Financial Modeling", "ERP Optimization", "Strategic Budgeting"],
    "Marketing": ["AI Content Strategy", "Growth Analytics", "Marketing Automation", "Omnichannel Attribution"],
    "Sales": ["Predictive CRM", "Enterprise Solution Selling", "Sales Intelligence Tools"],
    "Operations": ["Process Mining", "Supply Chain Analytics", "Lean Automation", "Risk Management"]
}

def predict_future_skills(db: Session, employee: Employee) -> Dict[str, Any]:
    """
    Predicts recommended future skills and career development paths based on role and department.
    """
    dept_name = employee.department.name if employee.department else "Engineering"
    current_skills_objs = db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == employee.id).all()
    current_skill_names = {s.skill_name.lower() for s in current_skills_objs}

    dept_roadmaps = FUTURE_SKILL_ROADMAPS.get(dept_name, {})
    matched_roadmap = None
    
    for role_title, roadmap in dept_roadmaps.items():
        if role_title.lower() in employee.designation.lower() or employee.designation.lower() in role_title.lower():
            matched_roadmap = roadmap
            break

    if not matched_roadmap:
        # Fallback to department defaults
        fallback_skills = DEPARTMENT_FUTURE_SKILLS.get(dept_name, ["Leadership", "Cloud Tools", "Data Analysis", "Communication"])
        matched_roadmap = {
            "career_path": f"Senior Specialist in {dept_name}",
            "future_skills": fallback_skills,
            "reason": f"Core high-demand competency expansion tailored for the {dept_name} domain."
        }

    # Filter out skills the employee already holds
    recommended_future = [s for s in matched_roadmap["future_skills"] if s.lower() not in current_skill_names]
    if not recommended_future:
        recommended_future = ["Advanced System Design", "AI Integration", "Cross-Functional Leadership"]

    return {
        "employee_id": employee.id,
        "predicted_skills": recommended_future[:5],
        "career_path": matched_roadmap["career_path"],
        "relevance_score": 88.0,
        "reason": matched_roadmap["reason"],
        "confidence": 86.5
    }
