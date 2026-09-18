import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { CommandPalette } from './components/common/CommandPalette';
import { AIHRAssistantDrawer } from './components/ai/AIHRAssistantDrawer';
import { Analytics } from '@vercel/analytics/react';

// Lazy-Loaded Page Components for Optimized Route Code-Splitting
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const HRDashboard = lazy(() => import('./pages/hr/HRDashboard').then(m => ({ default: m.HRDashboard })));
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard').then(m => ({ default: m.ManagerDashboard })));
const TeamLeaderDashboard = lazy(() => import('./pages/team-leader/TeamLeaderDashboard').then(m => ({ default: m.TeamLeaderDashboard })));
const RecruiterDashboard = lazy(() => import('./pages/recruiter/RecruiterDashboard').then(m => ({ default: m.RecruiterDashboard })));
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard').then(m => ({ default: m.EmployeeDashboard })));
const CandidatePortal = lazy(() => import('./pages/candidate/CandidatePortal').then(m => ({ default: m.CandidatePortal })));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage').then(m => ({ default: m.EmployeesPage })));
const DepartmentsPage = lazy(() => import('./pages/DepartmentsPage').then(m => ({ default: m.DepartmentsPage })));
const AttendancePage = lazy(() => import('./pages/AttendancePage').then(m => ({ default: m.AttendancePage })));
const LeavesPage = lazy(() => import('./pages/LeavesPage').then(m => ({ default: m.LeavesPage })));
const RecruitmentPage = lazy(() => import('./pages/RecruitmentPage').then(m => ({ default: m.RecruitmentPage })));
const PayrollPage = lazy(() => import('./pages/PayrollPage').then(m => ({ default: m.PayrollPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const WorkforceDashboard = lazy(() => import('./pages/workforce/WorkforceDashboard').then(m => ({ default: m.WorkforceDashboard })));
const PerformanceInsights = lazy(() => import('./pages/workforce/PerformanceInsights').then(m => ({ default: m.PerformanceInsights })));
const AttritionInsights = lazy(() => import('./pages/workforce/AttritionInsights').then(m => ({ default: m.AttritionInsights })));
const SkillIntelligence = lazy(() => import('./pages/workforce/SkillIntelligence').then(m => ({ default: m.SkillIntelligence })));
const DepartmentIntelligence = lazy(() => import('./pages/workforce/DepartmentIntelligence').then(m => ({ default: m.DepartmentIntelligence })));
const MyAIInsights = lazy(() => import('./pages/workforce/MyAIInsights').then(m => ({ default: m.MyAIInsights })));
const TrainingDashboard = lazy(() => import('./pages/training/TrainingDashboard').then(m => ({ default: m.TrainingDashboard })));
const MyTraining = lazy(() => import('./pages/training/MyTraining').then(m => ({ default: m.MyTraining })));
const CompensationPage = lazy(() => import('./pages/CompensationPage').then(m => ({ default: m.CompensationPage })));
const MySalaryPage = lazy(() => import('./pages/employee/MySalaryPage').then(m => ({ default: m.MySalaryPage })));

// Route Loading State Fallback
const PageLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-12 min-h-[360px] animate-fade-in">
    <div className="relative flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-200 dark:border-navy-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
    </div>
    <span className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">Loading module...</span>
  </div>
);

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
      return <Navigate to="/careers" replace />;
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
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public Auth & Candidate Application Routes (No Login Required) */}
              <Route path="/login" element={<Login />} />
              <Route path="/careers" element={<CandidatePortal />} />
              <Route path="/apply" element={<CandidatePortal />} />
              <Route path="/candidate/portal" element={<CandidatePortal />} />

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
              path="/compensation"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']}>
                  <AppLayout pageTitle="Salary & Compensation Management" pageSubtitle="3-tier priority configuration, AI advisory and audit timeline">
                    <CompensationPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-salary"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                  <AppLayout pageTitle="My Compensation & Salary Structure" pageSubtitle="Take-home earnings, statutory deductions, and benchmark bands">
                    <MySalaryPage />
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
        </Suspense>
      </BrowserRouter>
      <Analytics />
    </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
  );
};
export default App;
