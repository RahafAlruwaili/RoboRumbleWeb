/**
 * Team Roles Validation Logic
 * 
 * Rules:
 * 1. Team consists of 4 core members, must be complete before allowing a 5th member
 * 2. Core roles (no duplicates): driver, electronics, programmer
 * 3. The 4th core role must be from mechanics_designer category
 * 4. 5th member (optional) can only be from mechanics_designer category
 * 5. Maximum of 2 mechanics_designer roles in a team
 * 6. No duplicates for driver, electronics, programmer within same team
 */

// Available roles
export const TEAM_ROLES = {
  DRIVER: 'driver',
  ELECTRONICS: 'electronics', 
  PROGRAMMER: 'programmer',
  MECHANICS_DESIGNER: 'mechanics_designer',
} as const;

export type TeamRole = typeof TEAM_ROLES[keyof typeof TEAM_ROLES];

// Core unique roles (cannot be duplicated)
export const UNIQUE_ROLES: TeamRole[] = [
  TEAM_ROLES.DRIVER,
  TEAM_ROLES.ELECTRONICS,
  TEAM_ROLES.PROGRAMMER,
];

// Category that can have up to 2 members
export const MULTI_SLOT_ROLE = TEAM_ROLES.MECHANICS_DESIGNER;
export const MAX_MECHANICS_DESIGNER = 2;

// Team size constraints
export const MIN_TEAM_SIZE = 4;
export const MAX_TEAM_SIZE = 5;

// Role display names
export const getRoleDisplayName = (role: TeamRole | string, language: 'ar' | 'en'): string => {
  const names: Record<string, { ar: string; en: string }> = {
    driver: { ar: 'التحكم والقيادة', en: 'Driver' },
    electronics: { ar: 'الإلكترونيات', en: 'Electronics' },
    programmer: { ar: 'المبرمج', en: 'Programmer' },
    mechanics_designer: { ar: 'التجميع والتركيب / التصميم الهندسي', en: 'Mechanics / Designer' },
  };
  return language === 'ar' ? names[role]?.ar || role : names[role]?.en || role;
};

// Role icons mapping
export const getRoleIcon = (role: TeamRole | string) => {
  switch (role) {
    case TEAM_ROLES.DRIVER: return 'Gamepad2';
    case TEAM_ROLES.ELECTRONICS: return 'Cpu';
    case TEAM_ROLES.PROGRAMMER: return 'Code';
    case TEAM_ROLES.MECHANICS_DESIGNER: return 'Wrench';
    default: return 'Users';
  }
};

// Role colors mapping
export const getRoleColor = (role: TeamRole | string): string => {
  switch (role) {
    case TEAM_ROLES.DRIVER: return 'from-red-500 to-orange-500';
    case TEAM_ROLES.ELECTRONICS: return 'from-green-500 to-emerald-500';
    case TEAM_ROLES.PROGRAMMER: return 'from-blue-500 to-cyan-500';
    case TEAM_ROLES.MECHANICS_DESIGNER: return 'from-purple-500 to-pink-500';
    default: return 'from-gray-500 to-gray-600';
  }
};

// All required roles for a complete team
export const REQUIRED_ROLES: TeamRole[] = [
  TEAM_ROLES.DRIVER,
  TEAM_ROLES.ELECTRONICS,
  TEAM_ROLES.PROGRAMMER,
  TEAM_ROLES.MECHANICS_DESIGNER,
];

// Role descriptions
export const getRoleDescription = (role: TeamRole, language: 'ar' | 'en'): string => {
  const descriptions: Record<TeamRole, { ar: string; en: string }> = {
    driver: { 
      ar: 'التحكم بالروبوت أثناء المنافسات', 
      en: 'Control the robot during competitions' 
    },
    electronics: { 
      ar: 'تصميم وتوصيل الدوائر الكهربائية', 
      en: 'Design and wire electronic circuits' 
    },
    programmer: { 
      ar: 'برمجة نظام التحكم والأردوينو', 
      en: 'Program the control system and Arduino' 
    },
    mechanics_designer: { 
      ar: 'تجميع وتصميم الهيكل الميكانيكي', 
      en: 'Assemble and design the mechanical structure' 
    },
  };
  return language === 'ar' ? descriptions[role]?.ar : descriptions[role]?.en;
};

export interface TeamMemberRole {
  user_id: string;
  team_role: string | null;
}

export interface RoleValidationResult {
  isValid: boolean;
  error?: string;
  errorAr?: string;
}

/**
 * Check if a role can be added to the team
 */
