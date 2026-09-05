import React, { useState, useEffect } from 'react';
import { auditService } from '../services/report.service';
import { AuditLog } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { ShieldCheck, Search, Filter, ShieldAlert, Clock, User, Shield } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await auditService.getAuditLogs({
        module: moduleFilter || undefined,
        limit: 100,
      });
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [moduleFilter]);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Security & Compliance Audit Trail
            </h1>
            <span className="ai-badge">✦ Immutable Log</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable system activity ledger of all user authentications, status approvals, payroll generations, and geofence events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="text-xs px-4 py-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-2xl shadow-apple focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Security Modules</option>
            <option value="AUTH">Authentication (Login/Logout)</option>
            <option value="ATTENDANCE">Attendance & GPS</option>
            <option value="LEAVE">Leave Management</option>
            <option value="PAYROLL">Payroll & Deductions</option>
            <option value="RECRUITMENT">Recruitment & AI</option>
            <option value="EMPLOYEES">Employee Records</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-navy-950/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-navy-800">
              <tr>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-5">Module</th>
                <th className="py-3.5 px-5">Action</th>
                <th className="py-3.5 px-5">IP Address</th>
                <th className="py-3.5 px-5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState
                      title="No Audit Records Found"
                      description="No security events recorded under this filter."
                    />
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors"
                  >
                    <td className="py-4 px-5 font-mono text-slate-500 dark:text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                      {log.user_email || 'System'}
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-800 dark:text-slate-200">{log.action}</td>
                    <td className="py-4 px-5 font-mono text-slate-500 dark:text-slate-400">{log.ip_address || '127.0.0.1'}</td>
                    <td className="py-4 px-5 text-slate-600 dark:text-slate-300 max-w-md truncate">{log.details || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
