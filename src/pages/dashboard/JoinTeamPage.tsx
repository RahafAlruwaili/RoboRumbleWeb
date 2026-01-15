import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useJoinRequest } from '@/hooks/useTeams';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, ArrowLeft, ArrowRight, Cpu, Users, CheckCircle, Clock, Gamepad2, Code, Wrench, Crown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  getAvailableRoles,
  getRoleDisplayName,
  getRoleDescription,
  TeamRole,
  TEAM_ROLES,
  TeamMemberRole,
} from '@/lib/teamRolesValidation';

interface TeamData {
  id: string;
  name: string;
  nameAr: string | null;
  leaderName: string;
  membersCount: number;
  availableRoles: TeamRole[];
  members: TeamMemberRole[];
}

const JoinTeamPage = () => {
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('team');
  const { sendJoinRequest, loading: isSending } = useJoinRequest();

  const [loading, setLoading] = useState(false);
  const [teamCode, setTeamCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId) return;

      setLoadingTeam(true);
      try {
        // Fetch team info
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select('id, name, name_ar, leader_id')
          .eq('id', teamId)
          .single();

        if (teamError || !team) {
          toast.error(language === 'ar' ? 'الفريق غير موجود' : 'Team not found');
          navigate('/all-teams');
          return;
        }

        // Fetch leader name
        const { data: leaderProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', team.leader_id)
          .single();

        // Fetch team members to calculate available roles
        const { data: members } = await supabase
          .from('team_members')
          .select('user_id, team_role')
          .eq('team_id', teamId);

        const memberData: TeamMemberRole[] = (members || []).map(m => ({
          user_id: m.user_id,
          team_role: m.team_role,
        }));

        // Use the new validation logic to get available roles
        const availableRoles = getAvailableRoles(memberData);

        setTeamData({
          id: team.id,
          name: team.name,
          nameAr: team.name_ar,
          leaderName: leaderProfile?.full_name || 'Unknown',
          membersCount: members?.length || 0,
          availableRoles,
          members: memberData,
        });
      } catch (error) {
        console.error('Error fetching team:', error);
        toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
      } finally {
        setLoadingTeam(false);
      }
    };

    fetchTeamData();
  }, [teamId, language, navigate]);

  const getRoleIcon = (roleId: TeamRole) => {
    switch (roleId) {
      case TEAM_ROLES.DRIVER: return Gamepad2;
      case TEAM_ROLES.PROGRAMMER: return Code;
      case TEAM_ROLES.ELECTRONICS: return Cpu;
      case TEAM_ROLES.MECHANICS_DESIGNER: return Wrench;
      default: return Users;
    }
  };

  const getRoleColor = (roleId: TeamRole) => {
    switch (roleId) {
      case TEAM_ROLES.DRIVER: return 'from-red-500 to-orange-500';
      case TEAM_ROLES.PROGRAMMER: return 'from-blue-500 to-cyan-500';
      case TEAM_ROLES.ELECTRONICS: return 'from-green-500 to-emerald-500';
      case TEAM_ROLES.MECHANICS_DESIGNER: return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamCode || teamCode.length < 6) {
      toast.error(
        language === 'ar'
          ? 'الرجاء إدخال كود صحيح (6 أحرف على الأقل)'
          : 'Please enter a valid code (at least 6 characters)'
      );
      return;
    }

    setLoading(true);

    try {
      // Search for team by team_code (8-character alphanumeric code)
      // Using .filter() to bypass TypeScript since team_code is a new column not yet in generated types
      const { data: teams, error } = await supabase
        .from('teams')
        .select('id, name')
        .filter('team_code', 'eq', teamCode.toUpperCase())
        .limit(1);

      if (error) {
        console.error('Team search error:', error);
        throw error;
      }

      if (!teams || teams.length === 0) {
        toast.error(
          language === 'ar'
            ? 'لم يتم العثور على فريق بهذا الكود'
            : 'No team found with this code'
        );
        setLoading(false);
        return;
      }

      // Found the team, navigate to join page with team ID
      const foundTeam = teams[0];
      toast.success(
        language === 'ar'
          ? `تم العثور على الفريق: ${foundTeam.name}`
          : `Found team: ${foundTeam.name}`
      );
      navigate(`/join-team?team=${foundTeam.id}`);
    } catch (error) {
      console.error('Error searching for team:', error);
      toast.error(
        language === 'ar'
          ? 'حدث خطأ أثناء البحث'
          : 'An error occurred while searching'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!selectedRole) {
      toast.error(
        language === 'ar'
          ? 'الرجاء اختيار دور'
          : 'Please select a role'
      );
      return;
    }

    if (!user?.id || !teamData?.id) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
      return;
    }

    const result = await sendJoinRequest(teamData.id, selectedRole, `Requested role: ${selectedRole}`);

    if (result.success) {
      toast.success(
        language === 'ar'
          ? 'تم إرسال طلب الانضمام! في انتظار موافقة القائد'
          : 'Join request sent! Waiting for leader approval'
      );
      navigate('/all-teams');
    } else {
      const errorMessage = language === 'ar' ? result.errorAr : result.error;
      toast.error(errorMessage || (language === 'ar' ? 'حدث خطأ في إرسال الطلب' : 'Error sending request'));
    }
  };

  // If team ID is provided, show role selection instead of code input
  if (teamId) {
    if (loadingTeam) {
      return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!teamData) {
      return null;
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

        <div className="w-full max-w-lg relative z-10 animate-fade-in">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/all-teams')}
            className="mb-4 text-white/70 hover:text-white hover:bg-white/10"
          >
            {direction === 'rtl' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            <span className="ms-2">{language === 'ar' ? 'العودة' : 'Back'}</span>
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {language === 'ar' ? 'طلب الانضمام' : 'Request to Join'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'ar'
                ? 'اختر الدور الذي تريد الانضمام به'
                : 'Choose the role you want to join with'}
            </p>
          </div>

          {/* Team Info Card */}
          <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-logo-orange to-logo-yellow flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {language === 'ar' && teamData.nameAr ? teamData.nameAr : teamData.name}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Crown className="w-4 h-4 text-logo-yellow" />
                  <span>{teamData.leaderName}</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {language === 'ar'
                ? `${teamData.membersCount}/5 أعضاء`
                : `${teamData.membersCount}/5 members`}
            </div>
          </div>

          {/* Role Selection */}
          <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50">
            <Label className="text-lg font-semibold mb-4 block">
              {language === 'ar' ? 'اختر دورك المتاح' : 'Choose an available role'}
            </Label>

            {teamData.availableRoles.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                {language === 'ar' ? 'الفريق مكتمل' : 'Team is full'}
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {teamData.availableRoles.map((roleId) => {
                    const Icon = getRoleIcon(roleId);
                    const isSelected = selectedRole === roleId;
                    return (
                      <button
                        key={roleId}
                        type="button"
                        onClick={() => setSelectedRole(roleId)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200",
                          isSelected
                            ? "border-logo-orange bg-logo-orange/10"
                            : "border-border/50 bg-muted/20 hover:border-muted-foreground/30"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                          getRoleColor(roleId)
                        )}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-start">
                          <span className="text-lg font-medium text-foreground block">
                            {getRoleDisplayName(roleId, language as 'ar' | 'en')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {getRoleDescription(roleId, language as 'ar' | 'en')}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-logo-orange ms-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Info Box */}
                <div className="p-4 bg-muted/30 rounded-xl space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                    <Clock className="w-4 h-4 text-logo-orange" />
                    {language === 'ar' ? 'بعد إرسال الطلب' : 'After sending request'}
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      {language === 'ar' ? 'سيستلم القائد طلبك' : 'The leader will receive your request'}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      {language === 'ar' ? 'ستُبلَّغ عند القبول أو الرفض' : 'You will be notified of acceptance or rejection'}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      {language === 'ar' ? 'بعد القبول ستنضم للفريق' : 'After acceptance, you will join the team'}
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isSending || !selectedRole}
                  onClick={handleJoinRequest}
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {language === 'ar' ? 'إرسال طلب الانضمام' : 'Send Join Request'}
                      <ArrowIcon size={18} />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default: Show code input form (for joining via code from leader)
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

      <div className="w-full max-w-lg relative z-10 animate-fade-in">
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {language === 'ar' ? 'الانضمام لفريق' : 'Join Team'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ar'
              ? 'أدخل كود الفريق الذي حصلت عليه من القائد'
              : 'Enter the team code you received from your leader'}
          </p>
        </div>

        {/* Join Team Form */}
        <div className="bg-card rounded-2xl shadow-card p-8 border border-border/50">
          <form onSubmit={handleCodeSubmit} className="space-y-5">
            {/* Team Code */}
            <div className="space-y-2">
              <Label htmlFor="teamCode">
                {language === 'ar' ? 'كود الفريق' : 'Team Code'}
              </Label>
              <div className="relative">
                <KeyRound className="absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" size={18} />
                <Input
                  id="teamCode"
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  className="ps-10 text-center font-mono tracking-widest text-lg text-white placeholder:text-white/50"
                  dir="ltr"
                  required
                  maxLength={8}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {language === 'ar'
                  ? 'احصل على الكود من قائد الفريق'
                  : 'Get the code from your team leader'}
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-muted/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                <Users className="w-4 h-4 text-logo-orange" />
                {language === 'ar' ? 'بعد الانضمام' : 'After joining'}
              </div>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {language === 'ar' ? 'ستختار دورك في الفريق' : 'You will choose your role in the team'}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {language === 'ar' ? 'ستتمكن من رؤية أعضاء فريقك' : 'You can see your team members'}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  {language === 'ar' ? 'ستبدأ رحلتك في روبو رمبل' : 'Your RoboRumble journey begins'}
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {language === 'ar' ? 'التحقق والانضمام' : 'Verify & Join'}
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

export default JoinTeamPage;
