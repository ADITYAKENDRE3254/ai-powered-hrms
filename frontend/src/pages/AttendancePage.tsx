import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance.service';
import { Attendance } from '../types';
import { LiveGPSAttendanceCard } from '../components/attendance/LiveGPSAttendanceCard';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, MapPin, Download, Filter, Search } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Attendance & GPS Geofencing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time biometric & GPS verified records with Haversine distance limit calculation.
          </p>
        </div>

        {isHRAdmin && (
          <a
            href={reportService.getAttendanceExportUrl()}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Attendance CSV</span>
          </a>
        )}
      </div>

      {/* Live GPS Attendance Card */}
      <LiveGPSAttendanceCard onAttendanceUpdated={loadData} />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'my'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Attendance Records
        </button>

        {(isManagerOrLead || isHRAdmin) && (
          <button
            onClick={() => setActiveTab('team')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'team'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Team & Department Records
          </button>
        )}

        {isHRAdmin && (
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'all'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Company-Wide Log
          </button>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                {activeTab !== 'my' && <th className="py-3 px-4">Employee</th>}
                <th className="py-3 px-4">Punch In</th>
                <th className="py-3 px-4">Punch Out</th>
                <th className="py-3 px-4">GPS Distance</th>
                <th className="py-3 px-4">Work Duration</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan={activeTab !== 'my' ? 8 : 7} className="py-12 text-center text-slate-400">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendances.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{att.date}</td>
                    {activeTab !== 'my' && (
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {att.employee_name || att.employee_code}
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-slate-700">
                      {att.punch_in ? new Date(att.punch_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {att.punch_out ? new Date(att.punch_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {att.distance_in_meters !== null && att.distance_in_meters !== undefined ? `${att.distance_in_meters.toFixed(1)}m` : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {att.work_duration_hours > 0 ? `${att.work_duration_hours} hrs` : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={att.verification_status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{att.notes || '-'}</td>
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
