import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { trainingService } from '../../services/training.service';
import { TrainingDifficulty } from '../../types';
import { BookPlus, AlertCircle, Sparkles } from 'lucide-react';

interface CreateTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateTrainingModal: React.FC<CreateTrainingModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillName, setSkillName] = useState('');
  const [difficulty, setDifficulty] = useState<TrainingDifficulty>('INTERMEDIATE');
  const [durationHours, setDurationHours] = useState(12);
  const [provider, setProvider] = useState('Enterprise Academy');
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !skillName || !description) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await trainingService.createTrainingProgram({
        title,
        description,
        skill_name: skillName,
        difficulty,
        duration_hours: Number(durationHours),
        provider,
        deadline_days: Number(deadlineDays),
        is_active: true
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create training program');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Training Program">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Program Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cloud Native Kubernetes & Microservices Architecture"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Skill Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. Kubernetes, Python, React, FastAPI"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as TrainingDifficulty)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Duration (Hours)
            </label>
            <input
              type="number"
              min="1"
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Provider / Academy
            </label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g. Enterprise Academy"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Standard Days to Complete
            </label>
            <input
              type="number"
              min="7"
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Curriculum & Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline syllabus, learning objectives, hands-on labs, and certification deliverables..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-navy-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold shadow-apple shadow-brand-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <BookPlus className="w-4 h-4" />
            <span>{isLoading ? 'Creating...' : 'Create Course'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
