import React, { useState, useEffect } from 'react';
import { reportService } from '../services/report.service';
import { Download, Users, Clock, DollarSign, Briefcase, ShieldCheck, FileSpreadsheet, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    reportService.getDashboardSummary().then((res: any) => {
      setSummary(res);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const handleDownload = async (type: string, downloadFn: () => Promise<void>, label: string) => {
    try {
      setDownloadingType(type);
      setErrorMessage(null);
      setSuccessMessage(null);
      await downloadFn();
      setSuccessMessage(`${label} downloaded successfully.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.detail || `Failed to download ${label}. Please ensure you have sufficient permissions.`);
      setTimeout(() => setErrorMessage(null), 6000);
    } finally {
      setDownloadingType(null);
    }
  };

  const reports = [
    {
      id: 'executive',
      title: 'Executive Operations Summary',
      description: 'Comprehensive high-level snapshot of active workforce headcounts, attendance compliance rates, payroll disbursements, and hiring funnel velocity.',
      icon: Sparkles,
      iconColor: 'text-indigo-600 dark:text-cyan-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-800/60',
      buttonBg: 'bg-gradient-to-r from-indigo-600 via-brand-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-apple-md',
      buttonText: 'Download Executive CSV',
      handler: () => reportService.downloadExecutiveReport(),
      label: 'Executive Summary CSV',
      badge: '✦ Executive Snapshot'
    },
    {
      id: 'attendance',
      title: 'Attendance Audit Log',
      description: 'Complete verified logs of daily punch in/out timestamps, employee codes, department assignments, GPS distance metrics, and geofence verification compliance.',
      icon: Clock,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800/60',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-apple',
      buttonText: 'Download Attendance CSV',
      handler: () => reportService.downloadAttendanceReport(),
      label: 'Attendance Audit CSV',
      badge: 'GPS Verified'
    },
    {
      id: 'payroll',
      title: 'Payroll & Deductions Ledger',
      description: 'Complete financial ledger detailing working days, payable days, LWP unpaid deductions, employer PF contributions, statutory tax withholdings, and net disbursed salary.',
      icon: DollarSign,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-100 dark:border-cyan-800/60',
      buttonBg: 'bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-700 hover:to-brand-700 text-white shadow-apple-md',
      buttonText: 'Download Payroll CSV',
      handler: () => reportService.downloadPayrollReport(),
      label: 'Payroll Ledger CSV',
      badge: 'Statutory Ledger'
    },
    {
      id: 'candidates',
      title: 'Talent Pipeline & AI Match',
      description: 'Full applicant tracking database including resume extraction, AI match scores, applicant contact details, competency profiles, and pipeline status progression.',
      icon: Briefcase,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-800/60',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-apple',
      buttonText: 'Download Talent Pipeline CSV',
      handler: () => reportService.downloadTalentPipelineReport(),
      label: 'Talent Pipeline CSV',
      badge: 'AI Screened'
    },
    {
      id: 'audit',
      title: 'Security & System Audit Trail',
      description: 'Immutable security log of all administrative actions, record alterations, IP addresses, timestamps, and governance events for ISO/compliance requirements.',
      icon: ShieldCheck,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-800/60',
      buttonBg: 'bg-slate-900 dark:bg-navy-800 hover:bg-slate-800 dark:hover:bg-navy-700 text-white border border-slate-700 dark:border-navy-700 shadow-apple',
      buttonText: 'Download Audit Trail CSV',
      handler: () => reportService.downloadAuditReport(),
      label: 'Audit Trail CSV',
      badge: 'Immutable Log'
    }
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Reports & Executive Export Center
            </h1>
            <span className="ai-badge">✦ Authenticated CSV Exports</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate, audit, and export verified organization attendance compliance, payroll distribution, talent pipelines, and security logs.
          </p>
        </div>
      </div>

      {/* Alert Banners */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2.5 shadow-apple-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2.5 shadow-apple-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* CSV Direct Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((r) => {
          const IconComp = r.icon;
          const isDownloading = downloadingType === r.id;

          return (
            <div
              key={r.id}
              className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-col justify-between transition-all hover:shadow-apple-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${r.iconBg} ${r.iconColor} border flex items-center justify-center shadow-xs transition-transform group-hover:scale-105`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                    {r.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {r.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {r.description}
                </p>
              </div>

              <button
                onClick={() => handleDownload(r.id, r.handler, r.label)}
                disabled={isDownloading}
                className={`mt-6 w-full py-3 px-4 rounded-2xl text-xs font-bold text-center transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none ${r.buttonBg}`}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing CSV...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{r.buttonText}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ReportsPage;

