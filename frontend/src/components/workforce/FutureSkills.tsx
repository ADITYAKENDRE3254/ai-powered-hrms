import React from 'react';
import { FutureSkill } from '../../types';
import { Compass, Sparkles, TrendingUp } from 'lucide-react';

export const FutureSkills: React.FC<{ futureSkill: FutureSkill }> = ({ futureSkill }) => {
  return (
    <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-apple">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Future Skill Forecast</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Predicted Growth Competencies</h3>
          {futureSkill.career_path && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Compass className="w-3.5 h-3.5 text-purple-500" />
              <span>Career Trajectory: <strong className="text-slate-800 dark:text-slate-200">{futureSkill.career_path}</strong></span>
            </p>
          )}
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          {futureSkill.confidence}% Confidence
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 text-xs text-purple-950 dark:text-purple-300 mb-4 leading-relaxed">
        <p>{futureSkill.reason}</p>
      </div>

      <div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2.5">
          High-Relevance Suggested Skills:
        </span>
        <div className="flex flex-wrap gap-2">
          {futureSkill.predicted_skills.map((s, i) => (
            <div
              key={s}
              className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shadow-xs"
            >
              <TrendingUp className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
