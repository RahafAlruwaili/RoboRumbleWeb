import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  canAddRole, 
  validateLeaderRole, 
  TeamRole,
  TEAM_ROLES,
} from '@/lib/teamRolesValidation';

export interface TeamData {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  logo_url: string | null;
  leader_id: string | null;
  max_members: number;
  status: 'pending' | 'accepted' | 'rejected';
  preparation_status: string;
  created_at: string;
  membersCount: number;
  leaderName: string | null;
  isOpen: boolean;
  members: {
    user_id: string;
    team_role: string;
    profile?: {
      full_name: string | null;
      email: string;
    };
  }[];
}

export function useTeams() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (teamsError) throw teamsError;

      // Fetch all team members
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('team_id, user_id, team_role');

      if (membersError) throw membersError;

      // Fetch profiles for all members and leaders
      const allUserIds = [
        ...new Set([
          ...(membersData?.map(m => m.user_id) || []),
          ...(teamsData?.map(t => t.leader_id).filter(Boolean) || [])
        ])
      ];
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', allUserIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));

      // Build teams with details
      const teamsWithDetails: TeamData[] = (teamsData || []).map(team => {
        const teamMembers = (membersData || []).filter(m => m.team_id === team.id);
        const leader = profilesMap.get(team.leader_id);

        return {
          ...team,
          max_members: team.max_members || 5,
          status: (team.status || 'pending') as 'pending' | 'accepted' | 'rejected',
          preparation_status: team.preparation_status || 'not_started',
          membersCount: teamMembers.length,
          leaderName: leader?.full_name || leader?.email || null,
          isOpen: teamMembers.length < (team.max_members || 5),
          members: teamMembers.map(m => ({
            user_id: m.user_id,
            team_role: m.team_role || 'member',
            profile: profilesMap.get(m.user_id),
          })),
        };
      });

      setTeams(teamsWithDetails);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return { teams, loading, error, refetch: fetchTeams };
}

export function useTeamById(teamId: string | undefined) {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    const fetchTeam = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch team
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .single();

        if (teamError) throw teamError;

        // Fetch team members
        const { data: membersData, error: membersError } = await supabase
          .from('team_members')
          .select('user_id, team_role')
          .eq('team_id', teamId);

        if (membersError) throw membersError;

        // Fetch member profiles
        const userIds = membersData?.map(m => m.user_id) || [];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));

        // Fetch leader profile
        let leaderName = null;
        if (teamData.leader_id) {
          const { data: leaderData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', teamData.leader_id)
            .single();
          leaderName = leaderData?.full_name || leaderData?.email || null;
        }

        const teamWithDetails: TeamData = {
          ...teamData,
          max_members: teamData.max_members || 5,
          status: (teamData.status || 'pending') as 'pending' | 'accepted' | 'rejected',
          preparation_status: teamData.preparation_status || 'not_started',
          membersCount: membersData?.length || 0,
          leaderName,
          isOpen: (membersData?.length || 0) < (teamData.max_members || 5),
          members: (membersData || []).map(m => ({
            user_id: m.user_id,
            team_role: m.team_role || 'member',
            profile: profilesMap.get(m.user_id),
          })),
        };

        setTeam(teamWithDetails);
      } catch (err: any) {
        console.error('Error fetching team:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  return { team, loading, error };
}

export function useCreateTeam() {
  const { user, setUserTeam } = useAuth();
  const [loading, setLoading] = useState(false);

  const createTeam = async (name: string, role: string): Promise<{ success: boolean; teamId?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Validate the leader's role
    const roleValidation = validateLeaderRole(role as TeamRole);
    if (!roleValidation.isValid) {
      return { success: false, error: roleValidation.error };
    }

    setLoading(true);

    try {
      // Create team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name,
          leader_id: user.id,
          status: 'pending',
          preparation_status: 'not_started',
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as first member (leader)
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: user.id,
          team_role: role,
        });

      if (memberError) throw memberError;

      // Update auth context
      setUserTeam(teamData.id);

      return { success: true, teamId: teamData.id };
    } catch (err: any) {
      console.error('Error creating team:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { createTeam, loading };
}

export function useJoinRequest() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const sendJoinRequest = async (teamId: string, role: string, message?: string): Promise<{ success: boolean; error?: string; errorAr?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated', errorAr: 'المستخدم غير مسجل' };
    }

    setLoading(true);

    try {
      // Check if user already has any request for this team (pending, accepted, or rejected)
      const { data: existingRequest } = await supabase
        .from('join_requests')
        .select('id, status')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          return { success: false, error: 'You already have a pending request', errorAr: 'لديك طلب معلق بالفعل لهذا الفريق' };
        }
        if (existingRequest.status === 'rejected') {
          return { success: false, error: 'Your request was rejected by the team leader', errorAr: 'تم رفض طلبك من قبل قائد الفريق' };
        }
        if (existingRequest.status === 'accepted') {
          return { success: false, error: 'Your request was already accepted', errorAr: 'تم قبول طلبك بالفعل' };
        }
      }

      // Check if user is already a member of any team
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        return { success: false, error: 'You are already a member of a team', errorAr: 'أنت عضو بالفعل في فريق' };
      }

      // Fetch current team members to validate role
      const { data: currentMembers, error: membersError } = await supabase
        .from('team_members')
        .select('user_id, team_role')
        .eq('team_id', teamId);

      if (membersError) throw membersError;

      // Validate if the role can be added
      const roleValidation = canAddRole(currentMembers || [], role as TeamRole);
      if (!roleValidation.isValid) {
        return { 
          success: false, 
          error: roleValidation.error, 
          errorAr: roleValidation.errorAr 
        };
      }

      // Create join request with role stored in message
      const { error: requestError } = await supabase
        .from('join_requests')
        .insert({
          team_id: teamId,
          user_id: user.id,
          message: `Role: ${role}`,
          status: 'pending',
        });

      if (requestError) throw requestError;

      return { success: true };
    } catch (err: any) {
      console.error('Error sending join request:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { sendJoinRequest, loading };
}
