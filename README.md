# 🚀 AI-POWERED HUMAN RESOURCE MANAGEMENT SYSTEM (AI-HRMS)

> **An Enterprise-Grade, Full-Stack Intelligent HRMS Web Application**  
> Built with **FastAPI (Python 3.11+)**, **React 18 (TypeScript + Vite)**, **SQLAlchemy 2.0**, **Tailwind CSS**, **ReportLab PDF Engine**, **APScheduler**, and **NLP AI Intelligence**.

---

## 🌟 Executive Summary & Key Highlights

**AI-HRMS** is a production-style Human Resource Management System engineered to solve modern workplace challenges through automated business workflows and artificial intelligence:

- 📍 **GPS Geofenced Attendance**: Dual-layer Haversine distance verification restricting punch-ins strictly to $\le 100\text{m}$ of office coordinates.
- ⚡ **Multi-Tier Leave Approval Engine**:
  - **1-Day Leaves**: Auto-approved instantly by system rules.
  - **2-Day Leaves**: Automatically routed to the employee's **Team Leader**.
  - **3+ Day Leaves**: Routed to the **Department Manager** / HR.
- 💵 **Attendance-Based Payroll with ReportLab PDF Payslips**:
  - Automatically calculates Loss of Pay: $\text{LWP Deduction} = \left(\frac{\text{Monthly Salary}}{\text{Working Days}}\right) \times \text{LWP Days}$.
  - Generates downloadable, cryptographic-styled PDF salary slips.
- 🤖 **AI Resume Scanner & Candidate Matcher**:
  - Ingests **PDF** and **Word (.docx)** resumes.
  - Extracts competencies, experience, and education using NLP keyword analysis.
  - Computes matching percentage scores against job requirements and classifies departments.
- 💬 **Contextual AI HR Assistant**:
  - Embedded conversational assistant with zero-cost **AI Demo Mode** (`AI_DEMO_MODE=true`).
  - Answers employee queries about personal balances, attendance, and company policies with RBAC safeguards.
- 🛡️ **Dual-Layer RBAC (Role-Based Access Control)**:
  - 7 Distinct Roles: `SUPER_ADMIN`, `HR_MANAGER`, `DEPARTMENT_MANAGER`, `TEAM_LEADER`, `RECRUITER`, `EMPLOYEE`, `CANDIDATE`.
  - Enforced at both React Router and FastAPI dependency layers.

---

## 🔑 Demo Accounts & 1-Click Credentials

The login page includes **1-Click Demo Login Buttons** for instant evaluation:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **👑 Super Admin** | `admin@hrms.local` | `Admin@123` | Global control, system settings, geofence radius, all modules |
| **💼 HR Manager** | `hr@hrms.local` | `Hr@123` | Employee CRUD, leave review, payroll processing, recruitment |
| **👔 Dept Manager** | `deptmanager@hrms.local` | `Manager@123` | Department oversight, 3+ day leave approvals, staff metrics |
| **👥 Team Leader** | `teamlead@hrms.local` | `Leader@123` | Team attendance monitoring, 2-day leave approvals |
| **🎯 Recruiter** | `recruiter@hrms.local` | `Recruiter@123` | Job postings, candidate pipeline, AI Resume Scanner & Matcher |
| **💻 Employee** | `employee@hrms.local` | `Employee@123` | Live GPS punch-in/out, leave application, PDF payslip download |
| **📄 Candidate** | `candidate@hrms.local` | `Candidate@123` | Job browsing, resume submission, application tracking |

---

## 🏛️ System Architecture

```
+-------------------------------------------------------------------------+
|                              FRONTEND LAYER                             |
|       React 18 (TypeScript) + Vite 5 + Tailwind CSS + Lucide Icons       |
|  - Role-Tailored Dashboards (Admin, HR, Manager, Leader, Recruiter, Emp)|
|  - Live GPS Distance Radar (Navigator Geolocation vs 100m Geofence)     |
|  - Conversational AI HR Assistant Sliding Drawer                        |
+-------------------------------------------------------------------------+
                                    |
                            HTTP / REST (JSON)
                                    |
+-------------------------------------------------------------------------+
|                              BACKEND LAYER                              |
|                      FastAPI (Python 3.11+) + Uvicorn                   |
|                                                                         |
|  +--------------------+  +---------------------+  +------------------+  |
|  | Security & Auth    |  | Business Logic      |  | AI & Processing  |  |
|  | - JWT Bearer Tokens|  | - Haversine Formula |  | - PDF/DOCX Parser|  |
|  | - Direct Bcrypt    |  | - Multi-tier Leaves |  | - Skill Matcher  |  |
|  | - Dual-Layer RBAC  |  | - Attendance Payroll|  | - ReportLab PDF  |  |
|  | - Audit Trail Hook |  | - APScheduler Cron  |  | - AI Demo Mode   |  |
|  +--------------------+  +---------------------+  +------------------+  |
+-------------------------------------------------------------------------+
                                    |
                        SQLAlchemy ORM 2.0 Engine
                                    |
+-------------------------------------------------------------------------+
|                             DATABASE LAYER                              |
|           SQLite (Zero-config Demo) / PostgreSQL 15 (Docker Prod)       |
+-------------------------------------------------------------------------+
```

