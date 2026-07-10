import { describe, expect, it } from 'vitest';
import { QUALITY_PRESETS } from '../../core/quality/qualityPresets';
import { createSolarSystem } from './createSolarSystem';
import type { BodyData, PlanetsFile } from '../../types/bodies';

const sun: BodyData = {
  id: 'sun',
  nameZh: '太陽',
  nameEn: 'Sun',
  type: 'star',
  parentId: null,
  radiusKm: 696340,
  displayRadius: 3,
  semiMajorAxisAU: 0,
  displayDistance: 0,
  orbitalPeriodDays: 0,
  rotationPeriodHours: 600,
  color: '#ffcc55',
  emissive: '#ff9933',
  textureKey: null,
  descriptionZh: '中心恆星',
  order: 0,
  isMvp: true,
  proOnly: false,
};

const belt: BodyData = {
  id: 'asteroid-belt',
  nameZh: '小行星帶',
  nameEn: 'Asteroid Belt',
  type: 'belt',
  parentId: null,
  radiusKm: 1,
  displayRadius: 0.08,
  semiMajorAxisAU: 2.7,
  displayDistance: 16,
  orbitalPeriodDays: 1600,
  rotationPeriodHours: 0,
  color: '#9b8268',
  textureKey: null,
  beltInner: 14,
  beltOuter: 18,
  beltCount: 100,
  descriptionZh: '裝飾性小行星帶',
  order: 10,
  isMvp: true,
  proOnly: false,
};

const data: PlanetsFile = {
  version: 1,
  scaleModeDefault: 'educational',
  bodies: [sun, belt],
};

describe('createSolarSystem progressive decorations', () => {
  it('defers noncritical starfield and asteroid-belt allocation until activated', () => {
    const solar = createSolarSystem(data, {
      quality: QUALITY_PRESETS.low,
      deferDecorations: true,
    });

    expect(solar.root.getObjectByName('starfield')).toBeUndefined();
    expect(solar.root.getObjectByName('asteroid-belt')).toBeUndefined();

    solar.activateDecorations();

    expect(solar.root.getObjectByName('starfield')).toBeDefined();
    expect(solar.root.getObjectByName('asteroid-belt')).toBeDefined();
    solar.dispose();
  });
});
