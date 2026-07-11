import * as THREE from 'three';

/**
 * Selection state is communicated through the HUD and information panel.
 * Do not add canvas geometry here: at different camera angles any halo,
 * wireframe, or ring can be mistaken for a physical planetary ring.
 */
export class SelectionHighlight {
  readonly group = new THREE.Group();

  constructor() {
    this.group.name = 'selection-highlight';
    this.group.visible = false;
  }

  attach(_parent: THREE.Object3D, _radius: number): void {
    // Intentionally no visual scene child. Selection remains available in UI.
  }

  clear(): void {
    // No canvas selection ornament to clear.
  }

  update(_elapsed: number): void {
    // No canvas selection ornament by design.
  }

  dispose(): void {
    this.clear();
  }
}
