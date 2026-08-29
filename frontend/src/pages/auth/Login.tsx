import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('admin@hrms.local');
  const [password, setPassword] = useState('Admin@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const demoAccounts = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', email: 'admin@hrms.local', pwd: 'Admin@123', color: 'bg-indigo-600' },
    { role: 'HR_MANAGER', label: 'HR Manager', email: 'hr@hrms.local', pwd: 'Hr@123', color: 'bg-blue-600' },
    { role: 'DEPARTMENT_MANAGER', label: 'Dept Manager', email: 'deptmanager@hrms.local', pwd: 'Manager@123', color: 'bg-purple-600' },
    { role: 'TEAM_LEADER', label: 'Team Leader', email: 'teamlead@hrms.local', pwd: 'Leader@123', color: 'bg-teal-600' },
    { role: 'RECRUITER', label: 'Recruiter', email: 'recruiter@hrms.local', pwd: 'Recruiter@123', color: 'bg-amber-600' },
    { role: 'EMPLOYEE', label: 'Employee', email: 'employee@hrms.local', pwd: 'Employee@123', color: 'bg-emerald-600' },
    { role: 'CANDIDATE', label: 'Candidate', email: 'candidate@hrms.local', pwd: 'Candidate@123', color: 'bg-slate-600' },
  ];

  const handleSelectDemo = (dEmail: string, dPwd: string) => {
    setEmail(dEmail);
    setPassword(dPwd);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await login(email.trim(), password);
      const savedUserStr = localStorage.getItem('user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      const role = savedUser?.role;
      const roleRoutes: Record<string, string> = {
        SUPER_ADMIN: '/admin/dashboard',
        HR_MANAGER: '/hr/dashboard',
        DEPARTMENT_MANAGER: '/manager/dashboard',
        TEAM_LEADER: '/team-leader/dashboard',
        RECRUITER: '/recruiter/dashboard',
        EMPLOYEE: '/employee/dashboard',
        CANDIDATE: '/candidate/portal',
      };
      const dest = (role && roleRoutes[role]) || '/';
      navigate(dest, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">AI-POWERED HRMS</h2>
        <p className="text-xs font-medium text-slate-400 mt-1">
          Intelligent Human Resource Management System
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {/* Demo Account Fast Selector */}
          <div className="mb-6 pb-6 border-b border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-2 text-center">
              ⚡ College Demo Quick Login (Click any role to load)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {demoAccounts.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => handleSelectDemo(d.email, d.pwd)}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all text-center border ${
                    email === d.email
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@hrms.local"
                  className="w-full text-xs pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security note */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Secured with JWT Dual-Layer RBAC & Password Hashing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
