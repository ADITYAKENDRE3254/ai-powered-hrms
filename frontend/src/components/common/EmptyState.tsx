import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  aiSuggested?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  aiSuggested = false,
}) => {
  const buttonLabel = actionText || actionLabel;

  return (
    <div className="py-16 px-6 text-center flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-navy-800 dark:to-navy-900 border border-slate-200/80 dark:border-navy-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm mb-4">
        <Icon className="w-7 h-7" />
      </div>

      {aiSuggested && (
        <span className="ai-badge mb-2">
          ✦ AI Intelligence
        </span>
      )}

      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{description}</p>

      {buttonLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-brand-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};
