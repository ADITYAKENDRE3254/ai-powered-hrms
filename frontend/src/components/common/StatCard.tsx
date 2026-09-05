import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color?: 'indigo' | 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'cyan';
  subtitle?: string;
  aiBenchmark?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'positive',
  color = 'blue',
  subtitle,
  aiBenchmark,
  onClick,
}) => {
  const colorMap = {
    blue: 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border-brand-200/60 dark:border-brand-800/60',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-800/60',
    purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/60',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60',
    amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60',
    rose: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/80 dark:border-navy-800 p-5 shadow-apple hover:shadow-apple-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-brand-500/40' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {value}
          </p>
        </div>
        <div className={`p-2.5 rounded-xl border ${colorMap[color]} shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(change || subtitle || aiBenchmark) && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 truncate">
            {change && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold text-[11px] ${
                  changeType === 'positive'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    : changeType === 'negative'
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {changeType === 'positive' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : changeType === 'negative' ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                {change}
              </span>
            )}
            {subtitle && (
              <span className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                {subtitle}
              </span>
            )}
          </div>

          {aiBenchmark && (
            <span className="ai-badge text-[10px] shrink-0">
              <Sparkles className="w-2.5 h-2.5" />
              {aiBenchmark}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

