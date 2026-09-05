import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainingService } from '../../services/training.service';
import { TrainingAssignment, AssignmentStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  Award,
  PlayCircle,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Calendar,
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const MyTraining: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update Progress Modal
  const [selectedAssignment, setSelectedAssignment] = useState<TrainingAssignment | null>(null);
  const [newProgress, setNewProgress] = useState<number>(0);
  const [newStatus, setNewStatus] = useState<AssignmentStatus>('IN_PROGRESS');
  const [certUrl, setCertUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await trainingService.getMyAssignments();
      setAssignments(data);
    } catch (e) {
      console.error('Failed to load employee training assignments', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleOpenUpdate = (a: TrainingAssignment) => {
    setSelectedAssignment(a);
    setNewProgress(a.progress_percentage);
    setNewStatus(a.status);
    setCertUrl(a.certificate_url || '');
    setUpdateError(null);
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setIsUpdating(true);
    setUpdateError(null);
    try {
      const statusToSet = newProgress === 100 ? 'COMPLETED' : newStatus;
      await trainingService.updateProgress(selectedAssignment.id, {
        progress_percentage: Number(newProgress),
        status: statusToSet,
        certificate_url: certUrl || undefined
      });
      setSelectedAssignment(null);
      loadAssignments();
    } catch (err: any) {
      setUpdateError(err.response?.data?.detail || 'Failed to update progress');
    } finally {
      setIsUpdating(false);
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

  const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length;
  const inProgressCount = assignments.filter((a) => a.status === 'IN_PROGRESS' || a.status === 'NOT_STARTED').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Style 2 Gradient & Apple Aesthetics */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-brand-950 to-purple-950 border border-navy-800/80 p-6 sm:p-8 text-white shadow-apple-lg">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-cyan-300 text-xs font-semibold border border-brand-400/30 mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Employee Professional Development Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">My Training & Certifications</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Track assigned upskilling modules, record learning milestones, upload completion certificates, and automatically unlock verified skill endorsements.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/my-ai-insights')}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-apple shadow-brand-600/30 transition-all flex items-center gap-1.5"
            >
              <span>My AI Growth Insights</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={loadAssignments}
              title="Refresh training list"
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/10 transition-all flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple-sm flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Enrolled Courses</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{assignments.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-cyan-400 flex items-center justify-center border border-brand-100 dark:border-brand-900/40">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple-sm flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">In Progress</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{inProgressCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-100 dark:border-cyan-900/40">
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 p-5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple-sm flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed & Certified</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{completedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Assignments List */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center gap-2 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
          <span>Loading your assigned learning modules...</span>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-navy-800 text-slate-400 dark:text-slate-500 text-xs shadow-apple-sm">
          No training programs currently assigned to you. Review your career recommendations under My AI Insights.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a) => (
            <div
              key={a.id}
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
                        Target: {a.skill_name || 'Upskilling'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors">
                        {a.training_title}
                      </h3>
                    </div>
                  </div>
                  {getStatusBadge(a.status)}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  Focused competency upskilling curriculum and assessment for {a.skill_name || 'target skills'}.
                </p>

                {/* Progress Bar */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800/60 mb-4">
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Completion Status</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{a.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-navy-900 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        a.progress_percentage === 100
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-brand-600 to-indigo-600'
                      }`}
                      style={{ width: `${a.progress_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{a.duration_hours || 10}h Duration</span>
                  </span>
                  {a.deadline && (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Due: {a.deadline.split('T')[0]}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3.5 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                {a.certificate_url ? (
                  <a
                    href={a.certificate_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    <Award className="w-4 h-4" />
                    <span>Verified Certificate</span>
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">In Progress</span>
                )}

                <button
                  onClick={() => handleOpenUpdate(a)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-apple shadow-brand-600/30 transition-all flex items-center gap-1"
                >
                  <span>Update Progress</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Update Progress & Certificate */}
      {selectedAssignment && (
        <Modal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title={`Update Progress: ${selectedAssignment.training_title}`}
        >
          <form onSubmit={handleSaveProgress} className="space-y-4">
            {updateError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{updateError}</span>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Progress Percentage ({newProgress}%)
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={newProgress}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setNewProgress(val);
                  if (val === 100) setNewStatus('COMPLETED');
                  else if (val > 0) setNewStatus('IN_PROGRESS');
                }}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as AssignmentStatus)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Completion Certificate / Project URL (Optional)
              </label>
              <input
                type="url"
                value={certUrl}
                onChange={(e) => setCertUrl(e.target.value)}
                placeholder="https://coursera.org/verify/... or https://github.com/..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-500" />
                <span>Completing this module will automatically endorse this skill in your employee portfolio.</span>
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold shadow-apple shadow-brand-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isUpdating ? 'Saving...' : 'Save Progress'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
