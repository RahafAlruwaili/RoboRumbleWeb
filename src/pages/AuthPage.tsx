import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowLeft, ArrowRight, Eye, EyeOff, User } from 'lucide-react';
import { toast } from 'sonner';
import roborumbleLogo from '@/assets/roborumble-logo.png';
import PasswordChecklist from '@/components/ui/password-checklist';
import { validatePassword } from '@/lib/validation';
import { supabase } from "@/integrations/supabase/client";

type AuthMode = 'login' | 'signup' | 'forgot' | 'update-password';

interface RegistrationSettings {
  is_open: boolean;
  allow_team_editing: boolean;
  auto_accept: boolean;
}

const AuthPage = () => {
  const { t, language, direction } = useLanguage();
  const { login, signup, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [checkingSettings, setCheckingSettings] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  // Check registration settings
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'registration')
          .single();

        if (!error && data) {
          const settings = data.value as unknown as RegistrationSettings;
          setRegistrationOpen(settings.is_open ?? true);
        }
      } catch (err) {
        console.error('Error checking registration status:', err);
      } finally {
        setCheckingSettings(false);
      }
    };

    checkRegistrationStatus();
  }, []);

  useEffect(() => {
    // Check for recovery mode from URL hash or query params
    const hash = window.location.hash;
    const query = new URLSearchParams(window.location.search);
// Check registration settings
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'registration')
          .single();

        if (!error && data) {
          const settings = data.value as unknown as RegistrationSettings;
          setRegistrationOpen(settings.is_open ?? true);
        }
      } catch (err) {
        console.error('Error checking registration status:', err);
      } finally {
        setCheckingSettings(false);
      }
    };

    checkRegistrationStatus();
  }, []);

    if (hash.includes('type=recovery') || query.get('mode') === 'reset') {
      setMode('update-password');
    }
  }, []);

  // If registration is closed and user tries to access signup, redirect to login
  useEffect(() => {
    if (!checkingSettings && !registrationOpen && mode === 'signup') {
      setMode('login');
      toast.error(language === 'ar' ? 'التسجيل مغلق حالياً' : 'Registration is currently closed');
    }
  }, [mode, registrationOpen, checkingSettings, language]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'login') {
      const result = await login(email, password);
      setLoading(false);

      if (!result.success) {
        if (result.error === 'invalid_credentials') {
          toast.error(language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
        } else {
          toast.error(language === 'ar' ? 'حدث خطأ في تسجيل الدخول' : 'Login failed');
        }
        return;
      }

      // Check if profile is completed
      const { data: profileData } = await supabase
        .from('profiles')
        .select('profile_completed')
        .eq('email', email)
        .maybeSingle();

      toast.success(language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully');

      // Redirect based on profile completion status
      if (!profileData?.profile_completed) {
        navigate('/complete-profile');
      } else {
        navigate('/all-teams');
      }
      return;

    } else if (mode === 'signup') {
      // Double-check registration is open before allowing signup
      if (!registrationOpen) {
        toast.error(language === 'ar' ? 'التسجيل مغلق حالياً' : 'Registration is currently closed');
        setLoading(false);
        setMode('login');
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        toast.error(language === 'ar' ? 'كلمة المرور لا تستوفي المتطلبات' : 'Password does not meet requirements');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast.error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
        setLoading(false);
        return;
      }

      const result = await signup(email, password, fullName);
      setLoading(false);

      if (!result.success) {
        toast.error(result.error || (language === 'ar' ? 'حدث خطأ في التسجيل' : 'Signup failed'));
        return;
      }

      toast.success(
        language === 'ar'
          ? 'تم إنشاء الحساب! يرجى تأكيد بريدك الإلكتروني ثم تسجيل الدخول.'
          : 'Account created! Please verify your email then login.'
      );
      setMode('login');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      return;
    } else if (mode === 'update-password') {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        toast.error(language === 'ar' ? 'كلمة المرور لا تستوفي المتطلبات' : 'Password does not meet requirements');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast.error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: password });

      setLoading(false);

      if (error) {
        toast.error(language === 'ar' ? 'حدث خطأ في تحديث كلمة المرور' : 'Failed to update password');
        return;
      }

      toast.success(language === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
      // Redirect to home or dashboard after password reset
      navigate('/');
    } else {
      const result = await resetPassword(email);
      setLoading(false);

      if (!result.success) {
        toast.error(result.error || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
        return;
      }

      toast.success(language === 'ar' ? 'تم إرسال رابط إعادة التعيين' : 'Reset link sent to your email');
      setMode('login');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Dark gradient background matching home page */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        {/* Glow effects using logo colors */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-logo-orange/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-logo-yellow/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-logo-red/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <BackIcon size={20} />
            <span>{t('nav.home')}</span>
          </Link>
          <img src={roborumbleLogo} alt="RoboRumble" className="h-20 mx-auto mt-4 drop-shadow-[0_0_20px_rgba(242,100,25,0.3)]" />
          <p className="text-white/70 mt-2 text-lg">
            {language === 'ar' ? 'فكّر، ابنِ، نافس' : 'Think, Build, Battle'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            {mode === 'login' && t('auth.login')}
            {mode === 'signup' && t('auth.signup')}
            {mode === 'forgot' && t('auth.forgotPassword')}
            {mode === 'update-password' && (language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white/90">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </Label>
                <div className="relative">
                  <User className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50" size={18} />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    className="ps-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email - Hide in update-password mode */}
            {mode !== 'update-password' && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">{t('auth.email')}</Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50" size={18} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="ps-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                    required={mode !== 'update-password'}
                  />
                </div>
              </div>
            )}

            {/* Password (not for forgot mode) */}
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">
                  {mode === 'update-password' ? (language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password') : t('auth.password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="ps-10 pe-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 end-3 text-white/50 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {(mode === 'signup' || mode === 'update-password') && (
                  <PasswordChecklist
                    validation={validatePassword(password)}
                    show={password.length > 0}
                  />
                )}
              </div>
            )}

            {/* Confirm Password (signup and update-password only) */}
            {(mode === 'signup' || mode === 'update-password') && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/90">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50" size={18} />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="ps-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                    required
                  />
                </div>
              </div>
            )}

            {/* Forgot Password Link */}
            {mode === 'login' && (
              <div className="text-end">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-primary hover:underline"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  {mode === 'login' && t('auth.loginBtn')}
                  {mode === 'signup' && t('auth.signupBtn')}
                  {mode === 'forgot' && t('common.submit')}
                  {mode === 'update-password' && (language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password')}
                  <ArrowIcon size={18} />
                </>
              )}
            </Button>
          </form>

          {/* Mode Switch */}
          <div className="mt-6 text-center text-sm text-white/60">
            {mode === 'login' && (
              <p>
                {registrationOpen ? (
                  <>
                    {t('auth.noAccount')}{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-primary font-semibold hover:underline"
                    >
                      {t('auth.signup')}
                    </button>
                  </>
                ) : (
                  <span className="text-yellow-500">
                    {language === 'ar' ? 'التسجيل مغلق حالياً' : 'Registration is currently closed'}
                  </span>
                )}
              </p>
            )}
            {mode === 'signup' && (
              <p>
                {t('auth.hasAccount')}{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  {t('auth.login')}
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button
                onClick={() => setMode('login')}
                className="text-primary font-semibold hover:underline"
              >
                {t('auth.login')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
