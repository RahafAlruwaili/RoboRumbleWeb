import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  hasTeam?: boolean;
  teamId?: string;
  teamStatus?: string; // Team acceptance status: pending, approved, final_approved, rejected
}

interface LoginResult {
  success: boolean;
  error?: 'incorrect_password' | 'invalid_credentials' | 'unknown';
}

interface SignupResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  signup: (email: string, password: string, fullName?: string) => Promise<SignupResult>;
  logout: () => Promise<void>;
  setUserTeam: (teamId: string) => void;
  clearUserTeam: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  };

  // Check if user has a team - prioritize team where user is leader
  const checkUserTeam = async (userId: string) => {
    try {
      // First check if user is a leader of any team
      const { data: leaderTeam, error: leaderError } = await supabase
        .from('teams')
        .select('id, status')
        .eq('leader_id', userId)
        .limit(1);

      if (leaderError) {
        console.error('Error checking leader team:', leaderError);
      }

      if (leaderTeam && leaderTeam.length > 0) {
        console.log('User is leader of team:', leaderTeam[0].id);
        return { hasTeam: true, teamId: leaderTeam[0].id, teamStatus: leaderTeam[0].status };
      }

      // If not a leader, check team membership (get earliest joined)
      const { data, error } = await supabase
        .from('team_members')
        .select('team_id, teams!inner(status)')
        .eq('user_id', userId)
        .order('joined_at', { ascending: true })
        .limit(1);

      if (error) {
        console.error('Error checking team:', error);
        return { hasTeam: false, teamId: undefined, teamStatus: undefined };
      }

      const hasTeam = data && data.length > 0;
      const teamId = hasTeam ? data[0].team_id : undefined;
      const teamStatus = hasTeam ? (data[0] as any).teams?.status : undefined;

      console.log('checkUserTeam result:', { userId, hasTeam, teamId, teamStatus });

      return { hasTeam, teamId, teamStatus };
    } catch (err) {
      console.error('Error in checkUserTeam:', err);
      return { hasTeam: false, teamId: undefined, teamStatus: undefined };
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);

        if (currentSession?.user) {
          const authUser: AuthUser = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            name: currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0] || '',
          };
          setUser(authUser);

          // Defer Supabase calls with setTimeout to avoid deadlock
          setTimeout(async () => {
            const profileData = await fetchProfile(currentSession.user.id);
            if (profileData) {
              setProfile(profileData);
              setUser(prev => prev ? { ...prev, name: profileData.full_name || prev.name } : prev);
            }

            const teamInfo = await checkUserTeam(currentSession.user.id);
            setUser(prev => prev ? { ...prev, ...teamInfo } : prev);
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (existingSession?.user) {
        setSession(existingSession);
        const authUser: AuthUser = {
          id: existingSession.user.id,
          email: existingSession.user.email || '',
          name: existingSession.user.user_metadata?.full_name || existingSession.user.email?.split('@')[0] || '',
        };
        setUser(authUser);

        // Fetch additional data
        setTimeout(async () => {
          const profileData = await fetchProfile(existingSession.user.id);
          if (profileData) {
            setProfile(profileData);
            setUser(prev => prev ? { ...prev, name: profileData.full_name || prev.name } : prev);
          }

          const teamInfo = await checkUserTeam(existingSession.user.id);
          setUser(prev => prev ? { ...prev, ...teamInfo } : prev);
        }, 0);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'invalid_credentials' };
        }
        return { success: false, error: 'unknown' };
      }

      return { success: true };
    } catch (err) {
      console.error('Login exception:', err);
      return { success: false, error: 'unknown' };
    }
  };

  const signup = async (email: string, password: string, fullName?: string): Promise<SignupResult> => {
    try {
      const redirectUrl = `${window.location.origin}/complete-profile`;
      const name = fullName || email.split('@')[0];

      // Check if email already exists in profiles table
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingProfile) {
        return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً / Email already registered' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('already registered')) {
          return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً / Email already registered' };
        }
        if (error.message.includes('rate limit')) {
          return { success: false, error: 'تم تجاوز حد المحاولات المسموح بها. يرجى الانتظار والمحاولة لاحقاً. / Rate limit exceeded. Please wait.' };
        }
        return { success: false, error: error.message };
      }

      // Check if user already exists - Supabase returns empty identities for existing emails
      if (data?.user?.identities && data.user.identities.length === 0) {
        return { success: false, error: 'البريد الإلكتروني مسجل مسبقاً / Email already registered' };
      }

      // Send welcome email
      try {
        console.log('Attemping to send welcome email to:', email);
        const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: { email, fullName: name },
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          }
        });

        if (emailError) {
          console.error('Error response from send-welcome-email:', emailError);
        } else {
          console.log('Welcome email sent successfully');
        }
      } catch (emailErr) {
        console.error('Exception sending welcome email:', emailErr);
        // Don't fail signup if email fails
      }

      return { success: true };
    } catch (err) {
      console.error('Signup exception:', err);
      return { success: false, error: 'حدث خطأ غير متوقع' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    localStorage.removeItem('roborumble-role');
  };

  const setUserTeam = (teamId: string) => {
    if (user) {
      setUser({ ...user, hasTeam: true, teamId });
    }
  };

  const clearUserTeam = () => {
    if (user) {
      setUser({ ...user, hasTeam: false, teamId: undefined });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Use our custom Edge Function to generate the link and send the email
      // We do NOT use supabase.auth.resetPasswordForEmail anymore to avoid duplicate/confusing emails
      try {
        console.log('Attemping to send password reset email to:', email);
        const { error: emailError } = await supabase.functions.invoke('send-password-reset-email', {
          body: {
            email,
            redirectTo: `${window.location.origin}/auth?mode=reset`
          },
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          }
        });

        if (emailError) {
          console.error('Error response from send-password-reset-email:', emailError);
          return { success: false, error: 'Failed to send email' };
        }

        console.log('Password reset email sent successfully');
        return { success: true };
      } catch (emailErr) {
        console.error('Exception sending password reset email:', emailErr);
        return { success: false, error: 'Exception sending email' };
      }
    } catch (err) {
      return { success: false, error: 'حدث خطأ غير متوقع' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isAuthenticated: !!user && !!session,
      isLoading,
      login,
      signup,
      logout,
      setUserTeam,
      clearUserTeam,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
