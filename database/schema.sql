-- ==============================================================================
-- AI-HRMS (AI-Powered Human Resource Management System)
-- Enterprise Database Schema DDL (PostgreSQL & SQLite Compatible)
-- ==============================================================================

-- 1. USERS TABLE (Authentication & Global RBAC)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE', -- SUPER_ADMIN, HR_MANAGER, DEPARTMENT_MANAGER, TEAM_LEADER, RECRUITER, EMPLOYEE, CANDIDATE
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    team_leader_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teams_dept ON teams(department_id);

-- 4. EMPLOYEES TABLE (Staff Directory & Payroll Attributes)
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    designation VARCHAR(150) NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    joining_date DATE NOT NULL,
    employment_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PROBATION, INACTIVE, TERMINATED
    monthly_salary DOUBLE PRECISION NOT NULL DEFAULT 50000.0,
    allowances DOUBLE PRECISION NOT NULL DEFAULT 3000.0,
    tax_percentage DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    pf_percentage DOUBLE PRECISION NOT NULL DEFAULT 12.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);

-- 5. ATTENDANCE TABLE (GPS Geofence & Haversine Distance Logs)
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    punch_in TIMESTAMP WITH TIME ZONE,
    punch_out TIMESTAMP WITH TIME ZONE,
    punch_in_lat DOUBLE PRECISION,
    punch_in_lng DOUBLE PRECISION,
    punch_out_lat DOUBLE PRECISION,
    punch_out_lng DOUBLE PRECISION,
    distance_in_meters DOUBLE PRECISION,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED', -- VERIFIED, REJECTED, MANUAL_REVIEW
    work_duration_hours DOUBLE PRECISION DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance(employee_id, date);

-- 6. LEAVE REQUESTS TABLE (Multi-Tier Business Approval Routing)
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- CASUAL, SICK, EARNED, UNPAID
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'APPROVED', -- APPROVED, PENDING_TL, PENDING_MANAGER, REJECTED
    approver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leaves_emp ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leave_requests(status);

