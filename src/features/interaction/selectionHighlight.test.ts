import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { SelectionHighlight } from './selectionHighlight';

describe('SelectionHighlight', () => {
  it('marks a selected planet without adding a ring-shaped mesh', () => {
    const highlight = new SelectionHighlight();
    const earth = new THREE.Object3D();

    highlight.attach(earth, 0.52);

    const geometries = highlight.group.children
      .filter((child): child is THREE.Mesh => child instanceof THREE.Mesh)
      .map((mesh) => mesh.geometry.type);

    expect(geometries).not.toContain('RingGeometry');
    expect(highlight.group.visible).toBe(true);
    highlight.dispose();
  });
});
