import { describe, it, expect } from 'vitest';
import { rupeesToPaise, paiseToRupees, formatINR } from '../src/utils/money.js';

describe('Financial Calculation Engine — Monetary Utilities', () => {
  describe('rupeesToPaise', () => {
    it('converts whole rupees to integer paise', () => {
      expect(rupeesToPaise(100)).toBe(10000);
      expect(rupeesToPaise(45000)).toBe(4500000);
      expect(rupeesToPaise(0)).toBe(0);
    });

    it('converts fractional rupees to exact paise', () => {
      expect(rupeesToPaise(450.5)).toBe(45050);
      expect(rupeesToPaise(450.50)).toBe(45050);
      expect(rupeesToPaise(0.75)).toBe(75);
      expect(rupeesToPaise(0.01)).toBe(1);
    });

    it('neutralizes IEEE 754 binary floating point precision drift', () => {
      const floatingSum = 0.1 + 0.2;
      expect(rupeesToPaise(floatingSum)).toBe(30);
    });

    it('rounds fractional paise safely', () => {
      expect(rupeesToPaise(10.556)).toBe(1056);
      expect(rupeesToPaise(10.554)).toBe(1055);
    });
  });

  describe('paiseToRupees', () => {
    it('converts integer paise to rupee decimal', () => {
      expect(paiseToRupees(10000)).toBe(100);
      expect(paiseToRupees(45050)).toBe(450.5);
      expect(paiseToRupees(75)).toBe(0.75);
      expect(paiseToRupees(0)).toBe(0);
    });
  });

  describe('formatINR', () => {
    it('formats paise with currency symbol and Indian grouping commas', () => {
      expect(formatINR(45050)).toBe('₹450.50');
      expect(formatINR(4500000)).toBe('₹45,000.00');
      expect(formatINR(10000000)).toBe('₹1,00,000.00');
      expect(formatINR(0)).toBe('₹0.00');
    });
  });
});
