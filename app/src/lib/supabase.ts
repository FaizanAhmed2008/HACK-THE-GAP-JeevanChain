import { createClient } from '@supabase/supabase-js';
import type { Certificate, Profile } from '../types';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const isValidUrl = (value: string) => {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const isLikelyAnonKey = (value: string) => {
  if (!value) return false;
  if (value === 'your_anon_key_here') return false;
  // Supabase anon keys are JWTs (start with "eyJ") or publishable keys (start with "sb_").
  if (!(value.startsWith('eyJ') || value.startsWith('sb_'))) return false;
  // Truncated keys are a common failure mode; require a reasonable length.
  if (value.length < 80) return false;
  return true;
};

// Check if credentials are available and look valid
const hasCredentials = isValidUrl(supabaseUrl) && isLikelyAnonKey(supabaseAnonKey);

if (!hasCredentials && (supabaseUrl || supabaseAnonKey)) {
  console.warn(
    '[Supabase] Invalid or incomplete credentials detected. Falling back to demo mode. ' +
      'Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local with full values.'
  );
}

// Create client only if credentials exist, otherwise create a mock client
export const supabase = hasCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder');

// Demo mode flag
export const isDemoMode = !hasCredentials;

// Demo data for when Supabase is not configured
const demoCitizen: Profile = {
  id: 'demo-citizen-1',
  email: 'citizen@demo.com',
  full_name: 'Demo Citizen',
  role: 'citizen',
  phone: null,
  address: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const demoHospital: Profile = {
  id: 'demo-hospital-1',
  email: 'hospital@demo.com',
  full_name: 'Demo Hospital',
  role: 'hospital',
  phone: null,
  address: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const demoAdmin: Profile = {
  id: 'demo-admin-1',
  email: 'admin@demo.com',
  full_name: 'Demo Admin',
  role: 'admin',
  phone: null,
  address: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const demoCertificates: Certificate[] = [
  {
    id: 'cert-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: 'COVID-19 Vaccination Certificate',
    description: 'Second dose completed',
    issued_to: 'demo-citizen-1',
    issued_by: 'demo-hospital-1',
    status: 'approved',
    certificate_type: 'vaccination',
    metadata: null,
  },
  {
    id: 'cert-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: 'Annual Health Checkup',
    description: 'Routine health examination results',
    issued_to: 'demo-citizen-1',
    issued_by: 'demo-hospital-1',
    status: 'pending',
    certificate_type: 'medical_record',
    metadata: null,
  },
  {
    id: 'cert-3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    title: 'Blood Test Report',
    description: 'Complete blood count analysis',
    issued_to: 'demo-citizen-1',
    issued_by: 'demo-hospital-1',
    status: 'approved',
    certificate_type: 'lab_report',
    metadata: null,
  },
];

// Auth helpers with demo mode support
export const signUp = async (
  email: string, 
  password: string, 
  metadata: { role: string; full_name: string }
) => {
  if (isDemoMode) {
    // Simulate signup in demo mode
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      data: { 
        user: { 
          id: `demo-${Date.now()}`, 
          email,
          user_metadata: metadata 
        } 
      }, 
      error: null 
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  if (isDemoMode) {
    // Simulate login in demo mode
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Determine role from email for demo
    let role = 'citizen';
    let profile = demoCitizen;
    if (email.includes('hospital')) {
      role = 'hospital';
      profile = demoHospital;
    } else if (email.includes('admin')) {
      role = 'admin';
      profile = demoAdmin;
    }
    
    return { 
      data: { 
        user: { 
          id: profile.id, 
          email,
          user_metadata: { role, full_name: profile.full_name }
        } 
      }, 
      error: null 
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (isDemoMode) {
    return { user: null, error: null };
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getSession = async () => {
  if (isDemoMode) {
    return { session: null, error: null };
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Certificate helpers with demo mode
export const fetchCertificates = async (userId?: string, issuedBy?: string) => {
  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...demoCertificates];
    if (userId) {
      filtered = filtered.filter(c => c.issued_to === userId);
    }
    if (issuedBy) {
      filtered = filtered.filter(c => c.issued_by === issuedBy);
    }
    return { data: filtered, error: null };
  }

  let query = supabase.from('certificates').select('*');
  
  if (userId) {
    query = query.eq('issued_to', userId);
  }
  
  if (issuedBy) {
    query = query.eq('issued_by', issuedBy);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  return { data: data as Certificate[] | null, error };
};

export const createCertificate = async (certificate: Omit<Certificate, 'id' | 'created_at' | 'updated_at'>) => {
  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newCert: Certificate = {
      ...certificate,
      id: `cert-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demoCertificates.unshift(newCert);
    return { data: newCert, error: null };
  }

  const { data, error } = await supabase
    .from('certificates')
    .insert(certificate)
    .select()
    .single();
  return { data: data as Certificate | null, error };
};

export const updateCertificateStatus = async (certId: string, status: 'approved' | 'rejected') => {
  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const cert = demoCertificates.find(c => c.id === certId);
    if (cert) {
      cert.status = status;
      cert.updated_at = new Date().toISOString();
    }
    return { data: cert || null, error: null };
  }

  const { data, error } = await supabase
    .from('certificates')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', certId)
    .select()
    .single();
  return { data: data as Certificate | null, error };
};

// Profile helpers with demo mode
export const fetchProfile = async (userId: string) => {
  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (userId.includes('hospital')) return { data: demoHospital, error: null };
    if (userId.includes('admin')) return { data: demoAdmin, error: null };
    return { data: demoCitizen, error: null };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data: data as Profile | null, error };
};

export const fetchProfiles = async () => {
  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: [demoCitizen, demoHospital, demoAdmin], error: null };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return { data: data as Profile[] | null, error };
};

export const createProfile = async (profile: Profile) => {
  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: profile, error: null };
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
  return { data: data as Profile | null, error };
};

export const findProfileByEmail = async (email: string) => {
  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (email.includes('hospital')) return { data: { id: demoHospital.id }, error: null };
    if (email.includes('admin')) return { data: { id: demoAdmin.id }, error: null };
    return { data: { id: demoCitizen.id }, error: null };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();
  return { data: data as { id: string } | null, error };
};