---

## 🛠️ Step-by-Step Quickstart Guide

### Prerequisites
- **Python 3.10+** (Tested on Python 3.11 & 3.13)
- **Node.js 18+** & **npm**

---

### Step 1: Start the Backend Server

1. Open a terminal in `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database with demo users, attendance, leaves, and jobs:
   ```bash
   python seed_data.py
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - **Backend API**: `http://localhost:8000`
   - **Swagger Docs**: `http://localhost:8000/docs`
   - **ReDoc**: `http://localhost:8000/redoc`

---

### Step 2: Start the Frontend Application

1. Open a second terminal in `frontend/`:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at **`http://localhost:5173`** (or the port displayed in terminal).

---

### Step 3: Run Automated Test Suite

To verify all mandatory business rules (1-day auto approve, 2-day TL approve, 3+ day Manager approve, 403 authorization checks, GPS distance limit, LWP salary deduction, and ReportLab payslips):

```bash
cd backend
pytest tests/test_mandatory_business_rules.py -v
```
*(All 9 automated unit/integration tests pass with 100% green status)*

---

## 🐳 Docker Deployment (One-Click)

To launch the complete multi-container stack (PostgreSQL + FastAPI + Vite Nginx Frontend):

```bash
docker-compose up --build
```

- **Frontend App**: `http://localhost`
- **Backend API**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`

---

## 🎤 College Project Demonstration Guide

### 1. The GPS Geofenced Attendance Demo
1. Log in as **Employee** (`employee@hrms.local`).
2. On the dashboard, view the **GPS Attendance Card**.
3. Toggle between **"📍 Simulating On-Site (12m)"** and **"⚠️ Simulating Remote (5km)"**.
4. Click **"Punch In Live"**:
   - Inside 100m $\rightarrow$ ✅ Success! Distance verified and attendance marked `VERIFIED`.
   - Outside 100m $\rightarrow$ ❌ Rejected with HTTP 400 and logged to security audit trail.

### 2. The Multi-Tier Leave Approval Demo
1. Click **"Apply for Leave"** on Employee dashboard.
2. Select **1 day** $\rightarrow$ Notice the workflow badge shows **"⚡ Auto-Approved Immediately"**. Submit and see it approved instantly!
3. Select **2 days** $\rightarrow$ Notice badge updates to **"👥 Routed to Team Leader"**.
4. Log in as **Team Leader** (`teamlead@hrms.local`) $\rightarrow$ View and approve the request.
5. Apply for **3+ days** as employee $\rightarrow$ Notice badge updates to **"👔 Routed to Department Manager"**.
6. Log in as **Department Manager** (`deptmanager@hrms.local`) $\rightarrow$ View and approve the request.

### 3. The AI Resume Scanner & Matcher Demo
1. Log in as **Recruiter** (`recruiter@hrms.local`).
2. Click **"Scan New Resume (PDF/DOCX)"**.
3. Upload any sample resume file $\rightarrow$ Watch the NLP engine extract skills, experience, recommend a department, and calculate a Match % against open jobs!

### 4. The Attendance-Based Payroll & PDF Payslip Demo
1. Log in as **HR Manager** (`hr@hrms.local`).
2. Go to **Payroll & Payslips** $\rightarrow$ Click **"Process Monthly Payroll"**.
3. The engine computes working days, identifies absent days as LWP, applies deductions, and compiles **ReportLab PDF payslips**.
4. Click **"Download PDF Payslip"** to view and print the official salary statement!

### 5. The Contextual AI HR Assistant Demo
1. Click the **"AI Assistant"** button in the header or sidebar.
2. Ask questions:
   - *"What is my attendance status today?"*
   - *"How many leaves do I have left?"*
   - *"Explain the 1-day leave auto approval policy"*
3. Notice how the AI assistant queries live database context to answer accurately!

---

## 📊 Database Schema DDL

The pure SQL schema is maintained at [`database/schema.sql`](file:///C:/Users/aniket/.gemini/antigravity/scratch/ai-hrms/database/schema.sql) and is fully compatible with both PostgreSQL and SQLite.

---

## 📄 License & Academic Attribution
This project is developed for college academic presentation and enterprise software portfolio demonstration.
Built with ❤️ by Senior Full-Stack Engineering standards.
