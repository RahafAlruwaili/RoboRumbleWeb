import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, ArrowLeft, ArrowRight, LayoutDashboard, ClipboardList, Users as UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams, useNavigate } from 'react-router-dom';
import PreparationTab from '@/components/dashboard/PreparationTab';
import { Gamepad2, Code, Cpu, Wrench, Palette } from 'lucide-react';

interface DayScore {
  day: number;
  score: number;
  penalties: number;
  total: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleAr: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface TeamData {
  id: string;
  name: string;
  nameEn: string;
  rank: number;
  totalScore: number;
  dailyScores: DayScore[];
  judgeNotes: string | null;
  members: TeamMember[];
}

const TeamDetailsPage = () => {
  const { t, language, direction } = useLanguage();
  const { isAdmin } = useRole();
  const { teamId } = useParams();
  const navigate = useNavigate();
  const ArrowIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;
  const [activeTab, setActiveTab] = useState('overview');

  // Mock team members data (new 4-role system)
  const mockTeamMembers: TeamMember[] = [
    { id: '1', name: 'أحمد محمد', role: 'driver', roleAr: 'التحكم والقيادة', icon: Gamepad2, color: 'from-red-500 to-orange-500' },
    { id: '2', name: 'سعيد علي', role: 'programmer', roleAr: 'المبرمج', icon: Code, color: 'from-blue-500 to-cyan-500' },
    { id: '3', name: 'محمد خالد', role: 'electronics', roleAr: 'الإلكترونيات', icon: Cpu, color: 'from-green-500 to-emerald-500' },
    { id: '4', name: 'عمر سالم', role: 'mechanics_designer', roleAr: 'التجميع والتركيب / التصميم الهندسي', icon: Wrench, color: 'from-purple-500 to-pink-500' },
  ];

  // Mock data - structured for backend integration
  const mockTeamData: Record<string, TeamData> = {
    '1': {
      id: '1',
      name: 'فريق الصقور',
      nameEn: 'Team Falcons',
      rank: 1,
      totalScore: 115,
      dailyScores: [
        { day: 1, score: 28, penalties: 3, total: 25 },
        { day: 2, score: 30, penalties: 2, total: 28 },
        { day: 3, score: 32, penalties: 2, total: 30 },
        { day: 4, score: 34, penalties: 2, total: 32 },
      ],
      judgeNotes: language === 'ar' 
        ? 'أداء متميز في مرحلة التصميم. يحتاج لتحسين في سرعة التنفيذ.'
        : 'Excellent performance in design phase. Needs improvement in execution speed.',
      members: mockTeamMembers,
    },
    '2': {
      id: '2',
      name: 'فريق الأبطال',
      nameEn: 'Team Champions',
      rank: 2,
      totalScore: 111,
      dailyScores: [
        { day: 1, score: 26, penalties: 2, total: 24 },
        { day: 2, score: 29, penalties: 2, total: 27 },
        { day: 3, score: 31, penalties: 2, total: 29 },
        { day: 4, score: 33, penalties: 2, total: 31 },
      ],
      judgeNotes: null,
      members: mockTeamMembers,
    },
    '3': {
      id: '3',
      name: 'فريق الروبوتات',
      nameEn: 'Team Robotics',
      rank: 3,
      totalScore: 107,
      dailyScores: [
        { day: 1, score: 25, penalties: 2, total: 23 },
        { day: 2, score: 28, penalties: 2, total: 26 },
        { day: 3, score: 30, penalties: 2, total: 28 },
        { day: 4, score: 32, penalties: 2, total: 30 },
      ],
      judgeNotes: language === 'ar'
        ? 'تصميم مبتكر. تحذير بسبب تأخر في تسليم المرحلة الثانية.'
        : 'Innovative design. Warning due to late submission in phase 2.',
      members: mockTeamMembers,
    },
  };

  // Default team data for unknown IDs
  const defaultTeam: TeamData = {
    id: teamId || '0',
    name: 'فريق غير معروف',
    nameEn: 'Unknown Team',
    rank: 0,
    totalScore: 0,
    dailyScores: [
      { day: 1, score: 0, penalties: 0, total: 0 },
      { day: 2, score: 0, penalties: 0, total: 0 },
      { day: 3, score: 0, penalties: 0, total: 0 },
      { day: 4, score: 0, penalties: 0, total: 0 },
    ],
    judgeNotes: null,
    members: [],
  };

  const team = teamId && mockTeamData[teamId] ? mockTeamData[teamId] : defaultTeam;
  const teamName = language === 'ar' ? team.name : team.nameEn;

  return (
    <div className="py-12">
      {/* Hero */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-logo-orange/10 rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Button 
              variant="ghost" 
              className="mb-6 text-white/70 hover:text-white"
              onClick={() => navigate(-1)}
            >
              <ArrowIcon size={20} className="me-2" />
              {t('leaderboard.backToLeaderboard')}
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-animated mb-4">
              {teamName}
            </h1>
            <p className="text-xl text-white/70">
              {t('leaderboard.teamDetails')}
            </p>
          </div>
        </div>
      </section>

      {/* Team Content with Tabs */}
      <section className="py-8">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-muted/30 p-1 mb-6">
                <TabsTrigger 
                  value="overview" 
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <LayoutDashboard className="w-4 h-4 me-2" />
                  {language === 'ar' ? 'نظرة عامة' : 'Overview'}
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger 
                    value="preparation"
                    className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <ClipboardList className="w-4 h-4 me-2" />
                    {language === 'ar' ? 'التحضير' : 'Preparation'}
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0">
                {/* Quick Stats */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-card rounded-2xl p-6 shadow-card border border-border text-center">
                    <Trophy className="mx-auto text-logo-yellow mb-4" size={48} />
                    <p className="text-muted-foreground mb-2">{t('leaderboard.currentRank')}</p>
                    <p className="text-5xl font-bold text-gradient">#{team.rank}</p>
                  </div>
                  <div className="bg-card rounded-2xl p-6 shadow-card border border-border text-center">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">Σ</span>
                    </div>
                    <p className="text-muted-foreground mb-2">{t('leaderboard.totalScore')}</p>
                    <p className="text-5xl font-bold text-primary">{team.totalScore}</p>
                  </div>
                </div>

                {/* Daily Breakdown Table */}
                <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border mb-12">
                  <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">{t('leaderboard.dailyBreakdown')}</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="px-6 py-4 text-start text-sm font-bold text-secondary-foreground">
                            {t('leaderboard.day')}
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-bold text-secondary-foreground">
                            {t('leaderboard.score')}
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-bold text-secondary-foreground">
                            {t('leaderboard.penalties')}
                          </th>
                          <th className="px-6 py-4 text-end text-sm font-bold text-secondary-foreground">
                            {t('leaderboard.dayTotal')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.dailyScores.map((dayScore) => (
                          <tr key={dayScore.day} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-foreground">
                              {t('leaderboard.day')} {dayScore.day}
                            </td>
                            <td className="px-6 py-4 text-center text-muted-foreground">
                              {dayScore.score}
                            </td>
                            <td className="px-6 py-4 text-center text-destructive">
                              {dayScore.penalties > 0 ? `-${dayScore.penalties}` : '0'}
                            </td>
                            <td className="px-6 py-4 text-end font-bold text-primary text-lg">
                              {dayScore.total}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Judge Notes */}
                <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border">
                  <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">{t('leaderboard.judgeNotes')}</h2>
                  </div>
                  <div className="p-6">
                    {team.judgeNotes ? (
                      <p className="text-muted-foreground leading-relaxed">{team.judgeNotes}</p>
                    ) : (
                      <p className="text-muted-foreground italic">{t('leaderboard.noNotes')}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Preparation Tab - Admin Only */}
              {isAdmin && (
                <TabsContent value="preparation" className="mt-0">
                  <PreparationTab 
                    teamMembers={team.members.map(m => ({
                      id: m.id,
                      name: m.name,
                      role: m.role,
                      roleAr: m.roleAr,
                      icon: m.icon,
                      color: m.color,
                    }))}
                    isAdmin={isAdmin}
                    teamId={team.id}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamDetailsPage;
