from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base

class SkillLevel(str, enum.Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"

class SkillSource(str, enum.Enum):
    RESUME = "RESUME"
    PROFILE = "PROFILE"
    MANAGER_ASSESSED = "MANAGER_ASSESSED"
    CERTIFICATION = "CERTIFICATION"
    TRAINING = "TRAINING"

class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    skills = relationship("Skill", back_populates="category", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("skill_categories.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    category = relationship("SkillCategory", back_populates="skills")
    employee_skills = relationship("EmployeeSkill", back_populates="skill_rel", cascade="all, delete-orphan")

class EmployeeSkill(Base):
    __tablename__ = "employee_skills"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=True)
    skill_name = Column(String(100), nullable=False, index=True)
    skill_level = Column(SQLEnum(SkillLevel), default=SkillLevel.INTERMEDIATE, nullable=False)
    confidence = Column(Float, default=85.0, nullable=False) # 0 to 100%
    source = Column(SQLEnum(SkillSource), default=SkillSource.PROFILE, nullable=False)
    last_verified = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    employee = relationship("Employee", foreign_keys=[employee_id])
    skill_rel = relationship("Skill", back_populates="employee_skills")
