export const formatCurrency = (value: number, locale = 'en-AU', currency = 'AUD') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
