import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { countryNameFor } from './countryName.ts';

describe('countryNameFor', () => {
  it('names the country in the given language', () => {
    assert.equal(countryNameFor('BRL', 'BR', 'en'), 'Brazil');
    assert.equal(countryNameFor('BRL', 'BR', 'pt'), 'Brasil');
    assert.equal(countryNameFor('INR', 'IN', 'en'), 'India');
  });

  it('reads the euro as the European Union, not as the one member in its country code', () => {
    assert.equal(countryNameFor('EUR', 'DE', 'en'), 'European Union');
    assert.equal(countryNameFor('eur', 'DE', 'en'), 'European Union');
  });

  it('ignores the case of the country code', () => {
    assert.equal(countryNameFor('GBP', 'gb', 'en'), 'United Kingdom');
  });

  it('is empty when there is no usable country code', () => {
    assert.equal(countryNameFor('XXX', null, 'en'), '');
    assert.equal(countryNameFor('XXX', undefined, 'en'), '');
    assert.equal(countryNameFor('XXX', '', 'en'), '');
    assert.equal(countryNameFor('XXX', 'BRA', 'en'), '');
  });

  it('survives a locale the runtime rejects', () => {
    assert.equal(countryNameFor('BRL', 'BR', 'not a locale!!'), 'BR');
  });
});
