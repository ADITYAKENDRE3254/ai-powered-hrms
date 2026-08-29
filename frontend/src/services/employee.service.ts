import api from './api';
import { Employee, EmploymentStatus } from '../types';

export interface EmployeeFilters {
  department_id?: number;
  team_id?: number;
  status?: EmploymentStatus;
  search?: string;
  skip?: number;
  limit?: number;
}

export const employeeService = {
  async getEmployees(params?: EmployeeFilters): Promise<{ total: number; items: Employee[] }> {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  async getMyProfile(): Promise<Employee> {
    const response = await api.get('/employees/my/profile');
    return response.data;
  },

  async getEmployeeById(id: number): Promise<Employee> {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  async createEmployee(data: Partial<Employee> & { password?: string }): Promise<Employee> {
    const response = await api.post('/employees', data);
    return response.data;
  },

  async updateEmployee(id: number, data: Partial<Employee>): Promise<Employee> {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  async deleteEmployee(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};
