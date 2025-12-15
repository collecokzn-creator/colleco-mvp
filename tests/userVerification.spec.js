const { describe, it, expect } = require('vitest');
const uv = require('../src/utils/userVerification');

describe('userVerification helpers', () => {
  it('verifyUserIdentity throws on invalid input', () => {
    expect(() => uv.verifyUserIdentity()).toThrow();
  });

  it('verifyUserIdentity approves govId verified users', () => {
    const res = uv.verifyUserIdentity({ govId: 'ID123', govIdVerified: true });
    expect(res.status).toBe('approved');
    expect(res.level).toBe('verified');
  });

  it('verifyUserIdentity returns pending for emailVerified', () => {
    const res = uv.verifyUserIdentity({ emailVerified: true });
    expect(res.status).toBe('pending');
    expect(res.level).toBe('partial');
  });

  it('linkPaymentMethod validates input and returns methodId', () => {
    expect(() => uv.linkPaymentMethod({}, {})).toThrow();
    const out = uv.linkPaymentMethod({}, { type: 'card' });
    expect(out.linked).toBe(true);
    expect(out.methodId).toMatch(/^pm_/);
  });

  it('updateVerificationStatus validates status', () => {
    const user = { id: 1 };
    const updated = uv.updateVerificationStatus(user, 'approved');
    expect(updated.status).toBe('approved');
    expect(() => uv.updateVerificationStatus(user, 'illegal')).toThrow();
  });

  it('getVerificationLevel and isVerified behave as expected', () => {
    expect(uv.getVerificationLevel({ status: 'approved' })).toBe(2);
    expect(uv.isVerified({ status: 'approved' })).toBe(true);
    expect(uv.getVerificationLevel({ status: 'pending' })).toBe(1);
  });

  it('shouldRequireAdditionalVerification flags high amounts and countries', () => {
    expect(uv.shouldRequireAdditionalVerification({ transactionAmount: 2000 })).toBe(true);
    expect(uv.shouldRequireAdditionalVerification({ country: 'NG' })).toBe(true);
    expect(uv.shouldRequireAdditionalVerification({ country: 'US', transactionAmount: 10 })).toBe(false);
  });

  it('generateVerificationChallenge and validateVerificationResponse flow', () => {
    const ch = uv.generateVerificationChallenge({ ttl: 1000 });
    expect(ch.code).toHaveLength(6);
    expect(ch.expiresAt).toBeGreaterThan(Date.now());

    const ok = uv.validateVerificationResponse(ch, { code: ch.code });
    expect(ok).toBe(true);

    const bad = uv.validateVerificationResponse(ch, { code: '000000' });
    expect(bad).toBe(false);
  });
});
