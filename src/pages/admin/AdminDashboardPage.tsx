import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileDown, Settings, Shield, ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAdminStats } from '@/hooks/useAdminData';

const AdminDashboardPage = () => {
  const { language } = useLanguage();
  const { stats, isLoading } = useAdminStats();

  const adminCards = [{
    title: language === 'ar' ? 'إدارة الفرق' : 'Manage Teams',
    description: language === 'ar' ? 'عرض وإدارة جميع الفرق المسجلة' : 'View and manage all registered teams',
    icon: Users,
    path: '/admin/teams',
    color: 'text-blue-500'
  }, {
    title: language === 'ar' ? 'ورش العمل' : 'Workshops',
    description: language === 'ar' ? 'إضافة وتعديل ورش العمل' : 'Add and edit workshops',
    icon: BookOpen,
    path: '/admin/workshops',
    color: 'text-orange-500'
  }, {
    title: language === 'ar' ? 'الحضور' : 'Attendance',
    description: language === 'ar' ? 'تتبع حضور الفرق في الورش' : 'Track team attendance at workshops',
    icon: Calendar,
    path: '/admin/attendance',
    color: 'text-green-500'
  }, {
    title: language === 'ar' ? 'التصدير' : 'Exports',
    description: language === 'ar' ? 'تصدير البيانات والتقارير' : 'Export data and reports',
    icon: FileDown,
    path: '/admin/exports',
    color: 'text-purple-500'
  }, {
    title: language === 'ar' ? 'الإعدادات' : 'Settings',
    description: language === 'ar' ? 'إعدادات النظام والمسابقة' : 'System and competition settings',
    icon: Settings,
    path: '/admin/settings',
    color: 'text-gray-500'
  }];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Admin Mode Label */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="text-red-500 font-semibold">
            {language === 'ar' ? 'وضع الإدارة' : 'Admin Mode'}
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-primary">
          {language === 'ar' ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إدارة جميع جوانب مسابقة RoboRumble من هنا' : 'Manage all aspects of the RoboRumble competition from here'}
        </p>
      </div>

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map(card => {
          const Icon = card.icon;
          return (
            <Card key={card.path} className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-muted ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>{card.description}</CardDescription>
                <Link to={card.path}>
                  <Button className="w-full" variant="outline">
                    <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180" />
                    {language === 'ar' ? 'دخول' : 'Enter'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
            ) : (
              <p className="text-2xl font-bold text-blue-500">{stats.totalTeams}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'فريق مسجل' : 'Teams Registered'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-500" />
            ) : (
              <p className="text-2xl font-bold text-green-500">{stats.totalMembers}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'مشارك' : 'Participants'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-yellow-500" />
            ) : (
              <p className="text-2xl font-bold text-yellow-500">{stats.totalWorkshops}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'ورشة عمل' : 'Workshops'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
            ) : (
              <p className="text-2xl font-bold text-purple-500">{stats.pendingRequests}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'طلب انتظار' : 'Pending Requests'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
