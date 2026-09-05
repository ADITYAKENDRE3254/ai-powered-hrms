import React from 'react';
import { Sparkles, ShieldCheck, TrendingUp, Award, BookOpen, Clock } from 'lucide-react';

interface OrganizationHealthScoreProps {
  score?: number;
  metrics?: {
    performance: number;
    attendance: number;
    skillReadiness: number;
    training: number;
    retention: number;
  };
}

export const OrganizationHealthScore: React.FC<OrganizationHealthScoreProps> = ({
  score = 84,
  metrics = {
    performance: 86,
    attendance: 94,
    skillReadiness: 78,
    training: 81,
    retention: 82,
  }
}) => {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const items = [
    { label: 'Performance', val: metrics.performance, icon: TrendingUp, color: '#2563EB' },
    { label: 'Attendance', val: metrics.attendance, icon: Clock, color: '#06B6D4' },
    { label: 'Skill Readiness', val: metrics.skillReadiness, icon: Award, color: '#7C3AED' },
    { label: 'Training Velocity', val: metrics.training, icon: BookOpen, color: '#10B981' },
    { label: 'Retention Stability', val: metrics.retention, icon: ShieldCheck, color: '#F59E0B' },
  ];

  return (
    <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-cyan-400 flex items-center justify-center border border-brand-100 dark:border-brand-900/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Organization Health Index
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI aggregated workforce capability & operational health score
            </p>
          </div>
        </div>

        <span className="ai-badge">
          ✦ Live Composite
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Radial Score Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-100 dark:stroke-navy-950"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress Stroke */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="url(#healthGradient)"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="50%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {score}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
                Out of 100
              </span>
            </div>
          </div>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 text-center flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Optimal Organizational Health</span>
          </p>
        </div>

        {/* Sub-Dimensions Breakdown */}
        <div className="md:col-span-7 space-y-3">
          {items.map((item) => (
            <div key={item.label} className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-navy-950 border border-slate-100 dark:border-navy-800/60">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white">{item.val}/100</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-navy-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.val}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
