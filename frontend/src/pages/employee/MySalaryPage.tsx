import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { EmployeeSalary, SalaryHistory } from '../../types';
import compensationService from '../../services/compensation.service';
import { SalaryComponentBreakdownChart } from '../../components/charts/SalaryComponentBreakdownChart';
import { SalaryHistoryModal } from '../../components/compensation/SalaryHistoryModal';
import {
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  Layers,
  Briefcase,
  History,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const MySalaryPage: React.FC = () => {
  const { user } = useAuth();
  const [salary, setSalary] = useState<EmployeeSalary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    compensationService
      .getMySalary()
      .then((data) => setSalary(data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load compensation profile.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-semibold">Loading your compensation breakdown...</span>
      </div>
    );
  }

  if (error || !salary) {
    return (
      <div className="p-8 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800 text-center space-y-3">
        <AlertCircle className="w-10 h-10 mx-auto text-rose-500" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Compensation Profile Unavailable</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{error || 'Unable to retrieve salary details.'}</p>
      </div>
    );
  }

  const getSourceText = (source: string) => {
    switch (source) {
      case 'INDIVIDUAL':
        return 'Custom Individual Structure (Tier 1)';
      case 'POSITION':
        return 'Standard Role Benchmark (Tier 2)';
      case 'DEPARTMENT':
        return 'Department Compensation Band (Tier 3)';
      default:
        return 'Base Employment Contract';
    }
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              My Salary & Compensation
            </h1>
            <span className="ai-badge">✦ Self-Service</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transparent breakdown of your earnings, statutory tax/PF deductions, and benchmark bands
          </p>
        </div>

        <button
          onClick={() => setIsHistoryOpen(true)}
          className="px-4 py-2.5 bg-white dark:bg-navy-900 hover:bg-slate-50 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold border border-slate-200 dark:border-navy-800 shadow-apple transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <History className="w-4 h-4 text-brand-500" />
          <span>View Revision History</span>
        </button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gross CTC */}
        <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Monthly Gross CTC
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ₹{salary.gross_salary.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400">/ month</span>
          </div>
          <span className="text-[11px] text-brand-600 dark:text-cyan-400 font-semibold mt-1 block">
            Annualized: ₹{(salary.gross_salary * 12).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Total Deductions */}
        <div className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Deductions
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-500">
              -₹{salary.total_deductions.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400">/ month</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            PF + Tax (TDS) + Professional Tax
          </span>
        </div>

        {/* Net Take-Home */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-6 rounded-3xl shadow-apple-md">
          <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
            Monthly Net Take-Home
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black">
              ₹{salary.net_salary.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-100">/ month</span>
          </div>
          <span className="text-[11px] text-emerald-100/90 font-medium mt-1 block">
            Directly disbursed to bank account
          </span>
        </div>
      </div>

      {/* Breakdown Visualizer */}
      <div className="bg-white dark:bg-navy-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Compensation Composition & Structure
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-cyan-400 border border-brand-200 dark:border-brand-900/60">
              {getSourceText(salary.salary_source)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active effective since {salary.effective_date} &bull; Status: {salary.status}
          </p>
        </div>

        <SalaryComponentBreakdownChart salary={salary} />
      </div>

      {/* Benchmark Context Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department Band */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple space-y-2">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Layers className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {salary.department_name || 'Department'} Salary Band
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {salary.department_min_salary && salary.department_max_salary ? (
              `₹${salary.department_min_salary.toLocaleString('en-IN')} – ₹${salary.department_max_salary.toLocaleString('en-IN')}`
            ) : (
              <span className="text-xs font-normal text-slate-400">Department band not configured</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">Standard range defined for your department</p>
        </div>

        {/* Position Band */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple space-y-2">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Briefcase className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {salary.position || 'Role'} Benchmark Band
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {salary.position_min_salary && salary.position_max_salary ? (
              `₹${salary.position_min_salary.toLocaleString('en-IN')} – ₹${salary.position_max_salary.toLocaleString('en-IN')}`
            ) : (
              <span className="text-xs font-normal text-slate-400">Position benchmark not configured</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">Market benchmark for your designation</p>
        </div>
      </div>

      {/* History Modal */}
      <SalaryHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        employeeId={salary.employee_id}
        employeeName={salary.employee_name}
        employeeCode={salary.employee_code}
      />
    </div>
  );
};
