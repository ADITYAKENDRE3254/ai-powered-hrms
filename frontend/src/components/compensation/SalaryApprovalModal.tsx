import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { EmployeeSalary } from '../../types';
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck, IndianRupee, ArrowRight } from 'lucide-react';
import compensationService from '../../services/compensation.service';

interface SalaryApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  salaryItem: EmployeeSalary | null;
}

export const SalaryApprovalModal: React.FC<SalaryApprovalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  salaryItem,
}) => {
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [notes, setNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!salaryItem) return null;

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (decision === 'REJECT' && !rejectionReason.trim()) {
      setError('Please provide a reason for rejecting this salary revision.');
      return;
    }

    try {
      setLoading(true);
      await compensationService.processApproval(salaryItem.id, {
        approved: decision === 'APPROVE',
        notes: notes.trim() || undefined,
        rejection_reason: decision === 'REJECT' ? rejectionReason.trim() : undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process salary approval.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Salary Revision Approval Request"
      subtitle={`Review proposed compensation adjustment for ${salaryItem.employee_name}`}
      maxWidth="lg"
    >
      <form onSubmit={handleProcess} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Employee Summary Card */}
        <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {salaryItem.employee_name} ({salaryItem.employee_code})
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {salaryItem.position} • {salaryItem.department_name || 'General'}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/50">
              PENDING APPROVAL
            </span>
          </div>

          {/* Proposed Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-navy-800">
            <div className="bg-white dark:bg-navy-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-navy-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Proposed Gross</span>
              <span className="text-sm font-extrabold text-brand-600 dark:text-cyan-400">
                ₹{salaryItem.gross_salary.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-white dark:bg-navy-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-navy-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Deductions</span>
              <span className="text-sm font-extrabold text-rose-500">
                -₹{salaryItem.total_deductions.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-white dark:bg-navy-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-navy-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Net Take-Home</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                ₹{salaryItem.net_salary.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Adjustment Justification: </span>
            {salaryItem.reason || 'Not specified'}
          </div>
        </div>

        {/* Decision Toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDecision('APPROVE')}
            className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              decision === 'APPROVE'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve Salary Revision
          </button>

          <button
            type="button"
            onClick={() => setDecision('REJECT')}
            className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              decision === 'REJECT'
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs'
                : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Reject Request
          </button>
        </div>

        {/* Notes or Rejection Reason */}
        {decision === 'APPROVE' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Approval Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Verified against departmental budget and merit evaluation"
              rows={2}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Compensation request exceeds current Q3 department allocation"
              rows={2}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
            />
          </div>
        )}

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
            className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-md transition-all disabled:opacity-50 ${
              decision === 'APPROVE'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
            }`}
          >
            {loading ? 'Processing...' : decision === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
