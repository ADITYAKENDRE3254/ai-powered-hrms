import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { SalaryHistory } from '../../types';
import { History, TrendingUp, TrendingDown, ArrowRight, UserCheck, Calendar, AlertCircle } from 'lucide-react';
import compensationService from '../../services/compensation.service';

interface SalaryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  employeeName?: string;
  employeeCode?: string;
}

export const SalaryHistoryModal: React.FC<SalaryHistoryModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  employeeCode,
}) => {
  const [history, setHistory] = useState<SalaryHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employeeId && isOpen) {
      setLoading(true);
      setError(null);
      compensationService
        .getEmployeeSalaryHistory(employeeId)
        .then((data) => setHistory(data))
        .catch((err) => setError(err.response?.data?.detail || 'Failed to load salary history.'))
        .finally(() => setLoading(false));
    }
  }, [employeeId, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Salary Revision Audit History"
      subtitle={`Chronological compensation timeline for ${employeeName || 'Employee'} (${employeeCode || ''})`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading salary audit trail...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
            <History className="w-8 h-8 opacity-40" />
            <span>No previous salary adjustment records found.</span>
          </div>
        ) : (
          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {history.map((record, index) => {
              const isPositive = record.change_amount >= 0;
              return (
                <div
                  key={record.id || index}
                  className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 space-y-2.5 transition-all hover:border-brand-500/30"
                >
                  {/* Top Bar: Date & Change Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Effective: {record.effective_date}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isPositive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>
                        {isPositive ? '+' : ''}₹{record.change_amount.toLocaleString('en-IN')} ({isPositive ? '+' : ''}
                        {record.change_percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Salary Comparison Flow */}
                  <div className="flex items-center gap-3 bg-white dark:bg-navy-900 p-3 rounded-xl border border-slate-200/60 dark:border-navy-800/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Previous CTC</span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        ₹{record.previous_gross_salary.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-cyan-400 block">
                        Revised Gross CTC
                      </span>
                      <span className="text-base font-extrabold text-brand-600 dark:text-cyan-400">
                        ₹{record.new_gross_salary.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="ml-auto text-right">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                        Revised Net
                      </span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{record.new_net_salary.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Reason & Approver */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 pt-1">
                    <span className="text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Reason: </span>
                      {record.reason || 'Salary revision'}
                    </span>
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                      <UserCheck className="w-3.5 h-3.5 text-brand-500" />
                      <span>Modified by: {record.changed_by_name || 'System Admin'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-navy-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl transition-colors"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </Modal>
  );
};
