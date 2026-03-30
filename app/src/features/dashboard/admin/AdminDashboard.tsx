import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Shield,
  UserCheck
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import type { Certificate, Profile } from '../../../types';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: Shield },
];

export const AdminDashboard: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'certificates' | 'users'>('certificates');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all certificates
      const { data: certData, error: certError } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (certError) throw certError;
      setCertificates((certData as Certificate[]) || []);

      // Fetch all users
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) throw userError;
      setUsers((userData as Profile[]) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (certId: string) => {
    setProcessingId(certId);
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', certId);

      if (error) throw error;
      
      // Update local state
      setCertificates(prev => prev.map(cert => 
        cert.id === certId ? { ...cert, status: 'approved' } : cert
      ));
    } catch (error) {
      console.error('Error approving certificate:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (certId: string) => {
    setProcessingId(certId);
    try {
      const { error } = await supabase
        .from('certificates')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', certId);

      if (error) throw error;
      
      // Update local state
      setCertificates(prev => prev.map(cert => 
        cert.id === certId ? { ...cert, status: 'rejected' } : cert
      ));
    } catch (error) {
      console.error('Error rejecting certificate:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.certificate_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalCertificates: certificates.length,
    pendingCertificates: certificates.filter(c => c.status === 'pending').length,
    totalUsers: users.length,
    approvedCertificates: certificates.filter(c => c.status === 'approved').length,
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-400/10 text-green-400 border-green-400/30';
      case 'pending':
        return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30';
      case 'rejected':
        return 'bg-red-400/10 text-red-400 border-red-400/30';
      default:
        return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'citizen':
        return <UserCheck className="w-4 h-4" />;
      case 'hospital':
        return <Shield className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-neon-cyan" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout role="admin" navItems={navItems}>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="font-display text-3xl text-white mb-2">Admin Dashboard</h2>
          <p className="text-text-secondary">Manage certificates, users, and system settings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-neon-cyan/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-neon-cyan" />
              </div>
              <span className="font-mono-custom text-xs text-white/50 uppercase">Total Certs</span>
            </div>
            <p className="font-display text-3xl text-white">{stats.totalCertificates}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="font-mono-custom text-xs text-white/50 uppercase">Pending</span>
            </div>
            <p className="font-display text-3xl text-white">{stats.pendingCertificates}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-400/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="font-mono-custom text-xs text-white/50 uppercase">Approved</span>
            </div>
            <p className="font-display text-3xl text-white">{stats.approvedCertificates}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-neon-blue/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-neon-blue" />
              </div>
              <span className="font-mono-custom text-xs text-white/50 uppercase">Users</span>
            </div>
            <p className="font-display text-3xl text-white">{stats.totalUsers}</p>
          </motion.div>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'certificates'
                  ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              Certificates
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              Users
            </button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'certificates' ? (
          <div className="space-y-4">
            {filteredCertificates.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="font-display text-xl text-white mb-2">No certificates found</h3>
                <p className="text-text-secondary">Certificates will appear here once created</p>
              </div>
            ) : (
              filteredCertificates.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-neon-cyan" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-white mb-1">{cert.title}</h3>
                        <p className="text-text-secondary text-sm mb-2">{cert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-white/50">
                          <span className="font-mono-custom uppercase tracking-wider">
                            {cert.certificate_type}
                          </span>
                          <span>•</span>
                          <span>{new Date(cert.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusClass(cert.status)}`}>
                        {cert.status}
                      </span>
                      {cert.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(cert.id)}
                            disabled={processingId === cert.id}
                            className="p-2 rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            {processingId === cert.id ? (
                              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(cert.id)}
                            disabled={processingId === cert.id}
                            className="p-2 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="font-display text-xl text-white mb-2">No users found</h3>
                <p className="text-text-secondary">Users will appear here once registered</p>
              </div>
            ) : (
              filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center">
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-white mb-1">{user.full_name}</h3>
                        <p className="text-text-secondary text-sm">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${
                        user.role === 'admin' 
                          ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30'
                          : 'bg-white/5 text-white/60 border-white/10'
                      }`}>
                        {user.role}
                      </span>
                      <span className="text-white/40 text-sm">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
