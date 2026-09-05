import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Award, ArrowRight, TrendingUp } from 'lucide-react';

interface TrainingImpactChartProps {
  data?: { metric: string; before: number; after: number }[];
}

const defaultImpactData = [
  { metric: 'Performance Score', before: 72, after: 86 },
  { metric: 'Skill Proficiency', before: 58, after: 82 },
  { metric: 'Project Velocity', before: 64, after: 88 },
  { metric: 'Attendance Stability', before: 88, after: 95 },
];

export const TrainingImpactChart: React.FC<TrainingImpactChartProps> = ({
  data = defaultImpactData,
}) => {
  return (
    <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Upskilling ROI: Before vs After Training Impact
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Measurable performance jumps and verified competency gains across certified staff
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
          <TrendingUp className="w-4 h-4" />
          <span>+21% Avg Score Lift</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderRadius: '16px',
                border: '1px solid #1E293B',
                color: '#FFFFFF',
                fontSize: '12px'
              }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 12 }} />
            <Bar dataKey="before" name="Pre-Training Baseline" fill="#94A3B8" radius={[6, 6, 0, 0]} />
            <Bar dataKey="after" name="Post-Certification Level" fill="#2563EB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
