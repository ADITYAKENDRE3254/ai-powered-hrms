import api from './api';
import { LeaveRequest, LeaveBalance, LeaveType } from '../types';

export const leaveService = {
  async applyLeave(data: { leave_type: LeaveType; start_date: string; end_date: string; reason: string }): Promise<LeaveRequest> {
    const response = await api.post('/leaves', data);
    return response.data;
  },

  async getMyLeaves(): Promise<LeaveRequest[]> {
    const response = await api.get('/leaves/my');
    return response.data;
  },

  async getMyLeaveBalance(): Promise<LeaveBalance> {
    const response = await api.get('/leaves/my/balance');
    return response.data;
  },

  async getPendingLeaves(): Promise<LeaveRequest[]> {
    const response = await api.get('/leaves/pending');
    return response.data;
  },

  async getAllLeaves(status?: string): Promise<LeaveRequest[]> {
    const response = await api.get('/leaves/all', { params: { status } });
    return response.data;
  },

  async approveLeave(id: number): Promise<LeaveRequest> {
    const response = await api.put(`/leaves/${id}/approve`);
    return response.data;
  },

  async rejectLeave(id: number, rejectionReason?: string): Promise<LeaveRequest> {
    const response = await api.put(`/leaves/${id}/reject`, { rejection_reason: rejectionReason });
    return response.data;
  }
};
