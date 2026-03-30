import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, session, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-void-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-white/50 font-mono-custom text-sm">Authenticating...</span>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!session || !user) {
    return <Navigate to="/signin" replace />;
  }

  // Check role permissions
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleDashboardMap: Record<UserRole, string> = {
      citizen: '/citizen/dashboard',
      hospital: '/hospital/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={roleDashboardMap[user.role]} replace />;
  }

  return <>{children}</>;
};
