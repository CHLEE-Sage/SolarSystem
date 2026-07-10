# M4 Dogfood 報告 — 商業級 polish

> 日期：2026-07-09  
> 範圍：Loading、品質切換、WebGL fallback、響應式 HUD、可及性、e2e smoke  
> 環境：WSL · Vite preview / dev · Chrome-class desktop

## 檢查清單（Master Spec M4）

| 項目 | 結果 | 備註 |
|------|------|------|
| 首屏 loading 非長黑畫面 | ✅ | `#loading` + 進度文案 |
| WebGL 不足 fallback | ✅ | `#fallback` 繁中說明 |
| 品質切換 high/medium/low/auto | ✅ | HUD「畫面品質」 |
| 自動降級（低 FPS） | ✅ | `FpsMonitor` + auto mode |
| 桌機操作核心功能 | ✅ | 播放、尺度、聚焦、重設 |
| 手機 viewport HUD | ✅ | 底部面板 + 收合 |
| 可及性：label / live / skip | ✅ | skip-link、aria-live、按鈕 label |
| console 正常流程無 error | ⏳ | 請 hard refresh 後確認 |
| Lighthouse Accessibility ≥90 | ⏳ | 本機 Lighthouse 人工驗收 |
| Dogfood Critical/High 未處理 | ✅ 無未解 Critical | 見下方 |

## 已知限制（非 Critical）

| 嚴重度 | 項目 | 處理 |
|--------|------|------|
| Medium | 球面 segments 於 runtime 品質切換不會重建 geometry | 啟動時套用；runtime 主要調 DPR／粒子／環可見性 |
| Low | FPS 顯示在狀態列可能略抖 | 滑動平均 90 frame |
| Low | 真實 AU 模式外行星需聚焦 | 規格預期，notice 已說明 |

## 修復紀錄（本輪）

1. Loading overlay + progress hook  
2. WebGL detect + fallback UI  
3. Quality presets + auto downgrade  
4. HUD 收合、about 文案、鍵盤 Space、skip link  
5. `npm run test:e2e` 靜態 build smoke  

## 建議後續（M5）

- Vercel production URL + 截圖素材  
- Lighthouse 正式分數截圖入 repo  
- ATTRIBUTIONS 最終審核  
