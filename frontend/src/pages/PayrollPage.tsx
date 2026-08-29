import React, { useState, useEffect } from 'react';
import { payrollService } from '../services/payroll.service';
import { Payroll, PayrollItem } from '../types';
import { GeneratePayrollModal } from '../components/payroll/GeneratePayrollModal';
import { PayslipViewerModal } from '../components/payroll/PayslipViewerModal';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Download, Plus, Sparkles, FileText, Calendar, Users, Eye } from 'lucide-react';
import { reportService } from '../services/report.service';

export const PayrollPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isHRAdmin = hasRole('SUPER_ADMIN', 'HR_MANAGER');

  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [myRecords, setMyRecords] = useState<PayrollItem[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPayslipForView, setSelectedPayslipForView] = useState<PayrollItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (isHRAdmin) {
        const pList = await payrollService.getPayrolls();
        setPayrolls(pList);
        if (pList.length > 0) {
          setSelectedPayroll(pList[0]);
        }
      } else {
        const myP = await payrollService.getMyPayrollRecords();
        setMyRecords(myP);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Attendance-Based Payroll & Payslips</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic LWP deduction formula: (Monthly Salary / Working Days) &times; LWP Days + ReportLab PDF generation.
          </p>
        </div>

        {isHRAdmin && (
          <div className="flex items-center gap-2">
            <a
              href={reportService.getPayrollExportUrl()}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Export Payroll CSV</span>
            </a>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Process Monthly Payroll</span>
            </button>
          </div>
        )}
      </div>

      {isHRAdmin ? (
        /* HR / Admin View */
        <div className="space-y-6">
          {/* Payroll Batch Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {payrolls.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPayroll(p)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedPayroll?.id === p.id
                    ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">
                    Payroll {p.month.toString().padStart(2, '0')}/{p.year}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {p.status}
                  </span>
                </div>
                <p className="text-xl font-black text-slate-900 mt-2">
                  ${p.total_net_disbursed?.toLocaleString() || '0'}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{p.total_employees || 0} Staff Disbursed</span>
                  <span>{p.total_working_days} Work Days</span>
                </div>
              </div>
            ))}
          </div>

          {/* Breakdown Table for Selected Payroll */}
          {selectedPayroll && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Employee Breakdown for {String(selectedPayroll.month).padStart(2, '0')}/{selectedPayroll.year}
                  </h3>
                  <p className="text-xs text-slate-500">Present days, LWP deductions, and Net disbursed salaries</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Present / LWP</th>
                      <th className="py-3 px-4">Per-Day Rate</th>
                      <th className="py-3 px-4">LWP Deduction</th>
                      <th className="py-3 px-4">PF & Tax</th>
                      <th className="py-3 px-4">Net Salary</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPayroll.items?.map((item: PayrollItem) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {item.employee_name || item.employee_code}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{item.department_name || 'Engineering'}</td>
                        <td className="py-3.5 px-4 font-semibold">
                          <span className="text-emerald-700">{item.present_days}P</span> /{' '}
                          <span className="text-rose-600">{item.lwp_days} LWP</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">${item.per_day_rate.toFixed(2)}</td>
                        <td className="py-3.5 px-4 font-semibold text-rose-600">
                          -${item.lwp_deduction.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          -${(item.pf_deduction + item.tax_deduction).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                          ${item.net_salary.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => setSelectedPayslipForView(item)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Statement"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={payrollService.getPayslipDownloadUrl(item.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg inline-block transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Employee Self-Service View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900">My Monthly Salary Statements</h3>
            <p className="text-xs text-slate-500">Official ReportLab PDF payslips available for download</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Working Days</th>
                  <th className="py-3 px-4">Days Present</th>
                  <th className="py-3 px-4">LWP Deductions</th>
                  <th className="py-3 px-4">PF & Tax</th>
                  <th className="py-3 px-4">Net Disbursed</th>
                  <th className="py-3 px-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No payroll records processed yet.
                    </td>
                  </tr>
                ) : (
                  myRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {new Date(r.created_at).toLocaleDateString([], { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">{r.working_days} Days</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-semibold">{r.present_days} Days</td>
                      <td className="py-3.5 px-4 text-rose-600 font-semibold">-${r.lwp_deduction.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-600">-${(r.pf_deduction + r.tax_deduction).toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                        ${r.net_salary.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedPayslipForView(r)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                        >
                          View
                        </button>
                        <a
                          href={payrollService.getPayslipDownloadUrl(r.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold inline-flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showGenerateModal && (
        <GeneratePayrollModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onPayrollGenerated={loadData}
        />
      )}

      {selectedPayslipForView && (
        <PayslipViewerModal
          isOpen={!!selectedPayslipForView}
          onClose={() => setSelectedPayslipForView(null)}
          item={selectedPayslipForView}
        />
      )}
    </div>
  );
};
