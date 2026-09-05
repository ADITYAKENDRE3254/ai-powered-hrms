import React, { useState, useEffect } from 'react';
import { settingService } from '../services/report.service';
import { OfficeSetting } from '../types';
import { Settings, MapPin, Shield, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<OfficeSetting | null>(null);
  const [latitude, setLatitude] = useState<number>(12.9715987);
  const [longitude, setLongitude] = useState<number>(77.5945627);
  const [geofenceRadius, setGeofenceRadius] = useState<number>(100.0);
  const [officeAddress, setOfficeAddress] = useState<string>('MG Road Tech Park, Bangalore, India');
  const [workStartTime, setWorkStartTime] = useState<string>('09:00');
  const [workEndTime, setWorkEndTime] = useState<string>('18:00');

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await settingService.getOfficeSettings();
      setSettings(data);
      setLatitude(data.latitude);
      setLongitude(data.longitude);
      setGeofenceRadius(data.geofence_radius_meters ?? data.geofence_radius ?? 100.0);
      setOfficeAddress(data.office_address || '');
      setWorkStartTime(data.work_start_time || '09:00');
      setWorkEndTime(data.work_end_time || '18:00');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const updated = await settingService.updateOfficeSettings({
        latitude: Number(latitude),
        longitude: Number(longitude),
        geofence_radius_meters: Number(geofenceRadius),
        office_address: officeAddress,
        work_start_time: workStartTime,
        work_end_time: workEndTime,
      });
      setSettings(updated);
      setSuccessMsg('Office geofence and work timing parameters successfully saved!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update system settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-7 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Office & GPS Geofence Settings
          </h1>
          <span className="ai-badge">✦ Geofence Engine</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure office GPS anchor coordinates, maximum punch-in distance radius, and daily operating shifts.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 p-6 sm:p-8 shadow-apple space-y-7 transition-all"
      >
        {/* GPS Geofence Section */}
        <div>
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-cyan-400 border border-brand-100 dark:border-brand-800/60">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">GPS Geofence Parameters</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Anchor coordinates for Haversine distance verification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Office Latitude</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                required
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Office Longitude</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                required
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Geofence Radius Limit (Meters)
            </label>
            <input
              type="number"
              min="10"
              max="5000"
              value={geofenceRadius}
              onChange={(e) => setGeofenceRadius(Number(e.target.value))}
              required
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Standard requirement: 100 meters. Check-ins &gt; 100m will be recorded with distance warnings and flagged in the audit trail.
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Office Address</label>
            <input
              type="text"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Operating Hours Section */}
        <div>
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/60">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Standard Shift Hours</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Regular working hours for attendance tracking</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Work Shift Start</label>
              <input
                type="time"
                value={workStartTime}
                onChange={(e) => setWorkStartTime(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Work Shift End</label>
              <input
                type="time"
                value={workEndTime}
                onChange={(e) => setWorkEndTime(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-navy-800">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-apple-md transition-all flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
