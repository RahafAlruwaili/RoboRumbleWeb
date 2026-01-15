import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRole } from '@/contexts/RoleContext';
import { useTeams } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Crown,
  Trophy,
  Gamepad2,
  Code,
  Cpu,
  Wrench,
  Palette,
  UserPlus,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  Eye,
  Settings,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AcceptanceStatus, getAcceptanceStatusConfig } from '@/types/team';

const AllTeamsPage = () => {
  const { language, direction } = useLanguage();
  const { isAdmin } = useRole();
  const { teams, loading, error } = useTeams();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  // All required roles (new 4-role system)
  const allRequiredRoles = ['driver', 'programmer', 'electronics', 'mechanics_designer'];

  // Map database status to UI acceptance status
  const mapStatusToAcceptance = (status: string): AcceptanceStatus => {
    switch (status) {
      case 'pending':
        return 'under_review';
      case 'approved':
        return 'first_accepted';
      case 'final_approved':
        return 'final_accepted';
      case 'rejected':
        return 'rejected';
      default:
        return 'under_review';
    }
  };

  // Calculate missing roles for a team
  const getMissingRoles = (members: { team_role: string }[]) => {
    const filledRoles = members.map(m => m.team_role);
    return allRequiredRoles.filter(role => !filledRoles.includes(role));
  };

  // Get acceptance status badge icon
  const getAcceptanceIcon = (status: AcceptanceStatus) => {
    switch (status) {
      case 'under_review': return Clock;
      case 'first_accepted': return CheckCircle2;
      case 'final_accepted': return CheckCircle2;
      case 'rejected': return XCircle;
    }
  };

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

  // Filter teams based on search and role
  const filteredTeams = teams.filter(team => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.name_ar?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (team.leaderName?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    if (roleFilter === 'all') return matchesSearch;

    const missingRoles = getMissingRoles(team.members);
    return matchesSearch && missingRoles.includes(roleFilter);
  });

  const openTeams = filteredTeams.filter(t => t.isOpen);
  const allRegisteredTeams = filteredTeams;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <p className="text-destructive">{language === 'ar' ? 'حدث خطأ في تحميل الفرق' : 'Error loading teams'}</p>
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

      <div className="max-w-5xl mx-auto relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            {language === 'ar' ? 'الفرق' : 'Teams'}
          </h1>
          <p className="text-white/60">
            {language === 'ar'
              ? 'أنشئ فريقك أو انضم لفريق موجود'
              : 'Create your team or join an existing one'}
          </p>
        </div>

        {/* Team Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Create Team Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-logo-red to-logo-orange flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">
                  {language === 'ar' ? 'إنشاء فريق' : 'Create Team'}
                </h2>
                <p className="text-white/60 text-sm mb-4">
                  {language === 'ar'
                    ? 'ستصبح قائد الفريق وستحصل على كود لدعوة الأعضاء'
                    : 'You will become the team leader and get a code to invite members'}
                </p>
                <Button asChild variant="hero" size="default" className="w-full sm:w-auto">
                  <Link to="/create-team" className="flex items-center justify-center gap-2">
                    {language === 'ar' ? 'إنشاء فريق' : 'Create Team'}
                    <ArrowIcon size={16} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Join Team Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-secondary/50 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-logo-orange to-logo-yellow flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">
                  {language === 'ar' ? 'الانضمام لفريق' : 'Join Team'}
                </h2>
                <p className="text-white/60 text-sm mb-4">
                  {language === 'ar'
                    ? 'أدخل كود الفريق من القائد للانضمام'
                    : 'Enter the team code from your leader to join'}
                </p>
                <Button asChild variant="heroOutline" size="default" className="w-full sm:w-auto">
                  <Link to="/join-team" className="flex items-center justify-center gap-2">
                    {language === 'ar' ? 'انضمام' : 'Join'}
                    <KeyRound size={16} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Open Teams Section (Teams looking for members) */}
        {openTeams.length > 0 && (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <UserPlus className="w-8 h-8 text-logo-orange" />
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {language === 'ar' ? 'فرق تبحث عن أعضاء' : 'Teams Looking for Members'}
                </h2>
              </div>
              <p className="text-center text-white/60 mb-6">
                {language === 'ar'
                  ? 'انضم لفريق يحتاج مهاراتك'
                  : 'Join a team that needs your skills'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {openTeams.map((team) => {
                const missingRoles = getMissingRoles(team.members);
                const filledRoles = team.members.map(m => m.team_role);

                return (
                  <div
                    key={team.id}
                    className="bg-white/5 backdrop-blur-sm border border-logo-orange/30 rounded-2xl p-6 hover:bg-white/10 hover:border-logo-orange/50 transition-all duration-300"
                  >
                    {/* Team Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-logo-orange/20 rounded-full">
                        <UserPlus className="w-4 h-4 text-logo-orange" />
                        <span className="text-sm font-bold text-logo-orange">
                          {language === 'ar' ? 'يبحث عن أعضاء' : 'Looking for members'}
                        </span>
                      </div>
                    </div>

                    {/* Team Name */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-logo-orange to-logo-yellow flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {language === 'ar' ? (team.name_ar || team.name) : team.name}
                        </h3>
                        <div className="flex items-center gap-1 text-white/60 text-sm">
                          <Crown className="w-3 h-3 text-logo-yellow" />
                          <span>{team.leaderName || (language === 'ar' ? 'قائد' : 'Leader')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Team Stats */}
                    <div className="flex items-center justify-between text-sm text-white/60 mb-3">
                      <span>{language === 'ar' ? `${team.membersCount}/5 أعضاء` : `${team.membersCount}/5 members`}</span>
                    </div>

                    {/* Filled Roles */}
                    <div className="flex items-center gap-1 mb-3">
                      {filledRoles.map((roleId, roleIndex) => {
                        const Icon = getRoleIcon(roleId);
                        return (
                          <div
                            key={roleIndex}
                            className={cn(
                              "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                              getRoleColor(roleId)
                            )}
                            title={getRoleName(roleId)}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                        );
                      })}
                      {/* Missing roles */}
                      {missingRoles.map((roleId, roleIndex) => {
                        const Icon = getRoleIcon(roleId);
                        return (
                          <div
                            key={`missing-${roleIndex}`}
                            className="w-8 h-8 rounded-lg bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center"
                            title={getRoleName(roleId)}
                          >
                            <Icon className="w-4 h-4 text-white/40" />
                          </div>
                        );
                      })}
                    </div>

                    {/* Missing Roles Text */}
                    {missingRoles.length > 0 && (
                      <div className="text-sm text-white/60 mb-4">
                        <span className="text-logo-orange font-medium">
                          {language === 'ar' ? 'مطلوب: ' : 'Needed: '}
                        </span>
                        {missingRoles.map(r => getRoleName(r)).join('، ')}
                      </div>
                    )}

                    {/* Join Button */}
                    <Button asChild variant="hero" size="sm" className="w-full">
                      <Link to={`/join-team?team=${team.id}`} className="flex items-center justify-center gap-2">
                        <UserPlus size={16} />
                        {language === 'ar' ? 'طلب الانضمام' : 'Request to Join'}
                      </Link>
                    </Button>

                    {/* Admin Dashboard Button */}
                    {isAdmin && (
                      <Button asChild variant="outline" size="sm" className="w-full mt-2 border-logo-orange/50 text-logo-orange hover:bg-logo-orange/10">
                        <Link to={`/team-dashboard?team=${team.id}`} className="flex items-center justify-center gap-2">
                          <Settings size={16} />
                          {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                        </Link>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Registered Teams Section */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-logo-yellow" />
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {language === 'ar' ? 'الفرق المسجلة' : 'Registered Teams'}
            </h2>
          </div>

          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-6">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50" size={18} />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'ابحث عن فريق...' : 'Search for a team...'}
                className="ps-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white/10 border-white/20 text-white">
                <Filter className="w-4 h-4 me-2 text-white/50" />
                <SelectValue placeholder={language === 'ar' ? 'تصفية بالدور' : 'Filter by role'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === 'ar' ? 'كل الأدوار' : 'All Roles'}
                </SelectItem>
                <SelectItem value="driver">
                  {language === 'ar' ? 'التحكم والقيادة' : 'Driver'}
                </SelectItem>
                <SelectItem value="programmer">
                  {language === 'ar' ? 'مبرمج' : 'Programmer'}
                </SelectItem>
                <SelectItem value="electronics">
                  {language === 'ar' ? 'إلكترونيات' : 'Electronics'}
                </SelectItem>
                <SelectItem value="mechanic">
                  {language === 'ar' ? 'ميكانيكي' : 'Mechanic'}
                </SelectItem>
                <SelectItem value="designer">
                  {language === 'ar' ? 'مصمم' : 'Designer'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Teams Grid */}
        {allRegisteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-white/20 mb-4" />
            <p className="text-white/60">
              {language === 'ar' ? 'لا توجد فرق مسجلة بعد' : 'No teams registered yet'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRegisteredTeams.map((team) => {
              const acceptanceStatus = mapStatusToAcceptance(team.status);
              const statusConfig = getAcceptanceStatusConfig(acceptanceStatus, language as 'ar' | 'en');
              const StatusIcon = getAcceptanceIcon(acceptanceStatus);
              const filledRoles = team.members.map(m => m.team_role);

              return (
                <div
                  key={team.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  {/* Acceptance Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1",
                        statusConfig.className
                      )}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">
                        {statusConfig.label}
                      </span>
                    </Badge>

                    {/* View Team Button */}
                    <Button asChild variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10">
                      <Link to={`/team/${team.id}`}>
                        <Eye size={18} />
                      </Link>
                    </Button>
                  </div>

                  {/* Team Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-logo-yellow to-logo-orange flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {language === 'ar' ? (team.name_ar || team.name) : team.name}
                      </h3>
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <Crown className="w-3 h-3 text-logo-yellow" />
                        <span>{team.leaderName || (language === 'ar' ? 'قائد' : 'Leader')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Team Stats */}
                  <div className="flex items-center justify-between text-sm text-white/60 mb-3">
                    <span>{language === 'ar' ? `${team.membersCount}/5 أعضاء` : `${team.membersCount}/5 members`}</span>
                    {team.isOpen ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        {language === 'ar' ? 'مفتوح' : 'Open'}
                      </Badge>
                    ) : (
                      <Badge className="bg-white/10 text-white/60 border-white/20 text-xs">
                        {language === 'ar' ? 'مكتمل' : 'Full'}
                      </Badge>
                    )}
                  </div>

                  {/* Roles */}
                  <div className="flex items-center gap-1">
                    {filledRoles.map((roleId, roleIndex) => {
                      const Icon = getRoleIcon(roleId);
                      return (
                        <div
                          key={roleIndex}
                          className={cn(
                            "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                            getRoleColor(roleId)
                          )}
                          title={getRoleName(roleId)}
                        >
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Admin Dashboard Button */}
                  {isAdmin && (
                    <Button asChild variant="outline" size="sm" className="w-full mt-4 border-logo-orange/50 text-logo-orange hover:bg-logo-orange/10">
                      <Link to={`/team-dashboard?team=${team.id}`} className="flex items-center justify-center gap-2">
                        <Settings size={16} />
                        {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTeamsPage;
