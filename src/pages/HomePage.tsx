import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Users, Trophy, Calendar, ArrowLeft, ArrowRight, Cpu, Wrench, Target, MessageCircle, ChevronDown, Laptop, Zap, Send, ClipboardList, UserCheck, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import roborumbleLogo from '@/assets/roborumble-logo.png';
import CountdownTimer from '@/components/CountdownTimer';
import { useEffect, useState, useRef } from 'react';
import smartMethodsLogo from '@/assets/smart-methods-logo.png';
import voxelLogo from '@/assets/voxel-logo.png';
import voxel3dLogo from '@/assets/voxel3d-logo.png';
import printingClubLogo from '@/assets/3dprinting-club-logo.jpg';
import robotiLogo from '@/assets/roboti-logo.avif';
import hackathonsLogo from '@/assets/hackathons-logo.png';
import aliLogo from '@/assets/ali-logo.png';
import mcitLogo from '@/assets/mcit-logo.png';
import theGarageLogo from '@/assets/garage-logo.png';
const HeroSection = () => {
  const {
    t,
    language,
    direction
  } = useLanguage();
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const stats = [{
    icon: Users,
    value: '80',
    label: t('hero.participants')
  }, {
    icon: Trophy,
    value: '16',
    label: t('hero.teams')
  }, {
    icon: Calendar,
    value: '4',
    label: t('hero.days')
  }];
  return <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        {/* Subtle glow effects using logo colors */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-logo-orange/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-logo-yellow/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-logo-red/8 rounded-full blur-3xl" />
      </div>

      {/* Decorative floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left - Large gear */}
        <div className="absolute top-20 left-8 md:left-16 opacity-20 animate-[spin_20s_linear_infinite]">
          <Cpu className="w-16 h-16 md:w-24 md:h-24 text-logo-orange" />
        </div>
        
        {/* Top right - Gear cluster */}
        <div className="absolute top-16 right-4 md:right-12 opacity-15 animate-[spin_25s_linear_infinite_reverse]">
          <div className="relative">
            <Cpu className="w-20 h-20 md:w-32 md:h-32 text-logo-yellow" />
            <Cpu className="absolute -bottom-4 -left-4 w-10 h-10 md:w-16 md:h-16 text-logo-orange animate-[spin_15s_linear_infinite]" />
          </div>
        </div>
        
        {/* Bottom left - Wrench */}
        <div className="absolute bottom-32 left-12 md:left-24 opacity-20 rotate-[-20deg]">
          <Wrench className="w-12 h-12 md:w-20 md:h-20 text-logo-red" />
        </div>
        
        {/* Bottom center - Target/wheel */}
        <div className="absolute bottom-24 left-1/3 opacity-15 animate-[spin_30s_linear_infinite]">
          <Target className="w-14 h-14 md:w-20 md:h-20 text-logo-yellow" />
        </div>
        
        {/* Right side - Zap */}
        <div className="absolute top-1/2 right-8 md:right-20 opacity-20">
          <Zap className="w-10 h-10 md:w-16 md:h-16 text-logo-orange" />
        </div>
        
        {/* Bottom right - Small gear */}
        <div className="absolute bottom-40 right-16 md:right-32 opacity-15 animate-[spin_18s_linear_infinite_reverse]">
          <Cpu className="w-12 h-12 md:w-18 md:h-18 text-logo-red" />
        </div>
      </div>

      <div className="container mx-auto relative z-10 py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          {/* Logo with glow */}
          <div className="relative" style={{ perspective: '1000px' }}>
            <div className="absolute inset-0 blur-2xl bg-primary/20 animate-glow-pulse" />
            <img alt="RoboRumble Logo" className="relative w-80 md:w-96 lg:w-[28rem] drop-shadow-[0_0_30px_rgba(242,100,25,0.3)] animate-logo-entrance" src={roborumbleLogo} />
          </div>

          {/* Title with animated gradient */}
          <h1 style={{
          animationDelay: '0.1s'
        }} className="text-5xl md:text-6xl lg:text-7xl text-gradient-animated animate-fade-in font-serif font-extrabold">
            RoboRumble
          </h1>

          {/* Slogan with colored words */}
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide animate-fade-in" style={{
          animationDelay: '0.2s'
        }}>
            <span className="text-logo-red font-sans">THINK</span>
            <span className="text-[#ffb83d]">​. </span>
            <span className="text-logo-orange font-sans">BUILD</span>
            <span className="text-[#ffb83d]">. </span>
            <span className="text-logo-yellow font-sans">BATTLE</span>
          </p>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/70 max-w-2xl animate-slide-up" style={{
          animationDelay: '0.3s'
        }}>
            {t('hero.description')}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 animate-slide-up" style={{
          animationDelay: '0.4s'
        }}>
            <Button asChild variant="hero" size="xl">
              <Link to="/auth" className="flex items-center gap-2">
                {language === 'ar' ? 'سجّل الآن' : 'Register Now'}
                <ArrowIcon size={20} />
              </Link>
            </Button>
            <Button asChild variant="heroOutline" size="xl">
              <a href="#about">{language === 'ar' ? 'اعرف المزيد' : 'Learn More'}</a>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 animate-slide-up" style={{
          animationDelay: '0.5s'
        }}>
            {stats.map((stat, index) => <div key={index} className="text-center">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 mx-auto">
                  <stat.icon className="text-primary" size={26} />
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
};
const AboutSection = () => {
  const {
    t,
    language
  } = useLanguage();
  const features = [{
    icon: Cpu,
    title: t('about.objective1.title'),
    desc: t('about.objective1.desc')
  }, {
    icon: Trophy,
    title: t('about.objective2.title'),
    desc: t('about.objective2.desc')
  }, {
    icon: Users,
    title: t('about.objective3.title'),
    desc: t('about.objective3.desc')
  }, {
    icon: Wrench,
    title: t('about.objective4.title'),
    desc: t('about.objective4.desc')
  }];
  return <section id="about" className="py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gradient-animated md:text-5xl">
            {t('about.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('about.description')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => <div key={index} className="rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 text-center group bg-accent-foreground">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="text-white" size={32} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-100">{feature.desc}</p>
            </div>)}
        </div>
      </div>
    </section>;
};
const TimelineSection = () => {
  const {
    t,
    direction
  } = useLanguage();
  const timelineItems = [{
    icon: ClipboardList,
    title: t('timeline.phase1'),
    date: t('timeline.phase1Date'),
    description: t('timeline.phase1Desc'),
    color: 'from-logo-yellow to-logo-orange'
  }, {
    icon: UserCheck,
    title: t('timeline.phase2'),
    date: t('timeline.phase2Date'),
    description: t('timeline.phase2Desc'),
    color: 'from-logo-orange to-logo-red'
  }, {
    icon: Megaphone,
    title: t('timeline.phase3'),
    date: t('timeline.phase3Date'),
    description: t('timeline.phase3Desc'),
    color: 'from-logo-red to-logo-orange'
  }, {
    icon: Laptop,
    title: t('timeline.phase4'),
    date: t('timeline.phase4Date'),
    description: t('timeline.phase4Desc'),
    color: 'from-logo-orange to-logo-yellow'
  }, {
    icon: Laptop,
    title: t('timeline.phase5'),
    date: t('timeline.phase5Date'),
    description: t('timeline.phase5Desc'),
    color: 'from-logo-yellow to-logo-orange'
  }, {
    icon: Megaphone,
    title: t('timeline.phase6'),
    date: t('timeline.phase6Date'),
    description: t('timeline.phase6Desc'),
    color: 'from-logo-orange to-logo-red'
  }, {
    icon: Zap,
    title: t('timeline.phase7'),
    date: t('timeline.phase7Date'),
    description: t('timeline.phase7Desc'),
    color: 'from-logo-red to-logo-orange'
  }, {
    icon: Trophy,
    title: t('timeline.phase8'),
    date: t('timeline.phase8Date'),
    description: t('timeline.phase8Desc'),
    color: 'from-logo-yellow to-logo-orange'
  }];
  return <section id="schedule" className="py-20">
      <div className="container mx-auto border-primary-glow">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-animated mb-4">
            {t('timeline.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('timeline.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-border hidden md:block" />

            {timelineItems.map((item, index) => <div key={index} className={cn("relative flex flex-col md:flex-row items-center gap-8 mb-12", index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse')}>
                {/* Content */}
                <div className={cn("flex-1 bg-card rounded-2xl p-6 shadow-card", index % 2 === 0 ? 'md:text-right' : 'md:text-left', direction === 'rtl' && (index % 2 === 0 ? 'md:text-left' : 'md:text-right'))}>
                  <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold text-white mb-3 bg-gradient-to-r", item.color)}>
                    <item.icon size={16} />
                    {item.date}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>

                {/* Center dot */}
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 bg-gradient-to-br", item.color)}>
                  <item.icon className="text-white" size={24} />
                </div>

                {/* Spacer for alignment */}
                <div className="flex-1 hidden md:block" />
              </div>)}
          </div>
        </div>
      </div>
    </section>;
};
const PrizesSection = () => {
  const {
    language
  } = useLanguage();
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const targetValue = 30000;
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        const duration = 2000;
        const steps = 60;
        const increment = targetValue / steps;
        let currentStep = 0;
        const timer = setInterval(() => {
          currentStep++;
          if (currentStep >= steps) {
            setCount(targetValue);
            clearInterval(timer);
          } else {
            setCount(Math.floor(increment * currentStep));
          }
        }, duration / steps);
      }
    }, {
      threshold: 0.3
    });
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, [hasAnimated]);
  const formatNumber = (num: number) => {
    return num.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');
  };
  return <section ref={sectionRef} id="prizes" className="py-16">
      <div className="container mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 border border-white/10">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-logo-red/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-logo-orange/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-logo-yellow/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 py-12 px-6 text-center">
            <div className="flex justify-center gap-3 mb-6">
              <Trophy className="w-10 h-10 text-logo-yellow animate-pulse" />
              <Trophy className="w-14 h-14 text-logo-orange animate-pulse" style={{
              animationDelay: '0.2s'
            }} />
              <Trophy className="w-10 h-10 text-logo-yellow animate-pulse" style={{
              animationDelay: '0.4s'
            }} />
            </div>
            
            <h2 className="text-2xl font-bold text-gradient-animated mb-2 md:text-5xl">
              {language === 'ar' ? 'جوائز روبو رمبل' : 'RoboRumble Prizes'}
            </h2>
            
            <p className="text-xl md:text-2xl text-white/80 mb-6">
              {language === 'ar' ? 'تصل حتى' : 'Up to'}
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <div className="bg-gradient-to-br from-logo-orange to-logo-red rounded-2xl px-8 py-6 shadow-2xl">
                <div className="flex items-baseline gap-2 justify-center">
                  <span className="text-5xl md:text-7xl font-bold text-white tracking-wider" style={{
                  fontFamily: 'monospace'
                }}>
                    {formatNumber(count)}
                  </span>
                  <span className="text-2xl md:text-3xl font-bold text-white/90">
                    {language === 'ar' ? 'ريال' : 'SAR'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
const SponsorsSection = () => {
  const { t, language } = useLanguage();

  return (
    <section id="sponsors" className="py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-animated mb-4">
            {t('sponsors.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('sponsors.subtitle')}
          </p>
        </div>

        {/* Strategic Sponsor - الراعي الاستراتيجي */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-logo-orange text-center mb-8">
            {language === 'ar' ? 'الراعي الاستراتيجي' : 'Strategic Sponsor'}
          </h3>
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Decorative line */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-px h-8 bg-gradient-to-b from-logo-orange/50 to-logo-orange" />
                <div className="w-44 h-44 md:w-56 md:h-56 rounded-full flex items-center justify-center bg-white shadow-card hover:shadow-2xl hover:scale-110 hover:-translate-y-2 transition-all duration-300 p-6 cursor-pointer group">
                  <img src={mcitLogo} alt="وزارة الاتصالات وتقنية المعلومات" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
              </div>
              <p className="mt-4 text-sm md:text-base font-semibold text-logo-orange text-center">
                {language === 'ar' ? 'وزارة الاتصالات وتقنية المعلومات' : 'Ministry of Communications and IT'}
              </p>
            </div>
          </div>
        </div>

{/* Hosting Sponsor - الراعي المستضيف */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-logo-orange text-center mb-8">
            {language === 'ar' ? 'الراعي المستضيف' : 'Hosting Sponsor'}
          </h3>
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Decorative line */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-px h-8 bg-gradient-to-b from-logo-orange/50 to-logo-orange" />
                <div className="w-44 h-44 md:w-56 md:h-56 rounded-full flex items-center justify-center bg-white shadow-card hover:shadow-2xl hover:scale-110 hover:-translate-y-2 transition-all duration-300 p-8 cursor-pointer group">
                  <img src={theGarageLogo} alt="الكراج" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
              </div>
              <p className="mt-4 text-sm md:text-base font-semibold text-logo-orange text-center">
                {language === 'ar' ? 'الكراج' : 'The Garage'}
              </p>
            </div>
          </div>
        </div>
        {/* Bronze Sponsor - الراعي البرونزي */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-amber-600 text-center mb-8">
            {language === 'ar' ? 'الراعي البرونزي' : 'Bronze Sponsor'}
          </h3>
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Decorative line */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-px h-8 bg-gradient-to-b from-amber-600/50 to-amber-600" />
                <div className="w-40 h-40 md:w-52 md:h-52 rounded-full flex items-center justify-center bg-white shadow-card hover:shadow-2xl hover:scale-110 hover:-translate-y-2 transition-all duration-300 p-10 cursor-pointer group">
                  <img src={smartMethodsLogo} alt="الأساليب الذكية" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
              </div>
              <p className="mt-4 text-sm md:text-base font-semibold text-amber-600 text-center">
                {language === 'ar' ? 'الأساليب الذكية' : 'Smart Methods'}
              </p>
            </div>
          </div>
        </div>

        {/* Participating Organizations - الجهات المشاركة */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-logo-orange text-center mb-10">
            {language === 'ar' ? 'الجهات المشاركة' : 'Participating Organizations'}
          </h3>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24">
            {/* 3D Printing Club - شريك النمذجة والتصنيع */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Decorative line */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-px h-8 bg-gradient-to-b from-logo-orange/50 to-logo-orange" />
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full flex items-center justify-center bg-white shadow-card hover:shadow-2xl hover:scale-110 hover:-translate-y-2 transition-all duration-300 p-8 cursor-pointer group">
                  <img src={printingClubLogo} alt="3D Printing Club" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
              </div>
              <p className="mt-4 text-xs md:text-sm text-muted-foreground text-center">
                {language === 'ar' ? 'نادي الطباعة ثلاثية الأبعاد' : '3D Printing Club'}
              </p>
              <p className="text-sm md:text-base font-semibold text-logo-orange text-center">
                {language === 'ar' ? 'شريك النمذجة و التصنيع' : 'Modeling & Manufacturing Partner'}
              </p>
            </div>

            {/* Roboti - راعي التمكين */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Decorative line */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-px h-8 bg-gradient-to-b from-logo-orange/50 to-logo-orange" />
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full flex items-center justify-center bg-white shadow-card hover:shadow-2xl hover:scale-110 hover:-translate-y-2 transition-all duration-300 p-8 cursor-pointer group">
                  <img src={robotiLogo} alt="Roboti" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
              </div>
              <p className="mt-4 text-xs md:text-sm text-muted-foreground text-center">
                {language === 'ar' ? 'متجر روبوتي' : 'Roboti Store'}
              </p>
              <p className="text-sm md:text-base font-semibold text-logo-orange text-center">
                {language === 'ar' ? 'راعي التمكين' : 'Empowerment Sponsor'}
              </p>
            </div>

            {/* Hackathons - راعي تسويقي */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Decorative line */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-px h-8 bg-gradient-to-b from-logo-orange/50 to-logo-orange" />
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full flex items-center justify-center bg-white shadow-card hover:shadow-2xl hover:scale-110 hover:-translate-y-2 transition-all duration-300 p-8 cursor-pointer group">
                  <img src={hackathonsLogo} alt="Hackathons" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
              </div>
              <p className="mt-4 text-xs md:text-sm text-muted-foreground text-center">
                {language === 'ar' ? 'هاكاثونات' : 'Hackathonat'}
              </p>
              <p className="text-sm md:text-base font-semibold text-logo-orange text-center">
                {language === 'ar' ? 'راعي تسويقي' : 'Marketing Sponsor'}
                </p>
            </div>

            {/* Ali Society - شريك نجاح */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Decorative line */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-px h-8 bg-gradient-to-b from-logo-orange/50 to-logo-orange" />
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full flex items-center justify-center bg-white shadow-card hover:shadow-2xl hover:scale-110 hover:-translate-y-2 transition-all duration-300 p-8 cursor-pointer group">
                  <img src={aliLogo} alt="جمعية آلي" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
              </div>
              <p className="mt-4 text-xs md:text-sm text-muted-foreground text-center">
                {language === 'ar' ? 'جمعية آلي' : 'Aali Robotics'}
              </p>
              <p className="text-sm md:text-base font-semibold text-logo-orange text-center">
                {language === 'ar' ? 'شريك نجاح' : 'Success Partner'}
              </p>
            </div>

            {/* Voxel 3D - شريك نجاح */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Decorative line */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-px h-8 bg-gradient-to-b from-logo-orange/50 to-logo-orange" />
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full flex items-center justify-center bg-white shadow-card hover:shadow-2xl hover:scale-110 hover:-translate-y-2 transition-all duration-300 p-8 cursor-pointer group">
                  <img src={voxel3dLogo} alt="شركة المحاور الثلاثة المحدودة" className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
              </div>
              <p className="mt-4 text-xs md:text-sm text-muted-foreground text-center">
                {language === 'ar' ? 'شركة المحاور الثلاثة المحدودة' : 'Voxel 3D'}
              </p>
              <p className="text-sm md:text-base font-semibold text-logo-orange text-center">
                {language === 'ar' ? 'شريك نجاح' : 'Success Partner'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

const FAQSection = () => {
  const {
    t
  } = useLanguage();
  const faqs = [{
    question: t('faq.q1'),
    answer: t('faq.a1')
  }, {
    question: t('faq.q2'),
    answer: t('faq.a2')
  }, {
    question: t('faq.q3'),
    answer: t('faq.a3')
  }//, {
    //question: t('faq.q4'),
    //answer: t('faq.a4')
//  }
];
  return <section id="faq" className="py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-animated mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className="bg-card rounded-xl shadow-card border-none px-6">
                <AccordionTrigger className="text-foreground font-semibold hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>

          {/* Telegram CTA */}
          <div className="mt-10 text-center bg-gradient-to-r from-logo-orange to-logo-yellow rounded-2xl p-8">
            <Send className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {t('faq.moreQuestions')}
            </h3>
            <Button asChild variant="secondary" size="lg" className="mt-4">
              <a href="https://t.me/+D-B1bjRzurxhZGY0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Send size={20} />
                {t('faq.askTelegram')}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>;
};
const HomePage = () => {
  return <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <HeroSection />
      <AboutSection />
      <CountdownTimer />
      <TimelineSection />
      <SponsorsSection />
      <FAQSection />
    </div>;
};
export default HomePage;