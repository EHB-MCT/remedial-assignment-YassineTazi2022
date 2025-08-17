import { describe, it, expect } from 'vitest';
import { computePrice } from './pricing.js';

describe('computePrice', () => {
  it('returns base when percent is 0', () => {
    expect(computePrice(100, 0)).toBe(100);
  });

  it('applies positive percent', () => {
    expect(computePrice(200, 10)).toBe(220);
  });

  it('applies negative percent', () => {
    expect(computePrice(50, -10)).toBe(45);
  });

  it('rounds to 2 decimals', () => {
    expect(computePrice(123.456, 12.345)).toBe(138.73);
  });
});