export const canAddRole = (
  existingMembers: TeamMemberRole[],
  newRole: TeamRole
): RoleValidationResult => {
  const filledRoles = existingMembers.map(m => m.team_role).filter(Boolean) as TeamRole[];
  const currentSize = existingMembers.length;

  // Check team size limit
  if (currentSize >= MAX_TEAM_SIZE) {
    return {
      isValid: false,
      error: 'Team is already at maximum capacity (5 members)',
      errorAr: 'الفريق وصل للحد الأقصى (5 أعضاء)',
    };
  }

  // Check if unique role is already taken
  if (UNIQUE_ROLES.includes(newRole) && filledRoles.includes(newRole)) {
    return {
      isValid: false,
      error: `Role ${newRole} is already taken in this team`,
      errorAr: `الدور ${getRoleDisplayName(newRole, 'ar')} محجوز بالفعل في الفريق`,
    };
  }

  // Check mechanics_designer limit
  if (newRole === MULTI_SLOT_ROLE) {
    const mechanicsCount = filledRoles.filter(r => r === MULTI_SLOT_ROLE).length;
    if (mechanicsCount >= MAX_MECHANICS_DESIGNER) {
      return {
        isValid: false,
        error: 'Maximum of 2 mechanics/designer roles allowed',
        errorAr: 'الحد الأقصى لدور التجميع/التصميم هو 2',
      };
    }
  }

  // Check if trying to add 5th member before core team is complete
  if (currentSize >= MIN_TEAM_SIZE) {
    const hasAllUniqueRoles = UNIQUE_ROLES.every(role => filledRoles.includes(role));
    const hasMechanicsDesigner = filledRoles.includes(MULTI_SLOT_ROLE);
    
    if (!hasAllUniqueRoles || !hasMechanicsDesigner) {
      return {
        isValid: false,
        error: 'Core team (4 members) must be complete before adding a 5th member',
        errorAr: 'يجب اكتمال الفريق الأساسي (4 أعضاء) قبل إضافة العضو الخامس',
      };
    }

    // 5th member can only be mechanics_designer
    if (newRole !== MULTI_SLOT_ROLE) {
      return {
        isValid: false,
        error: 'The 5th member can only be in the mechanics/designer role',
        errorAr: 'العضو الخامس يمكن أن يكون فقط من فئة التجميع/التصميم',
      };
    }
  }

  return { isValid: true };
};

/**
 * Get available roles for a team based on current members
 */
export const getAvailableRoles = (existingMembers: TeamMemberRole[]): TeamRole[] => {
  const availableRoles: TeamRole[] = [];
  const allRoles: TeamRole[] = [
    TEAM_ROLES.DRIVER,
    TEAM_ROLES.ELECTRONICS,
    TEAM_ROLES.PROGRAMMER,
    TEAM_ROLES.MECHANICS_DESIGNER,
  ];

  for (const role of allRoles) {
    const result = canAddRole(existingMembers, role);
    if (result.isValid) {
      availableRoles.push(role);
    }
  }

  return availableRoles;
};

/**
 * Check if team is complete (has all core roles)
 */
export const isTeamCoreComplete = (existingMembers: TeamMemberRole[]): boolean => {
  const filledRoles = existingMembers.map(m => m.team_role).filter(Boolean) as TeamRole[];
  
  const hasAllUniqueRoles = UNIQUE_ROLES.every(role => filledRoles.includes(role));
  const hasMechanicsDesigner = filledRoles.includes(MULTI_SLOT_ROLE);
  
  return hasAllUniqueRoles && hasMechanicsDesigner && existingMembers.length >= MIN_TEAM_SIZE;
};

/**
 * Get missing roles for team completion
 */
export const getMissingRoles = (existingMembers: TeamMemberRole[]): TeamRole[] => {
  const filledRoles = existingMembers.map(m => m.team_role).filter(Boolean) as TeamRole[];
  const missingRoles: TeamRole[] = [];

  // Check unique roles
  for (const role of UNIQUE_ROLES) {
    if (!filledRoles.includes(role)) {
      missingRoles.push(role);
    }
  }

  // Check if at least one mechanics_designer
  if (!filledRoles.includes(MULTI_SLOT_ROLE)) {
    missingRoles.push(MULTI_SLOT_ROLE);
  }

  return missingRoles;
};

/**
 * Check if team can accept new members
 */
export const canAcceptNewMembers = (existingMembers: TeamMemberRole[]): boolean => {
  const currentSize = existingMembers.length;
  
  if (currentSize >= MAX_TEAM_SIZE) {
    return false;
  }

  // If team is not core complete yet, can accept any valid role
  if (currentSize < MIN_TEAM_SIZE) {
    return true;
  }

  // If core is complete, can only accept 5th member with mechanics_designer
  const filledRoles = existingMembers.map(m => m.team_role).filter(Boolean) as TeamRole[];
  const mechanicsCount = filledRoles.filter(r => r === MULTI_SLOT_ROLE).length;
  
  return mechanicsCount < MAX_MECHANICS_DESIGNER;
};

/**
 * Validate role for team creation (first member/leader)
 */
export const validateLeaderRole = (role: TeamRole): RoleValidationResult => {
  const validRoles: TeamRole[] = [
    TEAM_ROLES.DRIVER,
    TEAM_ROLES.ELECTRONICS,
    TEAM_ROLES.PROGRAMMER,
    TEAM_ROLES.MECHANICS_DESIGNER,
  ];

  if (!validRoles.includes(role)) {
    return {
      isValid: false,
      error: 'Invalid role selected',
      errorAr: 'الدور المختار غير صالح',
    };
  }

  return { isValid: true };
};
