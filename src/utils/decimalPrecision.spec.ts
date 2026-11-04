import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  displayDecimal,
  exportDecimal,
  formatDecimal,
  roundDecimal,
  setPrecisionRules,
  updatePrecisionRule,
  type RoundingMode,
} from './decimalPrecision.ts';

describe('roundDecimal', () => {
  it('matches the documented precision table for 10.234567', () => {
    ['10', '10.2', '10.23', '10.235', '10.2346', '10.23457'].forEach((out, places) => {
      assert.equal(roundDecimal('10.234567', places, 'HALF_UP'), out);
    });
  });

  it('applies all six rounding modes to positive and negative halves', () => {
    const table: Record<RoundingMode, [string, string]> = {
      HALF_UP: ['2.35', '-2.35'],
      HALF_EVEN: ['2.34', '-2.34'],
      DOWN: ['2.34', '-2.34'],
      UP: ['2.35', '-2.35'],
      FLOOR: ['2.34', '-2.35'],
      CEILING: ['2.35', '-2.34'],
    };
    for (const [mode, [pos, neg]] of Object.entries(table) as [RoundingMode, [string, string]][]) {
      assert.equal(roundDecimal('2.345', 2, mode), pos, `${mode} +`);
      assert.equal(roundDecimal('-2.345', 2, mode), neg, `${mode} -`);
    }
  });

  it('is exact, carries, and handles zero, null and junk', () => {
    assert.equal(roundDecimal('1.005', 2, 'HALF_UP'), '1.01');
    assert.equal(roundDecimal('9.995', 2, 'HALF_UP'), '10.00');
    assert.equal(roundDecimal('-0.004', 2, 'HALF_UP'), '0.00');
    assert.equal(roundDecimal(0, 3, 'HALF_UP'), '0.000');
    assert.equal(roundDecimal(null, 2, 'HALF_UP'), null);
    assert.equal(roundDecimal('n/a', 2, 'HALF_UP'), null);
  });
});

describe('feature rules', () => {
  it('returns null for a missing or disabled feature so the caller keeps its own format', () => {
    setPrecisionRules({});
    assert.equal(displayDecimal('10.23456789', 'wallet.balances', 'en-US'), null);
    assert.equal(exportDecimal('10.23456789', 'casino.game_reports'), '10.23456789');
  });

  it('formats with the configured rule without touching the input', () => {
    const original = '12345.23456789';
    updatePrecisionRule('wallet.balances', { precision: 4, rounding_mode: 'HALF_UP' });
    assert.equal(displayDecimal(original, 'wallet.balances', 'en-US'), '12,345.2346');
    updatePrecisionRule('wallet.balances', { precision: 2, rounding_mode: 'DOWN' });
    assert.equal(displayDecimal(original, 'wallet.balances', 'en-US'), '12,345.23');
    assert.equal(original, '12345.23456789');
    assert.equal(displayDecimal(original, 'casino.bets', 'en-US'), null);
    updatePrecisionRule('wallet.balances', null);
    assert.equal(displayDecimal(original, 'wallet.balances', 'en-US'), null);
  });

  it('rounds exports without grouping', () => {
    updatePrecisionRule('casino.game_reports', { precision: 1, rounding_mode: 'CEILING' });
    assert.equal(exportDecimal('1234.21', 'casino.game_reports'), '1234.3');
    assert.equal(
      formatDecimal('-1234.21', { precision: 0, rounding_mode: 'FLOOR' }, 'en-US'),
      '-1,235'
    );
    setPrecisionRules({});
  });
});
