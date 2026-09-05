import React, { useState } from 'react';
import { Sparkles, TrendingUp, HelpCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface PerformanceFactorRadialProps {
  score?: number;
  confidence?: number;
  trend?: 'improving' | 'stable' | 'declining';
  positiveFactors?: { name: string; score: number; weight: string }[];
  negativeFactors?: { name: string; score: number; weight: string }[];
}

export const PerformanceFactorRadial: React.FC<PerformanceFactorRadialProps> = ({
  score = 82,
  confidence = 87,
  trend = 'improving',
  positiveFactors = [
    { name: 'Attendance & Punctuality', score: 94, weight: '+12 pts' },
    { name: 'Goal & Sprint Completion', score: 86, weight: '+8 pts' },
    { name: 'Training Course Velocity', score: 78, weight: '+6 pts' },
  ],
  negativeFactors = [
    { name: 'Skill Gap in Cloud Native', score: 52, weight: '-5 pts' },
    { name: 'Tenure & Experience Baseline', score: 64, weight: '-3 pts' },
  ]
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-cyan-400 flex items-center justify-center border border-brand-100 dark:border-brand-900/40">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              AI Performance Score & Driver Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-factor explainable machine learning prediction model
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs text-brand-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Why this prediction?</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Radial Score Gauge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-slate-100 dark:stroke-navy-950"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="url(#perfGradient)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="perfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {score}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">/ 100</span>
            </div>
          </div>
          <div className="mt-2 text-center">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trajectory: Improving</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Confidence: {confidence}%</span>
          </div>
        </div>

        {/* Contributing Positive & Attention Factors */}
        <div className="md:col-span-8 space-y-3">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Positive Growth Drivers</span>
            </span>
            <div className="space-y-1.5">
              {positiveFactors.map((f) => (
                <div key={f.name} className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{f.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{f.score}%</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{f.weight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Coaching & Development Focus</span>
            </span>
            <div className="space-y-1.5">
              {negativeFactors.map((f) => (
                <div key={f.name} className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/40 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{f.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{f.score}%</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">{f.weight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popover / Explanation Drawer */}
      {showExplanation && (
        <div className="mt-5 p-5 rounded-2xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
          <div className="flex items-center justify-between font-bold text-brand-900 dark:text-brand-200">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>How AI Calculates Performance Forecasts</span>
            </span>
            <button onClick={() => setShowExplanation(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p>
            The model (<code className="bg-brand-100 dark:bg-brand-900 px-1.5 py-0.5 rounded text-brand-800 dark:text-cyan-300">perf-rf-v1.2</code>) computes a weighted regression across 4 normalized vectors:
            attendance stability (35%), leave utilization pattern (20%), verified skill roadmap alignment (25%), and historical tenure milestones (20%).
          </p>
        </div>
      )}
    </div>
  );
};
