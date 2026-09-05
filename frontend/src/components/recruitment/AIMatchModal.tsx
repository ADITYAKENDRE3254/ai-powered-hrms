import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { aiService } from '../../services/ai.service';
import { Candidate, Job } from '../../types';
import { Sparkles, Check, X, Award, Briefcase, GraduationCap, AlertCircle } from 'lucide-react';

interface AIMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  jobs: Job[];
}

export const AIMatchModal: React.FC<AIMatchModalProps> = ({
  isOpen,
  onClose,
  candidate,
  jobs,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<number>(candidate?.job_id || (jobs[0]?.id || 1));
  const [matchResult, setMatchResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runMatch = async (jobId: number) => {
    if (!candidate) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await aiService.matchCandidateToJob(candidate.id, jobId);
      setMatchResult(data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to match candidate');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && candidate) {
      const jId = candidate.job_id || jobs[0]?.id || 1;
      setSelectedJobId(jId);
      runMatch(jId);
    }
  }, [isOpen, candidate]);

  if (!candidate) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Candidate & Job Fit Analysis"
      subtitle={`Comparing ${candidate.first_name} ${candidate.last_name} against position requirements.`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Job Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Job Role</label>
          <select
            value={selectedJobId}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedJobId(id);
              runMatch(id);
            }}
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.department_name || 'Engineering'})
              </option>
            ))}
          </select>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-14 flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Computing AI NLP Matching Metrics...</p>
          </div>
        ) : matchResult ? (
          <div className="space-y-4 animate-fade-in">
            {/* Score Banner */}
            <div className="p-6 bg-gradient-to-br from-slate-950 via-brand-950 to-navy-900 text-white rounded-3xl flex items-center justify-between shadow-apple-md border border-brand-500/20">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  <span className="text-[11px] uppercase font-bold tracking-wider text-cyan-300">
                    Match Confidence
                  </span>
                </div>
                <h3 className="text-2xl font-black mt-1">{matchResult.match_score}% Fit Score</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Suggested Department: <span className="text-cyan-300 font-bold">{matchResult.suggested_department}</span>
                </p>
              </div>

              {/* Progress Circle Visual */}
              <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-brand-900/50 border border-brand-400/40 shadow-xs">
                <span className="text-sm font-black text-white">{matchResult.match_score}%</span>
              </div>
            </div>

            {/* Matching vs Missing Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Matching */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Matching Competencies ({matchResult.matching_skills?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {matchResult.matching_skills && matchResult.matching_skills.length > 0 ? (
                    matchResult.matching_skills.map((s: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-lg text-[11px] font-semibold border border-emerald-200 dark:border-emerald-700"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs">No direct matches</span>
                  )}
                </div>
              </div>

              {/* Missing */}
              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300 mb-2">
                  <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Missing Gaps ({matchResult.missing_skills?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {matchResult.missing_skills && matchResult.missing_skills.length > 0 ? (
                    matchResult.missing_skills.map((s: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-rose-100/80 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 rounded-lg text-[11px] font-semibold border border-rose-200 dark:border-rose-700"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold">All required skills present!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Experience & Education Fit */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800">
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Experience Alignment</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{matchResult.experience_match}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Education Assessment</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{matchResult.education_match}</p>
                </div>
              </div>
            </div>

            {/* Fit Summary */}
            <div className="p-4 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900 rounded-2xl">
              <span className="text-xs font-bold text-brand-950 dark:text-cyan-300 block mb-1">✦ AI Recommendation</span>
              <p className="text-xs text-brand-900 dark:text-slate-300 leading-relaxed">{matchResult.ai_summary}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 italic">
                * Note: AI scores are advisory. Recruiter makes final hiring decision.
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-navy-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-navy-800 text-white hover:bg-slate-800 dark:hover:bg-navy-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
