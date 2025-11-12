/**
 * Format a number as currency using Intl.NumberFormat
 *
 * @param value - Numeric value to format
 * @param locale - Locale string (default: 'en-AU')
 * @param currency - Currency code (default: 'AUD')
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, locale = 'en-AU', currency = 'AUD') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
