from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    manager_id: Optional[int] = None
    is_active: bool = True

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    manager_id: Optional[int] = None
    is_active: Optional[bool] = None

class TeamBase(BaseModel):
    name: str
    department_id: int
    team_leader_id: Optional[int] = None

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    department_id: Optional[int] = None
    team_leader_id: Optional[int] = None

class TeamOut(TeamBase):
    id: int
    created_at: datetime
    team_leader_name: Optional[str] = None
    department_name: Optional[str] = None
    member_count: Optional[int] = 0

    class Config:
        from_attributes = True

class DepartmentOut(DepartmentBase):
    id: int
    created_at: datetime
    manager_name: Optional[str] = None
    employee_count: Optional[int] = 0
    teams: List[TeamOut] = []

    class Config:
        from_attributes = True
