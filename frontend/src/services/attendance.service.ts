import api from './api';
import { Attendance } from '../types';

export const attendanceService = {
  async punchIn(latitude: number, longitude: number, notes?: string): Promise<Attendance> {
    const response = await api.post('/attendance/punch-in', { latitude, longitude, notes });
    return response.data;
  },

  async punchOut(latitude: number, longitude: number, notes?: string): Promise<Attendance> {
    const response = await api.post('/attendance/punch-out', { latitude, longitude, notes });
    return response.data;
  },

  async getMyAttendance(month?: number, year?: number): Promise<Attendance[]> {
    const response = await api.get('/attendance/my', { params: { month, year } });
    return response.data;
  },

  async getTeamAttendance(targetDate?: string): Promise<Attendance[]> {
    const response = await api.get('/attendance/team', { params: { target_date: targetDate } });
    return response.data;
  },

  async getAllAttendance(params?: { start_date?: string; end_date?: string; department_id?: number }): Promise<Attendance[]> {
    const response = await api.get('/attendance/all', { params });
    return response.data;
  }
};
