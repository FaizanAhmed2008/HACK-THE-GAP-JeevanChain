import type { UserRole } from '../../types';

const roleDashboardMap: Record<UserRole, string> = {
  citizen: '/citizen/dashboard',
  hospital: '/hospital/dashboard',
  admin: '/admin/dashboard',
};

export const getDashboardPathForRole = (role: UserRole): string => roleDashboardMap[role];

export const dashboardPaths = Object.values(roleDashboardMap);

