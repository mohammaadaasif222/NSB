import { LOCALES, type Locale, type TranslationKey } from '@/i18n/locales';
import { formatMessage } from '@/i18n/registry';

/**
 * Translate outside React — services, utils and toasts fired from plain
 * functions, where `useTranslation()` is not available.
 *
 * Reads the active locale from `<html lang>`, which `I18nProvider` keeps in
 * step with the user's choice. Inside components prefer `useTranslation()`,
 * which re-renders when the locale changes.
 */
export const currentLocale = (): Locale => {
  if (typeof document === 'undefined') {
    return 'en';
  }
  const lang = document.documentElement.lang;
  return (LOCALES as readonly string[]).includes(lang) ? (lang as Locale) : 'en';
};

export const translate = (key: TranslationKey, vars?: Record<string, string | number>): string =>
  formatMessage(currentLocale(), key, vars);
