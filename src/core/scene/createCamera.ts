import * as THREE from 'three';
import { APP_CONFIG } from '../../config/appConfig';

export function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    APP_CONFIG.fov,
    window.innerWidth / Math.max(window.innerHeight, 1),
    APP_CONFIG.near,
    APP_CONFIG.far,
  );
  camera.position.set(0, APP_CONFIG.cameraY, APP_CONFIG.cameraDistance);
  camera.lookAt(0, APP_CONFIG.viewTargetY, 0);
  return camera;
}
