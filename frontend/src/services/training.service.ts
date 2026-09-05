import api from './api';
import { TrainingProgram, TrainingAssignment, TrainingDifficulty, AssignmentStatus } from '../types';

export const trainingService = {
  getTrainingPrograms: async (params?: { search?: string; difficulty?: TrainingDifficulty; is_active?: boolean }): Promise<TrainingProgram[]> => {
    const res = await api.get('/training', { params });
    return res.data;
  },

  createTrainingProgram: async (data: {
    title: string;
    description: string;
    skill_name: string;
    skill_id?: number;
    category_id?: number;
    difficulty: TrainingDifficulty;
    duration_hours: number;
    provider: string;
    deadline_days: number;
    is_active?: boolean;
  }): Promise<TrainingProgram> => {
    const res = await api.post('/training', data);
    return res.data;
  },

  updateTrainingProgram: async (id: number, data: Partial<TrainingProgram>): Promise<TrainingProgram> => {
    const res = await api.put(`/training/${id}`, data);
    return res.data;
  },

  assignTraining: async (data: { training_id: number; employee_ids: number[]; deadline?: string }): Promise<TrainingAssignment[]> => {
    const res = await api.post('/training/assign', data);
    return res.data;
  },

  getAssignments: async (params?: { employee_id?: number; training_id?: number; status_filter?: AssignmentStatus }): Promise<TrainingAssignment[]> => {
    const res = await api.get('/training/assignments', { params });
    return res.data;
  },

  getMyAssignments: async (): Promise<TrainingAssignment[]> => {
    const res = await api.get('/training/my-assignments');
    return res.data;
  },

  updateProgress: async (assignmentId: number, data: { progress_percentage: number; status?: AssignmentStatus; certificate_url?: string }): Promise<TrainingAssignment> => {
    const res = await api.put(`/training/assignments/${assignmentId}/progress`, data);
    return res.data;
  }
};
