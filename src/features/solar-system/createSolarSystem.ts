import * as THREE from 'three';
import { orbitalAngle, seededRandom, spinAngle } from '../../core/math/orbitalMath';
import {
  beltRadialRange,
  orbitDistance,
  type ScaleMode,
} from '../../core/math/scaleMapping';
import {
  QUALITY_PRESETS,
  type QualityPreset,
  type ResolvedQuality,
} from '../../core/quality/qualityPresets';
import type { BodyData, PlanetsFile } from '../../types/bodies';

export type BodyRuntime = {
  data: BodyData;
  orbitRoot: THREE.Object3D;
  bodyRoot: THREE.Object3D;
  spinMesh: THREE.Object3D;
  hitMesh: THREE.Object3D;
  orbitLine?: THREE.Line;
  phase: number;
};

export type SolarSystemHandle = {
  root: THREE.Group;
  bodies: Map<string, BodyRuntime>;
  scaleMode: ScaleMode;
  quality: ResolvedQuality;
  setScaleMode: (mode: ScaleMode) => void;
  setQuality: (preset: QualityPreset) => void;
  /** Adds visual-only background details after the first usable frame. */
  activateDecorations: () => void;
  update: (elapsedSimDays: number) => void;
  dispose: () => void;
};

export type CreateSolarSystemOptions = {
  quality?: QualityPreset;
  /** Keep primary bodies interactive while deferring costly decorative meshes. */
  deferDecorations?: boolean;
};

type Disposable = { dispose: () => void };

function createHitProxy(
  radius: number,
  parent: THREE.Object3D,
  disposables: Disposable[],
): THREE.Mesh {
  const hitR = Math.max(radius * 2.4, 0.55);
  const geo = new THREE.SphereGeometry(hitR, 16, 16);
  const mat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const hit = new THREE.Mesh(geo, mat);
  hit.name = 'hit-proxy';
  hit.userData.isHitProxy = true;
  parent.add(hit);
  disposables.push(geo, mat);
  return hit;
}

function buildOrbitGeometry(radius: number): THREE.BufferGeometry {
  const segments = 128;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

function createOrbitLine(radius: number, color = 0x5b6b88): THREE.Line {
  const geo = buildOrbitGeometry(radius);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.38,
  });
  return new THREE.Line(geo, mat);
}

function resizeOrbitLine(line: THREE.Line, radius: number): void {
  const old = line.geometry;
  line.geometry = buildOrbitGeometry(radius);
  old.dispose();
}

