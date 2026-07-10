import { describe, expect, it } from 'vitest';
import type { BodyData } from '../../types/bodies';
import {
  AU_SCENE_UNITS,
  beltRadialRange,
  homeCameraDistance,
  orbitDistance,
} from './scaleMapping';

const earth = {
  id: 'earth',
  type: 'planet',
  displayDistance: 9.6,
  semiMajorAxisAU: 1,
  displayRadius: 0.5,
} as BodyData;

const moon = {
  id: 'moon',
  type: 'moon',
  displayDistance: 1.15,
  semiMajorAxisAU: 0.00257,
  displayRadius: 0.16,
} as BodyData;

const neptune = {
  id: 'neptune',
  type: 'planet',
  displayDistance: 37.5,
  semiMajorAxisAU: 30.07,
  displayRadius: 0.75,
} as BodyData;

const belt = {
  id: 'asteroid-belt',
  type: 'belt',
  displayDistance: 15.6,
  semiMajorAxisAU: 2.7,
  beltInner: 14.2,
  beltOuter: 17,
  displayRadius: 0.04,
} as BodyData;

describe('scaleMapping', () => {
  it('uses displayDistance in educational mode', () => {
    expect(orbitDistance(earth, 'educational')).toBe(9.6);
    expect(orbitDistance(neptune, 'educational')).toBe(37.5);
  });

  it('uses AU × scale in realistic mode for planets', () => {
    expect(orbitDistance(earth, 'realisticAU')).toBeCloseTo(1 * AU_SCENE_UNITS);
    expect(orbitDistance(neptune, 'realisticAU')).toBeCloseTo(30.07 * AU_SCENE_UNITS);
  });

  it('keeps moon readable in realistic mode', () => {
    const d = orbitDistance(moon, 'realisticAU');
    expect(d).toBeGreaterThan(0.5);
    expect(d).toBeLessThan(3);
  });

  it('maps belt range by mode', () => {
    const edu = beltRadialRange(belt, 'educational');
    expect(edu.inner).toBe(14.2);
    const real = beltRadialRange(belt, 'realisticAU');
    expect(real.inner).toBeCloseTo(2.2 * AU_SCENE_UNITS);
    expect(real.outer).toBeGreaterThan(real.inner);
  });

  it('frames home camera farther in realistic mode', () => {
    expect(homeCameraDistance('realisticAU', 37.5)).toBeGreaterThan(
      homeCameraDistance('educational', 37.5),
    );
  });
});
