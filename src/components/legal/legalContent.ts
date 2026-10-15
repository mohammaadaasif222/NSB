/**
 * The text of a page written in the admin console (CRM → Terms and conditions),
 * turned into the blocks `LegalPanel` draws.
 *
 * The format is deliberately small: a blank line ends a block, `## ` starts a
 * heading, lines starting `- ` make a list, and a line wrapped in `**` is bold
 * (the closing lines the design sets in bold). Anything else is a paragraph.
 * Kept in step with the preview in rlk-admin's CrmTermsFormPage.
 */
export type LegalBlock =
  | { kind: 'h'; id: string; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'b'; text: string }
  | { kind: 'ul'; items: string[] };

export interface LegalPageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

/** "6. Bonuses & Promotions" → "bonuses-promotions", for deep links. */
const headingId = (text: string, taken: Set<string>): string => {
  const base =
    text
      .replace(/^\d+\.\s*/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section';
  let id = base;
  for (let n = 2; taken.has(id); n += 1) {
    id = `${base}-${n}`;
  }
  taken.add(id);
  return id;
};

export const parseLegalContent = (content: string): LegalBlock[] => {
  const taken = new Set<string>();
  return content
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block): LegalBlock => {
      const lines = block.split('\n').map((line) => line.trim());
      if (lines.length === 1 && lines[0].startsWith('## ')) {
        const text = lines[0].slice(3).trim();
        return { kind: 'h', id: headingId(text, taken), text };
      }
      if (lines.every((line) => /^[-*] /.test(line))) {
        return { kind: 'ul', items: lines.map((line) => line.slice(2).trim()) };
      }
      const bold = /^\*\*([\s\S]+)\*\*$/.exec(block);
      if (bold) {
        return { kind: 'b', text: bold[1].trim() };
      }
      return { kind: 'p', text: lines.join(' ') };
    });
};
