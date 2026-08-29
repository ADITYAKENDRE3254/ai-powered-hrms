import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/report.service';
import { leaveService } from '../../services/leave.service';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Users, Clock, CalendarDays, Check, X, ShieldCheck } from 'lucide-react';
import { LeaveRequest } from '../../types';

export const ManagerDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);

  const loadData = async () => {
    try {
      const [sum, leaves] = await Promise.all([
        reportService.getDashboardSummary(),
        leaveService.getPendingLeaves(),
      ]);
      setSummary(sum);
      setPendingLeaves(leaves);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await leaveService.approveLeave(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await leaveService.rejectLeave(id, 'Declined by Department Manager');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-400/30 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Department Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          {summary?.department_name || 'Engineering'} Department Management
        </h1>
        <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl">
          Review 3+ day leave requests for department members and track daily operational attendance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Department Headcount" value={summary?.department_employees || '0'} icon={Users} color="purple" />
        <StatCard title="Present Today" value={summary?.department_present_today || '0'} icon={Clock} color="emerald" />
        <StatCard title="3+ Day Leaves Pending" value={pendingLeaves.length} icon={CalendarDays} color="amber" />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Department Leave Requests (3+ Days)</h3>
        <p className="text-xs text-slate-500 mb-4">Department Manager approval required</p>

        {pendingLeaves.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No pending 3+ day leave requests for your department.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Dates</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-bold text-slate-900">{l.employee_name}</td>
                    <td className="py-3 px-3">{l.leave_type}</td>
                    <td className="py-3 px-3 font-bold text-purple-700">{l.duration_days} Days</td>
                    <td className="py-3 px-3 text-slate-500">{l.start_date} to {l.end_date}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{l.reason}</td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleApprove(l.id)}
                        className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold border border-emerald-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(l.id)}
                        className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold border border-rose-200"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
