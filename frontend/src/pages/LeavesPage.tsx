import React, { useState, useEffect } from 'react';
import { leaveService } from '../services/leave.service';
import { LeaveRequest, LeaveBalance, LeaveStatus } from '../types';
import { ApplyLeaveModal } from '../components/leave/ApplyLeaveModal';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Plus, Check, X, ShieldCheck, UserCheck, CheckCircle2, Clock } from 'lucide-react';

import { LeaveAnalyticsChart } from '../components/charts/LeaveAnalyticsChart';

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
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Intelligent Leave Management
            </h1>
            <span className="ai-badge">✦ Multi-Tier Workflow</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated 1-day auto-approval, 2-day Team Leader routing, and 3+ day Manager / HR governance.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 text-white rounded-2xl text-xs font-bold shadow-apple-md transition-all flex items-center gap-2 shrink-0 hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex items-center justify-between transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Casual Leave (CL)
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {balance?.casual_leave || 12} Days
            </p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
              &bull; 1-Day Auto-Approved
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center font-bold text-sm shadow-xs">
            CL
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex items-center justify-between transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sick Leave (SL)
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {balance?.sick_leave || 10} Days
            </p>
            <span className="text-[11px] text-brand-600 dark:text-cyan-400 font-semibold mt-0.5 block">
              &bull; 2-Day TL Routing
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-cyan-400 border border-brand-100 dark:border-brand-800/60 flex items-center justify-center font-bold text-sm shadow-xs">
            SL
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex items-center justify-between transition-all">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Earned Leave (EL)
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {balance?.earned_leave || 15} Days
            </p>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5 block">
              &bull; 3+ Day Manager Routing
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/60 flex items-center justify-center font-bold text-sm shadow-xs">
            EL
          </div>
        </div>
      </div>

      {/* Leave Analytics Visuals */}
      <LeaveAnalyticsChart />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-1">
        {isApprover && (
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'border-brand-600 text-brand-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Pending Approvals</span>
            {pendingLeaves.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                {pendingLeaves.length}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'my'
              ? 'border-brand-600 text-brand-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>My Leave History</span>
        </button>

        {hasRole('SUPER_ADMIN', 'HR_MANAGER') && (
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'border-brand-600 text-brand-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Company-Wide Leaves</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-navy-950/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-navy-800">
              <tr>
                {activeTab !== 'my' && <th className="py-3.5 px-5">Employee</th>}
                <th className="py-3.5 px-5">Leave Type</th>
                <th className="py-3.5 px-5">Duration</th>
                <th className="py-3.5 px-5">Dates</th>
                <th className="py-3.5 px-5">Reason</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Approver</th>
                {activeTab === 'pending' && <th className="py-3.5 px-5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {(activeTab === 'my' ? myLeaves : activeTab === 'pending' ? pendingLeaves : allLeaves).length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <EmptyState
                      title="No Leave Records Found"
                      description="No records available for this view."
                    />
                  </td>
                </tr>
              ) : (
                (activeTab === 'my' ? myLeaves : activeTab === 'pending' ? pendingLeaves : allLeaves).map((l) => (
                  <tr
                    key={l.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors"
                  >
                    {activeTab !== 'my' && (
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                        {l.employee_name || l.employee_code}
                      </td>
                    )}
                    <td className="py-4 px-5 font-semibold text-slate-800 dark:text-slate-200">{l.leave_type}</td>
                    <td className="py-4 px-5 font-bold text-brand-600 dark:text-cyan-400">
                      {l.duration_days} Day{l.duration_days > 1 ? 's' : ''}
                    </td>
                    <td className="py-4 px-5 text-slate-500 dark:text-slate-400">
                      {l.start_date} to {l.end_date}
                    </td>
                    <td className="py-4 px-5 text-slate-600 dark:text-slate-300 max-w-xs truncate">{l.reason}</td>
                    <td className="py-4 px-5">
                      <Badge status={l.status} />
                    </td>
                    <td className="py-4 px-5 text-slate-500 dark:text-slate-400">
                      {l.approver_name || (l.duration_days === 1 ? '⚡ Auto-Approved' : '-')}
                    </td>
                    {activeTab === 'pending' && (
                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => handleApprove(l.id)}
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(l.id)}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded-xl font-bold border border-rose-200 dark:border-rose-800 transition-colors"
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
