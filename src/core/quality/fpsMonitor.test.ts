import { describe, expect, it } from 'vitest';
import { FpsMonitor } from './fpsMonitor';

describe('FpsMonitor', () => {
  it('averages FPS samples', () => {
    const m = new FpsMonitor(10);
    // 1/60 ≈ 60fps, 1/30 = 30fps
    for (let i = 0; i < 5; i++) m.sample(1 / 60);
    for (let i = 0; i < 5; i++) m.sample(1 / 30);
    expect(m.fps).toBeGreaterThan(40);
    expect(m.fps).toBeLessThan(50);
  });

  it('downgrades only when ready and under threshold', () => {
    const m = new FpsMonitor(10);
    expect(m.shouldDowngrade(40)).toBe(false);
    for (let i = 0; i < 10; i++) m.sample(1 / 25);
    expect(m.ready).toBe(true);
    expect(m.shouldDowngrade(40, 5)).toBe(true);
    // cooldown
    expect(m.shouldDowngrade(40, 5)).toBe(false);
  });
});
