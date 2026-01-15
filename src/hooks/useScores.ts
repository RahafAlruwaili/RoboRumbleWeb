import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ScoreCriteria {
  innovation: number;
  engineering: number;
  defense: number;
  control: number;
  presentation: number;
}

export interface ScoreData {
  id: string;
  team_id: string;
  judge_id: string;
  criteria: ScoreCriteria;
  total_score: number;
  comments: string | null;
  created_at: string;
  updated_at: string;
  teamName?: string;
  judgeName?: string;
}

export interface LeaderboardTeam {
  id: string;
  name: string;
  nameEn: string;
  totalScore: number;
  scoresCount: number;
  averageScore: number;
  dailyScores?: number[];
}

export function useScores() {
  const { user } = useAuth();
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: scoresData, error: scoresError } = await supabase
        .from('scores')
        .select('*')
        .order('created_at', { ascending: false });

      if (scoresError) throw scoresError;

      // Fetch team names
      const teamIds = [...new Set(scoresData?.map(s => s.team_id) || [])];
      const { data: teamsData } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', teamIds);

      const teamsMap = new Map(teamsData?.map(t => [t.id, t.name]));

      // Fetch judge profiles
      const judgeIds = [...new Set(scoresData?.map(s => s.judge_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', judgeIds);

      const judgesMap = new Map(profilesData?.map(p => [p.user_id, p.full_name]));

      const scoresWithDetails: ScoreData[] = (scoresData || []).map(score => {
        const criteriaData = score.criteria as Record<string, number> | null;
        return {
          ...score,
          criteria: {
            innovation: criteriaData?.innovation ?? 0,
            engineering: criteriaData?.engineering ?? 0,
            defense: criteriaData?.defense ?? 0,
            control: criteriaData?.control ?? 0,
            presentation: criteriaData?.presentation ?? 0,
          },
          teamName: teamsMap.get(score.team_id) || 'Unknown Team',
          judgeName: judgesMap.get(score.judge_id) || 'Unknown Judge',
        };
      });

      setScores(scoresWithDetails);
    } catch (err: any) {
      console.error('Error fetching scores:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const upsertScore = async (
    teamId: string,
    criteria: ScoreCriteria,
    comments?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const totalScore = 
        criteria.innovation + 
        criteria.engineering + 
        criteria.defense + 
        criteria.control + 
        criteria.presentation;

      // Note: scores table was just created, types may not be updated yet
      const { error: upsertError } = await (supabase as any)
        .from('scores')
        .upsert(
          {
            team_id: teamId,
            judge_id: user.id,
            criteria: criteria,
            total_score: totalScore,
            comments: comments || null,
          },
          {
            onConflict: 'team_id,judge_id',
          }
        );

      if (upsertError) throw upsertError;

      await fetchScores();
      return { success: true };
    } catch (err: any) {
      console.error('Error upserting score:', err);
      return { success: false, error: err.message };
    }
  };

  return { scores, loading, error, refetch: fetchScores, upsertScore };
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, name, name_ar')
          .eq('status', 'accepted');

        if (teamsError) throw teamsError;

        // Fetch all scores
        const { data: scoresData, error: scoresError } = await supabase
          .from('scores')
          .select('team_id, total_score');

        if (scoresError) throw scoresError;

        // Calculate aggregated scores per team
        const teamScores = new Map<string, { total: number; count: number }>();
        
        (scoresData || []).forEach(score => {
          const existing = teamScores.get(score.team_id) || { total: 0, count: 0 };
          teamScores.set(score.team_id, {
            total: existing.total + score.total_score,
            count: existing.count + 1,
          });
        });

        // Build leaderboard
        const leaderboardData: LeaderboardTeam[] = (teamsData || []).map(team => {
          const scoreInfo = teamScores.get(team.id) || { total: 0, count: 0 };
          return {
            id: team.id,
            name: team.name_ar || team.name,
            nameEn: team.name,
            totalScore: scoreInfo.total,
            scoresCount: scoreInfo.count,
            averageScore: scoreInfo.count > 0 ? Math.round(scoreInfo.total / scoreInfo.count) : 0,
          };
        });

        // Sort by total score descending
        leaderboardData.sort((a, b) => b.totalScore - a.totalScore);

        setLeaderboard(leaderboardData);
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return { leaderboard, loading, error };
}
