import { describe, it, expect } from 'vitest';
import { parseBookingIntent, clarifyMissingIntent, applyTone, detectConcise } from '../src/components/AIAgent.jsx';

describe('AIAgent persona and helpers', () => {
  it('parseBookingIntent extracts fields', () => {
    const intent = parseBookingIntent('book a hotel in Durban from 2025-12-20 for 3 nights, 2 guests');
    expect(intent.location).toBe('Durban');
    expect(intent.startDate).toBe('2025-12-20');
    expect(intent.nights).toBe(3);
    expect(intent.guests).toBe(2);
    expect(intent.type).toBe('hotel');
  });

  it('clarifyMissingIntent asks for missing details', () => {
    const msg = clarifyMissingIntent({});
    expect(msg).toContain('hotel or flight');
    expect(msg).toContain('destination');
    expect(msg).toContain('start date');
    expect(msg).toContain('guests');
  });

  it('applyTone adds warm or professional tone', () => {
    const clientMsg = applyTone('client', 'Searching hotels');
    expect(clientMsg).toMatch(/I’ve got you covered/);
    const adminMsg = applyTone('admin', 'Exporting reports');
    expect(adminMsg).toMatch(/I’ll handle this efficiently/);
  });

  it('detectConcise detects concise requests', () => {
    expect(detectConcise('tl;dr please')).toBe(true);
    expect(detectConcise('give me a summary')).toBe(true);
    expect(detectConcise('be straightforward')).toBe(true);
    expect(detectConcise('tell me more details')).toBe(false);
  });
});
