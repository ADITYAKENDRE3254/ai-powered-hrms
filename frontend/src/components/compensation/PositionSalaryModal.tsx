import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Department, PositionSalaryRule, SalaryType } from '../../types';
import { Briefcase, IndianRupee, AlertCircle } from 'lucide-react';
import compensationService from '../../services/compensation.service';

interface PositionSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departments: Department[];
  editingRule?: PositionSalaryRule | null;
}

export const PositionSalaryModal: React.FC<PositionSalaryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  departments,
  editingRule,
}) => {
  const [positionTitle, setPositionTitle] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [minSalary, setMinSalary] = useState<string>('40000');
  const [defaultSalary, setDefaultSalary] = useState<string>('60000');
  const [maxSalary, setMaxSalary] = useState<string>('90000');
  const [salaryType, setSalaryType] = useState<SalaryType>('MONTHLY');
  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingRule) {
      setPositionTitle(editingRule.position_title);
      setDepartmentId(editingRule.department_id || null);
      setMinSalary(editingRule.min_salary.toString());
      setDefaultSalary(editingRule.default_salary.toString());
      setMaxSalary(editingRule.max_salary.toString());
      setSalaryType(editingRule.salary_type || 'MONTHLY');
      setEffectiveDate(editingRule.effective_date);
      setNotes(editingRule.notes || '');
      setIsActive(editingRule.is_active);
    } else {
      setPositionTitle('');
      setDepartmentId(null);
      setMinSalary('40000');
      setDefaultSalary('60000');
      setMaxSalary('90000');
      setSalaryType('MONTHLY');
      setEffectiveDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setIsActive(true);
    }
    setError(null);
  }, [editingRule, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const min = parseFloat(minSalary);
    const def = parseFloat(defaultSalary);
    const max = parseFloat(maxSalary);

    if (!positionTitle.trim()) {
      setError('Please enter a position/designation title.');
      return;
    }
    if (isNaN(min) || min < 0) {
      setError('Please enter a valid minimum salary.');
      return;
    }
    if (isNaN(def) || def < 0) {
      setError('Please enter a valid recommended salary.');
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
    if (def < min || def > max) {
      setError('Recommended anchor salary must be within the min and max salary band.');
      return;
    }

    try {
      setLoading(true);
      await compensationService.createOrUpdatePositionRule({
        position_title: positionTitle.trim(),
        department_id: departmentId || undefined,
        min_salary: min,
        default_salary: def,
        max_salary: max,
        salary_type: salaryType,
        effective_date: effectiveDate,
        is_active: isActive,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save position salary benchmark.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRule ? 'Edit Position Salary Benchmark' : 'Configure Position Salary Benchmark'}
      subtitle="Define role market compensation band and standard recommended CTC"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Position Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Position / Designation Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={positionTitle}
              onChange={(e) => setPositionTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer, UI/UX Designer"
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Department Scope */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Department Scope
          </label>
          <select
            value={departmentId || ''}
            onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : null)}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Departments (Global Role Benchmark)</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        {/* 3 Salary Inputs: Min, Recommended, Max */}
        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Min Band (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs font-bold">₹</span>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="40000"
                min="0"
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl pl-6 pr-2 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Recommended (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs font-bold">₹</span>
              <input
                type="number"
                value={defaultSalary}
                onChange={(e) => setDefaultSalary(e.target.value)}
                placeholder="60000"
                min="0"
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl pl-6 pr-2 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none ring-1 ring-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Max Band (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs font-bold">₹</span>
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="90000"
                min="0"
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl pl-6 pr-2 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Salary Type & Effective Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Salary Type
            </label>
            <select
              value={salaryType}
              onChange={(e) => setSalaryType(e.target.value as SalaryType)}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="ANNUAL">Annual</option>
              <option value="HOURLY">Hourly</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>

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
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Benchmark Rationale & Experience Expectations
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Aligned with industry tier-1 tech scale for 3-5 years experience"
            rows={2}
            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
          />
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
            {loading ? 'Saving...' : editingRule ? 'Update Benchmark' : 'Save Position Benchmark'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
