import { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { validateSaudiPhone, formatSaudiPhone } from '@/lib/validation';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  required?: boolean;
  className?: string;
  id?: string;
}

const PhoneInput = ({ value, onChange, required = false, className, id = 'phone' }: PhoneInputProps) => {
  const { language } = useLanguage();
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; formatted: string; errorMessage?: string }>({ isValid: false, formatted: '', errorMessage: undefined });

  useEffect(() => {
    const result = validateSaudiPhone(value);
    setValidation(result);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSaudiPhone(e.target.value);
    const result = validateSaudiPhone(formatted);
    setValidation(result);
    onChange(formatted, result.isValid);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const showError = touched && value && !validation.isValid;

  const getErrorMessage = () => {
    if (!validation.errorMessage) return null;
    return language === 'ar' 
      ? 'الرجاء إدخال رقم جوال سعودي صالح (05XXXXXXXX أو 9665XXXXXXXX+)'
      : 'Please enter a valid Saudi phone number (05XXXXXXXX or +9665XXXXXXXX)';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white/90">
        {language === 'ar' ? 'رقم الجوال' : 'Phone Number'} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <Phone className="absolute top-1/2 -translate-y-1/2 start-3 text-white/50" size={18} />
        <Input
          id={id}
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="05XXXXXXXX"
          className={cn(
            "ps-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary",
            showError && "border-destructive focus:border-destructive",
            className
          )}
          dir="ltr"
          required={required}
        />
        {validation.isValid && value && (
          <div className="absolute top-1/2 -translate-y-1/2 end-3">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
      {showError && (
        <p className="text-xs text-destructive mt-1">
          {getErrorMessage()}
        </p>
      )}
      <p className="text-xs text-white/40">
        {language === 'ar' 
          ? 'صيغة مقبولة: 05XXXXXXXX أو 9665XXXXXXXX+' 
          : 'Accepted format: 05XXXXXXXX or +9665XXXXXXXX'}
      </p>
    </div>
  );
};

export default PhoneInput;
