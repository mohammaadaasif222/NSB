/**
 * Signed-in devices for the Security tab.
 *
 * NOT WIRED — invented. There is no sessions endpoint anywhere in the app:
 * nothing lists active logins and nothing revokes one, so "End Sessions" and
 * "End All Sessions" have nowhere to post. The rows exist because the design
 * needs something to show; the buttons are inert rather than accepting a click
 * and doing nothing.
 *
 * Kept in its own module so wiring this up is a change to one file. When the
 * endpoint lands, replace this with the response and give the group an
 * `onEnd(id)` — the row component already takes a session as data.
 */
export interface PlayerSession {
  id: string;
  /** Platform and browser, as the design labels the row. */
  device: string;
  ip: string;
  location: string;
  /**
   * Days since the session was last active. Formatted in the player's language
   * by the row; the API should send a timestamp instead.
   */
  lastSeenDaysAgo: number;
  /** The session doing the asking — it cannot be ended from here. */
  current: boolean;
}

export const MOCK_SESSIONS: readonly PlayerSession[] = [
  {
    id: 'current',
    device: 'Windows(Chrome)',
    ip: '45.88.190.123',
    location: 'CA, Montréal',
    lastSeenDaysAgo: 2,
    current: true,
  },
];
