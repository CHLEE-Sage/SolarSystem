/**
 * Simple rolling FPS estimator for auto quality.
 * Call `sample(dtSeconds)` each frame; read `fps` smoothed average.
 */
export class FpsMonitor {
  private samples: number[] = [];
  private readonly maxSamples: number;
  private cooldown = 0;

  constructor(maxSamples = 90) {
    this.maxSamples = maxSamples;
  }

  sample(dtSeconds: number): void {
    if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) return;
    const fps = 1 / dtSeconds;
    this.samples.push(fps);
    if (this.samples.length > this.maxSamples) this.samples.shift();
    if (this.cooldown > 0) this.cooldown -= dtSeconds;
  }

  get fps(): number {
    if (this.samples.length === 0) return 60;
    const sum = this.samples.reduce((a, b) => a + b, 0);
    return sum / this.samples.length;
  }

  get ready(): boolean {
    return this.samples.length >= Math.min(45, this.maxSamples);
  }

  /** True once after sustained low FPS, then cools down. */
  shouldDowngrade(threshold = 40, cooldownSec = 8): boolean {
    if (!this.ready || this.cooldown > 0) return false;
    if (this.fps < threshold) {
      this.cooldown = cooldownSec;
      return true;
    }
    return false;
  }

  reset(): void {
    this.samples = [];
    this.cooldown = 0;
  }
}
