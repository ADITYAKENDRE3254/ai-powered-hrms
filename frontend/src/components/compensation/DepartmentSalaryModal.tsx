import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Department, DepartmentSalaryRule } from '../../types';
import { Building2, IndianRupee, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import compensationService from '../../services/compensation.service';

interface DepartmentSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departments: Department[];
  editingRule?: DepartmentSalaryRule | null;
}

export const DepartmentSalaryModal: React.FC<DepartmentSalaryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  departments,
  editingRule,
}) => {
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [minSalary, setMinSalary] = useState<string>('25000');
  const [maxSalary, setMaxSalary] = useState<string>('80000');
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingRule) {
      setDepartmentId(editingRule.department_id);
      setMinSalary(editingRule.min_salary.toString());
      setMaxSalary(editingRule.max_salary.toString());
      setEffectiveDate(editingRule.effective_date);
      setNotes(editingRule.notes || '');
      setIsActive(editingRule.is_active);
    } else if (departments.length > 0) {
      setDepartmentId(departments[0].id);
      setMinSalary('25000');
      setMaxSalary('80000');
      setEffectiveDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setIsActive(true);
    }
    setError(null);
  }, [editingRule, departments, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const min = parseFloat(minSalary);
    const max = parseFloat(maxSalary);

    if (isNaN(min) || min < 0) {
      setError('Please enter a valid minimum salary.');
      return;
    }
    if (isNaN(max) || max < 0) {
      setError('Please enter a valid maximum salary.');
      return;
    }
    if (min > max) {
      setError('Minimum salary cannot exceed maximum salary.');
      return;
    }
    if (!departmentId) {
      setError('Please select a department.');
      return;
    }

    try {
      setLoading(true);
      await compensationService.createOrUpdateDepartmentRule({
        department_id: departmentId,
        min_salary: min,
        max_salary: max,
        effective_date: effectiveDate,
        is_active: isActive,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save department salary rule.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRule ? 'Edit Department Salary Range' : 'Configure Department Salary Range'}
      subtitle="Define base compensation bands applied as priority tier 3 fallback"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Department Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Department <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(Number(e.target.value))}
              disabled={!!editingRule}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-60"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Min & Max Salary */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Minimum Salary (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">₹</span>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="25000"
                min="0"
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl pl-7 pr-3 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Maximum Salary (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">₹</span>
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="80000"
                min="0"
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl pl-7 pr-3 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Effective Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Effective Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Notes / Budget Justification
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., FY26 annual compensation band for Engineering department"
            rows={3}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/70 dark:border-navy-800">
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white block">Active Rule</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Available for department fallback resolution</span>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              isActive ? 'bg-brand-600' : 'bg-slate-300 dark:bg-navy-800'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 rounded-xl shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : editingRule ? 'Update Range' : 'Save Department Range'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
