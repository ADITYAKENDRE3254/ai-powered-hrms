import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600">Authenticating AI-HRMS Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    // Redirect to default landing page based on their specific role
    const roleRoutes: Record<UserRole, string> = {
      SUPER_ADMIN: '/admin/dashboard',
      HR_MANAGER: '/hr/dashboard',
      DEPARTMENT_MANAGER: '/manager/dashboard',
      TEAM_LEADER: '/team-leader/dashboard',
      RECRUITER: '/recruiter/dashboard',
      EMPLOYEE: '/employee/dashboard',
      CANDIDATE: '/candidate/portal',
    };

    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return <>{children}</>;
};
