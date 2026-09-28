/**
 * Input sanitization and security utilities.
 * Protects against XSS, script injection, and invalid characters.
 */

export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/[<>]/g, '')
    .trim();
}

export function sanitizeHtml(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== 'string') return '';
  // Keep only digits, spaces, plus sign, and hyphens
  return phone.replace(/[^0-9+\s\-()]/g, '').trim();
}

export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') return '';
  return email.toLowerCase().trim().replace(/[^\w.@+\-]/g, '');
}

export function sanitizeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}
