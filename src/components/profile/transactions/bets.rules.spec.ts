import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  betToTx,
  betsCsvFilename,
  betsFilterQueryString,
  betsQueryString,
  betsToCsv,
  csvCell,
  formatUsd,
  multiplierLabel,
  payoutLabel,
  roundEffect,
  shortId,
} from './bets.rules.ts';

const bet = (over: Record<string, unknown> = {}) =>
  ({
    id: '52fc1de9-91bf-460d-9ce8-ab2162725167',
    created_at: '2026-11-01T16:10:00.000Z',
    game_title: "Devil's 13",
    game_image: 'https://img/x.png',
    status: 'BET_WON',
    multiplier: '48.00',
    bet_usd: '1',
    payout_usd: '48',
    ...over,
  }) as never;

describe('formatUsd', () => {
  it('always shows two decimals and a dollar sign', () => {
    assert.equal(formatUsd(1), '$1.00');
    assert.equal(formatUsd('2.5'), '$2.50');
    assert.equal(formatUsd(0), '$0.00');
  });

  it('groups thousands', () => {
    assert.equal(formatUsd(1234567.891), '$1,234,567.89');
  });

  it('rounds half up at the second decimal', () => {
    assert.equal(formatUsd('0.125'), '$0.13');
    assert.equal(formatUsd('0.004'), '$0.00');
  });

  it('shows the minus as a sign, not inside the amount, when asked for a signed figure', () => {
    assert.equal(formatUsd(47, true), '+$47.00');
    assert.equal(formatUsd(-5, true), '-$5.00');
  });

  it('does not sign zero', () => {
    assert.equal(formatUsd(0, true), '$0.00');
  });

  it('shows a negative amount as its size when unsigned', () => {
    assert.equal(formatUsd(-5), '$5.00');
  });
});

describe('betsQueryString', () => {
  it('always sends the page and limit', () => {
    assert.equal(betsQueryString({ query: '', page: 2, pageSize: 11 }), 'page=2&limit=11');
  });

  it('adds a trimmed search, a game and a non-default sort', () => {
    const q = new URLSearchParams(
      betsQueryString({ query: '  reef  ', page: 1, pageSize: 11, game: 'great-reef', sort: 'payout' }),
    );
    assert.equal(q.get('search'), 'reef');
    assert.equal(q.get('game'), 'great-reef');
    assert.equal(q.get('sort'), 'payout');
  });

  it('leaves out an empty search, no game and the default sort', () => {
    const q = new URLSearchParams(
      betsQueryString({ query: '   ', page: 1, pageSize: 11, game: '', sort: 'recent' }),
    );
    assert.equal(q.has('search'), false);
    assert.equal(q.has('game'), false);
    assert.equal(q.has('sort'), false);
  });

  it('encodes what the player typed', () => {
    const qs = betsQueryString({ query: 'a&b=c', page: 1, pageSize: 5 });
    assert.equal(new URLSearchParams(qs).get('search'), 'a&b=c');
  });
});

describe('betToTx', () => {
  it('turns a round into a ledger row', () => {
    const tx = betToTx(bet());
    assert.equal(tx.category, 'BET');
    assert.equal(tx.round, true);
    assert.equal(tx.id, '52fc1de9-91bf-460d-9ce8-ab2162725167');
    assert.equal(tx.status, 'BET_WON');
    assert.equal(tx.amount_usd, 1);
    assert.equal(tx.net_usd, 47);
  });

  it('dates the row by the bet, in UTC', () => {
    assert.equal(betToTx(bet({ created_at: '2026-11-01T23:59:59.000Z' })).date, '2026-11-01');
    assert.equal(betToTx(bet({ created_at: '2026-11-02T00:00:00.000Z' })).date, '2026-11-02');
  });

  it('shows the game where the ledger shows the coin', () => {
    assert.equal(betToTx(bet()).crypto, "Devil's 13");
  });

  it('keeps a game that could not be matched readable', () => {
    assert.equal(betToTx(bet({ game_title: null })).crypto, '—');
  });

  it('has a negative net for a lost round', () => {
    assert.equal(betToTx(bet({ status: 'BET_LOST', payout_usd: '0', bet_usd: '5' })).net_usd, -5);
  });

  it('leaves formatting to the section', () => {
    const tx = betToTx(bet());
    assert.equal(tx.usd, '');
    assert.equal(tx.effect, '');
  });
});

describe('roundEffect', () => {
  it('signs a win with a plus', () => {
    assert.equal(roundEffect('BET_WON', 47), '+$47.00');
  });

  it('signs a loss with a minus', () => {
    assert.equal(roundEffect('BET_LOST', -5), '-$5.00');
  });

  it('is "0" for a break-even round', () => {
    assert.equal(roundEffect('BET_WON', 0), '0');
  });

  it('is "0" for an open round, whatever the figures say', () => {
    assert.equal(roundEffect('BET_PLACED', -1.5), '0');
  });

  it('is a loss when a winning round paid less than the stake', () => {
    assert.equal(roundEffect('BET_WON', -0.5), '-$0.50');
  });
});

