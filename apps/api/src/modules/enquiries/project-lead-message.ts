import type { ProjectEnquiryInput } from '@nsb/shared';

/**
 * A real estate lead's form answers, saved as its message (shown in the admin and the alert
 * email). The export reads them back with projectLeadAnswers(), so both use these labels.
 */
const LABELS = {
  isDealer: 'Property dealer',
  buyWithin: 'Planning to buy in',
  homeLoan: 'Interested in a home loan',
  siteVisit: 'Interested in site visits',
  message: 'Message',
} as const;

const yesNo = (v: boolean) => (v ? 'Yes' : 'No');

export const projectLeadMessage = (input: ProjectEnquiryInput) =>
  [
    `${input.source} request`,
    `${LABELS.isDealer}: ${yesNo(input.isDealer)}`,
    `${LABELS.buyWithin}: ${input.buyWithin ?? 'Not given'}`,
    `${LABELS.homeLoan}: ${yesNo(input.homeLoan)}`,
    `${LABELS.siteVisit}: ${yesNo(input.siteVisit)}`,
    // Last, as the visitor's text may run over several lines.
    ...(input.message ? [`${LABELS.message}: ${input.message}`] : []),
  ].join('\n');

export type ProjectLeadAnswers = Record<keyof typeof LABELS, string>;

/** The answers in a message from projectLeadMessage(); blank where a line is missing. */
export function projectLeadAnswers(message: string): ProjectLeadAnswers {
  const answers: ProjectLeadAnswers = { isDealer: '', buyWithin: '', homeLoan: '', siteVisit: '', message: '' };
  const lines = message.split('\n');
  for (const [i, line] of lines.entries()) {
    const key = (Object.keys(LABELS) as (keyof typeof LABELS)[]).find((k) => line.startsWith(`${LABELS[k]}: `));
    if (!key) continue;
    const value = line.slice(LABELS[key].length + 2);
    if (key === 'message') {
      answers.message = [value, ...lines.slice(i + 1)].join('\n').trim();
      break;
    }
    answers[key] = value;
  }
  return answers;
}
