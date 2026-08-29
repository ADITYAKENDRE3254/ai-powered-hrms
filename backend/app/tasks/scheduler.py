import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from app.core.database import SessionLocal
from app.services.payroll_service import generate_monthly_payroll

scheduler = BackgroundScheduler()

def scheduled_monthly_payroll_job():
    """Background task running automatically at end of month or start of next month"""
    db = SessionLocal()
    try:
        now = datetime.datetime.now()
        # Process payroll for previous month
        target_month = now.month - 1 if now.month > 1 else 12
        target_year = now.year if now.month > 1 else now.year - 1
        print(f"[Scheduler] Running automated background payroll generation for {target_month:02d}/{target_year}...")
        generate_monthly_payroll(
            db=db,
            month=target_month,
            year=target_year,
            total_working_days=22,
            notes="Automated background scheduled payroll processing"
        )
        print(f"[Scheduler] Automated payroll processing finished successfully for {target_month:02d}/{target_year}.")
    except Exception as e:
        print(f"[Scheduler] Error running automated payroll job: {e}")
    finally:
        db.close()

def start_scheduler():
    """Starts the background scheduler for payroll automation"""
    try:
        # Schedule on 1st of every month at 00:00:00
        scheduler.add_job(
            scheduled_monthly_payroll_job,
            trigger='cron',
            day=1,
            hour=0,
            minute=0,
            id='monthly_payroll_automation',
            replace_existing=True
        )
        scheduler.start()
        print("[Scheduler] APScheduler background task manager initialized.")
    except Exception as e:
        print(f"[Scheduler] Warning: Scheduler initialization: {e}")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
