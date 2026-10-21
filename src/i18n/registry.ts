import { SERVER_DICTIONARIES } from './dictionaries.server';
import { EN_DICTIONARY, type Locale, type PartialDictionary, type TranslationKey } from './locales';

export const EMBEDDED_DICTIONARY_ID = '__I18N_DICTIONARY__';

const loaded = new Map<Locale, PartialDictionary>();

const readEmbedded = (locale: Locale): PartialDictionary | undefined => {
  if (typeof document === 'undefined') {
    return undefined;
  }
  const el = document.getElementById(EMBEDDED_DICTIONARY_ID);
  if (!el || el.dataset.locale !== locale || !el.textContent) {
    return undefined;
  }
  try {
    const dict = JSON.parse(el.textContent) as PartialDictionary;
    loaded.set(locale, dict);
    return dict;
  } catch {
    return undefined;
  }
};

export const dictionaryFor = (locale: Locale): PartialDictionary | undefined =>
  locale === 'en'
    ? EN_DICTIONARY
    : (loaded.get(locale) ?? SERVER_DICTIONARIES[locale] ?? readEmbedded(locale));

export const loadDictionary = async (locale: Locale): Promise<void> => {
  if (dictionaryFor(locale)) {
    return;
  }
  const mod = (await import(`./translations/${locale}.json`)) as { default: PartialDictionary };
  loaded.set(locale, mod.default);
};

export const formatMessage = (
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string => {
  let out: string = dictionaryFor(locale)?.[key] ?? EN_DICTIONARY[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return out;
};
