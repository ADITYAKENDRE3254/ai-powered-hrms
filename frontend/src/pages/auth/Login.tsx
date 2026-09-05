import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Brain,
  Clock,
  Briefcase,
  GraduationCap
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@hrms.local');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const demoAccounts = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', email: 'admin@hrms.local', pwd: 'Admin@123', badge: 'Global HR' },
    { role: 'HR_MANAGER', label: 'HR Manager', email: 'hr@hrms.local', pwd: 'Hr@123', badge: 'People Ops' },
    { role: 'DEPARTMENT_MANAGER', label: 'Dept Manager', email: 'deptmanager@hrms.local', pwd: 'Manager@123', badge: 'Engineering' },
    { role: 'TEAM_LEADER', label: 'Team Leader', email: 'teamlead@hrms.local', pwd: 'Leader@123', badge: 'Sprint Team' },
    { role: 'RECRUITER', label: 'Recruiter', email: 'recruiter@hrms.local', pwd: 'Recruiter@123', badge: 'Talent Acquisition' },
    { role: 'EMPLOYEE', label: 'Employee', email: 'employee@hrms.local', pwd: 'Employee@123', badge: 'Staff Member' },
    { role: 'CANDIDATE', label: 'Candidate', email: 'candidate@hrms.local', pwd: 'Candidate@123', badge: 'Applicant' },
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
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-navy-950 flex font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Left Column: Visual Brand Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-navy-950 flex-col justify-between p-14 overflow-hidden border-r border-navy-900/80">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[30rem] h-[30rem] rounded-full bg-brand-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[30rem] h-[30rem] rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Top Brand Tag */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-apple-md shadow-brand-600/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">AI-HRMS</h1>
            <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">
              Autonomous Workforce Intelligence
            </span>
          </div>
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 my-auto py-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-cyan-300 text-xs font-semibold mb-6 backdrop-blur-md shadow-apple-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Enterprise Human Capital Operating System</span>
          </div>

          <h2 className="text-4xl font-extrabold text-white tracking-tight leading-[1.15]">
            Empower talent.{' '}
            <span className="ai-gradient-text">Predict workforce potential.</span>
          </h2>

          <p className="text-sm text-slate-300/90 mt-5 leading-relaxed font-normal">
            Next-generation enterprise platform combining explainable AI performance forecasting, retention risk analytics, skill gap roadmaps, and automated GPS-verified attendance payroll.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3.5 mt-9">
            <div className="p-4 rounded-2xl bg-navy-900/60 border border-navy-800/80 backdrop-blur-md shadow-apple">
              <div className="flex items-center gap-2.5">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">✦ AI Performance</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">Explainable multi-factor trajectory predictions</p>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900/60 border border-navy-800/80 backdrop-blur-md shadow-apple">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-slate-200">✦ Skill Intelligence</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">Benchmark role gap analyzer & upskilling</p>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900/60 border border-navy-800/80 backdrop-blur-md shadow-apple">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-bold text-slate-200">GPS Geofencing</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">Real-time Haversine verified check-in</p>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900/60 border border-navy-800/80 backdrop-blur-md shadow-apple">
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">AI Resume Scanner</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">NLP candidate scoring & matching</p>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-navy-900 text-xs text-slate-400">
          <span>Enterprise SaaS Edition v2.0</span>
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> Multi-Tier RBAC & bcrypt Encrypted
          </span>
        </div>
      </div>

      {/* Right Column: Clean Form with Premium Whitespace */}
      <div className="flex-1 flex flex-col justify-center py-14 px-6 sm:px-12 lg:px-20 max-w-2xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="lg:hidden text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-purple-600 mx-auto flex items-center justify-center text-white shadow-apple mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">AI-HRMS</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enterprise Workforce Suite</p>
        </div>

        <div className="mb-8">
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign in to your account
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Select a demo role below for 1-click access or enter your organization credentials.
          </p>
        </div>

        {/* Demo Account Quick Selector Card */}
        <div className="mb-7 p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-apple transition-colors">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[11px] font-bold text-brand-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Demo Role Selector</span>
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">1-Click Auto-Fill</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {demoAccounts.map((d) => {
              const isSelected = email === d.email;
              return (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => handleSelectDemo(d.email, d.pwd)}
                  className={`p-3 rounded-2xl text-left transition-all duration-200 border ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500/80 text-brand-900 dark:text-cyan-300 shadow-apple-sm'
                      : 'bg-[#FAFAFC] dark:bg-navy-950 hover:bg-slate-100 dark:hover:bg-navy-800 border-slate-200/70 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:scale-[1.01]'
                  }`}
                >
                  <p className="text-xs font-bold leading-tight truncate">{d.label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-normal truncate">{d.badge}</p>
                </button>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full text-xs pl-11 pr-4 py-3.5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-apple-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full text-xs pl-11 pr-11 py-3.5 bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-apple-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 px-5 bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-apple shadow-brand-600/30 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-slate-200/80 dark:border-navy-800 flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <Shield className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400" />
          <span>Secured with JWT Dual-Layer RBAC & bcrypt password hashing</span>
        </div>
      </div>
    </div>
  );
};
