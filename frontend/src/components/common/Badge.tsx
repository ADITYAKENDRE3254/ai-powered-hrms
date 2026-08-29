import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = (val: string) => {
    switch (val?.toUpperCase()) {
      // Verified / Approved / Open / Active / Selected
      case 'VERIFIED':
      case 'APPROVED':
      case 'OPEN':
      case 'ACTIVE':
      case 'SELECTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10';

      // Pending / In Review / Interview / Probation / Draft
      case 'PENDING_TL':
      case 'PENDING_MANAGER':
      case 'APPLIED':
      case 'INTERVIEW':
      case 'PROBATION':
      case 'DRAFT':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10';

      // AI Screened / Shortlisted / Processed
      case 'AI_SCREENED':
      case 'SHORTLISTED':
      case 'PROCESSED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/10';

      // Rejected / Terminated / Closed / Inactive
      case 'REJECTED':
      case 'TERMINATED':
      case 'CLOSED':
      case 'INACTIVE':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/10';
    }
  };

  const formatText = (val: string) => {
    if (!val) return '';
    return val.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ring-1 ring-inset ${getBadgeStyle(
        status
      )} ${className}`}
    >
      {formatText(status)}
    </span>
  );
};
