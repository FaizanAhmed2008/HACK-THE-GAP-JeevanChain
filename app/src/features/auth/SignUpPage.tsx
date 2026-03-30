import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Disc, Info, UserCircle, Building2, Shield } from 'lucide-react';
import { useAuth } from './AuthContext';
import type { UserRole } from '../../types';
import type { LucideIcon } from 'lucide-react';

const roles: { value: UserRole; label: string; icon: LucideIcon; description: string }[] = [
  { value: 'citizen', label: 'Citizen', icon: UserCircle, description: 'Access your records and certificates' },
  { value: 'hospital', label: 'Hospital', icon: Building2, description: 'Issue and manage medical records' },
  { value: 'admin', label: 'Admin', icon: Shield, description: 'Manage users and approve certificates' },
];

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, isDemoMode } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password, fullName, selectedRole);
      
      if (signUpError) {
        setError(signUpError.message || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      // Redirect to appropriate dashboard
      const roleDashboardMap: Record<UserRole, string> = {
        citizen: '/citizen/dashboard',
        hospital: '/hospital/dashboard',
        admin: '/admin/dashboard',
      };

      navigate(roleDashboardMap[selectedRole]);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void-black flex items-center justify-center relative overflow-hidden py-12">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-neon-blue/5 rounded-full blur-3xl" />
      </div>

      {/* Node grid */}
      <div className="node-grid" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg px-6"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-neon-cyan/20 flex items-center justify-center">
              <Disc className="w-6 h-6 text-neon-cyan" />
            </div>
            <span className="font-display text-2xl text-white">JeevanChain</span>
          </Link>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 text-sm font-medium mb-1">Demo Mode Active</p>
                <p className="text-yellow-400/70 text-xs">
                  Accounts created in demo mode are stored locally and will be lost on page refresh.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form Card */}
        <div className="glass-card p-8">
          <h1 className="font-display text-3xl text-white text-center mb-2">
            Create Account
          </h1>
          <p className="text-text-secondary text-center mb-8">
            Join JeevanChain and secure your records
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block font-mono-custom text-xs text-white/50 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-mono-custom text-xs text-white/50 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block font-mono-custom text-xs text-white/50 uppercase tracking-wider mb-3">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => {
                  const IconComponent = role.icon;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={`p-4 rounded-xl border transition-all ${
                        selectedRole === role.value
                          ? 'border-neon-cyan bg-neon-cyan/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <IconComponent className={`w-6 h-6 mx-auto mb-2 ${
                        selectedRole === role.value ? 'text-neon-cyan' : 'text-white/50'
                      }`} />
                      <p className={`text-xs font-medium ${
                        selectedRole === role.value ? 'text-white' : 'text-white/50'
                      }`}>
                        {role.label}
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="text-white/40 text-xs mt-2 text-center">
                {roles.find(r => r.value === selectedRole)?.description}
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block font-mono-custom text-xs text-white/50 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-mono-custom text-xs text-white/50 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-neon-cyan text-void-black font-display text-sm uppercase tracking-wider rounded-full hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-void-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/40 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Sign In Link */}
          <p className="text-center text-text-secondary text-sm">
            Already have an account?{' '}
            <Link to="/signin" className="text-neon-cyan hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-white/40 text-sm hover:text-white/60 transition-colors">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
