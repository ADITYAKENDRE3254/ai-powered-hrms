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
  ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';

interface PayrollAnalyticsChartProps {
  monthlyData?: { month: string; gross: number; deductions: number; net: number }[];
  deptData?: { department: string; amount: number }[];
}

const defaultMonthlyData = [
  { month: 'Jan', gross: 420000, deductions: 28000, net: 392000 },
  { month: 'Feb', gross: 440000, deductions: 29500, net: 410500 },
  { month: 'Mar', gross: 465000, deductions: 31000, net: 434000 },
  { month: 'Apr', gross: 480000, deductions: 32400, net: 447600 },
  { month: 'May', gross: 510000, deductions: 34200, net: 475800 },
  { month: 'Jun', gross: 535000, deductions: 36000, net: 499000 },
];

const defaultDeptData = [
  { department: 'Engineering', amount: 245000 },
  { department: 'Sales', amount: 135000 },
  { department: 'Finance', amount: 65000 },
  { department: 'HR', amount: 50000 },
  { department: 'Marketing', amount: 40000 },
];

export const PayrollAnalyticsChart: React.FC<PayrollAnalyticsChartProps> = ({
  monthlyData = defaultMonthlyData,
  deptData = defaultDeptData,
}) => {
  const [tab, setTab] = useState<'trend' | 'dept'>('trend');

  const formatCurrency = (val: number) => `$${(val / 1000).toFixed(0)}k`;

  return (
    <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Payroll Expenditure & Net Compensation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gross disbursements, tax & LWP deductions, and department salary distribution
            </p>
          </div>
        </div>

        <div className="flex items-center p-1 bg-slate-100 dark:bg-navy-950 rounded-xl">
          <button
            onClick={() => setTab('trend')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              tab === 'trend'
                ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Disbursement Trend
          </button>
          <button
            onClick={() => setTab('dept')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              tab === 'dept'
                ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Dept Allocation
          </button>
        </div>
      </div>

      {tab === 'trend' ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(val: any) => [`$${Number(val || 0).toLocaleString()}`, '']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '16px',
                  border: '1px solid #1E293B',
                  color: '#FFFFFF',
                  fontSize: '12px'
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 12 }} />
              <Area type="monotone" dataKey="gross" name="Gross Payroll" stroke="#2563EB" strokeWidth={2} fill="transparent" />
              <Area type="monotone" dataKey="net" name="Net Disbursed" stroke="#10B981" strokeWidth={3} fill="url(#netGradient)" />
              <Area type="monotone" dataKey="deductions" name="Total Deductions / LWP" stroke="#F59E0B" strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(val: any) => [`$${Number(val || 0).toLocaleString()}`, 'Budget']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '16px',
                  border: '1px solid #1E293B',
                  color: '#FFFFFF',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="amount" name="Monthly Compensation" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
