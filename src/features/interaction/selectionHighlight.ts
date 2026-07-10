import * as THREE from 'three';

/** Ring + soft shell to mark selected body. */
export class SelectionHighlight {
  readonly group = new THREE.Group();
  private ring: THREE.Mesh;
  private shell: THREE.Mesh;
  private attached: THREE.Object3D | null = null;

  constructor() {
    const ringGeo = new THREE.RingGeometry(1.15, 1.35, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x7eb6ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.ring.rotation.x = Math.PI / 2;

    const shellGeo = new THREE.SphereGeometry(1, 24, 24);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x7eb6ff,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    this.shell = new THREE.Mesh(shellGeo, shellMat);

    this.group.add(this.ring, this.shell);
    this.group.visible = false;
    this.group.name = 'selection-highlight';
  }

  attach(parent: THREE.Object3D, radius: number): void {
    if (this.attached) this.attached.remove(this.group);
    const s = Math.max(radius, 0.15);
    this.ring.scale.setScalar(s);
    this.shell.scale.setScalar(s * 1.08);
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
    this.ring.rotation.z = elapsed * 0.8;
    const pulse = 0.1 + Math.sin(elapsed * 3) * 0.04;
    (this.shell.material as THREE.MeshBasicMaterial).opacity = pulse;
  }

  dispose(): void {
    this.clear();
    this.ring.geometry.dispose();
    (this.ring.material as THREE.Material).dispose();
    this.shell.geometry.dispose();
    (this.shell.material as THREE.Material).dispose();
  }
}
