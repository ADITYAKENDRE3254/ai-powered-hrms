import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../../services/employee.service';
import { workforceService } from '../../services/workforce.service';
import { Employee, EmployeeSkill, SkillGap, FutureSkill, TrainingRecommendation, SkillCategory } from '../../types';
import { SkillProfile } from '../../components/workforce/SkillProfile';
import { SkillGapChart } from '../../components/workforce/SkillGapChart';
import { FutureSkills } from '../../components/workforce/FutureSkills';
import { TrainingRecommendationCard } from '../../components/workforce/TrainingRecommendationCard';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Target,
  Search,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Plus,
  User,
  GraduationCap,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

export const SkillIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [targetRole, setTargetRole] = useState<string>('');
  
  // Data for selected employee
  const [skills, setSkills] = useState<EmployeeSkill[]>([]);
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [futureSkills, setFutureSkills] = useState<FutureSkill | null>(null);
  const [recommendations, setRecommendations] = useState<TrainingRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpLoading, setIsEmpLoading] = useState(false);

  // Add Skill Modal
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('INTERMEDIATE');
  const [newSkillConfidence, setNewSkillConfidence] = useState(85);
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await employeeService.getEmployees({ limit: 100 });
      setEmployees(res.items);
      if (res.items.length > 0) {
        setSelectedEmp(res.items[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployeeDetails = async (emp: Employee, customRole?: string) => {
    setIsEmpLoading(true);
    try {
      const [skillsRes, gapsRes, futureRes, recsRes] = await Promise.all([
        workforceService.getEmployeeSkills(emp.id),
        workforceService.getEmployeeSkillGaps(emp.id, customRole || undefined),
        workforceService.getEmployeeFutureSkills(emp.id),
        workforceService.getEmployeeTrainingRecommendations(emp.id)
      ]);
      setSkills(skillsRes);
      setSkillGap(gapsRes);
      setFutureSkills(futureRes);
      setRecommendations(recsRes);
      if (!customRole && gapsRes?.target_role) {
        setTargetRole(gapsRes.target_role);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEmpLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmp) {
      loadEmployeeDetails(selectedEmp);
    }
  }, [selectedEmp]);

  const handleTargetRoleChange = (newRole: string) => {
    setTargetRole(newRole);
    if (selectedEmp) {
      loadEmployeeDetails(selectedEmp, newRole);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !newSkillName) return;

    setIsAddingSkill(true);
    try {
      await workforceService.addEmployeeSkill({
        employee_id: selectedEmp.id,
        skill_name: newSkillName,
        skill_level: newSkillLevel,
        confidence: Number(newSkillConfidence),
        source: 'HR_ENDORSEMENT'
      });
      setShowAddSkillModal(false);
      setNewSkillName('');
      loadEmployeeDetails(selectedEmp, targetRole);
    } catch (err) {
      console.error('Failed to add skill', err);
    } finally {
      setIsAddingSkill(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-navy-950 rounded-3xl p-7 sm:p-9 text-white shadow-apple-lg border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <button
            onClick={() => navigate('/workforce-intelligence')}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white font-semibold mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Intelligence Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-xs">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Skill Intelligence Hub</h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                Competency inventory, target role benchmark gaps, and predictive future skill roadmaps.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={() => setShowAddSkillModal(true)}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-2xl text-xs font-bold shadow-apple-md transition-all flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Endorse Skill</span>
          </button>
          <button
            onClick={() => navigate('/training')}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/20 shadow-apple backdrop-blur-md transition-all flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Training Catalog</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Employee List Selector */}
        <div className="lg:col-span-1 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple p-4 flex flex-col h-[720px]">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">
            Select Employee
          </h3>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {employees.map((emp) => {
              const isSelected = selectedEmp?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmp(emp)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-300 shadow-xs font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-navy-800 border border-transparent text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {emp.first_name[0]}{emp.last_name[0]}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white">
                        {emp.first_name} {emp.last_name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{emp.designation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Selected Employee Skill Deep-Dive */}
        <div className="lg:col-span-3 space-y-6">
          {selectedEmp && (
            <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Active Profile
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedEmp.first_name} {selectedEmp.last_name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedEmp.designation} • {selectedEmp.email}</p>
              </div>

              {/* Target Role Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">Benchmark Role:</span>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  onBlur={() => handleTargetRoleChange(targetRole)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTargetRoleChange(targetRole);
                  }}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56"
                />
              </div>
            </div>
          )}

          {isEmpLoading ? (
            <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
              <span>Analyzing skills, benchmark role match, and future roadmaps...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Skill Gap Analysis Chart */}
              {skillGap && <SkillGapChart skillGap={skillGap} />}

              {/* Skill Profile & Future Skills Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkillProfile skills={skills} />
                {futureSkills && <FutureSkills futureSkill={futureSkills} />}
              </div>

              {/* Recommended Trainings */}
              {recommendations.length > 0 && (
                <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-navy-800 shadow-apple">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Targeted Learning Interventions</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        AI-matched courses to close identified skill gaps and accelerate role advancement
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/training')}
                      className="text-xs text-brand-600 dark:text-cyan-400 hover:text-brand-700 font-semibold flex items-center gap-1"
                    >
                      <span>Manage All Trainings</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec) => (
                      <TrainingRecommendationCard
                        key={rec.id || rec.training_name}
                        recommendation={rec}
                        onEnroll={() => navigate('/training')}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Skill */}
      <Modal isOpen={showAddSkillModal} onClose={() => setShowAddSkillModal(false)} title="Endorse / Add Employee Skill">
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Employee</label>
            <input
              type="text"
              disabled
              value={selectedEmp ? `${selectedEmp.first_name} ${selectedEmp.last_name}` : ''}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Skill Name *</label>
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. FastAPI, Kubernetes, GraphQL"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Proficiency Level</label>
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Confidence Score (%)</label>
              <input
                type="number"
                min="50"
                max="100"
                value={newSkillConfidence}
                onChange={(e) => setNewSkillConfidence(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
            <button
              type="button"
              onClick={() => setShowAddSkillModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingSkill || !newSkillName}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-apple-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingSkill ? 'Adding...' : 'Endorse Skill'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
