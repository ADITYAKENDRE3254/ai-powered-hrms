import io
import os
import pytest
from app.core.security import create_access_token
from app.models.user import User, UserRole
from app.models.recruitment import Job, Candidate, JobStatus, CandidateStatus
from app.models.audit import AuditLog
from app.core.config import settings

def auth_header(user_id: int, role: str):
    token = create_access_token(subject=user_id, role=role)
    return {"Authorization": f"Bearer {token}"}

class TestRecruitmentOriginalResume:
    def test_upload_resume_saves_original_metadata_and_file(self, client, seed_test_data, db):
        hr_user = seed_test_data["hr_user"]
        headers = auth_header(hr_user.id, "HR_MANAGER")

        # Create dummy PDF file
        file_content = b"%PDF-1.4 Mock Candidate Resume with skills: Python, React, PostgreSQL, Docker."
        file_data = io.BytesIO(file_content)

        response = client.post(
            "/api/resumes/upload",
            files={"file": ("Aditya_Kendre_Resume.pdf", file_data, "application/pdf")},
            data={"first_name": "Aditya", "last_name": "Kendre", "email": "aditya.kendre@example.com"},
            headers=headers
        )

        assert response.status_code == 200
        data = response.json()
        candidate_id = data["candidate_id"]
        assert candidate_id is not None
        assert data["original_resume_filename"] == "Aditya_Kendre_Resume.pdf"
        assert data["original_resume_mime_type"] == "application/pdf"
        assert data["original_resume_size"] == len(file_content)
        assert data["uploaded_at"] is not None

        # Verify candidate in DB
        cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        assert cand is not None
        assert cand.original_resume_filename == "Aditya_Kendre_Resume.pdf"
        assert cand.original_resume_storage_path is not None
        assert os.path.exists(cand.original_resume_storage_path)

        # Verify raw contents match
        with open(cand.original_resume_storage_path, "rb") as f:
            saved_content = f.read()
        assert saved_content == file_content

    def test_get_candidate_resume_preview_inline(self, client, seed_test_data, db):
        hr_user = seed_test_data["hr_user"]
        headers = auth_header(hr_user.id, "HR_MANAGER")

        # Create candidate with original resume
        file_content = b"%PDF-1.4 Candidate Profile Document Preview"
        save_dir = os.path.join(settings.UPLOAD_DIR, "resumes")
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, "test_preview_resume.pdf")
        with open(file_path, "wb") as f:
            f.write(file_content)

        job = db.query(Job).first()
        cand = Candidate(
            job_id=job.id if job else 1,
            first_name="Jane",
            last_name="Doe",
            email="jane.doe@example.com",
            original_resume_filename="Jane_Doe_Resume.pdf",
            original_resume_storage_path=file_path,
            original_resume_mime_type="application/pdf",
            original_resume_size=len(file_content),
            resume_url="/uploads/resumes/test_preview_resume.pdf"
        )
        db.add(cand)
        db.commit()
        db.refresh(cand)

        response = client.get(
            f"/api/recruitment/candidates/{cand.id}/resume",
            headers=headers
        )

        assert response.status_code == 200
        assert "inline" in response.headers["content-disposition"]
        assert "Jane_Doe_Resume.pdf" in response.headers["content-disposition"]
        assert response.content == file_content

        # Verify audit log for RESUME_VIEWED
        audit = db.query(AuditLog).filter(AuditLog.action == "RESUME_VIEWED", AuditLog.record_id == str(cand.id)).first()
        assert audit is not None

    def test_get_candidate_resume_download_attachment(self, client, seed_test_data, db):
        recruiter_user = seed_test_data["hr_user"]
        headers = auth_header(recruiter_user.id, "HR_MANAGER")

        file_content = b"PK\x03\x04 Mock DOCX Resume Contents"
        save_dir = os.path.join(settings.UPLOAD_DIR, "resumes")
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, "test_doc_resume.docx")
        with open(file_path, "wb") as f:
            f.write(file_content)

        job = db.query(Job).first()
        cand = Candidate(
            job_id=job.id if job else 1,
            first_name="Michael",
            last_name="Scott",
            email="michael.scott@example.com",
            original_resume_filename="Michael_Scott_CV.docx",
            original_resume_storage_path=file_path,
            original_resume_mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            original_resume_size=len(file_content),
            resume_url="/uploads/resumes/test_doc_resume.docx"
        )
        db.add(cand)
        db.commit()
        db.refresh(cand)

        response = client.get(
            f"/api/recruitment/candidates/{cand.id}/resume?download=true",
            headers=headers
        )

        assert response.status_code == 200
        assert "attachment" in response.headers["content-disposition"]
        assert "Michael_Scott_CV.docx" in response.headers["content-disposition"]
        assert response.content == file_content

        # Verify audit log for RESUME_DOWNLOADED
        audit = db.query(AuditLog).filter(AuditLog.action == "RESUME_DOWNLOADED", AuditLog.record_id == str(cand.id)).first()
        assert audit is not None

    def test_candidate_can_view_own_resume_and_blocked_from_others(self, client, seed_test_data, db):
        # Create a candidate user
        candidate_user = User(
            email="candidate.applicant@example.com",
            hashed_password="hash",
            role=UserRole.CANDIDATE,
            is_active=True
        )
        other_candidate_user = User(
            email="other.candidate@example.com",
            hashed_password="hash",
            role=UserRole.CANDIDATE,
            is_active=True
        )
        db.add_all([candidate_user, other_candidate_user])
        db.commit()
        db.refresh(candidate_user)
        db.refresh(other_candidate_user)

        file_content = b"%PDF-1.4 Candidate Self Service Resume"
        save_dir = os.path.join(settings.UPLOAD_DIR, "resumes")
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, "test_self_resume.pdf")
        with open(file_path, "wb") as f:
            f.write(file_content)

        job = db.query(Job).first()
        cand = Candidate(
            job_id=job.id if job else 1,
            user_id=candidate_user.id,
            first_name="Candidate",
            last_name="Self",
            email=candidate_user.email,
            original_resume_filename="My_Personal_Resume.pdf",
            original_resume_storage_path=file_path,
            original_resume_mime_type="application/pdf",
            original_resume_size=len(file_content),
            resume_url="/uploads/resumes/test_self_resume.pdf"
        )
        db.add(cand)
        db.commit()
        db.refresh(cand)

        # 1. Candidate viewing own resume -> 200 OK
        own_headers = auth_header(candidate_user.id, "CANDIDATE")
        res1 = client.get(f"/api/recruitment/candidates/{cand.id}/resume", headers=own_headers)
        assert res1.status_code == 200
        assert res1.content == file_content

        # 2. Other candidate viewing someone else's resume -> 403 Forbidden
        other_headers = auth_header(other_candidate_user.id, "CANDIDATE")
        res2 = client.get(f"/api/recruitment/candidates/{cand.id}/resume", headers=other_headers)
        assert res2.status_code == 403

        # 3. Regular employee without recruiter role -> 403 Forbidden
        emp_user = seed_test_data["emp_user"]
        emp_headers = auth_header(emp_user.id, "EMPLOYEE")
        res3 = client.get(f"/api/recruitment/candidates/{cand.id}/resume", headers=emp_headers)
        assert res3.status_code == 403
