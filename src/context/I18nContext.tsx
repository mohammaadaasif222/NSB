import { createContext, useContext, useEffect, useState, type FC, type ReactNode } from 'react';
import {
  DICTIONARIES,
  LOCALE_META,
  LOCALES,
  type Locale,
  type LocaleMeta,
  type TranslationKey,
} from '@/i18n/locales';

/**
 * Client-side i18n.
 *
 * Deliberately not next-i18next: that adds locale-prefixed routes
 * (/en/…, /ar/…), which would break the folder-based paths this app just moved
 * to and the sessionStorage auth guards. This keeps one URL per page and swaps
 * the dictionary in place.
 */

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Translate a key; `vars` fills {placeholders}. */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  meta: LocaleMeta;
  locales: LocaleMeta[];
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'app_locale';
const DEFAULT_LOCALE: Locale = 'en';

const isLocale = (v: string | null): v is Locale =>
  !!v && (LOCALES as readonly string[]).includes(v);

const metaFor = (l: Locale): LocaleMeta => LOCALE_META.find((m) => m.code === l) ?? LOCALE_META[0];

export const I18nProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Starts at the default so the server render and first client render agree;
  // the stored choice is restored in the effect below.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) {
      setLocaleState(stored);
    }
  }, []);

  // Keep <html lang> and dir in step — Arabic needs RTL.
  useEffect(() => {
    const m = metaFor(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = m.rtl ? 'rtl' : 'ltr';
  }, [locale]);

  const setLocale = (next: Locale): void => {
    localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  };

  const t = (key: TranslationKey, vars?: Record<string, string | number>): string => {
    // Fall back to English rather than rendering a raw key at the user.
    const dict = DICTIONARIES[locale] ?? DICTIONARIES.en;
    let out: string = dict[key] ?? DICTIONARIES.en[key] ?? key;

    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }

    return out;
  };

  const meta = metaFor(locale);

  return (
    <I18nContext.Provider
      value={{ locale, setLocale, t, meta, locales: LOCALE_META, isRtl: !!meta.rtl }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
};

/** Convenience alias matching the common `const { t } = useTranslation()` shape. */
export const useTranslation = (): Pick<I18nContextType, 't' | 'locale'> => {
  const { t, locale } = useI18n();
  return { t, locale };
};
