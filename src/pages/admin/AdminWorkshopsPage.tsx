import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWorkshops, Workshop, WorkshopCategory, WorkshopLevel, WorkshopResource } from '@/contexts/WorkshopsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Shield, 
  ArrowRight, 
  Plus, 
  Pencil, 
  Trash2, 
  Search,
  Code,
  Cpu,
  Wrench,
  Palette,
  Target,
  BookOpen,
  FileText,
  FileCode,
  Presentation,
  File,
  X,
  Upload,
  Link as LinkIcon
} from 'lucide-react';

const AdminWorkshopsPage = () => {
  const { language } = useLanguage();
  const { workshops, addWorkshop, updateWorkshop, deleteWorkshop, addResource, removeResource } = useWorkshops();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Workshop>>({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    category: 'programming',
    level: 'beginner',
    duration: '',
    durationEn: '',
    date: '',
    dateEn: '',
    presenter: '',
    presenterEn: '',
    joinLink: '',
    whatYouLearn: [],
    whatYouLearnEn: [],
    requirements: [],
    requirementsEn: [],
    resources: [],
  });

  // Resource form state
  const [resourceForm, setResourceForm] = useState<Omit<WorkshopResource, 'id'>>({
    name: '',
    nameEn: '',
    url: '',
    type: 'document',
    isFile: false,
    fileName: '',
    fileSize: 0,
  });
  
  const [uploadMode, setUploadMode] = useState<'link' | 'file'>('link');

  const getCategoryIcon = (category: WorkshopCategory) => {
    const icons = {
      programming: Code,
      electronics: Cpu,
      mechanics: Wrench,
      design: Palette,
      competition: Target,
    };
    return icons[category];
  };

  const getCategoryLabel = (category: WorkshopCategory) => {
    const labels: Record<WorkshopCategory, { ar: string; en: string }> = {
      programming: { ar: 'برمجة', en: 'Programming' },
      electronics: { ar: 'إلكترونيات', en: 'Electronics' },
      mechanics: { ar: 'ميكانيكا', en: 'Mechanics' },
      design: { ar: 'تصميم', en: 'Design' },
      competition: { ar: 'منافسة', en: 'Competition' },
    };
    return language === 'ar' ? labels[category].ar : labels[category].en;
  };

  const getLevelLabel = (level: WorkshopLevel) => {
    const labels: Record<WorkshopLevel, { ar: string; en: string }> = {
      beginner: { ar: 'مبتدئ', en: 'Beginner' },
      intermediate: { ar: 'متوسط', en: 'Intermediate' },
      advanced: { ar: 'متقدم', en: 'Advanced' },
    };
    return language === 'ar' ? labels[level].ar : labels[level].en;
  };

  const getLevelBadgeClass = (level: WorkshopLevel) => {
    const classes = {
      beginner: 'bg-green-500/20 text-green-600 border-green-500/30',
      intermediate: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
      advanced: 'bg-red-500/20 text-red-600 border-red-500/30',
    };
    return classes[level];
  };

  const getResourceIcon = (type: WorkshopResource['type']) => {
    const icons = {
      presentation: Presentation,
      code: FileCode,
      document: FileText,
      other: File,
    };
    return icons[type];
  };

  const filteredWorkshops = workshops.filter((workshop) => {
    const title = language === 'ar' ? workshop.title : workshop.titleEn;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const resetForm = () => {
    setFormData({
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      category: 'programming',
      level: 'beginner',
      duration: '',
      durationEn: '',
      date: '',
      dateEn: '',
      presenter: '',
      presenterEn: '',
      joinLink: '',
      whatYouLearn: [],
      whatYouLearnEn: [],
      requirements: [],
      requirementsEn: [],
      resources: [],
    });
  };

  const resetResourceForm = () => {
    setResourceForm({
      name: '',
      nameEn: '',
      url: '',
      type: 'document',
    });
  };

  const handleAdd = () => {
    addWorkshop({
      title: formData.title || '',
      titleEn: formData.titleEn || '',
      description: formData.description || '',
      descriptionEn: formData.descriptionEn || '',
      category: formData.category as WorkshopCategory || 'programming',
      level: formData.level as WorkshopLevel || 'beginner',
      duration: formData.duration || '',
      durationEn: formData.durationEn || '',
      date: formData.date || '',
      dateEn: formData.dateEn || '',
      presenter: formData.presenter || '',
      presenterEn: formData.presenterEn || '',
      whatYouLearn: formData.whatYouLearn || [],
      whatYouLearnEn: formData.whatYouLearnEn || [],
      requirements: formData.requirements || [],
      requirementsEn: formData.requirementsEn || [],
      joinLink: formData.joinLink || null,
      resources: formData.resources || [],
    });
    setIsAddModalOpen(false);
    resetForm();
    toast.success(language === 'ar' ? 'تمت إضافة الورشة بنجاح' : 'Workshop added successfully');
  };

  const handleEdit = () => {
    if (!selectedWorkshop) return;
    updateWorkshop(selectedWorkshop.id, {
      title: formData.title,
      titleEn: formData.titleEn,
      description: formData.description,
      descriptionEn: formData.descriptionEn,
      category: formData.category as WorkshopCategory,
      level: formData.level as WorkshopLevel,
      duration: formData.duration,
      durationEn: formData.durationEn,
      date: formData.date,
      dateEn: formData.dateEn,
      presenter: formData.presenter,
      presenterEn: formData.presenterEn,
      whatYouLearn: formData.whatYouLearn,
      whatYouLearnEn: formData.whatYouLearnEn,
      requirements: formData.requirements,
      requirementsEn: formData.requirementsEn,
      joinLink: formData.joinLink || null,
    });
    setIsEditModalOpen(false);
    setSelectedWorkshop(null);
    resetForm();
    toast.success(language === 'ar' ? 'تم تحديث الورشة بنجاح' : 'Workshop updated successfully');
  };

  const handleDelete = () => {
    if (!selectedWorkshop) return;
    deleteWorkshop(selectedWorkshop.id);
    setIsDeleteModalOpen(false);
    setSelectedWorkshop(null);
    toast.success(language === 'ar' ? 'تم حذف الورشة بنجاح' : 'Workshop deleted successfully');
  };

  const handleAddResource = () => {
    if (!selectedWorkshop || !resourceForm.name || !resourceForm.url) return;
    addResource(selectedWorkshop.id, resourceForm);
    resetResourceForm();
    toast.success(language === 'ar' ? 'تمت إضافة المورد بنجاح' : 'Resource added successfully');
  };

  const handleRemoveResource = (resourceId: string) => {
    if (!selectedWorkshop) return;
    removeResource(selectedWorkshop.id, resourceId);
    toast.success(language === 'ar' ? 'تم حذف المورد بنجاح' : 'Resource removed successfully');
  };

  const openEditModal = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setFormData({
      title: workshop.title,
      titleEn: workshop.titleEn,
      description: workshop.description,
      descriptionEn: workshop.descriptionEn,
      category: workshop.category,
      level: workshop.level,
      duration: workshop.duration,
      durationEn: workshop.durationEn,
      date: workshop.date,
      dateEn: workshop.dateEn,
      presenter: workshop.presenter,
      presenterEn: workshop.presenterEn,
      whatYouLearn: workshop.whatYouLearn,
      whatYouLearnEn: workshop.whatYouLearnEn,
      requirements: workshop.requirements,
      requirementsEn: workshop.requirementsEn,
      joinLink: workshop.joinLink || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setIsDeleteModalOpen(true);
  };

  const openResourceModal = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    resetResourceForm();
    setIsResourceModalOpen(true);
  };

  const workshopFormContent = (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
          <Input
            value={formData.titleEn}
            onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            dir="rtl"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
          <Textarea
            value={formData.descriptionEn}
            onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
            dir="ltr"
            rows={3}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'الفئة' : 'Category'}</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as WorkshopCategory }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="programming">{language === 'ar' ? 'برمجة' : 'Programming'}</SelectItem>
              <SelectItem value="electronics">{language === 'ar' ? 'إلكترونيات' : 'Electronics'}</SelectItem>
              <SelectItem value="mechanics">{language === 'ar' ? 'ميكانيكا' : 'Mechanics'}</SelectItem>
              <SelectItem value="design">{language === 'ar' ? 'تصميم' : 'Design'}</SelectItem>
              <SelectItem value="competition">{language === 'ar' ? 'منافسة' : 'Competition'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'المستوى' : 'Level'}</Label>
          <Select
            value={formData.level}
            onValueChange={(value) => setFormData(prev => ({ ...prev, level: value as WorkshopLevel }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">{language === 'ar' ? 'مبتدئ' : 'Beginner'}</SelectItem>
              <SelectItem value="intermediate">{language === 'ar' ? 'متوسط' : 'Intermediate'}</SelectItem>
              <SelectItem value="advanced">{language === 'ar' ? 'متقدم' : 'Advanced'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'المدة (عربي)' : 'Duration (Arabic)'}</Label>
          <Input
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'المدة (إنجليزي)' : 'Duration (English)'}</Label>
          <Input
            value={formData.durationEn}
            onChange={(e) => setFormData(prev => ({ ...prev, durationEn: e.target.value }))}
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'التاريخ (عربي)' : 'Date (Arabic)'}</Label>
          <Input
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'التاريخ (إنجليزي)' : 'Date (English)'}</Label>
          <Input
            value={formData.dateEn}
            onChange={(e) => setFormData(prev => ({ ...prev, dateEn: e.target.value }))}
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'المقدم (عربي)' : 'Presenter (Arabic)'}</Label>
          <Input
            value={formData.presenter}
            onChange={(e) => setFormData(prev => ({ ...prev, presenter: e.target.value }))}
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'المقدم (إنجليزي)' : 'Presenter (English)'}</Label>
          <Input
            value={formData.presenterEn}
            onChange={(e) => setFormData(prev => ({ ...prev, presenterEn: e.target.value }))}
            dir="ltr"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{language === 'ar' ? 'رابط الانضمام' : 'Join Link'}</Label>
        <Input
          value={formData.joinLink || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, joinLink: e.target.value }))}
          placeholder="https://"
          dir="ltr"
        />
      </div>

      {/* What You'll Learn */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'ماذا ستتعلم (عربي)' : 'What You Will Learn (Arabic)'}</Label>
          <Textarea
            value={(formData.whatYouLearn || []).join('\n')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              whatYouLearn: e.target.value.split('\n').filter(item => item.trim()) 
            }))}
            dir="rtl"
            rows={4}
            placeholder={language === 'ar' ? 'أدخل كل عنصر في سطر منفصل' : 'Enter each item on a new line'}
          />
        </div>
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'ماذا ستتعلم (إنجليزي)' : 'What You Will Learn (English)'}</Label>
          <Textarea
            value={(formData.whatYouLearnEn || []).join('\n')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              whatYouLearnEn: e.target.value.split('\n').filter(item => item.trim()) 
            }))}
            dir="ltr"
            rows={4}
            placeholder="Enter each item on a new line"
          />
        </div>
      </div>

      {/* Requirements */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'المتطلبات (عربي)' : 'Requirements (Arabic)'}</Label>
          <Textarea
            value={(formData.requirements || []).join('\n')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              requirements: e.target.value.split('\n').filter(item => item.trim()) 
            }))}
            dir="rtl"
            rows={3}
            placeholder={language === 'ar' ? 'أدخل كل متطلب في سطر منفصل' : 'Enter each requirement on a new line'}
          />
        </div>
        <div className="space-y-2">
          <Label>{language === 'ar' ? 'المتطلبات (إنجليزي)' : 'Requirements (English)'}</Label>
          <Textarea
            value={(formData.requirementsEn || []).join('\n')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              requirementsEn: e.target.value.split('\n').filter(item => item.trim()) 
            }))}
            dir="ltr"
            rows={3}
            placeholder="Enter each requirement on a new line"
          />
        </div>
      </div>
    </div>
  );

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
          {language === 'ar' ? 'إدارة ورش العمل' : 'Manage Workshops'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إضافة وتعديل وحذف ورش العمل والموارد' : 'Add, edit, and delete workshops and resources'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder={language === 'ar' ? 'البحث عن ورشة...' : 'Search workshops...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10"
          />
        </div>
        <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="gap-2">
          <Plus size={18} />
          {language === 'ar' ? 'إضافة ورشة' : 'Add Workshop'}
        </Button>
      </div>

      {/* Workshops Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {language === 'ar' ? 'قائمة ورش العمل' : 'Workshops List'}
            <Badge variant="secondary" className="ms-2">{workshops.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'الورشة' : 'Workshop'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الفئة' : 'Category'}</TableHead>
                  <TableHead>{language === 'ar' ? 'المستوى' : 'Level'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الموارد' : 'Resources'}</TableHead>
                  <TableHead className="text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkshops.map((workshop) => {
                  const CategoryIcon = getCategoryIcon(workshop.category);
                  return (
                    <TableRow key={workshop.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <CategoryIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{language === 'ar' ? workshop.title : workshop.titleEn}</p>
                            <p className="text-sm text-muted-foreground">
                              {language === 'ar' ? workshop.date : workshop.dateEn}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {getCategoryLabel(workshop.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getLevelBadgeClass(workshop.level)}>
                          {getLevelLabel(workshop.level)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openResourceModal(workshop)}
                          className="gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          {workshop.resources.length}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(workshop)}
                          >
                            <Pencil className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteModal(workshop)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Workshop Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'إضافة ورشة عمل جديدة' : 'Add New Workshop'}
            </DialogTitle>
          </DialogHeader>
          {workshopFormContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleAdd}>
              {language === 'ar' ? 'إضافة' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workshop Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'تعديل الورشة' : 'Edit Workshop'}
            </DialogTitle>
          </DialogHeader>
          {workshopFormContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleEdit}>
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">
              {language === 'ar' ? 'حذف الورشة' : 'Delete Workshop'}
            </DialogTitle>
          </DialogHeader>
          <p className="py-4">
            {language === 'ar' 
              ? `هل أنت متأكد من حذف ورشة "${selectedWorkshop?.title}"؟`
              : `Are you sure you want to delete "${selectedWorkshop?.titleEn}"?`
            }
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {language === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resources Management Modal */}
      <Dialog open={isResourceModalOpen} onOpenChange={setIsResourceModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'إدارة الموارد' : 'Manage Resources'}
              {selectedWorkshop && (
                <span className="text-sm font-normal text-muted-foreground block mt-1">
                  {language === 'ar' ? selectedWorkshop.title : selectedWorkshop.titleEn}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Current Resources */}
            <div>
              <h4 className="font-medium mb-3">
                {language === 'ar' ? 'الموارد الحالية' : 'Current Resources'}
              </h4>
              {selectedWorkshop && selectedWorkshop.resources.length > 0 ? (
                <div className="space-y-2">
                  {selectedWorkshop.resources.map((resource) => {
                    const ResourceIcon = getResourceIcon(resource.type);
                    return (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <ResourceIcon className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">
                              {language === 'ar' ? resource.name : resource.nameEn}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {resource.isFile ? (
                                <span className="flex items-center gap-1">
                                  <Upload className="w-3 h-3" />
                                  {resource.fileName} ({((resource.fileSize || 0) / 1024).toFixed(1)} KB)
                                </span>
                              ) : (
                                resource.url
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveResource(resource.id)}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'لا توجد موارد' : 'No resources yet'}
                </p>
              )}
            </div>

            {/* Add New Resource */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">
                {language === 'ar' ? 'إضافة مورد جديد' : 'Add New Resource'}
              </h4>
              
              {/* Upload Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={uploadMode === 'link' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMode('link')}
                  className="gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  {language === 'ar' ? 'رابط' : 'Link'}
                </Button>
                <Button
                  type="button"
                  variant={uploadMode === 'file' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMode('file')}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {language === 'ar' ? 'تحميل ملف' : 'Upload File'}
                </Button>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                    <Input
                      value={resourceForm.name}
                      onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                      dir="rtl"
                      placeholder={language === 'ar' ? 'ملف العرض' : 'Presentation file'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                    <Input
                      value={resourceForm.nameEn}
                      onChange={(e) => setResourceForm({ ...resourceForm, nameEn: e.target.value })}
                      dir="ltr"
                      placeholder="Presentation"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'النوع' : 'Type'}</Label>
                    <Select
                      value={resourceForm.type}
                      onValueChange={(value) => setResourceForm({ ...resourceForm, type: value as WorkshopResource['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presentation">
                          {language === 'ar' ? 'عرض تقديمي' : 'Presentation'}
                        </SelectItem>
                        <SelectItem value="code">
                          {language === 'ar' ? 'كود مصدري' : 'Source Code'}
                        </SelectItem>
                        <SelectItem value="document">
                          {language === 'ar' ? 'مستند' : 'Document'}
                        </SelectItem>
                        <SelectItem value="other">
                          {language === 'ar' ? 'أخرى' : 'Other'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {uploadMode === 'link' ? (
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الرابط' : 'URL'}</Label>
                      <Input
                        value={resourceForm.url}
                        onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value, isFile: false, fileName: '', fileSize: 0 })}
                        placeholder="https://..."
                        dir="ltr"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'تحميل ملف' : 'Upload File'}</Label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt,.md"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Create a mock URL for the file (in real app this would upload to storage)
                              const mockUrl = URL.createObjectURL(file);
                              setResourceForm({ 
                                ...resourceForm, 
                                url: mockUrl,
                                isFile: true,
                                fileName: file.name,
                                fileSize: file.size
                              });
                              toast.success(language === 'ar' ? `تم تحميل: ${file.name}` : `Uploaded: ${file.name}`);
                            }
                          }}
                          className="cursor-pointer"
                        />
                      </div>
                      {resourceForm.isFile && resourceForm.fileName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📎 {resourceForm.fileName} ({(resourceForm.fileSize! / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleAddResource} 
                  className="w-full gap-2"
                  disabled={!resourceForm.name || !resourceForm.url}
                >
                  <Plus size={18} />
                  {language === 'ar' ? 'إضافة المورد' : 'Add Resource'}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResourceModalOpen(false)}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWorkshopsPage;
