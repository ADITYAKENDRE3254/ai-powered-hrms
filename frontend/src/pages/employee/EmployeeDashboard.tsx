import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/report.service';
import { payrollService } from '../../services/payroll.service';
import { leaveService } from '../../services/leave.service';
import { LiveGPSAttendanceCard } from '../../components/attendance/LiveGPSAttendanceCard';
import { ApplyLeaveModal } from '../../components/leave/ApplyLeaveModal';
import { PayslipViewerModal } from '../../components/payroll/PayslipViewerModal';
import { StatCard } from '../../components/common/StatCard';
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
  AlertCircle
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Employee Self-Service Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.full_name || 'Team Member'}!
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
            {user?.designation || 'Staff Member'} &bull; {user?.department_name || 'Engineering'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
          {onOpenAIChat && (
            <button
              onClick={onOpenAIChat}
              className="px-4 py-2.5 bg-indigo-700/80 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold border border-indigo-500/40 transition-all flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Assistant</span>
            </button>
          )}
        </div>
      </div>

      {/* Live GPS Attendance Card */}
      <LiveGPSAttendanceCard onAttendanceUpdated={loadData} />

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Casual Leave (CL)</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{leaveBalance?.casual_leave || 12} Days</p>
            <span className="text-[11px] text-emerald-600 font-semibold">Auto-Approved for 1-day</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
            CL
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Sick Leave (SL)</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{leaveBalance?.sick_leave || 10} Days</p>
            <span className="text-[11px] text-blue-600 font-semibold">2-Day Team Leader approval</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
            SL
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Earned Leave (EL)</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{leaveBalance?.earned_leave || 15} Days</p>
            <span className="text-[11px] text-purple-600 font-semibold">3+ Day Manager approval</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold">
            EL
          </div>
        </div>
      </div>

      {/* Latest Payslip Quick Banner */}
      {latestPayroll && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">Latest Processed Salary Statement</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Disbursed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Net Salary: <b className="text-emerald-700">${latestPayroll.net_salary.toLocaleString()}</b> &bull; Present Days: {latestPayroll.present_days} &bull; LWP: {latestPayroll.lwp_days} days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPayslipModal(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              View Breakdown
            </button>
            <a
              href={payrollService.getPayslipDownloadUrl(latestPayroll.id)}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Payslip</span>
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
