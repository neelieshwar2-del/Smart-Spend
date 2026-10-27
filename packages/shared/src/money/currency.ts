export interface CurrencyConfig {
  code: string;
  symbol: string;
  minorUnits: number;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', minorUnits: 100, locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', minorUnits: 100, locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', minorUnits: 100, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', minorUnits: 100, locale: 'en-GB' },
};
