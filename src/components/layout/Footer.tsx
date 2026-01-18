import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Instagram, Linkedin, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import roborumbleLogo from '@/assets/roborumble-logo.png';
import drcLogo from '@/assets/drc-logo.png';
const Footer = () => {
  const {
    t,
    language
  } = useLanguage();
  const quickLinks = [{
    path: '#hero',
    label: t('nav.home')
  }, {
    path: '#about',
    label: t('nav.about')
  }, {
    path: '#schedule',
    label: t('nav.schedule')
  },// {
   // path: '#prizes',
   // label: language === 'ar' ? 'الجوائز' : 'Prizes'
 // },
  {
   path: '#sponsors',
   label: t('nav.sponsors')
  }, 
  {
    path: '#faq',
    label: t('faq.title')
  }];
  return <footer className="bg-gradient-to-r from-logo-orange to-logo-yellow text-white">
    <div className="container mx-auto py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img src={roborumbleLogo} alt="RoboRumble" className="h-24" />
          </div>
          <p className="text-lg font-bold tracking-wide text-white">
            THINK. BUILD. BATTLE
          </p>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <MapPin size={16} className="text-white" />
            {t('event.locationValue')}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold mb-4">
            {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
          </h4>
          <ul className="space-y-2">
            {quickLinks.map(link => <li key={link.path}>
              <a href={link.path} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">
                {link.label}
              </a>
            </li>)}
          </ul>
        </div>

        {/* Organizer */}
        <div>
          <h4 className="font-bold mb-4">{t('footer.organizer')}</h4>
          <p className="text-white/70 text-sm mb-2">
            {t('footer.university')}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Mail size={16} className="text-white" />
            <a className="text-white/70 hover:text-white transition-colors" href="mailto:drcroborumble@gmail.com">drcroborumble
              @gmail.com</a>
          </div>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-bold mb-4">{t('footer.followUs')}</h4>
          <div className="flex gap-3">
            <a href="https://x.com/DrcRoboRumble" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-logo-orange transition-all">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>

            <a href="https://www.linkedin.com/company/drcksu" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-logo-orange transition-all">
              <Linkedin size={18} />
            </a>

            <a href="https://www.tiktok.com/@drc_ksu" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-logo-orange transition-all">
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-white/30 text-center text-sm text-white/60 flex items-center justify-center gap-3">
        <img src={drcLogo} alt="DRC Logo" className="h-24" />
        <p className="text-white">
          {language === 'ar' ? 'جميع الحقوق محفوظة لنادي الدرونز والروبوت 2026 ©' : 'All rights reserved to Drones and Robotics Club 2026 ©'}
        </p>
        <span className="text-white/40 text-xs">v9</span>
      </div>
    </div>
  </footer>;
};
export default Footer;