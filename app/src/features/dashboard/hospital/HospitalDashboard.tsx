import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  CheckCircle, 
  Clock, 
  Search,
  User,
  X,
  Send
} from 'lucide-react';
import { supabase, findProfileByEmail } from '../../../lib/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import type { Certificate } from '../../../types';

const navItems = [
  { label: 'Issued Records', path: '/hospital/dashboard', icon: FileText },
];

export const HospitalDashboard: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issued_to_email: '',
    certificate_type: 'medical_record',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

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
        .eq('issued_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCertificates((data as Certificate[]) || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      // Find user by email
      const { data: userData, error: userError } = await findProfileByEmail(formData.issued_to_email);

      if (userError || !userData) {
        setFormError('User not found with this email address');
        setIsSubmitting(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFormError('You must be logged in');
        setIsSubmitting(false);
        return;
      }

      const newCertificate = {
        title: formData.title,
        description: formData.description,
        issued_to: userData.id,
        issued_by: user.id,
        certificate_type: formData.certificate_type,
        status: 'pending' as const,
      };

      const { error } = await supabase.from('certificates').insert(newCertificate);

      if (error) throw error;

      setFormSuccess('Certificate created successfully!');
      setFormData({
        title: '',
        description: '',
        issued_to_email: '',
        certificate_type: 'medical_record',
      });
      
      // Refresh certificates list
      fetchCertificates();
      
      // Close modal after delay
      setTimeout(() => {
        setShowCreateModal(false);
        setFormSuccess('');
      }, 1500);
    } catch (error: any) {
      setFormError(error.message || 'Failed to create certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.certificate_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <DashboardLayout role="hospital" navItems={navItems}>
      <div className="space-y-8">
        {/* Welcome */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-3xl text-white mb-2">Issued Records</h2>
            <p className="text-text-secondary">Create and manage patient certificates</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-neon-cyan text-void-black font-display text-sm uppercase tracking-wider rounded-full hover:bg-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Certificate
          </button>
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
              <span className="font-mono-custom text-xs text-white/50 uppercase">Total Issued</span>
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issued records..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50"
          />
        </div>

        {/* Certificates List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2">No records issued yet</h3>
            <p className="text-text-secondary mb-6">Create your first certificate to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-full hover:bg-neon-cyan hover:text-void-black transition-colors"
            >
              Create Certificate
            </button>
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusClass(cert.status)}`}>
                    {cert.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Certificate Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-lg max-h-[90vh] overflow-auto"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-display text-xl text-white">Create Certificate</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCertificate} className="p-6 space-y-6">
                {formError && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                    {formSuccess}
                  </div>
                )}

                <div>
                  <label className="block font-mono-custom text-xs text-white/50 uppercase tracking-wider mb-2">
                    Certificate Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50"
                    placeholder="e.g., Medical Checkup Report"
                  />
                </div>

                <div>
                  <label className="block font-mono-custom text-xs text-white/50 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 resize-none"
                    placeholder="Enter certificate details..."
                  />
                </div>

                <div>
                  <label className="block font-mono-custom text-xs text-white/50 uppercase tracking-wider mb-2">
                    Recipient Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={formData.issued_to_email}
                      onChange={(e) => setFormData({ ...formData, issued_to_email: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50"
                      placeholder="patient@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono-custom text-xs text-white/50 uppercase tracking-wider mb-2">
                    Certificate Type
                  </label>
                  <select
                    value={formData.certificate_type}
                    onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-neon-cyan/50 appearance-none cursor-pointer"
                  >
                    <option value="medical_record" className="bg-void-dark">Medical Record</option>
                    <option value="vaccination" className="bg-void-dark">Vaccination</option>
                    <option value="lab_report" className="bg-void-dark">Lab Report</option>
                    <option value="prescription" className="bg-void-dark">Prescription</option>
                    <option value="other" className="bg-void-dark">Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-neon-cyan text-void-black font-display text-sm uppercase tracking-wider rounded-full hover:bg-white transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-void-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Create Certificate
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};
