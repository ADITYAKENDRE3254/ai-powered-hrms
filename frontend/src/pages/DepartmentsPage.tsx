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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Departments & Teams</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organizational hierarchy, department leads, and team structures.
          </p>
        </div>

        {isHRAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowDeptModal(true);
                setErrorMsg(null);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-1.5"
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
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
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
          <div key={d.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs">
                    {d.code}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{d.name}</h3>
                    <p className="text-xs text-slate-500">Head of Dept: <b className="text-slate-700">{d.manager_name || 'Unassigned'}</b></p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {d.employee_count} Employees
                </span>
              </div>

              {d.description && (
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{d.description}</p>
              )}

              {/* Teams Section */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Sub-Teams ({d.teams?.length || 0})
                </span>
                <div className="space-y-2">
                  {d.teams && d.teams.length > 0 ? (
                    d.teams.map((t: Team) => (
                      <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{t.name}</p>
                          <p className="text-[11px] text-slate-500">Lead: {t.team_leader_name || 'Unassigned'}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {t.member_count} Members
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No sub-teams created yet</p>
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
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name</label>
              <input
                type="text"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                required
                placeholder="e.g. Artificial Intelligence & ML"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Code</label>
              <input
                type="text"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                required
                placeholder="e.g. AIML"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
                rows={3}
                placeholder="Overview of departmental responsibilities..."
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeptModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
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
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Department</label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                placeholder="e.g. Applied AI & NLP Team"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
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
