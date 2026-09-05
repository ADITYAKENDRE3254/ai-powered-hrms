import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

export const FutureSkillsRoadmapChart: React.FC = () => {
  return (
    <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-cyan-400 flex items-center justify-center border border-brand-100 dark:border-brand-900/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              AI Talent Pipeline: Skills to Workforce Readiness
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Autonomous mapping from verified competencies to targeted training & promotion readiness
            </p>
          </div>
        </div>

        <span className="ai-badge">
          ✦ Predictive Pipeline
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-stretch">
        {/* Step 1: Current Skills */}
        <div className="p-4 rounded-2xl bg-[#FAFAFC] dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-brand-600 dark:text-cyan-400 uppercase tracking-wider block mb-2">
              1. Current Portfolio
            </span>
            <div className="space-y-1.5">
              <div className="p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/60 dark:border-navy-800 text-xs flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Python / FastAPI</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/60 dark:border-navy-800 text-xs flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">React & TypeScript</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-navy-800 text-[10px] text-slate-400">
            4 Core Proficiencies
          </div>
        </div>

        {/* Step 2: Skill Gaps */}
        <div className="p-4 rounded-2xl bg-[#FAFAFC] dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-2">
              2. Skill Gaps Detected
            </span>
            <div className="space-y-1.5">
              <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs flex items-center justify-between">
                <span className="font-bold text-amber-900 dark:text-amber-200">Kubernetes & Docker</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs flex items-center justify-between">
                <span className="font-bold text-amber-900 dark:text-amber-200">AWS / Cloud Native</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-navy-800 text-[10px] text-slate-400">
            Target: Lead Architect
          </div>
        </div>

        {/* Step 3: Future Skills */}
        <div className="p-4 rounded-2xl bg-[#FAFAFC] dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-2">
              3. Future Competencies
            </span>
            <div className="space-y-1.5">
              <div className="p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 text-xs">
                <span className="font-bold text-purple-900 dark:text-purple-200 block">Distributed MLOps</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400">Next 12–18 months</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 text-xs">
                <span className="font-bold text-purple-900 dark:text-purple-200 block">LLM Fine-Tuning</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400">High Market Impact</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-navy-800 text-[10px] text-slate-400">
            Career Forecast
          </div>
        </div>

        {/* Step 4: Training Programs */}
        <div className="p-4 rounded-2xl bg-[#FAFAFC] dark:bg-navy-950 border border-slate-100 dark:border-navy-800/80 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-2">
              4. Target Training
            </span>
            <div className="space-y-1.5">
              <div className="p-2 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-800/40 text-xs flex items-center justify-between">
                <span className="font-bold text-cyan-900 dark:text-cyan-200">Cloud Bootcamp</span>
                <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
              </div>
              <div className="p-2 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-800/40 text-xs flex items-center justify-between">
                <span className="font-bold text-cyan-900 dark:text-cyan-200">CI/CD Mastery</span>
                <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-navy-800 text-[10px] text-slate-400">
            Auto-Assigned Hub
          </div>
        </div>

        {/* Step 5: Workforce Readiness */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-2">
              5. Promotion Ready
            </span>
            <div className="p-3 rounded-xl bg-white dark:bg-navy-900 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">88%</span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">Readiness Index</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold text-center">
            Ready for Next Tier
          </div>
        </div>
      </div>
    </div>
  );
};
