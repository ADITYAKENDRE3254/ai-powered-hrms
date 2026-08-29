from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.setting import OfficeSetting
from app.schemas.setting import OfficeSettingUpdate, OfficeSettingOut
from app.services.audit_service import log_audit

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/office", response_model=OfficeSettingOut)
def get_office_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves current office GPS coordinates and geofence radius"""
    setting = db.query(OfficeSetting).first()
    if not setting:
        setting = OfficeSetting(
            office_name=settings.OFFICE_NAME,
            latitude=settings.OFFICE_LATITUDE,
            longitude=settings.OFFICE_LONGITUDE,
            geofence_radius=settings.GEOFENCE_RADIUS
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return OfficeSettingOut.model_validate(setting)

@router.put("/office", response_model=OfficeSettingOut)
def update_office_settings(
    request: Request,
    setting_in: OfficeSettingUpdate,
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)),
    db: Session = Depends(get_db)
):
    """Updates office GPS coordinates and geofence radius (Super Admin / HR only)"""
    setting = db.query(OfficeSetting).first()
    if not setting:
        setting = OfficeSetting(**setting_in.model_dump())
        db.add(setting)
    else:
        for key, val in setting_in.model_dump().items():
            setattr(setting, key, val)

    db.commit()
    db.refresh(setting)

    log_audit(
        db=db,
        action="OFFICE_GEOFENCE_UPDATED",
        module="SETTINGS",
        user=current_user,
        record_id=str(setting.id),
        details={"radius": setting.geofence_radius, "lat": setting.latitude, "lng": setting.longitude},
        ip_address=request.client.host if request.client else None
    )

    return OfficeSettingOut.model_validate(setting)
