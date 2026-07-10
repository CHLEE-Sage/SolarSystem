export type BodyType = 'star' | 'planet' | 'moon' | 'belt';

export type RingData = {
  innerScale: number;
  outerScale: number;
  color: string;
  opacity: number;
};

export type BodyData = {
  id: string;
  nameZh: string;
  nameEn: string;
  type: BodyType;
  parentId: string | null;
  radiusKm: number;
  displayRadius: number;
  semiMajorAxisAU: number;
  displayDistance: number;
  orbitalPeriodDays: number;
  rotationPeriodHours: number;
  axialTiltDeg?: number;
  color: string;
  emissive?: string;
  textureKey: string | null;
  hasRings?: boolean;
  ring?: RingData | null;
  beltInner?: number;
  beltOuter?: number;
  beltCount?: number;
  descriptionZh: string;
  order: number;
  isMvp: boolean;
  proOnly: boolean;
};

export type PlanetsFile = {
  version: number;
  scaleModeDefault: 'educational' | 'realisticAU';
  bodies: BodyData[];
};
