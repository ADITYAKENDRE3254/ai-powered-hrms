from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base

class TrainingDifficulty(str, enum.Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"

class AssignmentStatus(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    OVERDUE = "OVERDUE"

class TrainingProgram(Base):
    __tablename__ = "training_programs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    skill_name = Column(String(100), nullable=False)
    category_id = Column(Integer, ForeignKey("skill_categories.id", ondelete="SET NULL"), nullable=True)
    difficulty = Column(SQLEnum(TrainingDifficulty), default=TrainingDifficulty.INTERMEDIATE, nullable=False)
    duration_hours = Column(Float, default=10.0, nullable=False)
    provider = Column(String(150), default="Internal Academy", nullable=False)
    deadline_days = Column(Integer, default=30, nullable=False) # standard timeline
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    assignments = relationship("TrainingAssignment", back_populates="training", cascade="all, delete-orphan")

class TrainingAssignment(Base):
    __tablename__ = "training_assignments"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    training_id = Column(Integer, ForeignKey("training_programs.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(SQLEnum(AssignmentStatus), default=AssignmentStatus.NOT_STARTED, nullable=False)
    progress_percentage = Column(Float, default=0.0, nullable=False) # 0 to 100%
    deadline = Column(Date, nullable=True)
    certificate_url = Column(String(500), nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    employee = relationship("Employee", foreign_keys=[employee_id])
    training = relationship("TrainingProgram", back_populates="assignments")
    assigned_by = relationship("User", foreign_keys=[assigned_by_id])
