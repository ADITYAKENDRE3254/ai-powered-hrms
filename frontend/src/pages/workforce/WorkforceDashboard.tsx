import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workforceService } from '../../services/workforce.service';
import { WorkforceDashboardSummary } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { RunAnalysisModal } from '../../components/workforce/RunAnalysisModal';
import {
  Brain,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  GraduationCap,
  Target,
  Building2,
  ArrowUpRight,
  Award,
} from 'lucide-react';
import { PerformanceFactorRadial } from '../../components/charts/PerformanceFactorRadial';
import { AttritionRiskRadarChart } from '../../components/charts/AttritionRiskRadarChart';
import { SkillGapHeatmap } from '../../components/charts/SkillGapHeatmap';
import { FutureSkillsRoadmapChart } from '../../components/charts/FutureSkillsRoadmapChart';
import { TrainingImpactChart } from '../../components/charts/TrainingImpactChart';

export const WorkforceDashboard: React.FC = () => {
  const [summary, setSummary] = useState<WorkforceDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await workforceService.getDashboardSummary();
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
    <div className="space-y-8 font-sans antialiased">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 border border-navy-800/80 p-8 sm:p-10 text-white shadow-apple-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-cyan-300 text-xs font-semibold border border-brand-400/30 mb-3.5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Predictive Human Capital Analytics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              AI Workforce Intelligence
            </h1>
            <p className="text-slate-300/90 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
              Empower leadership with predictive talent analytics: proactively identify performance development trajectories, confidential retention drivers, future skill roadmaps, and targeted training programs.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={() => setShowAnalysisModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-brand-600 via-blue-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 text-white rounded-2xl text-xs font-bold shadow-apple shadow-brand-600/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              <span>Run AI Analysis</span>
            </button>
            <button
              onClick={() => navigate('/training')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/15 shadow-apple backdrop-blur-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>Training Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Level 1: KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Avg Performance Score"
          value={summary ? `${summary.average_performance_score}/100` : '0/100'}
          icon={TrendingUp}
          color="indigo"
          subtitle={`${summary?.performance_distribution?.HIGH || 0} in High Tier`}
        />
        <StatCard
          title="Avg Retention Risk"
          value={summary ? `${summary.average_attrition_risk}/100` : '0/100'}
          icon={ShieldAlert}
          color="amber"
          subtitle={`${summary?.high_attrition_count || 0} Elevated Risk Cases`}
        />
        <StatCard
          title="Tracked Skills"
          value={summary?.total_skills_tracked || 0}
          icon={Award}
          color="emerald"
          subtitle="Active competencies"
        />
        <StatCard
          title="Training Completion"
          value={summary ? `${summary.training_completion_rate}%` : '0%'}
          icon={GraduationCap}
          color="blue"
          subtitle={`${summary?.completed_trainings_count || 0} verified completions`}
        />
      </div>

      {/* Level 2: AI Performance Drivers & Attrition Radar Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceFactorRadial score={summary?.average_performance_score || 82} />
        <AttritionRiskRadarChart />
      </div>

      {/* Level 3: Department Skill Deficit Heatmap */}
      <SkillGapHeatmap />

      {/* Level 4: Connected AI Talent Roadmap Flow & Training ROI Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <FutureSkillsRoadmapChart />
        </div>
        <div className="lg:col-span-12">
          <TrainingImpactChart />
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/workforce-intelligence/performance')}
          className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-apple hover:shadow-apple-md hover:border-brand-300 dark:hover:border-cyan-500/40 transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-cyan-400 flex items-center justify-center mb-3.5 border border-brand-100 dark:border-brand-900/40 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Performance Insights</h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Multi-factor predictions, factor breakdowns, and mentoring actions.
          </p>
        </div>

        <div
          onClick={() => navigate('/workforce-intelligence/attrition')}
          className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-apple hover:shadow-apple-md hover:border-amber-300 dark:hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3.5 border border-amber-100 dark:border-amber-900/40 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attrition Risk Radar</h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Confidential retention indicators, protective signals, and interventions.
          </p>
        </div>

        <div
          onClick={() => navigate('/workforce-intelligence/skills')}
          className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-apple hover:shadow-apple-md hover:border-purple-300 dark:hover:border-purple-500/40 transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3.5 border border-purple-100 dark:border-purple-900/40 group-hover:scale-105 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skill Intelligence</h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Skill inventory, target role gap analytics, and future skill forecasts.
          </p>
        </div>

        <div
          onClick={() => navigate('/workforce-intelligence/departments')}
          className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-apple hover:shadow-apple-md hover:border-cyan-300 dark:hover:border-cyan-500/40 transition-all cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3.5 border border-cyan-100 dark:border-cyan-900/40 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department Matrix</h3>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Cross-functional team comparisons, talent heatmaps, and demand trends.
          </p>
        </div>
      </div>

      <RunAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        onCompleted={loadData}
      />
    </div>
  );
};
