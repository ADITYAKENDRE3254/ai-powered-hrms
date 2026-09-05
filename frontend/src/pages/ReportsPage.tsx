import React, { useState, useEffect } from 'react';
import { reportService } from '../services/report.service';
import { BarChart3, Download, FileSpreadsheet, Users, Clock, DollarSign, Briefcase } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    reportService.getDashboardSummary().then((res: any) => {
      setSummary(res);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Reports & Analytics Export
          </h1>
          <span className="ai-badge">✦ CSV & PDF Export</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generate, audit, and export verified organization attendance compliance, payroll distribution, and talent pipelines.
        </p>
      </div>

      {/* CSV Direct Download Center */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Export */}
        <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-col justify-between transition-all hover:shadow-apple-md">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center mb-4 shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendance Audit Log</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Complete records of daily punch in/out timestamps, GPS distances, work durations, and geofence verification compliance.
            </p>
          </div>
          <a
            href={reportService.getAttendanceExportUrl()}
            target="_blank"
            rel="noreferrer"
            className="mt-6 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold text-center shadow-apple transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            <span>Download Attendance CSV</span>
          </a>
        </div>

        {/* Payroll Export */}
        <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-col justify-between transition-all hover:shadow-apple-md">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-cyan-400 border border-brand-100 dark:border-brand-800/60 flex items-center justify-center mb-4 shadow-xs">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Payroll & Deductions Ledger</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Historical ledger of working days, payable days, LWP deductions, PF, Tax, and net disbursed earnings per staff member.
            </p>
          </div>
          <a
            href={reportService.getPayrollExportUrl()}
            target="_blank"
            rel="noreferrer"
            className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 text-white rounded-2xl text-xs font-bold text-center shadow-apple-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            <span>Download Payroll CSV</span>
          </a>
        </div>

        {/* Recruitment Pipeline Export */}
        <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-col justify-between transition-all hover:shadow-apple-md">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/60 flex items-center justify-center mb-4 shadow-xs">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Talent Pipeline & AI Match</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Applicant database with AI resume matching percentages, identified competencies, and current recruitment statuses.
            </p>
          </div>
          <button
            onClick={() => alert('Exporting candidate dataset...')}
            className="mt-6 w-full py-3 px-4 bg-slate-900 dark:bg-navy-800 hover:bg-slate-800 dark:hover:bg-navy-700 text-white rounded-2xl text-xs font-bold shadow-apple border border-slate-700 dark:border-navy-700 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>Export Candidate Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
