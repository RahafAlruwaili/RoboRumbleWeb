import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import roborumbleLogo from '@/assets/roborumble-logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { language, setLanguage, t, direction } = useLanguage();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { isAdmin, isJudge } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#hero');

  // Public navbar links (before login)
  const publicNavLinks = [
    { path: '#hero', label: t('nav.home') },
    { path: '#about', label: t('nav.about') },
    { path: '#schedule', label: t('nav.schedule') },
    //{ path: '#prizes', label: t('nav.prizes') },
    { path: '#faq', label: t('faq.title') },
    { path: '/leaderboard', label: t('nav.leaderboard'), isRoute: true },
  ];

  // Check if user has a team - handle loading state
  const userHasTeam = user?.hasTeam === true;
  
  // Check if user can access workshops (team must be first_accepted or final_accepted)
  const canAccessWorkshops = user?.teamStatus === 'approved' || user?.teamStatus === 'final_approved';

  // Authenticated navbar links (after login)
  // Hide "My Team" link for admins and judges
  // Hide "Workshops" for users without accepted teams (unless admin/judge)
  const authNavLinks = [
    { path: '#hero', label: t('nav.home') },
    ...(userHasTeam && !isAdmin && !isJudge ? [{ path: '/team-dashboard', label: language === 'ar' ? 'فريقي' : 'My Team', isRoute: true }] : []),
    { path: '/all-teams', label: t('nav.team'), isRoute: true },
    ...((canAccessWorkshops || isAdmin || isJudge) ? [{ path: '/workshops', label: t('nav.workshops'), isRoute: true }] : []),
    { path: '/leaderboard', label: t('nav.leaderboard'), isRoute: true },
  ];

  const navLinks = isAuthenticated ? authNavLinks : publicNavLinks;

  useEffect(() => {
    if (location.pathname !== '/') return;

    //const sectionIds = ['hero', 'about', 'schedule', 'prizes', 'faq'];
    const sectionIds = ['hero', 'about', 'schedule', 'faq'];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string, isRoute?: boolean) => {
    if (isRoute) {
      setMobileMenuOpen(false);
      return; // Let the Link handle navigation
    }

    e.preventDefault();
    setMobileMenuOpen(false);
    
    // Special handling for home/hero - navigate to top of page
    if (path === '#hero') {
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    
    // If we're not on the home page, navigate there first
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: path } });
    } else {
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isActive = (path: string, isRoute?: boolean) => {
    if (isRoute) {
      return location.pathname === path;
    }
    return activeSection === path && location.pathname === '/';
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={roborumbleLogo} alt="RoboRumble" className="h-16 md:h-20" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(link.path, link.isRoute)
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => handleNavClick(e, link.path, link.isRoute)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(link.path, link.isRoute)
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </a>
              )
            ))}
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

            {isAuthenticated ? (
              /* User Menu (Authenticated) */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <User size={18} />
                    <span className="max-w-[100px] truncate">{user?.name}</span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {!isAdmin && !isJudge && (
                    <DropdownMenuItem onClick={() => navigate('/complete-profile')}>
                      <User size={16} className="me-2" />
                      {t('nav.profile')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut size={16} className="me-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Register Button (Public) */
              <Button asChild variant="hero" size="sm" className="hidden sm:flex">
                <Link to="/auth">{t('nav.register')}</Link>
              </Button>
            )}

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
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive(link.path, link.isRoute)
                        ? "text-primary bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.path}
                    href={link.path}
                    onClick={(e) => handleNavClick(e, link.path, link.isRoute)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive(link.path, link.isRoute)
                        ? "text-primary bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </a>
                )
              ))}

              {isAuthenticated ? (
                <>
                  {!isAdmin && !isJudge && (
                    <Link
                      to="/complete-profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
                    >
                      <User size={18} />
                      {t('nav.profile')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2 w-full text-start"
                  >
                    <LogOut size={18} />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2"
                >
                  <Button variant="hero" className="w-full">
                    {t('nav.register')}
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
