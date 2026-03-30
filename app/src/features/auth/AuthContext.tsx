import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchProfile, createProfile, isDemoMode } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import type { UserRole, Profile } from '../../types';

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

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await fetchProfile(authUser.id);
        setUser(profile);
        setSession(true);
      } else {
        setUser(null);
        setSession(false);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setInitError('Failed to initialize authentication');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        if (isDemoMode) {
          // Check for saved demo session
          const savedDemoUser = localStorage.getItem('demoUser');
          if (savedDemoUser) {
            setUser(JSON.parse(savedDemoUser));
            setSession(true);
          }
          setIsLoading(false);
          return;
        }

        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          const { data: profile } = await fetchProfile(initialSession.user.id);
          setUser(profile);
          setSession(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setInitError('Authentication service unavailable');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    if (!isDemoMode) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_IN' && newSession?.user) {
          const { data: profile } = await fetchProfile(newSession.user.id);
          setUser(profile);
          setSession(true);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      if (isDemoMode) {
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
        return { error: null };
      }

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

      if (error) throw error;

      if (data.user) {
        const profileData: Profile = {
          id: data.user.id,
          email,
          full_name: fullName,
          role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          phone: null,
          address: null,
        };
        
        const { error: profileError } = await createProfile(profileData);
        if (profileError) throw profileError;
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (isDemoMode) {
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
        return { error: null, role: demoUser.role };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await fetchProfile(data.user.id);
        setUser(profile);
        setSession(true);
        return { error: null, role: profile?.role };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('demoUser');
      setUser(null);
      setSession(false);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(false);
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
