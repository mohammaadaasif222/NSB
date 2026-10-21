import { createContext, useContext, useEffect, useState, type FC, type ReactNode } from 'react';
import Router, { useRouter } from 'next/router';
import { localizedPath } from '@/constants/site';
import {
  LOCALE_META,
  LOCALES,
  type Locale,
  type LocaleMeta,
  type TranslationKey,
} from '@/i18n/locales';
import { dictionaryFor, formatMessage, loadDictionary } from '@/i18n/registry';

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

const ensureDictionary = (l: Locale): Promise<void> => loadDictionary(l).catch(() => undefined);

const switchLocale = (next: Locale, replace: boolean, isActive: () => boolean): void => {
  void loadDictionary(next).then(
    () => {
      if (!isActive()) {
        return;
      }
      const options = { locale: next, scroll: false };
      void (replace
        ? Router.replace(Router.asPath, undefined, options)
        : Router.push(Router.asPath, undefined, options));
    },
    () => {
      if (!isActive()) {
        return;
      }
      const url = localizedPath(next, Router.asPath);
      if (replace) {
        window.location.replace(url);
      } else {
        window.location.assign(url);
      }
    }
  );
};

export const I18nProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const locale: Locale = isLocale(router.locale) ? router.locale : DEFAULT_LOCALE;
  const [, setLoadedCount] = useState(0);

  useEffect(() => {
    if (dictionaryFor(locale)) {
      return;
    }
    let active = true;
    void ensureDictionary(locale).then(() => {
      if (active) {
        setLoadedCount((n) => n + 1);
      }
    });
    return () => {
      active = false;
    };
  }, [locale]);

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
      !preferred ||
      preferred === locale ||
      locale !== DEFAULT_LOCALE ||
      NO_PREFERENCE_REDIRECT.test(router.pathname)
    ) {
      return;
    }
    let active = true;
    switchLocale(preferred, true, () => active);
    return () => {
      active = false;
    };
  }, [router, locale]);

  const setLocale = (next: Locale): void => {
    writePreference(next);
    if (next !== locale) {
      switchLocale(next, false, () => true);
    }
  };

  const t = (key: TranslationKey, vars?: Record<string, string | number>): string =>
    formatMessage(locale, key, vars);

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
