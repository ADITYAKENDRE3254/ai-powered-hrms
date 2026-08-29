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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Reports & Analytics Export</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate, view, and export organization audit logs, attendance compliance, and payroll distributions.
        </p>
      </div>

      {/* CSV Direct Download Center */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Attendance Export */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Attendance Log Export</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete records of daily punch in/out timestamps, GPS distance, work duration, and geofence verification status.
            </p>
          </div>
          <a
            href={reportService.getAttendanceExportUrl()}
            target="_blank"
            rel="noreferrer"
            className="mt-4 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Attendance CSV</span>
          </a>
        </div>

        {/* Payroll Export */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Payroll & Deductions Export</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Historical ledger of working days, payable days, LWP deductions, PF, Tax, and net disbursed earnings per staff member.
            </p>
          </div>
          <a
            href={reportService.getPayrollExportUrl()}
            target="_blank"
            rel="noreferrer"
            className="mt-4 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold text-center shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Payroll CSV</span>
          </a>
        </div>

        {/* Recruitment Pipeline Export */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Recruitment & AI Score Export</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Applicant database with AI resume matching percentages, identified competencies, and current recruitment statuses.
            </p>
          </div>
          <button
            onClick={() => alert('Exporting candidate dataset...')}
            className="mt-4 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Candidate Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
