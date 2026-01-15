import { Navigate } from 'react-router-dom';
import { useRole, UserRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/team-hub' 
}) => {
  const { role, isLoading: roleLoading } = useRole();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  const [hasShownToast, setHasShownToast] = useState(false);

  const isLoading = authLoading || roleLoading;
  const hasAccess = allowedRoles.includes(role);

  useEffect(() => {
    if (!isLoading && !hasAccess && !hasShownToast && isAuthenticated) {
      toast({
        title: language === 'ar' ? 'غير مصرح' : 'Not Authorized',
        description: language === 'ar' 
          ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة' 
          : 'You do not have permission to access this page',
        variant: 'destructive',
      });
      setHasShownToast(true);
    }
  }, [hasAccess, hasShownToast, language, isLoading, isAuthenticated]);

  // Show loading while checking auth and role
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if no access
  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
