import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { APP_CONFIG } from '../config/appConfig';
import {
  homeCameraDistance,
  SCALE_MODE_COPY,
  type ScaleMode,
} from '../core/math/scaleMapping';
import { FpsMonitor } from '../core/quality/fpsMonitor';
import {
  detectPreferredQuality,
  getQualityPreset,
  QUALITY_COPY,
  QUALITY_PRESETS,
  type QualityLevel,
  type ResolvedQuality,
} from '../core/quality/qualityPresets';
import { applyRendererQuality, createRenderer } from '../core/renderer/createRenderer';
import { resizeRenderer } from '../core/renderer/resizeRenderer';
import { createCamera } from '../core/scene/createCamera';
import { createLights } from '../core/scene/createLights';
import { createScene } from '../core/scene/createScene';
import { SimulationClock } from '../core/time/SimulationClock';
import { createFocusAnimator } from '../features/camera/focusCamera';
import {
  buildPickables,
  pickBodyId,
  pointerFromEvent,
} from '../features/interaction/pickBody';
import { SelectionHighlight } from '../features/interaction/selectionHighlight';
import { createSolarSystem } from '../features/solar-system/createSolarSystem';
import type { BodyData, PlanetsFile } from '../types/bodies';

export type AppHandle = {
  dispose: () => void;
  clock: SimulationClock;
};

export type AppUi = {
  statusEl: HTMLElement | null;
  playBtn: HTMLButtonElement | null;
  resetTimeBtn: HTMLButtonElement | null;
  resetCamBtn: HTMLButtonElement | null;
  speedSelect: HTMLSelectElement | null;
  bodySelect: HTMLSelectElement | null;
  scaleSelect: HTMLSelectElement | null;
  qualitySelect: HTMLSelectElement | null;
  scaleNoticeEl: HTMLElement | null;
  qualityNoticeEl: HTMLElement | null;
  subtitleEl: HTMLElement | null;
  infoEl: HTMLElement | null;
  tipEl: HTMLElement | null;
  tipCloseBtn: HTMLButtonElement | null;
  hudEl: HTMLElement | null;
  hudToggleBtn: HTMLButtonElement | null;
  hudBodyEl: HTMLElement | null;
};

export type CreateAppOptions = {
  onProgress?: (pct: number, detail: string) => void;
  initialQuality?: QualityLevel;
};

function formatBodyInfo(data: BodyData, mode: ScaleMode): string {
  const period =
    data.orbitalPeriodDays > 0
      ? `公轉約 ${data.orbitalPeriodDays.toLocaleString('zh-Hant')} 日`
      : '中心恆星';
  const dist =
    data.semiMajorAxisAU > 0 ? `平均距離 ${data.semiMajorAxisAU} AU · ` : '';
  const scaleNote =
    mode === 'realisticAU' && data.type === 'planet'
      ? '<br/><em class="muted">軌道距離：接近真實 AU；行星大小仍為展示放大。</em>'
      : mode === 'educational' && data.type === 'planet'
        ? '<br/><em class="muted">軌道／大小：教育壓縮，非真實比例。</em>'
        : '';
  return `<strong>${data.nameZh}</strong> · ${data.nameEn}<br/>${dist}${period}<br/>${data.descriptionZh}${scaleNote}`;
}

function outerPlanetDistance(dataFile: PlanetsFile): number {
  let max = 0;
  for (const b of dataFile.bodies) {
    if (b.type === 'planet' && b.displayDistance > max) max = b.displayDistance;
  }
  return max || 40;
}

/** Buttons: isolate from canvas + OrbitControls. */
function bindHudButton(el: HTMLElement | null, handler: () => void): void {
  if (!el) {
    console.warn('[solar] missing HUD button');
    return;
  }
  el.addEventListener(
    'pointerdown',
    (e) => {
      e.stopPropagation();
    },
    true,
  );
  el.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handler();
  });
}

/** Selects: never preventDefault (breaks native dropdown). */
function bindHudSelect(el: HTMLSelectElement | null, handler: () => void): void {
  if (!el) {
    console.warn('[solar] missing HUD select');
    return;
  }
  el.addEventListener(
    'pointerdown',
    (e) => {
      e.stopPropagation();
    },
    true,
  );
  el.addEventListener(
    'mousedown',
    (e) => {
      e.stopPropagation();
    },
    true,
  );
  el.addEventListener('change', (e) => {
    e.stopPropagation();
    handler();
  });
}

const QUALITY_RANK: ResolvedQuality[] = ['high', 'medium', 'low'];

