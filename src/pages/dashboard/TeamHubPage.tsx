import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Crown, KeyRound, Cpu, ArrowLeft, ArrowRight } from 'lucide-react';

const TeamHubPage = () => {
  const { language, direction } = useLanguage();
  const { isAdmin, isJudge } = useRole();
  const navigate = useNavigate();
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  // Redirect admins and judges away from this page
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    } else if (isJudge) {
      navigate('/judge');
    }
  }, [isAdmin, isJudge, navigate]);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-logo-orange/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-logo-yellow/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-logo-red/8 rounded-full blur-3xl" />
      </div>

      {/* Decorative icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-8 md:left-16 opacity-20 animate-[spin_20s_linear_infinite]">
          <Cpu className="w-16 h-16 md:w-24 md:h-24 text-logo-orange" />
        </div>
        <div className="absolute bottom-20 right-8 md:right-16 opacity-15 animate-[spin_25s_linear_infinite_reverse]">
          <Cpu className="w-20 h-20 md:w-32 md:h-32 text-logo-yellow" />
        </div>
        <div className="absolute top-1/2 right-4 md:right-12 opacity-10">
          <Users className="w-24 h-24 md:w-36 md:h-36 text-logo-red" />
        </div>
      </div>

      <div className="w-full max-w-3xl relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {language === 'ar' ? 'الفريق' : 'Team'}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {language === 'ar' 
              ? 'أنشئ فريقك أو انضم لفريق موجود' 
              : 'Create your team or join an existing one'}
          </p>
        </div>

        {/* Team Options Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Team Card */}
          <div className="bg-card rounded-2xl shadow-card p-8 border border-border/50 hover:border-primary/50 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-logo-red to-logo-orange flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {language === 'ar' ? 'إنشاء فريق' : 'Create Team'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'ar' 
                ? 'ستصبح قائد الفريق وستحصل على كود لدعوة الأعضاء' 
                : 'You will become the team leader and get a code to invite members'}
            </p>
            <Button asChild variant="hero" size="lg" className="w-full">
              <Link to="/create-team" className="flex items-center justify-center gap-2">
                {language === 'ar' ? 'إنشاء فريق' : 'Create Team'}
                <ArrowIcon size={18} />
              </Link>
            </Button>
          </div>

          {/* Join Team Card */}
          <div className="bg-card rounded-2xl shadow-card p-8 border border-border/50 hover:border-secondary/50 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-logo-orange to-logo-yellow flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {language === 'ar' ? 'الانضمام لفريق' : 'Join Team'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'ar' 
                ? 'أدخل كود الفريق من القائد للانضمام' 
                : 'Enter the team code from your leader to join'}
            </p>
            <Button asChild variant="heroOutline" size="lg" className="w-full">
              <Link to="/join-team" className="flex items-center justify-center gap-2">
                {language === 'ar' ? 'انضمام' : 'Join'}
                <KeyRound size={18} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            {language === 'ar' 
              ? 'كل فريق يتكون من 5-4 أعضاء بأدوار محددة' 
              : 'Each team consists of 4-5 members with specific roles'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamHubPage;
