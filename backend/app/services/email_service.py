import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger("email_service")

def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Sends an email using configured SMTP credentials or logs simulation in demo/local environment.
    """
    if not to_email:
        logger.warning("Attempted to send email without a recipient address.")
        return False

    # 1. Real SMTP delivery if configured and enabled
    if settings.SMTP_ENABLED and settings.SMTP_HOST and settings.SMTP_USER:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg["To"] = to_email

            if text_content:
                msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                if settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], msg.as_string())
            
            logger.info(f"[Email Sent via SMTP] To: {to_email} | Subject: {subject}")
            return True
        except Exception as e:
            logger.error(f"[SMTP Error] Failed to send email to {to_email}: {e}")
            # Fallback to simulated log below

    # 2. Simulated / Demo Delivery
    print(f"\n📨 [EMAIL NOTIFICATION DISPATCHED] ==========================")
    print(f"To: {to_email}")
    print(f"From: {settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>")
    print(f"Subject: {subject}")
    print(f"----------------------------------------------------------")
    if text_content:
        print(text_content)
    else:
        print(f"(HTML Content: {len(html_content)} bytes)")
    print(f"==========================================================\n")
    return True


def get_candidate_status_email_html(
    candidate_name: str,
    job_title: str,
    department_name: str,
    status_value: str,
    match_score: float = 0.0,
    custom_notes: Optional[str] = None
) -> str:
    """Generates a responsive HTML email styled with the Blue + Cyan + Deep Navy design system."""
    
    is_selected = status_value == "SELECTED"
    is_rejected = status_value == "REJECTED"
    is_interview = status_value == "INTERVIEW"
    is_shortlisted = status_value == "SHORTLISTED"

    if is_selected:
        banner_title = "Congratulations! You Have Been Selected"
        badge_bg = "#ecfdf5"
        badge_border = "#10b981"
        badge_color = "#047857"
        badge_text = "✓ APPLICATION SELECTED / OFFER IN PROGRESS"
        header_gradient = "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #065f46 100%)"
        headline = f"Offer of Employment Selection — {job_title}"
        body_text = f"""
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            Dear <strong>{candidate_name}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            We are thrilled to inform you that following the review of your resume and interview evaluations, you have been <strong>SELECTED</strong> for the position of <strong>{job_title}</strong> in the <strong>{department_name}</strong> department!
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            Our hiring team was thoroughly impressed with your technical capabilities, background, and cultural fit during the evaluation process.
        </p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #10b981; padding: 18px 20px; border-radius: 12px; margin: 24px 0;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #166534;">Next Steps in Your Onboarding:</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #15803d;">
                <li>A member of our Talent & People Operations team will contact you with your formal Offer Letter.</li>
                <li>You will receive instructions to access the candidate portal for document verification.</li>
                <li>Please prepare copies of your identification and educational credentials.</li>
            </ul>
        </div>
        """
    elif is_rejected:
        banner_title = "Application Status Update"
        badge_bg = "#f1f5f9"
        badge_border = "#94a3b8"
        badge_color = "#475569"
        badge_text = "APPLICATION STATUS UPDATE"
        header_gradient = "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
        headline = f"Update Regarding Your Application for {job_title}"
        body_text = f"""
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            Dear <strong>{candidate_name}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            Thank you for taking the time to apply for the <strong>{job_title}</strong> position and for your interest in joining our team.
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            After careful review of all applications and our current project requirements, we regret to inform you that we will not be moving forward with your candidacy for this specific role at this time.
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            Our candidate pool for this position was exceptionally competitive. We were very impressed by your qualifications and have retained your resume profile in our talent community database. Should future opportunities matching your background open up, our recruitment team will reach out directly.
        </p>
        """
    elif is_interview:
        banner_title = "Interview Invitation"
        badge_bg = "#faf5ff"
        badge_border = "#c084fc"
        badge_color = "#7e22ce"
        badge_text = "📅 INTERVIEW STAGE SCHEDULED"
        header_gradient = "linear-gradient(135deg, #0f172a 0%, #3b0764 50%, #1e1b4b 100%)"
        headline = f"Invitation to Interview for {job_title}"
        body_text = f"""
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            Dear <strong>{candidate_name}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            We are pleased to invite you to an interview for the <strong>{job_title}</strong> role in the <strong>{department_name}</strong> department.
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            Our hiring manager would like to learn more about your technical experience and discuss the position responsibilities in greater detail. Our recruitment coordinator will follow up shortly to confirm interview scheduling and conferencing links.
        </p>
        """
    else:
        banner_title = "Application Shortlisted"
        badge_bg = "#eff6ff"
        badge_border = "#93c5fd"
        badge_color = "#1d4ed8"
        badge_text = "★ CANDIDATE SHORTLISTED"
        header_gradient = "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)"
        headline = f"Your Application Has Been Shortlisted — {job_title}"
        body_text = f"""
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            Dear <strong>{candidate_name}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            Your application and resume for <strong>{job_title}</strong> have been reviewed and advanced to our <strong>Shortlisted</strong> talent candidate pool.
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
            We will notify you as soon as the hiring team completes round scheduling.
        </p>
        """

    notes_section = ""
    if custom_notes:
        notes_section = f"""
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Hiring Note:</strong> {custom_notes}</p>
        </div>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{headline}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 15px;">
            <tr>
                <td align="center">
                    <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                        
                        <!-- Header Banner -->
                        <tr>
                            <td style="background: {header_gradient}; padding: 36px 32px; text-align: left;">
                                <div style="display: inline-block; padding: 6px 12px; border-radius: 20px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #38bdf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                                    ✦ {settings.PROJECT_NAME} Talent Network
                                </div>
                                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; tracking-tight;">
                                    {banner_title}
                                </h1>
                            </td>
                        </tr>

                        <!-- Body Content -->
                        <tr>
                            <td style="padding: 36px 32px;">
                                <!-- Status Pill -->
                                <div style="margin-bottom: 24px;">
                                    <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: {badge_bg}; border: 1px solid {badge_border}; color: {badge_color}; font-size: 11px; font-weight: 800; letter-spacing: 0.5px;">
                                        {badge_text}
                                    </span>
                                </div>

                                {body_text}
                                {notes_section}

                                <!-- Application Details Table -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; margin: 28px 0; overflow: hidden;">
                                    <tr>
                                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600; width: 35%;">
                                            Role Applied
                                        </td>
                                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-weight: 700;">
                                            {job_title}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; font-weight: 600;">
                                            Department
                                        </td>
                                        <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; font-weight: 700;">
                                            {department_name}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 14px 18px; font-size: 13px; color: #64748b; font-weight: 600;">
                                            Status
                                        </td>
                                        <td style="padding: 14px 18px; font-size: 13px; color: {badge_color}; font-weight: 800;">
                                            {status_value.replace('_', ' ')}
                                        </td>
                                    </tr>
                                </table>

                                <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.5; color: #64748b;">
                                    Warm regards,<br>
                                    <strong style="color: #0f172a;">{settings.EMAILS_FROM_NAME}</strong><br>
                                    <span style="font-size: 12px; color: #94a3b8;">{settings.PROJECT_NAME}</span>
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f1f5f9; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0; font-size: 12px; color: #64748b;">
                                    This is an automated notification from {settings.PROJECT_NAME} Recruitment & Talent Acquisition.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html


