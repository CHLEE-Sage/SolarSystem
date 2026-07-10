import type { BodyData } from '../../types/bodies';

export type ScaleMode = 'educational' | 'realisticAU';

/**
 * Scene units per AU in near-realistic distance mode.
 * Higher = more dramatic gap vs educational layout (easier to see the switch).
 */
export const AU_SCENE_UNITS = 22;

export const SCALE_MODE_COPY: Record<
  ScaleMode,
  { label: string; short: string; notice: string }
> = {
  educational: {
    label: '教育壓縮',
    short: '教育尺度',
    notice:
      '目前為「教育壓縮尺度」：行星距離與半徑已調整，方便在同一畫面觀察排列。並非真實比例。',
  },
  realisticAU: {
    label: '接近真實 AU',
    short: '接近真實 AU',
    notice:
      '目前為「接近真實距離」：軌道距離依 AU 比例拉開（體積仍放大以便辨識）。外行星會很遠，請用「聚焦天體」跳轉。',
  },
};

/**
 * Orbital radius in scene units for a body under the given scale mode.
 */
export function orbitDistance(data: BodyData, mode: ScaleMode): number {
  if (data.type === 'star') return 0;

  if (mode === 'educational') {
    return data.displayDistance;
  }

  if (data.type === 'moon') {
    // Keep moon readable next to Earth; pure AU would be nearly invisible.
    return Math.max(data.displayDistance * 0.9, 0.95);
  }

  if (data.semiMajorAxisAU > 0) {
    return Math.max(data.semiMajorAxisAU * AU_SCENE_UNITS, 0.8);
  }

  return data.displayDistance;
}

export function beltRadialRange(
  data: BodyData,
  mode: ScaleMode,
): { inner: number; outer: number } {
  if (mode === 'educational') {
    return {
      inner: data.beltInner ?? data.displayDistance * 0.9,
      outer: data.beltOuter ?? data.displayDistance * 1.1,
    };
  }
  const innerAu = 2.2;
  const outerAu = 3.2;
  return {
    inner: innerAu * AU_SCENE_UNITS,
    outer: outerAu * AU_SCENE_UNITS,
  };
}

/** Home camera distance that frames the outer system for a mode. */
export function homeCameraDistance(mode: ScaleMode, outerDisplayDistance: number): number {
  if (mode === 'educational') {
    return Math.max(outerDisplayDistance * 1.35, 48);
  }
  // Frame roughly out to ~12 AU so inner system is readable; use focus for Neptune.
  return Math.max(12 * AU_SCENE_UNITS * 1.15, 160);
}
