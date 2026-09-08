import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { IndianRupee, TrendingUp, PieChart, Layers } from 'lucide-react';
import { DepartmentSalaryMetric, MonthlyGrowthTrend, SalaryDistributionBucket } from '../../types';

interface CompensationAnalyticsChartProps {
  departmentMetrics?: DepartmentSalaryMetric[];
  monthlyTrend?: MonthlyGrowthTrend[];
  salaryDistribution?: SalaryDistributionBucket[];
  totalBudget?: number;
  avgSalary?: number;
}

export const CompensationAnalyticsChart: React.FC<CompensationAnalyticsChartProps> = ({
  departmentMetrics = [],
  monthlyTrend = [],
  salaryDistribution = [],
  totalBudget = 0,
  avgSalary = 0
}) => {
  const [tab, setTab] = useState<'dept' | 'trend' | 'distribution'>('dept');

  const formatRupee = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  const chartColors = ['#0284C7', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

  return (
    <div className="bg-white dark:bg-navy-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-100 dark:border-brand-900/40 shadow-xs">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Compensation & Salary Budget Analytics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Departmental salary ranges, monthly growth trajectory, and distribution tiers
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-navy-950 rounded-2xl border border-slate-200/60 dark:border-navy-800">
          <button
            onClick={() => setTab('dept')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'dept'
                ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Departments
          </button>
          <button
            onClick={() => setTab('trend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'trend'
                ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Budget Trend
          </button>
          <button
            onClick={() => setTab('distribution')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'distribution'
                ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Distribution
          </button>
        </div>
      </div>

      {/* Quick Stat Pill Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50 dark:bg-navy-950/60 p-3 rounded-2xl border border-slate-100 dark:border-navy-800/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Monthly Budget</span>
          <span className="text-base font-bold text-slate-900 dark:text-white">₹{totalBudget.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-50 dark:bg-navy-950/60 p-3 rounded-2xl border border-slate-100 dark:border-navy-800/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Avg Employee Salary</span>
          <span className="text-base font-bold text-brand-600 dark:text-cyan-400">₹{Math.round(avgSalary).toLocaleString('en-IN')}/mo</span>
        </div>
        <div className="bg-slate-50 dark:bg-navy-950/60 p-3 rounded-2xl border border-slate-100 dark:border-navy-800/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Active Departments</span>
          <span className="text-base font-bold text-purple-600 dark:text-purple-400">{departmentMetrics.length} Departments</span>
        </div>
        <div className="bg-slate-50 dark:bg-navy-950/60 p-3 rounded-2xl border border-slate-100 dark:border-navy-800/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Headcount</span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {departmentMetrics.reduce((acc, d) => acc + d.employee_count, 0)} Employees
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {tab === 'dept' ? (
            <BarChart data={departmentMetrics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis dataKey="department" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatRupee} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DepartmentSalaryMetric;
                    return (
                      <div className="bg-white dark:bg-navy-800 p-3 rounded-xl border border-slate-200 dark:border-navy-700 shadow-xl text-xs space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-700 pb-1">
                          {data.department}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Employees: <span className="font-bold">{data.employee_count}</span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Avg Salary: <span className="font-bold text-brand-600 dark:text-cyan-400">₹{data.avg_salary.toLocaleString('en-IN')}</span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Range: <span className="font-medium">₹{data.min_salary.toLocaleString('en-IN')} – ₹{data.max_salary.toLocaleString('en-IN')}</span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Dept Budget: <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{data.total_budget.toLocaleString('en-IN')}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="avg_salary" name="Avg Salary" fill="#0284C7" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="max_salary" name="Max Salary" fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          ) : tab === 'trend' ? (
            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatRupee} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as MonthlyGrowthTrend;
                    return (
                      <div className="bg-white dark:bg-navy-800 p-3 rounded-xl border border-slate-200 dark:border-navy-700 shadow-xl text-xs space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-700 pb-1">
                          {data.month}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Total Budget: <span className="font-bold text-brand-600 dark:text-cyan-400">₹{data.budget.toLocaleString('en-IN')}</span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Avg Salary: <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{data.avg_salary.toLocaleString('en-IN')}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="budget" name="Payroll Budget" stroke="#0284C7" strokeWidth={2.5} fillOpacity={1} fill="url(#budgetGrad)" />
              <Area type="monotone" dataKey="avg_salary" name="Avg Salary" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#avgGrad)" />
            </AreaChart>
          ) : (
            <BarChart data={salaryDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as SalaryDistributionBucket;
                    return (
                      <div className="bg-white dark:bg-navy-800 p-3 rounded-xl border border-slate-200 dark:border-navy-700 shadow-xl text-xs space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-700 pb-1">
                          Salary Tier: {data.range}
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Employees: <span className="font-bold text-brand-600 dark:text-cyan-400">{data.count}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" name="Employee Count" radius={[8, 8, 0, 0]} maxBarSize={45}>
                {salaryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
