import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { recruitmentService } from '../../services/recruitment.service';
import { Job, Department, JobStatus } from '../../types';
import { AlertCircle } from 'lucide-react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  departments: Department[];
  onSaved: () => void;
}

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  job,
  departments,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState<number>(departments[0]?.id || 1);
  const [description, setDescription] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [experience, setExperience] = useState<number>(2.0);
  const [location, setLocation] = useState('Bangalore / Hybrid');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [salaryRange, setSalaryRange] = useState('$80,000 - $110,000');
  const [status, setStatus] = useState<JobStatus>('OPEN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setDepartmentId(job.department_id || departments[0]?.id || 1);
      setDescription(job.description);
      setSkillsStr(
        typeof job.required_skills === 'string' && job.required_skills.startsWith('[')
          ? JSON.parse(job.required_skills).join(', ')
          : job.required_skills
      );
      setExperience(job.experience_required_years);
      setLocation(job.location);
      setEmploymentType(job.employment_type);
      setSalaryRange(job.salary_range || '');
      setStatus(job.status);
    } else {
      setTitle('');
      setDepartmentId(departments[0]?.id || 1);
      setDescription('');
      setSkillsStr('Python, FastAPI, React, SQL, Docker');
      setExperience(2.0);
      setLocation('Bangalore / Hybrid');
      setEmploymentType('Full-time');
      setSalaryRange('$80,000 - $110,000');
      setStatus('OPEN');
    }
  }, [job, isOpen, departments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !skillsStr.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const skillsArray = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      const payload: Partial<Job> = {
        title: title.trim(),
        department_id: departmentId,
        description: description.trim(),
        required_skills: JSON.stringify(skillsArray),
        experience_required_years: Number(experience),
        location: location.trim(),
        employment_type: employmentType,
        salary_range: salaryRange.trim(),
        status,
      };

      if (job) {
        await recruitmentService.updateJob(job.id, payload);
      } else {
        await recruitmentService.createJob(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to save job opening');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job ? 'Edit Job Opening' : 'Create New Job Opening'}
      subtitle="Define position requirements, competencies, and candidate compensation."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Job Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Senior Full-Stack Engineer"
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Department</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(Number(e.target.value))}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Experience Required (Years)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              required
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Required Skills (Comma-separated)
          </label>
          <input
            type="text"
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
            required
            placeholder="e.g. Python, FastAPI, React, SQL, Docker"
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">AI Matcher compares these skills against uploaded resumes.</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Salary Range</label>
            <input
              type="text"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="OPEN">Open (Accepting Applications)</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Job Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            placeholder="Detailed description of responsibilities and qualifications..."
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

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
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white shadow-apple transition-all"
          >
            {isSubmitting ? 'Saving...' : job ? 'Update Job Opening' : 'Publish Job Opening'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
