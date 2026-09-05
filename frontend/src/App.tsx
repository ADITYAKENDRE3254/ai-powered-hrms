import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { CommandPalette } from './components/common/CommandPalette';
import { AIHRAssistantDrawer } from './components/ai/AIHRAssistantDrawer';

// Pages
import { Login } from './pages/auth/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { HRDashboard } from './pages/hr/HRDashboard';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { TeamLeaderDashboard } from './pages/team-leader/TeamLeaderDashboard';
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { CandidatePortal } from './pages/candidate/CandidatePortal';
import { EmployeesPage } from './pages/EmployeesPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavesPage } from './pages/LeavesPage';
import { RecruitmentPage } from './pages/RecruitmentPage';
import { PayrollPage } from './pages/PayrollPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkforceDashboard } from './pages/workforce/WorkforceDashboard';
import { PerformanceInsights } from './pages/workforce/PerformanceInsights';
import { AttritionInsights } from './pages/workforce/AttritionInsights';
import { SkillIntelligence } from './pages/workforce/SkillIntelligence';
import { DepartmentIntelligence } from './pages/workforce/DepartmentIntelligence';
import { MyAIInsights } from './pages/workforce/MyAIInsights';
import { TrainingDashboard } from './pages/training/TrainingDashboard';
import { MyTraining } from './pages/training/MyTraining';

// Layout Container
const AppLayout: React.FC<{ children: React.ReactNode; pageTitle: string; pageSubtitle?: string }> = ({
  children,
  pageTitle,
  pageSubtitle,
}) => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleOpenCommandPalette = () => setIsCommandPaletteOpen(true);
    window.addEventListener('open-command-palette', handleOpenCommandPalette);
    return () => window.removeEventListener('open-command-palette', handleOpenCommandPalette);
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-navy-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar onOpenAIChat={() => setIsAIChatOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={pageTitle}
          subtitle={pageSubtitle}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        <main className="flex-1 p-5 sm:p-7 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">{children}</main>
      </div>
      <AIHRAssistantDrawer isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenAIChat={() => {
          setIsCommandPaletteOpen(false);
          setIsAIChatOpen(true);
        }}
      />
    </div>
  );
};

