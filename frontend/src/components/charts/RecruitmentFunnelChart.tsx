import React from 'react';
import { Briefcase, ArrowDown, Sparkles, UserCheck } from 'lucide-react';

interface RecruitmentFunnelChartProps {
  stages?: { name: string; count: number; percentage: number; color: string }[];
  matchDistribution?: { range: string; count: number; percentage: number }[];
}

const defaultStages = [
  { name: 'Total Applied', count: 124, percentage: 100, color: '#2563EB' },
  { name: 'AI Screened', count: 86, percentage: 69, color: '#06B6D4' },
  { name: 'Shortlisted', count: 42, percentage: 34, color: '#7C3AED' },
  { name: 'Technical Interview', count: 18, percentage: 15, color: '#3B82F6' },
  { name: 'Offer Selected', count: 8, percentage: 6, color: '#10B981' },
  { name: 'Joined Staff', count: 5, percentage: 4, color: '#059669' },
];

const defaultMatchDistribution = [
  { range: '90–100%', count: 18, percentage: 90 },
  { range: '80–89%', count: 32, percentage: 75 },
  { range: '70–79%', count: 44, percentage: 55 },
  { range: '60–69%', count: 20, percentage: 35 },
  { range: '<60%', count: 10, percentage: 20 },
];

export const RecruitmentFunnelChart: React.FC<RecruitmentFunnelChartProps> = ({
  stages = defaultStages,
  matchDistribution = defaultMatchDistribution,
}) => {
  return (
    <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/40">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Recruitment Funnel & AI Match Velocity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Candidate progression stages and NLP weighted score distribution
            </p>
          </div>
        </div>

        <span className="ai-badge">
          ✦ AI Screened
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Visual Funnel */}
        <div className="lg:col-span-7 space-y-2">
          {stages.map((stage, i) => (
            <div key={stage.name} className="relative">
              <div
                className="p-3 rounded-2xl flex items-center justify-between transition-all duration-300"
                style={{
                  backgroundColor: `${stage.color}12`,
                  border: `1px solid ${stage.color}35`,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: stage.color }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{stage.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {stage.percentage}% conversion
                  </span>
                  <span
                    className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg"
                    style={{ color: stage.color, backgroundColor: `${stage.color}20` }}
                  >
                    {stage.count} candidates
                  </span>
                </div>
              </div>
              {i < stages.length - 1 && (
                <div className="flex justify-center -my-1 relative z-10">
                  <div className="w-4 h-4 rounded-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 flex items-center justify-center text-slate-400 text-[10px]">
                    <ArrowDown className="w-2.5 h-2.5" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AI Match Score Distribution Histogram */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#FAFAFC] dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>AI Match Score Histogram</span>
            </span>
            <span className="text-[10px] text-slate-400">124 Profiles</span>
          </div>

          <div className="space-y-3">
            {matchDistribution.map((m) => (
              <div key={m.range}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{m.range}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{m.count} candidates</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-navy-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-cyan-500 transition-all duration-500"
                    style={{ width: `${m.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-200/80 dark:border-navy-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Avg Match Fit: <strong className="text-slate-900 dark:text-white">78.4%</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">+12% vs last quarter</span>
          </div>
        </div>
      </div>
    </div>
  );
};
