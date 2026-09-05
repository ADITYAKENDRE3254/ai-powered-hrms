from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.training import TrainingProgram, TrainingAssignment
from app.models.training_recommendation import RecommendationPriority
from app.ai.skill_gap_analyzer import analyze_employee_skill_gaps
from app.ai.skill_predictor import predict_future_skills

def recommend_training_for_employee(db: Session, employee: Employee) -> List[Dict[str, Any]]:
    """
    Generates personalized, prioritized training course recommendations based on verified skill gaps and future career paths.
    """
    # 1. Get Missing Skills from Skill Gap Analysis
    gap_data = analyze_employee_skill_gaps(db, employee)
    missing_skills = gap_data.get("missing_skills", [])

    # 2. Get Future Skills
    future_data = predict_future_skills(db, employee)
    future_skills = future_data.get("predicted_skills", [])

    # 3. Get existing enrolled/completed training IDs
    existing_assignments = db.query(TrainingAssignment).filter(TrainingAssignment.employee_id == employee.id).all()
    enrolled_training_ids = {a.training_id for a in existing_assignments}

    # 4. Query Available Active Training Programs
    available_programs = db.query(TrainingProgram).filter(TrainingProgram.is_active == True).all()

    recommendations: List[Dict[str, Any]] = []

    for prog in available_programs:
        if prog.id in enrolled_training_ids:
            continue

        prog_skill_lower = prog.skill_name.lower()
        is_missing = any(m.lower() == prog_skill_lower or prog_skill_lower in m.lower() for m in missing_skills)
        is_future = any(f.lower() == prog_skill_lower or prog_skill_lower in f.lower() for f in future_skills)

        if is_missing:
            recommendations.append({
                "employee_id": employee.id,
                "training_id": prog.id,
                "training_name": prog.title,
                "skill_name": prog.skill_name,
                "priority": RecommendationPriority.HIGH.value,
                "reason": f"Direct skill gap identified for target role ({gap_data.get('target_role')}).",
                "expected_benefit": f"Master {prog.skill_name} and reduce role qualification gap by up to 20%.",
                "confidence": 92.0
            })
        elif is_future:
            recommendations.append({
                "employee_id": employee.id,
                "training_id": prog.id,
                "training_name": prog.title,
                "skill_name": prog.skill_name,
                "priority": RecommendationPriority.MEDIUM.value,
                "reason": f"Strategic competency aligned with career roadmap ({future_data.get('career_path')}).",
                "expected_benefit": f"Build foundational proficiency in {prog.skill_name} for future leadership and technical growth.",
                "confidence": 85.0
            })

    # If no exact database training program matches, construct dynamic recommendations
    if not recommendations:
        for missing in missing_skills[:2]:
            recommendations.append({
                "employee_id": employee.id,
                "training_id": None,
                "training_name": f"{missing} Professional Accelerator",
                "skill_name": missing,
                "priority": RecommendationPriority.HIGH.value,
                "reason": f"Critical missing prerequisite for target role: {gap_data.get('target_role')}.",
                "expected_benefit": f"Gain hands-on industry proficiency in {missing}.",
                "confidence": 88.0
            })
        for future in future_skills[:2]:
            recommendations.append({
                "employee_id": employee.id,
                "training_id": None,
                "training_name": f"Advanced {future} Masterclass",
                "skill_name": future,
                "priority": RecommendationPriority.MEDIUM.value,
                "reason": f"Recommended future skill for career advancement towards {future_data.get('career_path')}.",
                "expected_benefit": f"Expand architectural and domain breadth in {future}.",
                "confidence": 82.0
            })

    # Sort: HIGH priority first, then MEDIUM, then LOW
    priority_order = {
        RecommendationPriority.HIGH.value: 0,
        RecommendationPriority.MEDIUM.value: 1,
        RecommendationPriority.LOW.value: 2
    }
    recommendations.sort(key=lambda x: priority_order.get(x["priority"], 3))

    return recommendations