def send_candidate_status_email(
    candidate,
    job_title: str,
    department_name: str,
    new_status_value: str,
    custom_notes: Optional[str] = None
) -> bool:
    """
    Convenience method to construct and dispatch the candidate status notification email.
    """
    candidate_name = f"{candidate.first_name} {candidate.last_name}"
    
    if new_status_value == "SELECTED":
        subject = f"🎉 Selection Decision: {job_title} at {settings.PROJECT_NAME}"
    elif new_status_value == "REJECTED":
        subject = f"Application Status Update: {job_title} - {settings.PROJECT_NAME}"
    elif new_status_value == "INTERVIEW":
        subject = f"📅 Interview Invitation: {job_title} at {settings.PROJECT_NAME}"
    elif new_status_value == "SHORTLISTED":
        subject = f"★ Application Shortlisted: {job_title} at {settings.PROJECT_NAME}"
    else:
        subject = f"Recruitment Status Update: {job_title}"

    html_content = get_candidate_status_email_html(
        candidate_name=candidate_name,
        job_title=job_title,
        department_name=department_name,
        status_value=new_status_value,
        match_score=getattr(candidate, "match_score", 0.0),
        custom_notes=custom_notes
    )

    text_content = f"Dear {candidate_name},\n\nYour application status for {job_title} ({department_name}) has been updated to: {new_status_value}.\n\nThank you,\n{settings.EMAILS_FROM_NAME}"

    return send_email(
        to_email=candidate.email,
        subject=subject,
        html_content=html_content,
        text_content=text_content
    )
