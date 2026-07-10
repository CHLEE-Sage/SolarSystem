import * as THREE from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type FocusTarget = {
  /** Read the body's current world position on every animation frame. */
  getWorldPosition: () => THREE.Vector3;
  displayRadius: number;
};

/** Smoothly move camera to a body, then keep its controls target following that body. */
export function createFocusAnimator(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
): {
  focus: (target: FocusTarget) => void;
  resetHome: (homePos: THREE.Vector3, homeTarget: THREE.Vector3) => void;
  /** Instant snap — use when animation may be unreliable or user wants immediate feedback. */
  snapTo: (pos: THREE.Vector3, target: THREE.Vector3) => void;
  stopFollowing: () => void;
  update: (dt: number) => void;
  isAnimating: () => boolean;
  isFollowing: () => boolean;
} {
  let active = false;
  let t = 0;
  const duration = 0.75;
  const fromPos = new THREE.Vector3();
  const toPos = new THREE.Vector3();
  const fromTarget = new THREE.Vector3();
  const toTarget = new THREE.Vector3();
  const followOffset = new THREE.Vector3();
  let getFollowPosition: (() => THREE.Vector3) | null = null;

  const easeInOut = (x: number): number =>
    x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

  const startAnim = (nextPos: THREE.Vector3, nextTarget: THREE.Vector3): void => {
    fromPos.copy(camera.position);
    fromTarget.copy(controls.target);
    toPos.copy(nextPos);
    toTarget.copy(nextTarget);
    t = 0;
    active = true;
  };

  const stopFollowing = (): void => {
    getFollowPosition = null;
    active = false;
    t = 1;
  };

  const snapTo = (pos: THREE.Vector3, target: THREE.Vector3): void => {
    stopFollowing();
    camera.position.copy(pos);
    controls.target.copy(target);
    controls.update();
  };

  return {
    focus: (target) => {
      const nextTarget = target.getWorldPosition().clone();
      const dist = Math.max(target.displayRadius * 12, 4.5);
      followOffset.set(dist * 0.55, dist * 0.38, dist * 0.95);
      getFollowPosition = target.getWorldPosition;
      startAnim(nextTarget.clone().add(followOffset), nextTarget);
    },
    resetHome: (homePos, homeTarget) => {
      stopFollowing();
      startAnim(homePos, homeTarget);
    },
    snapTo,
    stopFollowing,
    update: (dt) => {
      const liveTarget = getFollowPosition?.();

      if (active) {
        // The body may move while the initial camera fly-in is still running.
        if (liveTarget) {
          toTarget.copy(liveTarget);
          toPos.copy(liveTarget).add(followOffset);
        }
        t = Math.min(1, t + dt / duration);
        const k = easeInOut(t);
        camera.position.lerpVectors(fromPos, toPos, k);
        controls.target.lerpVectors(fromTarget, toTarget, k);
        controls.update();
        if (t >= 1) active = false;
        return;
      }

      // After fly-in, keep the same viewing offset while following orbital motion.
      if (liveTarget) {
        controls.target.copy(liveTarget);
        camera.position.copy(liveTarget).add(followOffset);
        controls.update();
      }
    },
    isAnimating: () => active,
    isFollowing: () => getFollowPosition !== null,
  };
}
