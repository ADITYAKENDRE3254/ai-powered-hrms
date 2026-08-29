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
          <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Role</label>
          <select
            value={selectedJobId}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedJobId(id);
              runMatch(id);
            }}
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.department_name || 'Engineering'})
              </option>
            ))}
          </select>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-slate-500">Computing AI Matching Metrics...</p>
          </div>
        ) : matchResult ? (
          <div className="space-y-4 animate-fade-in">
            {/* Score Banner */}
            <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl flex items-center justify-between shadow-md">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
                    Match Confidence
                  </span>
                </div>
                <h3 className="text-2xl font-black mt-1">{matchResult.match_score}% Score</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI Suggested Department: <span className="text-white font-semibold">{matchResult.suggested_department}</span>
                </p>
              </div>

              {/* Progress Circle Visual */}
              <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-indigo-950 border-4 border-indigo-500/40">
                <span className="text-sm font-black text-indigo-300">{matchResult.match_score}%</span>
              </div>
            </div>

            {/* Matching vs Missing Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Matching */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Matching Skills ({matchResult.matching_skills?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {matchResult.matching_skills && matchResult.matching_skills.length > 0 ? (
                    matchResult.matching_skills.map((s: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-emerald-100/80 text-emerald-800 rounded-md text-[11px] font-medium border border-emerald-200"
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
              <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-2">
                  <X className="w-4 h-4 text-rose-600" />
                  <span>Missing Skills ({matchResult.missing_skills?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {matchResult.missing_skills && matchResult.missing_skills.length > 0 ? (
                    matchResult.missing_skills.map((s: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-rose-100/80 text-rose-800 rounded-md text-[11px] font-medium border border-rose-200"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-700 text-xs font-medium">All required skills present!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Experience & Education Fit */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 font-semibold block">Experience Alignment</span>
                  <p className="font-bold text-slate-800 mt-0.5">{matchResult.experience_match}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 font-semibold block">Education Assessment</span>
                  <p className="font-bold text-slate-800 mt-0.5">{matchResult.education_match}</p>
                </div>
              </div>
            </div>

            {/* Fit Summary */}
            <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
              <span className="text-xs font-bold text-indigo-950 block mb-1">AI Recommendation</span>
              <p className="text-xs text-indigo-900 leading-relaxed">{matchResult.ai_summary}</p>
              <p className="text-[10px] text-slate-400 mt-2 italic">
                * Note: AI scores are advisory. Recruiter makes final hiring decision.
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
