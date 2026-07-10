import type * as THREE from 'three';

export function resizeRenderer(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  width = window.innerWidth,
  height = window.innerHeight,
): void {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
