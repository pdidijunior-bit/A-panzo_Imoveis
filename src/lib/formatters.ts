/**
 * Currency and number formatting utilities for Angola (Kwanza / AOA), USD ($) and EUR (€).
 * Handles normalization and guards against invalid ISO 4217 currency codes (e.g. 'Kz').
 */

export function normalizeCurrency(currency?: string): 'AOA' | 'USD' | 'EUR' {
  if (!currency) return 'AOA';
  const clean = currency.toString().trim().toUpperCase();
  if (clean === 'USD' || clean === '$' || clean === 'US$') {
    return 'USD';
  }
  if (clean === 'EUR' || clean === '€') {
    return 'EUR';
  }
  // 'KZ', 'AKZ', 'AOA', or any unrecognized code defaults to Angolan Kwanza (AOA)
  return 'AOA';
}

/**
 * Format currency amount with fallback protection against RangeError (e.g. invalid currency code 'Kz').
 */
export function formatCurrency(amount: number | undefined | null, rawCurrency?: string): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const currencyCode = normalizeCurrency(rawCurrency);

  try {
    const formatted = new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(num);

    // Standardize Angolan Kwanza display symbol from 'AOA' to 'Kz'
    return formatted.replace('AOA', 'Kz');
  } catch {
    // Robust fallback if Intl.NumberFormat throws RangeError
    try {
      const fallbackNum = new Intl.NumberFormat('pt-AO', {
        maximumFractionDigits: 0,
      }).format(num);
      if (currencyCode === 'USD') return `$ ${fallbackNum}`;
      if (currencyCode === 'EUR') return `€ ${fallbackNum}`;
      return `${fallbackNum} Kz`;
    } catch {
      if (currencyCode === 'USD') return `$ ${num}`;
      if (currencyCode === 'EUR') return `€ ${num}`;
      return `${num} Kz`;
    }
  }
}

/**
 * Decimal number formatting with thousand separators for pt-AO
 */
export function formatNumber(amount: number | undefined | null): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('pt-AO', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    try {
      return num.toLocaleString();
    } catch {
      return String(num);
    }
  }
}
