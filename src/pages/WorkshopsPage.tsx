import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { useWorkshops, Workshop, WorkshopCategory, WorkshopLevel } from '@/contexts/WorkshopsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Clock, 
  Calendar, 
  User, 
  Code, 
  Cpu, 
  Wrench, 
  Palette, 
  Target,
  BookOpen,
  Link as LinkIcon,
  FileText,
  ExternalLink,
  CalendarPlus,
  Zap,
  Loader2,
  Lock,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type WorkshopCategoryFilter = 'all' | WorkshopCategory;

const WorkshopsPage = () => {
  const { t, language, direction } = useLanguage();
  const { user } = useAuth();
  const { isAdmin, isJudge } = useRole();
  const navigate = useNavigate();
  const { workshops, loading } = useWorkshops();
  const [activeCategory, setActiveCategory] = useState<WorkshopCategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

  const ArrowIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  // Check if user can access workshops (team must be approved or final_approved, or user is admin/judge)
  const canAccessWorkshops = user?.teamStatus === 'approved' || user?.teamStatus === 'final_approved' || isAdmin || isJudge;

  // Show access denied page if user doesn't have permission
  if (!canAccessWorkshops) {
    return (
      <div className="min-h-[calc(100vh-5rem)] py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-logo-orange/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-2xl mx-auto relative z-10 text-center py-20">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {language === 'ar' ? 'صفحة غير متاحة' : 'Page Not Available'}
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {language === 'ar' 
              ? 'صفحة ورش العمل متاحة فقط للفرق المقبولة (قبول مبدئي أو نهائي). يرجى الانتظار حتى يتم مراجعة فريقك.'
              : 'Workshops page is only available for accepted teams (Initial or Final acceptance). Please wait until your team is reviewed.'}
          </p>
          <Button 
            variant="hero" 
            onClick={() => navigate('/team-dashboard')}
          >
            <ArrowIcon size={18} />
            {language === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
          </Button>
        </div>
      </div>
    );
  }

  const categories: { key: WorkshopCategoryFilter; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: t('workshops.all'), icon: BookOpen },
    { key: 'programming', label: t('workshops.programming'), icon: Code },
    { key: 'electronics', label: t('workshops.electronics'), icon: Cpu },
    { key: 'mechanics', label: t('workshops.mechanics'), icon: Wrench },
    { key: 'design', label: t('workshops.design'), icon: Palette },
    { key: 'competition', label: t('workshops.competition'), icon: Target },
  ];

  const getLevelBadge = (level: WorkshopLevel) => {
    const config = {
      beginner: { label: t('workshops.beginner'), className: 'bg-green-500/20 text-green-600 border-green-500/30' },
      intermediate: { label: t('workshops.intermediate'), className: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30' },
      advanced: { label: t('workshops.advanced'), className: 'bg-red-500/20 text-red-600 border-red-500/30' },
    };
    return config[level];
  };

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
    const labels: Record<WorkshopCategory, string> = {
      programming: t('workshops.programming'),
      electronics: t('workshops.electronics'),
      mechanics: t('workshops.mechanics'),
      design: t('workshops.design'),
      competition: t('workshops.competition'),
    };
    return labels[category];
  };

  const getWorkshopTitle = (workshop: Workshop) => {
    return language === 'ar' ? workshop.title : workshop.titleEn;
  };

  const filteredWorkshops = workshops.filter(workshop => {
    const matchesCategory = activeCategory === 'all' || workshop.category === activeCategory;
    const title = getWorkshopTitle(workshop).toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });


  return (
    <div className="py-12">
      {/* Hero */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-logo-orange/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-logo-yellow/5 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-logo-red/8 rounded-full blur-3xl" />
        </div>

        {/* Decorative floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-8 md:left-16 opacity-20 animate-[spin_20s_linear_infinite]">
            <Cpu className="w-16 h-16 md:w-24 md:h-24 text-logo-orange" />
          </div>
          <div className="absolute top-16 right-4 md:right-12 opacity-15 animate-[spin_25s_linear_infinite_reverse]">
            <div className="relative">
              <Cpu className="w-20 h-20 md:w-32 md:h-32 text-logo-yellow" />
              <Cpu className="absolute -bottom-4 -left-4 w-10 h-10 md:w-16 md:h-16 text-logo-orange animate-[spin_15s_linear_infinite]" />
            </div>
          </div>
          <div className="absolute bottom-32 left-12 md:left-24 opacity-20 rotate-[-20deg]">
            <Wrench className="w-12 h-12 md:w-20 md:h-20 text-logo-red" />
          </div>
          <div className="absolute bottom-24 left-1/3 opacity-15 animate-[spin_30s_linear_infinite]">
            <Target className="w-14 h-14 md:w-20 md:h-20 text-logo-yellow" />
          </div>
          <div className="absolute top-1/2 right-8 md:right-20 opacity-20">
            <Zap className="w-10 h-10 md:w-16 md:h-16 text-logo-orange" />
          </div>
          <div className="absolute bottom-40 right-16 md:right-32 opacity-15 animate-[spin_18s_linear_infinite_reverse]">
            <Cpu className="w-12 h-12 md:w-18 md:h-18 text-logo-red" />
          </div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-animated mb-4">
              {t('workshops.title')}
            </h1>
            <p className="text-xl text-white/70">
              {t('workshops.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Workshops */}
      <section className="py-16">
        <div className="container mx-auto">
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.key}
                  variant={activeCategory === cat.key ? 'hero' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat.key)}
                  className="gap-2"
                >
                  <cat.icon size={16} />
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder={t('workshops.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10"
              />
            </div>
          </div>

          {loading ? (
            /* Loading State */
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredWorkshops.length > 0 ? (
            /* Workshop Cards Grid */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkshops.map((workshop) => {
                const CategoryIcon = getCategoryIcon(workshop.category);
                const levelConfig = getLevelBadge(workshop.level);

                return (
                  <div
                    key={workshop.id}
                    className="bg-card rounded-2xl shadow-card border border-border overflow-hidden hover:shadow-card-hover transition-all group"
                  >
                    {/* Card Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CategoryIcon className="text-white" size={24} />
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                            {getCategoryLabel(workshop.category)}
                          </Badge>
                          <Badge variant="outline" className={cn('text-xs', levelConfig.className)}>
                            {levelConfig.label}
                          </Badge>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                        {getWorkshopTitle(workshop)}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {language === 'ar' ? workshop.description : workshop.descriptionEn}
                      </p>
                    </div>

                    {/* Card Meta */}
                    <div className="px-6 pb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={16} />
                        <span>{language === 'ar' ? workshop.duration : workshop.durationEn}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={16} />
                        <span>{language === 'ar' ? workshop.date : workshop.dateEn}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User size={16} />
                        <span>{language === 'ar' ? workshop.presenter : workshop.presenterEn}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-6 pt-4 border-t border-border flex gap-3">
                      <Button
                        variant="hero"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedWorkshop(workshop)}
                      >
                        {t('workshops.details')}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <CalendarPlus size={16} />
                        <span className="hidden sm:inline">{t('workshops.addToCalendar')}</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <BookOpen className="mx-auto text-muted-foreground mb-4" size={64} />
              <p className="text-xl text-muted-foreground">{t('workshops.noWorkshops')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Workshop Details Dialog */}
      <Dialog open={!!selectedWorkshop} onOpenChange={() => setSelectedWorkshop(null)}>
        {selectedWorkshop && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gradient">
                {getWorkshopTitle(selectedWorkshop)}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Description */}
              <div>
                <p className="text-muted-foreground">
                  {language === 'ar' ? selectedWorkshop.description : selectedWorkshop.descriptionEn}
                </p>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="text-primary" size={18} />
                  <div>
                    <p className="text-muted-foreground">{t('workshops.duration')}</p>
                    <p className="font-medium">{language === 'ar' ? selectedWorkshop.duration : selectedWorkshop.durationEn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-primary" size={18} />
                  <div>
                    <p className="text-muted-foreground">{t('workshops.date')}</p>
                    <p className="font-medium">{language === 'ar' ? selectedWorkshop.date : selectedWorkshop.dateEn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="text-primary" size={18} />
                  <div>
                    <p className="text-muted-foreground">{t('workshops.presenter')}</p>
                    <p className="font-medium">{language === 'ar' ? selectedWorkshop.presenter : selectedWorkshop.presenterEn}</p>
                  </div>
                </div>
              </div>

              {/* What You'll Learn */}
              {selectedWorkshop.whatYouLearn.length > 0 && (
                <div>
                  <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <BookOpen size={18} className="text-primary" />
                    {t('workshops.whatYouLearn')}
                  </h4>
                  <ul className="space-y-2">
                    {(language === 'ar' ? selectedWorkshop.whatYouLearn : selectedWorkshop.whatYouLearnEn).map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {selectedWorkshop.requirements.length > 0 && (
                <div>
                  <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-primary" />
                    {t('workshops.requirements')}
                  </h4>
                  <ul className="space-y-2">
                    {(language === 'ar' ? selectedWorkshop.requirements : selectedWorkshop.requirementsEn).map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Join Link */}
              <div>
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <LinkIcon size={18} className="text-primary" />
                  {t('workshops.joinLink')}
                </h4>
                {selectedWorkshop.joinLink ? (
                  <Button asChild variant="hero" className="w-full gap-2">
                    <a href={selectedWorkshop.joinLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={18} />
                      {language === 'ar' ? 'انضم للورشة' : 'Join Workshop'}
                    </a>
                  </Button>
                ) : (
                  <p className="text-muted-foreground italic">{t('workshops.notAvailable')}</p>
                )}
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  {t('workshops.resources')}
                </h4>
                {selectedWorkshop.resources.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedWorkshop.resources.map((resource) => (
                      <Button key={resource.id} asChild variant="outline" size="sm" className="gap-2">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <FileText size={14} />
                          {language === 'ar' ? resource.name : resource.nameEn}
                        </a>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">{t('workshops.notAvailable')}</p>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default WorkshopsPage;
