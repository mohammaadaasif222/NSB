import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { betLimitShown } from './betLimits.ts';

const eurGame = { bet_currency: 'EUR', bet_currency_rate: 1.12 };

describe('betLimitShown', () => {
  it('is null when the game publishes no figure', () => {
    assert.equal(betLimitShown(null, eurGame, 'USD', null), null);
  });

  it('converts EUR limits to USD for a USD (or guest) player', () => {
    const shown = betLimitShown(100, eurGame, 'USD', null);
    assert.ok(shown?.kind === 'display' && Math.abs(shown.usd - 112) < 1e-9);
  });

  it('routes EUR limits through USD for a player shown another fiat', () => {
    // 10 EUR → 11.2 USD; formatCurrencyDisplay then divides by the INR snapshot.
    const shown = betLimitShown(10, eurGame, 'INR', 0.012);
    assert.equal(shown?.kind, 'display');
    assert.ok(shown?.kind === 'display' && Math.abs(shown.usd - 11.2) < 1e-9);
  });

  it('uses the player snapshot rate when they read the bet currency, so the figure is exact', () => {
    // Snapshot 1.1389 differs from the market 1.12; 0.10 EUR must still read 0.10 EUR.
    const shown = betLimitShown(0.1, eurGame, 'EUR', 1.1389);
    assert.ok(shown?.kind === 'display');
    assert.equal(Number((shown.usd / 1.1389).toFixed(8)), 0.1);
  });

  it('treats a null bet currency as USD, converting to the display fiat', () => {
    assert.deepEqual(betLimitShown(5, { bet_currency: null, bet_currency_rate: 1 }, 'EUR', 1.1), {
      kind: 'display',
      usd: 5,
    });
  });

  it('shows the published figure and currency when the bet currency has no rate', () => {
    assert.deepEqual(
      betLimitShown(2, { bet_currency: 'EUR', bet_currency_rate: null }, 'INR', 0.012),
      {
        kind: 'published',
        amount: 2,
        currency: 'EUR',
      }
    );
    // An API from before bet_currency_rate existed.
    assert.equal(betLimitShown(2, { bet_currency: 'EUR' }, 'USD', null)?.kind, 'published');
  });

  it('shows the published figure when the display currency has no snapshot rate', () => {
    assert.deepEqual(betLimitShown(2, { bet_currency: null, bet_currency_rate: 1 }, 'BRL', null), {
      kind: 'published',
      amount: 2,
      currency: 'USD',
    });
  });
});