function downgradeQuality(q: ResolvedQuality): ResolvedQuality | null {
  const i = QUALITY_RANK.indexOf(q);
  if (i < 0 || i >= QUALITY_RANK.length - 1) return null;
  return QUALITY_RANK[i + 1]!;
}

export async function createApp(
  canvas: HTMLCanvasElement,
  ui: AppUi,
  options: CreateAppOptions = {},
): Promise<AppHandle> {
  const progress = options.onProgress ?? (() => undefined);
  progress(8, '偵測裝置效能…');

  const preferred = detectPreferredQuality();
  let qualityMode: QualityLevel = options.initialQuality ?? 'auto';
  let resolvedQuality: ResolvedQuality = resolveInitial(qualityMode, preferred);
  let qualityPreset = getQualityPreset(resolvedQuality);

  progress(18, '建立渲染器…');
  const renderer = createRenderer(canvas, qualityPreset);
  const scene = createScene();
  const camera = createCamera();
  createLights(scene);

  progress(35, '載入天體資料…');
  const res = await fetch(`${import.meta.env.BASE_URL}assets/data/planets.json`);
  if (!res.ok) {
    throw new Error(`無法載入 planets.json（${res.status}）`);
  }
  const dataFile = (await res.json()) as PlanetsFile;

  progress(55, '建構太陽系場景…');
  const solar = createSolarSystem(dataFile, { quality: qualityPreset });
  scene.add(solar.root);

  const clock = new SimulationClock();
  clock.timeScale = APP_CONFIG.defaultTimeScale;

  let scaleMode: ScaleMode = dataFile.scaleModeDefault ?? 'educational';
  const outerEdu = outerPlanetDistance(dataFile);

  const homeTarget = new THREE.Vector3(0, APP_CONFIG.viewTargetY, 0);
  const homePosFor = (mode: ScaleMode): THREE.Vector3 => {
    const dist = homeCameraDistance(mode, outerEdu);
    return new THREE.Vector3(0, APP_CONFIG.cameraY, dist);
  };
  let homePos = homePosFor(scaleMode);
  camera.position.copy(homePos);
  camera.lookAt(homeTarget);

  progress(72, '設定相機與互動…');
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 6;
  controls.maxDistance = scaleMode === 'realisticAU' ? 1200 : 180;
  controls.target.copy(homeTarget);
  controls.domElement = canvas;

  const focusAnim = createFocusAnimator(camera, controls);
  const highlight = new SelectionHighlight();
  const pickables = buildPickables(solar.bodies);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const fpsMonitor = new FpsMonitor(90);

  const getRuntimeWorldPosition = (runtime: { bodyRoot: THREE.Object3D }): THREE.Vector3 => {
    runtime.bodyRoot.updateWorldMatrix(true, false);
    return runtime.bodyRoot.getWorldPosition(new THREE.Vector3());
  };

  let selectedId: string | null = null;
  const pointerDown = new THREE.Vector2();
  let dragging = false;

  const flashStatus = (msg: string): void => {
    if (ui.statusEl) ui.statusEl.textContent = msg;
  };

  const syncScaleUi = (): void => {
    const copy = SCALE_MODE_COPY[scaleMode];
    if (ui.scaleSelect && ui.scaleSelect.value !== scaleMode) {
      ui.scaleSelect.value = scaleMode;
    }
    if (ui.scaleNoticeEl) ui.scaleNoticeEl.textContent = copy.notice;
    if (ui.subtitleEl) {
      ui.subtitleEl.textContent = `展示模式 · ${copy.short} · ${QUALITY_PRESETS[resolvedQuality].label} · M4`;
    }
  };

  const syncQualityUi = (): void => {
    if (ui.qualitySelect && ui.qualitySelect.value !== qualityMode) {
      ui.qualitySelect.value = qualityMode;
    }
    if (ui.qualityNoticeEl) {
      const autoNote =
        qualityMode === 'auto' ? `（目前：${QUALITY_PRESETS[resolvedQuality].label}）` : '';
      ui.qualityNoticeEl.textContent = `${QUALITY_COPY[qualityMode]}${autoNote}`;
    }
  };

  const applyRenderQuality = (resolved: ResolvedQuality, announce: boolean): void => {
    resolvedQuality = resolved;
    qualityPreset = QUALITY_PRESETS[resolved];
    applyRendererQuality(renderer, qualityPreset);
    solar.setQuality(qualityPreset);
    syncQualityUi();
    syncScaleUi();
    if (announce) {
      flashStatus(`畫面品質：${qualityPreset.label}`);
    }
  };

  const setSelected = (id: string | null, fly = true): void => {
    selectedId = id;
    if (!id) {
      focusAnim.stopFollowing();
      highlight.clear();
      if (ui.bodySelect) ui.bodySelect.value = '';
      if (ui.infoEl) {
        ui.infoEl.innerHTML = '點選行星或自選單聚焦，查看繁中簡介。';
      }
      return;
    }
    const runtime = solar.bodies.get(id);
    if (!runtime) return;
    highlight.attach(runtime.bodyRoot, runtime.data.displayRadius);
    if (ui.bodySelect) ui.bodySelect.value = id;
    if (ui.infoEl) ui.infoEl.innerHTML = formatBodyInfo(runtime.data, scaleMode);
    if (fly) {
      focusAnim.focus({
        getWorldPosition: () => getRuntimeWorldPosition(runtime),
        displayRadius: runtime.data.displayRadius,
      });
    }
  };

  const applyScaleMode = (mode: ScaleMode, reframing: boolean): void => {
    const prev = scaleMode;
    scaleMode = mode;
    solar.setScaleMode(mode);
    solar.update(clock.elapsedSimDays);

    controls.maxDistance = mode === 'realisticAU' ? 1200 : 180;
    homePos = homePosFor(mode);
    syncScaleUi();

    if (selectedId) {
      const runtime = solar.bodies.get(selectedId);
      if (runtime && ui.infoEl) {
        ui.infoEl.innerHTML = formatBodyInfo(runtime.data, scaleMode);
      }
      if (reframing && runtime) {
        focusAnim.focus({
          getWorldPosition: () => getRuntimeWorldPosition(runtime),
          displayRadius: runtime.data.displayRadius,
        });
      }
    } else if (reframing) {
      focusAnim.snapTo(homePos, homeTarget);
    }

    const copy = SCALE_MODE_COPY[mode];
    flashStatus(
      prev === mode
        ? `已套用${copy.short}`
        : `已切換為${copy.short} · 軌道距離已更新`,
    );
  };

  if (ui.bodySelect) {
    const optionsList = dataFile.bodies
      .filter((b) => b.isMvp && b.type !== 'belt')
      .sort((a, b) => a.order - b.order);
    for (const b of optionsList) {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = `${b.nameZh}（${b.nameEn}）`;
      ui.bodySelect.appendChild(opt);
    }
  }

  const syncPlayLabel = (): void => {
    if (ui.playBtn) {
      ui.playBtn.textContent = clock.isPlaying ? '暫停' : '播放';
      ui.playBtn.setAttribute('aria-pressed', clock.isPlaying ? 'true' : 'false');
    }
  };
  syncPlayLabel();
  syncScaleUi();
  syncQualityUi();

  // --- HUD actions ---
  bindHudButton(ui.playBtn, () => {
    clock.toggle();
    syncPlayLabel();
    flashStatus(clock.isPlaying ? '播放中' : '已暫停');
  });

  bindHudButton(ui.resetTimeBtn, () => {
    clock.reset();
    solar.update(0);
    flashStatus('時間已重設 · 模擬 0.0 日');
  });

  bindHudButton(ui.resetCamBtn, () => {
    homePos = homePosFor(scaleMode);
    focusAnim.snapTo(homePos, homeTarget);
    setSelected(null, false);
    flashStatus('視角已重設為全景');
  });

  bindHudSelect(ui.speedSelect, () => {
    const v = Number(ui.speedSelect?.value ?? APP_CONFIG.defaultTimeScale);
    clock.setTimeScale(v);
    flashStatus(`時間倍率 ${v}×`);
  });

  bindHudSelect(ui.bodySelect, () => {
    const id = ui.bodySelect?.value || null;
    setSelected(id, true);
  });

  bindHudSelect(ui.scaleSelect, () => {
    const raw = ui.scaleSelect?.value ?? 'educational';
    const mode: ScaleMode = raw === 'realisticAU' ? 'realisticAU' : 'educational';
    applyScaleMode(mode, true);
  });

  bindHudSelect(ui.qualitySelect, () => {
    const raw = (ui.qualitySelect?.value ?? 'auto') as QualityLevel;
    qualityMode = raw === 'high' || raw === 'medium' || raw === 'low' || raw === 'auto' ? raw : 'auto';
    const next = qualityMode === 'auto' ? preferred : qualityMode;
    fpsMonitor.reset();
    applyRenderQuality(next, true);
  });

  const tipKey = 'solar-m2-tip-dismissed';
  if (ui.tipEl && localStorage.getItem(tipKey) === '1') {
    ui.tipEl.hidden = true;
  }
  bindHudButton(ui.tipCloseBtn, () => {
    if (ui.tipEl) ui.tipEl.hidden = true;
    localStorage.setItem(tipKey, '1');
  });

  const hudCollapsedKey = 'solar-m4-hud-collapsed';
  const setHudCollapsed = (collapsed: boolean): void => {
    if (ui.hudEl) ui.hudEl.classList.toggle('is-collapsed', collapsed);
    if (ui.hudToggleBtn) {
      ui.hudToggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      ui.hudToggleBtn.textContent = collapsed ? '展開' : '收合';
      ui.hudToggleBtn.title = collapsed ? '展開面板' : '收合面板';
    }
    localStorage.setItem(hudCollapsedKey, collapsed ? '1' : '0');
  };
  if (localStorage.getItem(hudCollapsedKey) === '1') {
    setHudCollapsed(true);
  }
  bindHudButton(ui.hudToggleBtn, () => {
    const collapsed = !ui.hudEl?.classList.contains('is-collapsed');
    setHudCollapsed(collapsed);
  });

  if (ui.hudEl) {
    ui.hudEl.addEventListener(
      'pointerdown',
      (e) => {
        e.stopPropagation();
      },
      true,
    );
  }

  canvas.addEventListener('pointerdown', (e) => {
    pointerDown.set(e.clientX, e.clientY);
    dragging = false;
  });
  canvas.addEventListener('pointermove', (e) => {
    const dx = e.clientX - pointerDown.x;
    const dy = e.clientY - pointerDown.y;
    if (dx * dx + dy * dy > 16) dragging = true;
  });
  canvas.addEventListener('pointerup', (e) => {
    if (dragging) return;
    pointerFromEvent(e, canvas, pointer);
    const id = pickBodyId(raycaster, pointer, camera, pickables);
    if (id) setSelected(id, true);
  });

  const onKey = (e: KeyboardEvent): void => {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

    if (e.key === 'Escape') {
      setSelected(null, false);
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      homePos = homePosFor(scaleMode);
      focusAnim.snapTo(homePos, homeTarget);
      flashStatus('視角已重設為全景');
      return;
    }
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      clock.toggle();
      syncPlayLabel();
      flashStatus(clock.isPlaying ? '播放中' : '已暫停');
    }
  };
  window.addEventListener('keydown', onKey);

  const threeClock = new THREE.Clock();
  let raf = 0;
  let disposed = false;
  let animElapsed = 0;

  const onResize = (): void => {
    resizeRenderer(renderer, camera);
    applyRendererQuality(renderer, qualityPreset);
  };
  window.addEventListener('resize', onResize);
  onResize();

  const updateStatus = (): void => {
    if (!ui.statusEl) return;
    const copy = SCALE_MODE_COPY[scaleMode];
    const sel = selectedId
      ? ` · 已選 ${solar.bodies.get(selectedId)?.data.nameZh ?? selectedId}`
      : '';
    const fps = Math.round(fpsMonitor.fps);
    ui.statusEl.textContent = `${copy.short} · ${qualityPreset.label} · ${fps} FPS · 模擬 ${clock.elapsedSimDays.toFixed(1)} 日 · ${
      clock.timeScale
    }x · ${clock.isPlaying ? '播放中' : '已暫停'}${sel}`;
  };

  if (ui.infoEl) {
    ui.infoEl.innerHTML = '點選行星或自選單聚焦，查看繁中簡介。';
  }

  progress(92, '啟動渲染迴圈…');

  const tick = (): void => {
    if (disposed) return;
    const dt = threeClock.getDelta();
    animElapsed += dt;
    clock.update(dt);
    solar.update(clock.elapsedSimDays);
    focusAnim.update(dt);
    highlight.update(animElapsed);
    if (!focusAnim.isAnimating()) controls.update();
    renderer.render(scene, camera);

    fpsMonitor.sample(dt);
    if (qualityMode === 'auto' && fpsMonitor.shouldDowngrade(40, 10)) {
      const next = downgradeQuality(resolvedQuality);
      if (next) {
        applyRenderQuality(next, true);
        flashStatus(`自動降級畫質 → ${QUALITY_PRESETS[next].label}（維持流暢）`);
      }
    }

    updateStatus();
    raf = requestAnimationFrame(tick);
  };
  tick();
  progress(100, '完成');

  return {
    clock,
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      controls.dispose();
      highlight.dispose();
      solar.dispose();
      renderer.dispose();
    },
  };
}

function resolveInitial(level: QualityLevel, preferred: ResolvedQuality): ResolvedQuality {
  if (level === 'auto') return preferred;
  return level;
}
