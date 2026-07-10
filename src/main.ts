import { createApp } from './app/createApp';
import { detectWebGL } from './core/quality/detectWebGL';
import './ui/styles/globals.css';

function setLoading(detail: string, pct: number): void {
  const detailEl = document.querySelector<HTMLElement>('#loading-detail');
  const bar = document.querySelector<HTMLElement>('#loading-bar');
  const loading = document.querySelector<HTMLElement>('#loading');
  if (detailEl) detailEl.textContent = detail;
  if (bar) bar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  if (loading) loading.setAttribute('aria-busy', pct < 100 ? 'true' : 'false');
}

function hideLoading(): void {
  const loading = document.querySelector<HTMLElement>('#loading');
  if (!loading) return;
  loading.classList.add('is-done');
  loading.setAttribute('aria-busy', 'false');
  window.setTimeout(() => {
    loading.hidden = true;
  }, 380);
}

function showFallback(message: string): void {
  const fallback = document.querySelector<HTMLElement>('#fallback');
  const msg = document.querySelector<HTMLElement>('#fallback-message');
  const loading = document.querySelector<HTMLElement>('#loading');
  if (msg) msg.textContent = message;
  if (fallback) fallback.hidden = false;
  if (loading) {
    loading.hidden = true;
    loading.setAttribute('aria-busy', 'false');
  }
  const canvas = document.querySelector<HTMLCanvasElement>('#webgl');
  if (canvas) canvas.style.display = 'none';
  const hud = document.querySelector<HTMLElement>('#hud');
  if (hud) hud.hidden = true;
  const tip = document.querySelector<HTMLElement>('#tip');
  if (tip) tip.hidden = true;
}

async function boot(): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>('#webgl');
  const statusEl = document.querySelector<HTMLElement>('#status');
  const playBtn = document.querySelector<HTMLButtonElement>('#btn-play');
  const resetTimeBtn = document.querySelector<HTMLButtonElement>('#btn-reset-time');
  const resetCamBtn = document.querySelector<HTMLButtonElement>('#btn-reset-cam');
  const speedSelect = document.querySelector<HTMLSelectElement>('#speed');
  const bodySelect = document.querySelector<HTMLSelectElement>('#body-focus');
  const scaleSelect = document.querySelector<HTMLSelectElement>('#scale-mode');
  const qualitySelect = document.querySelector<HTMLSelectElement>('#quality-mode');
  const scaleNoticeEl = document.querySelector<HTMLElement>('#scale-notice');
  const qualityNoticeEl = document.querySelector<HTMLElement>('#quality-notice');
  const subtitleEl = document.querySelector<HTMLElement>('#hud-subtitle');
  const infoEl = document.querySelector<HTMLElement>('#info');
  const tipEl = document.querySelector<HTMLElement>('#tip');
  const tipCloseBtn = document.querySelector<HTMLButtonElement>('#tip-close');
  const hudEl = document.querySelector<HTMLElement>('#hud');
  const hudToggleBtn = document.querySelector<HTMLButtonElement>('#btn-hud-toggle');
  const hudBodyEl = document.querySelector<HTMLElement>('#hud-body');

  if (!canvas) {
    showFallback('找不到 #webgl 畫布，頁面結構可能損壞。');
    return;
  }

  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.zIndex = '0';

  setLoading('檢查 WebGL 支援…', 5);
  const webgl = detectWebGL();
  if (!webgl.ok) {
    showFallback(
      webgl.reason ??
        '此瀏覽器或裝置不支援 WebGL，無法啟動 3D 場景。請更新瀏覽器並開啟硬體加速。',
    );
    return;
  }

  try {
    await createApp(
      canvas,
      {
        statusEl,
        playBtn,
        resetTimeBtn,
        resetCamBtn,
        speedSelect,
        bodySelect,
        scaleSelect,
        qualitySelect,
        scaleNoticeEl,
        qualityNoticeEl,
        subtitleEl,
        infoEl,
        tipEl,
        tipCloseBtn,
        hudEl,
        hudToggleBtn,
        hudBodyEl,
      },
      {
        onProgress: (pct, detail) => setLoading(detail, pct),
      },
    );
    hideLoading();
  } catch (err) {
    const message = err instanceof Error ? err.message : '啟動失敗';
    console.error(err);
    showFallback(`啟動失敗：${message}`);
    if (statusEl) statusEl.textContent = message;
  }
}

void boot();
