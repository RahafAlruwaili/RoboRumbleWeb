import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateTeam } from '@/hooks/useTeams';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, ArrowLeft, ArrowRight, Cpu, Crown, Sparkles, Gamepad2, Code, Wrench, Check, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { TEAM_ROLES, getRoleDisplayName, getRoleDescription, TeamRole } from '@/lib/teamRolesValidation';

interface RoleOption {
  id: TeamRole;
  icon: React.ElementType;
  color: string;
}

const CreateTeamPage = () => {
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createTeam, loading: isCreating } = useCreateTeam();
  const [teamName, setTeamName] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [checkingTeam, setCheckingTeam] = useState(true);
  const [existingTeam, setExistingTeam] = useState<{ id: string; name: string } | null>(null);

  // Check if user already has a team as leader
  useEffect(() => {
    const checkExistingTeam = async () => {
      if (!user?.id) {
        setCheckingTeam(false);
        return;
      }

      try {
        // Check if user is already a leader of any team
        const { data: leaderTeam, error } = await supabase
          .from('teams')
          .select('id, name')
          .eq('leader_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (leaderTeam) {
          setExistingTeam(leaderTeam);
        }
      } catch (error) {
        console.error('Error checking existing team:', error);
      } finally {
        setCheckingTeam(false);
      }
    };

    checkExistingTeam();
  }, [user?.id]);

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  // Available roles for team creation (4 roles as per new rules)
  const roleOptions: RoleOption[] = [
    { id: TEAM_ROLES.DRIVER, icon: Gamepad2, color: 'from-red-500 to-orange-500' },
    { id: TEAM_ROLES.PROGRAMMER, icon: Code, color: 'from-blue-500 to-cyan-500' },
    { id: TEAM_ROLES.ELECTRONICS, icon: Cpu, color: 'from-green-500 to-emerald-500' },
    { id: TEAM_ROLES.MECHANICS_DESIGNER, icon: Wrench, color: 'from-purple-500 to-pink-500' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (existingTeam) {
      toast.error(language === 'ar' ? 'لديك فريق بالفعل!' : 'You already have a team!');
      return;
    }

    if (!selectedRole) {
      toast.error(language === 'ar' ? 'يرجى اختيار دورك في الفريق' : 'Please select your role in the team');
      return;
    }

    if (!user?.id) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'You must be logged in');
      return;
    }

    const result = await createTeam(teamName, selectedRole);
    
    if (result.success) {
      toast.success(
        language === 'ar' 
          ? 'تم إنشاء الفريق بنجاح! أنت الآن القائد' 
          : 'Team created successfully! You are now the leader'
      );
      navigate('/team-dashboard');
    } else {
      toast.error(result.error || (language === 'ar' ? 'حدث خطأ في إنشاء الفريق' : 'Error creating team'));
    }
  };

  // Show loading state
  if (checkingTeam) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-white/60">{language === 'ar' ? 'جاري التحقق...' : 'Checking...'}</p>
        </div>
      </div>
    );
  }

  // Show error if user already has a team
  if (existingTeam) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-logo-orange/10 rounded-full blur-[120px]" />
        </div>
        <div className="w-full max-w-md relative z-10 animate-fade-in">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {language === 'ar' ? 'لديك فريق بالفعل!' : 'You already have a team!'}
            </h1>
            <p className="text-white/60 mb-6">
              {language === 'ar' 
                ? `أنت قائد فريق "${existingTeam.name}". لا يمكنك إنشاء فريق آخر.`
                : `You are the leader of "${existingTeam.name}". You cannot create another team.`}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate('/team-hub')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {language === 'ar' ? 'العودة' : 'Go Back'}
              </Button>
              <Button
                variant="hero"
                onClick={() => navigate('/team-dashboard')}
              >
                <Crown className="w-4 h-4 me-2" />
                {language === 'ar' ? 'لوحة فريقي' : 'My Team Dashboard'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/team-hub')}
          className="mb-4 text-white/70 hover:text-white hover:bg-white/10"
        >
          {direction === 'rtl' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          <span className="ms-2">{language === 'ar' ? 'العودة' : 'Back'}</span>
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {language === 'ar' ? 'إنشاء فريق جديد' : 'Create New Team'}
          </h1>
          <p className="text-white/60 mt-2">
            {language === 'ar' 
              ? 'اختر اسماً مميزاً لفريقك ودورك' 
              : 'Choose a unique name for your team and your role'}
          </p>
        </div>

        {/* Create Team Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8">
          {/* Leader Badge */}
          <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-gradient-to-r from-logo-red/10 to-logo-orange/10 rounded-xl border border-logo-orange/20">
            <Crown className="w-5 h-5 text-logo-orange" />
            <span className="text-sm font-semibold text-logo-orange">
              {language === 'ar' ? 'ستكون قائد الفريق' : 'You will be the team leader'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Name */}
            <div className="space-y-2">
              <Label htmlFor="teamName" className="text-white/90">
                {language === 'ar' ? 'اسم الفريق' : 'Team Name'} <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Users className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50" size={18} />
                <Input
                  id="teamName"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: الذئاب الآلية' : 'Example: Robo Wolves'}
                  className="ps-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
              <p className="text-xs text-white/50">
                {language === 'ar' 
                  ? '3-30 حرف، سيظهر في لوحة المتصدرين' 
                  : '3-30 characters, will appear on leaderboard'}
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-white/90">
                {language === 'ar' ? 'اختر دورك' : 'Choose Your Role'} <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((role) => {
                  const isSelected = selectedRole === role.id;
                  const Icon = role.icon;
                  
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 text-center transition-all duration-300",
                        "bg-white/5 hover:bg-white/10",
                        isSelected 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-white/10 hover:border-white/20"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 end-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      
                      <div className={cn(
                        "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mx-auto mb-2",
                        role.color
                      )}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      
                      <span className="text-sm font-medium text-white block">
                        {getRoleDisplayName(role.id, language as 'ar' | 'en')}
                      </span>
                      <span className="text-xs text-white/50 mt-1 block">
                        {getRoleDescription(role.id, language as 'ar' | 'en')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* What happens next */}
            <div className="p-4 bg-white/5 rounded-xl space-y-2 border border-white/10">
              <div className="flex items-center gap-2 text-sm text-white font-medium">
                <Sparkles className="w-4 h-4 text-logo-yellow" />
                {language === 'ar' ? 'ماذا سيحدث؟' : 'What happens next?'}
              </div>
              <ul className="text-sm text-white/60 space-y-1 list-disc list-inside">
                <li>{language === 'ar' ? 'سيتم إنشاء كود دعوة خاص بفريقك' : 'A unique invite code will be generated'}</li>
                <li>{language === 'ar' ? 'شارك الكود مع أعضاء فريقك للانضمام' : 'Share the code with your teammates to join'}</li>
                <li>{language === 'ar' ? 'ستتمكن من إدارة الفريق من لوحة التحكم' : 'You can manage the team from the dashboard'}</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="hero" 
              size="lg" 
              className="w-full" 
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {language === 'ar' ? 'إنشاء الفريق' : 'Create Team'}
                  <ArrowIcon size={18} />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamPage;
