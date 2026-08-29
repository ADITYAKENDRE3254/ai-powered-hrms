import React, { useState, useEffect } from 'react';
import { recruitmentService } from '../services/recruitment.service';
import { departmentService } from '../services/department.service';
import { Job, Candidate, Department, CandidateStatus } from '../types';
import { Badge } from '../components/common/Badge';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recruitment & AI Match</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated resume NLP parser, candidate skill scoring, and hiring pipeline.
          </p>
        </div>

        {isRecruiterOrAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Scan Resume (PDF/DOCX)</span>
            </button>
            <button
              onClick={() => {
                setEditingJob(null);
                setShowJobModal(true);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Job Opening</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'candidates'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>AI Screened Candidates ({candidates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'jobs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Postings ({jobs.length})</span>
        </button>
      </div>

      {/* Candidates Tab View */}
      {activeTab === 'candidates' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates by name or skills..."
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedJobFilter || ''}
                onChange={(e) => setSelectedJobFilter(e.target.value ? Number(e.target.value) : undefined)}
                className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Jobs</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatusFilter || ''}
                onChange={(e) => setSelectedStatusFilter(e.target.value || undefined)}
                className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{c.first_name} {c.last_name}</h3>
                      <p className="text-xs text-indigo-600 font-semibold">{c.job_title || 'Position Applicant'}</p>
                    </div>

                    {c.match_score > 0 ? (
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black">
                          {c.match_score}% Match
                        </span>
                      </div>
                    ) : (
                      <Badge status={c.status} />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                    {c.ai_summary || 'Extracted resume data and qualifications.'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                    <span>Dept: <b className="text-slate-800">{c.suggested_department || 'Engineering'}</b></span>
                    <span>Exp: <b className="text-slate-800">{c.experience_years} Yrs</b></span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c.id, e.target.value as CandidateStatus)}
                    className="text-[11px] font-bold px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
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
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Breakdown</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Jobs Tab View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((j) => (
            <div key={j.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{j.title}</h3>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">{j.department_name || 'Engineering'}</p>
                  </div>
                  <Badge status={j.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>📍 {j.location}</span>
                  <span>💼 {j.employment_type}</span>
                  {j.salary_range && <span>💵 {j.salary_range}</span>}
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">{j.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">{j.applicant_count} Applicants</span>
                {isRecruiterOrAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingJob(j);
                        setShowJobModal(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(j.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
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
