import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchProfile, createProfile, isDemoMode } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import type { UserRole, Profile } from '../../types';

// Debug logging helper
const DEBUG = {
  log: (event: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[AUTH ${timestamp}] ${event}`, data || '');
  },
  error: (event: string, error: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[AUTH ${timestamp}] ERROR: ${event}`, error);
  },
  warn: (event: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[AUTH ${timestamp}] WARNING: ${event}`, data || '');
  },
};

// Timeout helper
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
  ]);
};

interface AuthContextType {
  user: Profile | null;
  session: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role?: UserRole }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo profiles for testing
const demoProfiles: Record<string, Profile> = {
  'demo-citizen-1': {
    id: 'demo-citizen-1',
    email: 'citizen@demo.com',
    full_name: 'Demo Citizen',
    role: 'citizen',
    phone: null,
    address: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'demo-hospital-1': {
    id: 'demo-hospital-1',
    email: 'hospital@demo.com',
    full_name: 'Demo Hospital',
    role: 'hospital',
    phone: null,
    address: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'demo-admin-1': {
    id: 'demo-admin-1',
    email: 'admin@demo.com',
    full_name: 'Demo Admin',
    role: 'admin',
    phone: null,
    address: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const normalizeRole = (role: unknown): UserRole => {
    if (role === 'citizen' || role === 'hospital' || role === 'admin') return role;
    return 'citizen';
  };

  const loadProfileFromAuthUser = async (authUser: any): Promise<Profile | null> => {
    let profileResult;
    try {
      profileResult = await withTimeout(fetchProfile(authUser.id), 5000);
    } catch {
      profileResult = { data: null, error: new Error('Timeout') };
    }

    if (!profileResult.error && profileResult.data) return profileResult.data;

    // If profile doesn't exist yet, create it using auth metadata.
    const role = normalizeRole(authUser?.user_metadata?.role);
    const full_name =
      authUser?.user_metadata?.full_name ??
      authUser?.user_metadata?.fullName ??
      '';
    const email = authUser?.email ?? '';

    if (!email || !full_name) return null;

    const now = new Date().toISOString();
    const profileData: Profile = {
      id: authUser.id,
      email,
      full_name,
      role,
      phone: null,
      address: null,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    let createResult;
    try {
      createResult = await withTimeout(createProfile(profileData), 5000);
    } catch {
      createResult = { error: new Error('Timeout') };
    }

    if (createResult.error) {
      console.warn('Profile creation during auth bootstrap failed:', createResult.error.message);
    }

    let retryResult;
    try {
      retryResult = await withTimeout(fetchProfile(authUser.id), 5000);
    } catch {
      retryResult = { data: null, error: new Error('Timeout') };
    }

    return retryResult.data ?? null;
  };

  const refreshUser = async () => {
    try {
      if (isDemoMode) {
        // In demo mode, check localStorage for saved demo user
        const savedDemoUser = localStorage.getItem('demoUser');
        if (savedDemoUser) {
          const parsed = JSON.parse(savedDemoUser);
          setUser(parsed);
          setSession(true);
        }
        return;
      }

      const { data: { user: authUser }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !authUser) {
        setUser(null);
        setSession(false);
        return;
      }

      let profileResult;
      try {
        profileResult = await withTimeout(fetchProfile(authUser.id), 5000);
      } catch {
        profileResult = { data: null, error: new Error('Timeout') };
      }

      setUser(profileResult.data ?? null);
      setSession(true);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setInitError('Failed to initialize authentication');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      DEBUG.log('AUTH_INIT_START', { isDemoMode });
      setIsLoading(true);
      try {
        if (isDemoMode) {
          DEBUG.log('AUTH_INIT_DEMO_MODE');
          // Check for saved demo session
          const savedDemoUser = localStorage.getItem('demoUser');
          if (savedDemoUser) {
            const user = JSON.parse(savedDemoUser);
            setUser(user);
            setSession(true);
            DEBUG.log('AUTH_INIT_DEMO_RESTORED', { userId: user.id });
          }
          setIsLoading(false);
          return;
        }

        DEBUG.log('AUTH_INIT_CHECKING_SESSION');
        const { data: { session: initialSession }, error: sessionErr } = await supabase.auth.getSession();

        if (sessionErr) {
          DEBUG.error('AUTH_INIT_SESSION_ERROR', sessionErr);
          throw sessionErr;
        }

        if (initialSession?.user) {
          DEBUG.log('AUTH_INIT_SESSION_FOUND', { userId: initialSession.user.id });
          setSession(true);
          const profile = await loadProfileFromAuthUser(initialSession.user);
          setUser(profile);
          DEBUG.log('AUTH_INIT_SESSION_PROFILE_LOADED', { role: profile?.role });
        } else {
          DEBUG.log('AUTH_INIT_NO_SESSION');
          setUser(null);
          setSession(false);
        }
      } catch (error) {
        DEBUG.error('AUTH_INIT_FAILED', error);
        console.error('Auth initialization error:', error);
        setInitError('Authentication service unavailable');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    if (!isDemoMode) {
      DEBUG.log('AUTH_INIT_SETUP_STATE_LISTENER');
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        DEBUG.log('AUTH_STATE_CHANGED', { event });
        if (event === 'SIGNED_IN' && newSession?.user) {
          setIsLoading(true);
          setSession(true);
          const profile = await loadProfileFromAuthUser(newSession.user);
          setUser(profile);
          setIsLoading(false);
          DEBUG.log('AUTH_STATE_SIGNED_IN', { userId: newSession.user.id });
          return;
        }

        if (event === 'SIGNED_OUT') {
          setIsLoading(true);
          setUser(null);
          setSession(false);
          setIsLoading(false);
          DEBUG.log('AUTH_STATE_SIGNED_OUT');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      DEBUG.log('SIGNUP_START', { email, role, isDemoMode });
      setIsLoading(true);

      if (isDemoMode) {
        DEBUG.log('SIGNUP_DEMO_MODE');
        // Create demo user
        await new Promise(resolve => setTimeout(resolve, 1000));
        const demoUser: Profile = {
          id: `demo-${role}-${Date.now()}`,
          email,
          full_name: fullName,
          role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          phone: null,
          address: null,
        };
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        setUser(demoUser);
        setSession(true);
        setIsLoading(false);
        DEBUG.log('SIGNUP_DEMO_SUCCESS', { userId: demoUser.id });
        return { error: null };
      }

      DEBUG.log('SIGNUP_SUPABASE_AUTH_CALL');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        DEBUG.error('SIGNUP_AUTH_FAILED', error);
        setIsLoading(false);
        return { error: error as Error };
      }

      DEBUG.log('SIGNUP_AUTH_SUCCESS', { userId: data.user?.id });

      if (data.user) {
        const profileData: Profile = {
          id: data.user.id,
          email: data.user.email ?? email,
          full_name: fullName,
          role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          phone: null,
          address: null,
        };

        DEBUG.log('SIGNUP_CREATING_PROFILE', { userId: data.user.id });
        // Ensure profile row exists; if it already exists, refetch below.
        const { error: profileError } = await createProfile(profileData);
        if (profileError) {
          DEBUG.error('SIGNUP_PROFILE_CREATE_FAILED', profileError);
          console.warn('createProfile during signup failed:', profileError.message);
        } else {
          DEBUG.log('SIGNUP_PROFILE_CREATED');
        }
      }

      // After signup, Supabase may or may not have created a session
      // (e.g. depending on email confirmation settings).
      const { data: { session: latestSession }, error: sessionErr } = await supabase.auth.getSession();

      if (sessionErr) {
        DEBUG.error('SIGNUP_SESSION_FETCH_FAILED', sessionErr);
      }

      if (latestSession?.user) {
        DEBUG.log('SIGNUP_SESSION_EXISTS', { userId: latestSession.user.id });
        setSession(true);
        const profile = await loadProfileFromAuthUser(latestSession.user);
        setUser(profile);
      } else {
        DEBUG.log('SIGNUP_NO_SESSION_CREATED');
        setSession(false);
        setUser(null);
      }

      setIsLoading(false);
      DEBUG.log('SIGNUP_COMPLETE_SUCCESS');
      return { error: null };
    } catch (error) {
      DEBUG.error('SIGNUP_EXCEPTION', error);
      setIsLoading(false);
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      DEBUG.log('SIGNIN_START', { email, isDemoMode });
      setIsLoading(true);

      if (isDemoMode) {
        DEBUG.log('SIGNIN_DEMO_MODE');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Determine which demo user to use based on email
        let demoUser: Profile | null = null;
        if (email.includes('hospital')) {
          demoUser = demoProfiles['demo-hospital-1'];
        } else if (email.includes('admin')) {
          demoUser = demoProfiles['demo-admin-1'];
        } else {
          demoUser = demoProfiles['demo-citizen-1'];
        }
        
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        setUser(demoUser);
        setSession(true);
        setIsLoading(false);
        DEBUG.log('SIGNIN_DEMO_SUCCESS', { userId: demoUser?.id, role: demoUser?.role });
        return { error: null, role: demoUser?.role };
      }

      DEBUG.log('SIGNIN_SUPABASE_AUTH_CALL');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        DEBUG.error('SIGNIN_AUTH_FAILED', error);
        setIsLoading(false);
        return { error: error as Error };
      }

      DEBUG.log('SIGNIN_AUTH_SUCCESS', { userId: data.user?.id });

      if (data.user) {
        setSession(true);

        const profile = await loadProfileFromAuthUser(data.user);
        setUser(profile);
        DEBUG.log('SIGNIN_PROFILE_LOADED', { role: profile?.role });
        setIsLoading(false);
        return { error: null, role: profile?.role };
      }

      setSession(false);
      setUser(null);
      setIsLoading(false);
      DEBUG.log('SIGNIN_NO_USER_DATA');
      return { error: null };
    } catch (error) {
      DEBUG.error('SIGNIN_EXCEPTION', error);
      setIsLoading(false);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setIsLoading(true);

    if (isDemoMode) {
      localStorage.removeItem('demoUser');
      setUser(null);
      setSession(false);
      setIsLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(false);
    setIsLoading(false);
  };

  // Show error state if initialization failed
  if (initError && !isLoading) {
    return (
      <div className="min-h-screen bg-void-black flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <h2 className="font-display text-xl text-white mb-2">Service Unavailable</h2>
          <p className="text-text-secondary mb-4">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-neon-cyan text-void-black rounded-full font-medium hover:bg-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isDemoMode,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
