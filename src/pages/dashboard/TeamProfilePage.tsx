import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import { useTeamById } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Crown, 
  ArrowLeft, 
  ArrowRight,
  Gamepad2, 
  Code, 
  Cpu, 
  Wrench, 
  Palette,
  UserPlus,
  CheckCircle,
  Calendar,
  ClipboardList,
  AlertTriangle,
  XCircle,
  Shield,
  Edit,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface AttendanceRecord {
  memberId: string;
  day: number;
  present: boolean;
}

const TeamProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const { 
    getTeamAttendance, 
    setMemberAttendance,
    updateAttendance 
  } = useAttendance();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDay, setSelectedDay] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAttendance, setEditedAttendance] = useState<{memberId: string; day: number; present: boolean}[]>([]);
  
  // Get admin status from role context
  const { isAdmin } = useRole();
  
  // Fetch real team data from Supabase
  const { team: teamData, loading, error } = useTeamById(id);
  
  const ArrowIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;
  
  // Get attendance from shared context
  const teamId = id || '';
  const contextAttendance = getTeamAttendance(teamId);

  const getRoleName = (roleId: string) => {
    const roleNames: Record<string, { ar: string; en: string }> = {
      driver: { ar: 'التحكم والقيادة', en: 'Driver' },
      programmer: { ar: 'المبرمج', en: 'Programmer' },
      electronics: { ar: 'الإلكترونيات', en: 'Electronics' },
      mechanics_designer: { ar: 'التجميع والتركيب / التصميم الهندسي', en: 'Mechanics / Designer' },
    };
    return language === 'ar' ? roleNames[roleId]?.ar || roleId : roleNames[roleId]?.en || roleId;
  };

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'driver': return Gamepad2;
      case 'programmer': return Code;
      case 'electronics': return Cpu;
      case 'mechanics_designer': return Wrench;
      default: return Users;
    }
  };

  const getRoleColor = (roleId: string) => {
    switch (roleId) {
      case 'driver': return 'from-red-500 to-orange-500';
      case 'programmer': return 'from-blue-500 to-cyan-500';
      case 'electronics': return 'from-green-500 to-emerald-500';
      case 'mechanics_designer': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Transform Supabase data to component format
  const team = teamData ? {
    id: teamData.id,
    name: teamData.name_ar || teamData.name,
    nameEn: teamData.name,
    leaderName: teamData.leaderName || '',
    membersCount: teamData.membersCount,
    status: teamData.isOpen ? 'open' as const : 'registered' as const,
    createdAt: new Date(teamData.created_at).toLocaleDateString(),
    members: teamData.members.map((m, idx) => ({
      id: m.user_id,
      name: m.profile?.full_name || m.profile?.email || 'Unknown',
      role: m.team_role,
      isLeader: m.user_id === teamData.leader_id,
      email: m.profile?.email,
      joinedAt: '',
    })),
    attendance: [] as AttendanceRecord[],
  } : null;

  if (!team || error) {
    return (
      <div className="min-h-[calc(100vh-5rem)] py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />
        <div className="max-w-2xl mx-auto relative z-10 text-center py-20">
          <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            {language === 'ar' ? 'الفريق غير موجود' : 'Team Not Found'}
          </h1>
          <p className="text-white/60 mb-6">
            {language === 'ar' ? 'لم نتمكن من العثور على هذا الفريق' : 'We could not find this team'}
          </p>
          <Button variant="hero" onClick={() => navigate('/all-teams')}>
            <ArrowIcon size={18} className="me-2" />
            {language === 'ar' ? 'العودة للفرق' : 'Back to Teams'}
          </Button>
        </div>
      </div>
    );
  }

  const allRequiredRoles = ['driver', 'programmer', 'electronics', 'mechanics_designer'];
  const filledRoles = team.members.map(m => m.role);
  const missingRoles = allRequiredRoles.filter(r => !filledRoles.includes(r));

  const days = [
    { num: 1, ar: 'اليوم 1', en: 'Day 1' },
    { num: 2, ar: 'اليوم 2', en: 'Day 2' },
    { num: 3, ar: 'اليوم 3', en: 'Day 3' },
    { num: 4, ar: 'اليوم 4', en: 'Day 4' },
  ];

  const getMemberAttendanceForDay = (memberId: string, day: number): boolean | null => {
    const records = isEditing ? editedAttendance : contextAttendance;
    const record = records.find(r => r.memberId === memberId && r.day === day);
    return record ? record.present : null;
  };

  const getTotalAbsencesForMember = (memberId: string): number => {
    const records = isEditing ? editedAttendance : contextAttendance;
    return records.filter(r => r.memberId === memberId && !r.present).length;
  };

  const getTotalAbsencesOverall = (): number => {
    const records = isEditing ? editedAttendance : contextAttendance;
    return records.filter(r => !r.present).length;
  };

  const getViolationsCount = (): number => {
    return team.members.filter(m => getTotalAbsencesForMember(m.id) > 1).length;
  };

  const getMemberStatus = (memberId: string): 'ok' | 'warning' | 'violation' => {
    const absences = getTotalAbsencesForMember(memberId);
    if (absences === 0) return 'ok';
    if (absences === 1) return 'warning';
    return 'violation';
  };

  const getStatusBadge = (status: 'ok' | 'warning' | 'violation') => {
    switch (status) {
      case 'ok':
        return {
          text: language === 'ar' ? 'سليم' : 'OK',
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          icon: CheckCircle,
        };
      case 'warning':
        return {
          text: language === 'ar' ? 'تنبيه' : 'Warning',
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          icon: AlertTriangle,
        };
      case 'violation':
        return {
          text: language === 'ar' ? 'مخالفة' : 'Violation',
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: XCircle,
        };
    }
  };

  const handleStartEditing = () => {
    setEditedAttendance([...contextAttendance]);
    setIsEditing(true);
  };

  const handleToggleAttendance = (memberId: string) => {
    setEditedAttendance(prev => {
      const existing = prev.find(r => r.memberId === memberId && r.day === selectedDay);
      if (existing) {
        return prev.map(r => 
          r.memberId === memberId && r.day === selectedDay 
            ? { ...r, present: !r.present }
            : r
        );
      } else {
        return [...prev, { teamId, memberId, day: selectedDay, present: false }];
      }
    });
  };

  const handleSave = () => {
    // Save to shared context
    updateAttendance(teamId, editedAttendance.map(r => ({ ...r, teamId })));
    setIsEditing(false);
    toast.success(language === 'ar' ? 'تم حفظ الحضور بنجاح' : 'Attendance saved successfully');
  };

  const handleCancel = () => {
    setEditedAttendance([]);
    setIsEditing(false);
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
          className="mb-6 text-white/70 hover:text-white"
          onClick={() => navigate('/all-teams')}
        >
          <ArrowIcon size={20} className="me-2" />
          {language === 'ar' ? 'العودة للفرق' : 'Back to Teams'}
        </Button>

        {/* Team Header Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Team Icon */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-logo-red to-logo-orange flex items-center justify-center shrink-0">
              <Users className="w-12 h-12 text-white" />
            </div>
            
            {/* Team Info */}
            <div className="flex-1 text-center md:text-start">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {language === 'ar' ? team.name : team.nameEn}
                </h1>
                {team.status === 'registered' && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">
                      {language === 'ar' ? 'مكتمل' : 'Complete'}
                    </span>
                  </div>
                )}
                {team.status === 'open' && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-logo-orange/20 rounded-full">
                    <UserPlus className="w-4 h-4 text-logo-orange" />
                    <span className="text-sm font-medium text-logo-orange">
                      {language === 'ar' ? 'يبحث عن أعضاء' : 'Looking for members'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-4 text-white/60">
                <div className="flex items-center gap-1">
                  <Crown className="w-4 h-4 text-logo-yellow" />
                  <span>{team.leaderName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{team.membersCount} {language === 'ar' ? 'أعضاء' : 'members'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{team.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Join Button (for open teams) */}
            {team.status === 'open' && (
              <Button asChild variant="hero" size="lg">
                <Link to={`/join-team?team=${team.id}`} className="flex items-center gap-2">
                  <UserPlus size={18} />
                  {language === 'ar' ? 'طلب الانضمام' : 'Request to Join'}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Tabs for registered teams */}
        {team.status === 'registered' ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 bg-white/5 border border-white/10 p-1 rounded-xl">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                <Users className="w-4 h-4 me-2" />
                {language === 'ar' ? 'نظرة عامة' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="preparation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
                <ClipboardList className="w-4 h-4 me-2" />
                {language === 'ar' ? 'التحضير' : 'Preparation'}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Roles Overview */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">
                  {language === 'ar' ? 'الأدوار' : 'Roles'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {allRequiredRoles.map((roleId) => {
                    const Icon = getRoleIcon(roleId);
                    const isFilled = filledRoles.includes(roleId);
                    return (
                      <div 
                        key={roleId}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                          isFilled 
                            ? `bg-gradient-to-br ${getRoleColor(roleId)} text-white`
                            : "bg-white/10 border-2 border-dashed border-white/30 text-white/50"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{getRoleName(roleId)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">
                  {language === 'ar' ? 'أعضاء الفريق' : 'Team Members'}
                </h2>
                <div className="space-y-3">
                  {team.members.map((member) => {
                    const Icon = getRoleIcon(member.role);
                    return (
                      <div 
                        key={member.id}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                          getRoleColor(member.role)
                        )}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white">{member.name}</h3>
                            {member.isLeader && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-logo-yellow/20 rounded-full">
                                <Crown className="w-3 h-3 text-logo-yellow" />
                                <span className="text-xs text-logo-yellow font-medium">
                                  {language === 'ar' ? 'قائد' : 'Leader'}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-white/60">{getRoleName(member.role)}</p>
                        </div>

                        {member.joinedAt && (
                          <div className="text-end hidden sm:block">
                            <p className="text-xs text-white/40">
                              {language === 'ar' ? 'انضم في' : 'Joined'}
                            </p>
                            <p className="text-sm text-white/60">{member.joinedAt}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Preparation Tab */}
            <TabsContent value="preparation" className="space-y-6">
              {/* Admin Mode Badge */}
              {isAdmin && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-xl border border-primary/20">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {language === 'ar' ? 'وضع المشرف - يمكنك تعديل الحضور' : 'Admin Mode - You can edit attendance'}
                  </span>
                </div>
              )}

              {/* Rule Notice */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <p className="text-sm text-white/60 text-center">
                  {language === 'ar' 
                    ? 'مسموح غياب واحد فقط لكل مشارك خلال 4 أيام.' 
                    : 'Only one absence is allowed per participant across 4 days.'}
                </p>
              </div>

              {/* Day Selector */}
              <div className="flex flex-wrap gap-2 justify-center">
                {days.map((day) => (
                  <Button
                    key={day.num}
                    variant={selectedDay === day.num ? 'default' : 'outline'}
                    onClick={() => setSelectedDay(day.num)}
                    className={cn(
                      "min-w-[100px] border-white/20",
                      selectedDay === day.num 
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/5 text-white hover:bg-white/10"
                    )}
                  >
                    <Calendar className="w-4 h-4 me-2" />
                    {language === 'ar' ? day.ar : day.en}
                  </Button>
                ))}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-white/60 mb-1">
                    {language === 'ar' ? 'اليوم المحدد' : 'Selected Day'}
                  </p>
                  <p className="text-xl font-bold text-white">{selectedDay}</p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-white/60 mb-1">
                    {language === 'ar' ? 'عدد الأعضاء' : 'Members'}
                  </p>
                  <p className="text-xl font-bold text-white">{team.members.length}</p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-xs text-white/60 mb-1">
                    {language === 'ar' ? 'إجمالي الغياب' : 'Total Absences'}
                  </p>
                  <p className="text-xl font-bold text-white">{getTotalAbsencesOverall()}</p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                  <XCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <p className="text-xs text-white/60 mb-1">
                    {language === 'ar' ? 'المخالفات' : 'Violations'}
                  </p>
                  <p className="text-xl font-bold text-white">{getViolationsCount()}</p>
                </div>
              </div>

              {/* Admin Edit Controls */}
              {isAdmin && !isEditing && (
                <div className="flex justify-end">
                  <Button onClick={handleStartEditing} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Edit className="w-4 h-4 me-2" />
                    {language === 'ar' ? 'تعديل الحضور' : 'Edit Attendance'}
                  </Button>
                </div>
              )}

              {isAdmin && isEditing && (
                <div className="flex justify-end gap-3">
                  <Button onClick={handleCancel} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <X className="w-4 h-4 me-2" />
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                    <Save className="w-4 h-4 me-2" />
                    {language === 'ar' ? 'حفظ' : 'Save'}
                  </Button>
                </div>
              )}

              {/* Members Attendance Table */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="text-start p-4 text-sm font-semibold text-white">
                          {language === 'ar' ? 'اسم العضو' : 'Member Name'}
                        </th>
                        <th className="text-start p-4 text-sm font-semibold text-white">
                          {language === 'ar' ? 'الدور' : 'Role'}
                        </th>
                        <th className="text-center p-4 text-sm font-semibold text-white">
                          {language === 'ar' ? `حضور اليوم ${selectedDay}` : `Day ${selectedDay}`}
                        </th>
                        <th className="text-center p-4 text-sm font-semibold text-white">
                          {language === 'ar' ? 'الغيابات' : 'Absences'}
                        </th>
                        <th className="text-center p-4 text-sm font-semibold text-white">
                          {language === 'ar' ? 'الحالة' : 'Status'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.members.map((member) => {
                        const Icon = getRoleIcon(member.role);
                        const attendance = getMemberAttendanceForDay(member.id, selectedDay);
                        const absences = getTotalAbsencesForMember(member.id);
                        const status = getMemberStatus(member.id);
                        const statusBadge = getStatusBadge(status);
                        const StatusIcon = statusBadge.icon;

                        return (
                          <tr key={member.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0",
                                  getRoleColor(member.role)
                                )}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-medium text-white">{member.name}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-white/60">{getRoleName(member.role)}</span>
                            </td>
                            <td className="p-4 text-center">
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span className="text-xs text-white/50">
                                    {language === 'ar' ? 'غائب' : 'Absent'}
                                  </span>
                                  <Switch
                                    checked={getMemberAttendanceForDay(member.id, selectedDay) ?? true}
                                    onCheckedChange={() => handleToggleAttendance(member.id)}
                                  />
                                  <span className="text-xs text-white/50">
                                    {language === 'ar' ? 'حاضر' : 'Present'}
                                  </span>
                                </div>
                              ) : attendance === null ? (
                                <span className="text-white/40">—</span>
                              ) : attendance ? (
                                <div className="flex items-center justify-center gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                  <span className="text-green-400 text-sm">
                                    {language === 'ar' ? 'حاضر' : 'Present'}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <XCircle className="w-5 h-5 text-red-500" />
                                  <span className="text-red-400 text-sm">
                                    {language === 'ar' ? 'غائب' : 'Absent'}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <span className={cn(
                                "font-bold",
                                absences === 0 && "text-green-400",
                                absences === 1 && "text-yellow-400",
                                absences > 1 && "text-red-400"
                              )}>
                                {absences} / 1
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border",
                                statusBadge.color
                              )}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusBadge.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Open teams - show only overview
          <>
            {/* Roles Overview */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4">
                {language === 'ar' ? 'الأدوار' : 'Roles'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {allRequiredRoles.map((roleId) => {
                  const Icon = getRoleIcon(roleId);
                  const isFilled = filledRoles.includes(roleId);
                  return (
                    <div 
                      key={roleId}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                        isFilled 
                          ? `bg-gradient-to-br ${getRoleColor(roleId)} text-white`
                          : "bg-white/10 border-2 border-dashed border-white/30 text-white/50"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{getRoleName(roleId)}</span>
                      {!isFilled && (
                        <span className="text-xs">({language === 'ar' ? 'مطلوب' : 'Needed'})</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                {language === 'ar' ? 'أعضاء الفريق' : 'Team Members'}
              </h2>
              <div className="space-y-3">
                {team.members.map((member) => {
                  const Icon = getRoleIcon(member.role);
                  return (
                    <div 
                      key={member.id}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                        getRoleColor(member.role)
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white">{member.name}</h3>
                          {member.isLeader && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-logo-yellow/20 rounded-full">
                              <Crown className="w-3 h-3 text-logo-yellow" />
                              <span className="text-xs text-logo-yellow font-medium">
                                {language === 'ar' ? 'قائد' : 'Leader'}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-white/60">{getRoleName(member.role)}</p>
                      </div>

                      {member.joinedAt && (
                        <div className="text-end hidden sm:block">
                          <p className="text-xs text-white/40">
                            {language === 'ar' ? 'انضم في' : 'Joined'}
                          </p>
                          <p className="text-sm text-white/60">{member.joinedAt}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Missing Roles Notice */}
              {missingRoles.length > 0 && (
                <div className="mt-6 p-4 bg-logo-orange/10 border border-logo-orange/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <UserPlus className="w-5 h-5 text-logo-orange shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-logo-orange mb-1">
                        {language === 'ar' ? 'الفريق يبحث عن:' : 'Team is looking for:'}
                      </p>
                      <p className="text-white/70">
                        {missingRoles.map(r => getRoleName(r)).join('، ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamProfilePage;
