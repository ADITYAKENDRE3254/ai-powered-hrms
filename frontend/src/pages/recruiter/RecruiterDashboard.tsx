import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/report.service';
import { recruitmentService } from '../../services/recruitment.service';
import { StatCard } from '../../components/common/StatCard';
import { StatCardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { ResumeUploadModal } from '../../components/recruitment/ResumeUploadModal';
import { AIMatchModal } from '../../components/recruitment/AIMatchModal';
import {
  Briefcase,
  Users,
  Sparkles,
  UploadCloud,
  Award,
  ArrowUpRight,
  Brain,
  CheckCircle2
} from 'lucide-react';
import { Job, Candidate } from '../../types';

export const RecruiterDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 border border-navy-800/80 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-60 h-60 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Talent Intelligence & ATS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Recruitment & AI Match Center
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Scan applicant resumes with NLP keyword extraction, compute role matching scores, and advance candidates through the hiring pipeline.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-600 via-cyan-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/25 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>✦ Scan Resume (PDF/DOCX)</span>
            </button>
            <button
              onClick={() => navigate('/recruitment')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/15 backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>ATS Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard
            title="Open Positions"
            value={summary?.open_jobs || jobs.length || '0'}
            icon={Briefcase}
            color="blue"
            subtitle="Active job postings"
            onClick={() => navigate('/recruitment')}
          />
          <StatCard
            title="Total Candidates"
            value={summary?.total_candidates || candidates.length || '0'}
            icon={Users}
            color="cyan"
            subtitle="In applicant pool"
            onClick={() => navigate('/recruitment')}
          />
          <StatCard
            title="AI Screened"
            value={summary?.ai_screened || summary?.recruitment_pipeline?.ai_screened || '0'}
            icon={Sparkles}
            color="purple"
            subtitle="NLP evaluated"
            aiBenchmark="High Match"
            onClick={() => navigate('/recruitment')}
          />
          <StatCard
            title="Shortlisted"
            value={summary?.shortlisted || summary?.recruitment_pipeline?.shortlisted || '0'}
            icon={Award}
            color="emerald"
            subtitle="Advancing to interview"
            onClick={() => navigate('/recruitment')}
          />
        </div>
      )}

      {/* Top AI-Scored Candidates */}
      <div className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Recent Candidates & AI Match Scores
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automatic NLP skill parsing, score calculation, and department recommendation
            </p>
          </div>
          <button
            onClick={() => navigate('/recruitment')}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>Full ATS Pipeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {candidates.length === 0 ? (
          <EmptyState
            title="No candidate profiles uploaded"
            description="Upload a candidate resume to generate AI skill extractions and vacancy match evaluations."
            actionText="Scan First Resume"
            onAction={() => setShowUploadModal(true)}
            aiSuggested={true}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 hover:bg-slate-50 dark:hover:bg-navy-950 transition-all flex flex-col justify-between shadow-xs hover:border-brand-500/40"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {c.first_name} {c.last_name}
                      </h4>
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                        {c.job_title || 'General Applicant'}
                      </p>
                    </div>
                    {c.match_score > 0 && (
                      <div className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-black">
                        {c.match_score}% Match
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {c.ai_summary || 'Extracted candidate profile and matched competencies'}
                  </p>

                  <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-navy-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Dept: <b className="text-slate-700 dark:text-slate-300">{c.suggested_department || 'Engineering'}</b>
                    </span>
                    <Badge status={c.status} showDot />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setSelectedCandidate(c)}
                    className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 text-xs font-bold border border-brand-200 dark:border-brand-800/60 flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✦ AI Breakdown</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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

