import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, ArrowRight, Cpu, CheckCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import roborumbleLogo from '@/assets/roborumble-logo.png';

const VerifyEmailPage = () => {
  const { language, direction } = useLanguage();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);

  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  // Simulated email - will come from auth context
  const userEmail = 'user@example.com';

  const handleResendEmail = async () => {
    setResending(true);
    // Simulated resend - will be replaced with Supabase
    setTimeout(() => {
      setResending(false);
      toast.success(
        language === 'ar' 
          ? 'تم إرسال رابط التحقق مرة أخرى' 
          : 'Verification email resent'
      );
    }, 1500);
  };

  const handleCheckVerification = async () => {
    // Simulated check - will be replaced with Supabase
    toast.success(
      language === 'ar' 
        ? 'تم التحقق بنجاح!' 
        : 'Email verified!'
    );
    navigate('/complete-profile');
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 relative overflow-hidden",
      language === 'ar' ? 'font-arabic' : 'font-english'
    )}>
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-logo-orange/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-logo-yellow/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-logo-red/8 rounded-full blur-3xl" />
      </div>

      {/* Decorative icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-8 md:left-16 opacity-20 animate-[spin_20s_linear_infinite]">
          <Cpu className="w-16 h-16 md:w-24 md:h-24 text-logo-orange" />
        </div>
        <div className="absolute bottom-20 right-8 md:right-16 opacity-15 animate-[spin_25s_linear_infinite_reverse]">
          <Cpu className="w-20 h-20 md:w-32 md:h-32 text-logo-yellow" />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Back Link */}
        <div className="mb-6">
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <BackIcon size={20} />
            <span>{language === 'ar' ? 'العودة' : 'Back'}</span>
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <img src={roborumbleLogo} alt="RoboRumble" className="h-16 mx-auto drop-shadow-[0_0_20px_rgba(242,100,25,0.3)]" />
        </div>

        {/* Verify Email Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
          {/* Email Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-logo-red to-logo-orange flex items-center justify-center">
            <Mail className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">
            {language === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Verify Your Email'}
          </h1>
          
          <p className="text-white/60 mb-2">
            {language === 'ar' 
              ? 'أرسلنا رابط التحقق إلى' 
              : 'We sent a verification link to'}
          </p>
          
          <p className="font-semibold text-white mb-6" dir="ltr">
            {userEmail}
          </p>

          <div className="space-y-3">
            {/* Check Verification Button */}
            <Button 
              onClick={handleCheckVerification}
              variant="hero" 
              size="lg" 
              className="w-full"
            >
              <CheckCircle className="w-5 h-5 me-2" />
              {language === 'ar' ? 'تحققت! المتابعة' : 'I verified! Continue'}
            </Button>

            {/* Resend Email Button */}
            <Button 
              onClick={handleResendEmail}
              variant="ghost" 
              size="lg" 
              className="w-full text-white/70 hover:text-white hover:bg-white/10"
              disabled={resending}
            >
              {resending ? (
                <RefreshCw className="w-4 h-4 me-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 me-2" />
              )}
              {language === 'ar' ? 'إعادة إرسال الرابط' : 'Resend Link'}
            </Button>
          </div>

          {/* Help text */}
          <p className="text-xs text-white/50 mt-6">
            {language === 'ar' 
              ? 'لم تجد الرسالة؟ تحقق من مجلد الرسائل غير المرغوب فيها' 
              : "Can't find it? Check your spam folder"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
