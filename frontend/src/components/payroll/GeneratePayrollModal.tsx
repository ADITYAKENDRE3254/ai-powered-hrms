import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { payrollService } from '../../services/payroll.service';
import { Payroll } from '../../types';
import { DollarSign, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface GeneratePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayrollGenerated?: (payroll: Payroll) => void;
}

export const GeneratePayrollModal: React.FC<GeneratePayrollModalProps> = ({
  isOpen,
  onClose,
  onPayrollGenerated,
}) => {
  const currentDate = new Date();
  const [month, setMonth] = useState<number>(currentDate.getMonth() === 0 ? 12 : currentDate.getMonth());
  const [year, setYear] = useState<number>(currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear());
  const [workingDays, setWorkingDays] = useState<number>(22);
  const [notes, setNotes] = useState<string>('Standard monthly company payroll calculation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const months = [
    { num: 1, name: 'January' },
    { num: 2, name: 'February' },
    { num: 3, name: 'March' },
    { num: 4, name: 'April' },
    { num: 5, name: 'May' },
    { num: 6, name: 'June' },
    { num: 7, name: 'July' },
    { num: 8, name: 'August' },
    { num: 9, name: 'September' },
    { num: 10, name: 'October' },
    { num: 11, name: 'November' },
    { num: 12, name: 'December' },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payroll = await payrollService.generatePayroll({
        month: Number(month),
        year: Number(year),
        total_working_days: Number(workingDays),
        notes: notes.trim(),
      });
      if (onPayrollGenerated) onPayrollGenerated(payroll);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to generate payroll');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Company Payroll"
      subtitle="Runs automated attendance calculations, LWP deductions, and generates PDF payslips."
      maxWidth="md"
    >
      <form onSubmit={handleGenerate} className="space-y-4">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-4 bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/60 rounded-2xl text-xs space-y-1.5 text-brand-950 dark:text-brand-300">
          <p className="font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
            <span>Automated Formula Breakdown</span>
          </p>
          <p className="text-[11px] text-brand-900 dark:text-slate-300 leading-relaxed">
            - <b>Per-Day Rate</b>: Monthly Salary / Working Days<br />
            - <b>LWP Days</b>: Working Days - (Present Days + Approved Leaves)<br />
            - <b>Net Salary</b>: (Basic + Allowances) - (LWP Deduction + PF + Tax)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Payroll Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {months.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name} ({m.num.toString().padStart(2, '0')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Payroll Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2020}
              max={2030}
              required
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Total Working Days</label>
          <input
            type="number"
            value={workingDays}
            onChange={(e) => setWorkingDays(Number(e.target.value))}
            min={1}
            max={31}
            required
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Processing Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white shadow-apple transition-all flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" />
            <span>{isSubmitting ? 'Calculating Payroll...' : 'Process All Staff'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
