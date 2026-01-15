import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'user' | 'judge' | 'admin';
export type AppRole = 'admin' | 'judge' | 'participant';

interface RoleContextType {
  role: UserRole;
  appRole: AppRole;
  isLoading: boolean;
  isAdmin: boolean;
  isJudge: boolean;
  canAccessAdmin: boolean;
  canAccessJudge: boolean;
  refetchRole: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

// Map database role to UI role
const mapAppRoleToUserRole = (appRole: AppRole | null): UserRole => {
  switch (appRole) {
    case 'admin':
      return 'admin';
    case 'judge':
      return 'judge';
    case 'participant':
    default:
      return 'user';
  }
};

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const { user, session, isLoading: authLoading } = useAuth();
  const [appRole, setAppRole] = useState<AppRole>('participant');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'participant' as AppRole;
      }

      return (data?.role as AppRole) || 'participant';
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      return 'participant' as AppRole;
    }
  };

  const refetchRole = async () => {
    if (user?.id) {
      const role = await fetchUserRole(user.id);
      setAppRole(role);
    }
  };

  useEffect(() => {
    const updateRole = async () => {
      if (authLoading) {
        return;
      }

      if (!user || !session) {
        setAppRole('participant');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const role = await fetchUserRole(user.id);
      setAppRole(role);
      setIsLoading(false);
    };

    updateRole();
  }, [user, session, authLoading]);

  const role = mapAppRoleToUserRole(appRole);
  const isAdmin = role === 'admin';
  const isJudge = role === 'judge';
  
  // Admin can access both admin and judge routes
  const canAccessAdmin = isAdmin;
  const canAccessJudge = isAdmin || isJudge;

  return (
    <RoleContext.Provider value={{
      role,
      appRole,
      isLoading: isLoading || authLoading,
      isAdmin,
      isJudge,
      canAccessAdmin,
      canAccessJudge,
      refetchRole,
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
