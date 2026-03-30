import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { dashboardPaths, getDashboardPathForRole } from './roleRedirect';

const authPublicPaths = new Set(['/','/signin','/signup']);

export const AuthRedirector: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const pathname = location.pathname;
    const isOnDashboard = dashboardPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

    if (user) {
      const target = getDashboardPathForRole(user.role);

      // If the user is already on the correct dashboard, do nothing.
      if (pathname === target) return;

      // Redirect away from auth pages and landing when logged in.
      if (authPublicPaths.has(pathname) || isOnDashboard) {
        navigate(target, { replace: true });
      }
      return;
    }

    // Not authenticated: keep people out of dashboards.
    if (isOnDashboard) {
      navigate('/signin', { replace: true });
    }
  }, [isLoading, user, location.pathname, navigate]);

  return null;
};

