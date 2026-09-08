import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { recruitmentService } from '../../services/recruitment.service';
import { aiService } from '../../services/ai.service';
import { Candidate, Job, CandidateStatus } from '../../types';
import {
  Sparkles,
  Check,
  X,
  Award,
  Briefcase,
  GraduationCap,
  AlertCircle,
  FileText,
  Download,
  ExternalLink,
  Eye,
  RefreshCw,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
  ChevronRight
} from 'lucide-react';

interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  jobs: Job[];
  onStatusUpdated?: () => void;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  isOpen,
  onClose,
  candidate,
  jobs,
  onStatusUpdated,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<number>(candidate?.job_id || (jobs[0]?.id || 1));
  const [matchResult, setMatchResult] = useState<any | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState<boolean>(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Resume Viewer States
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState<boolean>(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Status update state
  const [currentStatus, setCurrentStatus] = useState<CandidateStatus>(candidate?.status || 'APPLIED');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const isPdf = candidate?.original_resume_mime_type?.includes('pdf') ||
    candidate?.original_resume_filename?.toLowerCase().endsWith('.pdf') ||
    candidate?.resume_url?.toLowerCase().endsWith('.pdf');

  const isDocx = candidate?.original_resume_mime_type?.includes('word') ||
    candidate?.original_resume_mime_type?.includes('officedocument') ||
    candidate?.original_resume_filename?.toLowerCase().endsWith('.docx') ||
    candidate?.original_resume_filename?.toLowerCase().endsWith('.doc') ||
    candidate?.resume_url?.toLowerCase().endsWith('.docx') ||
    candidate?.resume_url?.toLowerCase().endsWith('.doc');

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const loadResumePreview = async () => {
    if (!candidate) return;
    setIsLoadingResume(true);
    setResumeError(null);
    try {
      if (isPdf) {
        const url = await recruitmentService.getResumeBlobUrl(candidate.id);
        setPdfBlobUrl(url);
      }
    } catch (err: any) {
      console.error('Error fetching resume blob:', err);
      setResumeError(err.response?.data?.detail || 'Could not load original resume preview.');
    } finally {
      setIsLoadingResume(false);
    }
  };

  const runMatch = async (jobId: number) => {
    if (!candidate) return;
    setIsLoadingMatch(true);
    setMatchError(null);
    try {
      const data = await aiService.matchCandidateToJob(candidate.id, jobId);
      setMatchResult(data);
    } catch (err: any) {
      setMatchError(err.response?.data?.detail || err.message || 'Failed to match candidate');
    } finally {
      setIsLoadingMatch(false);
    }
  };

  useEffect(() => {
    if (isOpen && candidate) {
      setCurrentStatus(candidate.status);
      const jId = candidate.job_id || jobs[0]?.id || 1;
      setSelectedJobId(jId);
      runMatch(jId);
      loadResumePreview();
    }
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
    };
  }, [isOpen, candidate]);

  const handleDownloadOriginal = async () => {
    if (!candidate) return;
    try {
      setIsDownloading(true);
      await recruitmentService.downloadResume(
        candidate.id,
        candidate.original_resume_filename || `${candidate.first_name}_${candidate.last_name}_Resume.pdf`
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to download original resume');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleStatusChange = async (newStatus: CandidateStatus) => {
    if (!candidate) return;
    try {
      setIsUpdatingStatus(true);
      await recruitmentService.updateCandidateStatus(candidate.id, newStatus);
      setCurrentStatus(newStatus);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update candidate status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!candidate) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Candidate Profile & Original Resume Analysis"
      subtitle={`Side-by-side original resume verification and AI NLP skill match for ${candidate.first_name} ${candidate.last_name}.`}
      maxWidth="5xl"
    >
      <div className="space-y-5">
        {/* Top Candidate Summary Bar */}
        <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-cyan-400 border border-brand-500/20 flex items-center justify-center font-black text-sm">
              {candidate.first_name[0]}{candidate.last_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {candidate.first_name} {candidate.last_name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-cyan-400 border border-brand-200 dark:border-brand-800">
                  {currentStatus.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {candidate.email} • {candidate.phone || 'No phone'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Target Role:</label>
            <select
              value={selectedJobId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedJobId(id);
                runMatch(id);
              }}
              className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-2xs"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.department_name || 'All Depts'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dual-Pane Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ======================================================== */}
          {/* LEFT PANE: ORIGINAL RESUME VIEWER (lg:col-span-6) */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 flex flex-col bg-slate-50/70 dark:bg-navy-950/60 rounded-3xl border border-slate-200/90 dark:border-navy-800 p-5 shadow-apple flex-1">
            {/* Left Header */}
            <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-slate-200/80 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Original Uploaded Resume
                </h4>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                {pdfBlobUrl && (
                  <button
                    onClick={() => window.open(pdfBlobUrl, '_blank')}
                    title="Open in new window"
                    className="p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-cyan-400 hover:bg-slate-200/60 dark:hover:bg-navy-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleDownloadOriginal}
                  disabled={isDownloading}
                  title="Download original resume file"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-cyan-400 shadow-2xs flex items-center gap-1.5 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
                </button>
              </div>
            </div>

            {/* Document Metadata Chips */}
            <div className="flex flex-wrap items-center gap-2 mb-3.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="px-2.5 py-1 bg-white dark:bg-navy-900 rounded-lg border border-slate-200/80 dark:border-navy-800 font-semibold text-slate-700 dark:text-slate-300">
                📄 {candidate.original_resume_filename || 'Original_Resume.pdf'}
              </span>
              {candidate.original_resume_size && (
                <span className="px-2.5 py-1 bg-white dark:bg-navy-900 rounded-lg border border-slate-200/80 dark:border-navy-800 font-semibold text-slate-700 dark:text-slate-300">
                  💾 {formatFileSize(candidate.original_resume_size)}
                </span>
              )}
              {candidate.uploaded_at && (
                <span className="px-2.5 py-1 bg-white dark:bg-navy-900 rounded-lg border border-slate-200/80 dark:border-navy-800 font-medium">
                  🕒 Uploaded: {new Date(candidate.uploaded_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Resume Content Container */}
            <div className="flex-1 min-h-[480px] flex flex-col justify-center">
              {isLoadingResume ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800">
                  <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading original resume stream...</p>
                </div>
              ) : resumeError ? (
                <div className="p-6 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">{resumeError}</p>
                  <button
                    onClick={handleDownloadOriginal}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File Directly</span>
                  </button>
                </div>
              ) : isPdf && pdfBlobUrl ? (
                <div className="w-full h-full min-h-[480px] rounded-2xl overflow-hidden border border-slate-200 dark:border-navy-800 bg-white shadow-2xs">
                  <iframe
                    src={`${pdfBlobUrl}#toolbar=1&navpanes=0`}
                    className="w-full h-[480px] rounded-2xl"
                    title="Original PDF Resume"
                  />
                </div>
              ) : isDocx ? (
                /* DOCX / Word Document Preview Card */
                <div className="p-8 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/90 dark:border-navy-800 flex flex-col items-center text-center space-y-4 shadow-2xs">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shadow-apple">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      {candidate.original_resume_filename || 'Candidate_Resume.docx'}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Microsoft Word Document (.docx)
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm leading-relaxed">
                    Word documents are stored unedited in original raw format. Download the file below to view formatting or edit.
                  </p>

                  <button
                    onClick={handleDownloadOriginal}
                    disabled={isDownloading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-bold rounded-xl shadow-apple transition-all flex items-center gap-2 hover:scale-[1.02]"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? 'Downloading...' : 'Download Original .docx'}</span>
                  </button>
                </div>
              ) : (
                /* Generic Document fallback */
                <div className="p-8 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/90 dark:border-navy-800 flex flex-col items-center text-center space-y-4 shadow-2xs">
                  <FileText className="w-12 h-12 text-slate-400" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">Original Resume Attached</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {candidate.original_resume_filename || 'Uploaded Document'}
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadOriginal}
                    className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Original Resume</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT PANE: AI-ANALYZED RESUME BREAKDOWN (lg:col-span-6) */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            {matchError && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{matchError}</span>
              </div>
            )}

            {isLoadingMatch ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-apple">
                <div className="w-9 h-9 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Computing AI NLP Skill Alignment...
                </p>
              </div>
            ) : matchResult ? (
              <div className="space-y-4 animate-fade-in">
                {/* Score Banner */}
                <div className="p-5 bg-gradient-to-br from-slate-950 via-brand-950 to-navy-900 text-white rounded-3xl flex items-center justify-between shadow-apple-md border border-brand-500/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-cyan-400" />
                      <span className="text-[11px] uppercase font-bold tracking-wider text-cyan-300">
                        AI Role Match Score
                      </span>
                    </div>
                    <h3 className="text-2xl font-black mt-1">{matchResult.match_score}% Fit Confidence</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Suggested Dept: <span className="text-cyan-300 font-bold">{matchResult.suggested_department}</span>
                    </p>
                  </div>

                  <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-brand-900/50 border border-brand-400/40 shadow-inner">
                    <span className="text-base font-black text-white">{matchResult.match_score}%</span>
                  </div>
                </div>

                {/* Matching vs Missing Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Matching */}
                  <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Matching Skills ({matchResult.matching_skills?.length || 0})</span>
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
                  <div className="p-4 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300 mb-2">
                      <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Skill Gaps ({matchResult.missing_skills?.length || 0})</span>
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
                        <span className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                          All job requirements satisfied!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Experience & Education Alignment */}
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

                {/* AI Executive Recommendation */}
                <div className="p-4 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900 rounded-2xl">
                  <span className="text-xs font-bold text-brand-950 dark:text-cyan-300 block mb-1">
                    ✦ AI Advisory Recommendation
                  </span>
                  <p className="text-xs text-brand-900 dark:text-slate-300 leading-relaxed">
                    {matchResult.ai_summary}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 italic">
                    * AI extraction is purely advisory to assist recruiters in fast candidate evaluation.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Action Footer Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-navy-800">
          {/* Quick Stage Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Move to:</span>
            <button
              onClick={() => handleStatusChange('SHORTLISTED')}
              disabled={isUpdatingStatus || currentStatus === 'SHORTLISTED'}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentStatus === 'SHORTLISTED'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 dark:bg-navy-800 dark:text-slate-300'
              }`}
            >
              Shortlist
            </button>
            <button
              onClick={() => handleStatusChange('INTERVIEW')}
              disabled={isUpdatingStatus || currentStatus === 'INTERVIEW'}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentStatus === 'INTERVIEW'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                  : 'bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 dark:bg-navy-800 dark:text-slate-300'
              }`}
            >
              Interview
            </button>
            <button
              onClick={() => handleStatusChange('SELECTED')}
              disabled={isUpdatingStatus || currentStatus === 'SELECTED'}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentStatus === 'SELECTED'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 dark:bg-navy-800 dark:text-slate-300'
              }`}
            >
              Hire / Select
            </button>
            <button
              onClick={() => handleStatusChange('REJECTED')}
              disabled={isUpdatingStatus || currentStatus === 'REJECTED'}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentStatus === 'REJECTED'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                  : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 dark:bg-navy-800 dark:text-slate-300'
              }`}
            >
              Reject
            </button>
          </div>

          {/* Close Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadOriginal}
              disabled={isDownloading}
              className="px-4 py-2 bg-gradient-to-r from-brand-600 to-cyan-600 text-white rounded-xl text-xs font-bold hover:from-brand-700 hover:to-cyan-700 shadow-apple transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Original Resume</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-navy-800 text-white hover:bg-slate-800 dark:hover:bg-navy-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
