import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/report.service';
import { leaveService } from '../../services/leave.service';
import { StatCard } from '../../components/common/StatCard';
import { StatCardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  Clock,
  CalendarDays,
  UserCheck,
  Brain,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { LeaveRequest } from '../../types';

export const TeamLeaderDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sum, leaves] = await Promise.all([
        reportService.getDashboardSummary(),
        leaveService.getPendingLeaves(),
      ]);
      setSummary(sum);
      setPendingLeaves(leaves);
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
    try {
      await leaveService.rejectLeave(id, 'Declined by Team Leader');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 border border-navy-800/80 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Team Leadership Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {summary?.team_name || 'Engineering Squad'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Fast-track 2-day team leave approvals, verify squad attendance, and guide skill progression.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => navigate('/workforce-intelligence')}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/25 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <Brain className="w-4 h-4" />
              <span>✦ Team Intelligence</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Team Members"
            value={summary?.team_members || summary?.total_employees || '0'}
            icon={Users}
            color="cyan"
            subtitle="Active Squad"
            onClick={() => navigate('/employees')}
          />
          <StatCard
            title="Verified Present Today"
            value={summary?.team_present_today || summary?.today_present || '0'}
            icon={Clock}
            color="emerald"
            subtitle="GPS on-site"
            onClick={() => navigate('/attendance')}
          />
          <StatCard
            title="2-Day Leaves Pending"
            value={pendingLeaves.length}
            icon={CalendarDays}
            color="amber"
            subtitle="TL approval required"
            onClick={() => navigate('/leaves')}
          />
        </div>
      )}

      {/* Leave Approval Table */}
      <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Team Leave Requests (2 Days)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Short-duration leaves directly managed by Team Leader approval
            </p>
          </div>
          <button
            onClick={() => navigate('/leaves')}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>All Requests</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingLeaves.length === 0 ? (
          <EmptyState
            title="No 2-day leaves pending"
            description="Your squad has no pending 2-day leave requests requiring review."
            aiSuggested={false}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-navy-700">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Team Member</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Date Span</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {pendingLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{l.employee_name || l.employee_code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{l.leave_type}</td>
                    <td className="py-3.5 px-4 font-bold text-cyan-600 dark:text-cyan-400">{l.duration_days} Days</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">{l.start_date} → {l.end_date}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{l.reason}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(l.id)}
                        className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg font-bold border border-emerald-200 dark:border-emerald-800/60 transition-colors shadow-2xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(l.id)}
                        className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded-lg font-bold border border-rose-200 dark:border-rose-800/60 transition-colors shadow-2xs"
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

