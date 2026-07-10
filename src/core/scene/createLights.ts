import * as THREE from 'three';

export function createLights(scene: THREE.Scene): {
  sunLight: THREE.PointLight;
  ambient: THREE.AmbientLight;
  hemi: THREE.HemisphereLight;
} {
  const ambient = new THREE.AmbientLight(0x1a2235, 0.28);
  const hemi = new THREE.HemisphereLight(0x88aaff, 0x080810, 0.22);
  const sunLight = new THREE.PointLight(0xfff1c8, 140, 0, 1.6);
  sunLight.position.set(0, 0, 0);
  scene.add(ambient, hemi, sunLight);
  return { sunLight, ambient, hemi };
}
