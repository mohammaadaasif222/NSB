/**
 * A service line in the admin's one-per-line boxes can carry a detail after a `|`, e.g.
 * "Breakout rooms | 28 rooms | Included in rent". The listing page shows the detail under the
 * name; cards, chips and emails show the name only. A line without `|` is just a name, so
 * existing listings are unchanged.
 */
export const SERVICE_DETAIL_SEPARATOR = '|';

export interface ServiceParts {
  title: string;
  /** Extra `|` parts joined with " · "; null when the line has no detail. */
  detail: string | null;
}

export function parseService(text: string): ServiceParts {
  const [first = '', ...rest] = text.split(SERVICE_DETAIL_SEPARATOR).map((s) => s.trim());
  const detail = rest.filter(Boolean).join(' · ');
  return { title: first || text.trim(), detail: detail || null };
}

/** The service's name without its detail. */
export const serviceTitle = (text: string): string => parseService(text).title;
