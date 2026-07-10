export type WebGLSupport = {
  ok: boolean;
  reason?: string;
};

/**
 * Lightweight WebGL capability check (WebGL1 or WebGL2).
 * Safe to call before creating THREE.WebGLRenderer.
 */
export function detectWebGL(): WebGLSupport {
  if (typeof document === 'undefined') {
    return { ok: false, reason: '非瀏覽器環境' };
  }
  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    if (gl2) return { ok: true };
    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (gl) return { ok: true };
    return {
      ok: false,
      reason: '此瀏覽器或裝置不支援 WebGL，無法啟動 3D 場景。',
    };
  } catch {
    return {
      ok: false,
      reason: 'WebGL 初始化失敗（可能被政策或硬體封鎖）。',
    };
  }
}
