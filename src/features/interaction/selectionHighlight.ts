import * as THREE from 'three';

/** Soft aura to mark the selected body without resembling a planetary ring. */
export class SelectionHighlight {
  readonly group = new THREE.Group();
  private shell: THREE.Mesh;
  private attached: THREE.Object3D | null = null;

  constructor() {
    const shellGeo = new THREE.SphereGeometry(1, 24, 24);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x7eb6ff,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    this.shell = new THREE.Mesh(shellGeo, shellMat);

    this.group.add(this.shell);
    this.group.visible = false;
    this.group.name = 'selection-highlight';
  }

  attach(parent: THREE.Object3D, radius: number): void {
    if (this.attached) this.attached.remove(this.group);
    const s = Math.max(radius, 0.15);
    this.shell.scale.setScalar(s * 1.12);
    parent.add(this.group);
    this.attached = parent;
    this.group.visible = true;
  }

  clear(): void {
    if (this.attached) this.attached.remove(this.group);
    this.attached = null;
    this.group.visible = false;
  }

  update(elapsed: number): void {
    if (!this.group.visible) return;
    const pulse = 0.07 + Math.sin(elapsed * 3) * 0.025;
    (this.shell.material as THREE.MeshBasicMaterial).opacity = pulse;
  }

  dispose(): void {
    this.clear();
    this.shell.geometry.dispose();
    (this.shell.material as THREE.Material).dispose();
  }
}
