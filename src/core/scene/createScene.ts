import * as THREE from 'three';
import { APP_CONFIG } from '../../config/appConfig';

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(APP_CONFIG.background);
  scene.fog = new THREE.FogExp2(APP_CONFIG.background, 0.012);
  return scene;
}
