import api from './api';
import { Department, Team } from '../types';

export const departmentService = {
  async getDepartments(): Promise<Department[]> {
    const response = await api.get('/departments');
    return response.data;
  },

  async createDepartment(data: { name: string; code: string; description?: string; manager_id?: number }): Promise<Department> {
    const response = await api.post('/departments', data);
    return response.data;
  },

  async updateDepartment(id: number, data: Partial<Department>): Promise<Department> {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  async getTeams(departmentId?: number): Promise<Team[]> {
    const response = await api.get('/teams', { params: { department_id: departmentId } });
    return response.data;
  },

  async createTeam(data: { name: string; department_id: number; team_leader_id?: number }): Promise<Team> {
    const response = await api.post('/teams', data);
    return response.data;
  },

  async updateTeam(id: number, data: Partial<Team>): Promise<Team> {
    const response = await api.put(`/teams/${id}`, data);
    return response.data;
  }
};
