import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Gamepad2, 
  Code, 
  Cpu, 
  Wrench,
  ArrowLeft, 
  ArrowRight,
  Check,
  Lock,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  TEAM_ROLES, 
  TeamRole, 
  getRoleDisplayName, 
  getRoleDescription,
  getAvailableRoles,
  canAddRole,
  TeamMemberRole,
} from '@/lib/teamRolesValidation';

interface Role {
  id: TeamRole;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  icon: React.ElementType;
  color: string;
  available: boolean;
}

const RoleSelectionPage = () => {
  const { language, direction } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fetchingTeam, setFetchingTeam] = useState(true);
  const [selectedRole, setSelectedRole] = useState<TeamRole | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberRole[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  // Fetch team members to determine available roles
  useEffect(() => {
    const fetchTeamData = async () => {
      const teamIdParam = searchParams.get('team');
      if (!teamIdParam) {
        toast.error(language === 'ar' ? 'لم يتم تحديد الفريق' : 'Team not specified');
        navigate('/all-teams');
        return;
      }
      
      setTeamId(teamIdParam);
      
      try {
        const { data: members, error } = await supabase
          .from('team_members')
          .select('user_id, team_role')
          .eq('team_id', teamIdParam);

        if (error) throw error;
        
        setTeamMembers(members || []);
      } catch (error) {
        console.error('Error fetching team:', error);
        toast.error(language === 'ar' ? 'حدث خطأ في تحميل بيانات الفريق' : 'Error loading team data');
      } finally {
        setFetchingTeam(false);
      }
    };

    fetchTeamData();
  }, [searchParams, navigate, language]);

  // Build roles list with availability
  const availableRoles = getAvailableRoles(teamMembers);
  
  const roles: Role[] = [
    {
      id: TEAM_ROLES.DRIVER,
      nameAr: 'التحكم والقيادة',
      nameEn: 'Driver',
      descAr: 'التحكم بالروبوت أثناء المنافسات',
      descEn: 'Control the robot during competitions',
      icon: Gamepad2,
      color: 'from-red-500 to-orange-500',
      available: availableRoles.includes(TEAM_ROLES.DRIVER),
    },
    {
      id: TEAM_ROLES.PROGRAMMER,
      nameAr: 'المبرمج',
      nameEn: 'Programmer',
      descAr: 'برمجة نظام التحكم والأردوينو',
      descEn: 'Program the control system and Arduino',
      icon: Code,
      color: 'from-blue-500 to-cyan-500',
      available: availableRoles.includes(TEAM_ROLES.PROGRAMMER),
    },
    {
      id: TEAM_ROLES.ELECTRONICS,
      nameAr: 'الإلكترونيات',
      nameEn: 'Electronics',
      descAr: 'تصميم وتوصيل الدوائر الكهربائية',
      descEn: 'Design and wire electronic circuits',
      icon: Cpu,
      color: 'from-green-500 to-emerald-500',
      available: availableRoles.includes(TEAM_ROLES.ELECTRONICS),
    },
    {
      id: TEAM_ROLES.MECHANICS_DESIGNER,
      nameAr: 'التجميع والتركيب / التصميم الهندسي',
      nameEn: 'Mechanics / Designer',
      descAr: 'تجميع وتصميم الهيكل الميكانيكي',
      descEn: 'Assemble and design the mechanical structure',
      icon: Wrench,
      color: 'from-purple-500 to-pink-500',
      available: availableRoles.includes(TEAM_ROLES.MECHANICS_DESIGNER),
    },
  ];

  const handleSubmit = async () => {
    if (!selectedRole || !teamId || !user) {
      toast.error(language === 'ar' ? 'اختر دوراً للمتابعة' : 'Select a role to continue');
      return;
    }

    // Validate role can be added
    const validation = canAddRole(teamMembers, selectedRole);
    if (!validation.isValid) {
      toast.error(language === 'ar' ? validation.errorAr : validation.error);
      return;
    }

    setLoading(true);

    try {
      // Add user to team with selected role
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id,
          team_role: selectedRole,
        });

      if (error) throw error;

      toast.success(
        language === 'ar' 
          ? 'تم تحديد دورك بنجاح!' 
          : 'Your role has been assigned!'
      );
      navigate('/team-dashboard');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingTeam) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] py-8 px-4 relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-logo-orange/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-logo-yellow/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-logo-red/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {language === 'ar' ? 'اختيار الدور' : 'Select Your Role'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' 
              ? 'اختر دورك في الفريق بناءً على مهاراتك' 
              : 'Choose your role based on your skills'}
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {roles.map((role) => {
            const isDisabled = !role.available;
            const isSelected = selectedRole === role.id;
            const Icon = role.icon;

            return (
              <button
                key={role.id}
                onClick={() => !isDisabled && setSelectedRole(role.id)}
                disabled={isDisabled}
                className={cn(
                  "relative p-6 rounded-2xl border-2 text-start transition-all duration-300",
                  "bg-card hover:bg-card/80",
                  isSelected 
                    ? "border-primary ring-2 ring-primary/20" 
                    : "border-border/50 hover:border-border",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {!role.available && (
                  <div className="absolute top-3 end-3 flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    {language === 'ar' ? 'محجوز' : 'Taken'}
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-3 end-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                <div className={cn(
                  "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                  role.color
                )}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-1">
                  {language === 'ar' ? role.nameAr : role.nameEn}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? role.descAr : role.descEn}
                </p>
              </button>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mb-6">
          {language === 'ar' 
            ? 'الفريق يتكون من 4 أعضاء أساسيين، والعضو الخامس اختياري من فئة التجميع/التصميم' 
            : 'Team consists of 4 core members, the 5th member is optional from Mechanics/Designer category'}
        </p>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSubmit}
            variant="hero" 
            size="xl" 
            disabled={loading || !selectedRole}
            className="min-w-[200px]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {language === 'ar' ? 'تأكيد الدور' : 'Confirm Role'}
                <ArrowIcon size={18} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;