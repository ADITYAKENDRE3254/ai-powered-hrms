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
  DollarSign,
  Briefcase,
  ArrowUpRight,
  Sparkles,
  Brain,
} from 'lucide-react';
import { GeneratePayrollModal } from '../../components/payroll/GeneratePayrollModal';
import { LeaveRequest } from '../../types';
import { WorkforceGrowthChart } from '../../components/charts/WorkforceGrowthChart';
import { AttendanceTrendChart } from '../../components/charts/AttendanceTrendChart';
import { DepartmentDistributionChart } from '../../components/charts/DepartmentDistributionChart';
import { OrganizationHealthScore } from '../../components/charts/OrganizationHealthScore';

export const HRDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
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
    <div className="space-y-8 font-sans antialiased">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 border border-navy-800/80 p-8 sm:p-10 text-white shadow-apple-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-cyan-300 text-xs font-semibold border border-brand-400/30 mb-3.5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>People & Operations Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              HR Management Hub
            </h1>
            <p className="text-slate-300/90 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
              Streamline organizational headcount, manage multi-tier leave workflows, run automated attendance-based payroll, and oversee employee performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => setShowPayrollModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-apple shadow-brand-600/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>Generate Payroll</span>
            </button>
            <button
              onClick={() => navigate('/workforce-intelligence')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/15 backdrop-blur-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2"
            >
              <Brain className="w-4 h-4 text-cyan-400" />
              <span>✦ AI Workforce</span>
            </button>
          </div>
        </div>
      </div>

      {/* Level 1: KPI Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Employees"
            value={summary?.total_employees || '0'}
            icon={Users}
            color="blue"
            subtitle="Full-time registered staff"
            onClick={() => navigate('/employees')}
          />
          <StatCard
            title="Present Today"
            value={summary?.today_present || '0'}
            icon={Clock}
            color="cyan"
            subtitle="GPS Geofence Verified"
            change="+2 vs yesterday"
            changeType="positive"
            onClick={() => navigate('/attendance')}
          />
          <StatCard
            title="Pending Leaves"
            value={pendingLeaves.length}
            icon={CalendarDays}
            color="amber"
            subtitle="Requires HR Review"
            onClick={() => navigate('/leaves')}
          />
          <StatCard
            title="Open ATS Positions"
            value={summary?.open_jobs || '0'}
            icon={Briefcase}
            color="purple"
            subtitle="Active Candidate Pipelines"
            onClick={() => navigate('/recruitment')}
          />
        </div>
      )}

      {/* Level 2: Core HR Visualizations (Workforce Growth + Attendance Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkforceGrowthChart />
        <AttendanceTrendChart />
      </div>

      {/* Level 3: Department Breakdown & Organization Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentDistributionChart />
        <OrganizationHealthScore />
      </div>

      {/* Level 4: Pending Leave Requests Quick Approval Table */}
      <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Pending Leave Approvals
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-tier leave requests requiring management & HR governance
            </p>
          </div>
          <button
            onClick={() => navigate('/leaves')}
            className="text-xs text-brand-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1"
          >
            <span>View All Leaves</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingLeaves.length === 0 ? (
          <EmptyState
            title="All leave requests resolved"
            description="There are currently no outstanding leave applications pending your approval."
            aiSuggested={false}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFC] dark:bg-navy-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-navy-800">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-2xl">Employee</th>
                  <th className="py-3.5 px-4">Leave Type</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Date Span</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right rounded-r-2xl">Quick Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800/80">
                {pendingLeaves.slice(0, 5).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {l.employee_name || l.employee_code}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {l.leave_type}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {l.duration_days} Day{l.duration_days > 1 ? 's' : ''}
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">
                      {l.start_date} → {l.end_date}
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {l.reason}
                    </td>
                    <td className="py-4 px-4">
                      <Badge status={l.status} showDot />
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleApproveLeave(l.id)}
                        className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800/60 transition-colors shadow-2xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectLeave(l.id)}
                        className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl font-bold border border-rose-200 dark:border-rose-800/60 transition-colors shadow-2xs"
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
