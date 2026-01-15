import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, Users, User, Home, Trophy, BookOpen, Shield, Scale, UserCircle2, Calendar } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import roborumbleLogo from '@/assets/roborumble-logo.png';
import { Badge } from '@/components/ui/badge';

const DashboardHeader = () => {
  const { language, setLanguage, t, direction } = useLanguage();
  const { logout, user } = useAuth();
  const { role } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user can access workshops (team must be first_accepted or final_accepted)
  const canAccessWorkshops = user?.teamStatus === 'approved' || user?.teamStatus === 'final_approved';

  // Build nav links based on role
  const getNavLinks = () => {
    // Judge: Judge Dashboard as home, then Teams, Leaderboard
    if (role === 'judge') {
      return [
        { path: '/judge', label: language === 'ar' ? 'الرئيسية' : 'Home', icon: Scale },
        { path: '/judge/teams', label: language === 'ar' ? 'الفرق' : 'Teams', icon: Users },
        { path: '/dashboard/leaderboard', label: language === 'ar' ? 'لوحة المتصدرين' : 'Leaderboard', icon: Trophy },
      ];
    }

    // Admin: Admin Dashboard as home, then Teams, Workshops, etc.
    if (role === 'admin') {
      return [
        { path: '/admin', label: language === 'ar' ? 'الرئيسية' : 'Home', icon: Shield },
        { path: '/all-teams', label: language === 'ar' ? 'الفرق' : 'Teams', icon: Users },
        { path: '/workshops', label: language === 'ar' ? 'ورش عمل' : 'Workshops', icon: BookOpen },
        { path: '/dashboard/leaderboard', label: language === 'ar' ? 'لوحة المتصدرين' : 'Leaderboard', icon: Trophy },
        { path: '/judge', label: language === 'ar' ? 'التحكيم' : 'Judging', icon: Scale },
      ];
    }

    // User: standard links (no Admin, no Judging)
    // Only show Workshops if team is accepted (first_accepted or final_accepted)
    return [
      ...(user?.hasTeam ? [{ path: '/team-dashboard', label: language === 'ar' ? 'فريقي' : 'My Team', icon: UserCircle2 }] : []),
      { path: '/all-teams', label: language === 'ar' ? 'الفرق' : 'Teams', icon: Users },
      ...(canAccessWorkshops ? [
        { path: '/workshops', label: language === 'ar' ? 'ورش عمل' : 'Workshops', icon: BookOpen },
        { path: '/team-dashboard?tab=preparation', label: language === 'ar' ? 'الحضور' : 'Attendance', icon: Calendar }
      ] : []),
      { path: '/dashboard/leaderboard', label: language === 'ar' ? 'لوحة المتصدرين' : 'Leaderboard', icon: Trophy },
      { path: '/edit-profile', label: language === 'ar' ? 'الملف الشخصي' : 'Profile', icon: User },
    ];
  };

  const navLinks = getNavLinks();

  const isActive = (path: string) => location.pathname === path;

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={roborumbleLogo} alt="RoboRumble" className="h-14 md:h-16" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    isActive(link.path)
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium"
            >
              <span className={cn(
                language === 'ar' ? 'text-primary font-bold' : 'text-muted-foreground'
              )}>
                AR
              </span>
              <span className="text-border">|</span>
              <span className={cn(
                language === 'en' ? 'text-primary font-bold' : 'text-muted-foreground'
              )}>
                EN
              </span>
            </button>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 me-2" />
              {language === 'ar' ? 'خروج' : 'Logout'}
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                      isActive(link.path)
                        ? "text-primary bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2 mt-2"
              >
                <LogOut size={18} />
                {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
