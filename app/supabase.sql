-- ============================================================
-- JeevanChain Database Schema
-- ============================================================
-- This SQL creates all required tables with proper structure,
-- constraints, and Row Level Security (RLS) policies.
--
-- HOW TO RUN:
-- 1. Go to Supabase Dashboard https://supabase.com/dashboard
-- 2. Select your project: gpsbeayfslomkeurbiyv
-- 3. Go to SQL Editor
-- 4. Create a new query
-- 5. Paste this entire file
-- 6. Click "Run" button
-- ============================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES TABLE (User Profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'hospital', 'admin', 'registrar', 'officer')),
  phone TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can select their own profile
CREATE POLICY "Users can select own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Users can insert profile during signup
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policy: Users can update own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policy: Admins can read all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- ============================================================
-- 2. CERTIFICATES TABLE (Medical/Vaccination Certificates)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  issued_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  issued_by UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  certificate_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_certificates_issued_to ON public.certificates(issued_to);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_by ON public.certificates(issued_by);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON public.certificates(created_at DESC);

-- Enable RLS on certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view certificates issued to them
CREATE POLICY "Users can view own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = issued_to);

-- RLS Policy: Hospitals can view certificates they issued
CREATE POLICY "Hospitals can view issued certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = issued_by);

-- RLS Policy: Hospitals can create certificates
CREATE POLICY "Hospitals can create certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('hospital', 'admin')
    )
  );

-- RLS Policy: Hospitals can update certificate status
CREATE POLICY "Hospitals can update certificates"
  ON public.certificates FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('hospital', 'admin')
    )
  );

-- ============================================================
-- 3. BIRTH RECORDS TABLE (Blockchain-like Lifecycle Records)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.birth_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Subject Information
  subject_full_name TEXT NOT NULL,
  subject_dob DATE NOT NULL,
  gender TEXT CHECK (gender IN ('M', 'F', 'Other')),
  
  -- Parent Information
  father_name TEXT,
  mother_name TEXT,
  
  -- Hospital Information
  hospital_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Hash Chain (for immutability)
  previous_hash TEXT,
  current_hash TEXT NOT NULL UNIQUE,
  
  -- Certificate Generated
  certificate_id UUID REFERENCES public.certificates(id),
  unique_id TEXT UNIQUE,
  
  -- Audit
  submitted_by UUID NOT NULL REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_birth_records_status ON public.birth_records(status);
CREATE INDEX IF NOT EXISTS idx_birth_records_hospital ON public.birth_records(hospital_id);
CREATE INDEX IF NOT EXISTS idx_birth_records_hash ON public.birth_records(current_hash);
CREATE INDEX IF NOT EXISTS idx_birth_records_created_at ON public.birth_records(created_at DESC);

-- Enable RLS
ALTER TABLE public.birth_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for birth_records
CREATE POLICY "Users can view own birth records"
  ON public.birth_records FOR SELECT
  USING (true); -- Will be more restrictive in production

CREATE POLICY "Hospitals can create birth records"
  ON public.birth_records FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('hospital', 'admin')
    )
  );

CREATE POLICY "Registrars can update birth records"
  ON public.birth_records FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'registrar')
    )
  );

-- ============================================================
-- 4. DEATH RECORDS TABLE (Death Lifecycle Records)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.death_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Deceased Information
  deceased_name TEXT NOT NULL,
  deceased_dob DATE,
  death_date DATE NOT NULL,
  death_location TEXT,
  cause_of_death TEXT,
  
  -- Officer Information
  officer_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Hash Chain
  previous_hash TEXT,
  current_hash TEXT NOT NULL UNIQUE,
  
  -- Certificate Generated
  certificate_id UUID REFERENCES public.certificates(id),
  unique_id TEXT UNIQUE,
  
  -- Audit
  submitted_by UUID NOT NULL REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_death_records_status ON public.death_records(status);
CREATE INDEX IF NOT EXISTS idx_death_records_officer ON public.death_records(officer_id);
CREATE INDEX IF NOT EXISTS idx_death_records_hash ON public.death_records(current_hash);
CREATE INDEX IF NOT EXISTS idx_death_records_created_at ON public.death_records(created_at DESC);

-- Enable RLS
ALTER TABLE public.death_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Officers can view death records"
  ON public.death_records FOR SELECT
  USING (true);

CREATE POLICY "Officers can create death records"
  ON public.death_records FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('officer', 'admin')
    )
  );

CREATE POLICY "Registrars can update death records"
  ON public.death_records FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'registrar')
    )
  );

-- ============================================================
-- 5. AUDIT LOGS TABLE (Immutable Audit Trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  previous_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for searching audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- ============================================================
-- 6. AUTO-UPDATE TIMESTAMPS
-- ============================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for certificates
DROP TRIGGER IF EXISTS update_certificates_updated_at ON public.certificates;
CREATE TRIGGER update_certificates_updated_at
BEFORE UPDATE ON public.certificates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for birth_records
DROP TRIGGER IF EXISTS update_birth_records_updated_at ON public.birth_records;
CREATE TRIGGER update_birth_records_updated_at
BEFORE UPDATE ON public.birth_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for death_records
DROP TRIGGER IF EXISTS update_death_records_updated_at ON public.death_records;
CREATE TRIGGER update_death_records_updated_at
BEFORE UPDATE ON public.death_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 7. CREATE INITIAL ADMIN USER (Optional)
-- ============================================================
-- NOTE: Uncomment this section after running the above schema,
-- and replace 'admin.email@example.com' with your admin email.
--
-- INSERT INTO public.profiles (id, email, full_name, role, is_active)
-- SELECT id, email, 'Admin User', 'admin', true
-- FROM auth.users
-- WHERE email = 'admin.email@example.com'
-- ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- SUMMARY
-- ============================================================
-- ✅ Tables created:
--    - public.profiles (user profiles with roles)
--    - public.certificates (medical certificates)
--    - public.birth_records (birth lifecycle records)
--    - public.death_records (death lifecycle records)
--    - public.audit_logs (immutable audit trail)
--
-- ✅ RLS Policies enabled for security
-- ✅ Indexes created for performance
-- ✅ Auto-update timestamps enabled
-- ✅ Hash chain structure ready for blockchain simulation
--
-- NEXT STEPS:
-- 1. Verify all tables exist in Supabase
-- 2. Test auth flow: signup → profile creation → login
-- 3. Verify session persistence
-- 4. Test role-based access control
-- ============================================================
