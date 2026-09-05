import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { recruitmentService } from '../../services/recruitment.service';
import { Job, Candidate } from '../../types';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, Building2, Briefcase } from 'lucide-react';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  onUploadSuccess?: () => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onUploadSuccess,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs.length > 0 ? String(jobs[0].id) : '');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'docx', 'doc'].includes(ext || '')) {
        setErrorMsg('Invalid file format. Please upload PDF or Word DOCX.');
        setFile(null);
        return;
      }
      setFile(selected);
      setErrorMsg(null);
      setScanResult(null);
    }
  };

  const handleUploadAndScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please choose a resume file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    if (selectedJobId) {
      formData.append('job_id', selectedJobId);
    }

    try {
      const data = await recruitmentService.uploadResume(formData);
      setScanResult(data);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to upload and scan resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setScanResult(null);
    setErrorMsg(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Resume Scanner & Candidate Matcher"
      subtitle="Upload resumes (PDF/DOCX) for automated NLP skill extraction and department classification."
      maxWidth="xl"
    >
      {!scanResult ? (
        <form onSubmit={handleUploadAndScan} className="space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Job Target Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Match Against Job Opening (Optional)
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">General Resume Ingestion (No specific job)</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.department_name || 'All Departments'})
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Area */}
          <div className="border-2 border-dashed border-slate-300 dark:border-navy-700 hover:border-brand-500 dark:hover:border-cyan-500 rounded-3xl p-7 text-center transition-colors bg-slate-50/50 dark:bg-navy-950/40">
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-cyan-400 border border-brand-100 dark:border-brand-800/60 flex items-center justify-center mb-3 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                {file ? file.name : 'Click to browse or drag & drop resume document'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Supports PDF and Word (.docx) up to 10MB</p>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 disabled:opacity-50 text-white shadow-apple flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isUploading ? 'AI Analyzing Resume...' : 'Upload & Run AI Scan'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Scanned Results Display */
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-300">AI Resume Scan Completed</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">Candidate profile created and parsed successfully</p>
              </div>
            </div>
            {scanResult.match_score > 0 && (
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{scanResult.match_score}%</span>
                <span className="text-[10px] block uppercase font-bold text-emerald-600 dark:text-emerald-400">Match Score</span>
              </div>
            )}
          </div>

          {/* Candidate Extracted Details */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-semibold block">Candidate Name</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{scanResult.candidate_name}</p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-semibold block">Email / Contact</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{scanResult.email || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-semibold block">Estimated Experience</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{scanResult.experience_years} Years</p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-semibold block">Suggested Department</span>
              <p className="font-bold text-brand-600 dark:text-cyan-400 mt-0.5">{scanResult.suggested_department}</p>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Extracted Skills</span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/60 dark:border-navy-800">
              {scanResult.skills && scanResult.skills.length > 0 ? (
                scanResult.skills.map((s: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-medium shadow-xs"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-xs">No explicit technical skills matched</span>
              )}
            </div>
          </div>

          {/* AI Summary */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">✦ AI Executive Fit Summary</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 p-3.5 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900 rounded-2xl leading-relaxed">
              {scanResult.ai_summary}
            </p>
          </div>

          {/* Close & Next */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-navy-800">
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-brand-600 dark:text-cyan-400 hover:underline"
            >
              Upload Another Resume
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-navy-800 text-white hover:bg-slate-800 dark:hover:bg-navy-700 transition-colors"
            >
              Done & View Candidates
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
