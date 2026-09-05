import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { trainingService } from '../../services/training.service';
import { employeeService } from '../../services/employee.service';
import { TrainingProgram, Employee } from '../../types';
import { UserCheck, AlertCircle, Sparkles, Check, Users } from 'lucide-react';

interface AssignTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssigned: () => void;
  selectedTraining?: TrainingProgram | null;
  trainings: TrainingProgram[];
}

export const AssignTrainingModal: React.FC<AssignTrainingModalProps> = ({
  isOpen,
  onClose,
  onAssigned,
  selectedTraining,
  trainings
}) => {
  const [trainingId, setTrainingId] = useState<number>(selectedTraining?.id || (trainings[0]?.id || 0));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState<number[]>([]);
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTraining) {
      setTrainingId(selectedTraining.id);
    } else if (trainings.length > 0 && !trainingId) {
      setTrainingId(trainings[0].id);
    }
  }, [selectedTraining, trainings]);

  useEffect(() => {
    if (isOpen) {
      employeeService.getEmployees({ limit: 100 }).then((res) => {
        setEmployees(res.items);
      }).catch(console.error);
    }
  }, [isOpen]);

  const handleToggleEmp = (id: number) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmpIds.length === employees.length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(employees.map((e) => e.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingId || selectedEmpIds.length === 0) {
      setError('Please select a training program and at least one employee.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await trainingService.assignTraining({
        training_id: trainingId,
        employee_ids: selectedEmpIds,
        deadline: deadline || undefined
      });
      onAssigned();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to assign training');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Training Program to Staff">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Select Training Program <span className="text-rose-500">*</span>
          </label>
          <select
            value={trainingId}
            onChange={(e) => setTrainingId(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors"
          >
            {trainings.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.skill_name} • {t.difficulty})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Custom Completion Deadline (Optional)
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-500" />
              <span>Target Staff ({selectedEmpIds.length} chosen)</span>
              <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-semibold text-brand-600 dark:text-cyan-400 hover:underline"
            >
              {selectedEmpIds.length === employees.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto border border-slate-200 dark:border-navy-800 rounded-xl p-2 space-y-1 bg-slate-50 dark:bg-navy-950">
            {employees.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">Loading active employees...</div>
            ) : (
              employees.map((emp) => {
                const isSelected = selectedEmpIds.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    onClick={() => handleToggleEmp(emp.id)}
                    className={`p-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800/60 text-brand-900 dark:text-brand-200 font-semibold'
                        : 'bg-white dark:bg-navy-900 border border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {isSelected ? <Check className="w-3 h-3" /> : emp.first_name[0]}
                      </div>
                      <div>
                        <span>{emp.first_name} {emp.last_name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5 font-normal">({emp.designation})</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400">
                      {emp.department_name || 'Staff'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
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
            disabled={isLoading || selectedEmpIds.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold shadow-apple shadow-brand-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isLoading ? 'Assigning...' : `Assign to ${selectedEmpIds.length} Staff`}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
