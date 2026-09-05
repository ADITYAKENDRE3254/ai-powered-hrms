import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { Attendance } from '../types';
import { LiveGPSAttendanceCard } from '../components/attendance/LiveGPSAttendanceCard';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, MapPin, Download, Filter, Search, UserCheck, ShieldCheck } from 'lucide-react';
import { reportService } from '../services/report.service';

export const AttendancePage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isHRAdmin = hasRole('SUPER_ADMIN', 'HR_MANAGER');
  const isManagerOrLead = hasRole('DEPARTMENT_MANAGER', 'TEAM_LEADER');

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'team' | 'all'>(
    isHRAdmin ? 'all' : isManagerOrLead ? 'team' : 'my'
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      let data: Attendance[] = [];
      if (activeTab === 'my') {
        data = await attendanceService.getMyAttendance();
      } else if (activeTab === 'team') {
        data = await attendanceService.getTeamAttendance();
      } else {
        data = await attendanceService.getAllAttendance();
      }
      setAttendances(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Attendance & GPS Geofencing
            </h1>
            <span className="ai-badge">✦ Live Haversine</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time biometric & GPS verified check-in records with automated Haversine perimeter limit enforcement.
          </p>
        </div>

        {isHRAdmin && (
          <a
            href={reportService.getAttendanceExportUrl()}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-slate-900 dark:bg-navy-800 hover:bg-slate-800 dark:hover:bg-navy-700 text-white rounded-2xl text-xs font-bold shadow-apple border border-slate-700 dark:border-navy-700 transition-all flex items-center gap-2 shrink-0 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Attendance CSV</span>
          </a>
        )}
      </div>

      {/* Live GPS Attendance Card */}
      <LiveGPSAttendanceCard onAttendanceUpdated={loadData} />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-1">
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'my'
              ? 'border-brand-600 text-brand-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>My Attendance Records</span>
        </button>

        {(isManagerOrLead || isHRAdmin) && (
          <button
            onClick={() => setActiveTab('team')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'team'
                ? 'border-brand-600 text-brand-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Team & Department Log</span>
          </button>
        )}

        {isHRAdmin && (
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'border-brand-600 text-brand-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Company-Wide Master Audit</span>
          </button>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-navy-950/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-navy-800">
              <tr>
                <th className="py-3.5 px-5">Date</th>
                {activeTab !== 'my' && <th className="py-3.5 px-5">Employee</th>}
                <th className="py-3.5 px-5">Punch In</th>
                <th className="py-3.5 px-5">Punch Out</th>
                <th className="py-3.5 px-5">GPS Distance</th>
                <th className="py-3.5 px-5">Work Duration</th>
                <th className="py-3.5 px-5">Verification Status</th>
                <th className="py-3.5 px-5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan={activeTab !== 'my' ? 8 : 7} className="p-0">
                    <EmptyState
                      title="No Attendance Logs Found"
                      description="No records matched the selected filter or date range."
                    />
                  </td>
                </tr>
              ) : (
                attendances.map((att) => (
                  <tr
                    key={att.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors"
                  >
                    <td className="py-4 px-5 font-semibold text-slate-900 dark:text-white">{att.date}</td>
                    {activeTab !== 'my' && (
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                        {att.employee_name || att.employee_code}
                      </td>
                    )}
                    <td className="py-4 px-5 text-slate-700 dark:text-slate-300">
                      {att.punch_in
                        ? new Date(att.punch_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="py-4 px-5 text-slate-700 dark:text-slate-300">
                      {att.punch_out
                        ? new Date(att.punch_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-600 dark:text-slate-400">
                      {att.distance_in_meters !== null && att.distance_in_meters !== undefined
                        ? `${att.distance_in_meters.toFixed(1)}m`
                        : '-'}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                      {att.work_duration_hours > 0 ? `${att.work_duration_hours} hrs` : '-'}
                    </td>
                    <td className="py-4 px-5">
                      <Badge status={att.verification_status} />
                    </td>
                    <td className="py-4 px-5 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {att.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
