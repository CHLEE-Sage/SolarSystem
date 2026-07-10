# Three.js 太陽系模擬器（商業展示級）

純展示 / 作品集向的太陽系 3D demo。規格見 [`docs/MASTER-SPEC.md`](./docs/MASTER-SPEC.md)。

## 技術棧

- Vite + TypeScript + three.js（**非** React Three Fiber）
- 繁體中文 HUD
- 靜態建置，可部署 Vercel

## 本機開發

```bash
# 若環境 NODE_ENV=production，請改用：
# NODE_ENV=development npm install --include=dev
npm install
npm run dev
```

瀏覽器開啟終端機顯示的本機 URL（預設 `http://localhost:5173`）。

## 品質閘門

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
npm run preview
```

## 專案狀態

| 里程碑 | 狀態 |
|---|---|
| **M0** 骨架 + 品質閘門 | ✅ 完成 |
| **M1** 基礎太陽系場景 | ✅ 完成 |
| **M2** 互動控制與資訊 UI | ✅ 完成 |
| **M3** 教育／接近真實 AU 尺度切換 | ✅ 完成 |
| **M4** 商業 polish、效能／可及性 | ✅ 完成 |
| M5 | 發布、作品集包裝（見 Master Spec C2） |

## 操作（M4）

- 拖曳旋轉 · 滾輪縮放
- **點選行星**顯示資訊 + 高亮 + 飛入相機
- **尺度模式**：教育壓縮（預設）↔ 接近真實 AU 距離
- **畫面品質**：自動 / 高 / 平衡 / 效能優先（低 FPS 可自動降級）
- HUD：播放/暫停、時間倍率、聚焦選單、重設時間/視角、收合面板
- Esc 取消選取 · Home 重設視角 · Space 播放/暫停
- 首屏 loading；無 WebGL 時顯示繁中 fallback
- 畫面：太陽 + 8 行星 + 月球 + 土星環 + 小行星帶 + 軌道線 + 星空

## 部署（Vercel）

1. 匯入此 repo / 目錄  
2. Build command: `npm run build`  
3. Output: `dist`  
4. 已提供 `vercel.json`（`base: './'` 利於相對路徑）

## 文件

- 規格：`docs/MASTER-SPEC.md`
- M4 Dogfood：`docs/dogfood-m4.md`
- 素材授權：`public/assets/legal/asset-attribution.md`

## 授權注意

貼圖與資料來源請更新 `public/assets/legal/asset-attribution.md`。不使用需禁止商用的素材。
