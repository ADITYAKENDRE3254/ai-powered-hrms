import React from 'react';

interface BadgeProps {
  status?: string;
  variant?: 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'ai' | 'cyan' | 'purple';
  children?: React.ReactNode;
  className?: string;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children, className = '', showDot = false }) => {
  const getBadgeStyle = () => {
    if (variant) {
      switch (variant) {
        case 'success':
          return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
        case 'info':
          return 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800/60';
        case 'cyan':
          return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60';
        case 'purple':
        case 'ai':
          return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
        case 'warning':
          return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';
        case 'danger':
          return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60';
        default:
          return 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-700';
      }
    }

    const val = status?.toUpperCase() || '';
    switch (val) {
      // Verified / Approved / Open / Active / Selected / High / Low Risk
      case 'VERIFIED':
      case 'APPROVED':
      case 'OPEN':
      case 'ACTIVE':
      case 'SELECTED':
      case 'COMPLETED':
      case 'LOW':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';

      // Pending / In Review / Interview / Probation / Draft / Medium
      case 'PENDING_TL':
      case 'PENDING_MANAGER':
      case 'PENDING':
      case 'APPLIED':
      case 'INTERVIEW':
      case 'PROBATION':
      case 'DRAFT':
      case 'IN_PROGRESS':
      case 'MEDIUM':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';

      // AI Screened / Shortlisted / High Performer / Intermediate / Advanced
      case 'AI_SCREENED':
      case 'SHORTLISTED':
      case 'PROCESSED':
      case 'HIGH':
      case 'ADVANCED':
      case 'EXPERT':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';

      // Intermediate / In Progress
      case 'INTERMEDIATE':
        return 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60';

      // Rejected / Terminated / Closed / Inactive / Danger / Overdue / High Risk
      case 'REJECTED':
      case 'TERMINATED':
      case 'CLOSED':
      case 'INACTIVE':
      case 'OVERDUE':
      case 'NEEDS_ATTENTION':
      case 'CRITICAL':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60';

      default:
        return 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-700';
    }
  };

  const displayText = children || (status ? status.replace(/_/g, ' ') : '');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors shadow-xs ${getBadgeStyle()} ${className}`}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      )}
      <span>{displayText}</span>
    </span>
  );
};

