# Functional Requirements Specification (FRS)
# AI-Powered Human Resource Management System (AI-HRMS)

---

## 1. Authentication & Security Specification
- **FR-AUTH-01**: System shall authenticate users via email and bcrypt-hashed password ($rounds=12$).
- **FR-AUTH-02**: System shall issue signed JWT access tokens containing user ID and Role.
- **FR-AUTH-03**: System shall enforce dual-layer RBAC on 100% of endpoints via FastAPI dependency `require_roles(*roles)`.
- **FR-AUTH-04**: System shall provide 1-click demo login buttons for all 7 roles on the login page for demonstration ease.

---

## 2. Attendance & GPS Geofence Specification
- **FR-ATT-01**: System shall calculate the distance between employee coordinates $(lat_1, lon_1)$ and office setting $(lat_2, lon_2)$ using the **Haversine Formula**:
  $$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
  $$c = 2 \cdot \operatorname{atan2}\left(\sqrt{a}, \sqrt{1-a}\right), \quad d = R \cdot c \quad (R = 6,371,000\text{ m})$$
- **FR-ATT-02**: If $d \le 100.0\text{ meters}$, attendance is marked `VERIFIED` and punch timestamp is logged.
- **FR-ATT-03**: If $d > 100.0\text{ meters}$, attendance punch-in MUST be rejected with HTTP 400 status and recorded as a potential violation in the audit trail.
- **FR-ATT-04**: Punch-out automatically computes `work_duration_hours` = $(\text{punch\_out} - \text{punch\_in})$.

---

## 3. Leave Management Specification
- **FR-LEV-01**: Every full-time employee is allocated standard annual balances: 12 Casual Leaves, 10 Sick Leaves, 15 Earned Leaves.
- **FR-LEV-02**: When applying for leave, duration in days is calculated as $(end\_date - start\_date + 1)$.
- **FR-LEV-03 (1-Day Rule)**: If duration $= 1$ day, the system MUST immediately auto-approve the request (`status = APPROVED`) and decrement the respective leave balance.
- **FR-LEV-04 (2-Day Rule)**: If duration $= 2$ days, the system routes the request to `PENDING_TL`. Only `TEAM_LEADER`, `HR_MANAGER`, or `SUPER_ADMIN` can approve.
- **FR-LEV-05 (3+ Day Rule)**: If duration $\ge 3$ days, the system routes the request to `PENDING_MANAGER`. Only `DEPARTMENT_MANAGER`, `HR_MANAGER`, or `SUPER_ADMIN` can approve.

---

## 4. Payroll & Deduction Formulation Specification
- **FR-PAY-01**: Standard monthly payroll formula calculations:
  - **Per-Day Rate**: $\text{Per-Day} = \frac{\text{Monthly Salary}}{\text{Total Working Days}}$
  - **Payable Days**: $\text{Present Days} + \text{Approved Leave Days}$
  - **LWP Days**: $\max(0, \text{Total Working Days} - \text{Payable Days})$
  - **LWP Deduction**: $\text{Per-Day} \times \text{LWP Days}$
  - **Total Earnings**: $\text{Monthly Salary} + \text{Allowances}$
  - **Total Deductions**: $\text{LWP Deduction} + \left(\text{Monthly Salary} \times \frac{\text{PF \%}}{100}\right) + \left(\text{Monthly Salary} \times \frac{\text{Tax \%}}{100}\right)$
  - **Net Disbursed Salary**: $\text{Total Earnings} - \text{Total Deductions}$
- **FR-PAY-02**: System automatically generates a high-resolution, printable PDF payslip via Python `reportlab` stored at `uploads/payslips/`.
- **FR-PAY-03**: Employees can only download their own payslips. Managers can only download department member payslips.

---

## 5. AI Recruitment & Parser Specification
- **FR-REC-01**: System parses uploaded PDF and Word DOCX resumes via `pypdf` and `python-docx`.
- **FR-REC-02**: System extracts candidate name, contact email, phone, experience years, and technical competencies.
- **FR-REC-03**: System computes matching percentage score against target Job Description:
  $$\text{Match Score} = \left(\frac{|\text{Extracted Skills} \cap \text{Required Skills}|}{|\text{Required Skills}|} \times 70\right) + \left(\min\left(1.0, \frac{\text{Candidate Exp}}{\text{Required Exp}}\right) \times 30\right)$$
- **FR-REC-04**: System classifies the most appropriate department for the candidate profile.

---

## 6. AI HR Assistant Specification
- **FR-AST-01**: Interactive assistant answers user questions regarding personal attendance, leave balances, payslip records, and company rules.
- **FR-AST-02**: Operates in zero-cost **AI Demo Mode** (`AI_DEMO_MODE=true`) using contextual intent matching and structured database queries, or integrates with live LLM APIs.
- **FR-AST-03**: Respects RBAC safeguards—an employee asking for another employee's private compensation receives a polite authorization refusal.
