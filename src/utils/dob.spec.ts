import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { ageOn, birthYears, composeDob, daysInMonth, isAdult, splitDob } from './dob.ts';

const NOW = new Date('2026-09-28T12:00:00Z');

/**
 * The client half of the age gate. It does not decide anything — the server
 * runs the same rule and is the authority — but it is what stops a player
 * being told "no" only after a round trip, and what stops the picker
 * offering 31 February.
 */
describe('daysInMonth', () => {
  it('knows the short months', () => {
    assert.equal(daysInMonth('04', '2026').length, 30);
    assert.equal(daysInMonth('02', '2026').length, 28);
  });

  it('knows a leap year', () => {
    assert.equal(daysInMonth('02', '2024').length, 29);
  });

  it('assumes a leap year before a year is picked', () => {
    // Otherwise someone born on 29 February cannot select their own
    // birthday until they have chosen the year first.
    assert.equal(daysInMonth('02', '').length, 29);
  });

  it('offers 31 before a month is picked', () => {
    assert.equal(daysInMonth('', '').length, 31);
  });

  it('pads to two digits, matching the API format', () => {
    assert.equal(daysInMonth('01', '2026')[0], '01');
  });
});

describe('composeDob', () => {
  it('builds the YYYY-MM-DD the API takes', () => {
    assert.equal(composeDob('17', '04', '1995'), '1995-04-17');
  });

  it('pads a single-digit day or month', () => {
    assert.equal(composeDob('7', '4', '1995'), '1995-04-07');
  });

  it('returns null until all three are chosen', () => {
    // A partial date must not be submittable — the form used to pre-fill
    // these and silently send a birthday nobody entered.
    assert.equal(composeDob('', '04', '1995'), null);
    assert.equal(composeDob('17', '', '1995'), null);
    assert.equal(composeDob('17', '04', ''), null);
  });
});

describe('splitDob', () => {
  it('round-trips with composeDob', () => {
    const parts = splitDob('1995-04-17');
    assert.equal(composeDob(parts.day, parts.month, parts.year), '1995-04-17');
  });

  it('returns empty parts for anything unusable', () => {
    for (const input of [null, undefined, '', 'not-a-date', '1995-04']) {
      assert.deepEqual(splitDob(input), { day: '', month: '', year: '' });
    }
  });
});

describe('ageOn', () => {
  it('counts completed years', () => {
    assert.equal(ageOn('1995-04-17', NOW), 31);
  });

  it('does not count a birthday that has not happened yet this year', () => {
    assert.equal(ageOn('1995-12-31', NOW), 30);
  });

  it('counts the birthday itself', () => {
    assert.equal(ageOn('1995-09-28', NOW), 31);
  });

  it('returns null for a date that is not a real day', () => {
    // 31 February parses in a naive implementation and rolls into March.
    assert.equal(ageOn('2000-02-31', NOW), null);
    assert.equal(ageOn('garbage', NOW), null);
  });
});

describe('isAdult', () => {
  it('accepts someone on their eighteenth birthday', () => {
    assert.equal(isAdult('2008-09-28', NOW), true);
  });

  it('refuses someone one day short', () => {
    assert.equal(isAdult('2008-09-29', NOW), false);
  });

  it('refuses an unusable date rather than letting it through', () => {
    // A broken date must not be the cheapest way past an age check.
    assert.equal(isAdult('2000-02-31', NOW), false);
    assert.equal(isAdult('', NOW), false);
  });
});

describe('birthYears', () => {
  it('does not offer a year that is certainly underage', () => {
    const years = birthYears(NOW).map(Number);
    assert.equal(Math.max(...years), 2026 - 18);
  });

  it('reaches far enough back to cover a real lifespan', () => {
    const years = birthYears(NOW).map(Number);
    assert.ok(Math.min(...years) <= 1930);
  });

  it('is ordered newest first, where most players will be', () => {
    const years = birthYears(NOW).map(Number);
    assert.ok(years[0] > years[years.length - 1]);
  });
});
