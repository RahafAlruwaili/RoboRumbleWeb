// Database types for Supabase tables
export interface Team {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  logo_url: string | null;
  leader_id: string | null;
  max_members: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  preparation_status: 'not_started' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  team_role: string;
  joined_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  university_id: string | null;
  university: string | null;
  cv_link: string | null;
  experience_level: string | null;
  technical_skills: string[] | null;
  personal_skills: string[] | null;
  can_commit: boolean | null;
  goals: string | null;
  robotics_experience: string | null;
  has_programmed_robot: string | null;
  autonomous_logic_exp: string | null;
  circuit_reading_exp: string | null;
  mechanical_work_exp: string | null;
  manual_control_exp: string | null;
  competitive_activities: string | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface JoinRequest {
  id: string;
  team_id: string;
  user_id: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  team_id: string;
  judge_id: string;
  criteria: {
    innovation?: number;
    engineering?: number;
    defense?: number;
    control?: number;
    presentation?: number;
  };
  total_score: number;
  comments: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'judge' | 'participant';
  created_at: string;
}

// Extended types with relations
export interface TeamWithMembers extends Team {
  membersCount: number;
  leaderName: string | null;
  members?: TeamMemberWithProfile[];
}

export interface TeamMemberWithProfile extends TeamMember {
  profile?: Profile;
}

export interface JoinRequestWithDetails extends JoinRequest {
  team?: Team;
  profile?: Profile;
}

// Map database status to UI status
export type AcceptanceStatusUI = 'under_review' | 'first_accepted' | 'final_accepted' | 'rejected';

export const mapStatusToUI = (status: Team['status']): AcceptanceStatusUI => {
  switch (status) {
    case 'pending':
      return 'under_review';
    case 'accepted':
      return 'final_accepted';
    case 'rejected':
      return 'rejected';
    default:
      return 'under_review';
  }
};
