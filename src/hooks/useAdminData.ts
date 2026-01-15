import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types
import { Profile } from '@/types/database';
export interface TeamWithMembers {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  logo_url: string | null;
  leader_id: string | null;
  max_members: number;
  status: string | null;
  preparation_status: string | null;
  created_at: string;
  updated_at: string;
  members: TeamMemberProfile[];
  leader?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface TeamMemberProfile {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  joined_at: string;
  profile?: Profile;
}

export interface AdminStats {
  totalTeams: number;
  totalMembers: number;
  totalWorkshops: number;
  pendingRequests: number;
}

// Hook for fetching admin statistics
export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalTeams: 0,
    totalMembers: 0,
    totalWorkshops: 0,
    pendingRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch teams count
        const { count: teamsCount } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true });

        // Fetch members count
        const { count: membersCount } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true });

        // Fetch workshops count
        const { count: workshopsCount } = await supabase
          .from('workshops')
          .select('*', { count: 'exact', head: true });

        // Fetch pending join requests
        const { count: pendingCount } = await supabase
          .from('join_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setStats({
          totalTeams: teamsCount || 0,
          totalMembers: membersCount || 0,
          totalWorkshops: workshopsCount || 0,
          pendingRequests: pendingCount || 0,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading };
};

// Hook for fetching all teams with members
export const useTeams = () => {
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (teamsError) throw teamsError;

      // Fetch all team members
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('*');

      if (membersError) throw membersError;

      // Fetch all profiles for members
      const memberUserIds = (membersData || []).map(m => m.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', memberUserIds);

      // Fetch leader profiles
      const leaderIds = (teamsData || []).map(t => t.leader_id).filter(Boolean) as string[];
      const { data: leadersData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', leaderIds);

      // Combine data
      const teamsWithMembers: TeamWithMembers[] = (teamsData || []).map(team => {
        const teamMembers: TeamMemberProfile[] = (membersData || [])
          .filter(m => m.team_id === team.id)
          .map(m => {
            const profile = (profilesData || []).find(p => p.user_id === m.user_id);
            return {
              id: m.id,
              user_id: m.user_id,
              team_id: m.team_id,
              role: (m as any).team_role || (m as any).role || 'member',
              joined_at: m.joined_at,
              profile: profile ? profile as Profile : undefined,
            };
          });

        const leader = (leadersData || []).find(l => l.user_id === team.leader_id);

        return {
          id: team.id,
          name: team.name,
          name_ar: team.name_ar,
          description: team.description,
          logo_url: team.logo_url,
          leader_id: team.leader_id,
          max_members: team.max_members || 5,
          status: team.status,
          preparation_status: team.preparation_status,
          created_at: team.created_at,
          updated_at: team.updated_at,
          members: teamMembers,
          leader: leader ? {
            id: leader.user_id,
            full_name: leader.full_name,
            email: leader.email,
          } : undefined,
        };
      });

      setTeams(teamsWithMembers);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const deleteTeam = async (teamId: string) => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;
    await fetchTeams();
  };

  return { teams, isLoading, refetch: fetchTeams, deleteTeam };
};

// Hook for attendance management
export const useAttendanceAdmin = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);

      // Fetch only approved and final_approved teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, name_ar, status')
        .in('status', ['approved', 'final_approved']);

      if (teamsError) throw teamsError;

      const approvedTeamIds = (teamsData || []).map(t => t.id);

      if (approvedTeamIds.length === 0) {
        setAttendance([]);
        setIsLoading(false);
        return;
      }

      // Fetch team members for approved teams
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('id, team_id, user_id, team_role')
        .in('team_id', approvedTeamIds);

      if (membersError) throw membersError;

      // Fetch profiles for all members
      const memberUserIds = [...new Set((membersData || []).map(m => m.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', memberUserIds);

      // Fetch attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .in('team_id', approvedTeamIds)
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;

      // Build enriched attendance with member details
      const enrichedAttendance = (attendanceData || []).map(a => ({
        ...a,
        team: (teamsData || []).find(t => t.id === a.team_id),
        user: (profilesData || []).find(p => p.user_id === a.user_id),
      }));

      setAttendance(enrichedAttendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAttendanceStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('attendance')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    await fetchAttendance();
  };

  const markAttendance = async (teamId: string, userId: string | null, date: string, status: string) => {
    // Check if record exists
    let query = supabase
      .from('attendance')
      .select('id')
      .eq('team_id', teamId)
      .eq('date', date);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: existing } = await query.maybeSingle();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('attendance')
        .update({ status })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from('attendance')
        .insert({
          team_id: teamId,
          user_id: userId,
          date,
          status,
        });
      if (error) throw error;
    }

    await fetchAttendance();
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return {
    attendance,
    isLoading,
    refetch: fetchAttendance,
    updateAttendanceStatus,
    markAttendance
  };
};

// Hook for workshops management
export const useWorkshopsAdmin = () => {
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkshops = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setWorkshops(data || []);
    } catch (error) {
      console.error('Error fetching workshops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addWorkshop = async (workshop: any) => {
    const { error } = await supabase
      .from('workshops')
      .insert(workshop);

    if (error) throw error;
    await fetchWorkshops();
  };

  const updateWorkshop = async (id: string, updates: any) => {
    const { error } = await supabase
      .from('workshops')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchWorkshops();
  };

  const deleteWorkshop = async (id: string) => {
    const { error } = await supabase
      .from('workshops')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchWorkshops();
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  return {
    workshops,
    isLoading,
    refetch: fetchWorkshops,
    addWorkshop,
    updateWorkshop,
    deleteWorkshop
  };
};
