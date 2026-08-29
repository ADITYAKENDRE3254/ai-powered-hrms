import React, { useState, useEffect } from 'react';
import { auditService } from '../services/report.service';
import { AuditLog } from '../types';
import { ShieldCheck, Search, Filter, ShieldAlert, Clock, User } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Security & Compliance Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all user activities, status approvals, payroll generations, and geofence events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit records matching filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {log.user_email || 'System'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{log.action}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{log.ip_address || '127.0.0.1'}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-md truncate">{log.details || '-'}</td>
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
