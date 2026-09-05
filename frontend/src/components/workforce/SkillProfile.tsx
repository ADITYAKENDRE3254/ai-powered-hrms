import React from 'react';
import { EmployeeSkill } from '../../types';
import { Award, CheckCircle2, FileText, UserCheck, BookOpen } from 'lucide-react';
import { Badge } from '../common/Badge';

export const SkillProfile: React.FC<{ skills: EmployeeSkill[] }> = ({ skills }) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'EXPERT':
        return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'ADVANCED':
        return 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-cyan-400 border-brand-200 dark:border-brand-800';
      case 'INTERMEDIATE':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-700';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'RESUME':
        return (
          <span title="Source: Parsed Resume">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
          </span>
        );
      case 'CERTIFICATION':
        return (
          <span title="Source: Verified Certification">
            <Award className="w-3.5 h-3.5 text-amber-500" />
          </span>
        );
      case 'TRAINING':
        return (
          <span title="Source: Completed Training">
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
          </span>
        );
      default:
        return (
          <span title="Source: Profile / Manager Assessed">
            <UserCheck className="w-3.5 h-3.5 text-brand-500 dark:text-cyan-400" />
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-apple">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Technical & Functional Competencies</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Verified employee skill portfolio and proficiency levels</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
          {skills.length} Skills Tracked
        </span>
      </div>

      {skills.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No skills cataloged for this employee profile yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {skills.map((s) => (
            <div
              key={s.id || s.skill_name}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 flex items-center justify-center shadow-xs">
                  {getSourceIcon(s.source)}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">{s.skill_name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                    {s.source.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getLevelColor(s.skill_level)}`}>
                  {s.skill_level}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5 font-medium">
                  {s.confidence}% Conf.
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
