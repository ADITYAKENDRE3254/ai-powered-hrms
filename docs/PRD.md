# Product Requirements Document (PRD)
# AI-Powered Human Resource Management System (AI-HRMS)

---

## 1. Executive Summary & Vision
**AI-HRMS** is an enterprise-grade, full-stack Human Resource Management System built to modernize staff management, attendance tracking, leave governance, recruitment pipelines, and payroll calculation. Designed with real-time GPS geofencing, multi-tier automated leave workflows, NLP-driven resume parsing, attendance-based salary formulation with ReportLab PDF payslip generation, and an embedded context-aware AI HR Assistant, AI-HRMS provides a complete digital workplace solution.

---

## 2. Target Personas & User Roles
1. **Super Admin**: Complete organizational governance, system parameters, office GPS geofence configuration, security audits, and department orchestration.
2. **HR Manager**: Employee onboarding/offboarding, salary structure configuration, company-wide leave review, payroll processing, and recruitment oversight.
3. **Department Manager**: Departmental team allocations, attendance tracking, and mandatory review of $\ge 3$-day leave requests.
4. **Team Leader**: Immediate team supervision, daily attendance monitoring, and review of 2-day leave requests.
5. **Recruiter**: Job openings publication, resume upload/NLP parsing, candidate match score evaluation, and applicant tracking.
6. **Employee**: Self-service portal, GPS-geofenced punch-in/out, leave balance tracking and applications, monthly PDF payslip downloads, and conversational AI HR assistant.
7. **Candidate**: Career portal exploration, job searching, and resume submission with automated AI skill extraction.

---

## 3. Core Business Problem Statements & Solutions
| Problem | Traditional HR Systems | AI-HRMS Solution |
| :--- | :--- | :--- |
| **Attendance Buddy Punching & Remote Fraud** | Unverified check-ins or manual paper registers | Dual-layer Haversine GPS distance calculation restricting punch-ins strictly to $\le 100\text{m}$ of office coordinates. |
| **Leave Approval Bottlenecks** | Manual paperwork or all requests clogging HR inboxes | Multi-tier rules: 1-day auto-approval, 2-day Team Leader routing, 3+ day Manager routing. |
| **Recruitment Screening Latency** | Recruiters spend 40+ hours manually reading resumes | NLP text extraction (PDF/DOCX), automated skill scoring against job requirements, and department classification. |
| **Payroll Inaccuracies & LWP Disputes** | Disconnected attendance and salary calculations | Strict attendance-based formula: $\text{LWP Deduction} = (\text{Monthly Salary} / \text{Working Days}) \times \text{LWP Days}$, with downloadable PDF payslips. |
| **Staff Inquiry Overload** | HR managers constantly answering basic leave & policy queries | Contextual, RBAC-aware AI HR Assistant answering balance, attendance, and policy questions 24/7. |

---

## 4. Key Functional Modules
1. **Authentication & Dual-Layer RBAC**: JSON Web Tokens (JWT) with bcrypt hashing, strict frontend route gates and backend endpoint dependency checks.
2. **Employee Lifecycle Management**: Staff directory, department/team mapping, compensation structures, and status transitions.
3. **GPS Geofenced Attendance**: Browser geolocation + Haversine formula distance verification ($\le 100\text{m}$).
4. **Intelligent Leave Management**: Leave balance accounting, dynamic duration calculation, and automated hierarchical approvals.
5. **Automated Attendance-Based Payroll**: Monthly payroll runs, automated LWP deductions, and ReportLab PDF payslip generation.
6. **AI Resume Parser & Job Matcher**: Multi-format document parser, skill dictionary matcher, and confidence scoring.
7. **Generative AI HR Assistant**: Conversational assistant with fallback Demo Mode answering employee and policy queries.
8. **In-App Notifications**: Real-time alerts for approvals, rejections, and system events.
9. **Audit Trail & Governance**: Immutable logging of all user activities, IP addresses, and actions.
10. **Reports & Analytics**: Visual charts with one-click CSV export for Attendance, Payroll, and Recruitment datasets.
