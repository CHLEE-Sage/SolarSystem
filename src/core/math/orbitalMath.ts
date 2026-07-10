const TWO_PI = Math.PI * 2;

/** Mean anomaly angle in radians for circular orbit. */
export function orbitalAngle(elapsedSimDays: number, orbitalPeriodDays: number, phase = 0): number {
  if (!orbitalPeriodDays || !Number.isFinite(orbitalPeriodDays)) return phase;
  return phase + (elapsedSimDays / orbitalPeriodDays) * TWO_PI;
}

/** Position on XZ plane (Y up). */
export function positionOnOrbit(
  distance: number,
  angleRad: number,
): { x: number; y: number; z: number } {
  return {
    x: Math.cos(angleRad) * distance,
    y: 0,
    z: Math.sin(angleRad) * distance,
  };
}

/** Spin angle from rotation period (hours). Negative period = retrograde. */
export function spinAngle(elapsedSimDays: number, rotationPeriodHours: number): number {
  if (!rotationPeriodHours || !Number.isFinite(rotationPeriodHours)) return 0;
  const hours = elapsedSimDays * 24;
  return (hours / rotationPeriodHours) * TWO_PI;
}

export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
