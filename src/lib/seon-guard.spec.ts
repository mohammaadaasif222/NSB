import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import {
  SeonStepUpCancelledError,
  extractChallenge,
  isStepUpCancelled,
  isStepUpRequired,
  stepUpHeaders,
} from './seon-guard.ts';

/**
 * The client half of the step-up contract.
 *
 * These matter because the axios interceptor rejects with `error.response.data`
 * — the body, with no status attached. So the client cannot branch on 428; it
 * branches on the `code` field, and getting that wrong means a step-up
 * silently becomes a failed withdrawal.
 *
 * Run with `npm test` (Node's built-in runner — no test framework installed).
 */

const challenge = (over: Record<string, unknown> = {}) => ({
  success: false,
  message: 'Please confirm this with the code we just sent to pl***@example.com.',
  code: 'SEON_STEP_UP_REQUIRED',
  requiresStepUp: true,
  stepUpToken: 'token-abc',
  stepUpExpiresIn: 300,
  sentTo: 'pl***@example.com',
  action: 'withdrawal',
  ...over,
});

describe('isStepUpRequired', () => {
  it('recognises a step-up rejection', () => {
    assert.equal(isStepUpRequired(challenge()), true);
  });

  it('ignores ordinary API failures', () => {
    // These must fall through to the caller's normal error handling.
    assert.equal(isStepUpRequired({ success: false, message: 'Insufficient balance' }), false);
    assert.equal(isStepUpRequired({ code: 'KYC_REQUIRED', message: 'Verify first' }), false);
    assert.equal(isStepUpRequired({ message: 'Network error', offline: true }), false);
  });

  it('refuses a challenge with no token — there would be nothing to retry with', () => {
    assert.equal(isStepUpRequired(challenge({ stepUpToken: undefined })), false);
    assert.equal(isStepUpRequired(challenge({ stepUpToken: 123 })), false);
  });

  it('survives junk', () => {
    for (const value of [null, undefined, 'a string', 42, []]) {
      assert.equal(isStepUpRequired(value), false, String(value));
    }
  });
});

describe('extractChallenge', () => {
  it('pulls out everything the prompt needs', () => {
    const result = extractChallenge(challenge());
    assert.equal(result?.stepUpToken, 'token-abc');
    assert.equal(result?.expiresIn, 300);
    assert.equal(result?.sentTo, 'pl***@example.com');
    assert.equal(result?.action, 'withdrawal');
  });

  it('returns null for anything that is not a challenge', () => {
    assert.equal(extractChallenge({ message: 'Insufficient balance' }), null);
    assert.equal(extractChallenge(null), null);
  });

  it('falls back sensibly when optional fields are missing', () => {
    const result = extractChallenge(
      challenge({
        stepUpExpiresIn: undefined,
        sentTo: undefined,
        action: undefined,
        message: undefined,
      })
    );
    assert.equal(result?.expiresIn, 300);
    assert.equal(result?.sentTo, null);
    assert.equal(result?.action, 'request');
    assert.equal(typeof result?.message, 'string');
  });

  it('keeps sentTo masked — the full address must never reach the client', () => {
    const result = extractChallenge(challenge());
    assert.equal(result?.sentTo?.includes('player@'), false);
    assert.match(result?.sentTo ?? '', /\*\*\*/);
  });
});

describe('stepUpHeaders', () => {
  it('builds exactly the two headers the backend reads', () => {
    assert.deepEqual(stepUpHeaders('tok', '123456'), {
      'X-Step-Up-Token': 'tok',
      'X-Step-Up-Otp': '123456',
    });
  });
});

describe('SeonStepUpCancelledError', () => {
  it('is recognisable, so closing the prompt shows no error toast', () => {
    // A security prompt that looks like a malfunction is one people learn to
    // dismiss, so cancelling must be distinguishable from failing.
    assert.equal(isStepUpCancelled(new SeonStepUpCancelledError()), true);
  });

  it('is recognisable across a realm boundary, by name', () => {
    assert.equal(isStepUpCancelled({ name: 'SeonStepUpCancelledError' }), true);
  });

  it('does not swallow real errors', () => {
    assert.equal(isStepUpCancelled(new Error('Insufficient balance')), false);
    assert.equal(isStepUpCancelled({ message: 'Withdrawal failed' }), false);
    assert.equal(isStepUpCancelled(null), false);
  });
});
