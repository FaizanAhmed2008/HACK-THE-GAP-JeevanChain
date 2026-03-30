export type { Database, Certificate, Profile, UserRole } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: 'citizen' | 'hospital' | 'admin';
  full_name: string;
}

export interface CertificateFormData {
  title: string;
  description: string;
  issued_to: string;
  certificate_type: string;
}

export interface UserFormData {
  email: string;
  password: string;
  full_name: string;
  role: 'citizen' | 'hospital' | 'admin';
}
