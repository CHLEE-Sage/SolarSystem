import * as THREE from 'three';
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

const saturn: BodyData = {
  id: 'saturn',
  nameZh: '土星',
  nameEn: 'Saturn',
  type: 'planet',
  parentId: 'sun',
  radiusKm: 58232,
  displayRadius: 1.15,
  semiMajorAxisAU: 9.537,
  displayDistance: 26,
  orbitalPeriodDays: 10759,
  rotationPeriodHours: 10.7,
  axialTiltDeg: 26.73,
  color: '#e8d5a3',
  textureKey: null,
  hasRings: true,
  ring: {
    innerScale: 1.35,
    outerScale: 2.25,
    color: '#cbb994',
    opacity: 0.72,
  },
  descriptionZh: '有行星環',
  order: 6,
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

describe('createSolarSystem saturn rings', () => {
  it('keeps planetary rings off the spinning mesh so fast rotation cannot jitter them', () => {
    const solar = createSolarSystem(
      {
        version: 1,
        scaleModeDefault: 'educational',
        bodies: [sun, saturn],
      },
      { quality: QUALITY_PRESETS.medium },
    );

    const runtime = solar.bodies.get('saturn');
    expect(runtime).toBeDefined();
    const ring = runtime!.bodyRoot.getObjectByName('saturn-ring');
    expect(ring).toBeInstanceOf(THREE.Mesh);
    // Ring should follow the body, but not inherit surface spin.
    expect(ring!.parent).toBe(runtime!.bodyRoot);
    expect(runtime!.spinMesh.children.map((c) => c.name)).not.toContain('saturn-ring');

    const before = ring!.quaternion.clone();
    solar.update(3.25); // many Saturn spin revolutions at 10.7h period
    // bodyRoot-local ring orientation must stay fixed while the planet spins.
    expect(ring!.quaternion.equals(before)).toBe(true);
    expect(runtime!.spinMesh.rotation.y).not.toBe(0);

    solar.dispose();
  });
});
