import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Department,
  DepartmentSalaryRule,
  PositionSalaryRule,
  EmployeeSalary,
  EmployeeCompensationSummary,
  SalaryHistory,
  CompensationDashboardData,
  Employee
} from '../types';
import compensationService from '../services/compensation.service';
import { departmentService } from '../services/department.service';
import { employeeService } from '../services/employee.service';
import { CompensationAnalyticsChart } from '../components/charts/CompensationAnalyticsChart';
import { PositionSalaryBandChart } from '../components/charts/PositionSalaryBandChart';
import { DepartmentSalaryModal } from '../components/compensation/DepartmentSalaryModal';
import { PositionSalaryModal } from '../components/compensation/PositionSalaryModal';
import { EmployeeSalaryModal } from '../components/compensation/EmployeeSalaryModal';
import { SalaryApprovalModal } from '../components/compensation/SalaryApprovalModal';
import { SalaryHistoryModal } from '../components/compensation/SalaryHistoryModal';
import {
  IndianRupee,
  Layers,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  History,
  Sparkles,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  FileText,
  Sliders,
  ChevronRight
} from 'lucide-react';

export const CompensationPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isHRAdmin = hasRole('SUPER_ADMIN', 'HR_MANAGER');
  const isManager = hasRole('DEPARTMENT_MANAGER');

  // Sub-tab Navigation
  const [activeTab, setActiveTab] = useState<'employees' | 'departments' | 'positions' | 'approvals' | 'history' | 'advisor'>('employees');

  // Dashboard & List Data
  const [dashboardData, setDashboardData] = useState<CompensationDashboardData | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeSummaries, setEmployeeSummaries] = useState<EmployeeCompensationSummary[]>([]);
  const [deptRules, setDeptRules] = useState<DepartmentSalaryRule[]>([]);
  const [posRules, setPosRules] = useState<PositionSalaryRule[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<EmployeeSalary[]>([]);
  const [allHistory, setAllHistory] = useState<SalaryHistory[]>([]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<number | 'ALL'>('ALL');

  // Modal Control States
  const [isDeptModalOpen, setIsDeptModalOpen] = useState<boolean>(false);
  const [editingDeptRule, setEditingDeptRule] = useState<DepartmentSalaryRule | null>(null);

  const [isPosModalOpen, setIsPosModalOpen] = useState<boolean>(false);
  const [editingPosRule, setEditingPosRule] = useState<PositionSalaryRule | null>(null);

  const [isEmpModalOpen, setIsEmpModalOpen] = useState<boolean>(false);
  const [selectedEmpForSalary, setSelectedEmpForSalary] = useState<Employee | null>(null);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [selectedApprovalItem, setSelectedApprovalItem] = useState<EmployeeSalary | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [historyTargetEmp, setHistoryTargetEmp] = useState<{ id: number; name: string; code: string } | null>(null);

  // AI Simulator Playground State
  const [simPosition, setSimPosition] = useState<string>('Senior Full Stack Developer');
  const [simDeptId, setSimDeptId] = useState<number | ''>('');
  const [simExp, setSimExp] = useState<number>(4);
  const [simSkills, setSimSkills] = useState<string>('React, TypeScript, Node.js, PostgreSQL, AWS');
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [dash, depts, emps, summaries, dRules, pRules, approvals] = await Promise.all([
        compensationService.getDashboardAnalytics(),
        departmentService.getDepartments(),
        employeeService.getEmployees(),
        compensationService.getEmployeeSummaries(),
        compensationService.getDepartmentRules(),
        compensationService.getPositionRules(),
        compensationService.getApprovals('PENDING'),
      ]);

      setDashboardData(dash);
      setDepartments(depts);
      setEmployees(Array.isArray(emps) ? emps : (emps as any).items || []);
      setEmployeeSummaries(summaries);
      setDeptRules(dRules);
      setPosRules(pRules);
      setPendingApprovals(approvals);
    } catch (e) {
      console.error('Failed to load compensation data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered summaries
  const filteredSummaries = employeeSummaries.filter((emp) => {
    const matchesSearch =
      emp.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || emp.department_id === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenSalaryModalForEmployee = (employeeId: number) => {
    const foundEmp = employees.find((e) => e.id === employeeId);
    if (foundEmp) {
      setSelectedEmpForSalary(foundEmp);
      setIsEmpModalOpen(true);
    }
  };

  const handleOpenHistoryModal = (employeeId: number, name: string, code: string) => {
    setHistoryTargetEmp({ id: employeeId, name, code });
    setIsHistoryModalOpen(true);
  };

  const handleDeleteDeptRule = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this department salary range rule?')) return;
    try {
      await compensationService.deleteDepartmentRule(id);
      loadAllData();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to delete rule.');
    }
  };

  const handleDeletePosRule = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this position salary benchmark?')) return;
    try {
      await compensationService.deletePositionRule(id);
      loadAllData();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to delete rule.');
    }
  };

  const handleRunAiSimulator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSimLoading(true);
      const skillsArray = simSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await compensationService.getAISalaryRecommendation({
        position_title: simPosition,
        department_id: simDeptId ? Number(simDeptId) : undefined,
        experience_years: simExp,
        skills: skillsArray,
      });
      setSimResult(res);
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to generate simulation.');
    } finally {
      setSimLoading(false);
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'INDIVIDUAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800/60">
            Tier 1: Individual
          </span>
        );
      case 'POSITION':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/60">
            Tier 2: Position
          </span>
        );
      case 'DEPARTMENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/60">
            Tier 3: Department
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-navy-700">
            Base Default
          </span>
        );
    }
  };

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Salary & Compensation Management
            </h1>
            <span className="ai-badge">✦ 3-Tier Priority Engine</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hierarchy: <strong className="text-slate-700 dark:text-slate-300">Individual Employee</strong> &rarr;{' '}
            <strong className="text-slate-700 dark:text-slate-300">Position Benchmark</strong> &rarr;{' '}
            <strong className="text-slate-700 dark:text-slate-300">Department Band</strong> &bull; Non-destructive audit history &bull; AI advisory
          </p>
        </div>

        {isHRAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingDeptRule(null);
                setIsDeptModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold border border-slate-200 dark:border-navy-800 shadow-apple transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-brand-500" />
              <span>Dept Range</span>
            </button>
            <button
              onClick={() => {
                setEditingPosRule(null);
                setIsPosModalOpen(true);
              }}
              className="px-3.5 py-2.5 bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold border border-slate-200 dark:border-navy-800 shadow-apple transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-cyan-500" />
              <span>Position Band</span>
            </button>
          </div>
        )}
      </div>

      {/* Top 4 KPI Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Payroll Budget */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Monthly Budget</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{(dashboardData?.total_monthly_payroll_budget || 0).toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+8.4% YoY budget expansion</span>
            </div>
          </div>
        </div>

        {/* Avg Company Salary */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Avg Monthly CTC</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{Math.round(dashboardData?.avg_company_salary || 0).toLocaleString('en-IN')}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Across all active employees
            </p>
          </div>
        </div>

        {/* Configured Benchmarks */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Configured Rules</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {(dashboardData?.total_configured_departments || 0) + (dashboardData?.total_configured_positions || 0)}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {dashboardData?.total_configured_departments || 0} Dept &bull; {dashboardData?.total_configured_positions || 0} Positions
            </p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Pending Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {pendingApprovals.length}
            </span>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
              {pendingApprovals.length > 0 ? 'Requires HR authorization' : 'All revisions approved'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompensationAnalyticsChart
          departmentMetrics={dashboardData?.department_metrics}
          monthlyTrend={dashboardData?.monthly_growth_trend}
          salaryDistribution={dashboardData?.salary_distribution_buckets}
          totalBudget={dashboardData?.total_monthly_payroll_budget}
          avgSalary={dashboardData?.avg_company_salary}
        />
        <PositionSalaryBandChart metrics={dashboardData?.position_metrics || []} />
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple p-6 space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/70 dark:border-navy-800">
          <button
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'employees'
                ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Employee Salaries ({employeeSummaries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'departments'
                ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Department Bands ({deptRules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('positions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'positions'
                ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Position Benchmarks ({posRules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 relative ${
              activeTab === 'approvals'
                ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approvals Queue</span>
            {pendingApprovals.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-extrabold">
                {pendingApprovals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'advisor'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Salary Advisor Playground</span>
          </button>
        </div>

        {/* TAB 1: EMPLOYEE SALARY DIRECTORY */}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employee, position, code..."
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employee Salary Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-navy-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950/80 text-slate-500 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-navy-800">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Department & Position</th>
                    <th className="px-4 py-3">Active Gross CTC</th>
                    <th className="px-4 py-3">Net Take-Home</th>
                    <th className="px-4 py-3">Priority Level</th>
                    <th className="px-4 py-3">Benchmark Context</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800/80">
                  {filteredSummaries.map((emp) => (
                    <tr key={emp.employee_id} className="hover:bg-slate-50/70 dark:hover:bg-navy-950/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{emp.employee_name}</div>
                        <span className="text-[11px] font-mono text-brand-600 dark:text-cyan-400 font-bold">
                          {emp.employee_code}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{emp.position}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{emp.department_name}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          ₹{emp.current_gross_salary.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{emp.current_net_salary.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{getSourceBadge(emp.salary_source)}</td>
                      <td className="px-4 py-3.5 space-y-0.5">
                        <div className="text-[10px] text-slate-500">
                          Dept: <span className="font-semibold text-slate-700 dark:text-slate-300">{emp.department_range}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Role: <span className="font-semibold text-slate-700 dark:text-slate-300">{emp.position_range}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenHistoryModal(emp.employee_id, emp.employee_name, emp.employee_code)}
                            title="View History"
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          {isHRAdmin && (
                            <button
                              onClick={() => handleOpenSalaryModalForEmployee(emp.employee_id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                            >
                              <Sliders className="w-3 h-3" />
                              <span>Adjust</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DEPARTMENT SALARY BANDS */}
        {activeTab === 'departments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department Base Salary Ranges</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Applied as priority level 3 when individual and position salaries are not configured
                </p>
              </div>
              {isHRAdmin && (
                <button
                  onClick={() => {
                    setEditingDeptRule(null);
                    setIsDeptModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-cyan-600 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Department Range</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deptRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{rule.department_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rule.is_active
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                      }`}
                    >
                      {rule.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-navy-900 rounded-xl border border-slate-200/60 dark:border-navy-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Standard Band</span>
                    <div className="text-base font-extrabold text-brand-600 dark:text-cyan-400">
                      ₹{rule.min_salary.toLocaleString('en-IN')} – ₹{rule.max_salary.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {rule.notes || 'No notes specified.'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-navy-800 text-[11px] text-slate-400">
                    <span>Effective: {rule.effective_date}</span>
                    {isHRAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingDeptRule(rule);
                            setIsDeptModalOpen(true);
                          }}
                          className="text-brand-600 dark:text-cyan-400 font-bold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDeptRule(rule.id)}
                          className="text-rose-500 font-bold hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: POSITION BENCHMARKS */}
        {activeTab === 'positions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Position & Role Compensation Benchmarks</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Applied as priority level 2 when individual employee salary is not configured
                </p>
              </div>
              {isHRAdmin && (
                <button
                  onClick={() => {
                    setEditingPosRule(null);
                    setIsPosModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-brand-600 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Position Benchmark</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">
                        {rule.position_title}
                      </span>
                      <span className="text-[11px] text-slate-500">{rule.department_name || 'All Departments'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400">
                      {rule.salary_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200/60 dark:border-navy-800 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Min</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        ₹{(rule.min_salary / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="border-x border-slate-100 dark:border-navy-800">
                      <span className="text-[9px] text-cyan-600 dark:text-cyan-400 uppercase block font-bold">Anchor</span>
                      <span className="text-xs font-extrabold text-brand-600 dark:text-cyan-400">
                        ₹{(rule.default_salary / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-purple-600 dark:text-purple-400 uppercase block font-bold">Max</span>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        ₹{(rule.max_salary / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {rule.notes || 'Standard position market scale.'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-navy-800 text-[11px] text-slate-400">
                    <span>Effective: {rule.effective_date}</span>
                    {isHRAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingPosRule(rule);
                            setIsPosModalOpen(true);
                          }}
                          className="text-brand-600 dark:text-cyan-400 font-bold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePosRule(rule.id)}
                          className="text-rose-500 font-bold hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: APPROVALS QUEUE */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gated Salary Revisions Workflow</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pending revisions are kept isolated until authorized by Super Admin or HR Manager
                </p>
              </div>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <CheckCircle className="w-10 h-10 mx-auto text-emerald-500/40 mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">All salary revision requests processed.</p>
                <p className="text-slate-500">No pending approvals in queue.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-amber-500/30 dark:border-amber-500/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.employee_name} ({item.employee_code})
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">
                          PENDING REVIEW
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.position} &bull; {item.department_name} &bull; Effective: {item.effective_date}
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">
                        Reason: {item.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Proposed CTC</span>
                        <span className="text-base font-black text-brand-600 dark:text-cyan-400">
                          ₹{item.gross_salary.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {isHRAdmin && (
                        <button
                          onClick={() => {
                            setSelectedApprovalItem(item);
                            setIsApprovalModalOpen(true);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Review & Authorize</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AI SALARY ADVISOR PLAYGROUND */}
        {activeTab === 'advisor' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  AI Compensation Benchmarking Advisory Simulator
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Evaluate market salary recommendations based on non-sensitive parameters (Role benchmarks, department anchors, experience years, and skill competencies).
              </p>
            </div>

            <form onSubmit={handleRunAiSimulator} className="p-6 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Position Title
                  </label>
                  <input
                    type="text"
                    value={simPosition}
                    onChange={(e) => setSimPosition(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Department Anchor
                  </label>
                  <select
                    value={simDeptId}
                    onChange={(e) => setSimDeptId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">General (No Department Rule)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={simExp}
                    onChange={(e) => setSimExp(Number(e.target.value))}
                    min="0"
                    step="0.5"
                    className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Core Skills / Competencies (Comma-separated)
                </label>
                <input
                  type="text"
                  value={simSkills}
                  onChange={(e) => setSimSkills(e.target.value)}
                  placeholder="e.g. React, Python, Docker, Cloud, Leadership"
                  className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={simLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 hover:from-purple-500 hover:to-cyan-500 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {simLoading ? 'Simulating Recommendation...' : 'Generate AI Advisory Report'}
                </button>
              </div>
            </form>

            {simResult && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/20 via-navy-900/60 to-cyan-950/20 border border-purple-500/30 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <Sparkles className="w-5 h-5" />
                    <h4 className="font-extrabold text-sm uppercase tracking-wider">AI Simulation Outcome</h4>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                    {simResult.confidence_score}% Confidence
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/70 dark:bg-navy-950/80 rounded-2xl border border-slate-200/60 dark:border-navy-800 space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Recommended CTC Target</span>
                    <span className="text-2xl font-black text-brand-600 dark:text-cyan-400">
                      ₹{simResult.recommended_salary.toLocaleString('en-IN')}/mo
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Target Range: ₹{simResult.recommended_range_min.toLocaleString('en-IN')} – ₹{simResult.recommended_range_max.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="p-4 bg-white/70 dark:bg-navy-950/80 rounded-2xl border border-slate-200/60 dark:border-navy-800 space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Contributing Factors</span>
                    <div className="space-y-1">
                      {simResult.factors.map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 bg-white/40 dark:bg-navy-950/40 p-3 rounded-xl">
                  {simResult.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <DepartmentSalaryModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        onSuccess={loadAllData}
        departments={departments}
        editingRule={editingDeptRule}
      />

      <PositionSalaryModal
        isOpen={isPosModalOpen}
        onClose={() => setIsPosModalOpen(false)}
        onSuccess={loadAllData}
        departments={departments}
        editingRule={editingPosRule}
      />

      <EmployeeSalaryModal
        isOpen={isEmpModalOpen}
        onClose={() => setIsEmpModalOpen(false)}
        onSuccess={loadAllData}
        employee={selectedEmpForSalary}
      />

      <SalaryApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onSuccess={loadAllData}
        salaryItem={selectedApprovalItem}
      />

      <SalaryHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        employeeId={historyTargetEmp?.id || 0}
        employeeName={historyTargetEmp?.name}
        employeeCode={historyTargetEmp?.code}
      />
    </div>
  );
};
