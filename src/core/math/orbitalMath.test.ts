import { describe, expect, it } from 'vitest';
import { orbitalAngle, positionOnOrbit, spinAngle } from './orbitalMath';

describe('orbitalMath', () => {
  it('completes one orbit after one period', () => {
    const a0 = orbitalAngle(0, 365.25);
    const a1 = orbitalAngle(365.25, 365.25);
    expect(Math.cos(a1 - a0)).toBeCloseTo(1, 8);
  });

  it('places body on circle of given radius', () => {
    const p = positionOnOrbit(10, 0);
    expect(p.x).toBeCloseTo(10);
    expect(p.y).toBe(0);
    expect(p.z).toBeCloseTo(0);
  });

  it('handles retrograde spin period', () => {
    const a = spinAngle(1, -24);
    expect(a).toBeLessThan(0);
  });
});
