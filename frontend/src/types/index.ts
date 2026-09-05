export type UserRole = 
  | 'SUPER_ADMIN'
  | 'HR_MANAGER'
  | 'DEPARTMENT_MANAGER'
  | 'TEAM_LEADER'
  | 'RECRUITER'
  | 'EMPLOYEE'
  | 'CANDIDATE';

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'PROBATION' | 'TERMINATED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type VerificationStatus = 'VERIFIED' | 'REJECTED' | 'MANUAL_OVERRIDE';
export type LeaveType = 'CASUAL' | 'SICK' | 'EARNED' | 'UNPAID';
export type LeaveStatus = 'PENDING_TL' | 'PENDING_MANAGER' | 'APPROVED' | 'REJECTED';
export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED';
export type CandidateStatus = 'APPLIED' | 'AI_SCREENED' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';
export type PayrollStatus = 'DRAFT' | 'PROCESSED' | 'PAID';
export type NotificationType = 'LEAVE' | 'ATTENDANCE' | 'PAYROLL' | 'RECRUITMENT' | 'GENERAL';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: {
    user_id: number;
    email: string;
    role: UserRole;
    is_active: boolean;
    employee_id?: number;
    employee_code?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    designation?: string;
    department_id?: number;
    department_name?: string;
    team_id?: number;
    team_name?: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  manager_id?: number;
  manager_name?: string;
  is_active: boolean;
  employee_count: number;
  teams: Team[];
  created_at: string;
}

export interface Team {
  id: number;
  name: string;
  department_id: number;
  department_name?: string;
  team_leader_id?: number;
  team_leader_name?: string;
  member_count: number;
  created_at: string;
}

