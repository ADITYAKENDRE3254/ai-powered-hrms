import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  CheckCheck,
  Clock,
  User,
  Shield,
  Search,
  Sun,
  Moon,
  Bot,
  Command,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from './Badge';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenAIChat?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenAIChat,
  onOpenCommandPalette,
}) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { actualTheme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-navy-800 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Title & Subtitle */}
      <div className="min-w-0 pr-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-none tracking-tight truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Center Search / Command Palette Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-100/80 dark:bg-navy-800/80 hover:bg-slate-200/60 dark:hover:bg-navy-700/60 border border-slate-200/70 dark:border-navy-700 rounded-xl text-slate-400 dark:text-slate-500 text-xs transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 group-hover:text-brand-500 transition-colors" />
            <span className="font-medium">Quick find...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-navy-900 text-slate-400 dark:text-slate-400 rounded border border-slate-200/80 dark:border-navy-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Action Icons & Badges */}
      <div className="flex items-center gap-3">
        {/* Live Clock with active dot */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium px-3 py-1.5 bg-slate-100/70 dark:bg-navy-800/70 rounded-xl border border-slate-200/60 dark:border-navy-700/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* AI Assistant Quick Pill Button */}
        {onOpenAIChat && (
          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 via-cyan-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-xs font-semibold shadow-sm shadow-brand-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">✦ AI Assistant</span>
          </button>
        )}

        {/* Theme Mode Toggle (Sun/Moon) */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${actualTheme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl transition-all"
        >
          {actualTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Notification Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl relative transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-navy-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-navy-800 py-3 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 font-bold px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800/60">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100/60 dark:divide-navy-800/60">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.is_read && markAsRead(n.id)}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-navy-800/60 cursor-pointer transition-colors ${
                        !n.is_read ? 'bg-brand-50/40 dark:bg-brand-950/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs ${!n.is_read ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill Badge */}
        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200/80 dark:border-navy-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user.first_name ? user.first_name[0] : user.email[0].toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user.full_name || user.email.split('@')[0]}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-tight mt-0.5">
                {user.role.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

