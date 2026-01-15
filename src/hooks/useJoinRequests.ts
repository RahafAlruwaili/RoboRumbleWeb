import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { canAddRole, TeamRole } from '@/lib/teamRolesValidation';

export interface JoinRequestData {
  id: string;
  team_id: string;
  user_id: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  userName: string;
  userEmail: string;
  requestedRole: string;
}

export function useJoinRequests(teamId?: string) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<JoinRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderTeamId, setLeaderTeamId] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let targetTeamId = teamId;

      // If no teamId provided, find the team where user is leader
      if (!targetTeamId) {
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('id')
          .eq('leader_id', user.id)
          .maybeSingle();

        if (teamError) throw teamError;

        if (!teamData) {
          // User is not a leader of any team
          setRequests([]);
          setLoading(false);
          return;
        }

        targetTeamId = teamData.id;
        setLeaderTeamId(teamData.id);
      }

      // Fetch requests for the team
      const { data: requestsData, error: requestsError } = await supabase
        .from('join_requests')
        .select('*')
        .eq('team_id', targetTeamId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch user profiles for requests
      const userIds = [...new Set(requestsData?.map(r => r.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));

      // Map requests with profile data
      const requestsWithDetails: JoinRequestData[] = (requestsData || []).map(request => {
        const profile = profilesMap.get(request.user_id);
        // Extract role from message if present (format: "Role: roleName")
        const roleMatch = request.message?.match(/Role:\s*(\w+)/);
        // Default to mechanics_designer as it's a valid role (member is not)
        const role = roleMatch ? roleMatch[1] : 'mechanics_designer';

        return {
          id: request.id,
          team_id: request.team_id,
          user_id: request.user_id,
          message: request.message,
          status: request.status as 'pending' | 'approved' | 'rejected',
          created_at: request.created_at,
          userName: profile?.full_name || profile?.email?.split('@')[0] || 'مستخدم',
          userEmail: profile?.email || '',
          requestedRole: role,
        };
      });

      setRequests(requestsWithDetails);
    } catch (err: any) {
      console.error('Error fetching join requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user, teamId]);

  const acceptRequest = async (requestId: string): Promise<{ success: boolean; error?: string; errorAr?: string }> => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        return { success: false, error: 'Request not found', errorAr: 'الطلب غير موجود' };
      }

      // Fetch current team members to validate role before accepting
      const { data: currentMembers, error: membersError } = await supabase
        .from('team_members')
        .select('user_id, team_role')
        .eq('team_id', request.team_id);

      if (membersError) throw membersError;

      // Validate if the role can still be added
      const roleValidation = canAddRole(currentMembers || [], request.requestedRole as TeamRole);
      if (!roleValidation.isValid) {
        return {
          success: false,
          error: roleValidation.error,
          errorAr: roleValidation.errorAr
        };
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Add user to team_members with the validated role
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: request.team_id,
          user_id: request.user_id,
          team_role: request.requestedRole,
        });

      if (memberError) throw memberError;

      // Refresh requests
      await fetchRequests();
      return { success: true };
    } catch (err: any) {
      console.error('Error accepting request:', err);
      return { success: false, error: err.message };
    }
  };

  const rejectRequest = async (requestId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Refresh requests
      await fetchRequests();
      return { success: true };
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    acceptRequest,
    rejectRequest,
    leaderTeamId,
  };
}
