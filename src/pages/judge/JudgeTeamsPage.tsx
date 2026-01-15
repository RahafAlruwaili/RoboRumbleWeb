import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
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
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Scale,
  ArrowRight,
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
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Team {
  id: string;
  name: string;
  nameEn: string;
  leaderName: string;
  membersCount: number;
  roles: string[];
  acceptanceStatus: AcceptanceStatus;
}

const JudgeTeamsPage = () => {
  const { language, direction } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch teams from database
  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['judge-teams'],
    queryFn: async () => {
      // Fetch teams
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (teamsError) throw teamsError;

      // Fetch team members with their profiles
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('team_id, team_role, user_id');

      if (membersError) throw membersError;

      // Fetch all profiles separately
      const memberUserIds = [...new Set((members || []).map(m => m.user_id))];
      const { data: memberProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', memberUserIds);

      // Fetch leader profiles
      const leaderIds = teams?.map(t => t.leader_id).filter(Boolean) || [];
      const { data: leaderProfiles, error: leaderError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', leaderIds);

      if (leaderError) throw leaderError;

      // Transform data
      const transformedTeams: Team[] = (teams || []).map(team => {
        const teamMembers = members?.filter(m => m.team_id === team.id) || [];
        const leaderProfile = leaderProfiles?.find(p => p.user_id === team.leader_id);
        const roles = teamMembers.map(m => m.team_role).filter(Boolean) as string[];

        // Map status from database to AcceptanceStatus
        const statusMap: Record<string, AcceptanceStatus> = {
          'pending': 'under_review',
          'approved': 'first_accepted',
          'final_approved': 'final_accepted',
          'rejected': 'rejected',
        };

        return {
          id: team.id,
          name: team.name_ar || team.name,
          nameEn: team.name,
          leaderName: leaderProfile?.full_name || (language === 'ar' ? 'غير معروف' : 'Unknown'),
          membersCount: teamMembers.length,
          roles: roles.length > 0 ? roles : ['driver'],
          acceptanceStatus: statusMap[team.status || 'pending'] || 'under_review',
        };
      });

      return transformedTeams;
    },
  });

  const allTeams = teamsData || [];

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

  // Filter teams
  const filteredTeams = allTeams
    .filter(team => 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leaderName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(team => roleFilter === 'all' || team.roles.includes(roleFilter))
    .filter(team => statusFilter === 'all' || team.acceptanceStatus === statusFilter);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <Loader2 className="w-8 h-8 text-logo-orange animate-spin" />
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
        {/* Judge Mode Badge + Back Button */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50 px-3 py-1">
            <Scale className="w-3 h-3 me-1" />
            {language === 'ar' ? 'وضع المحكم - للاطلاع فقط' : 'Judge Mode - View Only'}
          </Badge>
          <Link to="/judge">
            <Button variant="outline" className="border-white/20 text-white/80 hover:bg-white/10">
              <ArrowRight className="w-4 h-4 me-2 rtl:rotate-180" />
              {language === 'ar' ? 'العودة للتحكيم' : 'Back to Judge'}
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-logo-yellow" />
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              {language === 'ar' ? 'عرض الفرق' : 'Teams Overview'}
            </h1>
          </div>
          <p className="text-white/60">
            {language === 'ar' 
              ? 'استعرض جميع الفرق المسجلة في المسابقة' 
              : 'Browse all teams registered in the competition'}
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{allTeams.length}</div>
            <div className="text-sm text-white/60">{language === 'ar' ? 'إجمالي الفرق' : 'Total Teams'}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {allTeams.filter(t => t.acceptanceStatus === 'final_accepted').length}
            </div>
            <div className="text-sm text-white/60">{language === 'ar' ? 'مقبول نهائياً' : 'Final Accepted'}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {allTeams.filter(t => t.acceptanceStatus === 'first_accepted').length}
            </div>
            <div className="text-sm text-white/60">{language === 'ar' ? 'مقبول مبدئياً' : 'First Accepted'}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {allTeams.filter(t => t.acceptanceStatus === 'under_review').length}
            </div>
            <div className="text-sm text-white/60">{language === 'ar' ? 'قيد المراجعة' : 'Under Review'}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto mb-8">
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
            <SelectTrigger className="w-full sm:w-[180px] bg-white/10 border-white/20 text-white">
              <Filter className="w-4 h-4 me-2 text-white/50" />
              <SelectValue placeholder={language === 'ar' ? 'تصفية بالدور' : 'Filter by role'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'كل الأدوار' : 'All Roles'}</SelectItem>
              <SelectItem value="driver">{language === 'ar' ? 'السائق' : 'Driver'}</SelectItem>
              <SelectItem value="programmer">{language === 'ar' ? 'مبرمج' : 'Programmer'}</SelectItem>
              <SelectItem value="electronics">{language === 'ar' ? 'إلكترونيات' : 'Electronics'}</SelectItem>
              <SelectItem value="mechanic">{language === 'ar' ? 'ميكانيكي' : 'Mechanic'}</SelectItem>
              <SelectItem value="designer">{language === 'ar' ? 'مصمم' : 'Designer'}</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white/10 border-white/20 text-white">
              <Filter className="w-4 h-4 me-2 text-white/50" />
              <SelectValue placeholder={language === 'ar' ? 'الحالة' : 'Status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ar' ? 'كل الحالات' : 'All Statuses'}</SelectItem>
              <SelectItem value="final_accepted">{language === 'ar' ? 'مقبول نهائياً' : 'Final Accepted'}</SelectItem>
              <SelectItem value="first_accepted">{language === 'ar' ? 'مقبول مبدئياً' : 'First Accepted'}</SelectItem>
              <SelectItem value="under_review">{language === 'ar' ? 'قيد المراجعة' : 'Under Review'}</SelectItem>
              <SelectItem value="rejected">{language === 'ar' ? 'مرفوض' : 'Rejected'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <p className="text-center text-white/60 mb-6">
          {language === 'ar' 
            ? `عرض ${filteredTeams.length} فريق` 
            : `Showing ${filteredTeams.length} teams`}
        </p>

        {/* Teams Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => {
            const statusConfig = getAcceptanceStatusConfig(team.acceptanceStatus, language);
            const StatusIcon = getAcceptanceIcon(team.acceptanceStatus);

            return (
              <div 
                key={team.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-all duration-300"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs px-2 py-0.5",
                      team.acceptanceStatus === 'final_accepted' && "bg-green-500/20 text-green-300 border-green-500/50",
                      team.acceptanceStatus === 'first_accepted' && "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
                      team.acceptanceStatus === 'under_review' && "bg-blue-500/20 text-blue-300 border-blue-500/50",
                      team.acceptanceStatus === 'rejected' && "bg-red-500/20 text-red-300 border-red-500/50"
                    )}
                  >
                    <StatusIcon className="w-3 h-3 me-1" />
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Team Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-logo-orange to-logo-yellow flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {language === 'ar' ? team.name : team.nameEn}
                    </h3>
                    <div className="flex items-center gap-1 text-white/60 text-sm">
                      <Crown className="w-3 h-3 text-logo-yellow" />
                      <span>{team.leaderName}</span>
                    </div>
                  </div>
                </div>

                {/* Member Count */}
                <div className="flex items-center justify-between text-sm text-white/60 mb-3">
                  <span>{language === 'ar' ? `${team.membersCount}/5 أعضاء` : `${team.membersCount}/5 members`}</span>
                </div>

                {/* Roles */}
                <div className="flex items-center gap-1 mb-4">
                  {team.roles.map((roleId, roleIndex) => {
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

                {/* View Details Button */}
                <Button asChild variant="outline" size="sm" className="w-full border-white/20 text-white/80 hover:bg-white/10">
                  <Link to={`/team/${team.id}`} className="flex items-center justify-center gap-2">
                    <Eye size={16} />
                    {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">
              {language === 'ar' ? 'لا توجد فرق مطابقة للبحث' : 'No teams match your search'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeTeamsPage;
