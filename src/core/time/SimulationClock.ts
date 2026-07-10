export type SimulationClockState = {
  isPlaying: boolean;
  /** Simulated days advanced per real second. */
  timeScale: number;
  elapsedSimDays: number;
};

export class SimulationClock {
  isPlaying = true;
  timeScale = 12;
  elapsedSimDays = 0;

  update(deltaSeconds: number): number {
    if (this.isPlaying) {
      this.elapsedSimDays += deltaSeconds * this.timeScale;
    }
    return this.elapsedSimDays;
  }

  toggle(): void {
    this.isPlaying = !this.isPlaying;
  }

  reset(): void {
    this.elapsedSimDays = 0;
  }

  setTimeScale(scale: number): void {
    this.timeScale = Math.max(0, scale);
  }

  snapshot(): SimulationClockState {
    return {
      isPlaying: this.isPlaying,
      timeScale: this.timeScale,
      elapsedSimDays: this.elapsedSimDays,
    };
  }
}
