// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Crown,
  Copy,
  Check,
  CheckCircle,
  Circle,
  Gamepad2,
  Code,
  Cpu,
  Wrench,
  Palette,
  UserPlus,
  Send,
  Pencil,
  Trash2,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  ClipboardList,
  Lock,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import PreparationTab from '@/components/dashboard/PreparationTab';
import DesignsTab from '@/components/dashboard/DesignsTab';
import { AcceptanceStatus, getAcceptanceStatusConfig, canAccessPreparation } from '@/types/team';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleAr: string;
  isLeader: boolean;
  icon: React.ElementType;
  color: string;
  user_id: string;
}

// New 4-role system
const roleOptions = [
  { value: 'driver', nameAr: 'التحكم والقيادة', nameEn: 'Driver', icon: Gamepad2, color: 'from-red-500 to-orange-500', maxCount: 1 },
  { value: 'programmer', nameAr: 'المبرمج', nameEn: 'Programmer', icon: Code, color: 'from-blue-500 to-cyan-500', maxCount: 1 },
  { value: 'electronics', nameAr: 'الإلكترونيات', nameEn: 'Electronics', icon: Cpu, color: 'from-green-500 to-emerald-500', maxCount: 1 },
  { value: 'mechanics_designer', nameAr: 'التجميع والتركيب / التصميم الهندسي', nameEn: 'Mechanics / Designer', icon: Wrench, color: 'from-purple-500 to-pink-500', maxCount: 2 },
];

const REQUIRED_ROLES = ['driver', 'programmer', 'electronics', 'mechanics_designer'];
const MIN_TEAM_SIZE = 4;
const MAX_TEAM_SIZE = 5;

// Helper to get role info
const getRoleInfo = (role: string) => {
  const found = roleOptions.find(r => r.value === role);
  return found || { value: role, nameAr: role, nameEn: role, icon: Users, color: 'from-gray-500 to-gray-600', maxCount: 1 };
};

// Generate a team code from team id
const generateTeamCode = (teamId: string) => {
  return teamId.substring(0, 8).toUpperCase();
};

const TeamDashboardPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useRole();
  const { user } = useAuth();

  // Get teamId from query params OR from user's team
  const teamIdFromParams = searchParams.get('team');
  const teamId = teamIdFromParams || user?.teamId;

  const [loading, setLoading] = useState(true);
  const [waitingForTeamId, setWaitingForTeamId] = useState(!teamIdFromParams);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  // Update active tab when URL param changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Team data from database
  const [teamData, setTeamData] = useState<{
    id: string;
    name: string;
    nameEn: string;
    code: string;
    completionStatus: 'incomplete' | 'complete';
    acceptanceStatus: AcceptanceStatus;
    isLeader: boolean;
    lookingForMembers: boolean;
    leader_id: string;
    preparation_status: string;
  } | null>(null);

  // Team members from database
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Preparation status
  const [preparationStatus, setPreparationStatus] = useState<'not_started' | 'in_progress' | 'completed'>('not_started');

  // Join requests count
  const [joinRequestsCount, setJoinRequestsCount] = useState(0);

  // Wait for teamId to be available from AuthContext
  useEffect(() => {
    if (!teamIdFromParams && user?.teamId) {
      setWaitingForTeamId(false);
    } else if (!teamIdFromParams && user && user.hasTeam === false) {
      // User doesn't have a team
      navigate('/all-teams');
    }
  }, [user, teamIdFromParams, navigate]);

  // Fetch team data
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId) {
        // Only show error if we're not waiting for teamId
        if (!waitingForTeamId) {
          toast.error(language === 'ar' ? 'معرف الفريق غير موجود' : 'Team ID not found');
          navigate('/all-teams');
        }
        return;
      }

      try {
        // Fetch team info
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .maybeSingle();

        if (teamError) throw teamError;
        if (!team) {
          toast.error(language === 'ar' ? 'الفريق غير موجود' : 'Team not found');
          navigate('/all-teams');
          return;
        }

        // Fetch team members
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select('id, user_id, team_role')
          .eq('team_id', teamId);

        if (membersError) throw membersError;

        // Fetch profiles for team members
        const userIds = members?.map(m => m.user_id) || [];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        const profilesMap = new Map(profiles?.map(p => [p.user_id, p]));

        // Map members to our format
        const mappedMembers: TeamMember[] = (members || []).map((member: any) => {
          const roleInfo = getRoleInfo(member.team_role || 'designer');
          const profile = profilesMap.get(member.user_id);
          return {
            id: member.id,
            user_id: member.user_id,
            name: profile?.full_name || profile?.email || 'Unknown',
            role: member.team_role || 'designer',
            roleAr: roleInfo.nameAr,
            isLeader: member.user_id === team.leader_id,
            icon: roleInfo.icon,
            color: roleInfo.color,
          };
        });

        // Check if all required roles are filled
        const roleCounts: Record<string, number> = {};
        roleOptions.forEach(role => {
          roleCounts[role.value] = mappedMembers.filter(m => m.role === role.value).length;
        });
        const allRolesFilled = REQUIRED_ROLES.every(role => roleCounts[role] >= 1);
        const isComplete = allRolesFilled && mappedMembers.length >= MIN_TEAM_SIZE && mappedMembers.length <= MAX_TEAM_SIZE;

        // Map status to AcceptanceStatus
        const mapStatus = (status: string): AcceptanceStatus => {
          switch (status) {
            case 'approved': return 'first_accepted';
            case 'final_approved': return 'final_accepted';
            case 'rejected': return 'rejected';
            default: return 'under_review';
          }
        };

        setTeamData({
          id: team.id,
          name: team.name_ar || team.name,
          nameEn: team.name,
          code: team.team_code || generateTeamCode(team.id),
          completionStatus: isComplete ? 'complete' : 'incomplete',
          acceptanceStatus: mapStatus(team.status || 'pending'),
          isLeader: team.leader_id === user?.id,
          lookingForMembers: team.status === 'pending' && !isComplete,
          leader_id: team.leader_id,
          preparation_status: team.preparation_status || 'not_started',
        });

        setTeamMembers(mappedMembers);

        // Fetch join requests count (only for team leader)
        if (team.leader_id === user?.id) {
          const { count } = await supabase
            .from('join_requests')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', teamId)
            .eq('status', 'pending');

          setJoinRequestsCount(count || 0);
        }
        setPreparationStatus((team.preparation_status as any) || 'not_started');
      } catch (error) {
        console.error('Error fetching team:', error);
        toast.error(language === 'ar' ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading team data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId, user?.id, language, navigate, waitingForTeamId]);

  // Loading state (including waiting for teamId)
  if (loading || waitingForTeamId) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-white/60">{language === 'ar' ? 'جاري تحميل بيانات الفريق...' : 'Loading team data...'}</p>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return null;
  }

  // Current user info
  const currentUser = {
    id: user?.id || '',
    isTeamMember: teamMembers.some(m => m.user_id === user?.id),
  };

  // Check if team can be edited (only before final acceptance)
  const isLocked = teamData.acceptanceStatus === 'final_accepted' || teamData.acceptanceStatus === 'rejected';

  // Admin can edit any team
  const canEdit = teamData.isLeader || isAdmin;

  // ==================== ROLE VALIDATION LOGIC ====================

  // Count how many members have each role
  const getRoleCounts = () => {
    const counts: Record<string, number> = {};
    roleOptions.forEach(role => {
      counts[role.value] = teamMembers.filter(m => m.role === role.value).length;
    });
    return counts;
  };

  const roleCounts = getRoleCounts();

  // Check if a role has reached its maximum count
  const isRoleFull = (roleValue: string) => {
    const role = roleOptions.find(r => r.value === roleValue);
    if (!role) return false;
    return roleCounts[roleValue] >= role.maxCount;
  };

  // Check if a role exceeds its limit
  const isRoleExceeded = (roleValue: string) => {
    const role = roleOptions.find(r => r.value === roleValue);
    if (!role) return false;
    return roleCounts[roleValue] > role.maxCount;
  };

  // Get filled roles for checklist display
  const getFilledRoles = () => {
    return roleOptions.map(role => ({
      ...role,
      filled: roleCounts[role.value] >= 1, // At least one member has this role
      count: roleCounts[role.value],
      isFull: isRoleFull(role.value),
      isExceeded: isRoleExceeded(role.value),
    }));
  };

  const requiredRoles = getFilledRoles();

  // All required roles must have exactly 1 member
  const allRequiredRolesFilled = REQUIRED_ROLES.every(role => roleCounts[role] >= 1);

  // Check if any role exceeds its limit
  const anyRoleExceeded = roleOptions.some(role => isRoleExceeded(role.value));

  // Team size validation
  const isTeamSizeValid = teamMembers.length >= MIN_TEAM_SIZE && teamMembers.length <= MAX_TEAM_SIZE;
  const isTeamTooSmall = teamMembers.length < MIN_TEAM_SIZE;
  const isTeamTooLarge = teamMembers.length > MAX_TEAM_SIZE;

  // Final validation: team can be registered only if ALL conditions are met
  const canRegisterTeam = allRequiredRolesFilled && !anyRoleExceeded && isTeamSizeValid;

  // Team is complete for preparation tab visibility
  const isTeamComplete = canRegisterTeam;

  // Generate validation error messages
  const getValidationErrors = (): { ar: string; en: string }[] => {
    const errors: { ar: string; en: string }[] = [];

    if (isTeamTooSmall) {
      errors.push({
        ar: `عدد أعضاء الفريق يجب أن يكون بين ${MIN_TEAM_SIZE} و ${MAX_TEAM_SIZE}. (الحالي: ${teamMembers.length})`,
        en: `Team size must be between ${MIN_TEAM_SIZE} and ${MAX_TEAM_SIZE} members. (Current: ${teamMembers.length})`
      });
    }

    if (isTeamTooLarge) {
      errors.push({
        ar: `عدد أعضاء الفريق يجب أن يكون بين ${MIN_TEAM_SIZE} و ${MAX_TEAM_SIZE}. (الحالي: ${teamMembers.length})`,
        en: `Team size must be between ${MIN_TEAM_SIZE} and ${MAX_TEAM_SIZE} members. (Current: ${teamMembers.length})`
      });
    }

    if (!allRequiredRolesFilled) {
      const missingRoles = REQUIRED_ROLES.filter(role => roleCounts[role] < 1);
      const missingRolesText = missingRoles.map(r => {
        const roleData = roleOptions.find(ro => ro.value === r);
        return language === 'ar' ? roleData?.nameAr : roleData?.nameEn;
      }).join('، ');

      errors.push({
        ar: `لا يمكن تسجيل الفريق: الأدوار غير مكتملة. (ناقص: ${missingRolesText})`,
        en: `Team cannot be registered: required roles are missing. (Missing: ${missingRolesText})`
      });
    }

    if (anyRoleExceeded) {
      const exceededRoles = roleOptions.filter(role => isRoleExceeded(role.value));
      const exceededRolesText = exceededRoles.map(r =>
        language === 'ar' ? r.nameAr : r.nameEn
      ).join('، ');

      errors.push({
        ar: `لا يمكن تسجيل الفريق: تم تجاوز الحد المسموح لأحد الأدوار. (${exceededRolesText})`,
        en: `Team cannot be registered: role limit exceeded. (${exceededRolesText})`
      });
    }

    return errors;
  };

  const validationErrors = getValidationErrors();

  // Visibility check for Preparation tab - only for final accepted teams
  const canViewPreparation = canAccessPreparation(teamData.acceptanceStatus) && (currentUser.isTeamMember || isAdmin);

  // Get acceptance status icon
  const getAcceptanceIcon = (status: AcceptanceStatus) => {
    switch (status) {
      case 'under_review': return Clock;
      case 'first_accepted': return CheckCircle2;
      case 'final_accepted': return CheckCircle2;
      case 'rejected': return XCircle;
    }
  };

  const acceptanceConfig = getAcceptanceStatusConfig(teamData.acceptanceStatus, language);
  const AcceptanceIcon = getAcceptanceIcon(teamData.acceptanceStatus);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(teamData.code);
    setCopied(true);
    toast.success(language === 'ar' ? 'تم نسخ الكود!' : 'Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitRegistration = async () => {
    // Double-check validation before submitting
    if (!canRegisterTeam || !teamData) {
      toast.error(
        language === 'ar'
          ? 'لا يمكن تسجيل الفريق. تحقق من الأخطاء.'
          : 'Cannot register team. Check the errors.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('teams')
        .update({ status: 'pending' })
        .eq('id', teamData.id);

      if (error) throw error;

      setTeamData(prev => prev ? { ...prev, completionStatus: 'complete' } : null);
      toast.success(
        language === 'ar'
          ? 'تم تسجيل الفريق بنجاح! 🎉'
          : 'Team registration submitted! 🎉'
      );
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast.error(
        language === 'ar'
          ? 'حدث خطأ أثناء تسجيل الفريق'
          : 'Error submitting registration'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getPreparationStatusText = () => {
    switch (preparationStatus) {
      case 'not_started':
        return { ar: 'لم يبدأ', en: 'Not started', color: 'text-muted-foreground' };
      case 'in_progress':
        return { ar: 'جاري', en: 'In progress', color: 'text-yellow-500' };
      case 'completed':
        return { ar: 'مكتمل', en: 'Completed', color: 'text-green-500' };
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setSelectedRole(member.role);
  };

  const handleSaveRole = async () => {
    if (!editingMember || !selectedRole) return;

    const roleData = roleOptions.find(r => r.value === selectedRole);
    if (!roleData) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ team_role: selectedRole })
        .eq('id', editingMember.id);

      if (error) throw error;

      setTeamMembers(prev => prev.map(m =>
        m.id === editingMember.id
          ? { ...m, role: selectedRole, roleAr: roleData.nameAr, icon: roleData.icon, color: roleData.color }
          : m
      ));

      setEditingMember(null);
      toast.success(language === 'ar' ? 'تم تحديث الدور بنجاح' : 'Role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء تحديث الدور' : 'Error updating role');
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingMember) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', deletingMember.id);

      if (error) throw error;

      setTeamMembers(prev => prev.filter(m => m.id !== deletingMember.id));
      setDeletingMember(null);
      toast.success(language === 'ar' ? 'تم حذف العضو بنجاح' : 'Member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء حذف العضو' : 'Error removing member');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] py-8 px-4 relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-logo-orange/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-logo-yellow/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-logo-red/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/all-teams')}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          {language === 'ar' ? <ArrowRight className="w-4 h-4 me-2" /> : <ArrowLeft className="w-4 h-4 me-2" />}
          {language === 'ar' ? 'العودة للفرق' : 'Back to Teams'}
        </Button>

        {/* Team Header Card */}
        <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border/50 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Users className="w-8 h-8 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {language === 'ar' ? teamData.name : teamData.nameEn}
                </h1>
                {/* Acceptance Status Badge - Primary */}
                <Badge
                  variant="outline"
                  className={cn("text-xs border flex items-center gap-1", acceptanceConfig.bgColor, acceptanceConfig.color)}
                >
                  <AcceptanceIcon className="w-3 h-3" />
                  {acceptanceConfig.label}
                </Badge>
                {isLocked && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-muted/50 text-muted-foreground border-border/50 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {language === 'ar' ? 'مقفل' : 'Locked'}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">
                {language === 'ar'
                  ? `${teamMembers.length} أعضاء في الفريق`
                  : `${teamMembers.length} team members`}
              </p>
              {isLocked && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {language === 'ar'
                    ? 'تم قفل التعديلات بعد القبول النهائي.'
                    : 'Edits are locked after final acceptance.'}
                </p>
              )}
            </div>

            {/* Team Code */}
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'ar' ? 'كود الدعوة' : 'Invite Code'}
                </p>
                <p className="font-mono text-xl font-bold text-foreground tracking-wider">
                  {teamData.code}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {/* Join Requests Button - Only for team leader */}
            {teamData.isLeader && joinRequestsCount > 0 && (
              <Button
                variant="outline"
                onClick={() => navigate('/team-dashboard/requests')}
                className="gap-2 border-primary/50 hover:bg-primary/10"
              >
                <UserPlus className="w-4 h-4" />
                {language === 'ar' ? 'طلبات الانضمام' : 'Join Requests'}
                <Badge variant="destructive" className="ms-1">
                  {joinRequestsCount}
                </Badge>
              </Button>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-muted/30 p-1 mb-6">
            <TabsTrigger
              value="overview"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <LayoutDashboard className="w-4 h-4 me-2" />
              {language === 'ar' ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="w-4 h-4 me-2" />
              {language === 'ar' ? 'الأعضاء' : 'Members'}
            </TabsTrigger>
            {canViewPreparation && (
              <TabsTrigger
                value="preparation"
                className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <ClipboardList className="w-4 h-4 me-2" />
                {language === 'ar' ? 'التحضير' : 'Preparation'}
              </TabsTrigger>
            )}
            <TabsTrigger
              value="designs"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Upload className="w-4 h-4 me-2" />
              {language === 'ar' ? 'التصاميم' : 'Designs'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="md:col-span-2 space-y-6">
                {/* Team Status Card */}
                <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50">
                  <h2 className="text-lg font-bold text-foreground mb-4">
                    {language === 'ar' ? 'حالة الفريق' : 'Team Status'}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/20 rounded-xl text-center">
                      <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold text-foreground">{teamMembers.length}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'ar' ? 'أعضاء' : 'Members'}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-xl text-center">
                      <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold text-foreground">
                        {requiredRoles.filter(r => r.filled).length}/{requiredRoles.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'ar' ? 'أدوار مكتملة' : 'Roles Filled'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Members Preview */}
                <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">
                      {language === 'ar' ? 'الأعضاء' : 'Members'}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('members')}
                      className="text-primary hover:text-primary/80"
                    >
                      {language === 'ar' ? 'عرض الكل' : 'View All'}
                    </Button>
                  </div>
                  <div className="flex -space-x-3 rtl:space-x-reverse">
                    {teamMembers.slice(0, 5).map((member) => {
                      const Icon = member.icon;
                      return (
                        <div
                          key={member.id}
                          className={cn(
                            "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center border-2 border-card relative",
                            member.color
                          )}
                          title={member.name}
                        >
                          <Icon className="w-5 h-5 text-white" />
                          {member.isLeader && (
                            <Crown className="w-3 h-3 text-logo-yellow absolute -top-1 -right-1" />
                          )}
                        </div>
                      );
                    })}
                    {teamMembers.length > 5 && (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-card">
                        <span className="text-xs font-bold text-muted-foreground">
                          +{teamMembers.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preparation Status Preview Card */}
                {canViewPreparation && (
                  <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-bold text-foreground">
                        {language === 'ar' ? 'حالة التحضير' : 'Preparation Status'}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn("text-lg font-semibold", getPreparationStatusText().color)}>
                        {language === 'ar' ? getPreparationStatusText().ar : getPreparationStatusText().en}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {language === 'ar'
                        ? 'مسموح غياب واحد فقط خلال 3 أيام.'
                        : 'Only one absence is allowed across 3 days.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Role Checklist & Actions */}
              <div className="space-y-6">
                {/* Role Checklist */}
                <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50">
                  <h2 className="text-lg font-bold text-foreground mb-4">
                    {language === 'ar' ? 'قائمة الأدوار' : 'Role Checklist'}
                  </h2>
                  <div className="space-y-3">
                    {requiredRoles.map((role) => (
                      <div key={role.value} className="flex items-center gap-3">
                        {role.isExceeded ? (
                          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                        ) : role.filled ? (
                          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                        )}
                        <span className={cn(
                          "text-sm flex-1",
                          role.isExceeded ? "text-destructive" : role.filled ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {language === 'ar' ? role.nameAr : role.nameEn}
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          role.isExceeded
                            ? "bg-destructive/20 text-destructive"
                            : role.isFull
                              ? "bg-green-500/20 text-green-500"
                              : "bg-muted text-muted-foreground"
                        )}>
                          {role.count}/{role.maxCount}
                          {role.isFull && !role.isExceeded && (
                            <span className="ms-1">
                              {language === 'ar' ? '✓' : '✓'}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Registration Section - only show if not yet submitted for review */}
                {(teamData.isLeader || isAdmin) && teamData.acceptanceStatus === 'under_review' && teamData.completionStatus === 'incomplete' && (
                  <div className={cn(
                    "rounded-2xl p-6 border",
                    canRegisterTeam
                      ? "bg-gradient-to-br from-logo-red/10 to-logo-orange/10 border-logo-orange/20"
                      : "bg-muted/20 border-border/50"
                  )}>
                    <h3 className="font-bold text-foreground mb-2">
                      {canRegisterTeam
                        ? (language === 'ar' ? 'الفريق جاهز!' : 'Team is Ready!')
                        : (language === 'ar' ? 'الفريق غير جاهز' : 'Team Not Ready')}
                    </h3>

                    {canRegisterTeam ? (
                      <p className="text-sm text-muted-foreground mb-4">
                        {language === 'ar'
                          ? 'جميع الأدوار مكتملة. يمكنك الآن تسجيل الفريق في المسابقة.'
                          : 'All roles are filled. You can now submit your team registration.'}
                      </p>
                    ) : (
                      <div className="space-y-2 mb-4">
                        {validationErrors.map((error, index) => (
                          <p key={index} className="text-sm text-destructive flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            {language === 'ar' ? error.ar : error.en}
                          </p>
                        ))}
                      </div>
                    )}

                    <Button
                      onClick={handleSubmitRegistration}
                      variant={canRegisterTeam ? "hero" : "outline"}
                      size="lg"
                      className={cn("w-full", !canRegisterTeam && "opacity-50 cursor-not-allowed")}
                      disabled={submitting || !canRegisterTeam}
                    >
                      {submitting ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <>
                          {canRegisterTeam ? (
                            <Send className="w-4 h-4 me-2" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 me-2" />
                          )}
                          {language === 'ar' ? 'تسجيل الفريق' : 'Submit Registration'}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Looking for Members - Save & Submit Buttons - Only for incomplete teams */}
                {(teamData.isLeader || isAdmin) && !isLocked && !canRegisterTeam && (
                  <div className="bg-logo-orange/10 rounded-2xl p-6 border border-logo-orange/20">
                    <div className="flex items-center gap-3 mb-4">
                      <UserPlus className="w-6 h-6 text-logo-orange" />
                      <div>
                        <h3 className="font-bold text-foreground">
                          {language === 'ar' ? 'البحث عن أعضاء' : 'Looking for Members'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {language === 'ar'
                            ? 'اجعل فريقك مرئيًا للمشاركين الآخرين'
                            : 'Make your team visible to other participants'}
                        </p>
                      </div>
                    </div>

                    {/* Needed Roles Info */}
                    <div className="mb-4 p-3 bg-muted/20 rounded-lg border border-border/50">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-logo-orange">
                          {language === 'ar' ? 'الأدوار المطلوبة: ' : 'Needed roles: '}
                        </span>
                        {REQUIRED_ROLES.filter(role => roleCounts[role] < 1).map(role => {
                          const roleData = roleOptions.find(r => r.value === role);
                          return language === 'ar' ? roleData?.nameAr : roleData?.nameEn;
                        }).join('، ')}
                        {REQUIRED_ROLES.every(role => roleCounts[role] >= 1) && roleCounts['designer'] < 2 && (
                          <span>{language === 'ar' ? 'مصمم إضافي (اختياري)' : 'Extra Designer (optional)'}</span>
                        )}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          toast.success(
                            language === 'ar'
                              ? 'تم حفظ التغييرات'
                              : 'Changes saved'
                          );
                        }}
                      >
                        <Check className="w-4 h-4 me-2" />
                        {language === 'ar' ? 'حفظ' : 'Save'}
                      </Button>
                      <Button
                        variant="hero"
                        className="flex-1"
                        onClick={() => {
                          setTeamData(prev => ({ ...prev, lookingForMembers: true }));
                          toast.success(
                            language === 'ar'
                              ? 'تم إرسال طلب البحث عن أعضاء - فريقك الآن مرئي'
                              : 'Looking for members request sent - your team is now visible'
                          );
                          navigate('/all-teams');
                        }}
                      >
                        <Send className="w-4 h-4 me-2" />
                        {language === 'ar' ? 'إرسال' : 'Submit'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Join Requests Button - Only for team leaders */}
                {teamData.isLeader && !isLocked && (
                  <Button
                    variant="outline"
                    className="w-full border-logo-orange/30 text-logo-orange hover:bg-logo-orange/10"
                    onClick={() => navigate('/team-dashboard/requests')}
                  >
                    <UserPlus className="w-4 h-4 me-2" />
                    {language === 'ar' ? 'طلبات الانضمام' : 'Join Requests'}
                    {joinRequestsCount > 0 && (
                      <Badge className="ms-2 bg-logo-orange/20 text-logo-orange border-0">{joinRequestsCount}</Badge>
                    )}
                  </Button>
                )}

                {/* Acceptance Status Information */}
                {teamData.acceptanceStatus !== 'under_review' && (
                  <div className={cn(
                    "rounded-2xl p-6 border",
                    teamData.acceptanceStatus === 'final_accepted' && "bg-green-500/10 border-green-500/20",
                    teamData.acceptanceStatus === 'first_accepted' && "bg-blue-500/10 border-blue-500/20",
                    teamData.acceptanceStatus === 'rejected' && "bg-red-500/10 border-red-500/20"
                  )}>
                    <div className="flex items-center gap-3 mb-2">
                      <AcceptanceIcon className={cn("w-6 h-6", acceptanceConfig.color)} />
                      <h3 className="font-bold text-foreground">
                        {acceptanceConfig.label}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {teamData.acceptanceStatus === 'final_accepted' && (
                        language === 'ar'
                          ? 'مبروك! تم قبول فريقك نهائيًا. يمكنك الآن المشاركة في المسابقة ودخول صفحة التحضير.'
                          : 'Congratulations! Your team is finally accepted. You can now participate in the competition and access the Preparation tab.'
                      )}
                      {teamData.acceptanceStatus === 'first_accepted' && (
                        language === 'ar'
                          ? 'تم قبول فريقك مبدئيًا. يمكنك الآن الوصول لورش العمل. انتظر القبول النهائي.'
                          : 'Your team is initially accepted. You can now access workshops. Wait for final acceptance.'
                      )}
                      {teamData.acceptanceStatus === 'rejected' && (
                        language === 'ar'
                          ? 'للأسف، لم يتم قبول فريقك. يرجى التواصل مع المنظمين لمزيد من المعلومات.'
                          : 'Unfortunately, your team was not accepted. Please contact the organizers for more information.'
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="mt-0">
            <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {language === 'ar' ? 'أعضاء الفريق' : 'Team Members'}
                </h2>
                {isLocked && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {language === 'ar' ? 'مقفل' : 'Locked'}
                  </span>
                )}
              </div>

              {/* Role-based permissions microcopy */}
              {!teamData.isLeader && (
                <div className="mb-4 p-3 bg-muted/20 rounded-lg border border-border/30">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Crown className="w-3 h-3 text-logo-yellow" />
                    {language === 'ar'
                      ? 'التعديل متاح لقائد الفريق فقط.'
                      : 'Editing is available to the team leader only.'}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {teamMembers.map((member) => {
                  const Icon = member.icon;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl"
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 relative",
                        member.color
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground truncate">
                            {member.name}
                          </span>
                          {member.isLeader && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-logo-yellow/20 text-logo-yellow border border-logo-yellow/30 flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              {language === 'ar' ? 'قائد الفريق' : 'Team Leader'}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {language === 'ar' ? member.roleAr : roleOptions.find(r => r.value === member.role)?.nameEn || member.role}
                        </span>
                      </div>
                      {/* Admin can edit any member, leader can edit non-leaders */}
                      {canEdit && (!member.isLeader || isAdmin) && !isLocked && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditMember(member)}
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingMember(member)}
                            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  );
                })}

                {teamMembers.length >= MIN_TEAM_SIZE && teamMembers.length < MAX_TEAM_SIZE && allRequiredRolesFilled && !isLocked && roleCounts['designer'] < 2 && (
                  <div className="flex items-center gap-4 p-4 border-2 border-dashed border-border/50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                      <UserPlus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <span className="text-muted-foreground">
                        {language === 'ar' ? 'مكان متاح لمصمم إضافي' : 'Slot available for Extra Designer'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Designs Tab */}
          <TabsContent value="designs" className="mt-0">
            <DesignsTab
              isAdmin={isAdmin}
              canEdit={canEdit}
              isLocked={isLocked}
              teamId={teamData.id}
            />
          </TabsContent>

          {/* Preparation Tab */}
          {canViewPreparation && (
            <TabsContent value="preparation" className="mt-0">
              <PreparationTab
                teamMembers={teamMembers.map(m => ({
                  id: m.user_id,
                  name: m.name,
                  role: m.role,
                  roleAr: m.roleAr,
                  icon: m.icon,
                  color: m.color,
                }))}
                isAdmin={isAdmin}
                teamId={teamData.id}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'تعديل دور العضو' : 'Edit Member Role'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                {language === 'ar' ? 'العضو' : 'Member'}
              </Label>
              <p className="font-semibold">{editingMember?.name}</p>
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الدور الجديد' : 'New Role'}</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر الدور' : 'Select role'} />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => {
                    // Check if this role is full (excluding the current member's role)
                    const currentMemberHasRole = editingMember?.role === role.value;
                    const countWithoutCurrentMember = currentMemberHasRole
                      ? roleCounts[role.value] - 1
                      : roleCounts[role.value];
                    const wouldExceedLimit = countWithoutCurrentMember >= role.maxCount;

                    return (
                      <SelectItem
                        key={role.value}
                        value={role.value}
                        disabled={wouldExceedLimit}
                      >
                        <span className="flex items-center gap-2">
                          {language === 'ar' ? role.nameAr : role.nameEn}
                          {wouldExceedLimit && (
                            <span className="text-xs text-muted-foreground">
                              ({language === 'ar' ? 'ممتلئ' : 'Filled'})
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setEditingMember(null)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveRole}>
              {language === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Member Confirmation Dialog */}
      <Dialog open={!!deletingMember} onOpenChange={() => setDeletingMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {language === 'ar' ? 'حذف العضو' : 'Remove Member'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {language === 'ar'
                ? `هل أنت متأكد من حذف "${deletingMember?.name}" من الفريق؟`
                : `Are you sure you want to remove "${deletingMember?.name}" from the team?`}
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeletingMember(null)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDeleteMember}>
              {language === 'ar' ? 'حذف' : 'Remove'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamDashboardPage;
