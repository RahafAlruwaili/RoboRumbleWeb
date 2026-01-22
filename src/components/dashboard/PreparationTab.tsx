import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Gamepad2,
  Code,
  Cpu,
  Wrench,
  Palette,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleAr: string;
  icon: React.ElementType;
  color: string;
}

interface AttendanceRecord {
  memberId: string;
  day: number;
  present: boolean;
  date: string;
}

interface PreparationTabProps {
  teamMembers: TeamMember[];
  isAdmin: boolean;
  teamId: string;
}

const roleIcons: Record<string, React.ElementType> = {
  driver: Gamepad2,
  programmer: Code,
  electronics: Cpu,
  mechanics_designer: Wrench,
};

// Competition Days: 5-7 February 2026
const days = [
  { num: 2, ar: 'اليوم 2 (5 فبراير)', en: 'Day 2 (Feb 5)', date: '2026-02-05' },
  { num: 3, ar: 'اليوم 3 (6 فبراير)', en: 'Day 3 (Feb 6)', date: '2026-02-06' },
  { num: 4, ar: 'اليوم 4 (7 فبراير)', en: 'Day 4 (Feb 7)', date: '2026-02-07' },
];

const PreparationTab = ({ teamMembers, isAdmin, teamId }: PreparationTabProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const [selectedDay, setSelectedDay] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Attendance records from database
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  
  // Temporary state for editing
  const [editedAttendance, setEditedAttendance] = useState<AttendanceRecord[]>([]);

  // Fetch attendance from Supabase
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!teamId) return;
      
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('team_id', teamId);

        if (error) throw error;

        const records: AttendanceRecord[] = (data || []).map(record => {
          const dayInfo = days.find(d => d.date === record.date);
          return {
            memberId: record.user_id || '',
            day: dayInfo?.num || 1,
            present: record.status === 'present',
            date: record.date,
          };
        });

        setAttendanceRecords(records);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [teamId]);

  const getAttendanceForDay = (day: number) => {
    return attendanceRecords.filter(r => r.day === day);
  };

  const getMemberAttendanceForDayLocal = (memberId: string, day: number): boolean | null => {
    const records = isEditing ? editedAttendance : attendanceRecords;
    const record = records.find(
      r => r.memberId === memberId && r.day === day
    );
    return record ? record.present : null;
  };

  const getTotalAbsencesForMemberLocal = (memberId: string): number => {
    return attendanceRecords.filter(r => r.memberId === memberId && !r.present).length;
  };

  const getTotalAbsencesOverall = (): number => {
    const memberAbsences = teamMembers.map(m => getTotalAbsencesForMemberLocal(m.id));
    return memberAbsences.reduce((sum, abs) => sum + abs, 0);
  };

  const getViolationsCount = (): number => {
    return teamMembers.filter(m => getTotalAbsencesForMemberLocal(m.id) > 1).length;
  };

  const getMemberStatus = (memberId: string): 'ok' | 'warning' | 'violation' => {
    const absences = getTotalAbsencesForMemberLocal(memberId);
    if (absences === 0) return 'ok';
    if (absences === 1) return 'warning';
    return 'violation';
  };

  const getStatusBadge = (status: 'ok' | 'warning' | 'violation') => {
    switch (status) {
      case 'ok':
        return {
          text: language === 'ar' ? 'سليم' : 'OK',
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          icon: CheckCircle,
        };
      case 'warning':
        return {
          text: language === 'ar' ? 'تنبيه' : 'Warning',
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          icon: AlertTriangle,
        };
      case 'violation':
        return {
          text: language === 'ar' ? 'مخالفة' : 'Violation',
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: XCircle,
        };
    }
  };

  const handleStartEditing = () => {
    setEditedAttendance([...attendanceRecords]);
    setIsEditing(true);
  };

  const handleToggleAttendance = (memberId: string) => {
    const selectedDate = days.find(d => d.num === selectedDay)?.date || '';
    setEditedAttendance(prev => {
      const existing = prev.find(r => r.memberId === memberId && r.day === selectedDay);
      if (existing) {
        return prev.map(r => 
          r.memberId === memberId && r.day === selectedDay 
            ? { ...r, present: !r.present }
            : r
        );
      } else {
        return [...prev, { memberId, day: selectedDay, present: false, date: selectedDate }];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete existing attendance records for this team
      await supabase
        .from('attendance')
        .delete()
        .eq('team_id', teamId);

      // Insert new attendance records
      const attendanceInserts = editedAttendance.map(record => ({
        team_id: teamId,
        user_id: record.memberId,
        date: record.date,
        status: record.present ? 'present' : 'absent',
        marked_by: user?.id,
      }));

      if (attendanceInserts.length > 0) {
        const { error } = await supabase
          .from('attendance')
          .insert(attendanceInserts);

        if (error) throw error;
      }

      setAttendanceRecords([...editedAttendance]);
      setIsEditing(false);
      toast.success(language === 'ar' ? 'تم حفظ الحضور بنجاح' : 'Attendance saved successfully');
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء حفظ الحضور' : 'Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedAttendance([]);
    setIsEditing(false);
  };

  const attendanceForSelectedDay = getAttendanceForDay(selectedDay);
  const hasRecordsForDay = attendanceForSelectedDay.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Mode Badge */}
      {isAdmin && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-xl border border-primary/20">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            {language === 'ar' ? 'وضع الإدارة' : 'Admin Mode'}
          </span>
        </div>
      )}

      {/* Rule Notice */}
      <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
        <p className="text-sm text-muted-foreground text-center">
          {language === 'ar' 
            ? 'مسموح غياب واحد فقط لكل مشارك خلال 4 أيام.' 
            : 'Only one absence is allowed per participant across 4 days.'}
        </p>
      </div>

      {/* Day Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {days.map((day) => (
          <Button
            key={day.num}
            variant={selectedDay === day.num ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDay(day.num)}
            className="min-w-[120px]"
          >
            <Calendar className="w-4 h-4 me-2" />
            {language === 'ar' ? day.ar : day.en}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'اليوم المحدد' : 'Selected Day'}
          </p>
          <p className="text-xl font-bold text-foreground">{selectedDay}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'إجمالي الأعضاء' : 'Total Members'}
          </p>
          <p className="text-xl font-bold text-foreground">{teamMembers.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
          <XCircle className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'إجمالي الغياب' : 'Total Absences'}
          </p>
          <p className="text-xl font-bold text-foreground">{getTotalAbsencesOverall()}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-400" />
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'المخالفات' : 'Violations'}
          </p>
          <p className="text-xl font-bold text-foreground">{getViolationsCount()}</p>
        </div>
      </div>

      {/* Edit Button (Admin Only) */}
      {isAdmin && (
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin me-2" />
                ) : null}
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
            </>
          ) : (
            <Button onClick={handleStartEditing}>
              {language === 'ar' ? 'تعديل الحضور' : 'Edit Attendance'}
            </Button>
          )}
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start text-sm font-medium text-muted-foreground">
                  {language === 'ar' ? 'العضو' : 'Member'}
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                  {language === 'ar' ? 'الدور' : 'Role'}
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                  {language === 'ar' ? `اليوم ${selectedDay}` : `Day ${selectedDay}`}
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                  {language === 'ar' ? 'إجمالي الغياب' : 'Total Absences'}
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                  {language === 'ar' ? 'الحالة' : 'Status'}
                </th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => {
                const RoleIcon = roleIcons[member.role] || Users;
                const attendance = getMemberAttendanceForDayLocal(member.id, selectedDay);
                const totalAbsences = getTotalAbsencesForMemberLocal(member.id);
                const status = getMemberStatus(member.id);
                const statusBadge = getStatusBadge(status);
                const StatusBadgeIcon = statusBadge.icon;

                return (
                  <tr key={member.id} className="border-t border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
                          member.color
                        )}>
                          <RoleIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-foreground">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {language === 'ar' ? member.roleAr : member.role}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <Switch
                          checked={getMemberAttendanceForDayLocal(member.id, selectedDay) ?? true}
                          onCheckedChange={() => handleToggleAttendance(member.id)}
                        />
                      ) : (
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                          attendance === null 
                            ? "bg-muted text-muted-foreground"
                            : attendance 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-red-500/20 text-red-400"
                        )}>
                          {attendance === null 
                            ? (language === 'ar' ? 'غير محدد' : 'N/A')
                            : attendance 
                              ? (language === 'ar' ? 'حاضر' : 'Present')
                              : (language === 'ar' ? 'غائب' : 'Absent')
                          }
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "font-bold",
                        totalAbsences === 0 ? "text-green-400" : totalAbsences === 1 ? "text-yellow-400" : "text-red-400"
                      )}>
                        {totalAbsences}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium",
                        statusBadge.color
                      )}>
                        <StatusBadgeIcon className="w-3 h-3" />
                        {statusBadge.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Records Notice */}
      {!hasRecordsForDay && !isEditing && (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{language === 'ar' ? 'لم يتم تسجيل الحضور لهذا اليوم بعد' : 'No attendance recorded for this day yet'}</p>
        </div>
      )}
    </div>
  );
};

export default PreparationTab;
