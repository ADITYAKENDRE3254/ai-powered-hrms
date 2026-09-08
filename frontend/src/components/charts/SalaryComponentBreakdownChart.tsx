import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { EmployeeSalary } from '../../types';

interface SalaryComponentBreakdownChartProps {
  salary: EmployeeSalary | {
    gross_salary: number;
    basic_salary: number;
    hra: number;
    transport_allowance: number;
    medical_allowance: number;
    other_allowances: number;
    bonus: number;
    pf_deduction: number;
    tax_deduction: number;
    professional_tax: number;
    other_deductions: number;
    total_deductions: number;
    net_salary: number;
  };
}

export const SalaryComponentBreakdownChart: React.FC<SalaryComponentBreakdownChartProps> = ({ salary }) => {
  const earningsData = [
    { name: 'Basic Salary', value: salary.basic_salary, color: '#0284C7' },
    { name: 'HRA', value: salary.hra, color: '#06B6D4' },
    { name: 'Transport', value: salary.transport_allowance, color: '#38BDF8' },
    { name: 'Medical', value: salary.medical_allowance, color: '#818CF8' },
    { name: 'Other Allowances', value: salary.other_allowances, color: '#8B5CF6' },
    { name: 'Bonus', value: salary.bonus, color: '#10B981' },
  ].filter(d => d.value > 0);

  const deductionsData = [
    { name: 'PF (Provident Fund)', value: salary.pf_deduction, color: '#EF4444' },
    { name: 'Income Tax (TDS)', value: salary.tax_deduction, color: '#F97316' },
    { name: 'Professional Tax', value: salary.professional_tax, color: '#F59E0B' },
    { name: 'Other Deductions', value: salary.other_deductions, color: '#64748B' },
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Earnings Breakdown */}
      <div className="bg-slate-50 dark:bg-navy-950/70 p-5 rounded-2xl border border-slate-200/70 dark:border-navy-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Earnings Composition</span>
          <span className="text-sm font-bold text-brand-600 dark:text-cyan-400">₹{salary.gross_salary.toLocaleString('en-IN')} Gross</span>
        </div>

        <div className="h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={earningsData}
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {earningsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    const val = Number(data.value);
                    const pct = salary.gross_salary > 0 ? ((val / salary.gross_salary) * 100).toFixed(1) : '0';
                    return (
                      <div className="bg-white dark:bg-navy-800 p-2.5 rounded-xl border border-slate-200 dark:border-navy-700 shadow-xl text-xs space-y-0.5">
                        <p className="font-bold text-slate-900 dark:text-white">{data.name}</p>
                        <p className="text-brand-600 dark:text-cyan-400 font-semibold">₹{val.toLocaleString('en-IN')} ({pct}%)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1.5 mt-2">
          {earningsData.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">₹{item.value.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deductions & Net Take-Home */}
      <div className="bg-slate-50 dark:bg-navy-950/70 p-5 rounded-2xl border border-slate-200/70 dark:border-navy-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Deductions</span>
            <span className="text-sm font-bold text-rose-500">₹{salary.total_deductions.toLocaleString('en-IN')} Total</span>
          </div>

          <div className="space-y-2 mt-2">
            {deductionsData.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No statutory deductions recorded.</p>
            ) : (
              deductionsData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-navy-900/80 border border-slate-200/50 dark:border-navy-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="font-semibold text-rose-500">-₹{item.value.toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Net Take-Home Callout */}
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/50">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 block">Monthly Net Take-Home</span>
              <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Gross minus all tax & PF deductions</span>
            </div>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{salary.net_salary.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
