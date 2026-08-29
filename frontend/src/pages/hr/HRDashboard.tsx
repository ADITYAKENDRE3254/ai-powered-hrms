import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/report.service';
import { leaveService } from '../../services/leave.service';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Users, Clock, CalendarDays, DollarSign, Briefcase, Check, X, ArrowUpRight } from 'lucide-react';
import { GeneratePayrollModal } from '../../components/payroll/GeneratePayrollModal';
import { LeaveRequest } from '../../types';

export const HRDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const navigate = useNavigate();

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

  const handleApproveLeave = async (id: number) => {
    try {
      await leaveService.approveLeave(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectLeave = async (id: number) => {
    try {
      await leaveService.rejectLeave(id, 'Declined by HR Manager');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">HR Management Hub</h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-1 max-w-xl">
            Streamline employee lifecycles, manage leaves, run automated payroll, and oversee recruitment.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowPayrollModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" />
            <span>Generate Payroll</span>
          </button>
          <button
            onClick={() => navigate('/recruitment')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4" />
            <span>AI Recruiter</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Employees" value={summary?.total_employees || '0'} icon={Users} color="blue" />
        <StatCard title="Present Today" value={summary?.today_present || '0'} icon={Clock} color="emerald" />
        <StatCard title="Pending Leaves" value={pendingLeaves.length} icon={CalendarDays} color="amber" />
        <StatCard title="Open Positions" value={summary?.open_jobs || '0'} icon={Briefcase} color="purple" />
      </div>

      {/* Pending Leave Requests Quick Approval Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pending Leave Approvals</h3>
            <p className="text-xs text-slate-500">Multi-tier leave requests requiring management review</p>
          </div>
          <button
            onClick={() => navigate('/leaves')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
          >
            <span>View All Leaves</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No pending leave requests at this moment.
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
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingLeaves.slice(0, 5).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {l.employee_name || l.employee_code}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700">{l.leave_type}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold">{l.duration_days} Day{l.duration_days > 1 ? 's' : ''}</td>
                    <td className="py-3 px-3 text-slate-500">
                      {l.start_date} to {l.end_date}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{l.reason}</td>
                    <td className="py-3 px-3">
                      <Badge status={l.status} />
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleApproveLeave(l.id)}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold border border-emerald-200 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectLeave(l.id)}
                        className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold border border-rose-200 transition-colors"
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

      {showPayrollModal && (
        <GeneratePayrollModal
          isOpen={showPayrollModal}
          onClose={() => setShowPayrollModal(false)}
          onPayrollGenerated={loadData}
        />
      )}
    </div>
  );
};
