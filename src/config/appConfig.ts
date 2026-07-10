export const APP_CONFIG = {
  title: '太陽系模擬器',
  subtitle: '展示模式 · 教育壓縮尺度',
  background: 0x03050c,
  cameraDistance: 50,
  cameraY: 14,
  /**
   * OrbitControls / 相機看向的 Y。
   * 設為負值 = 視線略低於軌道面 → 太陽系在畫面中偏上（避開底部空洞）。
   */
  viewTargetY: -6.5,
  fov: 48,
  near: 0.1,
  far: 4000,
  defaultTimeScale: 20,
} as const;
