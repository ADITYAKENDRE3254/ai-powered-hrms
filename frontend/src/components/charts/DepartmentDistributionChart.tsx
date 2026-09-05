import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Building2, ArrowUpRight } from 'lucide-react';

interface DepartmentDistributionChartProps {
  data?: { name: string; value: number; count: number; color: string }[];
}

const defaultDeptData = [
  { name: 'Engineering', value: 38, count: 475, color: '#2563EB' },
  { name: 'Sales & Ops', value: 24, count: 300, color: '#06B6D4' },
  { name: 'Finance', value: 15, count: 188, color: '#7C3AED' },
  { name: 'People & HR', value: 12, count: 150, color: '#10B981' },
  { name: 'Marketing', value: 11, count: 137, color: '#F59E0B' },
];

export const DepartmentDistributionChart: React.FC<DepartmentDistributionChartProps> = ({ data }) => {
  const navigate = useNavigate();
  const deptData = data || defaultDeptData;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-navy-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple-lg text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Headcount: <span className="font-bold text-slate-900 dark:text-white">{item.count} staff</span> ({item.value}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-navy-900 p-7 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/40">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Department Headcount Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cross-functional talent allocation across active business units
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/departments')}
          className="text-xs text-brand-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        {/* Donut Chart */}
        <div className="sm:col-span-5 h-48 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={deptData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {deptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">5</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Depts</span>
          </div>
        </div>

        {/* Horizontal Distribution Bars */}
        <div className="sm:col-span-7 space-y-2.5">
          {deptData.map((dept) => (
            <div
              key={dept.name}
              onClick={() => navigate('/departments')}
              className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                  <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors">
                    {dept.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{dept.count} staff</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{dept.value}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-navy-950 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${dept.value}%`, backgroundColor: dept.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
