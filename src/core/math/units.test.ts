import { describe, expect, it } from 'vitest';
import { clamp, lerp } from './units';

describe('units', () => {
  it('clamps values into range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it('interpolates linearly', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
});
