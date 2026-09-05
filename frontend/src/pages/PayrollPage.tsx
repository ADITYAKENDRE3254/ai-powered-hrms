import React, { useState, useEffect } from 'react';
import { payrollService } from '../services/payroll.service';
import { Payroll, PayrollItem } from '../types';
import { GeneratePayrollModal } from '../components/payroll/GeneratePayrollModal';
import { PayslipViewerModal } from '../components/payroll/PayslipViewerModal';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Download, Plus, Sparkles, FileText, Calendar, Users, Eye } from 'lucide-react';
import { reportService } from '../services/report.service';
import { PayrollAnalyticsChart } from '../components/charts/PayrollAnalyticsChart';

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
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Attendance-Based Payroll & Payslips
            </h1>
            <span className="ai-badge">✦ PDF Engine</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automatic LWP deduction formula: (Monthly Salary / Working Days) &times; LWP Days + ReportLab PDF generation.
          </p>
        </div>

        {isHRAdmin && (
          <div className="flex items-center gap-2.5">
            <a
              href={reportService.getPayrollExportUrl()}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-slate-900 dark:bg-navy-800 hover:bg-slate-800 dark:hover:bg-navy-700 text-white rounded-2xl text-xs font-bold shadow-apple border border-slate-700 dark:border-navy-700 transition-all flex items-center gap-2 shrink-0 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Payroll CSV</span>
            </a>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 text-white rounded-2xl text-xs font-bold shadow-apple-md transition-all flex items-center gap-2 shrink-0 hover:scale-[1.01] active:scale-[0.99]"
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
          {/* Payroll Financial Analytics Chart */}
          <PayrollAnalyticsChart />

          {/* Payroll Batch Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {payrolls.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPayroll(p)}
                className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                  selectedPayroll?.id === p.id
                    ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500/50 dark:border-brand-500/60 ring-2 ring-brand-500/20 shadow-apple-md'
                    : 'bg-white dark:bg-navy-900 border-slate-200/80 dark:border-navy-800 hover:border-slate-300 shadow-apple'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-950 dark:text-cyan-300">
                    Payroll {p.month.toString().padStart(2, '0')}/{p.year}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    {p.status}
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-2.5">
                  ${p.total_net_disbursed?.toLocaleString() || '0'}
                </p>
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{p.total_employees || 0} Staff Disbursed</span>
                  <span>{p.total_working_days} Work Days</span>
                </div>
              </div>
            ))}
          </div>

          {/* Breakdown Table for Selected Payroll */}
          {selectedPayroll && (
            <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple overflow-hidden transition-all">
              <div className="p-5 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between bg-slate-50/60 dark:bg-navy-950/60">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Employee Breakdown for {String(selectedPayroll.month).padStart(2, '0')}/{selectedPayroll.year}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Present days, LWP deductions, and Net disbursed salaries</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-navy-950/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-navy-800">
                    <tr>
                      <th className="py-3.5 px-5">Employee</th>
                      <th className="py-3.5 px-5">Department</th>
                      <th className="py-3.5 px-5">Present / LWP</th>
                      <th className="py-3.5 px-5">Per-Day Rate</th>
                      <th className="py-3.5 px-5">LWP Deduction</th>
                      <th className="py-3.5 px-5">PF & Tax</th>
                      <th className="py-3.5 px-5">Net Salary</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {selectedPayroll.items?.map((item: PayrollItem) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors"
                      >
                        <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                          {item.employee_name || item.employee_code}
                        </td>
                        <td className="py-4 px-5 text-slate-600 dark:text-slate-300">
                          {item.department_name || 'Engineering'}
                        </td>
                        <td className="py-4 px-5 font-semibold">
                          <span className="text-emerald-600 dark:text-emerald-400">{item.present_days}P</span> /{' '}
                          <span className="text-rose-600 dark:text-rose-400">{item.lwp_days} LWP</span>
                        </td>
                        <td className="py-4 px-5 text-slate-700 dark:text-slate-300">${item.per_day_rate.toFixed(2)}</td>
                        <td className="py-4 px-5 font-semibold text-rose-600 dark:text-rose-400">
                          -${item.lwp_deduction.toLocaleString()}
                        </td>
                        <td className="py-4 px-5 text-slate-600 dark:text-slate-400">
                          -${(item.pf_deduction + item.tax_deduction).toLocaleString()}
                        </td>
                        <td className="py-4 px-5 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          ${item.net_salary.toLocaleString()}
                        </td>
                        <td className="py-4 px-5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedPayslipForView(item)}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl transition-colors"
                            title="View Statement"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={payrollService.getPayslipDownloadUrl(item.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl inline-block transition-colors"
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
        <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple overflow-hidden transition-all">
          <div className="p-5 border-b border-slate-100 dark:border-navy-800 bg-slate-50/60 dark:bg-navy-950/60">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Monthly Salary Statements</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Official ReportLab PDF payslips available for download</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-navy-950/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-navy-800">
                <tr>
                  <th className="py-3.5 px-5">Period</th>
                  <th className="py-3.5 px-5">Working Days</th>
                  <th className="py-3.5 px-5">Days Present</th>
                  <th className="py-3.5 px-5">LWP Deductions</th>
                  <th className="py-3.5 px-5">PF & Tax</th>
                  <th className="py-3.5 px-5">Net Disbursed</th>
                  <th className="py-3.5 px-5 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {myRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <EmptyState
                        title="No Salary Records Found"
                        description="No payroll batches have been processed yet."
                      />
                    </td>
                  </tr>
                ) : (
                  myRecords.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors"
                    >
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                        {new Date(r.created_at).toLocaleDateString([], { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-5 font-semibold">{r.working_days} Days</td>
                      <td className="py-4 px-5 text-emerald-600 dark:text-emerald-400 font-semibold">{r.present_days} Days</td>
                      <td className="py-4 px-5 text-rose-600 dark:text-rose-400 font-semibold">-${r.lwp_deduction.toLocaleString()}</td>
                      <td className="py-4 px-5 text-slate-600 dark:text-slate-400">-${(r.pf_deduction + r.tax_deduction).toLocaleString()}</td>
                      <td className="py-4 px-5 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        ${r.net_salary.toLocaleString()}
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => setSelectedPayslipForView(r)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
                        >
                          View
                        </button>
                        <a
                          href={payrollService.getPayslipDownloadUrl(r.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold inline-flex items-center gap-1 shadow-xs transition-colors"
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
