import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useJoinRequests } from '@/hooks/useJoinRequests';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  Users, 
  Clock, 
  Gamepad2, 
  Code, 
  Cpu, 
  Wrench, 
  Palette,
  UserPlus,
  Inbox,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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

const JoinRequestsPage = () => {
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'accept' | 'reject' } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Fetch all pending requests (for team leaders)
  const { requests, loading, acceptRequest, rejectRequest } = useJoinRequests();

  const ArrowIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const getRoleInfo = (roleId: string) => {
    const roles: Record<string, { nameAr: string; nameEn: string; icon: React.ElementType; color: string }> = {
      driver: { nameAr: 'التحكم والقيادة', nameEn: 'Driver', icon: Gamepad2, color: 'from-red-500 to-orange-500' },
      programmer: { nameAr: 'المبرمج', nameEn: 'Programmer', icon: Code, color: 'from-blue-500 to-cyan-500' },
      electronics: { nameAr: 'الإلكترونيات', nameEn: 'Electronics', icon: Cpu, color: 'from-green-500 to-emerald-500' },
      mechanics_designer: { nameAr: 'التجميع والتركيب / التصميم الهندسي', nameEn: 'Mechanics / Designer', icon: Wrench, color: 'from-purple-500 to-pink-500' },
    };
    return roles[roleId] || { nameAr: roleId, nameEn: roleId, icon: Users, color: 'from-gray-500 to-gray-600' };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    const result = await acceptRequest(requestId);
    setProcessingId(null);
    setConfirmAction(null);
    
    if (result.success) {
      toast.success(
        language === 'ar' 
          ? 'تم قبول الطلب بنجاح! تمت إضافة العضو للفريق' 
          : 'Request accepted! Member added to team'
      );
    } else {
      toast.error(result.error || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    const result = await rejectRequest(requestId);
    setProcessingId(null);
    setConfirmAction(null);
    
    if (result.success) {
      toast.success(language === 'ar' ? 'تم رفض الطلب' : 'Request rejected');
    } else {
      toast.error(result.error || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] p-4 md:p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-logo-orange/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/team-dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowIcon size={20} />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <UserPlus className="w-7 h-7 text-logo-orange" />
              {language === 'ar' ? 'طلبات الانضمام' : 'Join Requests'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' 
                ? 'راجع وأدر طلبات الانضمام لفريقك' 
                : 'Review and manage join requests for your team'}
            </p>
          </div>
        </div>

        {/* Pending Count Badge */}
        {pendingRequests.length > 0 && (
          <div className="mb-6">
            <Badge className="bg-logo-orange/20 text-logo-orange border-logo-orange/30 px-3 py-1">
              <Clock className="w-4 h-4 me-2" />
              {language === 'ar' 
                ? `${pendingRequests.length} طلبات معلقة` 
                : `${pendingRequests.length} pending requests`}
            </Badge>
          </div>
        )}

        {/* Requests List */}
        {pendingRequests.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 p-12 text-center">
            <Inbox className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {language === 'ar' ? 'لا توجد طلبات معلقة' : 'No pending requests'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'عندما يطلب أحد الانضمام لفريقك، ستظهر الطلبات هنا' 
                : 'When someone requests to join your team, requests will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const roleInfo = getRoleInfo(request.requestedRole);
              const RoleIcon = roleInfo.icon;
              const isProcessing = processingId === request.id;

              return (
                <div
                  key={request.id}
                  className={cn(
                    "bg-card rounded-xl border border-border/50 p-5 transition-all duration-200",
                    isProcessing && "opacity-50 pointer-events-none"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-logo-orange/20 to-logo-yellow/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-logo-orange" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {request.userName}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {request.userEmail}
                        </p>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                        roleInfo.color
                      )}>
                        <RoleIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {language === 'ar' ? roleInfo.nameAr : roleInfo.nameEn}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(request.created_at)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                        onClick={() => setConfirmAction({ id: request.id, action: 'accept' })}
                        disabled={isProcessing}
                      >
                        <Check className="w-4 h-4 me-1" />
                        {language === 'ar' ? 'قبول' : 'Accept'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => setConfirmAction({ id: request.id, action: 'reject' })}
                        disabled={isProcessing}
                      >
                        <X className="w-4 h-4 me-1" />
                        {language === 'ar' ? 'رفض' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 bg-muted/20 rounded-xl border border-border/30">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-logo-orange" />
            {language === 'ar' ? 'معلومات مهمة' : 'Important Information'}
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>
              {language === 'ar' 
                ? 'عند قبول طلب، سينضم العضو تلقائياً لفريقك بالدور المحدد' 
                : 'When accepting a request, the member will automatically join your team with the selected role'}
            </li>
            <li>
              {language === 'ar' 
                ? 'يمكنك تغيير دور العضو لاحقاً من لوحة تحكم الفريق' 
                : 'You can change the member\'s role later from the team dashboard'}
            </li>
            <li>
              {language === 'ar' 
                ? 'سيتلقى المستخدم إشعاراً بقرارك' 
                : 'The user will receive a notification of your decision'}
            </li>
          </ul>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === 'accept' 
                ? (language === 'ar' ? 'تأكيد قبول الطلب' : 'Confirm Accept Request')
                : (language === 'ar' ? 'تأكيد رفض الطلب' : 'Confirm Reject Request')
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === 'accept' 
                ? (language === 'ar' 
                    ? 'سينضم هذا العضو لفريقك بالدور المحدد. هل أنت متأكد؟' 
                    : 'This member will join your team with the selected role. Are you sure?')
                : (language === 'ar' 
                    ? 'سيتم رفض هذا الطلب ولن يتمكن المستخدم من الانضمام. هل أنت متأكد؟' 
                    : 'This request will be rejected and the user won\'t be able to join. Are you sure?')
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                confirmAction?.action === 'accept' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              )}
              onClick={() => {
                if (confirmAction?.action === 'accept') {
                  handleAccept(confirmAction.id);
                } else if (confirmAction?.action === 'reject') {
                  handleReject(confirmAction.id);
                }
              }}
            >
              {confirmAction?.action === 'accept' 
                ? (language === 'ar' ? 'قبول' : 'Accept')
                : (language === 'ar' ? 'رفض' : 'Reject')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JoinRequestsPage;