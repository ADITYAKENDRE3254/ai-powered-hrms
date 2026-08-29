import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
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
        // Fallback to demo on-site
        setCoords({ lat: OFFICE_LAT, lng: OFFICE_LNG });
        setSimulatedOnSite(true);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    // Initial coordinate acquisition
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
      const result = await attendanceService.punchIn(currentLat, currentLng, simulatedOnSite ? 'On-Site Demo Punch' : 'Live GPS Punch');
      setSuccessMsg(`Punch-in successful! Distance: ${result.distance_in_meters?.toFixed(1)}m from office.`);
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
      const result = await attendanceService.punchOut(currentLat, currentLng, simulatedOnSite ? 'On-Site Demo Punch' : 'Live GPS Punch');
      setSuccessMsg(`Punch-out successful! Total work duration: ${result.work_duration_hours} hours.`);
      if (onAttendanceUpdated) onAttendanceUpdated(result);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to punch out';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">GPS Geofenced Punch In / Out</h3>
            <p className="text-xs text-slate-500">Dual-layer Haversine distance verification (&le; 100m)</p>
          </div>
        </div>

        {/* Demo Location Simulator Toggle for College Presentation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (simulatedOnSite) {
                // Switch to outside (5 km away)
                setCoords({ lat: 12.935000, lng: 77.620000 });
                setSimulatedOnSite(false);
              } else {
                // Switch to inside (~12m away)
                setCoords({ lat: OFFICE_LAT + 0.00008, lng: OFFICE_LNG + 0.00005 });
                setSimulatedOnSite(true);
              }
            }}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
              simulatedOnSite
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            {simulatedOnSite ? '📍 Simulating On-Site (12m)' : '⚠️ Simulating Remote (5km)'}
          </button>

          <button
            onClick={fetchLiveCoordinates}
            disabled={isLocating}
            title="Refresh Live Browser GPS"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Geofence Status Meter */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
          <span className="text-[11px] text-slate-500 font-semibold block uppercase">Your GPS Location</span>
          <p className="text-xs font-mono font-bold text-slate-800 mt-1 truncate">
            {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
          <span className="text-[11px] text-slate-500 font-semibold block uppercase">Distance to Office</span>
          <p className={`text-xs font-bold mt-1 ${isWithinGeofence ? 'text-emerald-600' : 'text-rose-600'}`}>
            {currentDistance.toFixed(1)} meters
          </p>
        </div>

        <div className={`p-3.5 rounded-xl border ${isWithinGeofence ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' : 'bg-rose-50/60 border-rose-200 text-rose-800'}`}>
          <span className="text-[11px] font-semibold block uppercase">Geofence Status</span>
          <div className="flex items-center gap-1.5 mt-1 text-xs font-bold">
            {isWithinGeofence ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Inside 100m Geofence</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Outside Limit (&gt;100m)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-5 flex gap-3">
        <button
          onClick={handlePunchIn}
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-sm shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
        >
          <Clock className="w-4 h-4" />
          <span>{isSubmitting ? 'Verifying GPS...' : 'Punch In Live'}</span>
        </button>

        <button
          onClick={handlePunchOut}
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-sm shadow-slate-900/20 flex items-center justify-center gap-2 transition-all"
        >
          <Navigation className="w-4 h-4" />
          <span>{isSubmitting ? 'Recording...' : 'Punch Out'}</span>
        </button>
      </div>
    </div>
  );
};
