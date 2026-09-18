import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { recruitmentService } from '../../services/recruitment.service';
import { Job, Candidate } from '../../types';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { ResumeUploadModal } from '../../components/recruitment/ResumeUploadModal';
import { CandidateProfileModal } from '../../components/recruitment/CandidateProfileModal';
import { Briefcase, MapPin, DollarSign, UploadCloud, CheckCircle2, Search, Sparkles, FileText, Download, Eye, LogIn, ArrowRight } from 'lucide-react';

export const CandidatePortal: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [selectedAppForProfile, setSelectedAppForProfile] = useState<Candidate | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [justAppliedSuccess, setJustAppliedSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const jList = await recruitmentService.getJobs('OPEN');
      setJobs(jList);

      if (isAuthenticated) {
        try {
          const cList = await recruitmentService.getCandidates();
          setMyApplications(cList);
        } catch {
          // ignore for non-HR or restricted
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const handleUploadSuccess = (result?: any) => {
    if (result && result.candidate_id) {
      const newCand: Candidate = {
        id: result.candidate_id,
        job_id: selectedJobForApply ? selectedJobForApply.id : 0,
        first_name: result.candidate_name?.split(' ')[0] || 'Applicant',
        last_name: result.candidate_name?.split(' ').slice(1).join(' ') || '',
        email: result.email || '',
        phone: result.phone || '',
        resume_url: result.resume_url || '',
        original_resume_filename: result.original_resume_filename || 'Resume',
        extracted_skills: Array.isArray(result.skills) ? result.skills.join(', ') : result.skills || '',
        experience_years: result.experience_years || 0,
        education: result.education || '',
        match_score: result.match_score || 0,
        matching_skills: Array.isArray(result.matching_skills) ? result.matching_skills.join(', ') : result.matching_skills || '',
        missing_skills: Array.isArray(result.missing_skills) ? result.missing_skills.join(', ') : result.missing_skills || '',
        suggested_department: result.suggested_department || 'General',
        ai_summary: result.ai_summary || '',
        status: (result.status || 'AI_SCREENED') as any,
        created_at: result.uploaded_at || new Date().toISOString(),
        job_title: selectedJobForApply ? selectedJobForApply.title : 'General Application'
      };
      setMyApplications(prev => [newCand, ...prev]);
      setJustAppliedSuccess(`Application submitted successfully for ${newCand.first_name}! AI match score: ${newCand.match_score}%`);
    }
    loadData();
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={!isAuthenticated ? "min-h-screen bg-[#FAFAFC] dark:bg-navy-950 font-sans text-slate-900 dark:text-slate-100" : "space-y-6"}>
      {/* Public Top Navbar if not logged in */}
      {!isAuthenticated && (
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-navy-800 px-6 py-4 mb-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-apple-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">AI-HRMS Careers</h1>
                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase">Public Talent Portal</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedJobForApply(null);
                  setShowApplyModal(true);
                }}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-apple-sm transition-all flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Resume</span>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-navy-700 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Employee Login</span>
              </button>
            </div>
          </div>
        </header>
      )}

      <div className={!isAuthenticated ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6" : "space-y-6"}>
        {/* Just Applied Alert */}
        {justAppliedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-apple-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{justAppliedSuccess}</span>
            </div>
            <button onClick={() => setJustAppliedSuccess(null)} className="text-emerald-600 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 border border-navy-800/80 p-6 sm:p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-500/30 text-cyan-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autonomous AI Talent Pipeline • No Login Required</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Explore Opportunities at AI-HRMS
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                Upload your PDF or Word resume directly. Our automated AI parser matches your competencies with current vacancies in real time.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedJobForApply(null);
                  setShowApplyModal(true);
                }}
                className="px-5 py-3.5 bg-gradient-to-r from-brand-600 via-cyan-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white text-xs font-extrabold rounded-2xl shadow-apple shadow-brand-600/30 transition-all hover:scale-105 flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Resume & AI Match</span>
              </button>
            </div>
          </div>
        </div>

      {/* My Submitted Applications */}
      {myApplications.length > 0 && (
        <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                My Submitted Applications
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track the live progress of your job applications
              </p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {myApplications.length} active application{myApplications.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myApplications.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-navy-800 bg-slate-50/60 dark:bg-navy-950/50 flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {app.job_title || 'Position Application'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Applied: {new Date(app.created_at).toLocaleDateString()}
                    </p>
                    {app.match_score > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        <Sparkles className="w-3 h-3" />
                        AI Match: {app.match_score}%
                      </span>
                    )}
                  </div>
                  <Badge status={app.status} showDot />
                </div>

                <div className="pt-2.5 border-t border-slate-200/60 dark:border-navy-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-brand-600 dark:text-cyan-400" />
                    <span>{app.original_resume_filename || 'Original Resume'}</span>
                  </span>

                  <button
                    onClick={() => setSelectedAppForProfile(app)}
                    className="px-3 py-1 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-cyan-400 rounded-lg text-xs font-bold border border-brand-200 dark:border-brand-800/60 flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Resume & AI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open Positions List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Current Job Openings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Find the perfect match for your skills and career goals
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search positions, keywords..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-2xs"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton height="h-56" />
            <CardSkeleton height="h-56" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            title="No matching job openings found"
            description="Try adjusting your search criteria or check back later for new career opportunities."
            aiSuggested={false}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((j) => (
              <div
                key={j.id}
                className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-col justify-between hover:border-brand-500/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        {j.title}
                      </h4>
                      <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                        {j.department_name || 'Engineering'}
                      </p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold">
                      {j.employment_type}
                    </span>
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center gap-3.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{j.location}</span>
                    </div>
                    {j.salary_range && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span>{j.salary_range}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{j.experience_required_years} Yrs Exp</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                    {j.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    {j.applicant_count} candidate{j.applicant_count === 1 ? '' : 's'} applied
                  </span>
                  <button
                    onClick={() => {
                      setSelectedJobForApply(j);
                      setShowApplyModal(true);
                    }}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-brand-600/20 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Apply with Resume</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showApplyModal && (
        <ResumeUploadModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          jobs={selectedJobForApply ? [selectedJobForApply] : jobs}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {selectedAppForProfile && (
        <CandidateProfileModal
          isOpen={!!selectedAppForProfile}
          onClose={() => setSelectedAppForProfile(null)}
          candidate={selectedAppForProfile}
          jobs={jobs}
          onStatusUpdated={loadData}
        />
      )}
      </div>
    </div>
  );
};

