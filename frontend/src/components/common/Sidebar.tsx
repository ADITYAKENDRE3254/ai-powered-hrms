import React, { useState } from 'react';
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
  Bot,
  Brain,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
  isAi?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      {
        label: 'Admin Overview',
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
        label: 'Manager Center',
        to: '/manager/dashboard',
        icon: LayoutDashboard,
        roles: ['DEPARTMENT_MANAGER'],
      },
      {
        label: 'Team Dashboard',
        to: '/team-leader/dashboard',
        icon: LayoutDashboard,
        roles: ['TEAM_LEADER'],
      },
      {
        label: 'Talent Center',
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
    ],
  },
  {
    title: 'AI Intelligence',
    items: [
      {
        label: 'AI Workforce Suite',
        to: '/workforce-intelligence',
        icon: Brain,
        roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER'],
        badge: '✦ AI',
        isAi: true,
      },
      {
        label: 'AI Training Hub',
        to: '/training',
        icon: GraduationCap,
        roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER'],
        badge: '✦ AI',
        isAi: true,
      },
      {
        label: 'My AI Insights',
        to: '/my-ai-insights',
        icon: Sparkles,
        roles: ['EMPLOYEE'],
        badge: '✦ Growth',
        isAi: true,
      },
      {
        label: 'My Training Hub',
        to: '/my-training',
        icon: GraduationCap,
        roles: ['EMPLOYEE'],
      },
    ],
  },
  {
    title: 'Core Operations',
    items: [
      {
        label: 'Employees Directory',
        to: '/employees',
        icon: Users,
        roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER'],
      },
      {
        label: 'Org & Teams',
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
        label: 'Recruitment & ATS',
        to: '/recruitment',
        icon: Briefcase,
        roles: ['SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'],
        badge: 'AI Match',
      },
      {
        label: 'Payroll & Payslips',
        to: '/payroll',
        icon: DollarSign,
        roles: ['SUPER_ADMIN', 'HR_MANAGER', 'EMPLOYEE'],
      },
    ],
  },
  {
    title: 'Compliance & Config',
    items: [
      {
        label: 'Executive Reports',
        to: '/reports',
        icon: BarChart3,
        roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER'],
      },
      {
        label: 'Security Audit Trail',
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
    ],
  },
];

export const Sidebar: React.FC<{ onOpenAIChat?: () => void }> = ({ onOpenAIChat }) => {
  const { user, logout, hasRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <aside
      className={`bg-navy-950 text-slate-300 flex flex-col shrink-0 border-r border-navy-900 shadow-2xl h-screen sticky top-0 transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-navy-900/90 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/30 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-white tracking-tight leading-none text-base">AI-HRMS</h1>
              <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase mt-1 inline-block">
                Workforce Intelligence
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-slate-500 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => hasRole(...item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-600/30 font-semibold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-navy-900/80'
                      } ${collapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${item.isAi ? 'text-cyan-400' : ''}`} />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                          item.isAi
                            ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50'
                            : 'bg-brand-950/80 text-brand-300 border border-brand-700/50'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}

        {/* AI Assistant Quick Launcher Card */}
        {onOpenAIChat && (
          <div className="pt-2">
            {!collapsed ? (
              <div
                onClick={onOpenAIChat}
                className="p-3 rounded-2xl bg-gradient-to-br from-brand-950/60 via-navy-900/60 to-purple-950/60 border border-brand-500/30 hover:border-brand-500/60 cursor-pointer transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-brand-500 to-purple-600 flex items-center justify-center text-white shadow-xs shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      ✦ AI HR Assistant
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">Policy & Team Copilot</p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAIChat}
                title="AI HR Assistant"
                className="w-full flex justify-center p-2.5 rounded-xl bg-brand-950/60 border border-brand-500/30 text-brand-400 hover:text-white hover:bg-brand-900/60 transition-colors"
              >
                <Bot className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-navy-900/90 bg-navy-950/90">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                {user.first_name ? user.first_name[0] : user.email[0].toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-navy-950" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">
                  {user.full_name || user.email.split('@')[0]}
                </p>
                <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider truncate">
                  {user.role.replace(/_/g, ' ')}
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => logout().then(() => navigate('/login'))}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-navy-900 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

