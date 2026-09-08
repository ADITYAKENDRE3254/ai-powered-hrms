from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class OfficeSettingBase(BaseModel):
    office_name: str = "Bangalore Innovation Hub"
    latitude: float = Field(..., description="Office latitude")
    longitude: float = Field(..., description="Office longitude")
    geofence_radius: float = Field(100.0, description="Geofence radius in meters")

class OfficeSettingUpdate(OfficeSettingBase):
    pass

class OfficeSettingOut(OfficeSettingBase):
    id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
