import { Check, X } from 'lucide-react';
import { PasswordValidation } from '@/lib/validation';
import { useLanguage } from '@/contexts/LanguageContext';

interface PasswordChecklistProps {
  validation: PasswordValidation;
  show?: boolean;
}

const PasswordChecklist = ({ validation, show = true }: PasswordChecklistProps) => {
  const { language } = useLanguage();

  if (!show) return null;

  const rules = [
    {
      key: 'minLength',
      passed: validation.minLength,
      labelAr: 'على الأقل 8 أحرف',
      labelEn: 'At least 8 characters',
    },
    {
      key: 'hasUppercase',
      passed: validation.hasUppercase,
      labelAr: 'حرف كبير واحد على الأقل',
      labelEn: 'At least 1 uppercase letter',
    },
    {
      key: 'hasLowercase',
      passed: validation.hasLowercase,
      labelAr: 'حرف صغير واحد على الأقل',
      labelEn: 'At least 1 lowercase letter',
    },
    {
      key: 'hasNumber',
      passed: validation.hasNumber,
      labelAr: 'رقم واحد على الأقل',
      labelEn: 'At least 1 number',
    },
    {
      key: 'hasSpecialChar',
      passed: validation.hasSpecialChar,
      labelAr: 'رمز خاص واحد على الأقل (!@#$%...)',
      labelEn: 'At least 1 special character (!@#$%...)',
    },
  ];

  return (
    <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
      <p className="text-xs text-white/60 mb-2">
        {language === 'ar' ? 'متطلبات كلمة المرور:' : 'Password requirements:'}
      </p>
      {rules.map((rule) => (
        <div key={rule.key} className="flex items-center gap-2 text-sm">
          {rule.passed ? (
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : (
            <X className="w-4 h-4 text-white/40 flex-shrink-0" />
          )}
          <span className={rule.passed ? 'text-green-500' : 'text-white/60'}>
            {language === 'ar' ? rule.labelAr : rule.labelEn}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PasswordChecklist;
