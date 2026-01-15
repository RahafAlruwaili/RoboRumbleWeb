import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard } from '@/hooks/useScores';
import { Input } from '@/components/ui/input';
import { Trophy, Medal, Award, Calendar, Search, Cpu, Wrench, Target, Zap, Star, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type TeamStatus = 'active' | 'warning' | 'violation' | 'disqualified';

interface LeaderboardPageProps {
  isDashboard?: boolean;
}

const LeaderboardPage = ({ isDashboard = false }: LeaderboardPageProps) => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState<'overall' | 1 | 2 | 3 | 4>('overall');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real leaderboard data
  const { leaderboard, loading, error } = useLeaderboard();

  // In dashboard context, always allow access (user is authenticated)
  const canAccessDetails = isDashboard || isAuthenticated;

  const lockTooltip = language === 'ar' 
    ? 'التفاصيل للمسجلين فقط'
    : 'Details for logged-in users only';

  // Judge's Award winner (can be configured in database later)
  const judgesAwardTeamId: string | null = null;
  const judgesAwardTeam = judgesAwardTeamId ? leaderboard.find(team => team.id === judgesAwardTeamId) : null;

  const days = [{
    key: 'overall' as const,
    label: t('leaderboard.overall')
  }, {
    key: 1 as const,
    label: `${t('leaderboard.day')} 1`
  }, {
    key: 2 as const,
    label: `${t('leaderboard.day')} 2`
  }, {
    key: 3 as const,
    label: `${t('leaderboard.day')} 3`
  }, {
    key: 4 as const,
    label: `${t('leaderboard.day')} 4`
  }];

  const getScore = (team: typeof leaderboard[0]) => {
    if (activeDay === 'overall') return team.totalScore;
    // Daily scores would be implemented when available
    return team.dailyScores?.[activeDay - 1] ?? 0;
  };

  const getTeamName = (team: typeof leaderboard[0]) => {
    return language === 'ar' ? team.name : team.nameEn;
  };

  const filteredTeams = leaderboard.filter(team => {
    const name = getTeamName(team).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const sortedTeams = [...filteredTeams].sort((a, b) => getScore(b) - getScore(a));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-logo-yellow" size={28} />;
      case 2:
        return <Medal className="text-gray-400" size={28} />;
      case 3:
        return <Award className="text-logo-orange" size={28} />;
      default:
        return <span className="text-2xl font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-logo-yellow/20 to-logo-orange/10 border-logo-yellow/50';
      case 2:
        return 'bg-gradient-to-r from-gray-500/20 to-gray-400/10 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-logo-orange/20 to-logo-red/10 border-logo-orange/50';
      default:
        return 'bg-card border-border';
    }
  };

  const getStatusBadge = (status: TeamStatus) => {
    const statusConfig = {
      active: {
        label: t('leaderboard.active'),
        className: 'bg-green-500/20 text-green-400 border-green-500/30'
      },
      warning: {
        label: t('leaderboard.warning'),
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      },
      violation: {
        label: t('leaderboard.violation'),
        className: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      },
      disqualified: {
        label: t('leaderboard.disqualified'),
        className: 'bg-red-500/20 text-red-400 border-red-500/30'
      }
    };
    const config = statusConfig[status];
    return <Badge variant="outline" className={cn('text-xs', config.className)}>
        {config.label}
      </Badge>;
  };

  const handleTeamClick = (teamId: string) => {
    if (canAccessDetails) {
      const basePath = isDashboard ? '/dashboard/leaderboard' : '/leaderboard';
      navigate(`${basePath}/team/${teamId}`);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <div className="py-12">
      {/* Hero */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-logo-orange/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-logo-yellow/5 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-logo-red/8 rounded-full blur-3xl" />
        </div>

        {/* Decorative floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-8 md:left-16 opacity-20 animate-[spin_20s_linear_infinite]">
            <Cpu className="w-16 h-16 md:w-24 md:h-24 text-logo-orange" />
          </div>
          <div className="absolute top-16 right-4 md:right-12 opacity-15 animate-[spin_25s_linear_infinite_reverse]">
            <div className="relative">
              <Cpu className="w-20 h-20 md:w-32 md:h-32 text-logo-yellow" />
              <Cpu className="absolute -bottom-4 -left-4 w-10 h-10 md:w-16 md:h-16 text-logo-orange animate-[spin_15s_linear_infinite]" />
            </div>
          </div>
          <div className="absolute bottom-32 left-12 md:left-24 opacity-20 rotate-[-20deg]">
            <Wrench className="w-12 h-12 md:w-20 md:h-20 text-logo-red" />
          </div>
          <div className="absolute bottom-24 left-1/3 opacity-15 animate-[spin_30s_linear_infinite]">
            <Target className="w-14 h-14 md:w-20 md:h-20 text-logo-yellow" />
          </div>
          <div className="absolute top-1/2 right-8 md:right-20 opacity-20">
            <Zap className="w-10 h-10 md:w-16 md:h-16 text-logo-orange" />
          </div>
          <div className="absolute bottom-40 right-16 md:right-32 opacity-15 animate-[spin_18s_linear_infinite_reverse]">
            <Cpu className="w-12 h-12 md:w-18 md:h-18 text-logo-red" />
          </div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-animated mb-4">
              {t('leaderboard.title')}
            </h1>
            <p className="text-xl text-white/70">
              {t('leaderboard.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-16">
        <div className="container mx-auto">
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            {/* Day Selector - Dropdown */}
            <Select value={String(activeDay)} onValueChange={value => setActiveDay(value === 'overall' ? 'overall' : Number(value) as 1 | 2 | 3 | 4)}>
              <SelectTrigger className="w-[200px] bg-secondary border-border text-foreground">
                <SelectValue placeholder={t('leaderboard.overall')} />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-border">
                {days.map(day => <SelectItem key={day.key} value={String(day.key)} className="cursor-pointer text-foreground hover:bg-muted focus:bg-muted">
                    <span className="flex items-center gap-2">
                      <span className="text-white">
                        {day.key === 'overall' ? <Trophy size={16} /> : <Calendar size={16} />}
                      </span>
                      <span>{day.label}</span>
                    </span>
                  </SelectItem>)}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input placeholder={t('leaderboard.searchTeams')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="ps-10" />
            </div>
          </div>

          {sortedTeams.length > 0 ? <>
              {/* Top 3 Podium */}
              <div className="flex justify-center items-end gap-4 mb-12">
                {/* 2nd Place */}
                {sortedTeams[1] && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={cn(
                          "text-center transition-transform relative",
                          canAccessDetails ? "cursor-pointer hover:scale-105" : "cursor-default"
                        )} 
                        onClick={() => handleTeamClick(sortedTeams[1].id)}
                      >
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-300 border-4 border-gray-400 flex items-center justify-center mb-3 shadow-lg">
                          <Medal className="text-gray-600" size={48} />
                        </div>
                        <p className="font-bold text-primary">{getTeamName(sortedTeams[1])}</p>
                        <p className="text-2xl font-bold text-primary">{getScore(sortedTeams[1])}</p>
                        {!canAccessDetails && (
                          <div className="absolute top-2 end-2 bg-black/60 rounded-full p-1.5">
                            <Lock className="w-4 h-4 text-white/80" />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    {!canAccessDetails && (
                      <TooltipContent>
                        <p>{lockTooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                )}
                
                {/* 1st Place */}
                {sortedTeams[0] && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={cn(
                          "text-center -mt-8 transition-transform relative",
                          canAccessDetails ? "cursor-pointer hover:scale-105" : "cursor-default"
                        )} 
                        onClick={() => handleTeamClick(sortedTeams[0].id)}
                      >
                        <div className="w-28 h-28 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-logo-yellow to-logo-orange border-4 border-logo-yellow flex items-center justify-center mb-3 shadow-lg animate-pulse-glow">
                          <Trophy className="text-white" size={56} />
                        </div>
                        <p className="font-bold text-lg text-primary">{getTeamName(sortedTeams[0])}</p>
                        <p className="text-3xl font-bold text-gradient">{getScore(sortedTeams[0])}</p>
                        {!canAccessDetails && (
                          <div className="absolute top-2 end-2 bg-black/60 rounded-full p-1.5">
                            <Lock className="w-4 h-4 text-white/80" />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    {!canAccessDetails && (
                      <TooltipContent>
                        <p>{lockTooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                )}
                
                {/* 3rd Place */}
                {sortedTeams[2] && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={cn(
                          "text-center transition-transform relative",
                          canAccessDetails ? "cursor-pointer hover:scale-105" : "cursor-default"
                        )} 
                        onClick={() => handleTeamClick(sortedTeams[2].id)}
                      >
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-logo-orange to-logo-red border-4 border-logo-orange flex items-center justify-center mb-3 shadow-lg">
                          <Award className="text-white" size={48} />
                        </div>
                        <p className="font-bold text-primary">{getTeamName(sortedTeams[2])}</p>
                        <p className="text-2xl font-bold text-primary">{getScore(sortedTeams[2])}</p>
                        {!canAccessDetails && (
                          <div className="absolute top-2 end-2 bg-black/60 rounded-full p-1.5">
                            <Lock className="w-4 h-4 text-white/80" />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    {!canAccessDetails && (
                      <TooltipContent>
                        <p>{lockTooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                )}
              </div>

              {/* Judge's Award Card */}
              {judgesAwardTeam && (
                <div className="flex justify-center mb-12">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={cn(
                          "relative bg-gradient-to-r from-purple-500/20 via-purple-600/10 to-purple-500/20 border-2 border-purple-500/50 rounded-2xl p-6 transition-transform max-w-md w-full",
                          canAccessDetails ? "cursor-pointer hover:scale-105" : "cursor-default"
                        )} 
                        onClick={() => handleTeamClick(judgesAwardTeam.id)}
                      >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-purple-600 text-white border-purple-400 px-4 py-1">
                            <Star className="w-4 h-4 me-1 inline" />
                            {t('leaderboard.judgesAward')}
                          </Badge>
                        </div>
                        {!canAccessDetails && (
                          <div className="absolute top-2 end-2 bg-black/60 rounded-full p-1.5">
                            <Lock className="w-4 h-4 text-white/80" />
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-4 mt-2">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 border-2 border-purple-400 flex items-center justify-center shadow-lg">
                            <Star className="text-white" size={32} />
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-lg text-primary">{getTeamName(judgesAwardTeam)}</p>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    {!canAccessDetails && (
                      <TooltipContent>
                        <p>{lockTooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>
              )}

              {/* Full Rankings Table */}
              <div className="max-w-5xl mx-auto">
                <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 bg-secondary text-secondary-foreground font-bold text-sm">
                    <span className="col-span-1">{t('leaderboard.rank')}</span>
                    <span className="col-span-5">{t('leaderboard.team')}</span>
                    <span className="col-span-2 text-center">{t('leaderboard.scores')}</span>
                    <span className="col-span-2 text-center">{t('leaderboard.total')}</span>
                    <span className="col-span-2 text-end">{t('leaderboard.status')}</span>
                  </div>

                  {/* Rows */}
                  {sortedTeams.map((team, index) => (
                    <Tooltip key={team.id}>
                      <TooltipTrigger asChild>
                        <div 
                          onClick={() => handleTeamClick(team.id)} 
                          className={cn(
                            "grid grid-cols-12 gap-4 p-4 border-b border-border items-center transition-all",
                            canAccessDetails ? "hover:bg-muted/50 cursor-pointer" : "cursor-default",
                            getRankStyle(index + 1)
                          )}
                        >
                          <div className="col-span-1 flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                              {getRankIcon(index + 1)}
                            </div>
                          </div>
                          <span className="col-span-5 font-semibold text-white flex items-center gap-2">
                            {getTeamName(team)}
                            {team.id === judgesAwardTeamId && (
                              <Badge className="bg-purple-600/80 text-white border-purple-400 text-xs px-2 py-0.5">
                                <Star className="w-3 h-3 me-1 inline" />
                                {t('leaderboard.judgesAward')}
                              </Badge>
                            )}
                          </span>
                          <span className="col-span-2 text-center text-white/70">{team.scoresCount}</span>
                          <span className="col-span-2 text-center text-2xl font-bold text-primary">{team.totalScore}</span>
                          <div className="col-span-2 flex justify-end items-center gap-2">
                            {getStatusBadge('active')}
                            {!canAccessDetails && (
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      {!canAccessDetails && (
                        <TooltipContent>
                          <p>{lockTooltip}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </div>
              </div>
            </> : (/* Empty State */
        <div className="text-center py-16">
              <Trophy className="mx-auto text-muted-foreground mb-4" size={64} />
              <p className="text-xl text-muted-foreground">{t('leaderboard.noData')}</p>
            </div>)}
        </div>
      </section>
    </div>;
};

export default LeaderboardPage;