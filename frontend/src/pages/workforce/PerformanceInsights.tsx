import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../../services/employee.service';
import { departmentService } from '../../services/department.service';
import { workforceService } from '../../services/workforce.service';
import { Employee, Department, PerformancePrediction } from '../../types';
import { PerformanceCard } from '../../components/workforce/PerformanceCard';
import { RunAnalysisModal } from '../../components/workforce/RunAnalysisModal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  TrendingUp,
  Search,
  Building2,
  Filter,
  Brain,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Award
} from 'lucide-react';

export const PerformanceInsights: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [predictions, setPredictions] = useState<{ [empId: number]: PerformancePrediction }>({});
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        employeeService.getEmployees({
          search: search || undefined,
          department_id: selectedDept,
          limit: 100
        }),
        departmentService.getDepartments()
      ]);
      setEmployees(empRes.items);
      setDepartments(deptRes);

      // Fetch predictions for all returned employees in parallel
      const predMap: { [empId: number]: PerformancePrediction } = {};
      await Promise.all(
        empRes.items.map(async (emp) => {
          try {
            const pred = await workforceService.getEmployeePerformance(emp.id);
            predMap[emp.id] = pred;
          } catch (e) {
            console.error(`Failed to load prediction for employee ${emp.id}`, e);
          }
        })
      );
      setPredictions(predMap);
    } catch (e) {
      console.error('Error loading performance insights:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedDept]);

  const filteredEmployees = employees.filter((emp) => {
    if (selectedCategory === 'ALL') return true;
    const pred = predictions[emp.id];
    if (!pred) return false;
    return pred.prediction_category === selectedCategory;
  });

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-brand-950 to-navy-950 rounded-3xl p-7 sm:p-9 text-white shadow-apple-lg border border-brand-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <button
            onClick={() => navigate('/workforce-intelligence')}
            className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white font-semibold mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Intelligence Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Performance Predictions</h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                Explainable multi-factor employee performance forecasts and growth recommendations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={() => setShowAnalysisModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 text-white rounded-2xl text-xs font-bold shadow-apple-md transition-all flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Brain className="w-4 h-4" />
            <span>Recalculate AI Models</span>
          </button>
          <button
            onClick={loadData}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/20 shadow-apple backdrop-blur-md transition-all flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-navy-900 p-4 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              value={selectedDept || ''}
              onChange={(e) => setSelectedDept(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Performance Tiers</option>
              <option value="HIGH">High Tier</option>
              <option value="MEDIUM">Medium / Stable</option>
              <option value="NEEDS_ATTENTION">Needs Support & Coaching</option>
              <option value="INSUFFICIENT_DATA">Insufficient Data</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing {filteredEmployees.length} of {employees.length} Staff
        </div>
      </div>

      {/* Predictions Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-600 dark:text-cyan-400" />
          <span>Computing and evaluating multi-factor performance models...</span>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          title="No Employee Matches"
          description="No staff profiles match the selected tier or search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => {
            const pred = predictions[emp.id];
            if (!pred) return null;
            return <PerformanceCard key={emp.id} prediction={pred} />;
          })}
        </div>
      )}

      <RunAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        onCompleted={loadData}
      />
    </div>
  );
};
