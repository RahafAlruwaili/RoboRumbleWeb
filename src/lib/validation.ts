import { z } from 'zod';

// Password validation rules
export const passwordRules = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

export const passwordSchema = z.string()
  .min(passwordRules.minLength, 'Password must be at least 8 characters')
  .regex(passwordRules.hasUppercase, 'Password must include at least 1 uppercase letter')
  .regex(passwordRules.hasLowercase, 'Password must include at least 1 lowercase letter')
  .regex(passwordRules.hasNumber, 'Password must include at least 1 number')
  .regex(passwordRules.hasSpecialChar, 'Password must include at least 1 special character');

export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
}

export const validatePassword = (password: string): PasswordValidation => {
  const minLength = password.length >= passwordRules.minLength;
  const hasUppercase = passwordRules.hasUppercase.test(password);
  const hasLowercase = passwordRules.hasLowercase.test(password);
  const hasNumber = passwordRules.hasNumber.test(password);
  const hasSpecialChar = passwordRules.hasSpecialChar.test(password);
  
  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
  };
};

// Saudi phone validation
// Accepts: 05XXXXXXXX or +9665XXXXXXXX
const saudiPhoneRegex = /^(?:05\d{8}|\+9665\d{8})$/;

export const phoneSchema = z.string()
  .regex(saudiPhoneRegex, 'Please enter a valid Saudi phone number (05XXXXXXXX or +9665XXXXXXXX)');

export interface PhoneValidation {
  isValid: boolean;
  formatted: string;
  errorMessage?: string;
}

export const validateSaudiPhone = (phone: string): PhoneValidation => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (!cleaned) {
    return { isValid: false, formatted: '', errorMessage: undefined };
  }
  
  const isValid = saudiPhoneRegex.test(cleaned);
  
  return {
    isValid,
    formatted: cleaned,
    errorMessage: isValid ? undefined : 'invalid_format',
  };
};

export const formatSaudiPhone = (input: string): string => {
  // Remove all non-digit characters except +
  let cleaned = input.replace(/[^\d+]/g, '');
  
  // Allow + only at the start
  if (cleaned.includes('+') && !cleaned.startsWith('+')) {
    cleaned = cleaned.replace(/\+/g, '');
  }
  
  // If starts with +966, keep it and limit length
  if (cleaned.startsWith('+966')) {
    return cleaned.slice(0, 13);
  }
  
  // If starts with +9 or + (partial), allow it
  if (cleaned.startsWith('+')) {
    return cleaned.slice(0, 13);
  }
  
  // If starts with 966 without +, add +
  if (cleaned.startsWith('966')) {
    return '+' + cleaned.slice(0, 12);
  }
  
  // For local format, just limit to 10 digits
  return cleaned.slice(0, 10);
};
