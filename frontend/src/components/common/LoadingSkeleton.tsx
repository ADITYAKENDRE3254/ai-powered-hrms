import React from 'react';

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-slate-200/80 dark:border-navy-800 animate-pulse shadow-sm">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-navy-800" />
        <div className="w-16 h-5 rounded-full bg-slate-200 dark:bg-navy-800" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="w-24 h-4 bg-slate-200 dark:bg-navy-800 rounded" />
        <div className="w-32 h-7 bg-slate-200 dark:bg-navy-800 rounded" />
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
        <div className="w-20 h-3 bg-slate-200 dark:bg-navy-800 rounded" />
        <div className="w-16 h-3 bg-slate-200 dark:bg-navy-800 rounded" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-slate-100 dark:border-navy-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 dark:bg-navy-800 rounded w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
};

export const CardSkeleton: React.FC<{ height?: string }> = ({ height = 'h-64' }) => {
  return (
    <div className={`bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/80 dark:border-navy-800 p-6 animate-pulse ${height} flex flex-col justify-between shadow-sm`}>
      <div className="space-y-3">
        <div className="w-1/3 h-5 bg-slate-200 dark:bg-navy-800 rounded" />
        <div className="w-1/2 h-3 bg-slate-200 dark:bg-navy-800 rounded" />
      </div>
      <div className="space-y-2">
        <div className="w-full h-3 bg-slate-200 dark:bg-navy-800 rounded" />
        <div className="w-4/5 h-3 bg-slate-200 dark:bg-navy-800 rounded" />
      </div>
    </div>
  );
};
