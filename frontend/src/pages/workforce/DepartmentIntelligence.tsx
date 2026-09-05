import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentService } from '../../services/department.service';
import { workforceService } from '../../services/workforce.service';
import { Department, DepartmentWorkforceAnalytics } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Building2,
  Users,
  TrendingUp,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Award,
  Layers,
  ChevronRight,
  Target,
  GraduationCap
} from 'lucide-react';

export const DepartmentIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<DepartmentWorkforceAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  const loadDepartments = async () => {
    setIsLoading(true);
    try {
      const depts = await departmentService.getDepartments();
      setDepartments(depts);
      if (depts.length > 0) {
        setSelectedDeptId(depts[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeptAnalytics = async (deptId: number) => {
    setIsAnalyticsLoading(true);
    try {
      const res = await workforceService.getDepartmentAnalytics(deptId);
      setAnalytics(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDeptId) {
      loadDeptAnalytics(selectedDeptId);
    }
  }, [selectedDeptId]);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950 to-navy-950 rounded-3xl p-7 sm:p-9 text-white shadow-apple-lg border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <button
            onClick={() => navigate('/workforce-intelligence')}
            className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white font-semibold mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Intelligence Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Department Matrix</h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                Functional team workforce analytics, talent density, retention stability, and skill heatmaps.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => selectedDeptId && loadDeptAnalytics(selectedDeptId)}
          className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/20 shadow-apple backdrop-blur-md transition-all flex items-center gap-2 self-start md:self-auto hover:scale-[1.01] active:scale-[0.99]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyticsLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Department Tabs Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {departments.map((d) => {
          const isSelected = d.id === selectedDeptId;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDeptId(d.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-apple-md'
                  : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-navy-800 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{d.name}</span>
            </button>
          );
        })}
      </div>

      {isAnalyticsLoading ? (
        <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-600 dark:text-cyan-400" />
          <span>Computing department metrics and talent distribution...</span>
        </div>
      ) : analytics ? (
        <div className="space-y-6">
          {/* Department KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Department Headcount"
              value={analytics.headcount}
              icon={Users}
              color="blue"
              subtitle={`Active staff in ${analytics.department_name}`}
            />
            <StatCard
              title="Avg Performance Score"
              value={`${analytics.average_performance}/100`}
              icon={TrendingUp}
              color="indigo"
              subtitle="Composite department evaluation"
            />
            <StatCard
              title="High Risk Retentions"
              value={analytics.attrition_risk_breakdown?.HIGH || 0}
              icon={ShieldAlert}
              color="amber"
              subtitle="Elevated attrition risk cases"
            />
            <StatCard
              title="Priority Skill Deficits"
              value={analytics.top_missing_skills.length}
              icon={Target}
              color="rose"
              subtitle="Identified role gaps"
            />
          </div>

          {/* Core Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Skill Gaps */}
            <div className="bg-white dark:bg-navy-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Priority Department Skill Deficits</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Missing capabilities across team role benchmarks</p>
                </div>
                <Target className="w-4 h-4 text-rose-500" />
              </div>

              {analytics.top_missing_skills.length === 0 ? (
                <div className="p-8 text-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  ✓ No critical skill gaps identified in this department!
                </div>
              ) : (
                <div className="space-y-2">
                  {analytics.top_missing_skills.map((skill, i) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between text-xs p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-bold flex items-center justify-center text-[10px] border border-rose-100 dark:border-rose-800">
                          #{i + 1}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-white">{skill}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-semibold text-[10px]">
                        Target Skill Gap
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Department Trainings */}
            <div className="bg-white dark:bg-navy-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Department Training Priorities</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">High-impact courses recommended for team members</p>
                </div>
                <GraduationCap className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
              </div>

              {analytics.top_department_trainings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No courses actively assigned to this department yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {analytics.top_department_trainings.map((course, i) => (
                    <div
                      key={course}
                      className="flex items-center justify-between text-xs p-3 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-cyan-300 font-bold flex items-center justify-center text-[10px] border border-brand-200 dark:border-brand-800">
                          #{i + 1}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-white">{course}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-cyan-300 font-semibold text-[10px]">
                        High Demand
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Department Staff Matrix Table */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple overflow-hidden transition-all">
            <div className="p-5 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between bg-slate-50/60 dark:bg-navy-950/60">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department Staff Talent Matrix</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Individual performance scores, retention risk level, and competency gap match
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                {analytics.employees.length} Staff Members
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-navy-950/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-navy-800">
                  <tr>
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-6 py-3.5">Designation</th>
                    <th className="px-6 py-3.5">Performance Tier</th>
                    <th className="px-6 py-3.5">Retention Risk</th>
                    <th className="px-6 py-3.5">Role Skill Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {analytics.employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{emp.designation}</td>
                      <td className="px-6 py-4">
                        <Badge status={emp.performance_category} />
                        <span className="text-slate-400 text-[11px] ml-2 font-semibold">
                          ({emp.performance_score}/100)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={emp.attrition_risk_level} />
                        <span className="text-slate-400 text-[11px] ml-2 font-semibold">
                          ({emp.attrition_risk_score}/100)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold ${
                            emp.skill_gap_percentage > 40
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {emp.skill_gap_percentage}% Gap
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Select a Department"
          description="Choose a department from the tabs above to view talent density and performance analytics."
        />
      )}
    </div>
  );
};
