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
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <h4 className="text-base font-bold">AI-POWERED HRMS CORPORATION</h4>
            <p className="text-xs text-indigo-300 mt-0.5">Confidential Salary Statement</p>
          </div>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </a>
        </div>

        {/* Employee Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block">Employee Code</span>
            <p className="font-bold text-slate-900 mt-0.5">{item.employee_code}</p>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Full Name</span>
            <p className="font-bold text-slate-900 mt-0.5">{item.employee_name}</p>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Department</span>
            <p className="font-bold text-slate-900 mt-0.5">{item.department_name || 'General'}</p>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Designation</span>
            <p className="font-bold text-slate-900 mt-0.5">{item.designation || 'Specialist'}</p>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="grid grid-cols-4 gap-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-center text-xs">
          <div>
            <span className="text-slate-500 font-semibold block">Working Days</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{item.working_days}</p>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Present Days</span>
            <p className="text-sm font-bold text-emerald-700 mt-0.5">{item.present_days}</p>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Approved Leaves</span>
            <p className="text-sm font-bold text-blue-700 mt-0.5">{item.approved_leave_days}</p>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">LWP Days</span>
            <p className="text-sm font-bold text-rose-700 mt-0.5">{item.lwp_days}</p>
          </div>
        </div>

        {/* Earnings & Deductions Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Earnings */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 border-b border-slate-200">
              EARNINGS
            </div>
            <div className="p-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Basic Salary</span>
                <span className="font-semibold text-slate-900">${item.basic_salary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Allowances & Perks</span>
                <span className="font-semibold text-slate-900">${item.allowances.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                <span>Total Gross Earnings</span>
                <span className="text-emerald-700">${item.total_earnings.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-800 border-b border-slate-200">
              DEDUCTIONS
            </div>
            <div className="p-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>LWP Deduction ({item.lwp_days} days)</span>
                <span className="font-semibold text-rose-600">${item.lwp_deduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Provident Fund (PF)</span>
                <span className="font-semibold text-slate-900">${item.pf_deduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Income Tax</span>
                <span className="font-semibold text-slate-900">${item.tax_deduction.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                <span>Total Deductions</span>
                <span className="text-rose-700">${item.total_deductions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Disbursed Highlight */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-emerald-950">Net Disbursed Pay</span>
          <span className="text-2xl font-black text-emerald-700">${item.net_salary.toLocaleString()}</span>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
