/**
 * Utility functions for validation
 */

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates a phone number (basic international format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates an Argentine CUIT/CUIL
 */
export function isValidCuit(cuit: string): boolean {
  const cleanCuit = cuit.replace(/[-\s]/g, '');
  if (!/^\d{11}$/.test(cleanCuit)) return false;

  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCuit[i]) * multipliers[i];
  }

  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;

  return checkDigit === parseInt(cleanCuit[10]);
}

/**
 * Validates an Argentine DNI
 */
export function isValidDni(dni: string): boolean {
  const cleanDni = dni.replace(/[.\s]/g, '');
  return /^\d{7,8}$/.test(cleanDni);
}

/**
 * Validates a credit card number using Luhn algorithm
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(cleanNumber)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validates password strength
 * Returns an object with validation results
 */
export function validatePassword(password: string): {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
} {
  const result = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    isValid: false,
  };

  result.isValid =
    result.hasMinLength &&
    result.hasUppercase &&
    result.hasLowercase &&
    result.hasNumber &&
    result.hasSpecialChar;

  return result;
}

/**
 * Checks if a value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Checks if a value is defined (not null and not undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Validates an IP address (IPv4)
 */
export function isValidIPv4(ip: string): boolean {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  return ipv4Regex.test(ip);
}

/**
 * Validates a date string format (dd/mm/yyyy)
 */
export function isValidDateFormat(date: string, format: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd'): boolean {
  const patterns: Record<string, RegExp> = {
    'dd/mm/yyyy': /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
    'mm/dd/yyyy': /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/,
    'yyyy-mm-dd': /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  };

  return patterns[format]?.test(date) ?? false;
}

/**
 * Validates a hexadecimal color code
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Checks if a string contains only alphanumeric characters
 */
export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * Checks if a string contains only letters
 */
export function isAlpha(value: string): boolean {
  return /^[a-zA-Z]+$/.test(value);
}

/**
 * Checks if a string contains only numbers
 */
export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}
