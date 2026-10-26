import api from './api';
import { Payroll, PayrollItem } from '../types';

export const payrollService = {
  async getPayrolls(): Promise<Payroll[]> {
    const response = await api.get('/payroll');
    return response.data;
  },

  async getPayrollById(id: number): Promise<Payroll> {
    const response = await api.get(`/payroll/${id}`);
    return response.data;
  },

  async generatePayroll(data: { month: number; year: number; total_working_days?: number; notes?: string }): Promise<Payroll> {
    const response = await api.post('/payroll/generate', data);
    return response.data;
  },

  async getMyPayrollRecords(): Promise<PayrollItem[]> {
    const response = await api.get('/payroll/my');
    return response.data;
  },

  async getPayslipById(id: number): Promise<PayrollItem> {
    const response = await api.get(`/payslips/${id}`);
    return response.data;
  },

  /** Downloads payslip PDF via authenticated Axios request (JWT token sent in header) */
  async downloadPayslipPdf(id: number, filename?: string): Promise<void> {
    const response = await api.get(`/payslips/${id}/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename || `payslip_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};
