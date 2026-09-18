import api from './api';
import { AuditLog, OfficeSetting } from '../types';

const downloadBlob = async (url: string, filename: string) => {
  const response = await api.get(url, {
    responseType: 'blob',
  });
  
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

export const reportService = {
  async getDashboardSummary() {
    const response = await api.get('/reports/summary');
    return response.data;
  },

  async downloadAttendanceReport(): Promise<void> {
    await downloadBlob('/reports/attendance/export', `attendance_audit_${new Date().toISOString().split('T')[0]}.csv`);
  },

  async downloadPayrollReport(): Promise<void> {
    await downloadBlob('/reports/payroll/export', `payroll_ledger_${new Date().toISOString().split('T')[0]}.csv`);
  },

  async downloadTalentPipelineReport(): Promise<void> {
    await downloadBlob('/reports/candidates/export', `talent_pipeline_${new Date().toISOString().split('T')[0]}.csv`);
  },

  async downloadAuditReport(): Promise<void> {
    await downloadBlob('/reports/audit/export', `security_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
  },

  async downloadExecutiveReport(): Promise<void> {
    await downloadBlob('/reports/executive-summary/export', `executive_operations_summary_${new Date().toISOString().split('T')[0]}.csv`);
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
