import api from './api';

export const aiService = {
  async chatWithHRAssistant(message: string): Promise<{ reply: string; is_demo_mode: boolean; suggested_actions: string[] }> {
    const response = await api.post('/ai/hr-assistant/chat', { message });
    return response.data;
  },

  async matchCandidateToJob(candidateId: number, jobId: number) {
    const response = await api.post('/ai/resume/match', { candidate_id: candidateId, job_id: jobId });
    return response.data;
  },

  async classifyDepartment(skills: string[]) {
    const response = await api.post('/ai/classify-department', skills);
    return response.data;
  }
};
