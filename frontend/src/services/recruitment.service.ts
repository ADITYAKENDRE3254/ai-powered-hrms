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
  },

  getResumeUrl(candidateId: number, download = false): string {
    return `/api/recruitment/candidates/${candidateId}/resume${download ? '?download=true' : ''}`;
  },

  async getResumeBlobUrl(candidateId: number): Promise<string> {
    const response = await api.get(`/recruitment/candidates/${candidateId}/resume`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  },

  async downloadResume(candidateId: number, filename?: string): Promise<void> {
    const response = await api.get(`/recruitment/candidates/${candidateId}/resume?download=true`, {
      responseType: 'blob',
    });
    const headerType = response.headers ? response.headers['content-type'] : undefined;
    const mediaType = typeof headerType === 'string' ? headerType : 'application/octet-stream';
    const blob = new Blob([response.data], {
      type: mediaType,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `candidate_${candidateId}_resume.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
