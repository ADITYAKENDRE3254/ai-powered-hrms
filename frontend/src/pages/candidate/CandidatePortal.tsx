import React, { useState, useEffect } from 'react';
import { recruitmentService } from '../../services/recruitment.service';
import { Job, Candidate } from '../../types';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { ResumeUploadModal } from '../../components/recruitment/ResumeUploadModal';
import { Briefcase, MapPin, DollarSign, UploadCloud, CheckCircle2, Search, Sparkles } from 'lucide-react';

export const CandidatePortal: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [jList, cList] = await Promise.all([
        recruitmentService.getJobs('OPEN'),
        recruitmentService.getCandidates(),
      ]);
      setJobs(jList);
      setMyApplications(cList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 border border-navy-800/80 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Careers & Talent Community</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Explore Opportunities at AI-HRMS
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Apply with your PDF or DOCX resume. Our automated AI parser matches your skillset with open vacancies in real time.
          </p>
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
                className="p-4 rounded-xl border border-slate-200/80 dark:border-navy-800 bg-slate-50/60 dark:bg-navy-950/50 flex items-center justify-between shadow-2xs"
              >
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
          onUploadSuccess={loadData}
        />
      )}
    </div>
  );
};

