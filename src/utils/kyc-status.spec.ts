import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getKycRejectReason, readKycError, resolveKycGateState } from './kyc-status.ts';

/**
 * Structurally typed rather than importing PlayerKycProfile: the runner is
 * Node's own TypeScript stripping, which resolves relative paths only — a
 * `@/types` alias would not load here, and the shape is what matters.
 */
const profile = (over: Record<string, unknown> = {}): never =>
  ({
    status: 'NOT_STARTED',
    isSubmitted: false,
    isLevel1Complete: false,
    ...over,
  }) as never;

/**
 * What the verification page shows a player, and what the withdrawal form
 * does when it is refused. Both were untested, and both decide whether a
 * player understands what is being asked of them or gives up.
 */
describe('resolveKycGateState', () => {
  it('treats a player with no profile as not started', () => {
    assert.equal(resolveKycGateState(null), 'NOT_STARTED');
    assert.equal(resolveKycGateState(undefined), 'NOT_STARTED');
  });

  it('reports an approved profile as approved', () => {
    assert.equal(resolveKycGateState(profile({ status: 'APPROVED' })), 'APPROVED');
  });

  it('separates a retryable rejection from a final one', () => {
    // They are the same status and mean entirely different things: one asks
    // for better photographs, the other says the door is closed.
    assert.equal(
      resolveKycGateState(profile({ status: 'REJECTED', reviewRejectType: 'RETRY' })),
      'REJECTED_RETRY'
    );
    assert.equal(
      resolveKycGateState(profile({ status: 'REJECTED', reviewRejectType: 'FINAL' })),
      'REJECTED_FINAL'
    );
  });

  it('treats a rejection with no type as retryable', () => {
    // The safer default: telling someone they are permanently blocked when
    // they are not is the more damaging of the two mistakes.
    assert.equal(resolveKycGateState(profile({ status: 'REJECTED' })), 'REJECTED_RETRY');
  });

  it('does not show "in review" for someone who never submitted', () => {
    // An applicant created but never completed sits at IN_PROGRESS. Saying
    // "under review" would have them waiting on a verdict for documents
    // they never sent.
    assert.equal(
      resolveKycGateState(profile({ status: 'IN_PROGRESS', isSubmitted: false })),
      'NOT_STARTED'
    );
  });

  it('shows "in review" once documents are in', () => {
    assert.equal(
      resolveKycGateState(profile({ status: 'PENDING_REVIEW', isSubmitted: true })),
      'IN_REVIEW'
    );
  });

  it('distinguishes a compliance hold from ordinary review', () => {
    // Identical on the profile row, but a compliance hold will not clear on
    // its own. "We are reviewing it" sends the player back to poll a page
    // that will never change.
    assert.equal(
      resolveKycGateState(
        profile({ status: 'PENDING_REVIEW', isSubmitted: true, heldBy: 'COMPLIANCE' })
      ),
      'COMPLIANCE_HOLD'
    );
  });

  it('treats a provider hold as ordinary review', () => {
    // It WILL clear on its own, so the player has nothing to do but wait.
    assert.equal(
      resolveKycGateState(
        profile({ status: 'PENDING_REVIEW', isSubmitted: true, heldBy: 'PROVIDER' })
      ),
      'IN_REVIEW'
    );
  });
});

describe('readKycError', () => {
  it('returns null for something that is not a KYC refusal', () => {
    assert.equal(readKycError(null), null);
    assert.equal(readKycError(new Error('network down')), null);
    assert.equal(readKycError({ code: 'INSUFFICIENT_BALANCE' }), null);
    assert.equal(readKycError({ message: 'no code at all' }), null);
  });

  it('reads a refusal the interceptor rejected with directly', () => {
    const found = readKycError({
      code: 'KYC_REQUIRED',
      message: 'Verify first',
      details: { requiredLevel: 2 },
    });

    assert.equal(found?.code, 'KYC_REQUIRED');
    assert.equal(found?.requiredLevel, 2);
  });

  it('reads one still wrapped in an axios response', () => {
    const found = readKycError({
      response: { data: { code: 'TIER_UPGRADE_REQUIRED', details: { requiredLevel: 3 } } },
    });

    assert.equal(found?.code, 'TIER_UPGRADE_REQUIRED');
    assert.equal(found?.requiredLevel, 3);
  });

  it('opens Level 2 when the API sent no level', () => {
    // Every KYC refusal implies at least a completed identity check, so an
    // older deployment that omits the field still opens something useful.
    assert.equal(readKycError({ code: 'KYC_REVIEW_HOLD' })?.requiredLevel, 2);
  });

  it('ignores a level that makes no sense', () => {
    assert.equal(readKycError({ code: 'KYC_REQUIRED', details: { requiredLevel: 0 } })?.requiredLevel, 2);
    assert.equal(
      readKycError({ code: 'KYC_REQUIRED', details: { requiredLevel: 'two' } })?.requiredLevel,
      2
    );
  });

  it('carries the pre-deposit refusal at Level 1', () => {
    assert.equal(
      readKycError({ code: 'KYC_REQUIRED', details: { requiredLevel: 1 } })?.requiredLevel,
      1
    );
  });

  it('always produces a message, even when the API sent none', () => {
    const found = readKycError({ code: 'KYC_REQUIRED' });
    assert.ok(found?.message && found.message.length > 0);
  });
});

describe('getKycRejectReason', () => {
  it('says nothing about a profile that was not rejected', () => {
    assert.equal(getKycRejectReason(profile({ status: 'APPROVED' })), null);
    assert.equal(getKycRejectReason(null), null);
  });

  it('prefers the message written for the player', () => {
    assert.equal(
      getKycRejectReason(
        profile({ status: 'REJECTED', moderationComment: 'Photo was too dark' })
      ),
      'Photo was too dark'
    );
  });

  it('falls back to the provider labels, made readable', () => {
    const reason = getKycRejectReason(
      profile({ status: 'REJECTED', rejectLabels: ['DOCUMENT_TEMPLATE', 'BAD_PHOTO'] })
    );

    // UNDERSCORE_SHOUTING is not something to show a player.
    assert.equal(reason?.includes('_'), false);
    assert.match(reason ?? '', /Document template/);
  });

  it('never leaves a rejected player with no explanation at all', () => {
    const reason = getKycRejectReason(profile({ status: 'REJECTED' }));

    assert.ok(reason && reason.length > 0);
  });

  it('ignores a blank comment rather than showing an empty reason', () => {
    const reason = getKycRejectReason(profile({ status: 'REJECTED', moderationComment: '   ' }));

    assert.ok(reason && reason.trim().length > 0);
  });
});
