import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/report.service';
import { payrollService } from '../../services/payroll.service';
import { leaveService } from '../../services/leave.service';
import { LiveGPSAttendanceCard } from '../../components/attendance/LiveGPSAttendanceCard';
import { ApplyLeaveModal } from '../../components/leave/ApplyLeaveModal';
import { PayslipViewerModal } from '../../components/payroll/PayslipViewerModal';
import { StatCardSkeleton } from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Sparkles,
  Bot,
  CheckCircle2,
  CalendarDays,
  Download,
  AlertCircle,
  Brain,
  GraduationCap
} from 'lucide-react';
import { LeaveBalance, PayrollItem } from '../../types';

export const EmployeeDashboard: React.FC<{ onOpenAIChat?: () => void }> = ({ onOpenAIChat }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [latestPayroll, setLatestPayroll] = useState<PayrollItem | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sum, bal, pays] = await Promise.all([
        reportService.getDashboardSummary(),
        leaveService.getMyLeaveBalance(),
        payrollService.getMyPayrollRecords(),
      ]);
      setSummary(sum);
      setLeaveBalance(bal);
      if (pays && pays.length > 0) {
        setLatestPayroll(pays[0]);
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

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 border border-navy-800/80 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-500/30 text-cyan-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Employee Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name || 'Team Member'}!
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              {user?.designation || 'Specialist'} &bull; {user?.department_name || 'Technology Services'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => navigate('/my-ai-insights')}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-600 via-cyan-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/25 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <Brain className="w-4 h-4" />
              <span>✦ My AI Growth Insights</span>
            </button>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/15 backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live GPS Attendance Card */}
      <LiveGPSAttendanceCard onAttendanceUpdated={loadData} />

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Casual Leave (CL)</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{leaveBalance?.casual_leave || 12} Days</p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-block">1-day Instant Auto-Approval</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center font-bold text-sm shadow-xs">
            CL
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sick Leave (SL)</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{leaveBalance?.sick_leave || 10} Days</p>
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1 inline-block">2-Day Team Leader Route</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/60 flex items-center justify-center font-bold text-sm shadow-xs">
            SL
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Earned Leave (EL)</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{leaveBalance?.earned_leave || 15} Days</p>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1 inline-block">3+ Day Manager Route</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center font-bold text-sm shadow-xs">
            EL
          </div>
        </div>
      </div>

      {/* Latest Payslip Quick Banner */}
      {latestPayroll && (
        <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800/60 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Latest Salary Statement</h4>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-bold">
                  Disbursed
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Net Salary: <b className="text-emerald-600 dark:text-emerald-400 font-bold">${latestPayroll.net_salary.toLocaleString()}</b> &bull; Present Days: {latestPayroll.present_days} &bull; LWP: {latestPayroll.lwp_days} days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowPayslipModal(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-navy-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800 text-xs font-semibold transition-colors"
            >
              View Breakdown
            </button>
            <a
              href={payrollService.getPayslipDownloadUrl(latestPayroll.id)}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm shadow-brand-600/20 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>
      )}

      {/* Modals */}
      {showLeaveModal && (
        <ApplyLeaveModal
          isOpen={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          onLeaveCreated={loadData}
        />
      )}

      {showPayslipModal && latestPayroll && (
        <PayslipViewerModal
          isOpen={showPayslipModal}
          onClose={() => setShowPayslipModal(false)}
          item={latestPayroll}
        />
      )}
    </div>
  );
};