const RootRedirector: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-300">Loading AI-HRMS Workspace...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'SUPER_ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'HR_MANAGER':
      return <Navigate to="/hr/dashboard" replace />;
    case 'DEPARTMENT_MANAGER':
      return <Navigate to="/manager/dashboard" replace />;
    case 'TEAM_LEADER':
      return <Navigate to="/team-leader/dashboard" replace />;
    case 'RECRUITER':
      return <Navigate to="/recruiter/dashboard" replace />;
    case 'EMPLOYEE':
      return <Navigate to="/employee/dashboard" replace />;
    case 'CANDIDATE':
      return <Navigate to="/candidate/portal" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Root Intelligent Navigation */}
            <Route path="/" element={<RootRedirector />} />

            {/* Role Dashboards */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <AppLayout pageTitle="Super Admin Control Center" pageSubtitle="Global organizational management & metrics">
                    <AdminDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/hr/dashboard"
              element={
                <ProtectedRoute allowedRoles={['HR_MANAGER']}>
                  <AppLayout pageTitle="HR Management Dashboard" pageSubtitle="Employee records, approvals & payroll cycles">
                    <HRDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/manager/dashboard"
              element={
                <ProtectedRoute allowedRoles={['DEPARTMENT_MANAGER']}>
                  <AppLayout pageTitle="Department Manager Dashboard" pageSubtitle="Departmental staff & 3+ day leave governance">
                    <ManagerDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/team-leader/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TEAM_LEADER']}>
                  <AppLayout pageTitle="Team Leader Dashboard" pageSubtitle="Team operations & 2-day leave approvals">
                    <TeamLeaderDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/recruiter/dashboard"
              element={
                <ProtectedRoute allowedRoles={['RECRUITER']}>
                  <AppLayout pageTitle="Recruiter Talent Dashboard" pageSubtitle="AI resume parsing & candidate matching">
                    <RecruiterDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                  <AppLayout pageTitle="Employee Workspace" pageSubtitle="Live GPS attendance, leave balances & payslips">
                    <EmployeeDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/candidate/portal"
              element={
                <ProtectedRoute allowedRoles={['CANDIDATE', 'SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER']}>
                  <AppLayout pageTitle="Careers & Candidate Portal" pageSubtitle="Search open positions and apply with your resume">
                    <CandidatePortal />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Core Functional Modules */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER']}>
                  <AppLayout pageTitle="Employee Management" pageSubtitle="Staff directory, profiles, designations & compensation">
                    <EmployeesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/departments"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER']}>
                  <AppLayout pageTitle="Departments & Teams" pageSubtitle="Organizational structure and department leaders">
                    <DepartmentsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER', 'EMPLOYEE']}>
                  <AppLayout pageTitle="Attendance & GPS Geofencing" pageSubtitle="Haversine distance calculation and shift logs">
                    <AttendancePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/leaves"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER', 'EMPLOYEE']}>
                  <AppLayout pageTitle="Intelligent Leave Management" pageSubtitle="1-day auto approval, 2-day TL, 3+ day Manager routing">
                    <LeavesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/recruitment"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER']}>
                  <AppLayout pageTitle="Recruitment & AI Matching" pageSubtitle="Candidate skill extraction and vacancy management">
                    <RecruitmentPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/payroll"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'EMPLOYEE']}>
                  <AppLayout pageTitle="Attendance-Based Payroll" pageSubtitle="Salary computation, LWP deductions & ReportLab PDF payslips">
                    <PayrollPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']}>
                  <AppLayout pageTitle="Reports & Data Export" pageSubtitle="Analytics charts and CSV downloads">
                    <ReportsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER']}>
                  <AppLayout pageTitle="Audit Trail & Security" pageSubtitle="Immutable event logging and governance">
                    <AuditLogsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER']}>
                  <AppLayout pageTitle="System & Geofence Settings" pageSubtitle="Office location coordinates and radius rules">
                    <SettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* AI Workforce Intelligence Routes */}
            <Route
              path="/workforce-intelligence"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER']}>
                  <AppLayout pageTitle="AI Workforce Intelligence" pageSubtitle="Predictive performance, retention risk, skill gaps & training roadmaps">
                    <WorkforceDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/workforce-intelligence/performance"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER']}>
                  <AppLayout pageTitle="Performance Predictions" pageSubtitle="Multi-factor performance evaluations and growth actions">
                    <PerformanceInsights />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/workforce-intelligence/attrition"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']}>
                  <AppLayout pageTitle="Attrition Risk Radar" pageSubtitle="Confidential retention indicators, protective signals & interventions">
                    <AttritionInsights />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/workforce-intelligence/skills"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER']}>
                  <AppLayout pageTitle="Skill Intelligence Hub" pageSubtitle="Employee competency profiles, role benchmark gaps & future skills">
                    <SkillIntelligence />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/workforce-intelligence/departments"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']}>
                  <AppLayout pageTitle="Department Matrix" pageSubtitle="Departmental metrics, skill density & talent heatmaps">
                    <DepartmentIntelligence />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-ai-insights"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEE', 'SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER', 'RECRUITER']}>
                  <AppLayout pageTitle="My AI Growth Insights" pageSubtitle="Personal performance signals, skill portfolio & career recommendations">
                    <MyAIInsights />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Training Management Routes */}
            <Route
              path="/training"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']}>
                  <AppLayout pageTitle="Training & Learning Management" pageSubtitle="Enterprise course catalog, employee assignments & certifications">
                    <TrainingDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-training"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEE', 'SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER', 'RECRUITER']}>
                  <AppLayout pageTitle="My Training & Upskilling" pageSubtitle="Course progress tracking, certificate upload & skill completion">
                    <MyTraining />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
  );
};
export default App;
