import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarDays,
  Briefcase,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Settings,
  Sparkles,
  LogOut,
  MapPin,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Dashboards
  {
    label: 'Dashboard',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'HR Dashboard',
    to: '/hr/dashboard',
    icon: LayoutDashboard,
    roles: ['HR_MANAGER'],
  },
  {
    label: 'Manager Dashboard',
    to: '/manager/dashboard',
    icon: LayoutDashboard,
    roles: ['DEPARTMENT_MANAGER'],
  },
  {
    label: 'Leader Dashboard',
    to: '/team-leader/dashboard',
    icon: LayoutDashboard,
    roles: ['TEAM_LEADER'],
  },
  {
    label: 'Recruiter Dashboard',
    to: '/recruiter/dashboard',
    icon: LayoutDashboard,
    roles: ['RECRUITER'],
  },
  {
    label: 'My Workspace',
    to: '/employee/dashboard',
    icon: LayoutDashboard,
    roles: ['EMPLOYEE'],
  },
  {
    label: 'Job Portal',
    to: '/candidate/portal',
    icon: Briefcase,
    roles: ['CANDIDATE'],
  },

  // Functional Modules
  {
    label: 'Employees',
    to: '/employees',
    icon: Users,
    roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER'],
  },
  {
    label: 'Departments & Teams',
    to: '/departments',
    icon: Building2,
    roles: ['SUPER_ADMIN', 'HR_MANAGER'],
  },
  {
    label: 'Attendance & GPS',
    to: '/attendance',
    icon: Clock,
    roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER', 'EMPLOYEE'],
  },
  {
    label: 'Leave Management',
    to: '/leaves',
    icon: CalendarDays,
    roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER', 'EMPLOYEE'],
  },
  {
    label: 'Recruitment & AI Match',
    to: '/recruitment',
    icon: Briefcase,
    roles: ['SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'],
  },
  {
    label: 'Payroll & Payslips',
    to: '/payroll',
    icon: DollarSign,
    roles: ['SUPER_ADMIN', 'HR_MANAGER', 'EMPLOYEE'],
  },
  {
    label: 'Reports & Analytics',
    to: '/reports',
    icon: BarChart3,
    roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER'],
  },
  {
    label: 'Audit Trail',
    to: '/audit-logs',
    icon: ShieldCheck,
    roles: ['SUPER_ADMIN', 'HR_MANAGER'],
  },
  {
    label: 'Office & Geofence',
    to: '/settings',
    icon: Settings,
    roles: ['SUPER_ADMIN', 'HR_MANAGER'],
  },
];

export const Sidebar: React.FC<{ onOpenAIChat?: () => void }> = ({ onOpenAIChat }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const filteredNavItems = navItems.filter((item) => hasRole(...item.roles));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 shadow-xl h-screen sticky top-0">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight leading-none text-base">AI-HRMS</h1>
            <p className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase mt-1">
              Enterprise Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Navigation
        </div>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}

        {/* AI Assistant Quick Trigger */}
        {onOpenAIChat && (
          <div className="pt-4">
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Smart Automation
            </div>
            <button
              onClick={onOpenAIChat}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/40 hover:text-indigo-200 transition-all text-left group"
            >
              <Bot className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
              <div className="flex-1 truncate">
                <span className="font-semibold block">AI HR Assistant</span>
                <span className="text-[10px] text-indigo-400/80">Contextual Chatbot</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
              {user.first_name ? user.first_name[0] : user.email[0].toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-200 truncate">
                {user.full_name || user.email}
              </p>
              <span className="inline-block text-[10px] font-semibold text-indigo-400 truncate">
                {user.role.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => logout().then(() => navigate('/login'))}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
