import React, { useState, useEffect } from 'react';
import { departmentService } from '../services/department.service';
import { Department, Team } from '../types';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, Users, Shield, Layers, AlertCircle } from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const isHRAdmin = hasRole('SUPER_ADMIN', 'HR_MANAGER');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<number>(1);

  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [teamName, setTeamName] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await departmentService.createDepartment({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        description: deptDesc.trim(),
      });
      setShowDeptModal(false);
      setDeptName('');
      setDeptCode('');
      setDeptDesc('');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to create department');
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await departmentService.createTeam({
        name: teamName.trim(),
        department_id: selectedDeptId,
      });
      setShowTeamModal(false);
      setTeamName('');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to create team');
    }
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Departments & Teams
            </h1>
            <span className="ai-badge">✦ Org Matrix</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage organizational hierarchy, department leads, and team structures.
          </p>
        </div>

        {isHRAdmin && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setShowDeptModal(true);
                setErrorMsg(null);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 text-white rounded-2xl text-xs font-bold shadow-apple-md transition-all flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>New Department</span>
            </button>
            <button
              onClick={() => {
                if (departments.length > 0) setSelectedDeptId(departments[0].id);
                setShowTeamModal(true);
                setErrorMsg(null);
              }}
              className="px-4 py-2.5 bg-slate-900 dark:bg-navy-800 hover:bg-slate-800 dark:hover:bg-navy-700 text-white rounded-2xl text-xs font-bold shadow-apple border border-slate-700 dark:border-navy-700 transition-all flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Layers className="w-4 h-4" />
              <span>New Team</span>
            </button>
          </div>
        )}
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departments.map((d) => (
          <div
            key={d.id}
            className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 p-6 shadow-apple flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-cyan-400 border border-brand-100 dark:border-brand-800/60 flex items-center justify-center font-black text-xs shadow-xs">
                    {d.code}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{d.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Head: <b className="text-slate-800 dark:text-slate-200">{d.manager_name || 'Unassigned'}</b>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                  {d.employee_count} Employees
                </span>
              </div>

              {d.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3.5 leading-relaxed">{d.description}</p>
              )}

              {/* Teams Section */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-navy-800">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
                  Sub-Teams ({d.teams?.length || 0})
                </span>
                <div className="space-y-2">
                  {d.teams && d.teams.length > 0 ? (
                    d.teams.map((t: Team) => (
                      <div
                        key={t.id}
                        className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/60 dark:border-navy-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{t.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Lead: {t.team_leader_name || 'Unassigned'}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-brand-600 dark:text-cyan-400 bg-brand-50 dark:bg-brand-950/50 px-2.5 py-1 rounded-xl border border-brand-100 dark:border-brand-900">
                          {t.member_count} Members
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">No sub-teams configured yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Department Modal */}
      {showDeptModal && (
        <Modal
          isOpen={showDeptModal}
          onClose={() => setShowDeptModal(false)}
          title="Create New Department"
          subtitle="Add a functional department to the organizational chart."
          maxWidth="md"
        >
          <form onSubmit={handleCreateDepartment} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Department Name</label>
              <input
                type="text"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                required
                placeholder="e.g. Artificial Intelligence & ML"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Department Code</label>
              <input
                type="text"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                required
                placeholder="e.g. AIML"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
                rows={3}
                placeholder="Overview of departmental responsibilities..."
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setShowDeptModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-apple"
              >
                Create Department
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Team Modal */}
      {showTeamModal && (
        <Modal
          isOpen={showTeamModal}
          onClose={() => setShowTeamModal(false)}
          title="Create New Team"
          subtitle="Add a functional sub-team under a parent department."
          maxWidth="md"
        >
          <form onSubmit={handleCreateTeam} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Parent Department</label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                placeholder="e.g. Applied AI & NLP Team"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-apple"
              >
                Create Team
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
