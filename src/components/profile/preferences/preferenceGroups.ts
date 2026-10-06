import type { TranslationKey } from '@/i18n/locales';

/**
 * The switches and pickers the Preferences tab offers.
 *
 * NOT WIRED. Every row described here is inert: `/users/me` stores a theme, a
 * time zone and a username, and nothing else below. There is no field for a
 * region filter, a display currency, a username-privacy flag, tip handling or
 * marketing consent, so each renders a dead switch rather than one that would
 * appear to save and forget on the next load.
 *
 * Kept as data so that wiring this up is a change to one file: give each row
 * the user's value and an `onToggle`, and the group renderer keeps working.
 * The two genuinely wired parts — Personal and Language — are rendered by
 * their own components instead, because they already have somewhere to write.
 */

interface PrefToggleRow {
  kind: 'toggle';
  key: string;
  labelKey: TranslationKey;
}

interface PrefValueRow {
  kind: 'value';
  key: string;
  labelKey: TranslationKey;
  /** Shown in place of a switch. No picker exists behind it yet. */
  value: string;
  /** Draws the coin the currency row carries in the design. */
  coin?: boolean;
}

export type PrefRow = PrefToggleRow | PrefValueRow;

/** One card, plus the sentence the design prints under it. */
export interface PrefBlock {
  rows: PrefRow[];
  noteKey?: TranslationKey;
}

export interface PrefGroup {
  key: string;
  labelKey: TranslationKey;
  blocks: PrefBlock[];
}

/** Groups the design places above the Language row. */
export const GROUPS_ABOVE_LANGUAGE: readonly PrefGroup[] = [
  {
    key: 'appearance',
    labelKey: 'pref.appearance',
    blocks: [
      {
        rows: [{ kind: 'toggle', key: 'hideUnavailable', labelKey: 'pref.hideUnavailable' }],
        noteKey: 'pref.hideUnavailableNote',
      },
    ],
  },
  {
    key: 'currency',
    labelKey: 'pref.currency',
    blocks: [
      {
        rows: [
          { kind: 'toggle', key: 'cryptoInCash', labelKey: 'pref.displayCryptoInCash' },
          {
            kind: 'value',
            key: 'selectCurrency',
            labelKey: 'pref.selectCurrency',
            value: 'USD',
            coin: true,
          },
        ],
        noteKey: 'pref.currencyNote',
      },
    ],
  },
];

/** Groups the design places below it. */
export const GROUPS_BELOW_LANGUAGE: readonly PrefGroup[] = [
  {
    key: 'privacy',
    labelKey: 'pref.privacy',
    blocks: [
      {
        rows: [{ kind: 'toggle', key: 'hideUsername', labelKey: 'pref.hideUsername' }],
        noteKey: 'pref.hideUsernameNote',
      },
    ],
  },
  {
    key: 'tipping',
    labelKey: 'pref.tipping',
    // Two cards, each with its own sentence — as the design splits them.
    blocks: [
      {
        rows: [{ kind: 'toggle', key: 'acceptTips', labelKey: 'pref.acceptTips' }],
        noteKey: 'pref.acceptTipsNote',
      },
      {
        rows: [
          { kind: 'toggle', key: 'disableTipsNotes', labelKey: 'pref.disableTipsNotifications' },
        ],
        noteKey: 'pref.disableTipsNote',
      },
    ],
  },
  {
    key: 'marketing',
    labelKey: 'pref.marketing',
    blocks: [
      { rows: [{ kind: 'toggle', key: 'receiveMarketing', labelKey: 'pref.receiveMarketing' }] },
    ],
  },
];
