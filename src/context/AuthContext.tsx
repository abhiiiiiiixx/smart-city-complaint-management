import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types/database';
import { DEMO_PROFILES } from '../lib/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  allUsers: Profile[];
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  quickLoginWithPasskey: (
    targetRole: 'admin' | 'officer' | 'citizen',
    passkey: string
  ) => { success: boolean; error?: string };
  register: (data: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    address: string;
    city?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'smart_city_auth_user';
const LOCAL_STORAGE_ALL_USERS_KEY = 'smart_city_all_users';

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

  const [allUsers, setAllUsers] = useState<Profile[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_ALL_USERS_KEY);
    if (saved) {
      try {
        const parsed: Profile[] = JSON.parse(saved);
        const combined = [...DEMO_PROFILES];
        parsed.forEach((p) => {
          if (!combined.some((c) => c.id === p.id || c.email.toLowerCase() === p.email.toLowerCase())) {
            combined.push(p);
          }
        });
        return combined;
      } catch {
        return DEMO_PROFILES;
      }
    }
    return DEMO_PROFILES;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ALL_USERS_KEY, JSON.stringify(allUsers));
  }, [allUsers]);

  // Sync profiles from Supabase if connected
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase
        .from('profiles')
        .select('*')
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setAllUsers((prev) => {
              const merged = [...prev];
              (data as Profile[]).forEach((p) => {
                const idx = merged.findIndex((m) => m.id === p.id || m.email.toLowerCase() === p.email.toLowerCase());
                if (idx >= 0) {
                  merged[idx] = p;
                } else {
                  merged.push(p);
                }
              });
              return merged;
            });
          }
        });
    }
  }, []);

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

      // Fallback matching registered users and demo profiles
      const cleanEmail = email.toLowerCase().trim();
      const matched = allUsers.find(
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
      setAllUsers((prev) => [newCitizen, ...prev]);
      setUser(newCitizen);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  // Secure Passkey verification for 1-click evaluation accounts
  const quickLoginWithPasskey = (
    targetRole: 'admin' | 'officer' | 'citizen',
    passkey: string
  ): { success: boolean; error?: string } => {
    if (passkey.trim() !== '769757') {
      return { success: false, error: 'Invalid Security Passkey! Access Denied.' };
    }

    let targetProfile: Profile;
    if (targetRole === 'admin') {
      targetProfile = DEMO_PROFILES[0]; // Abhijeet Shah, IAS
    } else if (targetRole === 'officer') {
      targetProfile = DEMO_PROFILES[1]; // Er. Vikram Malhotra
    } else {
      targetProfile = DEMO_PROFILES[4]; // Rahul Sharma (Citizen)
    }

    setUser(targetProfile);
    return { success: true };
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

      // Add to dynamic allUsers so Admin Citizen Directory sees this immediately!
      setAllUsers((prev) => [profile, ...prev.filter((p) => p.email.toLowerCase() !== profile.email.toLowerCase())]);
      setUser(profile);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
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
      setAllUsers((prev) => [fallbackProfile, ...prev.filter((p) => p.email.toLowerCase() !== fallbackProfile.email.toLowerCase())]);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        allUsers,
        login,
        quickLoginWithPasskey,
        register,
        logout,
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
