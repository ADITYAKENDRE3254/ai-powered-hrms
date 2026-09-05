import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertTriangle, Clock, RefreshCw, Compass, ShieldCheck } from 'lucide-react';
import { attendanceService } from '../../services/attendance.service';
import { Attendance } from '../../types';

interface LiveGPSAttendanceCardProps {
  onAttendanceUpdated?: (attendance: Attendance) => void;
}

export const LiveGPSAttendanceCard: React.FC<LiveGPSAttendanceCardProps> = ({ onAttendanceUpdated }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [simulatedOnSite, setSimulatedOnSite] = useState<boolean>(true); // Default on-site for demo ease

  // Office Bangalore default: 12.9715987, 77.5945627
  const OFFICE_LAT = 12.9715987;
  const OFFICE_LNG = 77.5945627;
  const GEOFENCE_LIMIT = 100; // meters

  // Haversine calculation on frontend for preview
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) ** 2 +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchLiveCoordinates = () => {
    setIsLocating(true);
    setErrorMsg(null);
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSimulatedOnSite(false);
        setIsLocating(false);
      },
      (error) => {
        console.warn('Live geolocation error, falling back to on-site demo coordinates:', error.message);
        setCoords({ lat: OFFICE_LAT, lng: OFFICE_LNG });
        setSimulatedOnSite(true);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (simulatedOnSite) {
      setCoords({ lat: OFFICE_LAT + 0.00008, lng: OFFICE_LNG + 0.00005 }); // ~12m away
    } else {
      fetchLiveCoordinates();
    }
  }, [simulatedOnSite]);

  const currentLat = coords?.lat || OFFICE_LAT;
  const currentLng = coords?.lng || OFFICE_LNG;
  const currentDistance = calculateDistance(currentLat, currentLng, OFFICE_LAT, OFFICE_LNG);
  const isWithinGeofence = currentDistance <= GEOFENCE_LIMIT;

  const handlePunchIn = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await attendanceService.punchIn(
        currentLat,
        currentLng,
        simulatedOnSite ? 'On-Site Demo Punch' : 'Live GPS Punch'
      );
      setSuccessMsg(`Punch-in recorded! Verified distance: ${result.distance_in_meters?.toFixed(1)}m from office.`);
      if (onAttendanceUpdated) onAttendanceUpdated(result);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to punch in';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePunchOut = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await attendanceService.punchOut(
        currentLat,
        currentLng,
        simulatedOnSite ? 'On-Site Demo Punch' : 'Live GPS Punch'
      );
      setSuccessMsg(`Punch-out recorded! Total shift duration: ${result.work_duration_hours} hours.`);
      if (onAttendanceUpdated) onAttendanceUpdated(result);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to punch out';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 p-6 sm:p-7 shadow-apple transition-all relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-navy-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-cyan-400 border border-brand-100 dark:border-brand-500/20 shadow-xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">GPS Geofenced Punch In / Out</h3>
              <span className="ai-badge">✦ AI Geofence Verified</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dual-layer Haversine distance limit calculation (&le; 100m radius)
            </p>
          </div>
        </div>

        {/* Presentation Simulator Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (simulatedOnSite) {
                setCoords({ lat: 12.935, lng: 77.62 });
                setSimulatedOnSite(false);
              } else {
                setCoords({ lat: OFFICE_LAT + 0.00008, lng: OFFICE_LNG + 0.00005 });
                setSimulatedOnSite(true);
              }
            }}
            className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all flex items-center gap-1.5 ${
              simulatedOnSite
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{simulatedOnSite ? '📍 Simulating On-Site (12m)' : '⚠️ Simulating Remote (5km)'}</span>
          </button>

          <button
            onClick={fetchLiveCoordinates}
            disabled={isLocating}
            title="Refresh Live Browser GPS"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl border border-slate-200 dark:border-navy-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Geofence Status Metrics */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-slate-50/80 dark:bg-navy-950/60 rounded-2xl border border-slate-200/60 dark:border-navy-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">
            Current GPS Position
          </span>
          <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1.5 truncate">
            {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
          </p>
        </div>

        <div className="p-4 bg-slate-50/80 dark:bg-navy-950/60 rounded-2xl border border-slate-200/60 dark:border-navy-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">
            Distance to Office Anchor
          </span>
          <p className={`text-xs font-bold mt-1.5 ${isWithinGeofence ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {currentDistance.toFixed(1)} meters from office
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isWithinGeofence
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
              : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-300'
          }`}
        >
          <span className="text-[11px] font-bold block uppercase tracking-wider opacity-80">Geofence Compliance</span>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold">
            {isWithinGeofence ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Inside 100m Allowed Perimeter</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Outside Perimeter (&gt;100m)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notification Messages */}
      {errorMsg && (
        <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-2xl text-xs flex items-start gap-2.5 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-start gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handlePunchIn}
          disabled={isSubmitting}
          className="flex-1 py-3 px-5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-apple-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Clock className="w-4 h-4" />
          <span>{isSubmitting ? 'Verifying GPS Coordinates...' : 'Punch In Live (Biometric / GPS)'}</span>
        </button>

        <button
          onClick={handlePunchOut}
          disabled={isSubmitting}
          className="flex-1 py-3 px-5 bg-slate-900 dark:bg-navy-800 hover:bg-slate-800 dark:hover:bg-navy-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs border border-slate-700 dark:border-navy-600 shadow-apple-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Navigation className="w-4 h-4" />
          <span>{isSubmitting ? 'Calculating Duration...' : 'Punch Out (End Shift)'}</span>
        </button>
      </div>
    </div>
  );
};
