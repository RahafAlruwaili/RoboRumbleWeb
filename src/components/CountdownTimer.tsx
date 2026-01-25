import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Cpu, Cog, Zap, Wrench } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = () => {
  const { language } = useLanguage();
  
  // Set target date to January 27, 2026 (Registration Closing Date)
  const targetDate = new Date('2026-01-27T00:00:00').getTime();
  
  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date().getTime();
    const difference = targetDate - now;
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  };
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatNumber = (num: number) => num.toString().padStart(2, '0');
  
  const timeUnits = [
    { 
      value: timeLeft.days, 
      labelAr: 'يوم', 
      labelEn: 'Day',
      Icon: Cpu,
      color: 'text-logo-yellow',
      glowColor: 'shadow-[0_0_20px_rgba(255,184,61,0.5)]'
    },
    { 
      value: timeLeft.hours, 
      labelAr: 'ساعة', 
      labelEn: 'Hour',
      Icon: Cog,
      color: 'text-logo-red',
      glowColor: 'shadow-[0_0_20px_rgba(229,62,48,0.5)]'
    },
    { 
      value: timeLeft.minutes, 
      labelAr: 'دقيقة', 
      labelEn: 'Minute',
      Icon: Zap,
      color: 'text-logo-orange',
      glowColor: 'shadow-[0_0_20px_rgba(242,100,25,0.5)]'
    },
    { 
      value: timeLeft.seconds, 
      labelAr: 'ثانية', 
      labelEn: 'Second',
      Icon: Wrench,
      color: 'text-logo-yellow',
      glowColor: 'shadow-[0_0_20px_rgba(255,184,61,0.5)]'
    },
  ];
  
  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl border border-white/10 bg-neutral-900/50 backdrop-blur-sm p-8 max-w-4xl mx-auto">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-logo-orange/5 via-logo-yellow/5 to-logo-red/5 blur-xl" />
          
          {/* Title */}
          <h2 className="relative z-10 text-center text-xl md:text-2xl font-bold text-gradient-animated mb-8">
            {language === 'ar' ? 'الوقت المتبقي على انتهاء التسجيل' : 'Time Remaining Until Registration Closes'}
          </h2>
          
          <div className="relative z-10 flex justify-center items-center gap-6 md:gap-12 flex-wrap">
            {timeUnits.map((unit, index) => (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-current ${unit.color} ${unit.glowColor} flex items-center justify-center bg-neutral-900/80`}>
                  <unit.Icon className={`absolute w-full h-full p-3 opacity-30 ${unit.color}`} strokeWidth={1} />
                  <span className="relative text-2xl md:text-3xl font-bold text-white z-10">
                    {formatNumber(unit.value)}
                  </span>
                </div>
                <span className="text-white/70 text-sm md:text-base">
                  {language === 'ar' ? unit.labelAr : unit.labelEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;