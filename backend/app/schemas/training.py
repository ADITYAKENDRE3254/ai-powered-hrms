from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from app.models.training import TrainingDifficulty, AssignmentStatus

class TrainingProgramBase(BaseModel):
    title: str
    description: str
    skill_name: str
    skill_id: Optional[int] = None
    category_id: Optional[int] = None
    difficulty: TrainingDifficulty = TrainingDifficulty.INTERMEDIATE
    duration_hours: float = 10.0
    provider: str = "Internal Academy"
    deadline_days: int = 30
    is_active: bool = True

class TrainingProgramCreate(TrainingProgramBase):
    pass

class TrainingProgramUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    skill_name: Optional[str] = None
    difficulty: Optional[TrainingDifficulty] = None
    duration_hours: Optional[float] = None
    provider: Optional[str] = None
    deadline_days: Optional[int] = None
    is_active: Optional[bool] = None

class TrainingProgramOut(TrainingProgramBase):
    id: int
    created_at: datetime
    updated_at: datetime
    enrolled_count: Optional[int] = 0
    completed_count: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)

class TrainingAssignmentCreate(BaseModel):
    training_id: int
    employee_ids: List[int] # Allows bulk assigning
    deadline: Optional[date] = None

class TrainingProgressUpdate(BaseModel):
    progress_percentage: float # 0 to 100%
    status: Optional[AssignmentStatus] = None
    certificate_url: Optional[str] = None

class TrainingAssignmentOut(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    department_name: Optional[str] = None
    training_id: int
    training_title: Optional[str] = None
    skill_name: Optional[str] = None
    difficulty: Optional[TrainingDifficulty] = None
    duration_hours: Optional[float] = None
    provider: Optional[str] = None
    status: AssignmentStatus
    progress_percentage: float
    deadline: Optional[date] = None
    certificate_url: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
