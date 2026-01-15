import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useScores, ScoreCriteria } from '@/hooks/useScores';
import { useTeams } from '@/hooks/useTeams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Trophy, Star, Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface ScoringCriteria {
  innovation: number;
  engineering: number;
  defense: number;
  control: number;
  presentation: number;
}

const JudgeScoringPage = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { teams, loading: teamsLoading } = useTeams();
  const { scores, loading: scoresLoading, upsertScore } = useScores();

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [currentScores, setCurrentScores] = useState<ScoringCriteria>({
    innovation: 21,
    engineering: 18,
    defense: 14,
    control: 11,
    presentation: 7
  });
  const [comments, setComments] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Get accepted teams for scoring (both initial and final approval)
  const acceptedTeams = teams.filter(t => ['approved', 'final_approved'].includes(t.status));

  // Get teams with their existing scores from this judge
  const teamsWithScores = acceptedTeams.map(team => {
    const existingScore = scores.find(s => s.team_id === team.id && s.judge_id === user?.id);
    return {
      ...team,
      existingScore,
    };
  });

  // Load existing score when team is selected
  useEffect(() => {
    if (selectedTeam) {
      const teamData = teamsWithScores.find(t => t.id === selectedTeam);
      if (teamData?.existingScore) {
        const criteria = teamData.existingScore.criteria;
        setCurrentScores({
          innovation: criteria.innovation || 21,
          engineering: criteria.engineering || 18,
          defense: criteria.defense || 14,
          control: criteria.control || 11,
          presentation: criteria.presentation || 7,
        });
        setComments(teamData.existingScore.comments || '');
      } else {
        // Reset to default for new evaluations
        setCurrentScores({
          innovation: 21,
          engineering: 18,
          defense: 14,
          control: 11,
          presentation: 7
        });
        setComments('');
      }
    }
  }, [selectedTeam, scores]);

  const scoringCriteria = [
    {
      key: 'innovation',
      label: language === 'ar' ? 'الابتكار' : 'Innovation',
      description: language === 'ar' ? 'تفرد الآلية/الاستراتيجية/التصميم' : 'Unique mechanism/strategy/design',
      maxPoints: 30,
      color: 'text-purple-500'
    },
    {
      key: 'engineering',
      label: language === 'ar' ? 'التصميم الهندسي والوظيفية' : 'Engineering Design & Functionality',
      description: language === 'ar' ? 'فعالية الآلية + الموثوقية + قابلية التطبيق' : 'Mechanism effectiveness + reliability + applicability',
      maxPoints: 25,
      color: 'text-blue-500'
    },
    {
      key: 'defense',
      label: language === 'ar' ? 'الدفاع' : 'Defense',
      description: language === 'ar' ? 'بناء قوي وثابت + حماية الإلكترونيات والحساسات + تصميم مرتب' : 'Strong stable build + electronics protection + neat design',
      maxPoints: 20,
      color: 'text-red-500'
    },
    {
      key: 'control',
      label: language === 'ar' ? 'التحكم والبرمجة' : 'Control & Programming',
      description: language === 'ar' ? 'سلاسة القيادة والاستجابة + تنظيم الإلكترونيات + قابلية قراءة الكود' : 'Smooth control + electronics organization + code readability',
      maxPoints: 15,
      color: 'text-green-500'
    },
    {
      key: 'presentation',
      label: language === 'ar' ? 'العرض وكتاب الهندسة' : 'Presentation & Engineering Book',
      description: language === 'ar' ? 'شرح الفريق + الإجابة على الأسئلة + توثيق واضح ونظيف' : 'Team explanation + Q&A + clear documentation',
      maxPoints: 10,
      color: 'text-yellow-500'
    }
  ];

  const calculateTotal = () => {
    return currentScores.innovation + currentScores.engineering + currentScores.defense + currentScores.control + currentScores.presentation;
  };

  const handleSaveEvaluation = async () => {
    if (!selectedTeam || !user?.id) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
      return;
    }

    setIsSaving(true);
    const result = await upsertScore(selectedTeam, currentScores, comments);
    setIsSaving(false);

    if (result.success) {
      toast.success(language === 'ar' ? 'تم حفظ التقييم بنجاح' : 'Evaluation saved successfully');
    } else {
      toast.error(result.error || (language === 'ar' ? 'حدث خطأ في حفظ التقييم' : 'Error saving evaluation'));
    }
  };

  const isLoading = teamsLoading || scoresLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Judge Mode Label + Back Button */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg">
          <Scale className="w-5 h-5 text-purple-500" />
          <span className="text-purple-500 font-semibold">
            {language === 'ar' ? 'وضع التحكيم' : 'Judge Mode'}
          </span>
        </div>
        <Link to="/judge">
          <Button variant="outline">
            <ArrowRight className="w-4 h-4 me-2 rtl:rotate-180" />
            {language === 'ar' ? 'العودة للتحكيم' : 'Back to Judge'}
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-primary">
          {language === 'ar' ? 'تقييم الفرق' : 'Team Scoring'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'اختر فريقاً وقم بتقييمه وفق المعايير المحددة' : 'Select a team and evaluate them according to the criteria'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {language === 'ar' ? 'الفرق' : 'Teams'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {teamsWithScores.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {language === 'ar' ? 'لا توجد فرق للتقييم' : 'No teams to evaluate'}
              </p>
            ) : (
              teamsWithScores.map(team => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`w-full p-3 rounded-lg text-start transition-all ${selectedTeam === team.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{team.name}</span>
                    {team.existingScore ? (
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                        <Check className="w-3 h-3 me-1" />
                        {team.existingScore.total_score}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {language === 'ar' ? 'جديد' : 'New'}
                      </Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Scoring Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              {language === 'ar' ? 'نموذج التقييم' : 'Scoring Form'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTeam ? (
              <div className="space-y-6">
                {/* Selected Team */}
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'ar' ? 'الفريق المختار:' : 'Selected Team:'}
                  </p>
                  <p className="font-bold text-lg">
                    {teamsWithScores.find(t => t.id === selectedTeam)?.name}
                  </p>
                </div>

                {/* Scoring Sliders */}
                {scoringCriteria.map(criteria => (
                  <div key={criteria.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={`font-medium ${criteria.color}`}>
                        {criteria.label} ({criteria.maxPoints} {language === 'ar' ? 'نقطة' : 'pts'})
                      </label>
                      <span className="text-lg font-bold">
                        {currentScores[criteria.key as keyof ScoringCriteria]}/{criteria.maxPoints}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{criteria.description}</p>
                    <Slider
                      value={[currentScores[criteria.key as keyof ScoringCriteria]]}
                      onValueChange={value => setCurrentScores(prev => ({
                        ...prev,
                        [criteria.key]: value[0]
                      }))}
                      max={criteria.maxPoints}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}

                {/* Comments */}
                <div className="space-y-2">
                  <label className="font-medium">
                    {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Comments'}
                  </label>
                  <Textarea
                    placeholder={language === 'ar' ? 'أضف ملاحظاتك هنا...' : 'Add your comments here...'}
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>

                {/* Total Score */}
                <div className="p-4 bg-gradient-to-r from-purple-500/20 to-primary/20 rounded-lg flex items-center justify-between">
                  <span className="font-bold text-lg">
                    {language === 'ar' ? 'المجموع الكلي' : 'Total Score'}
                  </span>
                  <span className="text-3xl font-bold text-primary">{calculateTotal()}/100</span>
                </div>

                {/* Submit Button */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleSaveEvaluation}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin me-2" />
                  ) : (
                    <Check className="w-4 h-4 me-2" />
                  )}
                  {language === 'ar' ? 'حفظ التقييم' : 'Save Evaluation'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{language === 'ar' ? 'اختر فريقاً للبدء بالتقييم' : 'Select a team to start evaluating'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JudgeScoringPage;