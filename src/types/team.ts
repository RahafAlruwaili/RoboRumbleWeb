// Team Acceptance Status - visible to users
export type AcceptanceStatus = 'under_review' | 'first_accepted' | 'final_accepted' | 'rejected';

// Team Completion Status - internal use only
export type CompletionStatus = 'incomplete' | 'complete';

export interface TeamBase {
  id: string;
  name: string;
  nameEn: string;
  leaderName: string;
  membersCount: number;
  roles: string[];
  missingRoles?: string[];
  acceptanceStatus: AcceptanceStatus;
}

// Helper functions for acceptance status
export const getAcceptanceStatusConfig = (status: AcceptanceStatus, language: 'ar' | 'en') => {
  const config: Record<AcceptanceStatus, { label: string; color: string; bgColor: string; className: string }> = {
    under_review: {
      label: language === 'ar' ? 'قيد المراجعة' : 'Under Review',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20 border-yellow-500/30',
      className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    },
    first_accepted: {
      label: language === 'ar' ? 'مقبول مبدئيًا' : 'First Accepted',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-500/30',
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    },
    final_accepted: {
      label: language === 'ar' ? 'مقبول نهائيًا' : 'Final Accepted',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20 border-green-500/30',
      className: 'bg-green-500/20 text-green-400 border-green-500/50',
    },
    rejected: {
      label: language === 'ar' ? 'غير مقبول' : 'Rejected',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20 border-red-500/30',
      className: 'bg-red-500/20 text-red-400 border-red-500/50',
    },
  };
  return config[status];
};

// Feature access rules based on acceptance status
export const canAccessWorkshops = (status: AcceptanceStatus): boolean => {
  return status === 'first_accepted' || status === 'final_accepted';
};

export const canAccessPreparation = (status: AcceptanceStatus): boolean => {
  return status === 'final_accepted';
};

export const canParticipateInLeaderboard = (status: AcceptanceStatus): boolean => {
  return status === 'final_accepted';
};

// Check if team is complete (internal use for enabling registration)
// New rules: 4 core roles required (driver, electronics, programmer, mechanics_designer)
// Team size: 4-5 members
export const isTeamComplete = (membersCount: number, filledRoles: string[]): boolean => {
  const requiredRoles = ['driver', 'programmer', 'electronics', 'mechanics_designer'];
  const hasAllRoles = requiredRoles.every(role => filledRoles.includes(role));
  const hasValidSize = membersCount >= 4 && membersCount <= 5;
  return hasAllRoles && hasValidSize;
};
