import api from './api';
import {
  DepartmentSalaryRule,
  PositionSalaryRule,
  EmployeeSalary,
  EmployeeCompensationSummary,
  SalaryHistory,
  AISalaryRecommendation,
  AISalaryRecommendationRequest,
  CompensationDashboardData,
  SalaryApprovalStatus,
  SalaryType
} from '../types';

export const compensationService = {
  // Executive Dashboard Analytics
  getDashboardAnalytics: async (): Promise<CompensationDashboardData> => {
    const response = await api.get<CompensationDashboardData>('/compensation/dashboard');
    return response.data;
  },

  // Department Salary Rules
  getDepartmentRules: async (): Promise<DepartmentSalaryRule[]> => {
    const response = await api.get<DepartmentSalaryRule[]>('/compensation/departments');
    return response.data;
  },

  createOrUpdateDepartmentRule: async (data: {
    department_id: number;
    min_salary: number;
    max_salary: number;
    currency?: string;
    effective_date?: string;
    is_active?: boolean;
    notes?: string;
  }): Promise<DepartmentSalaryRule> => {
    const response = await api.post<DepartmentSalaryRule>('/compensation/departments', data);
    return response.data;
  },

  deleteDepartmentRule: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/compensation/departments/${id}`);
    return response.data;
  },

  // Position Salary Rules
  getPositionRules: async (departmentId?: number): Promise<PositionSalaryRule[]> => {
    const params = departmentId ? { department_id: departmentId } : {};
    const response = await api.get<PositionSalaryRule[]>('/compensation/positions', { params });
    return response.data;
  },

  createOrUpdatePositionRule: async (data: {
    department_id?: number | null;
    position_title: string;
    min_salary: number;
    max_salary: number;
    default_salary: number;
    salary_type?: SalaryType;
    effective_date?: string;
    is_active?: boolean;
    notes?: string;
  }): Promise<PositionSalaryRule> => {
    const response = await api.post<PositionSalaryRule>('/compensation/positions', data);
    return response.data;
  },

  deletePositionRule: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/compensation/positions/${id}`);
    return response.data;
  },

  // Employee Compensation Summaries & Structure
  getEmployeeSummaries: async (departmentId?: number): Promise<EmployeeCompensationSummary[]> => {
    const params = departmentId ? { department_id: departmentId } : {};
    const response = await api.get<EmployeeCompensationSummary[]>('/compensation/employees', { params });
    return response.data;
  },

  getEmployeeSalaryDetails: async (employeeId: number): Promise<EmployeeSalary> => {
    const response = await api.get<EmployeeSalary>(`/compensation/employees/${employeeId}`);
    return response.data;
  },

  configureEmployeeSalary: async (
    employeeId: number,
    data: {
      employee_id: number;
      gross_salary: number;
      basic_salary?: number;
      hra?: number;
      transport_allowance?: number;
      medical_allowance?: number;
      other_allowances?: number;
      bonus?: number;
      pf_deduction?: number;
      tax_deduction?: number;
      professional_tax?: number;
      other_deductions?: number;
      salary_type?: SalaryType;
      effective_date?: string;
      reason?: string;
    }
  ): Promise<EmployeeSalary> => {
    const response = await api.post<EmployeeSalary>(`/compensation/employees/${employeeId}`, data);
    return response.data;
  },

  // Approvals Workflow
  getApprovals: async (statusFilter?: SalaryApprovalStatus): Promise<EmployeeSalary[]> => {
    const params = statusFilter ? { status_filter: statusFilter } : {};
    const response = await api.get<EmployeeSalary[]>('/compensation/approvals', { params });
    return response.data;
  },

  processApproval: async (
    salaryId: number,
    data: { approved: boolean; rejection_reason?: string; notes?: string }
  ): Promise<EmployeeSalary> => {
    const response = await api.post<EmployeeSalary>(`/compensation/approvals/${salaryId}`, data);
    return response.data;
  },

  // Salary History
  getEmployeeSalaryHistory: async (employeeId: number): Promise<SalaryHistory[]> => {
    const response = await api.get<SalaryHistory[]>(`/compensation/employees/${employeeId}/history`);
    return response.data;
  },

  // AI Salary Recommendation
  getAISalaryRecommendation: async (
    params: AISalaryRecommendationRequest
  ): Promise<AISalaryRecommendation> => {
    const response = await api.post<AISalaryRecommendation>('/compensation/ai-recommendation', params);
    return response.data;
  },

  // Employee Self-Service
  getMySalary: async (): Promise<EmployeeSalary> => {
    const response = await api.get<EmployeeSalary>('/compensation/my-salary');
    return response.data;
  },
};
export default compensationService;
