import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Clock, Calendar } from 'lucide-react';

interface AttendanceTrendChartProps {
  data?: any[];
}

const defaultTrendData = {
  '7d': [
    { day: 'Mon', present: 94, late: 4, absent: 2, leave: 3 },
    { day: 'Tue', present: 96, late: 2, absent: 2, leave: 3 },
    { day: 'Wed', present: 98, late: 1, absent: 1, leave: 4 },
    { day: 'Thu', present: 95, late: 3, absent: 2, leave: 4 },
    { day: 'Fri', present: 92, late: 5, absent: 3, leave: 5 },
    { day: 'Sat', present: 45, late: 2, absent: 1, leave: 2 },
    { day: 'Sun', present: 42, late: 1, absent: 0, leave: 1 },
  ],
  '30d': [
    { day: 'Week 1', present: 95, late: 3, absent: 2, leave: 4 },
    { day: 'Week 2', present: 97, late: 2, absent: 1, leave: 3 },
    { day: 'Week 3', present: 94, late: 4, absent: 2, leave: 5 },
    { day: 'Week 4', present: 96, late: 3, absent: 1, leave: 4 },
  ],
  '90d': [
    { day: 'Month 1', present: 94, late: 4, absent: 2, leave: 4 },
    { day: 'Month 2', present: 96, late: 3, absent: 1, leave: 3 },
    { day: 'Month 3', present: 97, late: 2, absent: 1, leave: 4 },
  ]
};

export const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({ data }) => {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');

  const chartData = data || defaultTrendData[range];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-navy-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple-lg text-xs">
          <p className="font-bold text-slate-900 dark:text-white mb-2">{label} Attendance</p>
          <div className="space-y-1.5">
            {payload.map((entry: any) => (
              <div key={entry.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-500 dark:text-slate-400 capitalize">{entry.name}:</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-100 dark:border-cyan-900/40">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Attendance Stability & Punctuality
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              GPS verified check-in rates, lateness, and leave percentages
            </p>
          </div>
        </div>

        <div className="flex items-center p-1 bg-slate-100 dark:bg-navy-950 rounded-xl">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                range === r
                  ? 'bg-white dark:bg-navy-800 text-brand-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              domain={[0, 100]}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 12 }}
            />
            <Line
              type="monotone"
              dataKey="present"
              name="Present"
              stroke="#06B6D4"
              strokeWidth={3}
              dot={{ r: 4, fill: '#06B6D4' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="late"
              name="Late"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 3, fill: '#F59E0B' }}
            />
            <Line
              type="monotone"
              dataKey="leave"
              name="On Leave"
              stroke="#7C3AED"
              strokeWidth={2}
              dot={{ r: 3, fill: '#7C3AED' }}
            />
            <Line
              type="monotone"
              dataKey="absent"
              name="Absent"
              stroke="#F43F5E"
              strokeWidth={2}
              dot={{ r: 3, fill: '#F43F5E' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
