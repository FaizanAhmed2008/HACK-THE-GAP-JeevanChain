export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'citizen' | 'hospital' | 'admin'

export interface Certificate {
  id: string
  created_at: string
  updated_at: string
  title: string
  description: string | null
  issued_to: string
  issued_by: string
  status: 'pending' | 'approved' | 'rejected'
  certificate_type: string
  metadata: Json | null
}

export interface Profile {
  id: string
  created_at: string
  updated_at: string
  email: string
  full_name: string
  role: UserRole
  phone: string | null
  address: string | null
  is_active: boolean
}

// Simplified Database interface for type checking
export interface Database {
  public: {
    Tables: {
      certificates: {
        Row: Certificate
        Insert: Omit<Certificate, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Certificate>
      }
      profiles: {
        Row: Profile
        Insert: Profile
        Update: Partial<Profile>
      }
    }
  }
}
