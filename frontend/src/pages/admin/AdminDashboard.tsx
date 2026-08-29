import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/report.service';
import { StatCard } from '../../components/common/StatCard';
import { Users, Building2, Clock, CalendarDays, DollarSign, Briefcase, Sparkles, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { GeneratePayrollModal } from '../../components/payroll/GeneratePayrollModal';

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await reportService.getDashboardSummary();
      setSummary(data);
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
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Super Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">System Overview & Analytics</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Complete administrative governance: Monitor real-time GPS attendance, department structures, recruitment AI matching, and automatic payroll.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowPayrollModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" />
            <span>Process Payroll</span>
          </button>
          <button
            onClick={() => navigate('/employees')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Manage Employees</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Employees"
          value={summary?.total_employees || '0'}
          icon={Users}
          color="indigo"
          subtitle="Organization headcount"
        />
        <StatCard
          title="Today Present"
          value={summary?.today_present || '0'}
          icon={Clock}
          color="emerald"
          subtitle="GPS verified on-site"
        />
        <StatCard
          title="Pending Leaves"
          value={summary?.pending_leaves || '0'}
          icon={CalendarDays}
          color="amber"
          subtitle="Awaiting approvals"
        />
        <StatCard
          title="Active Job Openings"
          value={summary?.open_jobs || '0'}
          icon={Briefcase}
          color="blue"
          subtitle="Recruitment active"
        />
      </div>

      {/* Department Breakdown & Recruitment Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Headcount Distribution</h3>
              <p className="text-xs text-slate-500">Live staff allocation across business units</p>
            </div>
            <button
              onClick={() => navigate('/departments')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {summary?.department_distribution?.map((dept: any) => (
              <div key={dept.name}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">{dept.name}</span>
                  <span className="text-slate-900">{dept.count} Members</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(8, (dept.count / (summary.total_employees || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recruitment Pipeline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Recruitment Funnel</h3>
              <p className="text-xs text-slate-500">Applicant status from upload to selection</p>
            </div>
            <button
              onClick={() => navigate('/recruitment')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
            >
              <span>Recruiter Board</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Applied</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{summary?.recruitment_pipeline?.applied || 0}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
              <span className="text-[11px] font-bold text-indigo-700 uppercase">AI Screened</span>
              <p className="text-xl font-bold text-indigo-900 mt-1">{summary?.recruitment_pipeline?.ai_screened || 0}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[11px] font-bold text-amber-700 uppercase">Shortlisted</span>
              <p className="text-xl font-bold text-amber-900 mt-1">{summary?.recruitment_pipeline?.shortlisted || 0}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[11px] font-bold text-blue-700 uppercase">Interview</span>
              <p className="text-xl font-bold text-blue-900 mt-1">{summary?.recruitment_pipeline?.interview || 0}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">Selected</span>
              <p className="text-xl font-bold text-emerald-900 mt-1">{summary?.recruitment_pipeline?.selected || 0}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[11px] font-bold text-rose-700 uppercase">Rejected</span>
              <p className="text-xl font-bold text-rose-900 mt-1">{summary?.recruitment_pipeline?.rejected || 0}</p>
            </div>
          </div>
        </div>
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
