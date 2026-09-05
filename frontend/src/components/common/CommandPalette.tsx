import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Brain,
  GraduationCap,
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
  Sun,
  Moon,
  LogOut,
  ArrowRight,
  Command,
  CheckCircle2,
  FileSpreadsheet,
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'AI Intelligence' | 'Navigation' | 'Quick Actions' | 'Preferences';
  icon: React.ElementType;
  roles?: UserRole[];
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAIChat?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenAIChat,
}) => {
  const { user, hasRole, logout } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open command palette triggered outside
          const event = new CustomEvent('open-command-palette');
          window.dispatchEvent(event);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const allCommands: CommandItem[] = [
    // AI Intelligence
    {
      id: 'workforce-ai',
      title: '✦ AI Workforce Intelligence Dashboard',
      description: 'Performance forecasts, attrition risk analysis & skill matrices',
      category: 'AI Intelligence',
      icon: Brain,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER'],
      action: () => {
        navigate('/workforce-intelligence');
        onClose();
      },
      keywords: ['prediction', 'attrition', 'performance', 'skill gap', 'ai', 'intelligence'],
    },
    {
      id: 'ai-training-hub',
      title: '✦ AI Training Recommendations & Hub',
      description: 'Personalized course suggestions & skill roadmaps',
      category: 'AI Intelligence',
      icon: GraduationCap,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER'],
      action: () => {
        navigate('/training');
        onClose();
      },
      keywords: ['training', 'upskilling', 'courses', 'recommendation'],
    },
    {
      id: 'my-ai-insights',
      title: '✦ My AI Growth & Skill Insights',
      description: 'Personalized performance trajectory & recommended learnings',
      category: 'AI Intelligence',
      icon: Sparkles,
      roles: ['EMPLOYEE'],
      action: () => {
        navigate('/my-ai-insights');
        onClose();
      },
      keywords: ['my insights', 'growth', 'skill', 'personal'],
    },
    {
      id: 'open-ai-chat',
      title: '✦ Launch AI HR Assistant',
      description: 'Contextual AI policy advisor & workforce assistant',
      category: 'AI Intelligence',
      icon: Bot,
      action: () => {
        onClose();
        if (onOpenAIChat) onOpenAIChat();
      },
      keywords: ['chat', 'assistant', 'bot', 'gemini', 'help'],
    },

    // Navigation
    {
      id: 'nav-employees',
      title: 'Employee Directory & 360 Profiles',
      description: 'Browse all company staff, job roles and teams',
      category: 'Navigation',
      icon: Users,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER'],
      action: () => {
        navigate('/employees');
        onClose();
      },
      keywords: ['staff', 'people', 'team', 'profiles', 'directory'],
    },
    {
      id: 'nav-attendance',
      title: 'Live Attendance & GPS Geofencing',
      description: 'Real-time clock-in/out verification and history',
      category: 'Navigation',
      icon: Clock,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER', 'EMPLOYEE'],
      action: () => {
        navigate('/attendance');
        onClose();
      },
      keywords: ['clock in', 'clock out', 'checkin', 'gps', 'geofence', 'timesheet'],
    },
    {
      id: 'nav-leaves',
      title: 'Leave Management & Approval Flow',
      description: 'Apply for leave or review pending employee requests',
      category: 'Navigation',
      icon: CalendarDays,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER', 'EMPLOYEE'],
      action: () => {
        navigate('/leaves');
        onClose();
      },
      keywords: ['vacation', 'sick leave', 'time off', 'approval'],
    },
    {
      id: 'nav-recruitment',
      title: 'Recruitment & AI Resume Matching (ATS)',
      description: 'Open positions, candidate applications and AI resume scanner',
      category: 'Navigation',
      icon: Briefcase,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'],
      action: () => {
        navigate('/recruitment');
        onClose();
      },
      keywords: ['jobs', 'applicants', 'resumes', 'ats', 'hiring'],
    },
    {
      id: 'nav-payroll',
      title: 'Payroll Processing & Payslips',
      description: 'Monthly payroll runs, salary calculations and PDF payslips',
      category: 'Navigation',
      icon: DollarSign,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'EMPLOYEE'],
      action: () => {
        navigate('/payroll');
        onClose();
      },
      keywords: ['salary', 'compensation', 'slips', 'finance'],
    },
    {
      id: 'nav-departments',
      title: 'Departments & Org Architecture',
      description: 'Manage business units, manager assignments & teams',
      category: 'Navigation',
      icon: Building2,
      roles: ['SUPER_ADMIN', 'HR_MANAGER'],
      action: () => {
        navigate('/departments');
        onClose();
      },
      keywords: ['units', 'organization', 'hierarchy'],
    },
    {
      id: 'nav-reports',
      title: 'Analytics & Executive Reports',
      description: 'Headcount metrics, payroll summary, attendance rates',
      category: 'Navigation',
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER'],
      action: () => {
        navigate('/reports');
        onClose();
      },
      keywords: ['metrics', 'charts', 'export', 'csv'],
    },
    {
      id: 'nav-audit',
      title: 'Security Audit Trail & Compliance',
      description: 'Immutable system event logs and action tracking',
      category: 'Navigation',
      icon: ShieldCheck,
      roles: ['SUPER_ADMIN', 'HR_MANAGER'],
      action: () => {
        navigate('/audit-logs');
        onClose();
      },
      keywords: ['logs', 'security', 'events', 'compliance'],
    },
    {
      id: 'nav-settings',
      title: 'Office Geofencing & AI Settings',
      description: 'Office GPS coordinates, threshold radius and models',
      category: 'Navigation',
      icon: Settings,
      roles: ['SUPER_ADMIN', 'HR_MANAGER'],
      action: () => {
        navigate('/settings');
        onClose();
      },
      keywords: ['geofence', 'office', 'coordinates', 'config'],
    },

    // Preferences
    {
      id: 'pref-theme-toggle',
      title: `Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      description: `Current mode: ${theme.toUpperCase()}`,
      category: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        toggleTheme();
        onClose();
      },
      keywords: ['theme', 'dark', 'light', 'appearance', 'mode'],
    },
    {
      id: 'pref-logout',
      title: 'Sign Out of AI-HRMS',
      description: `Logged in as ${user.email}`,
      category: 'Preferences',
      icon: LogOut,
      action: () => {
        onClose();
        logout().then(() => navigate('/login'));
      },
      keywords: ['sign out', 'logout', 'exit'],
    },
  ];

  // Filter commands by role and query
  const filteredCommands = allCommands.filter((cmd) => {
    if (cmd.roles && !hasRole(...cmd.roles)) return false;
    if (!query.trim()) return true;

    const lowerQuery = query.toLowerCase();
    const titleMatch = cmd.title.toLowerCase().includes(lowerQuery);
    const descMatch = cmd.description.toLowerCase().includes(lowerQuery);
    const keywordMatch = cmd.keywords?.some((k) => k.toLowerCase().includes(lowerQuery));

    return titleMatch || descMatch || keywordMatch;
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Group commands by category
  const categories = ['AI Intelligence', 'Navigation', 'Preferences'] as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-navy-800 overflow-hidden flex flex-col transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-navy-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search modules, or ask AI..."
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-navy-800 rounded border border-slate-200 dark:border-navy-700">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100/50 dark:divide-navy-800/50">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center">
              <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No matching commands found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try searching for "Workforce", "Leaves", "Payroll" or "Theme"</p>
            </div>
          ) : (
            categories.map((category) => {
              const categoryItems = filteredCommands.filter((cmd) => cmd.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category} className="py-2">
                  <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                    {category}
                  </div>
                  <div className="space-y-1 mt-1">
                    {categoryItems.map((cmd) => {
                      const globalIdx = filteredCommands.indexOf(cmd);
                      const isSelected = globalIdx === selectedIndex;
                      const Icon = cmd.icon;
                      const isAi = cmd.category === 'AI Intelligence';

                      return (
                        <div
                          key={cmd.id}
                          onClick={cmd.action}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? isAi
                                ? 'bg-gradient-to-r from-brand-600/10 via-cyan-500/10 to-purple-600/10 dark:from-brand-500/20 dark:to-purple-500/20 border border-brand-500/30'
                                : 'bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700'
                              : 'border border-transparent hover:bg-slate-50 dark:hover:bg-navy-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isAi
                                  ? 'bg-gradient-to-br from-brand-500 via-cyan-500 to-purple-600 text-white shadow-xs'
                                  : isSelected
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p
                                className={`text-xs font-semibold truncate ${
                                  isSelected
                                    ? 'text-slate-900 dark:text-white font-bold'
                                    : 'text-slate-700 dark:text-slate-200'
                                }`}
                              >
                                {cmd.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {cmd.description}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <ArrowRight className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 ml-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-navy-950 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded text-[10px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded text-[10px]">↵</kbd> Select
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            ✦ AI-HRMS Intelligence
          </span>
        </div>
      </div>
    </div>
  );
};
