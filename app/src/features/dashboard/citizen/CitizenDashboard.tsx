import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Download, 
  Search,
  Filter,
  Award
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import type { Certificate } from '../../../types';

const navItems = [
  { label: 'My Certificates', path: '/citizen/dashboard', icon: FileText },
];

export const CitizenDashboard: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('issued_to', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCertificates((data as Certificate[]) || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.certificate_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || cert.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: certificates.length,
    approved: certificates.filter(c => c.status === 'approved').length,
    pending: certificates.filter(c => c.status === 'pending').length,
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

  return (
    <DashboardLayout role="citizen" navItems={navItems}>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="font-display text-3xl text-white mb-2">My Certificates</h2>
          <p className="text-text-secondary">View and manage your verified records</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-neon-cyan/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-neon-cyan" />
              </div>
              <span className="font-mono-custom text-xs text-white/50 uppercase">Total</span>
            </div>
            <p className="font-display text-3xl text-white">{stats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-400/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="font-mono-custom text-xs text-white/50 uppercase">Approved</span>
            </div>
            <p className="font-display text-3xl text-white">{stats.approved}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="font-mono-custom text-xs text-white/50 uppercase">Pending</span>
            </div>
            <p className="font-display text-3xl text-white">{stats.pending}</p>
          </motion.div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search certificates..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-8 text-white focus:outline-none focus:border-neon-cyan/50 appearance-none cursor-pointer"
            >
              <option value="all" className="bg-void-dark">All Status</option>
              <option value="approved" className="bg-void-dark">Approved</option>
              <option value="pending" className="bg-void-dark">Pending</option>
              <option value="rejected" className="bg-void-dark">Rejected</option>
            </select>
          </div>
        </div>

        {/* Certificates List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Award className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2">No certificates yet</h3>
            <p className="text-text-secondary">Your verified records will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCertificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6 card-shine hover:border-neon-cyan/30 transition-colors"
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
                    {cert.status === 'approved' && (
                      <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-neon-cyan transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
