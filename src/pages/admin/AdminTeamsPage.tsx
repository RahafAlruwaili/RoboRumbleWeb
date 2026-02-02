import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, Eye, Crown, Mail, Search, ArrowRight, Loader2, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useTeams, TeamWithMembers } from '@/hooks/useAdminData';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const AdminTeamsPage = () => {
  const { language } = useLanguage();
  const { teams, isLoading, deleteTeam, refetch } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<TeamWithMembers | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleViewTeam = (team: TeamWithMembers) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (team: TeamWithMembers) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  const handleStatusChange = async (teamId: string, newStatus: string, teamName: string) => {
    setUpdatingStatus(teamId);
    try {
      // Update team status in database
      const { error: updateError } = await supabase
        .from('teams')
        .update({ status: newStatus })
        .eq('id', teamId);

      if (updateError) throw updateError;

      // Send email notification
      const notificationStatus = newStatus === 'approved' ? 'approved'
        //: newStatus === 'final_approved' ? 'final_approved'
          : newStatus === 'rejected' ? 'rejected'
            : null;

      if (notificationStatus) {
        try {
          const { error: notifyError } = await supabase.functions.invoke('send-team-notification', {
            body: {
              teamId,
              status: notificationStatus,
              teamName,
            },
          });

          if (notifyError) {
            console.error('Error sending notification:', notifyError);
            toast.warning(language === 'ar' ? 'تم تحديث الحالة لكن فشل إرسال الإشعار' : 'Status updated but notification failed');
          } else {
            toast.success(language === 'ar' ? 'تم تحديث الحالة وإرسال الإشعار بنجاح' : 'Status updated and notification sent');
          }
        } catch (notifyErr) {
          console.error('Notification error:', notifyErr);
        }
      } else {
        toast.success(language === 'ar' ? 'تم تحديث الحالة بنجاح' : 'Status updated successfully');
      }

      refetch();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء تحديث الحالة' : 'Error updating status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const confirmDelete = async () => {
    if (!teamToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTeam(teamToDelete.id);
      toast.success(language === 'ar' ? 'تم حذف الفريق بنجاح' : 'Team deleted successfully');
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Error deleting team');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30"><CheckCircle className="w-3 h-3 me-1" />{language === 'ar' ? 'مقبول مبدئياً' : 'Initial Accept'}</Badge>;
      case 'final_approved':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle className="w-3 h-3 me-1" />{language === 'ar' ? 'مقبول نهائياً' : 'Final Accept'}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30"><XCircle className="w-3 h-3 me-1" />{language === 'ar' ? 'مرفوض' : 'Rejected'}</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 me-1" />{language === 'ar' ? 'قيد المراجعة' : 'Pending'}</Badge>;
    }
  };
  // Filter teams based on search and status
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.name_ar && team.name_ar.includes(searchQuery)) ||
      (team.leader?.full_name && team.leader.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter || 
      (statusFilter === 'pending' && !team.status);
    
    return matchesSearch && matchesStatus;
  });

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-primary">
          {language === 'ar' ? 'إدارة الفرق' : 'Manage Teams'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'عرض وإدارة جميع الفرق المسجلة في المسابقة' : 'View and manage all teams registered in the competition'}
        </p>
      </div>

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {language === 'ar' ? 'قائمة الفرق' : 'Teams List'}
              <span className="text-sm font-normal text-muted-foreground">({filteredTeams.length})</span>
            </CardTitle>
 {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={language === 'ar' ? 'فلتر الحالة' : 'Filter Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'ar' ? 'جميع الحالات' : 'All Statuses'}
                  </SelectItem>
                  <SelectItem value="pending">
                    {language === 'ar' ? 'قيد المراجعة' : 'Pending'}
                  </SelectItem>
                  <SelectItem value="approved">
                    {language === 'ar' ? 'مقبول مبدئياً' : 'Initial Accept'}
                  </SelectItem>
                  <SelectItem value="final_approved">
                    {language === 'ar' ? 'مقبول نهائياً' : 'Final Accept'}
                  </SelectItem>
                  <SelectItem value="rejected">
                    {language === 'ar' ? 'مرفوض' : 'Rejected'}
                  </SelectItem>
                </SelectContent>
              </Select>
              {/* Search */}
              <div className="relative">
                <Search className="absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" size={16} />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                  className="ps-9 w-full sm:w-[250px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTeams.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {teams.length === 0 ? (
                <>
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{language === 'ar' ? 'لا توجد فرق مسجلة حتى الآن' : 'No teams registered yet'}</p>
                </>
              ) : (
                <p>{language === 'ar' ? 'لا توجد فرق مطابقة للبحث' : 'No teams match your search'}</p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'اسم الفريق' : 'Team Name'}</TableHead>
                  <TableHead>{language === 'ar' ? 'القائد' : 'Leader'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الأعضاء' : 'Members'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{language === 'ar' ? 'تغيير الحالة' : 'Change Status'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.map(team => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">
                      {language === 'ar' && team.name_ar ? team.name_ar : team.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        {team.leader?.full_name || team.leader?.email || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{team.members.length}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(team.status)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={team.status || 'pending'}
                        onValueChange={(value) => handleStatusChange(team.id, value, team.name)}
                        disabled={updatingStatus === team.id}
                      >
                        <SelectTrigger className="w-[150px]">
                          {updatingStatus === team.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            {language === 'ar' ? 'قيد المراجعة' : 'Pending'}
                          </SelectItem>
                          <SelectItem value="approved">
                            {language === 'ar' ? 'قبول مبدئي' : 'Initial Accept'}
                          </SelectItem>
                          <SelectItem value="final_approved">
                            {language === 'ar' ? 'قبول نهائي' : 'Final Accept'}
                          </SelectItem>
                          <SelectItem value="rejected">
                            {language === 'ar' ? 'رفض' : 'Reject'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTeam(team)}
                        >
                          <Eye className="w-4 h-4 me-1" />
                          {language === 'ar' ? 'عرض' : 'View'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(team)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Team Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {selectedTeam && (language === 'ar' && selectedTeam.name_ar ? selectedTeam.name_ar : selectedTeam.name)}
            </DialogTitle>
          </DialogHeader>

          {selectedTeam && (
            <div className="space-y-6">
              {/* Team Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'القائد' : 'Leader'}
                  </p>
                  <p className="font-medium flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    {selectedTeam.leader?.full_name || selectedTeam.leader?.email || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'عدد الأعضاء' : 'Members Count'}
                  </p>
                  <p className="font-medium">{selectedTeam.members.length} / {selectedTeam.max_members}</p>
                </div>
              </div>

              {selectedTeam.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'ar' ? 'الوصف' : 'Description'}
                  </p>
                  <p>{selectedTeam.description}</p>
                </div>
              )}

              {/* Members List */}
              <div>
                <h4 className="font-semibold mb-3">
                  {language === 'ar' ? 'أعضاء الفريق' : 'Team Members'}
                </h4>
                <div className="space-y-2">
                  {selectedTeam.members.map(member => (
                    <div key={member.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                      {/* Member Basic Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {member.profile?.full_name || member.profile?.email || 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              {member.profile?.email || '-'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{member.role}</Badge>
                      </div>

                      {/* Member Extended Info */}
                      {/* Member Extended Info */}
                      <div className="border-t border-border/50 pt-4 mt-4 space-y-4">

                        {/* 1. Basic Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">{language === 'ar' ? 'الجامعة' : 'University'}</span>
                            <span className="font-medium">{member.profile?.university || '-'}</span>
                            {member.profile?.university_id && (
                              <span className="text-xs text-muted-foreground mt-0.5" dir="ltr">ID: {member.profile.university_id}</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</span>
                            <span className="font-medium" dir="ltr">{member.profile?.phone || '-'}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">{language === 'ar' ? 'مستوى الخبرة العام' : 'General Experience'}</span>
                            <span className="font-medium">{member.profile?.experience_level || '-'}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">{language === 'ar' ? 'الالتزام بالحضور' : 'Commitment'}</span>
                            <span className={`font-medium ${member.profile?.can_commit ? 'text-green-500' : 'text-red-500'}`}>
                              {member.profile?.can_commit
                                ? (language === 'ar' ? 'نعم' : 'Yes')
                                : (language === 'ar' ? 'لا' : 'No')}
                            </span>
                          </div>
                        </div>

                        {/* 2. Skills */}
                        {(member.profile?.technical_skills?.length || 0) > 0 && (
                          <div>
                            <span className="text-muted-foreground text-xs block mb-1.5">{language === 'ar' ? 'المهارات التقنية' : 'Technical Skills'}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {member.profile?.technical_skills?.map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20 text-blue-600 text-[10px] px-2 py-0.5">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {(member.profile?.personal_skills?.length || 0) > 0 && (
                          <div>
                            <span className="text-muted-foreground text-xs block mb-1.5">{language === 'ar' ? 'المهارات الشخصية' : 'Personal Skills'}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {member.profile?.personal_skills?.map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="bg-purple-500/5 hover:bg-purple-500/10 border-purple-500/20 text-purple-600 text-[10px] px-2 py-0.5">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. Goals */}
                        {member.profile?.goals && (
                          <div className="bg-muted/30 p-3 rounded-md text-sm">
                            <span className="text-muted-foreground text-xs block mb-1 font-semibold">{language === 'ar' ? 'الأهداف' : 'Goals'}</span>
                            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground/90">{member.profile.goals}</p>
                          </div>
                        )}

                        {/* 4. Robotics Details */}
                        <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-md">
                          <h5 className="font-semibold text-xs mb-3 text-amber-600 flex items-center gap-1.5 uppercase tracking-wider">
                            <Crown className="w-3 h-3" />
                            {language === 'ar' ? 'تفاصيل الروبوتات' : 'Robotics Details'}
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
                            <div>
                              <span className="text-muted-foreground block mb-0.5">{language === 'ar' ? 'خبرة الروبوتات:' : 'Robotics Exp:'}</span>
                              <span className="font-medium">{member.profile?.robotics_experience || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">{language === 'ar' ? 'برمجة:' : 'Programming:'}</span>
                              <span className="font-medium">{member.profile?.has_programmed_robot || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">{language === 'ar' ? 'Autonomous Logic:' : 'Autonomous Logic:'}</span>
                              <span className="font-medium">{member.profile?.autonomous_logic_exp || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">{language === 'ar' ? 'قراءة الدوائر:' : 'Circuit Reading:'}</span>
                              <span className="font-medium">{member.profile?.circuit_reading_exp || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">{language === 'ar' ? 'عمل ميكانيكي:' : 'Mechanical Work:'}</span>
                              <span className="font-medium">{member.profile?.mechanical_work_exp || '-'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block mb-0.5">{language === 'ar' ? 'تحكم يدوي:' : 'Manual Control:'}</span>
                              <span className="font-medium">{member.profile?.manual_control_exp || '-'}</span>
                            </div>
                            <div className="sm:col-span-2">
                              <span className="text-muted-foreground block mb-0.5">{language === 'ar' ? 'أنشطة تنافسية:' : 'Competitive Activities:'}</span>
                              <span className="font-medium">{member.profile?.competitive_activities || '-'}</span>
                            </div>
                          </div>
                        </div>

                        {/* 5. CV Link */}
                        {member.profile?.cv_link && (
                          <div className="flex justify-start pt-1">
                            <a
                              href={member.profile.cv_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline bg-primary/5 px-3 py-2 rounded border border-primary/20 transition-colors hover:bg-primary/10"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              {language === 'ar' ? 'عرض السيرة الذاتية (CV)' : 'View CV'}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'حذف الفريق' : 'Delete Team'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? `هل أنت متأكد من حذف فريق "${teamToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${teamToDelete?.name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                language === 'ar' ? 'حذف' : 'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTeamsPage;
