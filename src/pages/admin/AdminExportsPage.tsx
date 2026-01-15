import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileDown, FileSpreadsheet, FileText, Users, Trophy, ArrowRight, Loader2, Calendar, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ExportFormat = 'excel' | 'pdf';

const AdminExportsPage = () => {
  const { language } = useLanguage();
  const [exporting, setExporting] = useState<string | null>(null);

  const downloadExcel = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) {
      toast.error(language === 'ar' ? 'لا توجد بيانات للتصدير' : 'No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Auto-size columns
    const colWidths = Object.keys(data[0]).map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length))
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const downloadPDF = (data: Record<string, unknown>[], filename: string, title: string) => {
    if (data.length === 0) {
      toast.error(language === 'ar' ? 'لا توجد بيانات للتصدير' : 'No data to export');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.text(`${language === 'ar' ? 'تاريخ التصدير:' : 'Export Date:'} ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 30);

    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => String(row[h] || '')));

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 35,
      styles: { 
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: { 
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { top: 35 },
    });

    doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportTeams = async (formatType: ExportFormat) => {
    try {
      setExporting('teams');
      
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (teamsError) throw teamsError;

      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('team_id, team_role');

      if (membersError) throw membersError;

      const memberCounts = members?.reduce((acc: Record<string, number>, m) => {
        acc[m.team_id] = (acc[m.team_id] || 0) + 1;
        return acc;
      }, {}) || {};

      const leaderIds = teams?.map(t => t.leader_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone')
        .in('user_id', leaderIds);

      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]));

      const exportData = (teams || []).map(team => {
        const leader = profilesMap.get(team.leader_id);
        const statusLabels: Record<string, string> = {
          pending: language === 'ar' ? 'قيد المراجعة' : 'Pending',
          approved: language === 'ar' ? 'مقبول مبدئياً' : 'Initially Approved',
          final_approved: language === 'ar' ? 'مقبول نهائياً' : 'Final Approved',
          rejected: language === 'ar' ? 'مرفوض' : 'Rejected',
        };
        return {
          [language === 'ar' ? 'اسم الفريق' : 'Team Name']: team.name,
          [language === 'ar' ? 'اسم الفريق (عربي)' : 'Team Name (AR)']: team.name_ar || '',
          [language === 'ar' ? 'الحالة' : 'Status']: statusLabels[team.status || 'pending'] || team.status,
          [language === 'ar' ? 'عدد الأعضاء' : 'Members']: memberCounts[team.id] || 0,
          [language === 'ar' ? 'اسم القائد' : 'Leader']: leader?.full_name || '',
          [language === 'ar' ? 'بريد القائد' : 'Email']: leader?.email || '',
          [language === 'ar' ? 'هاتف القائد' : 'Phone']: leader?.phone || '',
          [language === 'ar' ? 'تاريخ التسجيل' : 'Registered']: format(new Date(team.created_at), 'yyyy-MM-dd'),
        };
      });

      if (formatType === 'excel') {
        downloadExcel(exportData, 'teams');
      } else {
        downloadPDF(exportData, 'teams', language === 'ar' ? 'قائمة الفرق' : 'Teams List');
      }
      toast.success(language === 'ar' ? 'تم تصدير الفرق بنجاح' : 'Teams exported successfully');
    } catch (err) {
      console.error('Error exporting teams:', err);
      toast.error(language === 'ar' ? 'خطأ في تصدير الفرق' : 'Error exporting teams');
    } finally {
      setExporting(null);
    }
  };

  const exportMembers = async (formatType: ExportFormat) => {
    try {
      setExporting('members');

      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*');

      if (membersError) throw membersError;

      const teamIds = [...new Set(members?.map(m => m.team_id) || [])];
      const { data: teams } = await supabase
        .from('teams')
        .select('id, name, name_ar, status')
        .in('id', teamIds);

      const teamsMap = new Map(teams?.map(t => [t.id, t]));

      const userIds = [...new Set(members?.map(m => m.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone, university, robotics_experience, has_programmed_robot, autonomous_logic_exp, circuit_reading_exp, mechanical_work_exp, manual_control_exp, competitive_activities, technical_skills')
        .in('user_id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]));

      const roleLabels: Record<string, string> = {
        driver: language === 'ar' ? 'السائق' : 'Driver',
        electronics: language === 'ar' ? 'الإلكترونيات' : 'Electronics',
        programmer: language === 'ar' ? 'المبرمج' : 'Programmer',
        mechanics_designer: language === 'ar' ? 'الميكانيكا/التصميم' : 'Mechanics/Design',
      };

      const exportData = (members || []).map(member => {
        const team = teamsMap.get(member.team_id);
        const profile = profilesMap.get(member.user_id);
        return {
          [language === 'ar' ? 'اسم العضو' : 'Member Name']: profile?.full_name || '',
          [language === 'ar' ? 'البريد الإلكتروني' : 'Email']: profile?.email || '',
          [language === 'ar' ? 'الهاتف' : 'Phone']: profile?.phone || '',
          [language === 'ar' ? 'الجامعة' : 'University']: profile?.university || '',
          [language === 'ar' ? 'الفريق' : 'Team']: language === 'ar' ? (team?.name_ar || team?.name) : team?.name,
          [language === 'ar' ? 'الدور' : 'Role']: roleLabels[member.team_role || ''] || member.team_role,
          [language === 'ar' ? 'تاريخ الانضمام' : 'Joined']: format(new Date(member.joined_at), 'yyyy-MM-dd'),
          [language === 'ar' ? 'مستوى الخبرة بالروبوتات' : 'Robotics Experience']: profile?.robotics_experience || '',
          [language === 'ar' ? 'برمجة Robot/Hardware' : 'Programmed Robot']: profile?.has_programmed_robot || '',
          [language === 'ar' ? 'خبرة Autonomous Logic' : 'Autonomous Logic']: profile?.autonomous_logic_exp || '',
          [language === 'ar' ? 'قراءة الدوائر الإلكترونية' : 'Circuit Reading']: profile?.circuit_reading_exp || '',
          [language === 'ar' ? 'عمل ميكانيكي' : 'Mechanical Work']: profile?.mechanical_work_exp || '',
          [language === 'ar' ? 'تحكم يدوي' : 'Manual Control']: profile?.manual_control_exp || '',
          [language === 'ar' ? 'أنشطة تنافسية' : 'Competitive Activities']: profile?.competitive_activities || '',
          [language === 'ar' ? 'المهارات التقنية' : 'Technical Skills']: Array.isArray(profile?.technical_skills) ? profile.technical_skills.join(', ') : '',
        };
      });

      if (formatType === 'excel') {
        downloadExcel(exportData, 'members');
      } else {
        downloadPDF(exportData, 'members', language === 'ar' ? 'قائمة الأعضاء' : 'Members List');
      }
      toast.success(language === 'ar' ? 'تم تصدير الأعضاء بنجاح' : 'Members exported successfully');
    } catch (err) {
      console.error('Error exporting members:', err);
      toast.error(language === 'ar' ? 'خطأ في تصدير الأعضاء' : 'Error exporting members');
    } finally {
      setExporting(null);
    }
  };

  const exportScores = async (formatType: ExportFormat) => {
    try {
      setExporting('scores');

      const { data: scores, error: scoresError } = await supabase
        .from('scores')
        .select('*')
        .order('total_score', { ascending: false });

      if (scoresError) throw scoresError;

      const teamIds = [...new Set(scores?.map(s => s.team_id) || [])];
      const { data: teams } = await supabase
        .from('teams')
        .select('id, name, name_ar')
        .in('id', teamIds);

      const teamsMap = new Map(teams?.map(t => [t.id, t]));

      const judgeIds = [...new Set(scores?.map(s => s.judge_id) || [])];
      const { data: judges } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', judgeIds);

      const judgesMap = new Map(judges?.map(j => [j.user_id, j]));

      const exportData = (scores || []).map(score => {
        const team = teamsMap.get(score.team_id);
        const judge = judgesMap.get(score.judge_id);
        const criteria = score.criteria as Record<string, number> | null;
        
        return {
          [language === 'ar' ? 'الترتيب' : 'Rank']: 0,
          [language === 'ar' ? 'الفريق' : 'Team']: language === 'ar' ? (team?.name_ar || team?.name) : team?.name,
          [language === 'ar' ? 'المحكم' : 'Judge']: judge?.full_name || judge?.email || '',
          [language === 'ar' ? 'الابتكار' : 'Innovation']: criteria?.innovation || 0,
          [language === 'ar' ? 'الهندسة' : 'Engineering']: criteria?.engineering || 0,
          [language === 'ar' ? 'الدفاع' : 'Defense']: criteria?.defense || 0,
          [language === 'ar' ? 'التحكم' : 'Control']: criteria?.control || 0,
          [language === 'ar' ? 'العرض' : 'Presentation']: criteria?.presentation || 0,
          [language === 'ar' ? 'المجموع' : 'Total']: score.total_score,
          [language === 'ar' ? 'الملاحظات' : 'Comments']: score.comments || '',
        };
      });

      // Add ranking
      exportData.forEach((item, index) => {
        item[language === 'ar' ? 'الترتيب' : 'Rank'] = index + 1;
      });

      if (formatType === 'excel') {
        downloadExcel(exportData, 'scores');
      } else {
        downloadPDF(exportData, 'scores', language === 'ar' ? 'جدول الدرجات' : 'Scores Table');
      }
      toast.success(language === 'ar' ? 'تم تصدير الدرجات بنجاح' : 'Scores exported successfully');
    } catch (err) {
      console.error('Error exporting scores:', err);
      toast.error(language === 'ar' ? 'خطأ في تصدير الدرجات' : 'Error exporting scores');
    } finally {
      setExporting(null);
    }
  };

  const exportAttendance = async (formatType: ExportFormat) => {
    try {
      setExporting('attendance');

      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;

      const teamIds = [...new Set(attendance?.map(a => a.team_id) || [])];
      const { data: teams } = await supabase
        .from('teams')
        .select('id, name, name_ar')
        .in('id', teamIds);

      const teamsMap = new Map(teams?.map(t => [t.id, t]));

      const userIds = [...new Set(attendance?.map(a => a.user_id).filter(Boolean) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.user_id, p.full_name]));

      const statusLabels: Record<string, string> = {
        present: language === 'ar' ? 'حاضر' : 'Present',
        absent: language === 'ar' ? 'غائب' : 'Absent',
        late: language === 'ar' ? 'متأخر' : 'Late',
        excused: language === 'ar' ? 'معذور' : 'Excused',
      };

      const exportData = (attendance || []).map(record => {
        const team = teamsMap.get(record.team_id);
        return {
          [language === 'ar' ? 'التاريخ' : 'Date']: record.date,
          [language === 'ar' ? 'الفريق' : 'Team']: language === 'ar' ? (team?.name_ar || team?.name) : team?.name,
          [language === 'ar' ? 'العضو' : 'Member']: record.user_id ? (profilesMap.get(record.user_id) || '') : (language === 'ar' ? 'الفريق كامل' : 'Whole Team'),
          [language === 'ar' ? 'الحالة' : 'Status']: statusLabels[record.status || 'absent'] || record.status,
          [language === 'ar' ? 'ملاحظات' : 'Notes']: record.notes || '',
        };
      });

      if (formatType === 'excel') {
        downloadExcel(exportData, 'attendance');
      } else {
        downloadPDF(exportData, 'attendance', language === 'ar' ? 'سجل الحضور' : 'Attendance Record');
      }
      toast.success(language === 'ar' ? 'تم تصدير الحضور بنجاح' : 'Attendance exported successfully');
    } catch (err) {
      console.error('Error exporting attendance:', err);
      toast.error(language === 'ar' ? 'خطأ في تصدير الحضور' : 'Error exporting attendance');
    } finally {
      setExporting(null);
    }
  };

  const exportWorkshops = async (formatType: ExportFormat) => {
    try {
      setExporting('workshops');

      const { data: workshops, error: workshopsError } = await supabase
        .from('workshops')
        .select('*')
        .order('date', { ascending: true });

      if (workshopsError) throw workshopsError;

      const { data: attendanceData } = await supabase
        .from('workshop_attendance')
        .select('workshop_id, attended');

      const workshopStats = (attendanceData || []).reduce((acc: Record<string, { registered: number; attended: number }>, a) => {
        if (!acc[a.workshop_id]) {
          acc[a.workshop_id] = { registered: 0, attended: 0 };
        }
        acc[a.workshop_id].registered++;
        if (a.attended) acc[a.workshop_id].attended++;
        return acc;
      }, {});

      const exportData = (workshops || []).map(w => ({
        [language === 'ar' ? 'العنوان' : 'Title']: language === 'ar' ? (w.title_ar || w.title) : w.title,
        [language === 'ar' ? 'الوصف' : 'Description']: w.description || '',
        [language === 'ar' ? 'التاريخ' : 'Date']: w.date,
        [language === 'ar' ? 'وقت البدء' : 'Start']: w.start_time || '',
        [language === 'ar' ? 'وقت الانتهاء' : 'End']: w.end_time || '',
        [language === 'ar' ? 'المكان' : 'Location']: w.location || '',
        [language === 'ar' ? 'الحد الأقصى' : 'Max']: w.max_participants || '',
        [language === 'ar' ? 'المسجلين' : 'Registered']: workshopStats[w.id]?.registered || 0,
        [language === 'ar' ? 'الحاضرين' : 'Attended']: workshopStats[w.id]?.attended || 0,
      }));

      if (formatType === 'excel') {
        downloadExcel(exportData, 'workshops');
      } else {
        downloadPDF(exportData, 'workshops', language === 'ar' ? 'ورش العمل' : 'Workshops');
      }
      toast.success(language === 'ar' ? 'تم تصدير الورش بنجاح' : 'Workshops exported successfully');
    } catch (err) {
      console.error('Error exporting workshops:', err);
      toast.error(language === 'ar' ? 'خطأ في تصدير الورش' : 'Error exporting workshops');
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      key: 'teams',
      title: language === 'ar' ? 'تصدير الفرق' : 'Export Teams',
      description: language === 'ar' ? 'قائمة جميع الفرق مع بياناتهم وحالة القبول' : 'List of all teams with their data and status',
      icon: Users,
      action: exportTeams,
    },
    {
      key: 'members',
      title: language === 'ar' ? 'تصدير الأعضاء' : 'Export Members',
      description: language === 'ar' ? 'قائمة جميع أعضاء الفرق مع بياناتهم' : 'List of all team members with their info',
      icon: UserCheck,
      action: exportMembers,
    },
    {
      key: 'scores',
      title: language === 'ar' ? 'تصدير الدرجات' : 'Export Scores',
      description: language === 'ar' ? 'درجات جميع الفرق مع التفاصيل والترتيب' : 'All team scores with details and ranking',
      icon: Trophy,
      action: exportScores,
    },
    {
      key: 'attendance',
      title: language === 'ar' ? 'تقرير الحضور' : 'Attendance Report',
      description: language === 'ar' ? 'تقرير شامل عن حضور الفرق والأعضاء' : 'Comprehensive attendance report',
      icon: FileSpreadsheet,
      action: exportAttendance,
    },
    {
      key: 'workshops',
      title: language === 'ar' ? 'تصدير الورش' : 'Export Workshops',
      description: language === 'ar' ? 'بيانات ورش العمل مع إحصائيات التسجيل' : 'Workshop data with registration stats',
      icon: Calendar,
      action: exportWorkshops,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Admin Mode Label + Back Button */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="text-red-500 font-semibold">
            {language === 'ar' ? 'وضع الإدارة' : 'Admin Mode'}
          </span>
        </div>
        <Link to="/admin">
          <Button variant="outline">
            <ArrowRight className="w-4 h-4 me-2 rtl:rotate-180" />
            {language === 'ar' ? 'العودة للإدارة' : 'Back to Admin'}
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-primary">
          {language === 'ar' ? 'تصدير البيانات' : 'Data Exports'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'تصدير البيانات والتقارير بصيغة Excel أو PDF' : 'Export data and reports in Excel or PDF format'}
        </p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const isExporting = exporting === option.key;
          
          return (
            <Card key={option.key} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription className="text-sm">{option.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    className="flex-1 flex items-center gap-2"
                    onClick={() => option.action('excel')}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4" />
                    )}
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center gap-2"
                    onClick={() => option.action('pdf')}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminExportsPage;