describe('payoutLabel and multiplierLabel', () => {
  it('shows Pending, not $0.00, while the round is open', () => {
    assert.equal(payoutLabel({ status: 'BET_PLACED', payout_usd: '0' }, 'Pending'), 'Pending');
    assert.equal(multiplierLabel({ status: 'BET_PLACED', multiplier: '0.00' }), '—');
  });

  it('shows the payout once the round is settled', () => {
    assert.equal(payoutLabel({ status: 'BET_WON', payout_usd: '48' }, 'Pending'), '$48.00');
    assert.equal(payoutLabel({ status: 'BET_LOST', payout_usd: '0' }, 'Pending'), '$0.00');
  });

  it('shows a multiplier with its x, and a dash when there is none', () => {
    assert.equal(multiplierLabel({ status: 'BET_WON', multiplier: '2.50' }), '2.50x');
    assert.equal(multiplierLabel({ status: 'BET_LOST', multiplier: '0.00' }), '0.00x');
    assert.equal(multiplierLabel({ status: 'BET_WON', multiplier: null }), '—');
  });
});

describe('betsFilterQueryString', () => {
  it('carries only the filters, never a page', () => {
    const q = new URLSearchParams(
      betsFilterQueryString({ query: ' reef ', game: 'great-reef', sort: 'multiplier' }),
    );
    assert.equal(q.get('search'), 'reef');
    assert.equal(q.get('game'), 'great-reef');
    assert.equal(q.get('sort'), 'multiplier');
    assert.equal(q.has('page'), false);
  });

  it('is empty when nothing is filtered', () => {
    assert.equal(betsFilterQueryString({ query: '', game: '', sort: 'recent' }), '');
  });
});

describe('shortId', () => {
  it('keeps the start and end of a uuid so it never wraps', () => {
    assert.equal(shortId('424ba2ed-127a-4f3e-b054-1d5d7e2fedf3'), '424ba2ed…2fedf3');
  });

  it('leaves a short id alone', () => {
    assert.equal(shortId('abc'), 'abc');
  });
});

describe('csvCell', () => {
  it('leaves a plain value as it is', () => {
    assert.equal(csvCell('Gates of Aztec'), 'Gates of Aztec');
    assert.equal(csvCell(48), '48');
  });

  it('quotes a value with a comma, a quote or a line break, doubling the quotes', () => {
    assert.equal(csvCell('Rock, Paper'), '"Rock, Paper"');
    assert.equal(csvCell('The "Big" One'), '"The ""Big"" One"');
    assert.equal(csvCell('a\nb'), '"a\nb"');
  });

  it('turns nothing into an empty cell', () => {
    assert.equal(csvCell(null), '');
    assert.equal(csvCell(undefined), '');
  });

  it('defuses a value a spreadsheet would run as a formula', () => {
    assert.equal(csvCell('=SUM(A1:A9)'), "'=SUM(A1:A9)");
    assert.equal(csvCell('+1'), "'+1");
    assert.equal(csvCell('-2'), "'-2");
    assert.equal(csvCell('@cmd'), "'@cmd");
    assert.equal(csvCell('\tTab'), "'\tTab");
  });

  it('defuses and quotes a formula that also holds a comma', () => {
    assert.equal(csvCell('=HYPERLINK("x","y")'), `"'=HYPERLINK(""x"",""y"")"`);
  });

  it('does not touch a dash or equals sign in the middle', () => {
    assert.equal(csvCell('Devil-s 13 = lucky'), 'Devil-s 13 = lucky');
  });
});

describe('betsToCsv', () => {
  const rows = [
    bet(),
    bet({
      id: 'b2',
      status: 'BET_PLACED',
      multiplier: '0.00',
      bet_usd: '1.5',
      payout_usd: '0',
      game_title: 'Rock, Paper',
      game_provider: 'Pragmatic Play',
      provider_round_id: '777',
    }),
    bet({
      id: 'b3',
      status: 'BET_LOST',
      multiplier: '0.00',
      bet_usd: '5',
      payout_usd: '0',
      game_title: '=EVIL()',
    }),
  ];
  const text = betsToCsv(rows);
  const lines = text.replace(/^﻿/, '').trimEnd().split('\r\n');

  it('starts with a BOM so Excel reads UTF-8', () => {
    assert.equal(text.charCodeAt(0), 0xfeff);
  });

  it('has a header and one line per bet', () => {
    assert.equal(
      lines[0],
      'Bet ID,Game,Provider,Date (UTC),Bet (USD),Multiplier,Payout (USD),Status,Game Round ID',
    );
    assert.equal(lines.length, 4);
  });

  it('writes a settled bet with its figures and status word', () => {
    assert.equal(
      lines[1],
      "52fc1de9-91bf-460d-9ce8-ab2162725167,Devil's 13,,2026-11-01T16:10:00.000Z,1,48.00,48,Won,",
    );
  });

  it('leaves multiplier and payout empty for an open round, and quotes a title with a comma', () => {
    assert.equal(
      lines[2],
      'b2,"Rock, Paper",Pragmatic Play,2026-11-01T16:10:00.000Z,1.5,,,Pending,777',
    );
  });

  it('defuses a title that starts like a formula', () => {
    assert.ok(lines[3].startsWith("b3,'=EVIL(),"));
  });

  it('is just the header for no bets', () => {
    assert.equal(betsToCsv([]).replace(/^﻿/, ''), lines[0] + '\r\n');
  });

  it('ends with a line break', () => {
    assert.ok(text.endsWith('\r\n'));
  });
});

describe('betsCsvFilename', () => {
  it('is dated', () => {
    assert.equal(betsCsvFilename(new Date('2026-11-02T09:00:00Z')), 'rolluck-bets-2026-11-02.csv');
  });
});
