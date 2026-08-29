import api from './api';
import { Job, Candidate, CandidateStatus } from '../types';

export const recruitmentService = {
  async getJobs(status?: string, departmentId?: number): Promise<Job[]> {
    const response = await api.get('/recruitment/jobs', { params: { status, department_id: departmentId } });
    return response.data;
  },

  async getJobById(id: number): Promise<Job> {
    const response = await api.get(`/recruitment/jobs/${id}`);
    return response.data;
  },

  async createJob(data: Partial<Job>): Promise<Job> {
    const response = await api.post('/recruitment/jobs', data);
    return response.data;
  },

  async updateJob(id: number, data: Partial<Job>): Promise<Job> {
    const response = await api.put(`/recruitment/jobs/${id}`, data);
    return response.data;
  },

  async deleteJob(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/recruitment/jobs/${id}`);
    return response.data;
  },

  async getCandidates(params?: { job_id?: number; status?: string; suggested_department?: string }): Promise<Candidate[]> {
    const response = await api.get('/recruitment/candidates', { params });
    return response.data;
  },

  async getCandidateById(id: number): Promise<Candidate> {
    const response = await api.get(`/recruitment/candidates/${id}`);
    return response.data;
  },

  async updateCandidateStatus(id: number, status: CandidateStatus): Promise<Candidate> {
    const response = await api.put(`/recruitment/candidates/${id}/status`, { status });
    return response.data;
  },

  async uploadResume(formData: FormData) {
    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
