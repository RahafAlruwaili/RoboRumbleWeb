import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Trophy, Users, ClipboardList, Gavel, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const JudgeDashboardPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  // Fetch accepted teams count (approved or final_approved)
  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['judge-teams-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .in('status', ['approved', 'final_approved']);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch scores by current judge
  const { data: scoresData, isLoading: scoresLoading } = useQuery({
    queryKey: ['judge-scores', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('scores')
        .select(`
          id,
          team_id,
          total_score,
          created_at,
          updated_at,
          teams (name, name_ar)
        `)
        .eq('judge_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const totalTeams = teamsData?.length || 0;
  const evaluatedTeams = scoresData?.length || 0;
  const remainingTeams = Math.max(0, totalTeams - evaluatedTeams);
  const pendingEvaluations = remainingTeams;

  const judgeName = user?.email?.split('@')[0] || (language === 'ar' ? 'محكم' : 'Judge');
  const isLoading = teamsLoading || scoresLoading;

  // Recent evaluations (last 5)
  const recentEvaluations = (scoresData || []).slice(0, 5).map((score: any) => ({
    team: language === 'ar' ? (score.teams?.name_ar || score.teams?.name) : score.teams?.name,
    score: score.total_score,
    time: formatDistanceToNow(new Date(score.updated_at), {
      addSuffix: false,
      locale: language === 'ar' ? ar : enUS,
    }),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 via-purple-600/10 to-transparent border border-purple-500/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-purple-500/20 border border-purple-500/40">
              <Gavel className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-purple-400 font-medium mb-1">
                {language === 'ar' ? 'مرحباً بك' : 'Welcome back'}
              </p>
              <h2 className="text-2xl font-bold capitalize text-primary">
                {judgeName}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="text-center">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mx-auto" />
              ) : (
                <p className="text-3xl font-bold text-yellow-500">{pendingEvaluations}</p>
              )}
              <p className="text-sm text-yellow-600/80">
                {language === 'ar' ? 'تقييم معلق' : 'Pending Evaluations'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Judge Mode Label */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg">
          <Scale className="w-5 h-5 text-purple-500" />
          <span className="text-purple-500 font-semibold">
            {language === 'ar' ? 'وضع التحكيم' : 'Judge Mode'}
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-primary">
          {language === 'ar' ? 'لوحة التحكيم' : 'Judge Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'مرحباً بك في لوحة التحكيم. من هنا يمكنك تقييم الفرق المشاركة.' : 'Welcome to the Judge Dashboard. From here you can evaluate participating teams.'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-purple-500 mx-auto mb-1" />
            ) : (
              <p className="text-2xl font-bold text-purple-500">{totalTeams}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'فريق للتقييم' : 'Teams to Evaluate'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-green-500 mx-auto mb-1" />
            ) : (
              <p className="text-2xl font-bold text-green-500">{evaluatedTeams}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'تم تقييمه' : 'Evaluated'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mx-auto mb-1" />
            ) : (
              <p className="text-2xl font-bold text-yellow-500">{remainingTeams}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'متبقي' : 'Remaining'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Trophy className="w-6 h-6 text-purple-500" />
              </div>
              <CardTitle className="text-lg">
                {language === 'ar' ? 'تقييم الفرق' : 'Score Teams'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              {language === 'ar' ? 'تقييم أداء الفرق في المسابقة وإدخال الدرجات' : 'Evaluate team performance and enter scores'}
            </CardDescription>
            <Link to="/judge/scoring">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180" />
                {language === 'ar' ? 'دخول' : 'Enter'}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-muted">
                <ClipboardList className="w-6 h-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">
                {language === 'ar' ? 'معايير التقييم' : 'Scoring Criteria'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              {language === 'ar' ? 'المعايير المستخدمة في التقييم' : 'Criteria used for evaluation'}
            </CardDescription>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                {language === 'ar' ? 'الابتكار (30 نقطة)' : 'Innovation (30 pts)'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {language === 'ar' ? 'التصميم الهندسي والوظيفية (25 نقطة)' : 'Engineering Design & Functionality (25 pts)'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {language === 'ar' ? 'الدفاع (20 نقطة)' : 'Defense (20 pts)'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {language === 'ar' ? 'التحكم والبرمجة (15 نقطة)' : 'Control & Programming (15 pts)'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                {language === 'ar' ? 'العرض وكتاب الهندسة (10 نقاط)' : 'Presentation & Engineering Book (10 pts)'}
              </li>
            </ul>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-medium text-primary">
                {language === 'ar' ? 'المجموع الكلي: 100 نقطة' : 'Total: 100 points'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {language === 'ar' ? 'آخر التقييمات' : 'Recent Evaluations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentEvaluations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {language === 'ar' ? 'لا توجد تقييمات بعد' : 'No evaluations yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {recentEvaluations.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{item.team}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-bold">{item.score}/100</span>
                    <span className="text-sm text-muted-foreground">
                      {language === 'ar' ? `منذ ${item.time}` : `${item.time} ago`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JudgeDashboardPage;