export interface Employee {
  id: number;
  user_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  gender?: Gender;
  dob?: string;
  address?: string;
  department_id?: number;
  department_name?: string;
  team_id?: number;
  team_name?: string;
  designation: string;
  manager_id?: number;
  manager_name?: string;
  team_leader_id?: number;
  team_leader_name?: string;
  joining_date: string;
  monthly_salary: number;
  tax_percentage: number;
  pf_percentage: number;
  allowances: number;
  employment_status: EmploymentStatus;
  profile_image_url?: string;
  user_role?: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_code?: string;
  department_name?: string;
  date: string;
  punch_in?: string;
  punch_out?: string;
  punch_in_lat?: number;
  punch_in_lng?: number;
  punch_out_lat?: number;
  punch_out_lng?: number;
  distance_in_meters?: number;
  verification_status: VerificationStatus;
  work_duration_hours: number;
  notes?: string;
  created_at: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_code?: string;
  department_name?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  duration_days: number;
  reason: string;
  status: LeaveStatus;
  approver_id?: number;
  approver_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface LeaveBalance {
  casual_leave: number;
  sick_leave: number;
  earned_leave: number;
  year: number;
}

export interface Job {
  id: number;
  title: string;
  department_id?: number;
  department_name?: string;
  description: string;
  required_skills: string;
  experience_required_years: number;
  location: string;
  employment_type: string;
  salary_range?: string;
  status: JobStatus;
  applicant_count: number;
  created_at: string;
}

export interface Candidate {
  id: number;
  job_id: number;
  job_title?: string;
  user_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  extracted_skills?: string;
  experience_years: number;
  education?: string;
  previous_roles?: string;
  ai_summary?: string;
  match_score: number;
  matching_skills?: string;
  missing_skills?: string;
  suggested_department?: string;
  status: CandidateStatus;
  created_at: string;
}

export interface PayrollItem {
  id: number;
  payroll_id: number;
  employee_id: number;
  employee_name?: string;
  employee_code?: string;
  department_name?: string;
  designation?: string;
  monthly_salary: number;
  working_days: number;
  present_days: number;
  approved_leave_days: number;
  lwp_days: number;
  per_day_rate: number;
  basic_salary: number;
  allowances: number;
  lwp_deduction: number;
  pf_deduction: number;
  tax_deduction: number;
  other_deductions: number;
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  payslip_url?: string;
  created_at: string;
}

export interface Payroll {
  id: number;
  month: number;
  year: number;
  total_working_days: number;
  status: PayrollStatus;
  processed_by?: number;
  processor_name?: string;
  processed_at: string;
  notes?: string;
  total_employees: number;
  total_net_disbursed: number;
  items: PayrollItem[];
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  module: string;
  record_id?: string;
  details?: string;
  ip_address?: string;
  timestamp?: string;
  created_at: string;
}

export interface OfficeSetting {
  id: number;
  office_name?: string;
  latitude: number;
  longitude: number;
  geofence_radius: number;
  geofence_radius_meters?: number;
  office_address?: string;
  work_start_time?: string;
  work_end_time?: string;
  updated_at?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggested_actions?: string[];
  is_demo_mode?: boolean;
}

// ==========================================
// Workforce Intelligence & Training Types
// ==========================================

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type SkillSource = 'RESUME' | 'PROFILE' | 'MANAGER_ASSESSED' | 'CERTIFICATION' | 'TRAINING';
export type PerformanceCategory = 'HIGH' | 'MEDIUM' | 'NEEDS_ATTENTION' | 'INSUFFICIENT_DATA';
export type PerformanceTrend = 'IMPROVING' | 'STABLE' | 'DECLINING' | 'INSUFFICIENT_DATA';
export type AttritionRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'INSUFFICIENT_DATA';
export type GapPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TrainingDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type AssignmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type RecommendationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface SkillCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category_id?: number;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface EmployeeSkill {
  id: number;
  employee_id: number;
  skill_id?: number;
  skill_name: string;
  skill_level: SkillLevel;
  confidence: number;
  source: SkillSource;
  last_verified: string;
  created_at: string;
}

export interface PerformancePrediction {
  id?: number;
  employee_id: number;
  employee_name?: string;
  department_name?: string;
  designation?: string;
  period: string;
  score: number;
  prediction_category: PerformanceCategory;
  confidence: number;
  trend: PerformanceTrend;
  positive_factors: string[];
  attention_factors: string[];
  recommended_actions: string[];
  model_version: string;
  is_data_sufficient: boolean;
  explanation?: string;
  prediction_date?: string;
}

export interface AttritionPrediction {
  id?: number;
  employee_id: number;
  employee_name?: string;
  department_name?: string;
  designation?: string;
  period: string;
  risk_score: number;
  risk_level: AttritionRiskLevel;
  confidence: number;
  main_factors: string[];
  protective_factors: string[];
  recommended_interventions: string[];
  model_version: string;
  is_data_sufficient: boolean;
  explanation?: string;
  prediction_date?: string;
}

export interface SkillGap {
  id?: number;
  employee_id: number;
  employee_name?: string;
  target_role: string;
  required_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  gap_percentage: number;
  priority: GapPriority;
  confidence: number;
  analysis_date?: string;
}

export interface FutureSkill {
  id?: number;
  employee_id: number;
  employee_name?: string;
  predicted_skills: string[];
  career_path?: string;
  relevance_score: number;
  reason: string;
  confidence: number;
}

export interface TrainingProgram {
  id: number;
  title: string;
  description: string;
  skill_name: string;
  skill_id?: number;
  category_id?: number;
  difficulty: TrainingDifficulty;
  duration_hours: number;
  provider: string;
  deadline_days: number;
  is_active: boolean;
  enrolled_count?: number;
  completed_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TrainingAssignment {
  id: number;
  employee_id: number;
  employee_name?: string;
  department_name?: string;
  training_id: number;
  training_title?: string;
  skill_name?: string;
  difficulty?: TrainingDifficulty;
  duration_hours?: number;
  provider?: string;
  status: AssignmentStatus;
  progress_percentage: number;
  deadline?: string;
  certificate_url?: string;
  completed_at?: string;
  created_at: string;
}

export interface TrainingRecommendation {
  id?: number;
  employee_id: number;
  training_id?: number;
  training_name: string;
  skill_name: string;
  priority: RecommendationPriority;
  reason: string;
  expected_benefit: string;
  confidence: number;
}

export interface EmployeeAIInsights {
  employee_id: number;
  employee_name: string;
  designation: string;
  department_name?: string;
  performance: PerformancePrediction;
  skills: EmployeeSkill[];
  skill_gaps: SkillGap;
  future_skills: FutureSkill;
  recommended_trainings: TrainingRecommendation[];
}

export interface WorkforceDashboardSummary {
  total_employees: number;
  analyzed_employees: number;
  performance_distribution: Record<string, number>;
  attrition_risk_distribution: Record<string, number>;
  average_performance_score: number;
  average_attrition_risk: number;
  high_attrition_count: number;
  needs_attention_count: number;
  total_skills_tracked: number;
  total_training_programs: number;
  completed_trainings_count: number;
  training_completion_rate: number;
  department_analytics: Array<{
    department_id: number;
    department_name: string;
    headcount: number;
    average_performance: number;
    high_attrition_count: number;
    top_missing_skills: string[];
  }>;
  top_skill_gaps: Array<{
    skill: string;
    affected_employees: number;
  }>;
  top_recommended_trainings: Array<{
    training_name: string;
    demand_count: number;
  }>;
  latest_analysis_run?: {
    id: number;
    run_type: string;
    duration_seconds: number;
    created_at: string;
  } | null;
}

export interface DepartmentWorkforceAnalytics {
  department_id: number;
  department_name: string;
  headcount: number;
  average_performance: number;
  performance_tier_breakdown: Record<string, number>;
  attrition_risk_breakdown: Record<string, number>;
  top_missing_skills: string[];
  top_department_trainings: string[];
  employees: Array<{
    id: number;
    name: string;
    designation: string;
    performance_score: number;
    performance_category: string;
    attrition_risk_level: string;
    attrition_risk_score: number;
    skill_gap_percentage: number;
  }>;
}

