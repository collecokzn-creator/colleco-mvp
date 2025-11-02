import { describe, it, expect } from 'vitest';
import pricingEngine from '../server/pricingEngine.js';

const { computeServiceFee, findTierForCount, computeTotals } = pricingEngine;

describe('pricingEngine', () => {
  it('finds appropriate tiers by booking count', () => {
    expect(findTierForCount(0).name).toBe('Bronze');
    expect(findTierForCount(10).name).toBe('Silver');
    expect(findTierForCount(25).name).toBe('Gold');
    expect(findTierForCount(100).name).toBe('Platinum');
  });

  it('computes service fee for accommodation with short/long stays', () => {
    const short = computeServiceFee({ type: 'accommodation', netRate: 1000, nights: 2 }, { currency: 'ZAR' });
    const long = computeServiceFee({ type: 'accommodation', netRate: 1000, nights: 5 }, { currency: 'ZAR' });
    expect(short.fee).toBeCloseTo(80); // 8%
    expect(long.fee).toBeCloseTo(50); // 5%
  });

  it('computes flight fixed + percent fee', () => {
    const f = computeServiceFee({ type: 'flight', netRate: 2000 }, { currency: 'ZAR' });
    expect(f.fee).toBeCloseTo(250 + 2000 * 0.03);
  });

  it('computes totals and combined revenue example', () => {
    // Hotel booking example from spec: partner NET R10,000, Gold 10% commission, service fee 8%
    const items = [{ type: 'accommodation', netRate: 10000, nights: 2 }];
    const totals = computeTotals(items, 30, { currency: 'ZAR' }); // 30 bookings => Gold
    // subtotal
    expect(totals.subtotal).toBe(10000);
    // commission 10% of 10000
    expect(totals.commission).toBeCloseTo(1000);
    // service fee 8% -> 800
    expect(totals.totalServiceFees).toBeCloseTo(800);
    // CollEco earns commission + fee = 1800
    expect(totals.collEcoEarns).toBeCloseTo(1800);
    // Partner receives 9000
    expect(totals.partnerReceives).toBeCloseTo(9000);
  });
});
