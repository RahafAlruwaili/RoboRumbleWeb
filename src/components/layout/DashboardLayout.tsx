import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin, isJudge } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    // Skip if still loading auth or not authenticated
    if (authLoading || !isAuthenticated || !user?.id) {
      setCheckingProfile(false);
      return;
    }

    // Skip profile check for admins and judges
    if (isAdmin || isJudge) {
      setCheckingProfile(false);
      setProfileCompleted(true);
      return;
    }

    // Check if user's profile is completed
    const checkProfileCompletion = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking profile completion:', error);
          setCheckingProfile(false);
          return;
        }

        const isCompleted = data?.profile_completed === true;
        setProfileCompleted(isCompleted);

        // Redirect to complete-profile if not completed
        // Don't redirect if already on complete-profile or edit-profile page
        if (!isCompleted && !location.pathname.includes('complete-profile') && !location.pathname.includes('edit-profile')) {
          navigate('/complete-profile', { replace: true });
        }
      } catch (err) {
        console.error('Error in profile check:', err);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkProfileCompletion();
  }, [user?.id, isAuthenticated, authLoading, isAdmin, isJudge, navigate, location.pathname]);

  // Show loading while checking profile
  if (checkingProfile || authLoading) {
    return (
      <div className={cn(
        "min-h-screen flex flex-col dark",
        language === 'ar' ? 'font-arabic' : 'font-english'
      )}>
        <DashboardHeader />
        <main className="flex-1 pt-16 md:pt-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-white/60">
              {language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col dark",
      language === 'ar' ? 'font-arabic' : 'font-english'
    )}>
      <DashboardHeader />
      <main className="flex-1 pt-16 md:pt-20">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
