import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainingService } from '../../services/training.service';
import { TrainingProgram, TrainingAssignment, TrainingDifficulty, AssignmentStatus } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { CreateTrainingModal } from '../../components/training/CreateTrainingModal';
import { AssignTrainingModal } from '../../components/training/AssignTrainingModal';
import {
  GraduationCap,
  Plus,
  UserCheck,
  Search,
  Clock,
  Building,
  CheckCircle2,
  BookOpen,
  RefreshCw,
  Award,
  Calendar,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';

export const TrainingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState<TrainingProgram[]>([]);
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'ASSIGNMENTS'>('CATALOG');
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTrainingForAssign, setSelectedTrainingForAssign] = useState<TrainingProgram | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [programs, assigns] = await Promise.all([
        trainingService.getTrainingPrograms({
          search: search || undefined,
          difficulty: selectedDifficulty ? (selectedDifficulty as TrainingDifficulty) : undefined
        }),
        trainingService.getAssignments({
          status_filter: selectedStatus ? (selectedStatus as AssignmentStatus) : undefined
        })
      ]);
      setTrainings(programs);
      setAssignments(assigns);
    } catch (e) {
      console.error('Failed to load training data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedDifficulty, selectedStatus]);

  const handleOpenAssign = (training?: TrainingProgram) => {
    setSelectedTrainingForAssign(training || null);
    setShowAssignModal(true);
  };

  const getDifficultyBadge = (diff: TrainingDifficulty) => {
    switch (diff) {
      case 'BEGINNER':
        return <Badge variant="success">Beginner</Badge>;
      case 'INTERMEDIATE':
        return <Badge variant="info">Intermediate</Badge>;
      case 'ADVANCED':
        return <Badge variant="danger">Advanced</Badge>;
    }
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="info">In Progress</Badge>;
      case 'NOT_STARTED':
        return <Badge variant="neutral">Not Started</Badge>;
      case 'OVERDUE':
        return <Badge variant="danger">Overdue</Badge>;
    }
  };

  const totalAssigned = assignments.length;
  const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length;
  const completionRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner with Style 2 Gradient & Apple Aesthetics */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-brand-950 to-purple-950 border border-navy-800/80 p-6 sm:p-8 text-white shadow-apple-lg">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-cyan-300 text-xs font-semibold border border-brand-400/30 mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Enterprise Learning & Upskilling Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Training Management</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Curate enterprise courses, assign targeted upskilling modules to employees, and track workforce competency certifications with AI alignment.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-apple shadow-brand-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </button>
            <button
              onClick={() => handleOpenAssign()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-apple shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Assign to Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Programs"
          value={trainings.length}
          icon={GraduationCap}
          color="indigo"
          subtitle="Catalog courses"
        />
        <StatCard
          title="Enrolled Staff"
          value={totalAssigned}
          icon={BookOpen}
          color="blue"
          subtitle="Active assignments"
        />
        <StatCard
          title="Completed Modules"
          value={completedCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Verified completions"
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={Award}
          color="purple"
          subtitle="Upskilling velocity"
        />
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple-sm flex flex-wrap gap-4 items-center justify-between transition-colors">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-navy-950 rounded-xl">
          <button
            onClick={() => setActiveTab('CATALOG')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'CATALOG'
                ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Course Catalog ({trainings.length})
          </button>
          <button
            onClick={() => setActiveTab('ASSIGNMENTS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ASSIGNMENTS'
                ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Staff Assignments ({assignments.length})
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-md justify-end">
          <div className="relative min-w-[180px] flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses or skills..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors"
            />
          </div>

          {activeTab === 'CATALOG' ? (
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors"
            >
              <option value="">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          ) : (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          )}

          <button
            onClick={loadData}
            title="Refresh list"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-cyan-400 rounded-xl hover:bg-slate-50 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center gap-2 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
          <span>Loading training programs and progress logs...</span>
        </div>
      ) : activeTab === 'CATALOG' ? (
        /* Course Catalog Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trainings.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-navy-900 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-navy-800 text-slate-400 dark:text-slate-500 text-xs shadow-apple-sm">
              No training courses found matching your criteria.
            </div>
          ) : (
            trainings.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-apple-sm hover:shadow-apple-md hover:border-brand-300 dark:hover:border-brand-800/80 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-cyan-400 flex items-center justify-center font-bold border border-brand-100 dark:border-brand-900/40">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-brand-600 dark:text-cyan-400 uppercase tracking-wider block">
                          Skill: {t.skill_name}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors">
                          {t.title}
                        </h3>
                      </div>
                    </div>
                    {getDifficultyBadge(t.difficulty)}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {t.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800/60">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.duration_hours} Hours</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{t.provider}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{t.enrolled_count || 0} Enrolled Staff</span>
                  <button
                    onClick={() => handleOpenAssign(t)}
                    className="px-3 py-1.5 bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-brand-600 dark:text-cyan-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-brand-200/60 dark:border-brand-800/50"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assign Staff</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Staff Assignments Table */
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-navy-800 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Training Program</th>
                  <th className="px-6 py-3.5">Progress</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Assigned / Due</th>
                  <th className="px-6 py-3.5">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      No training assignments found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{a.employee_name || `Employee #${a.employee_id}`}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{a.training_title}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Target Skill: {a.skill_name || 'Competency'}</div>
                      </td>
                      <td className="px-6 py-4 w-48">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{a.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-navy-950 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              a.progress_percentage === 100
                                ? 'bg-emerald-500'
                                : 'bg-gradient-to-r from-brand-600 to-indigo-600'
                            }`}
                            style={{ width: `${a.progress_percentage}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(a.status)}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        <div>Assigned: {a.created_at?.split('T')[0]}</div>
                        {a.deadline && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">Due: {a.deadline.split('T')[0]}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {a.certificate_url ? (
                          <a
                            href={a.certificate_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>View Certificate</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTrainingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={loadData}
      />

      <AssignTrainingModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedTrainingForAssign(null);
        }}
        onAssigned={loadData}
        selectedTraining={selectedTrainingForAssign}
        trainings={trainings}
      />
    </div>
  );
};
