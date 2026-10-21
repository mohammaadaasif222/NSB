import { dictionary, type Locale, type PartialDictionary } from './locales';
import ar from './translations/ar.json';
import tr from './translations/tr.json';
import hi from './translations/hi.json';
import fr from './translations/fr.json';
import ru from './translations/ru.json';
import pt from './translations/pt.json';
import es from './translations/es.json';
import it from './translations/it.json';

export const SERVER_DICTIONARIES: Partial<Record<Locale, PartialDictionary>> = {
  ar: dictionary(ar),
  tr: dictionary(tr),
  hi: dictionary(hi),
  fr: dictionary(fr),
  ru: dictionary(ru),
  pt: dictionary(pt),
  es: dictionary(es),
  it: dictionary(it),
};
