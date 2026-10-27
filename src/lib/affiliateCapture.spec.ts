import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

const store = new Map<string, string>();
Object.defineProperty(globalThis, 'window', { value: globalThis, configurable: true });
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
});

const { affiliateField, captureAffiliateTag, clearAffiliateTag, storedAffiliateTag } = await import(
  './affiliateCapture.ts'
);

describe('affiliate stag capture', () => {
  beforeEach(() => store.clear());

  it('keeps a valid stag and sends it as affiliate_tag', () => {
    captureAffiliateTag(' 1816_6ad9e9ae93282e040f994943 ');
    assert.equal(storedAffiliateTag(), '1816_6ad9e9ae93282e040f994943');
    assert.deepEqual(affiliateField(), { affiliate_tag: '1816_6ad9e9ae93282e040f994943' });
  });

  it('ignores anything that is not a stag', () => {
    for (const bad of ['', '1816', 'a b_c', '1_2_3', '<script>_x', 42]) captureAffiliateTag(bad);
    assert.equal(storedAffiliateTag(), null);
    assert.deepEqual(affiliateField(), {});
  });

  it('the latest affiliate link wins', () => {
    captureAffiliateTag('1816_aaa');
    captureAffiliateTag('2001_bbb');
    assert.equal(storedAffiliateTag(), '2001_bbb');
  });

  it('forgets the stag after 30 days, or once the player has signed up', () => {
    store.set('rlk_stag', JSON.stringify({ tag: '1816_aaa', at: Date.now() - 31 * 24 * 3600 * 1000 }));
    assert.equal(storedAffiliateTag(), null);
    assert.equal(store.has('rlk_stag'), false);

    captureAffiliateTag('1816_aaa');
    clearAffiliateTag();
    assert.equal(storedAffiliateTag(), null);
  });
});
