import json
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.models.user import User

def log_audit(
    db: Session,
    action: str,
    module: str,
    user: Optional[User] = None,
    record_id: Optional[str] = None,
    details: Optional[Any] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """Logs a security or operational event to the audit trail"""
    details_str = None
    if details is not None:
        if isinstance(details, (dict, list)):
            details_str = json.dumps(details, default=str)
        else:
            details_str = str(details)
    
    audit_entry = AuditLog(
        user_id=user.id if user else None,
        user_email=user.email if user else None,
        action=action,
        module=module,
        record_id=str(record_id) if record_id else None,
        details=details_str,
        ip_address=ip_address
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry
