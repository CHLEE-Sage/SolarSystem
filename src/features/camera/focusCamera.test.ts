import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createFocusAnimator } from './focusCamera';

function createControlsStub(): {
  target: THREE.Vector3;
  update: () => void;
} {
  return {
    target: new THREE.Vector3(),
    update: () => undefined,
  };
}

describe('createFocusAnimator continuous follow', () => {
  it('keeps controls target aligned with a moving focused body after fly-in', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 8, 20);
    const controls = createControlsStub();
    const animator = createFocusAnimator(camera, controls as never);
    const movingBody = new THREE.Vector3(10, 0, 0);

    animator.focus({
      getWorldPosition: () => movingBody.clone(),
      displayRadius: 1,
    });
    animator.update(0.8); // Finish initial fly-in.

    movingBody.set(4, 0, 12); // Simulate orbital motion after focus completed.
    animator.update(1 / 60);

    expect(controls.target.distanceTo(movingBody)).toBeLessThan(0.0001);
  });

  it('stops following after snapping to a manual/home view', () => {
    const camera = new THREE.PerspectiveCamera();
    const controls = createControlsStub();
    const animator = createFocusAnimator(camera, controls as never);
    const movingBody = new THREE.Vector3(5, 0, 0);

    animator.focus({
      getWorldPosition: () => movingBody.clone(),
      displayRadius: 1,
    });
    animator.update(0.8);
    animator.snapTo(new THREE.Vector3(0, 12, 40), new THREE.Vector3());

    movingBody.set(30, 0, 0);
    animator.update(1 / 60);

    expect(controls.target.length()).toBe(0);
  });

  it('preserves user zoom/orbit offset while following a moving body', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 8, 20);
    const controls = createControlsStub();
    const animator = createFocusAnimator(camera, controls as never);
    const movingBody = new THREE.Vector3(10, 0, 0);

    animator.focus({
      getWorldPosition: () => movingBody.clone(),
      displayRadius: 1,
    });
    animator.update(0.8); // finish fly-in

    // User zooms/orbits away from the hard-coded follow pose.
    camera.position.set(30, 20, 40);
    const userOffset = camera.position.clone().sub(controls.target);

    movingBody.set(14, 0, 8);
    animator.update(1 / 60);

    // Target tracks the body…
    expect(controls.target.distanceTo(movingBody)).toBeLessThan(0.0001);
    // …but the camera keeps the user's relative offset (wheel/orbit still work).
    const keptOffset = camera.position.clone().sub(controls.target);
    expect(keptOffset.distanceTo(userOffset)).toBeLessThan(0.0001);
  });
});
