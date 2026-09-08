import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Briefcase, Info } from 'lucide-react';
import { PositionSalaryMetric } from '../../types';

interface PositionSalaryBandChartProps {
  metrics: PositionSalaryMetric[];
}

export const PositionSalaryBandChart: React.FC<PositionSalaryBandChartProps> = ({ metrics }) => {
  const formatRupee = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  return (
    <div className="bg-white dark:bg-navy-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-100 dark:border-cyan-900/40 shadow-xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Position Salary Benchmark Bands
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configured minimum, recommended anchor, and maximum boundaries vs actual employee averages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-navy-950 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-navy-800">
          <Info className="w-3.5 h-3.5 text-brand-500" />
          <span>{metrics.length} Defined Position Benchmarks</span>
        </div>
      </div>

      {metrics.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
          <Briefcase className="w-8 h-8 mb-2 opacity-40" />
          <p>No position salary rules configured yet.</p>
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metrics}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.15} />
              <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatRupee} />
              <YAxis
                type="category"
                dataKey="position_title"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as PositionSalaryMetric;
                    return (
                      <div className="bg-white dark:bg-navy-800 p-3 rounded-xl border border-slate-200 dark:border-navy-700 shadow-xl text-xs space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-700 pb-1">
                          {data.position_title} <span className="text-slate-400 font-normal">({data.department})</span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Min Band: <span className="font-medium text-slate-500">₹{data.min_salary.toLocaleString('en-IN')}</span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Recommended: <span className="font-bold text-cyan-600 dark:text-cyan-400">₹{data.recommended_salary.toLocaleString('en-IN')}</span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Max Band: <span className="font-medium text-purple-600 dark:text-purple-400">₹{data.max_salary.toLocaleString('en-IN')}</span>
                        </p>
                        <p className="text-slate-600 dark:text-slate-300">
                          Actual Avg: <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{data.avg_actual_salary.toLocaleString('en-IN')}</span>
                        </p>
                        <p className="text-slate-500">
                          Active Count: <span className="font-semibold">{data.employee_count}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="min_salary" name="Min Band" fill="#94A3B8" radius={[0, 4, 4, 0]} maxBarSize={18} />
              <Bar dataKey="recommended_salary" name="Recommended Anchor" fill="#06B6D4" radius={[0, 4, 4, 0]} maxBarSize={18} />
              <Bar dataKey="avg_actual_salary" name="Actual Avg" fill="#10B981" radius={[0, 4, 4, 0]} maxBarSize={18} />
              <Bar dataKey="max_salary" name="Max Band" fill="#8B5CF6" radius={[0, 4, 4, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
