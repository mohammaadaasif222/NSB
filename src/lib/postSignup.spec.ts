import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  donePostSignup,
  markPostSignup,
  postSignupPending,
  subscribePostSignup,
  takePostSignup,
} from './postSignup.ts';

const g = globalThis as Record<string, unknown>;

const storage = (): Storage => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  } as Storage;
};

describe('postSignup', () => {
  beforeEach(() => {
    g.window = {};
    g.sessionStorage = storage();
    donePostSignup();
  });

  it('is not pending until a signup marks it', () => {
    assert.equal(postSignupPending(), false);
    assert.equal(takePostSignup(), false);
  });

  it('is claimed once per signup, but stays pending until done', () => {
    markPostSignup();
    assert.equal(postSignupPending(), true);

    assert.equal(takePostSignup(), true);
    assert.equal(takePostSignup(), false, 'a second sign-in does not show it again');
    assert.equal(postSignupPending(), true, 'the popup is still up, so others keep waiting');

    donePostSignup();
    assert.equal(postSignupPending(), false);
    assert.equal(takePostSignup(), false);
  });

  it('survives a page reload through storage and then expires', () => {
    markPostSignup();
    donePostSignup();
    g.sessionStorage = storage();
    (g.sessionStorage as Storage).setItem('rl_post_signup', String(Date.now() - 60 * 1000));
    assert.equal(takePostSignup(), true);
    donePostSignup();

    (g.sessionStorage as Storage).setItem('rl_post_signup', String(Date.now() - 5 * 60 * 1000));
    assert.equal(postSignupPending(), false, 'a signup that never got a session is ignored');
  });

  it('still works when storage refuses', () => {
    g.sessionStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    markPostSignup();
    assert.equal(takePostSignup(), true);
    donePostSignup();
    assert.equal(postSignupPending(), false);
  });

  it('lets go of a signup that never got a session, even in memory', (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: 1_000_000 });
    markPostSignup();
    assert.equal(postSignupPending(), true);
    t.mock.timers.tick(3 * 60 * 1000);
    assert.equal(postSignupPending(), false);
    assert.equal(takePostSignup(), false);
  });

  it('tells subscribers when it changes', () => {
    let calls = 0;
    const off = subscribePostSignup(() => (calls += 1));
    markPostSignup();
    takePostSignup();
    donePostSignup();
    off();
    markPostSignup();
    assert.equal(calls, 3);
  });

  it('does nothing on the server', () => {
    delete g.window;
    markPostSignup();
    assert.equal(postSignupPending(), false);
  });
});
