# REST API Documentation
# AI-Powered Human Resource Management System (AI-HRMS)

Base URL: `http://localhost:8000/api`
Interactive Swagger Docs: `http://localhost:8000/docs`
ReDoc: `http://localhost:8000/redoc`

---

## 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticate with email and password, return JWT token | Public |
| `POST` | `/auth/logout` | Invalidate current session | Authenticated |
| `GET` | `/auth/me` | Retrieve profile of authenticated user | Authenticated |

---

## 2. Employees (`/api/employees`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/employees` | List employees with pagination and filters | Admin, HR, Manager, Team Leader |
| `POST` | `/employees` | Create a new employee record and login | Admin, HR |
| `GET` | `/employees/{id}` | Get employee profile details | Admin, HR, Manager, Owner |
| `PUT` | `/employees/{id}` | Update employee profile/compensation | Admin, HR |
| `DELETE` | `/employees/{id}` | Deactivate employee | Admin, HR |

---

## 3. Departments & Teams (`/api/departments` & `/api/teams`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/departments` | List all departments and sub-teams | All Staff |
| `POST` | `/departments` | Create new department | Admin, HR |
| `GET` | `/departments/{id}` | Get department by ID | All Staff |
| `PUT` | `/departments/{id}` | Update department details | Admin, HR |
| `GET` | `/teams` | List teams | All Staff |
| `POST` | `/teams` | Create new sub-team | Admin, HR |

---

## 4. Attendance & GPS (`/api/attendance`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/attendance/punch-in` | GPS verified punch in ($\le 100\text{m}$) | Employee, Staff |
| `POST` | `/attendance/punch-out` | GPS verified punch out | Employee, Staff |
| `GET` | `/attendance/my` | Get current employee's attendance logs | Authenticated Employee |
| `GET` | `/attendance/team` | Get team/department attendance logs | Team Leader, Manager |
| `GET` | `/attendance/all` | Get company-wide attendance logs | Admin, HR |

---

## 5. Leaves (`/api/leaves`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/leaves/apply` | Apply for leave (1-day auto, 2-day TL, 3+ day Manager) | Employee, Staff |
| `GET` | `/leaves/my` | Get current employee's leave applications | Authenticated Employee |
| `GET` | `/leaves/balance` | Get remaining leave balances | Authenticated Employee |
| `GET` | `/leaves/pending` | Get leave requests requiring caller's approval | Leader, Manager, HR, Admin |
| `PUT` | `/leaves/{id}/approve` | Approve a pending leave request | Authorized Approver |
| `PUT` | `/leaves/{id}/reject` | Reject a pending leave request | Authorized Approver |

---

## 6. Recruitment & Resumes (`/api/recruitment` & `/api/resumes`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/recruitment/jobs` | List active job openings | Public / All Staff |
| `POST` | `/recruitment/jobs` | Create new job opening | Admin, HR, Recruiter |
| `PUT` | `/recruitment/jobs/{id}` | Update job opening | Admin, HR, Recruiter |
| `DELETE` | `/recruitment/jobs/{id}` | Delete/close job opening | Admin, HR, Recruiter |
| `GET` | `/recruitment/candidates` | List candidates and match scores | Admin, HR, Recruiter |
| `PUT` | `/recruitment/candidates/{id}/status` | Update candidate status in funnel | Admin, HR, Recruiter |
| `POST` | `/resumes/upload` | Upload PDF/DOCX resume for AI skill extraction | Public / Recruiter |

---

## 7. Payroll & Payslips (`/api/payroll` & `/api/payslips`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/payroll` | List monthly payroll batches | Admin, HR |
| `POST` | `/payroll/generate` | Run automated attendance-based payroll batch | Admin, HR |
| `GET` | `/payroll/my` | Get current employee's salary history | Authenticated Employee |
| `GET` | `/payslips/{id}` | Get payslip item breakdown | Owner, Manager, HR, Admin |
| `GET` | `/payslips/{id}/download` | Download official ReportLab PDF payslip | Owner, Manager, HR, Admin |

---

## 8. AI HR Assistant & Matching (`/api/ai`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/hr-assistant/chat` | Chat with contextual AI HR Assistant | All Authenticated Users |
| `POST` | `/ai/resume/match` | Compare candidate skills against target job description | Admin, HR, Recruiter |
| `POST` | `/ai/classify-department` | AI recommendation of best department based on skills | Admin, HR, Recruiter |

---

## 9. Reports, Audit & Settings (`/api/reports`, `/api/audit-logs`, `/api/settings`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/reports/summary` | Get aggregated dashboard KPIs | Authenticated Staff |
| `GET` | `/reports/attendance/export` | Download complete Attendance CSV | Admin, HR |
| `GET` | `/reports/payroll/export` | Download complete Payroll CSV | Admin, HR |
| `GET` | `/audit-logs` | List security audit trail events | Admin, HR |
| `GET` | `/settings/office` | Get office GPS coordinates and geofence radius | Authenticated Staff |
| `PUT` | `/settings/office` | Update office GPS geofence rules | Admin, HR |
