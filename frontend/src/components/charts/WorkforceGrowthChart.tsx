import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Users, TrendingUp } from 'lucide-react';

interface WorkforceGrowthChartProps {
  data?: { date: string; count: number; hires: number }[];
}

const defaultData = {
  monthly: [
    { date: 'Jan', count: 1040, hires: 18 },
    { date: 'Feb', count: 1085, hires: 22 },
    { date: 'Mar', count: 1120, hires: 15 },
    { date: 'Apr', count: 1165, hires: 28 },
    { date: 'May', count: 1210, hires: 24 },
    { date: 'Jun', count: 1250, hires: 20 },
  ],
  quarterly: [
    { date: 'Q1', count: 1040, hires: 48 },
    { date: 'Q2', count: 1120, hires: 55 },
    { date: 'Q3', count: 1195, hires: 62 },
    { date: 'Q4', count: 1250, hires: 45 },
  ],
  yearly: [
    { date: '2023', count: 850, hires: 180 },
    { date: '2024', count: 1020, hires: 210 },
    { date: '2025', count: 1160, hires: 195 },
    { date: '2026', count: 1250, hires: 140 },
  ]
};

export const WorkforceGrowthChart: React.FC<WorkforceGrowthChartProps> = ({ data }) => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  const chartData = data || defaultData[timeframe];
  const latestCount = chartData[chartData.length - 1]?.count || 1250;
  const initialCount = chartData[0]?.count || 1040;
  const growthRate = Math.round(((latestCount - initialCount) / initialCount) * 100);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-navy-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple-lg text-xs">
          <p className="font-bold text-slate-900 dark:text-white mb-1.5">{label} Snapshot</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
              <span className="text-slate-500 dark:text-slate-400">Total Headcount:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{payload[0].value.toLocaleString()}</span>
            </div>
            {payload[0].payload.hires && (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span className="text-slate-500 dark:text-slate-400">New Onboarded:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">+{payload[0].payload.hires}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-cyan-400 flex items-center justify-center border border-brand-100 dark:border-brand-900/40">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Workforce Growth Overview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active employee headcount expansion and hiring velocity
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{growthRate}% Growth</span>
          </div>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-navy-950 rounded-xl">
            {(['monthly', 'quarterly', 'yearly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  timeframe === t
                    ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              domain={['dataMin - 50', 'dataMax + 50']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#2563EB"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#growthGradient)"
              activeDot={{ r: 6, fill: '#06B6D4', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
