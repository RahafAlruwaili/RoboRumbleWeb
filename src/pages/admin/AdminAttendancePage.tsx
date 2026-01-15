import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Calendar, Users, Check, X, Search, ArrowRight, Save, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAttendanceAdmin, useTeams } from '@/hooks/useAdminData';

const AdminAttendancePage = () => {
  const { language } = useLanguage();
  const { attendance, isLoading, updateAttendanceStatus, markAttendance, refetch } = useAttendanceAdmin();
  const { teams } = useTeams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  // Filter only approved teams
  const approvedTeams = teams.filter(t => t.status === 'approved' || t.status === 'final_approved');

  // Get members for selected team
  const selectedTeamMembers = selectedTeamId 
    ? approvedTeams.find(t => t.id === selectedTeamId)?.members || []
    : [];

  // New attendance form
  const [newAttendance, setNewAttendance] = useState({
    teamId: '',
    memberId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'present',
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: { ar: string; en: string }; className: string }> = {
      present: { 
        label: { ar: 'حاضر', en: 'Present' }, 
        className: 'bg-green-500/20 text-green-600 border-green-500/30' 
      },
      absent: { 
        label: { ar: 'غائب', en: 'Absent' }, 
        className: 'bg-red-500/20 text-red-600 border-red-500/30' 
      },
      late: { 
        label: { ar: 'متأخر', en: 'Late' }, 
        className: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30' 
      },
      excused: { 
        label: { ar: 'معذور', en: 'Excused' }, 
        className: 'bg-blue-500/20 text-blue-600 border-blue-500/30' 
      },
    };

    const config = statusConfig[status] || statusConfig.absent;
    return (
      <Badge variant="outline" className={config.className}>
        {language === 'ar' ? config.label.ar : config.label.en}
      </Badge>
    );
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAttendanceStatus(id, newStatus);
      toast.success(language === 'ar' ? 'تم تحديث الحالة' : 'Status updated');
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error occurred');
    }
  };

  const handleAddAttendance = async () => {
    if (!newAttendance.teamId || !newAttendance.memberId || !newAttendance.date) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    setIsSaving(true);
    try {
      await markAttendance(newAttendance.teamId, newAttendance.memberId, newAttendance.date, newAttendance.status);
      toast.success(language === 'ar' ? 'تم تسجيل الحضور' : 'Attendance recorded');
      setIsAddModalOpen(false);
      setNewAttendance({
        teamId: '',
        memberId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'present',
      });
      setSelectedTeamId('');
      setSelectedMemberId('');
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'Error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter attendance
  const filteredAttendance = attendance
    .filter(record => {
      const teamName = record.team?.name || record.team?.name_ar || '';
      const userName = record.user?.full_name || record.user?.email || '';
      return teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             userName.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .filter(record => statusFilter === 'all' || record.status === statusFilter);

  // Stats
  const presentCount = attendance.filter(r => r.status === 'present').length;
  const absentCount = attendance.filter(r => r.status === 'absent').length;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-primary">
            {language === 'ar' ? 'إدارة الحضور' : 'Attendance Management'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'تتبع حضور الفرق' : 'Track team attendance'}
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 me-2" />
          {language === 'ar' ? 'إضافة حضور' : 'Add Attendance'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{presentCount}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'حاضر' : 'Present'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{absentCount}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'غائب' : 'Absent'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{attendance.length}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'إجمالي السجلات' : 'Total Records'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">
              {attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0}%
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'نسبة الحضور' : 'Attendance Rate'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {language === 'ar' ? 'سجل الحضور' : 'Attendance Records'}
              <span className="text-sm font-normal text-muted-foreground">({filteredAttendance.length})</span>
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" size={16} />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                  className="ps-9 w-full sm:w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder={language === 'ar' ? 'الحالة' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="present">{language === 'ar' ? 'حاضر' : 'Present'}</SelectItem>
                  <SelectItem value="absent">{language === 'ar' ? 'غائب' : 'Absent'}</SelectItem>
                  <SelectItem value="late">{language === 'ar' ? 'متأخر' : 'Late'}</SelectItem>
                  <SelectItem value="excused">{language === 'ar' ? 'معذور' : 'Excused'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAttendance.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا توجد سجلات حضور' : 'No attendance records'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'الفريق' : 'Team'}</TableHead>
                  <TableHead>{language === 'ar' ? 'العضو' : 'Member'}</TableHead>
                  <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map(record => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {language === 'ar' && record.team?.name_ar ? record.team.name_ar : record.team?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {record.user?.full_name || record.user?.email || '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(record.date), 'dd/MM/yyyy', {
                        locale: language === 'ar' ? ar : undefined
                      })}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8",
                            record.status === 'present' && "bg-green-500/20"
                          )}
                          onClick={() => handleStatusChange(record.id, 'present')}
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-8 w-8",
                            record.status === 'absent' && "bg-red-500/20"
                          )}
                          onClick={() => handleStatusChange(record.id, 'absent')}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Attendance Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'إضافة حضور جديد' : 'Add New Attendance'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الفريق' : 'Team'}</Label>
              <Select
                value={newAttendance.teamId}
                onValueChange={(value) => {
                  setSelectedTeamId(value);
                  setNewAttendance({ ...newAttendance, teamId: value, memberId: '' });
                  setSelectedMemberId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر الفريق' : 'Select team'} />
                </SelectTrigger>
                <SelectContent>
                  {approvedTeams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {language === 'ar' && team.name_ar ? team.name_ar : team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTeamId && (
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العضو' : 'Member'}</Label>
                <Select
                  value={newAttendance.memberId}
                  onValueChange={(value) => {
                    setSelectedMemberId(value);
                    setNewAttendance({ ...newAttendance, memberId: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'ar' ? 'اختر العضو' : 'Select member'} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTeamMembers.map(member => (
                      <SelectItem key={member.id} value={member.user_id}>
                        {member.profile?.full_name || member.profile?.email || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'التاريخ' : 'Date'}</Label>
              <Input
                type="date"
                value={newAttendance.date}
                onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الحالة' : 'Status'}</Label>
              <Select
                value={newAttendance.status}
                onValueChange={(value) => setNewAttendance({ ...newAttendance, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">{language === 'ar' ? 'حاضر' : 'Present'}</SelectItem>
                  <SelectItem value="absent">{language === 'ar' ? 'غائب' : 'Absent'}</SelectItem>
                  <SelectItem value="late">{language === 'ar' ? 'متأخر' : 'Late'}</SelectItem>
                  <SelectItem value="excused">{language === 'ar' ? 'معذور' : 'Excused'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleAddAttendance} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 me-2" />
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAttendancePage;
