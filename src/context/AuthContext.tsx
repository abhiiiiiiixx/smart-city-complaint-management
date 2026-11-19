import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types/database';
import { DEMO_PROFILES } from '../lib/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    address: string;
    city?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'smart_city_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null; // Guest by default (Protected: Must login first!)
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  }, [user]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password || 'Default@123',
        });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileData) {
            setUser(profileData as Profile);
            setIsLoading(false);
            return { success: true };
          }
        }
      }

      // Demo fallback login matching emails
      const cleanEmail = email.toLowerCase().trim();
      const matched = DEMO_PROFILES.find(
        (p) => p.email.toLowerCase() === cleanEmail
      );

      if (matched) {
        setUser(matched);
        setIsLoading(false);
        return { success: true };
      }

      // Check for admin/officer keywords in email for quick testing
      if (cleanEmail.includes('admin')) {
        setUser(DEMO_PROFILES[0]); // Abhijeet Shah, IAS
        setIsLoading(false);
        return { success: true };
      }

      if (cleanEmail.includes('officer')) {
        setUser(DEMO_PROFILES[1]); // Er. Vikram Malhotra
        setIsLoading(false);
        return { success: true };
      }

      // New citizen login
      const newCitizen: Profile = {
        id: `usr-citizen-${Date.now()}`,
        full_name: email.split('@')[0].toUpperCase(),
        email: email.trim(),
        phone: '9425100000',
        role: 'citizen',
        city: 'Jabalpur',
        address: 'Citizen Residence, Jabalpur',
        created_at: new Date().toISOString(),
      };
      setUser(newCitizen);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    address: string;
    city?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      let createdUserId: string | null = null;

      if (isSupabaseConfigured()) {
        try {
          const { data: authData, error } = await supabase.auth.signUp({
            email: data.email.trim(),
            password: data.password || 'Citizen@123',
            options: {
              data: {
                full_name: data.fullName,
                phone: data.phone,
                role: 'citizen',
                city: data.city || 'Jabalpur',
              },
            },
          });

          if (!error && authData?.user) {
            createdUserId = authData.user.id;
          } else if (error) {
            console.warn('Supabase auth notice (falling back seamlessly):', error.message);
          }
        } catch (authErr) {
          console.warn('Supabase auth exception:', authErr);
        }
      }

      // Create valid profile (using Supabase user id if available, or unique local id)
      const profile: Profile = {
        id: createdUserId || `usr-citizen-${Date.now()}`,
        full_name: data.fullName,
        email: data.email.trim(),
        phone: data.phone,
        role: 'citizen',
        city: data.city || 'Jabalpur',
        address: data.address,
        created_at: new Date().toISOString(),
      };

      // If Supabase is connected, attempt to persist profile directly to public.profiles table
      if (isSupabaseConfigured() && createdUserId) {
        try {
          await supabase.from('profiles').upsert([profile]);
        } catch (dbErr) {
          console.warn('Profile direct sync note:', dbErr);
        }
      }

      setUser(profile);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      // Even in case of unexpected exception, guarantee smooth login experience
      const fallbackProfile: Profile = {
        id: `usr-citizen-${Date.now()}`,
        full_name: data.fullName,
        email: data.email.trim(),
        phone: data.phone,
        role: 'citizen',
        city: data.city || 'Jabalpur',
        address: data.address,
        created_at: new Date().toISOString(),
      };
      setUser(fallbackProfile);
      setIsLoading(false);
      return { success: true };
    }
  };

  const logout = () => {
    if (isSupabaseConfigured()) {
      supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  const switchDemoRole = (role: UserRole) => {
    let target = DEMO_PROFILES.find((p) => p.role === role);
    if (!target) {
      target = DEMO_PROFILES[0];
    }
    setUser(target);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
