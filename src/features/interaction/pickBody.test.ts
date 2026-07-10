import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { pickBodyId, type PickableBody } from './pickBody';

describe('pickBodyId', () => {
  it('returns null when nothing is hit', () => {
    const raycaster = new THREE.Raycaster();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    const pickables: PickableBody[] = [];
    const id = pickBodyId(raycaster, new THREE.Vector2(0, 0), camera, pickables);
    expect(id).toBeNull();
  });

  it('hits a sphere at origin when pointer is center', () => {
    const raycaster = new THREE.Raycaster();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16));
    mesh.position.set(0, 0, 0);
    mesh.userData.bodyId = 'earth';
    mesh.updateMatrixWorld(true);

    const pickables: PickableBody[] = [{ id: 'earth', mesh, hitMesh: mesh }];

    const id = pickBodyId(raycaster, new THREE.Vector2(0, 0), camera, pickables);
    expect(id).toBe('earth');
  });
});
