import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface AttendanceRecord {
  memberId: string;
  teamId: string;
  day: number;
  present: boolean;
}

interface AttendanceContextType {
  attendanceRecords: AttendanceRecord[];
  getTeamAttendance: (teamId: string) => AttendanceRecord[];
  getMemberAttendanceForDay: (teamId: string, memberId: string, day: number) => boolean | null;
  getTotalAbsencesForMember: (teamId: string, memberId: string) => number;
  updateAttendance: (teamId: string, records: AttendanceRecord[]) => void;
  setMemberAttendance: (teamId: string, memberId: string, day: number, present: boolean) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

interface AttendanceProviderProps {
  children: ReactNode;
}

// Initial mock data for all teams
const initialAttendanceData: AttendanceRecord[] = [
  // Team 1 - Day 1
  { teamId: '1', memberId: '1', day: 1, present: true },
  { teamId: '1', memberId: '2', day: 1, present: true },
  { teamId: '1', memberId: '3', day: 1, present: true },
  { teamId: '1', memberId: '4', day: 1, present: true },
  { teamId: '1', memberId: '5', day: 1, present: true },
  // Team 1 - Day 2
  { teamId: '1', memberId: '1', day: 2, present: true },
  { teamId: '1', memberId: '2', day: 2, present: false },
  { teamId: '1', memberId: '3', day: 2, present: true },
  { teamId: '1', memberId: '4', day: 2, present: true },
  { teamId: '1', memberId: '5', day: 2, present: true },
  // Team 1 - Day 3
  { teamId: '1', memberId: '1', day: 3, present: true },
  { teamId: '1', memberId: '2', day: 3, present: true },
  { teamId: '1', memberId: '3', day: 3, present: true },
  { teamId: '1', memberId: '4', day: 3, present: true },
  { teamId: '1', memberId: '5', day: 3, present: true },
  
  // Team 2 - Day 1
  { teamId: '2', memberId: '1', day: 1, present: true },
  { teamId: '2', memberId: '2', day: 1, present: true },
  { teamId: '2', memberId: '3', day: 1, present: false },
  { teamId: '2', memberId: '4', day: 1, present: true },
  { teamId: '2', memberId: '5', day: 1, present: true },
  // Team 2 - Day 2
  { teamId: '2', memberId: '1', day: 2, present: true },
  { teamId: '2', memberId: '2', day: 2, present: true },
  { teamId: '2', memberId: '3', day: 2, present: true },
  { teamId: '2', memberId: '4', day: 2, present: true },
  { teamId: '2', memberId: '5', day: 2, present: true },
  
  // Team 3 - Day 1
  { teamId: '3', memberId: '1', day: 1, present: true },
  { teamId: '3', memberId: '2', day: 1, present: true },
  { teamId: '3', memberId: '3', day: 1, present: true },
  { teamId: '3', memberId: '4', day: 1, present: true },
  { teamId: '3', memberId: '5', day: 1, present: true },
];

export const AttendanceProvider: React.FC<AttendanceProviderProps> = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceData);

  const getTeamAttendance = (teamId: string): AttendanceRecord[] => {
    return attendanceRecords.filter(r => r.teamId === teamId);
  };

  const getMemberAttendanceForDay = (teamId: string, memberId: string, day: number): boolean | null => {
    const record = attendanceRecords.find(
      r => r.teamId === teamId && r.memberId === memberId && r.day === day
    );
    return record ? record.present : null;
  };

  const getTotalAbsencesForMember = (teamId: string, memberId: string): number => {
    return attendanceRecords.filter(
      r => r.teamId === teamId && r.memberId === memberId && !r.present
    ).length;
  };

  const updateAttendance = (teamId: string, records: AttendanceRecord[]) => {
    setAttendanceRecords(prev => {
      // Remove old records for this team
      const otherTeamRecords = prev.filter(r => r.teamId !== teamId);
      // Add new records
      return [...otherTeamRecords, ...records];
    });
  };

  const setMemberAttendance = (teamId: string, memberId: string, day: number, present: boolean) => {
    setAttendanceRecords(prev => {
      const existingIndex = prev.findIndex(
        r => r.teamId === teamId && r.memberId === memberId && r.day === day
      );
      
      if (existingIndex >= 0) {
        // Update existing record
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], present };
        return updated;
      } else {
        // Add new record
        return [...prev, { teamId, memberId, day, present }];
      }
    });
  };

  return (
    <AttendanceContext.Provider value={{
      attendanceRecords,
      getTeamAttendance,
      getMemberAttendanceForDay,
      getTotalAbsencesForMember,
      updateAttendance,
      setMemberAttendance,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
