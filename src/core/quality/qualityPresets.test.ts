import { describe, expect, it } from 'vitest';
import {
  detectPreferredQuality,
  getQualityPreset,
  resolveQuality,
} from './qualityPresets';

describe('qualityPresets', () => {
  it('resolves auto to preferred or detected', () => {
    expect(resolveQuality('auto', 'low')).toBe('low');
    expect(resolveQuality('high')).toBe('high');
    expect(resolveQuality('medium')).toBe('medium');
  });

  it('detects conservative quality for low-end hints', () => {
    expect(
      detectPreferredQuality({
        isMobile: true,
        deviceMemoryGb: 2,
        hardwareConcurrency: 4,
      }),
    ).toBe('medium');
    expect(
      detectPreferredQuality({
        isMobile: false,
        deviceMemoryGb: 2,
        hardwareConcurrency: 8,
      }),
    ).toBe('low');
    expect(
      detectPreferredQuality({
        isMobile: false,
        deviceMemoryGb: 16,
        hardwareConcurrency: 12,
        reducedMotion: false,
      }),
    ).toBe('high');
  });

  it('returns decreasing budgets for lower presets', () => {
    const high = getQualityPreset('high');
    const low = getQualityPreset('low');
    expect(high.beltCount).toBeGreaterThan(low.beltCount);
    expect(high.starCount).toBeGreaterThan(low.starCount);
    expect(high.maxPixelRatio).toBeGreaterThan(low.maxPixelRatio);
    expect(high.antialias).toBe(true);
    expect(low.antialias).toBe(false);
  });
});
