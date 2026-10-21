import { createContext, useContext, useEffect, type FC, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import {
  DICTIONARIES,
  LOCALE_META,
  LOCALES,
  type Locale,
  type LocaleMeta,
  type TranslationKey,
} from '@/i18n/locales';

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

const NO_PREFERENCE_REDIRECT = /^\/(auth|play)\//;

const isLocale = (v: string | null | undefined): v is Locale =>
  !!v && (LOCALES as readonly string[]).includes(v);

const metaFor = (l: Locale): LocaleMeta => LOCALE_META.find((m) => m.code === l) ?? LOCALE_META[0];

const readPreference = (): Locale | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
};

const writePreference = (l: Locale): void => {
  try {
    localStorage.setItem(STORAGE_KEY, l);
  } catch {
    return;
  }
};

export const I18nProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const locale: Locale = isLocale(router.locale) ? router.locale : DEFAULT_LOCALE;

  // Keep <html lang> and dir in step — Arabic needs RTL.
  useEffect(() => {
    const m = metaFor(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = m.rtl ? 'rtl' : 'ltr';
  }, [locale]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const preferred = readPreference();
    if (
      preferred &&
      preferred !== locale &&
      locale === DEFAULT_LOCALE &&
      !NO_PREFERENCE_REDIRECT.test(router.pathname)
    ) {
      void router.replace(router.asPath, undefined, { locale: preferred, scroll: false });
    }
  }, [router, locale]);

  const setLocale = (next: Locale): void => {
    writePreference(next);
    if (next !== locale) {
      void router.push(router.asPath, undefined, { locale: next, scroll: false });
    }
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
