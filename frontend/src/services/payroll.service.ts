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

  getPayslipDownloadUrl(id: number): string {
    return `/api/payslips/${id}/download`;
  }
};
