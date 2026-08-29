from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class OfficeSetting(Base):
    __tablename__ = "office_settings"

    id = Column(Integer, primary_key=True, index=True)
    office_name = Column(String(100), default="Bangalore Innovation Hub", nullable=False)
    latitude = Column(Float, default=12.9715987, nullable=False)
    longitude = Column(Float, default=77.5945627, nullable=False)
    geofence_radius = Column(Float, default=100.0, nullable=False)  # in meters
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
