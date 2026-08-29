import math
from datetime import date, datetime, timezone
from typing import Tuple, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.attendance import Attendance, VerificationStatus
from app.models.employee import Employee
from app.models.setting import OfficeSetting
from app.models.notification import Notification, NotificationType
from app.services.audit_service import log_audit

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two GPS coordinates in meters using the Haversine formula"""
    R = 6371000.0  # Earth's radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def get_office_coordinates(db: Session) -> Tuple[float, float, float, str]:
    """Retrieves office latitude, longitude, geofence radius, and name"""
    setting = db.query(OfficeSetting).first()
    if setting:
        return setting.latitude, setting.longitude, setting.geofence_radius, setting.office_name
    return settings.OFFICE_LATITUDE, settings.OFFICE_LONGITUDE, settings.GEOFENCE_RADIUS, settings.OFFICE_NAME

def process_punch_in(
    db: Session,
    employee: Employee,
    latitude: float,
    longitude: float,
    notes: Optional[str] = None,
    ip_address: Optional[str] = None
) -> Attendance:
    """Processes an employee Punch-In attempt with GPS geofence validation"""
    today = date.today()
    existing = db.query(Attendance).filter(
        Attendance.employee_id == employee.id,
        Attendance.date == today
    ).first()

    if existing and existing.punch_in and existing.verification_status == VerificationStatus.VERIFIED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate punch in: You have already punched in for today."
        )

    office_lat, office_lng, radius, office_name = get_office_coordinates(db)
    distance = calculate_haversine_distance(latitude, longitude, office_lat, office_lng)
    now = datetime.now(timezone.utc)

    if distance > radius:
        # Distance exceeded: Record rejected attempt & notify employee
        if not existing:
            existing = Attendance(
                employee_id=employee.id,
                date=today,
                punch_in=now,
                punch_in_lat=latitude,
                punch_in_lng=longitude,
                distance_in_meters=distance,
                verification_status=VerificationStatus.REJECTED,
                notes=f"Rejected: Outside geofence ({distance:.1f}m > {radius:.0f}m)"
            )
            db.add(existing)
        else:
            existing.verification_status = VerificationStatus.REJECTED
            existing.distance_in_meters = distance
            existing.notes = f"Rejected: Outside geofence ({distance:.1f}m > {radius:.0f}m)"
        
        # Add in-app notification
        notification = Notification(
            user_id=employee.user_id,
            title="Attendance Punch-In Rejected",
            message=f"Your punch-in attempt at {now.strftime('%H:%M')} was rejected. You are {distance:.1f}m away from '{office_name}' (Geofence limit is {radius:.0f}m).",
            type=NotificationType.ATTENDANCE
        )
        db.add(notification)
        db.commit()

        log_audit(
            db=db,
            action="ATTENDANCE_PUNCH_IN_REJECTED",
            module="ATTENDANCE",
            user=employee.user,
            record_id=str(existing.id) if existing else None,
            details={"distance": distance, "radius": radius, "latitude": latitude, "longitude": longitude},
            ip_address=ip_address
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Attendance Rejected: You are {distance:.1f} meters away from '{office_name}'. Maximum allowed geofence distance is {radius:.0f} meters."
        )

    # Valid Punch-in within geofence
    if not existing:
        attendance = Attendance(
            employee_id=employee.id,
            date=today,
            punch_in=now,
            punch_in_lat=latitude,
            punch_in_lng=longitude,
            distance_in_meters=distance,
            verification_status=VerificationStatus.VERIFIED,
            notes=notes
        )
        db.add(attendance)
    else:
        existing.punch_in = now
        existing.punch_in_lat = latitude
        existing.punch_in_lng = longitude
        existing.distance_in_meters = distance
        existing.verification_status = VerificationStatus.VERIFIED
        existing.notes = notes
        attendance = existing

    db.commit()
    db.refresh(attendance)

    log_audit(
        db=db,
        action="ATTENDANCE_PUNCH_IN_SUCCESS",
        module="ATTENDANCE",
        user=employee.user,
        record_id=str(attendance.id),
        details={"distance": distance, "verified": True},
        ip_address=ip_address
    )
    return attendance

def process_punch_out(
    db: Session,
    employee: Employee,
    latitude: float,
    longitude: float,
    notes: Optional[str] = None,
    ip_address: Optional[str] = None
) -> Attendance:
    """Processes an employee Punch-Out attempt"""
    today = date.today()
    attendance = db.query(Attendance).filter(
        Attendance.employee_id == employee.id,
        Attendance.date == today
    ).first()

    if not attendance or not attendance.punch_in or attendance.verification_status != VerificationStatus.VERIFIED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot punch out: No verified punch-in record found for today."
        )

    if attendance.punch_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already punched out for today."
        )

    now = datetime.now(timezone.utc)
    attendance.punch_out = now
    attendance.punch_out_lat = latitude
    attendance.punch_out_lng = longitude
    
    # Calculate duration
    duration_seconds = (now - attendance.punch_in.replace(tzinfo=timezone.utc)).total_seconds()
    duration_hours = max(0.0, round(duration_seconds / 3600.0, 2))
    attendance.work_duration_hours = duration_hours
    
    if notes:
        attendance.notes = f"{attendance.notes or ''}; {notes}".strip("; ")

    db.commit()
    db.refresh(attendance)

    log_audit(
        db=db,
        action="ATTENDANCE_PUNCH_OUT_SUCCESS",
        module="ATTENDANCE",
        user=employee.user,
        record_id=str(attendance.id),
        details={"duration_hours": duration_hours},
        ip_address=ip_address
    )
    return attendance
