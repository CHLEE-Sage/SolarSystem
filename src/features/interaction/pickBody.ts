import * as THREE from 'three';
import type { BodyRuntime } from '../solar-system/createSolarSystem';

export type PickableBody = {
  id: string;
  mesh: THREE.Object3D;
  /** Larger invisible hit proxy for small planets. */
  hitMesh: THREE.Object3D;
};

export function buildPickables(bodies: Map<string, BodyRuntime>): PickableBody[] {
  const list: PickableBody[] = [];
  for (const [id, runtime] of bodies) {
    if (runtime.data.type === 'belt') continue;
    list.push({
      id,
      mesh: runtime.spinMesh,
      hitMesh: runtime.hitMesh ?? runtime.spinMesh,
    });
  }
  return list;
}

export function pickBodyId(
  raycaster: THREE.Raycaster,
  pointer: THREE.Vector2,
  camera: THREE.Camera,
  pickables: PickableBody[],
): string | null {
  raycaster.setFromCamera(pointer, camera);
  const objects = pickables.map((p) => p.hitMesh);
  const hits = raycaster.intersectObjects(objects, false);
  if (!hits.length) return null;
  const hitObj = hits[0].object;
  const fromUserData = hitObj.userData.bodyId as string | undefined;
  if (fromUserData) return fromUserData;
  const found = pickables.find((p) => p.hitMesh === hitObj || p.mesh === hitObj);
  return found?.id ?? null;
}

/** NDC pointer from mouse/pointer event over canvas. */
export function pointerFromEvent(
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  out: THREE.Vector2,
): THREE.Vector2 {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  return out.set(x, y);
}
