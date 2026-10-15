/**
 * Responsible Gambling copy written in the admin console (CRM -> Help Center).
 *
 * Page sections arrive as one string: blocks separated by a blank line, and
 * inside a block every line is its own paragraph. A section the console has no
 * entry for falls back to the built-in copy, so deleting an entry never leaves
 * a blank page.
 */
export type HelpSectionKey = 'faqs' | 'assessment' | 'limits' | 'exclusion' | 'budget';

export interface HelpItem {
  id: string;
  section: HelpSectionKey;
  title: string;
  content: string;
}

export interface HelpCenterData {
  enabled: boolean;
  sections: Record<HelpSectionKey, boolean>;
  items: HelpItem[];
}

/** The text of a page section: its heading and body. */
export interface HelpEntry {
  title: string;
  content: string;
}

/** Blocks of lines — `[[line, line], [line]]`. */
export const blocksOf = (content: string): string[][] =>
  content
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    )
    .filter((lines) => lines.length > 0);

/** The single entry a page section is written as, when there is one. */
export const entryFor = (items: readonly HelpItem[], section: HelpSectionKey): HelpEntry | undefined => {
  const item = items.find((i) => i.section === section);
  return item ? { title: item.title, content: item.content } : undefined;
};
