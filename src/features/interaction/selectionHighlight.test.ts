import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { SelectionHighlight } from './selectionHighlight';

function collectMeshes(root: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) meshes.push(obj);
  });
  return meshes;
}

describe('SelectionHighlight visual language', () => {
  it('adds no canvas geometry when a body is selected, so selection cannot look like a planetary ring', () => {
    const highlight = new SelectionHighlight();
    const parent = new THREE.Object3D();
    highlight.attach(parent, 1);

    expect(collectMeshes(highlight.group)).toHaveLength(0);
    expect(highlight.group.visible).toBe(false);
    expect(parent.children).not.toContain(highlight.group);

    highlight.dispose();
  });
});