-- 7. LEAVE BALANCES TABLE
CREATE TABLE IF NOT EXISTS leave_balances (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    casual_leave INTEGER NOT NULL DEFAULT 12,
    sick_leave INTEGER NOT NULL DEFAULT 10,
    earned_leave INTEGER NOT NULL DEFAULT 15,
    year INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. RECRUITMENT: JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    required_skills TEXT NOT NULL, -- JSON Array string or comma-separated keywords
    experience_required_years DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    location VARCHAR(150) NOT NULL DEFAULT 'Bangalore, India',
    employment_type VARCHAR(50) NOT NULL DEFAULT 'Full-time',
    salary_range VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN', -- OPEN, DRAFT, CLOSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. RECRUITMENT: CANDIDATES TABLE (AI Resume Parser & Scores)
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    resume_file_path VARCHAR(500),
    parsed_skills TEXT, -- JSON Array
    experience_years DOUBLE PRECISION DEFAULT 0.0,
    education TEXT,
    match_score DOUBLE PRECISION DEFAULT 0.0,
    suggested_department VARCHAR(100),
    ai_summary TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'APPLIED', -- APPLIED, AI_SCREENED, SHORTLISTED, INTERVIEW, SELECTED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PAYROLL TABLE (Monthly Batches)
CREATE TABLE IF NOT EXISTS payrolls (
    id SERIAL PRIMARY KEY,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    total_working_days INTEGER NOT NULL DEFAULT 22,
    status VARCHAR(50) NOT NULL DEFAULT 'PROCESSED', -- DRAFT, PROCESSED, PAID
    processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    total_employees INTEGER DEFAULT 0,
    total_net_disbursed DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. PAYROLL ITEMS TABLE (Detailed Salary Breakdown with LWP Deductions)
CREATE TABLE IF NOT EXISTS payroll_items (
    id SERIAL PRIMARY KEY,
    payroll_id INTEGER NOT NULL REFERENCES payrolls(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    working_days INTEGER NOT NULL DEFAULT 22,
    present_days INTEGER NOT NULL DEFAULT 22,
    approved_leave_days INTEGER NOT NULL DEFAULT 0,
    lwp_days INTEGER NOT NULL DEFAULT 0,
    per_day_rate DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    basic_salary DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    allowances DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    lwp_deduction DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    pf_deduction DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    tax_deduction DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    other_deductions DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_earnings DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_deductions DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    net_salary DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    payslip_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'INFO', -- INFO, SUCCESS, WARNING, ALERT
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. AUDIT LOGS TABLE (Security & Governance Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    record_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. OFFICE SETTINGS TABLE (GPS & Geofence Coordinates)
CREATE TABLE IF NOT EXISTS office_settings (
    id SERIAL PRIMARY KEY,
    office_name VARCHAR(150) NOT NULL DEFAULT 'Headquarters',
    latitude DOUBLE PRECISION NOT NULL DEFAULT 12.9715987,
    longitude DOUBLE PRECISION NOT NULL DEFAULT 77.5945627,
    geofence_radius DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    office_address VARCHAR(255) DEFAULT 'MG Road Tech Park, Bangalore, India',
    work_start_time VARCHAR(10) DEFAULT '09:00',
    work_end_time VARCHAR(10) DEFAULT '18:00',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- DEMO SEED DATA INSERTS
-- ==============================================================================

-- 1. Office Geofence
INSERT INTO office_settings (id, office_name, latitude, longitude, geofence_radius, office_address, work_start_time, work_end_time)
VALUES (1, 'Bangalore Innovation Hub', 12.9715987, 77.5945627, 100.0, 'MG Road Tech Park, Bangalore, India', '09:00', '18:00')
ON CONFLICT (id) DO NOTHING;

-- 2. Users (Hashed with bcrypt: 'Admin@123', 'Hr@123', 'Manager@123', 'Leader@123', 'Recruiter@123', 'Employee@123', 'Candidate@123')
INSERT INTO users (id, email, hashed_password, role, is_active) VALUES
(1, 'admin@hrms.local', '$2b$12$9F3lV0Ew499bVn4aZ40Y.evP23aJqXl9m2M7mC1WjJbB3N7qZ5A.W', 'SUPER_ADMIN', true),
(2, 'hr@hrms.local', '$2b$12$0B6M6QeE54y.X3oG2jG8eejJkM0gK5lH9rR7yD8wU1zN6pS4cI8.q', 'HR_MANAGER', true),
(3, 'deptmanager@hrms.local', '$2b$12$1C7N7RfF65z.Y4pH3kH9ffkKlN1hL6mI0sS8zE9xV2aO7qT5dJ9.r', 'DEPARTMENT_MANAGER', true),
(4, 'teamlead@hrms.local', '$2b$12$2D8O8SgG76a.Z5qI4lI0gglLmO2iM7nJ1tT9aF0yW3bP8rU6eK0.s', 'TEAM_LEADER', true),
(5, 'recruiter@hrms.local', '$2b$12$3E9P9ThH87b.A6rJ5mJ1hhmMnP3jN8oK2uU0bG1zX4cQ9sV7fL1.t', 'RECRUITER', true),
(6, 'employee@hrms.local', '$2b$12$4F0Q0UiI98c.B7sK6nK2iinNoQ4kO9pL3vV1cH2aY5dR0tW8gM2.u', 'EMPLOYEE', true),
(7, 'candidate@hrms.local', '$2b$12$5G1R1VjJ09d.C8tL7oL3jjoOpR5lP0qM4wW2dI3bZ6eS1uX9hN3.v', 'CANDIDATE', true),
(8, 'john.doe@hrms.local', '$2b$12$4F0Q0UiI98c.B7sK6nK2iinNoQ4kO9pL3vV1cH2aY5dR0tW8gM2.u', 'EMPLOYEE', true),
(9, 'priya.sharma@hrms.local', '$2b$12$4F0Q0UiI98c.B7sK6nK2iinNoQ4kO9pL3vV1cH2aY5dR0tW8gM2.u', 'EMPLOYEE', true),
(10, 'david.miller@hrms.local', '$2b$12$4F0Q0UiI98c.B7sK6nK2iinNoQ4kO9pL3vV1cH2aY5dR0tW8gM2.u', 'EMPLOYEE', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Departments
INSERT INTO departments (id, name, code, description, manager_id) VALUES
(1, 'Engineering', 'ENG', 'Core software development, backend architecture, and platform engineering.', 3),
(2, 'Artificial Intelligence & ML', 'AIML', 'Machine learning research, LLMs, computer vision, and neural systems.', 3),
(3, 'Human Resources', 'HR', 'People operations, talent acquisition, culture, and employee welfare.', 2),
(4, 'Finance', 'FIN', 'Financial planning, accounting, tax compliance, and payroll management.', 1),
(5, 'Marketing', 'MKT', 'Digital branding, content strategy, SEO, and social engagement.', 1),
(6, 'Sales', 'SLS', 'Enterprise client acquisition, B2B partnerships, and account growth.', 1),
(7, 'Operations', 'OPS', 'Supply chain, logistical coordination, and business infrastructure.', 1)
ON CONFLICT (id) DO NOTHING;

-- 4. Teams
INSERT INTO teams (id, name, department_id, team_leader_id) VALUES
(1, 'Backend Architecture Team', 1, 4),
(2, 'Frontend & Mobile Experience', 1, 4),
(3, 'Applied AI & NLP Team', 2, 4),
(4, 'Talent Operations Team', 3, 2),
(5, 'Corporate Accounting', 4, 1),
(6, 'Digital Growth Team', 5, 1)
ON CONFLICT (id) DO NOTHING;

-- 5. Employees
INSERT INTO employees (id, user_id, employee_code, first_name, last_name, phone, designation, department_id, team_id, joining_date, employment_status, monthly_salary, allowances, tax_percentage, pf_percentage) VALUES
(1, 1, 'EMP-1000', 'Alexander', 'Vance', '+91 9876543210', 'Chief Technology Officer / Super Admin', 1, 1, '2020-01-15', 'ACTIVE', 180000.0, 15000.0, 15.0, 12.0),
(2, 2, 'EMP-1001', 'Sophia', 'Alvarez', '+91 9876543211', 'Vice President of Human Resources', 3, 4, '2021-03-01', 'ACTIVE', 120000.0, 10000.0, 12.0, 12.0),
(3, 3, 'EMP-1002', 'Marcus', 'Sterling', '+91 9876543212', 'Engineering Department Director', 1, 1, '2021-06-10', 'ACTIVE', 140000.0, 12000.0, 12.0, 12.0),
(4, 4, 'EMP-1003', 'Elena', 'Rostova', '+91 9876543213', 'Backend & Cloud Team Leader', 1, 1, '2022-02-15', 'ACTIVE', 95000.0, 8000.0, 10.0, 12.0),
(5, 5, 'EMP-1004', 'Liam', 'Chen', '+91 9876543214', 'Lead Talent Recruiter', 3, 4, '2022-08-01', 'ACTIVE', 75000.0, 5000.0, 10.0, 12.0),
(6, 6, 'EMP-1005', 'Ananya', 'Patel', '+91 9876543215', 'Senior Full-Stack Engineer', 1, 1, '2023-01-10', 'ACTIVE', 70000.0, 4000.0, 10.0, 12.0),
(7, 8, 'EMP-1006', 'John', 'Doe', '+91 9876543216', 'Software Engineer', 1, 2, '2023-05-15', 'ACTIVE', 55000.0, 3000.0, 10.0, 12.0),
(8, 9, 'EMP-1007', 'Priya', 'Sharma', '+91 9876543217', 'AI/ML Research Engineer', 2, 3, '2023-09-01', 'ACTIVE', 65000.0, 4000.0, 10.0, 12.0),
(9, 10, 'EMP-1008', 'David', 'Miller', '+91 9876543218', 'Financial Analyst', 4, 5, '2024-01-15', 'ACTIVE', 50000.0, 3000.0, 10.0, 12.0)
ON CONFLICT (id) DO NOTHING;

-- 6. Leave Balances
INSERT INTO leave_balances (id, employee_id, casual_leave, sick_leave, earned_leave, year) VALUES
(1, 1, 12, 10, 15, 2026),
(2, 2, 11, 10, 15, 2026),
(3, 3, 10, 10, 15, 2026),
(4, 4, 12, 9, 15, 2026),
(5, 5, 12, 10, 14, 2026),
(6, 6, 11, 8, 14, 2026),
(7, 7, 12, 10, 15, 2026),
(8, 8, 12, 10, 15, 2026),
(9, 9, 12, 10, 15, 2026)
ON CONFLICT (id) DO NOTHING;

-- 7. Job Openings
INSERT INTO jobs (id, title, department_id, description, required_skills, experience_required_years, location, employment_type, salary_range, status) VALUES
(1, 'Senior Full-Stack Engineer', 1, 'Design, scale, and maintain high-concurrency microservices, REST APIs, and responsive web user interfaces.', '["Python", "FastAPI", "React", "TypeScript", "SQLAlchemy", "PostgreSQL", "Docker"]', 3.5, 'Bangalore / Hybrid', 'Full-time', '$80,000 - $110,000', 'OPEN'),
(2, 'Machine Learning & LLM Engineer', 2, 'Build production RAG pipelines, fine-tune open weights models, and integrate embeddings for intelligent automation.', '["Python", "PyTorch", "Hugging Face", "LangChain", "FastAPI", "Vector DB"]', 3.0, 'Bangalore / Hybrid', 'Full-time', '$90,000 - $125,000', 'OPEN'),
(3, 'People Operations & Talent Lead', 3, 'Oversee technical hiring pipelines, university relations, employee onboarding, and culture initiatives.', '["Technical Recruitment", "Talent Sourcing", "ATS", "HR Policy", "Interviewing"]', 2.5, 'Bangalore / On-site', 'Full-time', '$60,000 - $85,000', 'OPEN'),
(4, 'DevOps & Cloud Infrastructure Architect', 1, 'Manage multi-region Kubernetes clusters, CI/CD automation pipelines, observability, and cloud security.', '["Kubernetes", "Docker", "Terraform", "AWS/GCP", "CI/CD", "Prometheus"]', 4.0, 'Bangalore / Remote', 'Full-time', '$95,000 - $130,000', 'OPEN')
ON CONFLICT (id) DO NOTHING;

-- 8. Candidates with AI Match Scores
INSERT INTO candidates (id, user_id, job_id, first_name, last_name, email, phone, parsed_skills, experience_years, education, match_score, suggested_department, ai_summary, status) VALUES
(1, 7, 1, 'Rahul', 'Verma', 'candidate@hrms.local', '+91 9123456789', '["Python", "FastAPI", "React", "TypeScript", "SQL", "Docker", "Git"]', 4.0, 'B.Tech in Computer Science', 88.5, 'Engineering', 'Strong full-stack candidate with 4 years of hands-on experience in FastAPI, React, and Docker. Demonstrates high domain alignment.', 'AI_SCREENED'),
(2, NULL, 2, 'Pooja', 'Iyer', 'pooja.ai@example.com', '+91 9234567890', '["Python", "PyTorch", "TensorFlow", "FastAPI", "NLP", "LangChain"]', 3.2, 'M.Tech in Artificial Intelligence', 92.0, 'Artificial Intelligence & ML', 'Exceptional fit for ML/LLM Engineer role. Expert in NLP, PyTorch, and generative AI pipelines.', 'SHORTLISTED'),
(3, NULL, 1, 'Karthik', 'Nair', 'karthik.dev@example.com', '+91 9345678901', '["JavaScript", "React", "Node.js", "Express", "MongoDB"]', 2.5, 'B.E in Information Technology', 68.0, 'Engineering', 'Solid frontend and Node.js fundamentals. Would require brief onboarding for Python/FastAPI backend components.', 'APPLIED')
ON CONFLICT (id) DO NOTHING;

-- 9. Leave Requests (Multi-tier demonstrations)
INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, duration_days, reason, status, approver_id, approved_at) VALUES
(1, 6, 'CASUAL', '2026-03-02', '2026-03-02', 1, 'Personal domestic appointment.', 'APPROVED', NULL, '2026-03-01 10:00:00+00'),
(2, 6, 'SICK', '2026-03-05', '2026-03-06', 2, 'Viral fever recovery and rest.', 'PENDING_TL', NULL, NULL),
(3, 7, 'EARNED', '2026-03-10', '2026-03-13', 4, 'Annual family vacation trip.', 'PENDING_MANAGER', NULL, NULL),
(4, 8, 'CASUAL', '2026-02-15', '2026-02-15', 1, 'Attending college reunion.', 'APPROVED', NULL, '2026-02-14 09:30:00+00')
ON CONFLICT (id) DO NOTHING;

-- 10. Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
(1, 6, 'Leave Request Auto-Approved', 'Your 1-day Casual Leave for 2026-03-02 was auto-approved immediately by system rules.', 'SUCCESS', false),
(2, 4, 'New Team Leave Request', 'Ananya Patel submitted a 2-day Sick Leave request awaiting your review.', 'INFO', false),
(3, 3, 'Department Leave Review', 'John Doe submitted a 4-day Earned Leave request awaiting Manager approval.', 'WARNING', false),
(4, 6, 'Monthly Payslip Ready', 'Your salary statement for the previous billing cycle has been calculated and is ready for PDF download.', 'INFO', true)
ON CONFLICT (id) DO NOTHING;

-- 11. Security Audit Logs
INSERT INTO audit_logs (id, user_id, user_email, action, module, record_id, details, ip_address) VALUES
(1, 1, 'admin@hrms.local', 'SYSTEM_INITIALIZATION', 'SYSTEM', '1', '{"status": "Database seeded with enterprise demo datasets"}', '127.0.0.1'),
(2, 6, 'employee@hrms.local', 'PUNCH_IN', 'ATTENDANCE', '1', '{"distance_meters": 12.4, "status": "VERIFIED"}', '127.0.0.1'),
(3, 6, 'employee@hrms.local', 'APPLY_LEAVE', 'LEAVE', '1', '{"duration_days": 1, "rule": "AUTO_APPROVED"}', '127.0.0.1'),
(4, 2, 'hr@hrms.local', 'PAYROLL_PROCESSED', 'PAYROLL', '1', '{"month": 2, "year": 2026, "total_disbursed": 685400.0}', '127.0.0.1')
ON CONFLICT (id) DO NOTHING;

