import api from './api';
import { AuditLog, OfficeSetting } from '../types';

export const reportService = {
  async getDashboardSummary() {
    const response = await api.get('/reports/summary');
    return response.data;
  },

  getAttendanceExportUrl(): string {
    return '/api/reports/attendance/export';
  },

  getPayrollExportUrl(): string {
    return '/api/reports/payroll/export';
  }
};

export const auditService = {
  async getAuditLogs(params?: { module?: string; action?: string; limit?: number }): Promise<AuditLog[]> {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  }
};

export const settingService = {
  async getOfficeSettings(): Promise<OfficeSetting> {
    const response = await api.get('/settings/office');
    return response.data;
  },

  async updateOfficeSettings(data: Partial<OfficeSetting>): Promise<OfficeSetting> {
    const response = await api.put('/settings/office', data);
    return response.data;
  }
};
