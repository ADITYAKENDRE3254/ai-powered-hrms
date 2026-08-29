import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/report.service';
import { recruitmentService } from '../../services/recruitment.service';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { ResumeUploadModal } from '../../components/recruitment/ResumeUploadModal';
import { AIMatchModal } from '../../components/recruitment/AIMatchModal';
import { Briefcase, Users, Sparkles, UploadCloud, Award, ArrowUpRight } from 'lucide-react';
import { Job, Candidate } from '../../types';

export const RecruiterDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [sum, jList, cList] = await Promise.all([
        reportService.getDashboardSummary(),
        recruitmentService.getJobs(),
        recruitmentService.getCandidates(),
      ]);
      setSummary(sum);
      setJobs(jList);
      setCandidates(cList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Talent Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Recruitment & AI Match Hub</h1>
          <p className="text-amber-200 text-xs sm:text-sm mt-1 max-w-xl">
            Scan resumes with NLP skill extraction, compute job match percentages, and manage candidate workflows.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Scan New Resume (PDF/DOCX)</span>
          </button>
          <button
            onClick={() => navigate('/recruitment')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4" />
            <span>Manage All Jobs</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Open Positions" value={summary?.open_jobs || '0'} icon={Briefcase} color="amber" />
        <StatCard title="Total Candidates" value={summary?.total_candidates || '0'} icon={Users} color="indigo" />
        <StatCard title="AI Screened" value={summary?.ai_screened || '0'} icon={Sparkles} color="purple" />
        <StatCard title="Shortlisted" value={summary?.shortlisted || '0'} icon={Award} color="emerald" />
      </div>

      {/* Top AI-Scored Candidates */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Candidates & AI Match Scores</h3>
            <p className="text-xs text-slate-500">Automatic NLP skill parsing and department recommendation</p>
          </div>
          <button
            onClick={() => navigate('/recruitment')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
          >
            <span>Full Pipeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.slice(0, 6).map((c) => (
            <div key={c.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{c.first_name} {c.last_name}</h4>
                    <p className="text-xs text-indigo-600 font-semibold">{c.job_title || 'General Applicant'}</p>
                  </div>
                  {c.match_score > 0 && (
                    <div className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black">
                      {c.match_score}%
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{c.ai_summary || 'Extracted candidate profile'}</p>

                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Dept: <b className="text-slate-700">{c.suggested_department || 'Engineering'}</b></span>
                  <Badge status={c.status} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedCandidate(c)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI Breakdown</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showUploadModal && (
        <ResumeUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          jobs={jobs}
          onUploadSuccess={loadData}
        />
      )}

      {selectedCandidate && (
        <AIMatchModal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          candidate={selectedCandidate}
          jobs={jobs}
        />
      )}
    </div>
  );
};
