import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/report.service';
import { StatCard } from '../../components/common/StatCard';
import { StatCardSkeleton, CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Users,
  Building2,
  Clock,
  CalendarDays,
  DollarSign,
  Briefcase,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  Brain,
  GraduationCap,
  TrendingUp,
  Activity
} from 'lucide-react';
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 border border-navy-800/80 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Super Administrator Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Command Center
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Global visibility across real-time GPS check-ins, multi-department workforce intelligence, AI resume screening, and automated payroll cycles.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => navigate('/workforce-intelligence')}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-600 via-cyan-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/25 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <Brain className="w-4 h-4" />
              <span>✦ AI Workforce Intelligence</span>
            </button>
            <button
              onClick={() => setShowPayrollModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/15 backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Run Payroll</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Headcount"
            value={summary?.total_employees || '0'}
            icon={Users}
            color="blue"
            subtitle="Active personnel"
            aiBenchmark="100% Onboarded"
            onClick={() => navigate('/employees')}
          />
          <StatCard
            title="Today Verified On-Site"
            value={summary?.today_present || '0'}
            icon={Clock}
            color="cyan"
            subtitle="GPS Geofenced"
            change="+4% vs yesterday"
            changeType="positive"
            onClick={() => navigate('/attendance')}
          />
          <StatCard
            title="Pending Approvals"
            value={summary?.pending_leaves || '0'}
            icon={CalendarDays}
            color="amber"
            subtitle="Awaiting decision"
            onClick={() => navigate('/leaves')}
          />
          <StatCard
            title="Active Job Vacancies"
            value={summary?.open_jobs || '0'}
            icon={Briefcase}
            color="purple"
            subtitle="ATS Pipeline active"
            aiBenchmark="AI Matching On"
            onClick={() => navigate('/recruitment')}
          />
        </div>
      )}

      {/* AI Workforce Intelligence Quick Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/80 dark:border-navy-800 p-5 shadow-apple flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-600/30 shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Workforce Intelligence Suite Active</h3>
              <span className="ai-badge text-[10px]">Live Predictions</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-factor performance forecasts, retention risk radars, and future skill gap recommendations are ready.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/workforce-intelligence/performance')}
            className="px-3 py-1.5 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Performance
          </button>
          <button
            onClick={() => navigate('/workforce-intelligence/attrition')}
            className="px-3 py-1.5 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Retention
          </button>
          <button
            onClick={() => navigate('/workforce-intelligence/skills')}
            className="px-3 py-1.5 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Skills Matrix
          </button>
        </div>
      </div>

      {/* Department Breakdown & Recruitment Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Department Headcount Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live staff allocation across business units</p>
            </div>
            <button
              onClick={() => navigate('/departments')}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Structure</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {summary?.department_distribution?.map((dept: any) => (
              <div key={dept.name}>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">{dept.name}</span>
                  <span className="text-slate-900 dark:text-white font-bold">{dept.count} Members</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-navy-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-600 via-cyan-500 to-purple-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(10, (dept.count / (summary.total_employees || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recruitment Pipeline */}
        <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                AI Recruitment & ATS Funnel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Applicant status from upload to selection</p>
            </div>
            <button
              onClick={() => navigate('/recruitment')}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Recruiter Board</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200/70 dark:border-navy-700 text-center">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Applied</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{summary?.recruitment_pipeline?.applied || 0}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-center">
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">✦ AI Screened</span>
              <p className="text-xl font-bold text-purple-900 dark:text-purple-200 mt-1">{summary?.recruitment_pipeline?.ai_screened || 0}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Shortlisted</span>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-1">{summary?.recruitment_pipeline?.shortlisted || 0}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-center">
              <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider">Interview</span>
              <p className="text-xl font-bold text-cyan-900 dark:text-cyan-200 mt-1">{summary?.recruitment_pipeline?.interview || 0}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Selected</span>
              <p className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">{summary?.recruitment_pipeline?.selected || 0}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-center">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Rejected</span>
              <p className="text-xl font-bold text-rose-900 dark:text-rose-200 mt-1">{summary?.recruitment_pipeline?.rejected || 0}</p>
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