function createStarfield(count: number): THREE.Points {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const rand = seededRandom(42);
  for (let i = 0; i < count; i++) {
    const r = 120 + rand() * 420;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    const c = 0.65 + rand() * 0.35;
    colors[i * 3] = c;
    colors[i * 3 + 1] = c;
    colors[i * 3 + 2] = Math.min(1, c + 0.08);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.38,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

function createSphereMesh(data: BodyData, segments: number): THREE.Mesh {
  const segs = Math.max(12, segments);
  const geo = new THREE.SphereGeometry(data.displayRadius, segs, segs);
  const isStar = data.type === 'star';
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(data.color),
    emissive: new THREE.Color(data.emissive ?? (isStar ? data.color : '#000000')),
    emissiveIntensity: isStar ? 1.85 : 0.06,
    roughness: isStar ? 0.42 : 0.72,
    metalness: isStar ? 0.05 : 0.12,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = data.id;
  if (data.axialTiltDeg) {
    mesh.rotation.z = THREE.MathUtils.degToRad(data.axialTiltDeg * 0.25);
  }
  return mesh;
}

function createSaturnRing(
  data: BodyData,
  disposables: Disposable[],
  ringSegments: number,
): THREE.Mesh | null {
  if (!data.hasRings || !data.ring) return null;
  const inner = data.displayRadius * data.ring.innerScale;
  const outer = data.displayRadius * data.ring.outerScale;
  const geo = new THREE.RingGeometry(inner, outer, Math.max(16, ringSegments));
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(data.ring.color),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: data.ring.opacity,
    roughness: 0.85,
    metalness: 0.05,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(geo, mat);
  ring.rotation.x = Math.PI / 2;
  ring.name = `${data.id}-ring`;
  disposables.push(geo, mat);
  return ring;
}

function fillAsteroidBelt(
  mesh: THREE.InstancedMesh,
  data: BodyData,
  mode: ScaleMode,
  activeCount: number,
): void {
  const capacity = mesh.count;
  const visible = Math.max(0, Math.min(activeCount, capacity));
  const { inner, outer } = beltRadialRange(data, mode);
  const rand = seededRandom(7);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < capacity; i++) {
    if (i >= visible) {
      dummy.position.set(0, 0, 0);
      dummy.scale.setScalar(0);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      continue;
    }
    const r = inner + rand() * (outer - inner);
    const a = rand() * Math.PI * 2;
    const y = (rand() - 0.5) * 0.4;
    dummy.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    dummy.scale.setScalar(0.45 + rand() * 1.7);
    dummy.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.userData.activeCount = visible;
}

function createAsteroidBelt(
  data: BodyData,
  disposables: Disposable[],
  capacity: number,
): THREE.InstancedMesh {
  const count = Math.max(capacity, data.beltCount ?? 900);
  const geo = new THREE.IcosahedronGeometry(data.displayRadius, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(data.color),
    roughness: 0.95,
    metalness: 0.08,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.name = data.id;
  mesh.userData.spinPeriod = data.orbitalPeriodDays || 1600;
  mesh.userData.beltCapacity = count;
  fillAsteroidBelt(mesh, data, 'educational', capacity);
  disposables.push(geo, mat);
  return mesh;
}

export function createSolarSystem(
  dataFile: PlanetsFile,
  options: CreateSolarSystemOptions = {},
): SolarSystemHandle {
  let quality: QualityPreset = options.quality ?? QUALITY_PRESETS.high;
  const root = new THREE.Group();
  root.name = 'solar-system';
  const disposables: Disposable[] = [];
  const bodies = new Map<string, BodyRuntime>();
  const mvpBodies = dataFile.bodies.filter((b) => b.isMvp && !b.proOnly);
  let scaleMode: ScaleMode = dataFile.scaleModeDefault ?? 'educational';

  // Decorative particles are deliberately optional during first paint.
  const starCapacity = QUALITY_PRESETS.high.starCount;
  let starfield: THREE.Points | null = null;
  let decorationsActive = false;
  const createStarfieldDecoration = (): void => {
    if (starfield) return;
    starfield = createStarfield(starCapacity);
    starfield.name = 'starfield';
    starfield.geometry.setDrawRange(0, quality.starCount);
    root.add(starfield);
    disposables.push(starfield.geometry, starfield.material as THREE.Material);
  };

  const beltCapacity = Math.max(
    QUALITY_PRESETS.high.beltCount,
    ...mvpBodies.filter((b) => b.type === 'belt').map((b) => b.beltCount ?? 0),
  );
  const deferredBelts: BodyData[] = [];
  const addBelt = (data: BodyData): void => {
    const belt = createAsteroidBelt(data, disposables, beltCapacity);
    fillAsteroidBelt(belt, data, scaleMode, quality.beltCount);
    root.add(belt);
    bodies.set(data.id, {
      data,
      orbitRoot: root,
      bodyRoot: belt,
      spinMesh: belt,
      hitMesh: belt,
      phase: 0,
    });
  };

  for (const data of mvpBodies) {
    if (data.type === 'moon') continue;

    if (data.type === 'belt') {
      if (options.deferDecorations) deferredBelts.push(data);
      else addBelt(data);
      continue;
    }

    if (data.type === 'star') {
      const sun = createSphereMesh(data, quality.sphereSegments);
      const glowGeo = new THREE.SphereGeometry(
        data.displayRadius * 1.4,
        Math.max(16, Math.floor(quality.sphereSegments * 0.66)),
        Math.max(16, Math.floor(quality.sphereSegments * 0.66)),
      );
      const glowMat = new THREE.MeshBasicMaterial({
        color: data.emissive ?? data.color,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.name = 'sun-glow';
      sun.add(glow);
      root.add(sun);
      disposables.push(sun.geometry, sun.material as THREE.Material, glowGeo, glowMat);
      const hitMesh = createHitProxy(data.displayRadius, sun, disposables);
      hitMesh.userData.bodyId = data.id;
      bodies.set(data.id, {
        data,
        orbitRoot: root,
        bodyRoot: sun,
        spinMesh: sun,
        hitMesh,
        phase: 0,
      });
      continue;
    }

    const dist = orbitDistance(data, scaleMode);
    const orbitRoot = new THREE.Object3D();
    orbitRoot.name = `${data.id}-orbit`;
    root.add(orbitRoot);

    const orbitLine = createOrbitLine(dist);
    orbitLine.name = `${data.id}-orbit-line`;
    root.add(orbitLine);
    disposables.push(orbitLine.material as THREE.Material);

    const bodyRoot = new THREE.Object3D();
    bodyRoot.name = `${data.id}-body`;
    bodyRoot.position.set(dist, 0, 0);
    orbitRoot.add(bodyRoot);

    const spinMesh = createSphereMesh(data, quality.sphereSegments);
    bodyRoot.add(spinMesh);
    disposables.push(spinMesh.geometry, spinMesh.material as THREE.Material);

    const ring = createSaturnRing(data, disposables, quality.ringSegments);
    if (ring) spinMesh.add(ring);

    const hitMesh = createHitProxy(data.displayRadius, bodyRoot, disposables);
    hitMesh.userData.bodyId = data.id;

    bodies.set(data.id, {
      data,
      orbitRoot,
      bodyRoot,
      spinMesh,
      hitMesh,
      orbitLine,
      phase: data.order * 0.65,
    });
  }

  for (const data of mvpBodies) {
    if (data.type !== 'moon' || !data.parentId) continue;
    const parent = bodies.get(data.parentId);
    if (!parent) continue;

    const dist = orbitDistance(data, scaleMode);
    const moonOrbit = new THREE.Object3D();
    moonOrbit.name = `${data.id}-orbit`;
    parent.bodyRoot.add(moonOrbit);

    const moonLine = createOrbitLine(dist, 0x7a8aa8);
    moonOrbit.add(moonLine);
    disposables.push(moonLine.material as THREE.Material);

    const moonBody = new THREE.Object3D();
    moonBody.position.set(dist, 0, 0);
    moonOrbit.add(moonBody);

    const moonMesh = createSphereMesh(data, quality.sphereSegments);
    moonBody.add(moonMesh);
    disposables.push(moonMesh.geometry, moonMesh.material as THREE.Material);

    const hitMesh = createHitProxy(data.displayRadius, moonBody, disposables);
    hitMesh.userData.bodyId = data.id;

    bodies.set(data.id, {
      data,
      orbitRoot: moonOrbit,
      bodyRoot: moonBody,
      spinMesh: moonMesh,
      hitMesh,
      orbitLine: moonLine,
      phase: 1.1,
    });
  }

  const activateDecorations = (): void => {
    if (decorationsActive) return;
    decorationsActive = true;
    createStarfieldDecoration();
    for (const belt of deferredBelts) addBelt(belt);
    deferredBelts.length = 0;
  };
  if (!options.deferDecorations) activateDecorations();

  const applyScaleMode = (mode: ScaleMode): void => {
    scaleMode = mode;
    for (const runtime of bodies.values()) {
      const { data, bodyRoot, orbitLine, spinMesh } = runtime;
      if (data.type === 'star') continue;

      if (data.type === 'belt' && spinMesh instanceof THREE.InstancedMesh) {
        fillAsteroidBelt(spinMesh, data, mode, quality.beltCount);
        spinMesh.visible = true;
        continue;
      }

      const dist = orbitDistance(data, mode);
      bodyRoot.position.set(dist, 0, 0);
      if (orbitLine) resizeOrbitLine(orbitLine, dist);
    }
  };

  const applyQuality = (preset: QualityPreset): void => {
    quality = preset;
    const activeStarfield = starfield;
    if (activeStarfield) {
      activeStarfield.geometry.setDrawRange(0, Math.min(preset.starCount, starCapacity));
      const mat = activeStarfield.material as THREE.PointsMaterial;
      mat.size = preset.id === 'low' ? 0.48 : preset.id === 'medium' ? 0.4 : 0.38;
      mat.opacity = preset.id === 'low' ? 0.8 : 0.92;
    }

    for (const runtime of bodies.values()) {
      if (runtime.data.type === 'belt' && runtime.spinMesh instanceof THREE.InstancedMesh) {
        fillAsteroidBelt(runtime.spinMesh, runtime.data, scaleMode, preset.beltCount);
      }
      // Glow cheaper on low
      if (runtime.data.type === 'star') {
        const glow = runtime.spinMesh.getObjectByName('sun-glow');
        if (glow) glow.visible = preset.id !== 'low';
      }
      if (runtime.orbitLine) {
        const lineMat = runtime.orbitLine.material as THREE.LineBasicMaterial;
        lineMat.opacity = preset.id === 'low' ? 0.22 : 0.38;
      }
    }
  };

  const update = (elapsedSimDays: number): void => {
    for (const runtime of bodies.values()) {
      const { data, orbitRoot, spinMesh, phase } = runtime;

      if (data.type === 'belt' && spinMesh instanceof THREE.InstancedMesh) {
        const period = (spinMesh.userData.spinPeriod as number) || 1600;
        spinMesh.rotation.y = orbitalAngle(elapsedSimDays, period, 0) * 0.12;
        continue;
      }

      if (data.type === 'star') {
        spinMesh.rotation.y = spinAngle(elapsedSimDays, data.rotationPeriodHours);
        continue;
      }

      if (data.orbitalPeriodDays > 0) {
        orbitRoot.rotation.y = orbitalAngle(elapsedSimDays, data.orbitalPeriodDays, phase);
      }

      if (data.rotationPeriodHours) {
        spinMesh.rotation.y = spinAngle(elapsedSimDays, data.rotationPeriodHours);
      }
    }
  };

  applyScaleMode(scaleMode);
  applyQuality(quality);
  update(0);

  return {
    root,
    bodies,
    get scaleMode() {
      return scaleMode;
    },
    get quality() {
      return quality.id;
    },
    setScaleMode: (mode: ScaleMode) => {
      applyScaleMode(mode);
    },
    setQuality: (preset: QualityPreset) => {
      applyQuality(preset);
    },
    activateDecorations,
    update,
    dispose: () => {
      for (const d of disposables) d.dispose();
      for (const runtime of bodies.values()) {
        if (runtime.orbitLine) runtime.orbitLine.geometry.dispose();
      }
      root.clear();
    },
  };
}
