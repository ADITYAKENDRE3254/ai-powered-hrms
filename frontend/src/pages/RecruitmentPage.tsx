import React, { useState, useEffect } from 'react';
import { recruitmentService } from '../services/recruitment.service';
import { departmentService } from '../services/department.service';
import { Job, Candidate, Department, CandidateStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ResumeUploadModal } from '../components/recruitment/ResumeUploadModal';
import { AIMatchModal } from '../components/recruitment/AIMatchModal';
import { JobModal } from '../components/recruitment/JobModal';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Users,
  Plus,
  UploadCloud,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

import { RecruitmentFunnelChart } from '../components/charts/RecruitmentFunnelChart';

export const RecruitmentPage: React.FC = () => {
  const { hasRole } = useAuth();
  const isRecruiterOrAdmin = hasRole('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER');

  const [activeTab, setActiveTab] = useState<'candidates' | 'jobs'>('candidates');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [search, setSearch] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState<number | undefined>();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | undefined>();

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedCandidateForMatch, setSelectedCandidateForMatch] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [jList, cList, dList] = await Promise.all([
        recruitmentService.getJobs(),
        recruitmentService.getCandidates({
          job_id: selectedJobFilter,
          status: selectedStatusFilter,
        }),
        departmentService.getDepartments(),
      ]);
      setJobs(jList);
      setCandidates(cList);
      setDepartments(dList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedJobFilter, selectedStatusFilter]);

  const handleStatusChange = async (candidateId: number, newStatus: CandidateStatus) => {
    try {
      await recruitmentService.updateCandidateStatus(candidateId, newStatus);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (window.confirm('Are you sure you want to close/delete this job?')) {
      try {
        await recruitmentService.deleteJob(id);
        loadData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      (c.job_title && c.job_title.toLowerCase().includes(q)) ||
      (c.suggested_department && c.suggested_department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Recruitment & AI Matching
            </h1>
            <span className="ai-badge">✦ NLP Parsing</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated resume NLP parser, candidate skill scoring, and hiring pipeline.
          </p>
        </div>

        {isRecruiterOrAdmin && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-2xl text-xs font-black shadow-apple transition-all flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Scan Resume (PDF/DOCX)</span>
            </button>
            <button
              onClick={() => {
                setEditingJob(null);
                setShowJobModal(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 text-white rounded-2xl text-xs font-bold shadow-apple-md transition-all flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>New Job Opening</span>
            </button>
          </div>
        )}
      </div>

      {/* Recruitment Analytics Funnel */}
      <RecruitmentFunnelChart />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-1">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'candidates'
              ? 'border-brand-600 text-brand-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>AI Screened Candidates ({candidates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'jobs'
              ? 'border-brand-600 text-brand-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Active Openings ({jobs.length})</span>
        </button>
      </div>

      {/* Candidates Tab View */}
      {activeTab === 'candidates' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-navy-900 p-4 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates by name, position, or department..."
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedJobFilter || ''}
                onChange={(e) => setSelectedJobFilter(e.target.value ? Number(e.target.value) : undefined)}
                className="text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Job Openings</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatusFilter || ''}
                onChange={(e) => setSelectedStatusFilter(e.target.value || undefined)}
                className="text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Pipeline Stages</option>
                <option value="APPLIED">Applied</option>
                <option value="AI_SCREENED">AI Screened</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Candidates Grid */}
          {filteredCandidates.length === 0 ? (
            <EmptyState
              title="No Candidates Found"
              description="No candidates matched your search criteria. Upload a resume to automatically parse."
              actionLabel="Scan Resume"
              onAction={() => setShowUploadModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCandidates.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-col justify-between hover:border-brand-500/40 dark:hover:border-cyan-500/40 transition-all hover:shadow-apple-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {c.first_name} {c.last_name}
                        </h3>
                        <p className="text-xs text-brand-600 dark:text-cyan-400 font-semibold mt-0.5">
                          {c.job_title || 'General Applicant'}
                        </p>
                      </div>

                      {c.match_score > 0 ? (
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                            {c.match_score}% Match
                          </span>
                        </div>
                      ) : (
                        <Badge status={c.status} />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                      {c.ai_summary || 'Extracted resume profile and qualifications.'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Dept: <b className="text-slate-800 dark:text-slate-200">{c.suggested_department || 'Engineering'}</b></span>
                      <span>Exp: <b className="text-slate-800 dark:text-slate-200">{c.experience_years} Yrs</b></span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between gap-2">
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value as CandidateStatus)}
                      className="text-[11px] font-bold px-2.5 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none"
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="AI_SCREENED">AI Screened</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="SELECTED">Selected</option>
                      <option value="REJECTED">Rejected</option>
                    </select>

                    <button
                      onClick={() => setSelectedCandidateForMatch(c)}
                      className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 text-brand-700 dark:text-cyan-400 text-xs font-bold border border-brand-200 dark:border-brand-800/60 flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Breakdown</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Jobs Tab View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((j) => (
            <div
              key={j.id}
              className="bg-white dark:bg-navy-900 p-6 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{j.title}</h3>
                    <p className="text-xs text-brand-600 dark:text-cyan-400 font-semibold mt-0.5">
                      {j.department_name || 'Engineering'}
                    </p>
                  </div>
                  <Badge status={j.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="px-2.5 py-1 bg-slate-50 dark:bg-navy-950 rounded-lg border border-slate-200/60 dark:border-navy-800">
                    📍 {j.location}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-50 dark:bg-navy-950 rounded-lg border border-slate-200/60 dark:border-navy-800">
                    💼 {j.employment_type}
                  </span>
                  {j.salary_range && (
                    <span className="px-2.5 py-1 bg-slate-50 dark:bg-navy-950 rounded-lg border border-slate-200/60 dark:border-navy-800">
                      💵 {j.salary_range}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3.5 line-clamp-3 leading-relaxed">
                  {j.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {j.applicant_count} Applicants
                </span>
                {isRecruiterOrAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingJob(j);
                        setShowJobModal(true);
                      }}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-cyan-400 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(j.id)}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showUploadModal && (
        <ResumeUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          jobs={jobs}
          onUploadSuccess={loadData}
        />
      )}

      {showJobModal && (
        <JobModal
          isOpen={showJobModal}
          onClose={() => setShowJobModal(false)}
          job={editingJob}
          departments={departments}
          onSaved={loadData}
        />
      )}

      {selectedCandidateForMatch && (
        <AIMatchModal
          isOpen={!!selectedCandidateForMatch}
          onClose={() => setSelectedCandidateForMatch(null)}
          candidate={selectedCandidateForMatch}
          jobs={jobs}
        />
      )}
    </div>
  );
};
