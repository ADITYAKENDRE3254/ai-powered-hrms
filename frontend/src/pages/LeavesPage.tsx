import React, { useState, useEffect } from 'react';
import { leaveService } from '../services/leave.service';
import { LeaveRequest, LeaveBalance, LeaveStatus } from '../types';
import { ApplyLeaveModal } from '../components/leave/ApplyLeaveModal';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Plus, Check, X, ShieldCheck, UserCheck, CheckCircle2, Clock } from 'lucide-react';

export const LeavesPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isApprover = hasRole('SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER');

  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);

  const [activeTab, setActiveTab] = useState<'my' | 'pending' | 'all'>(
    isApprover ? 'pending' : 'my'
  );
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [myL, bal] = await Promise.all([
        leaveService.getMyLeaves(),
        leaveService.getMyLeaveBalance(),
      ]);
      setMyLeaves(myL);
      setBalance(bal);

      if (isApprover) {
        const pending = await leaveService.getPendingLeaves();
        setPendingLeaves(pending);
      }
      if (hasRole('SUPER_ADMIN', 'HR_MANAGER')) {
        const all = await leaveService.getAllLeaves();
        setAllLeaves(all);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
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
    const reason = window.prompt('Enter rejection reason:') || 'Declined by reviewer';
    try {
      await leaveService.rejectLeave(id, reason);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Intelligent Leave Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated 1-day auto-approval, 2-day Team Leader routing, and 3+ day Manager governance.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Casual Leave (CL)</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{balance?.casual_leave || 12} Days</p>
            <span className="text-[11px] text-emerald-600 font-semibold">&bull; 1-Day Auto-Approved</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
            CL
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Sick Leave (SL)</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{balance?.sick_leave || 10} Days</p>
            <span className="text-[11px] text-blue-600 font-semibold">&bull; 2-Day TL Routing</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
            SL
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Earned Leave (EL)</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{balance?.earned_leave || 15} Days</p>
            <span className="text-[11px] text-purple-600 font-semibold">&bull; 3+ Day Manager Routing</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
            EL
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {isApprover && (
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Pending Approvals</span>
            {pendingLeaves.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                {pendingLeaves.length}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'my'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Leave History
        </button>

        {hasRole('SUPER_ADMIN', 'HR_MANAGER') && (
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'all'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Company-Wide Leaves
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                {activeTab !== 'my' && <th className="py-3 px-4">Employee</th>}
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Approver</th>
                {activeTab === 'pending' && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {((activeTab === 'my' ? myLeaves : activeTab === 'pending' ? pendingLeaves : allLeaves)).length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No leave records found for this view.
                  </td>
                </tr>
              ) : (
                (activeTab === 'my' ? myLeaves : activeTab === 'pending' ? pendingLeaves : allLeaves).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60">
                    {activeTab !== 'my' && (
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {l.employee_name || l.employee_code}
                      </td>
                    )}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{l.leave_type}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-700">
                      {l.duration_days} Day{l.duration_days > 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {l.start_date} to {l.end_date}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{l.reason}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={l.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {l.approver_name || (l.duration_days === 1 ? '⚡ Auto-Approved' : '-')}
                    </td>
                    {activeTab === 'pending' && (
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleApprove(l.id)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold border border-emerald-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(l.id)}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold border border-rose-200"
                        >
                          Reject
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showApplyModal && (
        <ApplyLeaveModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onLeaveCreated={loadData}
        />
      )}
    </div>
  );
};
