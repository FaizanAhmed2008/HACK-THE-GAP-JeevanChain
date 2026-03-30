import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Disc, 
  LogOut, 
  Menu, 
  ChevronDown,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../auth';
import type { UserRole } from '../../../types';

import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  navItems: NavItem[];
}

const roleLabels: Record<UserRole, string> = {
  citizen: 'Citizen Portal',
  hospital: 'Hospital Dashboard',
  admin: 'Admin Panel',
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  role, 
  navItems 
}) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-void-black flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isSidebarOpen ? 0 : '-100%',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-void-dark border-r border-white/5 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center">
              <Disc className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <span className="font-display text-lg text-white block">JeevanChain</span>
              <span className="font-mono-custom text-xs text-neon-cyan/70 uppercase tracking-wider">
                {roleLabels[role]}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/60 hover:bg-white/5 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-8">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-white/60"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page Title */}
          <h1 className="font-display text-xl text-white hidden lg:block">
            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h1>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-neon-cyan" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm text-white font-medium">{user?.full_name}</p>
                <p className="text-xs text-white/50 capitalize">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-white/40" />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-56 glass-card py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm text-white font-medium">{user?.full_name}</p>
                    <p className="text-xs text-white/50">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-2 px-4 py-3 w-full text-red-400 hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
