import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { compact, resolveDestinations } from './routing.rules.ts';

describe('compact', () => {
  it('drops undefined and null but keeps falsy values that mean something', () => {
    assert.deepEqual(
      compact({ a: undefined, b: null, zero: 0, empty: '', no: false }),
      { zero: 0, empty: '', no: false }
    );
  });
});

describe('resolveDestinations', () => {
  it('sends to all three destinations by default', () => {
    const to = resolveDestinations('login', { method: 'google' });

    assert.deepEqual(to.ga, { name: 'login', params: { method: 'google' } });
    assert.deepEqual(to.clarity, { name: 'login' });
    assert.deepEqual(to.internal, { name: 'login', params: { method: 'google' } });
    assert.equal(to.upgrade, null);
  });

  it('keeps GA4 reserved names while storing our own name internally', () => {
    // The case this whole mechanism exists for: GA4 needs `sign_up` for its
    // conversion reporting, and analytics_events already holds rows under
    // `signup_complete`.
    const to = resolveDestinations('sign_up', { method: 'steam' }, {
      internalName: 'signup_complete',
    });

    assert.equal(to.ga.name, 'sign_up');
    assert.equal(to.internal?.name, 'signup_complete');
    // Clarity follows GA4's name, not the internal one.
    assert.equal(to.clarity?.name, 'sign_up');
  });

  it('suppresses the internal copy when asked, without touching GA4', () => {
    const to = resolveDestinations('page_view', { path: '/' }, { internal: false });

    assert.equal(to.internal, null);
    assert.equal(to.ga.name, 'page_view');
  });

  it('keeps high-frequency events out of Clarity but still records them', () => {
    // Clarity caps how many distinct event names a project may have, so the
    // lobby impression event is excluded there and nowhere else.
    const to = resolveDestinations('game_impression', { count: 48 }, { clarity: false });

    assert.equal(to.clarity, null);
    assert.equal(to.internal?.name, 'game_impression');
    assert.equal(to.ga.name, 'game_impression');
  });

  it('passes the Clarity recording upgrade through', () => {
    const to = resolveDestinations('kyc_submitted', {}, { upgrade: 'kyc_submitted' });
    assert.equal(to.upgrade, 'kyc_submitted');
  });

  it('strips empty params for every destination, not just GA4', () => {
    const to = resolveDestinations('deposit_abandoned', {
      currency: null,
      network: undefined,
      address_shown: true,
    });

    assert.deepEqual(to.ga.params, { address_shown: true });
    assert.deepEqual(to.internal?.params, { address_shown: true });
  });

  it('gives the same params object shape to GA4 and the internal stream', () => {
    // They must not drift: a report built on one and a chart built on the
    // other would disagree for reasons nobody could see.
    const to = resolveDestinations('purchase', { value: 25, currency: 'USD' });
    assert.deepEqual(to.ga.params, to.internal?.params);
  });
});
