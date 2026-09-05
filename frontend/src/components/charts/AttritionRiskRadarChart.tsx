import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface AttritionRiskRadarChartProps {
  distribution?: { low: number; medium: number; high: number };
  deptRisk?: { department: string; riskPct: number }[];
  factors?: { name: string; impactPct: number }[];
}

const defaultDeptRisk = [
  { department: 'Sales & Ops', riskPct: 24 },
  { department: 'Engineering', riskPct: 18 },
  { department: 'Finance', riskPct: 10 },
  { department: 'People & HR', riskPct: 8 },
];

const defaultFactors = [
  { name: 'Workload & Role Engagement', impactPct: 84 },
  { name: 'Skill Growth & Learning Stagnation', impactPct: 68 },
  { name: 'Training Module Participation', impactPct: 52 },
  { name: 'Compensation Market Alignment', impactPct: 42 },
];

export const AttritionRiskRadarChart: React.FC<AttritionRiskRadarChartProps> = ({
  distribution = { low: 78, medium: 16, high: 6 },
  deptRisk = defaultDeptRisk,
  factors = defaultFactors,
}) => {
  return (
    <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/40">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Workforce Retention Radar & Contributing Drivers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Confidential AI predictive retention signals & departmental risk comparison
            </p>
          </div>
        </div>

        <span className="ai-badge-purple">
          ✦ Confidential HR View
        </span>
      </div>

      {/* 3 Risk Bands Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/60 text-center">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block mb-1">
            Low Risk (Stable)
          </span>
          <p className="text-2xl font-black text-emerald-900 dark:text-white">{distribution.low}%</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">975 Staff Members</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/60 text-center">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block mb-1">
            Moderate Risk
          </span>
          <p className="text-2xl font-black text-amber-900 dark:text-white">{distribution.medium}%</p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">200 Staff Members</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800/60 text-center">
          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block mb-1">
            Elevated Risk
          </span>
          <p className="text-2xl font-black text-rose-900 dark:text-white">{distribution.high}%</p>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">75 Staff Members</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Risk Comparison */}
        <div className="p-5 rounded-2xl bg-[#FAFAFC] dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80">
          <span className="text-xs font-bold text-slate-900 dark:text-white block mb-3">
            Department Risk Comparison
          </span>
          <div className="space-y-3">
            {deptRisk.map((d) => (
              <div key={d.department}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{d.department}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{d.riskPct}% Risk Index</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-navy-900 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      d.riskPct > 20 ? 'bg-amber-500' : 'bg-brand-600'
                    }`}
                    style={{ width: `${d.riskPct * 3}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributing Factors */}
        <div className="p-5 rounded-2xl bg-[#FAFAFC] dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80">
          <span className="text-xs font-bold text-slate-900 dark:text-white block mb-3">
            Top AI Contributing Risk Factors
          </span>
          <div className="space-y-3">
            {factors.map((f) => (
              <div key={f.name}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{f.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{f.impactPct}% Correlation</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-navy-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${f.impactPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
        <Info className="w-3.5 h-3.5 shrink-0 text-cyan-500" />
        <span>Predictions are estimated statistical guidance to support proactive retention 1-on-1s. Protected characteristics are strictly excluded.</span>
      </div>
    </div>
  );
};
