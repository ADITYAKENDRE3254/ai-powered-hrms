import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { CalendarDays, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface LeaveAnalyticsChartProps {
  typeData?: { name: string; value: number; color: string }[];
  deptData?: { department: string; days: number }[];
}

const defaultTypeData = [
  { name: 'Casual Leave', value: 45, color: '#2563EB' },
  { name: 'Sick Leave', value: 25, color: '#06B6D4' },
  { name: 'Annual Paid', value: 20, color: '#7C3AED' },
  { name: 'Emergency', value: 10, color: '#F59E0B' },
];

const defaultDeptData = [
  { department: 'Engineering', days: 42 },
  { department: 'Sales', days: 28 },
  { department: 'Finance', days: 16 },
  { department: 'HR', days: 12 },
  { department: 'Marketing', days: 14 },
];

export const LeaveAnalyticsChart: React.FC<LeaveAnalyticsChartProps> = ({
  typeData = defaultTypeData,
  deptData = defaultDeptData,
}) => {
  const [view, setView] = useState<'type' | 'dept'>('type');

  return (
    <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/40">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Leave Utilization & Volume Analytics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Absence categorizations, department trends, and approval distribution
            </p>
          </div>
        </div>

        <div className="flex items-center p-1 bg-slate-100 dark:bg-navy-950 rounded-xl">
          <button
            onClick={() => setView('type')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              view === 'type'
                ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            By Leave Type
          </button>
          <button
            onClick={() => setView('dept')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              view === 'dept'
                ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            By Department
          </button>
        </div>
      </div>

      {view === 'type' ? (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          <div className="sm:col-span-5 h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">100%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
            </div>
          </div>

          <div className="sm:col-span-7 space-y-2.5">
            {typeData.map((t) => (
              <div key={t.name} className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80">
                <div className="flex justify-between items-center text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{t.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{t.value}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-navy-900 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${t.value}%`, backgroundColor: t.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '16px',
                  border: '1px solid #1E293B',
                  color: '#FFFFFF',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="days" name="Total Leave Days" fill="#7C3AED" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mini Approval Status Badges */}
      <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-navy-800 text-center text-xs">
        <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/60">
          <div className="flex items-center justify-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
          </div>
          <span className="text-lg font-extrabold text-emerald-900 dark:text-white">92.4%</span>
        </div>
        <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/60">
          <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-400 font-bold mb-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Review</span>
          </div>
          <span className="text-lg font-extrabold text-amber-900 dark:text-white">5.8%</span>
        </div>
        <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800/60">
          <div className="flex items-center justify-center gap-1 text-rose-700 dark:text-rose-400 font-bold mb-0.5">
            <XCircle className="w-3.5 h-3.5" />
            <span>Declined</span>
          </div>
          <span className="text-lg font-extrabold text-rose-900 dark:text-white">1.8%</span>
        </div>
      </div>
    </div>
  );
};
