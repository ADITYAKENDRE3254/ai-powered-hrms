import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { leaveService } from '../../services/leave.service';
import { LeaveType, LeaveRequest } from '../../types';
import { Calendar, AlertCircle, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeaveCreated?: (leave: LeaveRequest) => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose, onLeaveCreated }) => {
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute duration
  let duration = 0;
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e >= s) {
      duration = Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (duration <= 0) {
      setErrorMsg('End date must be on or after start date.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const leave = await leaveService.applyLeave({
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim(),
      });
      if (onLeaveCreated) onLeaveCreated(leave);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Leave"
      subtitle="Select dates and reason. Business workflow will auto-route your request."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Leave Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Type</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="CASUAL">Casual Leave (CL)</option>
            <option value="SICK">Sick Leave (SL)</option>
            <option value="EARNED">Earned Leave (EL)</option>
            <option value="UNPAID">Unpaid Leave (LWP)</option>
          </select>
        </div>

        {/* Start & End Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Dynamic Workflow Notice Banner */}
        {duration > 0 && (
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
              duration === 1
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : duration === 2
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-purple-50 border-purple-200 text-purple-900'
            }`}
          >
            {duration === 1 && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {duration === 2 && <UserCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
            {duration >= 3 && <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />}

            <div>
              <p className="font-bold">
                Duration: {duration} day{duration > 1 ? 's' : ''}
              </p>
              <p className="text-[11px] mt-0.5 opacity-90">
                {duration === 1 && '⚡ 1-Day Leave Rule: This request will be AUTO-APPROVED immediately.'}
                {duration === 2 && '👥 2-Day Leave Rule: This request will be routed to your Team Leader for approval.'}
                {duration >= 3 && '👔 3+ Day Leave Rule: This request will be routed to your Department Manager / HR.'}
              </p>
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            required
            placeholder="Please provide details for the leave request..."
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs transition-all flex items-center gap-1.5"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
