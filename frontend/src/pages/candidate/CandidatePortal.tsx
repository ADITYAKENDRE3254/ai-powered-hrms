import React, { useState, useEffect } from 'react';
import { recruitmentService } from '../../services/recruitment.service';
import { Job, Candidate } from '../../types';
import { Badge } from '../../components/common/Badge';
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
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Careers & Talent Community</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Explore Opportunities at AI-HRMS</h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
          Apply with your PDF or DOCX resume. Our automated AI parser matches your skills with hiring managers.
        </p>
      </div>

      {/* My Submitted Applications */}
      {myApplications.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">My Submitted Applications</h3>
          <p className="text-xs text-slate-500 mb-4">Track the live progress of your job applications</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myApplications.map((app) => (
              <div key={app.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{app.job_title || 'Position Application'}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Applied on: {new Date(app.created_at).toLocaleDateString()}</p>
                  {app.match_score > 0 && (
                    <span className="inline-block text-[11px] font-bold text-emerald-700 mt-1">
                      AI Match Score: {app.match_score}%
                    </span>
                  )}
                </div>
                <Badge status={app.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open Positions List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Current Job Openings</h3>
            <p className="text-xs text-slate-500">Find the perfect match for your skills</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search positions..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((j) => (
            <div key={j.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{j.title}</h4>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">{j.department_name || 'Engineering'}</p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                    {j.employment_type}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
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

                <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">{j.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {j.applicant_count} candidate{j.applicant_count === 1 ? '' : 's'} applied
                </span>
                <button
                  onClick={() => {
                    setSelectedJobForApply(j);
                    setShowApplyModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Apply with Resume</span>
                </button>
              </div>
            </div>
          ))}
        </div>
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
