# Technical Requirements Document (TRD)
# AI-Powered Human Resource Management System (AI-HRMS)

---

## 1. System Architecture
AI-HRMS is architected as a modern, decoupled client-server web application with modular service layers.

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|   React 18 + TypeScript + Vite + Tailwind CSS + Lucide React + Axios     |
|   (Role-Based Navigation, Geolocation Radar, In-App AI Assistant Drawer)|
+-------------------------------------------------------------------------+
                                    |
                            HTTP / REST (JSON)
                                    |
+-------------------------------------------------------------------------+
|                              SERVER LAYER                               |
|              FastAPI (Python 3.11+) + Uvicorn ASGI Server               |
|                                                                         |
|  +--------------------+  +---------------------+  +------------------+  |
|  | Core & Middleware  |  | Business Services   |  | Background Tasks |  |
|  | - JWT Auth & RBAC  |  | - Haversine GPS     |  | - APScheduler    |  |
|  | - CORS & Logging   |  | - Multi-tier Leaves |  |   Payroll Cron   |  |
|  | - Audit Trail Hook |  | - LWP Deductions    |  | - Auto Reminders |  |
|  | - Pydantic Schemas |  | - NLP Resume Matcher|  |                  |  |
|  |                    |  | - ReportLab PDF     |  |                  |  |
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

## 2. Technology Stack Details
### Frontend
- **Framework**: React 18 with TypeScript 5
- **Build Tool**: Vite 5 (Fast HMR, optimized production bundling)
- **Styling**: Tailwind CSS with custom palette and glassmorphic accents
- **Icons**: Lucide React
- **State Management**: React Context API (`AuthContext`, `NotificationContext`)
- **HTTP Client**: Axios with automatic JWT Authorization interceptor

### Backend
- **Framework**: FastAPI (High-performance asynchronous Python framework)
- **Database ORM**: SQLAlchemy 2.0 with connection pooling
- **Data Validation**: Pydantic v2
- **Authentication**: JWT (JSON Web Tokens) with direct bcrypt password hashing
- **PDF Generation**: ReportLab toolkit (Draws official company header, salary grid, and authorization stamps)
- **Document Processing**: `pypdf` (PDF text extraction) and `python-docx` (DOCX parsing)
- **Scheduler**: APScheduler (Automated monthly cron execution)

---

## 3. Database Schema Overview
1. `users`: System login credentials, bcrypt password hashes, and user role.
2. `departments`: Functional business units and assigned department manager.
3. `teams`: Sub-units under departments and assigned team leader.
4. `employees`: Staff directory, designation, compensation parameters (Basic, Allowances, PF %, Tax %).
5. `attendance`: Daily logs, punch-in/out timestamps, GPS coordinates, Haversine distance, verification status.
6. `leave_requests`: Leave applications, start/end dates, duration, multi-tier status (`APPROVED`, `PENDING_TL`, `PENDING_MANAGER`, `REJECTED`).
7. `leave_balances`: Annual allowances for Casual, Sick, and Earned leaves.
8. `jobs`: Vacancy postings, required skills array, experience requirements, and status.
9. `candidates`: Applicant profiles, uploaded resumes, parsed skills, AI match score %, and hiring status.
10. `payrolls`: Monthly batch ledger and total disbursements.
11. `payroll_items`: Detailed employee payslip calculation (Working days, Present days, LWP days, LWP deduction, PF, Tax, Net pay, PDF URL).
12. `notifications`: In-app user notifications and read status.
13. `audit_logs`: Immutable security event log.
14. `office_settings`: Configurable office GPS latitude, longitude, and geofence radius.
