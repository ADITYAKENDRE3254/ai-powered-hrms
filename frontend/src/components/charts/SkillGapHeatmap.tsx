import React from 'react';
import { Target, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface SkillGapHeatmapProps {
  departments?: string[];
  skills?: string[];
  matrix?: { [dept: string]: { [skill: string]: 'LOW' | 'MED' | 'HIGH' } };
}

const defaultDepts = ['Engineering', 'Sales & Ops', 'People & HR', 'Finance'];
const defaultSkills = [
  'Cloud Architecture',
  'AI & Prompt Engineering',
  'DevOps & CI/CD',
  'Leadership & Agile',
  'Cross-Team Comms'
];

const defaultMatrix: { [dept: string]: { [skill: string]: 'LOW' | 'MED' | 'HIGH' } } = {
  'Engineering': {
    'Cloud Architecture': 'HIGH',
    'AI & Prompt Engineering': 'MED',
    'DevOps & CI/CD': 'HIGH',
    'Leadership & Agile': 'MED',
    'Cross-Team Comms': 'LOW',
  },
  'Sales & Ops': {
    'Cloud Architecture': 'MED',
    'AI & Prompt Engineering': 'HIGH',
    'DevOps & CI/CD': 'LOW',
    'Leadership & Agile': 'MED',
    'Cross-Team Comms': 'LOW',
  },
  'People & HR': {
    'Cloud Architecture': 'LOW',
    'AI & Prompt Engineering': 'MED',
    'DevOps & CI/CD': 'LOW',
    'Leadership & Agile': 'HIGH',
    'Cross-Team Comms': 'LOW',
  },
  'Finance': {
    'Cloud Architecture': 'MED',
    'AI & Prompt Engineering': 'LOW',
    'DevOps & CI/CD': 'MED',
    'Leadership & Agile': 'MED',
    'Cross-Team Comms': 'LOW',
  }
};

export const SkillGapHeatmap: React.FC<SkillGapHeatmapProps> = ({
  departments = defaultDepts,
  skills = defaultSkills,
  matrix = defaultMatrix,
}) => {
  const getCellBadge = (status: 'LOW' | 'MED' | 'HIGH') => {
    switch (status) {
      case 'HIGH':
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            <span>High Gap</span>
          </div>
        );
      case 'MED':
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>Moderate</span>
          </div>
        );
      case 'LOW':
        return (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Proficient</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/40">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Department Skill Deficit Heatmap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cross-functional technical and leadership competency matrix
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Gap</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Proficient</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAFAFC] dark:bg-navy-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-navy-800">
            <tr>
              <th className="py-3.5 px-4 rounded-l-2xl">Competency Area</th>
              {departments.map((dept) => (
                <th key={dept} className="py-3.5 px-4 text-center">{dept}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-navy-800/80">
            {skills.map((skill) => (
              <tr key={skill} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                  {skill}
                </td>
                {departments.map((dept) => {
                  const status = matrix[dept]?.[skill] || 'LOW';
                  return (
                    <td key={dept} className="py-4 px-4 text-center">
                      {getCellBadge(status)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
