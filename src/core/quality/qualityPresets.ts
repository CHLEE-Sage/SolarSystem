export type QualityLevel = 'auto' | 'high' | 'medium' | 'low';

export type ResolvedQuality = Exclude<QualityLevel, 'auto'>;

export type QualityPreset = {
  id: ResolvedQuality;
  label: string;
  maxPixelRatio: number;
  antialias: boolean;
  sphereSegments: number;
  ringSegments: number;
  starCount: number;
  beltCount: number;
  toneMappingExposure: number;
};

export const QUALITY_PRESETS: Record<ResolvedQuality, QualityPreset> = {
  high: {
    id: 'high',
    label: '高品質',
    maxPixelRatio: 2,
    antialias: true,
    sphereSegments: 48,
    ringSegments: 96,
    starCount: 2800,
    beltCount: 900,
    toneMappingExposure: 1.05,
  },
  medium: {
    id: 'medium',
    label: '平衡',
    maxPixelRatio: 1.5,
    antialias: true,
    sphereSegments: 32,
    ringSegments: 64,
    starCount: 1600,
    beltCount: 420,
    toneMappingExposure: 1.0,
  },
  low: {
    id: 'low',
    label: '效能優先',
    maxPixelRatio: 1,
    antialias: false,
    sphereSegments: 16,
    ringSegments: 32,
    starCount: 700,
    beltCount: 160,
    toneMappingExposure: 0.98,
  },
};

export const QUALITY_COPY: Record<QualityLevel, string> = {
  auto: '自動：依裝置與 FPS 調整',
  high: '高品質：細節與抗鋸齒優先',
  medium: '平衡：多數裝置建議',
  low: '效能優先：降低粒子與解析度',
};

/** Heuristic for first paint before FPS samples exist. */
export function detectPreferredQuality(
  opts: {
    isMobile?: boolean;
    deviceMemoryGb?: number;
    hardwareConcurrency?: number;
    reducedMotion?: boolean;
  } = {},
): ResolvedQuality {
  const isMobile =
    opts.isMobile ??
    (typeof navigator !== 'undefined' &&
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
  const mem =
    opts.deviceMemoryGb ??
    (typeof navigator !== 'undefined'
      ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory
      : undefined);
  const cores =
    opts.hardwareConcurrency ??
    (typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined);
  const reduced =
    opts.reducedMotion ??
    (typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches);

  if (reduced || isMobile) return 'medium';
  if (typeof mem === 'number' && mem <= 4) return 'low';
  if (typeof cores === 'number' && cores <= 4) return 'medium';
  if (isMobile) return 'medium';
  return 'high';
}

export function resolveQuality(
  level: QualityLevel,
  preferred?: ResolvedQuality,
): ResolvedQuality {
  if (level === 'auto') return preferred ?? detectPreferredQuality();
  return level;
}

export function getQualityPreset(level: QualityLevel, preferred?: ResolvedQuality): QualityPreset {
  return QUALITY_PRESETS[resolveQuality(level, preferred)];
}
