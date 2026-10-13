import { DICTIONARIES, LOCALES, type Locale, type TranslationKey } from '@/i18n/locales';

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

export const translate = (key: TranslationKey, vars?: Record<string, string | number>): string => {
  const dict = DICTIONARIES[currentLocale()] ?? DICTIONARIES.en;
  let out: string = dict[key] ?? DICTIONARIES.en[key] ?? key;

  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return out;
};
