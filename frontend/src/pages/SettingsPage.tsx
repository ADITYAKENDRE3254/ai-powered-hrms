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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Office & GPS Geofence Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure office GPS coordinates, maximum punch-in distance radius, and daily operating shifts.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        {/* GPS Geofence Section */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">GPS Geofence Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Office Latitude</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                required
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Office Longitude</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                required
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Geofence Radius Limit (Meters)
            </label>
            <input
              type="number"
              min="10"
              max="5000"
              value={geofenceRadius}
              onChange={(e) => setGeofenceRadius(Number(e.target.value))}
              required
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Standard requirement: 100 meters. Punches &gt; 100m will be rejected and flagged in audit trail.
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Office Address</label>
            <input
              type="text"
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Operating Hours Section */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Standard Operating Shift</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Shift Start</label>
              <input
                type="time"
                value={workStartTime}
                onChange={(e) => setWorkStartTime(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Shift End</label>
              <input
                type="time"
                value={workEndTime}
                onChange={(e) => setWorkEndTime(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
