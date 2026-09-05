import React from 'react';
import { Modal } from '../common/Modal';
import { PayrollItem } from '../../types';
import { Download, FileText, CheckCircle2, Building2 } from 'lucide-react';
import { payrollService } from '../../services/payroll.service';

interface PayslipViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PayrollItem | null;
}

export const PayslipViewerModal: React.FC<PayslipViewerModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  if (!item) return null;

  const downloadUrl = payrollService.getPayslipDownloadUrl(item.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Payslip - ${item.employee_name || item.employee_code}`}
      subtitle="Generated via AI-HRMS Attendance-Based Payroll Engine"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Company Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-brand-950 to-navy-900 text-white rounded-3xl flex items-center justify-between shadow-apple-md border border-brand-500/20">
          <div>
            <h4 className="text-base font-black tracking-tight">AI-POWERED HRMS CORPORATION</h4>
            <p className="text-xs text-cyan-300 mt-0.5">Confidential Salary Statement</p>
          </div>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 text-white rounded-xl text-xs font-bold shadow-apple transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </a>
        </div>

        {/* Employee Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold block">Employee Code</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{item.employee_code}</p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold block">Full Name</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{item.employee_name}</p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold block">Department</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{item.department_name || 'General'}</p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold block">Designation</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{item.designation || 'Specialist'}</p>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="grid grid-cols-4 gap-2 bg-brand-50/50 dark:bg-brand-950/20 p-3.5 rounded-2xl border border-brand-100 dark:border-brand-900 text-center text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold block">Working Days</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{item.working_days}</p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold block">Present Days</span>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{item.present_days}</p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold block">Approved Leaves</span>
            <p className="text-sm font-bold text-brand-600 dark:text-cyan-400 mt-0.5">{item.approved_leave_days}</p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold block">LWP Days</span>
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">{item.lwp_days}</p>
          </div>
        </div>

        {/* Earnings & Deductions Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Earnings */}
          <div className="border border-slate-200 dark:border-navy-700 rounded-2xl overflow-hidden bg-white dark:bg-navy-900">
            <div className="bg-slate-100 dark:bg-navy-950 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-navy-800">
              EARNINGS
            </div>
            <div className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Basic Salary</span>
                <span className="font-semibold text-slate-900 dark:text-white">${item.basic_salary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Allowances & Perks</span>
                <span className="font-semibold text-slate-900 dark:text-white">${item.allowances.toLocaleString()}</span>
              </div>
              <div className="pt-2.5 border-t border-slate-100 dark:border-navy-800 flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Total Gross Earnings</span>
                <span className="text-emerald-600 dark:text-emerald-400">${item.total_earnings.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="border border-slate-200 dark:border-navy-700 rounded-2xl overflow-hidden bg-white dark:bg-navy-900">
            <div className="bg-slate-100 dark:bg-navy-950 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-navy-800">
              DEDUCTIONS
            </div>
            <div className="p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>LWP Deduction ({item.lwp_days} days)</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">${item.lwp_deduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Provident Fund (PF)</span>
                <span className="font-semibold text-slate-900 dark:text-white">${item.pf_deduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Income Tax</span>
                <span className="font-semibold text-slate-900 dark:text-white">${item.tax_deduction.toLocaleString()}</span>
              </div>
              <div className="pt-2.5 border-t border-slate-100 dark:border-navy-800 flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Total Deductions</span>
                <span className="text-rose-600 dark:text-rose-400">${item.total_deductions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Disbursed Highlight */}
        <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-emerald-950 dark:text-emerald-300 tracking-wider">
            Net Disbursed Pay
          </span>
          <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
            ${item.net_salary.toLocaleString()}
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-navy-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-navy-800 text-white hover:bg-slate-800 dark:hover:bg-navy-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
