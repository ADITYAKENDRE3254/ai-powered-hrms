import api from './api';
import {
  WorkforceDashboardSummary,
  DepartmentWorkforceAnalytics,
  PerformancePrediction,
  AttritionPrediction,
  EmployeeSkill,
  SkillGap,
  FutureSkill,
  TrainingRecommendation,
  EmployeeAIInsights,
  SkillCategory,
  Skill
} from '../types';

export const workforceService = {
  getDashboardSummary: async (): Promise<WorkforceDashboardSummary> => {
    const res = await api.get('/workforce-intelligence/dashboard');
    return res.data;
  },

  getMyInsights: async (): Promise<EmployeeAIInsights> => {
    const res = await api.get('/workforce-intelligence/my-insights');
    return res.data;
  },

  getEmployeePerformance: async (employeeId: number): Promise<PerformancePrediction> => {
    const res = await api.get(`/workforce-intelligence/employees/${employeeId}/performance`);
    return res.data;
  },

  getEmployeeAttrition: async (employeeId: number): Promise<AttritionPrediction> => {
    const res = await api.get(`/workforce-intelligence/employees/${employeeId}/attrition`);
    return res.data;
  },

  getEmployeeSkills: async (employeeId: number): Promise<EmployeeSkill[]> => {
    const res = await api.get(`/workforce-intelligence/employees/${employeeId}/skills`);
    return res.data;
  },

  getEmployeeSkillGaps: async (employeeId: number, targetRole?: string): Promise<SkillGap> => {
    const params = targetRole ? { target_role: targetRole } : {};
    const res = await api.get(`/workforce-intelligence/employees/${employeeId}/skill-gaps`, { params });
    return res.data;
  },

  getEmployeeFutureSkills: async (employeeId: number): Promise<FutureSkill> => {
    const res = await api.get(`/workforce-intelligence/employees/${employeeId}/future-skills`);
    return res.data;
  },

  getEmployeeTrainingRecommendations: async (employeeId: number): Promise<TrainingRecommendation[]> => {
    const res = await api.get(`/workforce-intelligence/employees/${employeeId}/training-recommendations`);
    return res.data;
  },

  getDepartmentAnalytics: async (departmentId: number): Promise<DepartmentWorkforceAnalytics> => {
    const res = await api.get(`/workforce-intelligence/departments/${departmentId}/analytics`);
    return res.data;
  },

  triggerBatchAnalysis: async (): Promise<any> => {
    const res = await api.post('/workforce-intelligence/analyze/all');
    return res.data;
  },

  getSkillCategories: async (): Promise<SkillCategory[]> => {
    const res = await api.get('/workforce-intelligence/skill-categories');
    return res.data;
  },

  getSkills: async (categoryId?: number): Promise<Skill[]> => {
    const params = categoryId ? { category_id: categoryId } : {};
    const res = await api.get('/workforce-intelligence/skills', { params });
    return res.data;
  },

  addEmployeeSkill: async (data: { employee_id: number; skill_name: string; skill_level: string; confidence: number; source: string }): Promise<EmployeeSkill> => {
    const res = await api.post('/workforce-intelligence/employees/skills', data);
    return res.data;
  }
};
