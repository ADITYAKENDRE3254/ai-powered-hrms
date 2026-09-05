import React from 'react';
import { SkillGap } from '../../types';
import { Target, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';

export const SkillGapChart: React.FC<{ skillGap: SkillGap }> = ({ skillGap }) => {
  const getPriorityBadge = () => {
    switch (skillGap.priority) {
      case 'HIGH':
        return <Badge variant="danger">High Gap Priority</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Medium Gap Priority</Badge>;
      default:
        return <Badge variant="success">Low Gap Priority</Badge>;
    }
  };

  const matchPercentage = 100 - skillGap.gap_percentage;

  return (
    <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-apple">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-cyan-400 mb-1">
            <Target className="w-3.5 h-3.5" />
            <span>Target Role Benchmark Alignment</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{skillGap.target_role}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Benchmark comparison of current competencies vs. position requirements
          </p>
        </div>
        {getPriorityBadge()}
      </div>

      {/* Progress Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 mb-5">
        <div className="flex justify-between items-center mb-2 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Role Competency Match</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {matchPercentage.toFixed(1)}% Match ({skillGap.gap_percentage}% Gap)
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-navy-800 h-2.5 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${matchPercentage}%` }}
          />
          <div
            className="bg-rose-400 h-full transition-all duration-500"
            style={{ width: `${skillGap.gap_percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● {skillGap.matched_skills.length} Matched</span>
          <span className="text-rose-600 dark:text-rose-400 font-semibold">● {skillGap.missing_skills.length} Missing Gaps</span>
        </div>
      </div>

      {/* Matched vs Missing Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Matched */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/60">
          <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Matched Competencies ({skillGap.matched_skills.length})</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {skillGap.matched_skills.length === 0 ? (
              <span className="text-slate-400 text-[11px]">No direct matches yet</span>
            ) : (
              skillGap.matched_skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800"
                >
                  {s}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Missing Gaps */}
        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-800/60">
          <span className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5 mb-2">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Missing Target Gaps ({skillGap.missing_skills.length})</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {skillGap.missing_skills.length === 0 ? (
              <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">All target skills mastered!</span>
            ) : (
              skillGap.missing_skills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg bg-rose-100/80 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 text-[11px] font-semibold border border-rose-200 dark:border-rose-800"
                >
                  {s}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
