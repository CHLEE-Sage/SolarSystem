import * as THREE from 'three';
import type { QualityPreset } from '../quality/qualityPresets';
import { QUALITY_PRESETS } from '../quality/qualityPresets';

export function createRenderer(
  canvas: HTMLCanvasElement,
  quality: QualityPreset = QUALITY_PRESETS.high,
): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality.antialias,
    alpha: false,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: false,
  });

  applyRendererQuality(renderer, quality);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  return renderer;
}

export function applyRendererQuality(
  renderer: THREE.WebGLRenderer,
  quality: QualityPreset,
): void {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.maxPixelRatio));
  renderer.toneMappingExposure = quality.toneMappingExposure;
}
