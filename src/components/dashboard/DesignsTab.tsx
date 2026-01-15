import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Upload,
  FileText,
  Image,
  File,
  Trash2,
  Download,
  Eye,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DesignFile {
  id: string;
  name: string;
  type: 'image' | 'document' | 'other';
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'pending' | 'approved' | 'revision_needed';
  url: string;
}

interface DesignsTabProps {
  isAdmin?: boolean;
  canEdit?: boolean;
  isLocked?: boolean;
  teamId: string;
}

const DesignsTab = ({ isAdmin = false, canEdit = false, isLocked = false, teamId }: DesignsTabProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [designFiles, setDesignFiles] = useState<DesignFile[]>([]);

  // Fetch design files from storage
  useEffect(() => {
    const fetchDesignFiles = async () => {
      if (!teamId) return;
      
      try {
        const { data: files, error } = await supabase.storage
          .from('cvs')
          .list(`designs/${teamId}`, {
            limit: 100,
            offset: 0,
          });

        if (error) throw error;

        if (files && files.length > 0) {
          const mappedFiles: DesignFile[] = await Promise.all(
            files.map(async (file) => {
              const { data: urlData } = supabase.storage
                .from('cvs')
                .getPublicUrl(`designs/${teamId}/${file.name}`);

              return {
                id: file.id || file.name,
                name: file.name,
                type: file.metadata?.mimetype?.startsWith('image/') ? 'image' as const : 'document' as const,
                size: file.metadata?.size ? `${(file.metadata.size / 1024).toFixed(1)} KB` : 'Unknown',
                uploadedAt: file.created_at ? new Date(file.created_at).toISOString().split('T')[0] : 'Unknown',
                uploadedBy: 'Team',
                status: 'pending' as const,
                url: urlData.publicUrl,
              };
            })
          );
          setDesignFiles(mappedFiles);
        }
      } catch (error) {
        console.error('Error fetching design files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesignFiles();
  }, [teamId]);

  const getFileIcon = (type: DesignFile['type']) => {
    switch (type) {
      case 'image': return Image;
      case 'document': return FileText;
      default: return File;
    }
  };

  const getStatusConfig = (status: DesignFile['status']) => {
    switch (status) {
      case 'approved':
        return {
          label: language === 'ar' ? 'مقبول' : 'Approved',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          icon: CheckCircle2,
        };
      case 'revision_needed':
        return {
          label: language === 'ar' ? 'يحتاج مراجعة' : 'Needs Revision',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          icon: AlertCircle,
        };
      case 'pending':
      default:
        return {
          label: language === 'ar' ? 'قيد المراجعة' : 'Pending Review',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/30',
          icon: Clock,
        };
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error(language === 'ar' ? 'يرجى اختيار ملف' : 'Please select a file');
      return;
    }

    setUploading(true);
    
    try {
      const uploadedFiles: DesignFile[] = [];

      for (const file of Array.from(selectedFiles)) {
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `designs/${teamId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('cvs')
          .getPublicUrl(filePath);

        uploadedFiles.push({
          id: `new-${Date.now()}`,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          size: `${(file.size / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: user?.email || 'Unknown',
          status: 'pending' as const,
          url: urlData.publicUrl,
        });
      }

      setDesignFiles(prev => [...uploadedFiles, ...prev]);
      setUploadDialogOpen(false);
      setSelectedFiles(null);
      toast.success(language === 'ar' ? 'تم رفع الملفات بنجاح!' : 'Files uploaded successfully!');
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء رفع الملفات' : 'Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('cvs')
        .remove([`designs/${teamId}/${fileName}`]);

      if (error) throw error;

      setDesignFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success(language === 'ar' ? 'تم حذف الملف' : 'File deleted');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء حذف الملف' : 'Error deleting file');
    }
  };

  const handleStatusChange = (fileId: string, newStatus: DesignFile['status']) => {
    setDesignFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: newStatus } : f
    ));
    toast.success(language === 'ar' ? 'تم تحديث الحالة' : 'Status updated');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {language === 'ar' ? 'تصاميم الروبوت' : 'Robot Designs'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'ارفع تصاميم ونماذج الروبوت الخاص بفريقك'
                  : 'Upload your team robot designs and models'}
              </p>
            </div>
          </div>

          {/* Upload Button */}
          {(canEdit || isAdmin) && !isLocked && (
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Plus className="w-4 h-4 me-2" />
                  {language === 'ar' ? 'رفع تصميم' : 'Upload Design'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {language === 'ar' ? 'رفع تصميم جديد' : 'Upload New Design'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'اختر الملفات' : 'Select Files'}</Label>
                    <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
                      <Input
                        type="file"
                        multiple
                        accept=".stl,.obj,.step,.stp,.iges,.igs,.png,.jpg,.jpeg,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === 'ar' 
                            ? 'اضغط لاختيار الملفات أو اسحبها هنا'
                            : 'Click to select files or drag them here'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          STL, OBJ, STEP, PNG, JPG, PDF
                        </p>
                      </label>
                    </div>
                    {selectedFiles && selectedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {Array.from(selectedFiles).map((file, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm truncate flex-1">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button 
                    onClick={handleUpload} 
                    disabled={!selectedFiles || uploading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    {uploading 
                      ? (language === 'ar' ? 'جاري الرفع...' : 'Uploading...') 
                      : (language === 'ar' ? 'رفع' : 'Upload')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-muted/20 rounded-xl text-center">
            <p className="text-2xl font-bold text-foreground">{designFiles.length}</p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'إجمالي الملفات' : 'Total Files'}
            </p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-xl text-center">
            <p className="text-2xl font-bold text-green-500">
              {designFiles.filter(f => f.status === 'approved').length}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'مقبول' : 'Approved'}
            </p>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-xl text-center">
            <p className="text-2xl font-bold text-yellow-500">
              {designFiles.filter(f => f.status === 'pending').length}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'قيد المراجعة' : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50">
        <h3 className="text-md font-semibold text-foreground mb-4">
          {language === 'ar' ? 'الملفات المرفوعة' : 'Uploaded Files'}
        </h3>

        {designFiles.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {language === 'ar' ? 'لا توجد ملفات مرفوعة بعد' : 'No files uploaded yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {designFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              const statusConfig = getStatusConfig(file.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div 
                  key={file.id}
                  className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                    <FileIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground truncate">
                        {file.name}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs border-0", statusConfig.bgColor, statusConfig.color)}
                      >
                        <StatusIcon className="w-3 h-3 me-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.uploadedAt}</span>
                      <span>•</span>
                      <span>{file.uploadedBy}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Admin status controls */}
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusChange(file.id, 'approved')}
                          className={cn(
                            "h-8 w-8",
                            file.status === 'approved' && "bg-green-500/20 text-green-500"
                          )}
                          title={language === 'ar' ? 'قبول' : 'Approve'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusChange(file.id, 'revision_needed')}
                          className={cn(
                            "h-8 w-8",
                            file.status === 'revision_needed' && "bg-yellow-500/20 text-yellow-500"
                          )}
                          title={language === 'ar' ? 'يحتاج مراجعة' : 'Needs Revision'}
                        >
                          <AlertCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title={language === 'ar' ? 'معاينة' : 'Preview'}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title={language === 'ar' ? 'تحميل' : 'Download'}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {(canEdit || isAdmin) && !isLocked && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(file.id, file.name)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50">
        <h3 className="text-md font-semibold text-foreground mb-3">
          {language === 'ar' ? 'إرشادات الرفع' : 'Upload Guidelines'}
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            {language === 'ar' 
              ? 'صيغ الملفات المدعومة: STL, OBJ, STEP, IGES, PNG, JPG, PDF'
              : 'Supported formats: STL, OBJ, STEP, IGES, PNG, JPG, PDF'}
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            {language === 'ar' 
              ? 'الحد الأقصى لحجم الملف: 50 ميجابايت'
              : 'Maximum file size: 50MB'}
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            {language === 'ar' 
              ? 'تأكد من أن التصميم يتوافق مع قوانين المسابقة'
              : 'Ensure designs comply with competition rules'}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DesignsTab;
