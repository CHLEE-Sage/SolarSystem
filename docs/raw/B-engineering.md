## B. 工程架構／技術棧／資產管線

本段定義商業級 Three.js 太陽系模擬器的工程基準。專案目標為「作品集 + 商業展示」，預設採教育壓縮尺度，並提供切換至接近真實 AU 比例的模式。範圍固定為：太陽、8 行星、月球、土星環、簡化小行星帶。技術框架固定為 Vite + TypeScript + three.js，非 React Three Fiber。UI 以繁體中文為主，最終部署為 Vite static 至 Vercel。

---

## B1. 技術棧鎖定

### B1.1 核心技術

專案必須使用以下技術棧：

| 類別 | 技術 | 用途 |
|---|---|---|
| Build Tool | Vite | 靜態前端建置、開發伺服器、Vercel 部署輸出 |
| Language | TypeScript | 型別安全、模組化、商業級可維護性 |
| 3D Engine | three.js | WebGL 3D 場景、材質、相機、後處理 |
| UI | 原生 DOM + TypeScript | 控制面板、模式切換、時間控制、繁中標籤 |
| Styling | CSS Modules 或 plain CSS | UI 樣式、HUD、Overlay |
| Deployment | Vercel Static Hosting | Vite build 後部署靜態檔案 |

不得改用 React Three Fiber、Babylon.js、Unity WebGL、Godot Web Export 或其他 3D 框架。

---

### B1.2 版本策略

版本策略以「穩定、可重現、可維護」為原則：

1. **three.js 鎖定 minor 版本**
   - `three` 不使用寬鬆 `*`。
   - 建議使用 `~` 或 exact version。
   - 原因：three.js 的 examples/addons API 與 shader/postprocessing 可能在 minor 之間有破壞性變動。

2. **Vite 與 TypeScript 使用當前穩定版**
   - 初始化時以當前 LTS Node.js 相容版本為準。
   - `package-lock.json`、`pnpm-lock.yaml` 或 `bun.lockb` 必須提交。
   - 團隊協作時不可刪除 lockfile。

3. **Runtime 依賴最小化**
   - 專案應以 three.js 為唯一核心 runtime 3D 依賴。
   - UI 不引入大型框架，避免作品集展示因框架重量影響載入速度。

4. **升級策略**
   - 升級 three.js 時必須驗證：
     - 貼圖載入
     - 後處理 bloom
     - OrbitControls
     - KTX2Loader / TextureLoader
     - mobile fallback
   - 升級後必須重新檢查 build size 與 FPS。

---

### B1.3 建議依賴清單

`package.json` 概念如下，版本號由實際初始化時鎖定：

```json
{
  "dependencies": {
    "three": "LOCKED_VERSION"
  },
  "devDependencies": {
    "@types/three": "LOCKED_VERSION",
    "vite": "LOCKED_VERSION",
    "typescript": "LOCKED_VERSION",
    "eslint": "LOCKED_VERSION",
    "prettier": "LOCKED_VERSION"
  }
}
```

> 備註：若使用 three.js 內建型別已足夠，可不安裝 `@types/three`，以實際 three.js 版本支援為準。

---

### B1.4 可接受的 three.js addons

以下 addons 可使用，但必須從 `three/examples/jsm/...` 或 `three/addons/...` 匯入，不另引第三方替代套件：

```ts
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
```

---

### B1.5 禁止依賴

以下依賴不得使用：

| 禁止項目 | 原因 |
|---|---|
| `@react-three/fiber` | 需求明確指定非 R3F |
| `@react-three/drei` | 與 R3F 綁定，不符合框架鎖定 |
| Babylon.js | 會改變核心架構 |
| Unity WebGL build | 不符合 Vite + TypeScript + three.js |
| 大型 UI framework，如完整 React/Vue/Svelte app | 專案目標為 three.js 展示，不應讓 UI 框架成為主體 |
| GSAP 作為核心動畫依賴 | 行星運動應由自有時間系統控制 |
| Lodash 全量匯入 | 小型工具函式自行撰寫即可 |
| 未授權或來源不明的貼圖包 | 商業展示風險高 |
| CDN-only runtime dependency | Vercel static 應可完整自包含部署 |

---

## B2. 目錄結構

專案根目錄以 Vite 標準結構為基礎。以下為固定建議結構，路徑需保持具體、可追蹤。

```txt
solar-system-simulator/
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ vite.config.ts
├─ index.html
├─ public/
│  ├─ favicon.svg
│  ├─ robots.txt
│  ├─ assets/
│  │  ├─ textures/
│  │  │  ├─ sun/
│  │  │  │  ├─ sun_2k.ktx2
│  │  │  │  └─ sun_source.json
│  │  │  ├─ planets/
│  │  │  │  ├─ mercury_1k.ktx2
│  │  │  │  ├─ venus_1k.ktx2
│  │  │  │  ├─ earth_day_2k.ktx2
│  │  │  │  ├─ earth_clouds_2k.ktx2
│  │  │  │  ├─ mars_1k.ktx2
│  │  │  │  ├─ jupiter_2k.ktx2
│  │  │  │  ├─ saturn_2k.ktx2
│  │  │  │  ├─ uranus_1k.ktx2
│  │  │  │  ├─ neptune_1k.ktx2
│  │  │  │  └─ planet_sources.json
│  │  │  ├─ moon/
│  │  │  │  ├─ moon_1k.ktx2
│  │  │  │  └─ moon_source.json
│  │  │  ├─ rings/
│  │  │  │  ├─ saturn_ring_2k.ktx2
│  │  │  │  └─ saturn_ring_source.json
│  │  │  └─ stars/
│  │  │     ├─ milkyway_2k.ktx2
│  │  │     └─ stars_source.json
│  │  ├─ data/
│  │  │  ├─ bodies.json
│  │  │  ├─ scale-presets.json
│  │  │  └─ asset-manifest.json
│  │  └─ legal/
│  │     ├─ asset-attribution.md
│  │     └─ licenses.md
├─ src/
│  ├─ main.ts
│  ├─ app/
│  │  ├─ createApp.ts
│  │  ├─ AppController.ts
│  │  └─ lifecycle.ts
│  ├─ core/
│  │  ├─ renderer/
│  │  │  ├─ createRenderer.ts
│  │  │  ├─ createComposer.ts
│  │  │  ├─ resizeRenderer.ts
│  │  │  └─ renderPipeline.ts
│  │  ├─ scene/
│  │  │  ├─ createScene.ts
│  │  │  ├─ createCamera.ts
│  │  │  ├─ createLights.ts
│  │  │  └─ sceneLayers.ts
│  │  ├─ time/
│  │  │  ├─ SimulationClock.ts
│  │  │  ├─ timeTypes.ts
│  │  │  └─ timePresets.ts
│  │  ├─ state/
│  │  │  ├─ SimulationStore.ts
│  │  │  ├─ stateTypes.ts
│  │  │  └─ defaultState.ts
│  │  └─ math/
│  │     ├─ orbitalMath.ts
│  │     ├─ scaleMapping.ts
│  │     └─ units.ts
│  ├─ features/
│  │  ├─ solar-system/
│  │  │  ├─ createSolarSystem.ts
│  │  │  ├─ updateSolarSystem.ts
│  │  │  ├─ solarSystemTypes.ts
│  │  │  └─ bodyRegistry.ts
│  │  ├─ bodies/
│  │  │  ├─ createSun.ts
│  │  │  ├─ createPlanet.ts
│  │  │  ├─ createMoon.ts
│  │  │  ├─ createSaturnRing.ts
│  │  │  ├─ createAsteroidBelt.ts
│  │  │  └─ bodyMaterials.ts
│  │  ├─ orbits/
│  │  │  ├─ createOrbitLine.ts
│  │  │  ├─ updateOrbitPositions.ts
│  │  │  └─ orbitTypes.ts
│  │  ├─ labels/
│  │  │  ├─ createLabelLayer.ts
│  │  │  ├─ updateLabels.ts
│  │  │  └─ labelTypes.ts
│  │  └─ camera/
│  │     ├─ cameraController.ts
│  │     ├─ focusTargets.ts
│  │     └─ cameraPresets.ts
│  ├─ assets/
│  │  ├─ loaders/
│  │  │  ├─ TexturePipeline.ts
│  │  │  ├─ loadBodyTextures.ts
│  │  │  └─ ktx2Loader.ts
│  │  └─ manifests/
│  │     └─ assetManifestTypes.ts
│  ├─ ui/
│  │  ├─ createUI.ts
│  │  ├─ controls/
│  │  │  ├─ TimeControls.ts
│  │  │  ├─ ScaleModeToggle.ts
│  │  │  ├─ BodyFocusPanel.ts
│  │  │  ├─ RenderQualityPanel.ts
│  │  │  └─ LocaleText.ts
│  │  ├─ hud/
│  │  │  ├─ InfoHUD.ts
│  │  │  ├─ PerformanceHUD.ts
│  │  │  └─ BodyTooltip.ts
│  │  └─ styles/
│  │     ├─ globals.css
│  │     ├─ layout.css
│  │     └─ controls.css
│  ├─ config/
│  │  ├─ appConfig.ts
│  │  ├─ renderConfig.ts
│  │  ├─ scaleConfig.ts
│  │  └─ qualityPresets.ts
│  ├─ i18n/
│  │  ├─ zh-TW.ts
│  │  └─ textKeys.ts
│  └─ types/
│     ├─ global.d.ts
│     └─ three-extensions.d.ts
└─ docs/
   ├─ asset-pipeline.md
   ├─ deployment.md
   ├─ performance-budget.md
   └─ source-attribution.md
```

---

## B3. Scene Graph 與模組職責

### B3.1 Scene Graph 總覽

太陽系場景應以清楚的階層節點組織，避免所有 mesh 直接掛在 scene root。

```txt
Scene
├─ WorldRoot
│  ├─ SolarSystemRoot
│  │  ├─ SunGroup
│  │  │  ├─ SunMesh
│  │  │  └─ SunGlowProxy
│  │  ├─ OrbitLinesGroup
│  │  │  ├─ MercuryOrbitLine
│  │  │  ├─ VenusOrbitLine
│  │  │  ├─ EarthOrbitLine
│  │  │  └─ ...
│  │  ├─ PlanetsGroup
│  │  │  ├─ MercuryGroup
│  │  │  │  └─ MercuryMesh
│  │  │  ├─ VenusGroup
│  │  │  │  └─ VenusMesh
│  │  │  ├─ EarthGroup
│  │  │  │  ├─ EarthMesh
│  │  │  │  ├─ EarthCloudMesh
│  │  │  │  └─ MoonOrbitGroup
│  │  │  │     └─ MoonGroup
│  │  │  │        └─ MoonMesh
│  │  │  ├─ MarsGroup
│  │  │  ├─ JupiterGroup
│  │  │  ├─ SaturnGroup
│  │  │  │  ├─ SaturnMesh
│  │  │  │  └─ SaturnRingMesh
│  │  │  ├─ UranusGroup
│  │  │  └─ NeptuneGroup
│  │  └─ AsteroidBeltGroup
│  │     ├─ AsteroidPoints
│  │     └─ AsteroidInstancedMesh
│  ├─ BackgroundGroup
│  │  └─ StarfieldSphere
│  ├─ LabelRoot
│  │  └─ CSS2D 或 DOM Overlay Labels
│  └─ DebugRoot
│     ├─ AxesHelper
│     └─ GridHelper
├─ CameraRig
│  └─ PerspectiveCamera
└─ LightsRoot
   ├─ SunPointLight
   ├─ AmbientLight
   └─ OptionalFillLight
```

---

### B3.2 模組職責

#### `src/main.ts`

職責：

- 讀取 root DOM。
- 初始化 app。
- 啟動 render loop。
- 綁定全域錯誤處理。

不應放入場景細節或行星資料。

---

#### `src/app/createApp.ts`

職責：

- 組合 renderer、scene、camera、controls、store、clock。
- 建立 `AppController`。
- 回傳可啟動與可銷毀的 app instance。

---

#### `src/core/renderer/*`

職責：

- 建立 `WebGLRenderer`。
- 建立 `EffectComposer`。
- 控制 tone mapping、color space、pixel ratio。
- resize 管理。
- quality preset 切換。

不得知道行星半徑、軌道週期等 domain data。

---

#### `src/core/scene/*`

職責：

- 建立基礎 scene、camera、lights。
- 定義 render layers。
- 設定背景色、fog、camera clipping range。

不得放入 UI 狀態或時間控制邏輯。

---

#### `src/core/time/*`

職責：

- 提供模擬時間。
- 支援暫停、播放、倍速。
- 支援教育壓縮時間與接近真實時間比例。
- 所有天體位置更新必須依賴此模組，不得直接讀 `Date.now()`。

---

#### `src/core/state/*`

職責：

- 維護目前模式：
  - scale mode
  - time speed
  - selected body
  - render quality
  - label visibility
  - orbit visibility
- 提供訂閱機制。
- 不使用 Redux、Zustand 等外部狀態庫。

---

#### `src/features/solar-system/*`

職責：

- 建立太陽系 root。
- 根據 `public/assets/data/bodies.json` 建立天體。
- 每 frame 更新天體位置、自轉、公轉。

---

#### `src/features/bodies/*`

職責：

- 建立 Sun、Planet、Moon、Saturn Ring、Asteroid Belt。
- 管理 geometry、material、mesh。
- 接收資料，不直接讀取全域 state。

---

#### `src/features/orbits/*`

職責：

- 建立軌道線。
- 支援教育壓縮與 AU 模式的軌道尺寸切換。
- 可根據 UI 開關顯示／隱藏。

---

#### `src/features/camera/*`

職責：

- OrbitControls 封裝。
- 點選天體後 camera focus。
- 提供 cinematic preset，例如：
  - 全景
  - 內行星
  - 地月系統
  - 土星環展示
  - 小行星帶

---

#### `src/ui/*`

職責：

- 以繁體中文呈現控制面板。
- 不直接操作 mesh。
- 透過 `SimulationStore` dispatch 狀態變更。

---

## B4. 渲染／燈光／後處理管線

### B4.1 Renderer 基準設定

`WebGLRenderer` 必須使用以下概念設定：

```ts
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxPixelRatio));
renderer.setSize(width, height);
```

基準原則：

- 使用 `SRGBColorSpace` 確保貼圖色彩正確。
- 使用 `ACESFilmicToneMapping` 讓太陽高亮與行星暗部更接近展示級視覺。
- pixel ratio 不可無限制跟隨裝置 DPR，避免高解析手機 GPU 過載。

---

### B4.2 Camera 設定

主相機使用 `PerspectiveCamera`：

```ts
const camera = new THREE.PerspectiveCamera(
  45,
  width / height,
  0.01,
  50000
);
```

策略：

- 教育壓縮模式可使用較小 far plane。
- 接近真實 AU 模式需使用 scale mapping，避免直接使用超大世界座標造成 z-fighting。
- 相機控制使用 `OrbitControls`。
- 點選天體時，不瞬移 camera，應使用內部插值或 damped transition。

---

### B4.3 燈光設計

#### 必要燈光

```txt
LightsRoot
├─ SunPointLight
└─ AmbientLight
```

#### SunPointLight

- 位置：太陽中心。
- 顏色：暖白。
- intensity 依 tone mapping 調整。
- 不啟用所有天體 castShadow / receiveShadow 作為預設，因行星尺度與距離會造成 shadow map 成本過高。

#### AmbientLight

- 極低強度。
- 用於避免行星背光面完全黑到無法辨識。
- 教育展示模式允許略高 ambient。
- 接近真實模式降低 ambient，強化太陽方向感。

---

### B4.4 太陽材質

太陽不應只依賴 PointLight，需具備 emissive 視覺：

```ts
const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,
  color: 0xffffff
});
```

或使用自訂 shader 產生簡化 solar surface 動態效果，但 MVP 不強制。

---

### B4.5 後處理管線

後處理管線：

```txt
Scene Render
→ RenderPass
→ Selective Bloom Pass
→ Output
```

允許使用：

```ts
EffectComposer
RenderPass
UnrealBloomPass
```

---

### B4.6 Bloom 範圍

Bloom 必須限制範圍，避免整個場景過曝。

Bloom 對象：

| 物件 | 是否 Bloom | 說明 |
|---|---:|---|
| 太陽本體 | 是 | 核心發光來源 |
| 太陽 glow proxy | 是 | 商業展示視覺重點 |
| 行星 | 否 | 避免材質失真 |
| 地球雲層 | 否 | 保持清晰 |
| 土星環 | 否 | 避免 ring 過曝 |
| 軌道線 | 可選低 bloom | 僅 cinematic 模式可開 |
| 星背景 | 否 | 防止背景洗白 |

實作策略：

- 使用 `Layers` 區分 bloom layer。
- SunMesh 與 SunGlowProxy 設定至 `BLOOM_LAYER`。
- 非 bloom 物件在 bloom pass 中以 dark material 替換或使用 selective bloom 管線。

---

### B4.7 Tone Mapping

固定使用：

```ts
THREE.ACESFilmicToneMapping
```

建議曝光值：

| 模式 | Exposure |
|---|---:|
| 教育壓縮預設 | 0.9 - 1.1 |
| 接近真實 AU | 0.7 - 1.0 |
| Cinematic 展示 | 1.0 - 1.3 |
| Mobile Low | 0.8 - 1.0 |

不得在 UI 中暴露過多技術參數給一般使用者；可提供「視覺風格」選項，而非直接暴露 raw exposure slider。

---

## B5. 資產管線

### B5.1 資產來源優先順序

資產來源必須依以下順序選擇：

1. **NASA / JPL / USGS public domain**
2. **ESA 或其他官方機構且授權明確**
3. **CC0 資產**
4. **明確允許商業使用的 CC BY 資產**
5. **自製或程式生成資產**

禁止使用：

- 來源不明的 Pinterest、Google Images 圖片。
- 未標示授權的貼圖包。
- 僅限個人使用的免費素材。
- 需要付費授權但未購買的商業素材。
- 無法追溯來源 URL 的素材。

---

### B5.2 授權追溯格式

每個素材必須記錄來源。追溯資料存放於：

```txt
public/assets/data/asset-manifest.json
public/assets/legal/asset-attribution.md
public/assets/legal/licenses.md
```

`asset-manifest.json` 概念格式：

```ts
interface AssetManifestItem {
  id: string;
  body: string;
  type: 'texture' | 'normalMap' | 'roughnessMap' | 'ringTexture' | 'starfield';
  localPath: string;
  sourceName: string;
  sourceUrl: string;
  author?: string;
  license: 'Public Domain' | 'CC0' | 'CC BY' | 'Custom';
  licenseUrl?: string;
  downloadedAt: string;
  processedFrom?: string;
  notes?: string;
}
```

範例：

```json
{
  "id": "earth_day_2k",
  "body": "earth",
  "type": "texture",
  "localPath": "/assets/textures/planets/earth_day_2k.ktx2",
  "sourceName": "NASA Visible Earth",
  "sourceUrl": "https://visibleearth.nasa.gov/",
  "license": "Public Domain",
  "downloadedAt": "YYYY-MM-DD",
  "notes": "Resized and compressed for web runtime."
}
```

---

### B5.3 資產格式

#### Runtime 優先格式

| 類型 | 優先格式 | 備援格式 |
|---|---|---|
| 行星貼圖 | `.ktx2` | `.webp` |
| 太陽貼圖 | `.ktx2` | `.webp` |
| 土星環 alpha 貼圖 | `.ktx2` | `.webp` / `.png` |
| 星背景 | `.ktx2` | `.webp` |
| 資料 | `.json` | 無 |

#### Source 原始檔

原始素材不放入 runtime bundle。若需要保留，放於外部設計資料夾或 Git LFS，不直接塞入 `public/assets`。

建議：

```txt
docs/source-assets/
├─ README.md
└─ sources.csv
```

但正式 runtime 只讀：

```txt
public/assets/
```

---

### B5.4 尺寸上限

商業展示版應有高品質，但必須控制載入成本。

#### Desktop High

| 資產 | 上限 |
|---|---:|
| 太陽 | 2048 x 1024 或 2048 x 2048 |
| 地球 | 2048 x 1024 或 2048 x 2048 |
| 木星 | 2048 x 1024 或 2048 x 2048 |
| 土星 | 2048 x 1024 或 2048 x 2048 |
| 其他行星 | 1024 x 512 或 1024 x 1024 |
| 月球 | 1024 x 512 或 1024 x 1024 |
| 土星環 | 2048 x 512 |
| 星背景 | 2048 x 1024 |

#### Mobile Low

| 資產 | 上限 |
|---|---:|
| 太陽 | 1024 |
| 地球 | 1024 |
| 木星 | 1024 |
| 土星 | 1024 |
| 其他行星 | 512 |
| 月球 | 512 |
| 土星環 | 1024 x 256 |
| 星背景 | 1024 |

---

### B5.5 貼圖載入策略

必須集中於：

```txt
src/assets/loaders/TexturePipeline.ts
src/assets/loaders/loadBodyTextures.ts
src/assets/loaders/ktx2Loader.ts
```

原則：

1. 不在 `createPlanet.ts` 裡直接寫 texture URL。
2. 貼圖路徑由 `public/assets/data/bodies.json` 或 asset manifest 提供。
3. 載入器應支援：
   - loading progress
   - error fallback
   - mobile quality variant
   - dispose

概念介面：

```ts
interface TextureRequest {
  id: string;
  path: string;
  colorSpace: 'srgb' | 'linear';
  required: boolean;
}

interface TexturePipeline {
  loadTexture(request: TextureRequest): Promise<THREE.Texture>;
  loadBodyTextureSet(bodyId: string, quality: RenderQuality): Promise<BodyTextureSet>;
  dispose(): void;
}
```

---

### B5.6 小行星帶資產策略

簡化小行星帶不應使用大量獨立 mesh。

優先策略：

1. `THREE.Points` 表現遠景碎石帶。
2. 少量 `InstancedMesh` 表現近景大顆粒。
3. 使用 procedural color / size variation。
4. 不為每顆小行星載入獨立貼圖。

建議數量：

| 品質 | Points | InstancedMesh |
|---|---:|---:|
| High | 3000 - 8000 | 200 - 500 |
| Medium | 1500 - 3000 | 100 - 200 |
| Low | 500 - 1500 | 0 - 100 |

---

## B6. 狀態與時間系統 API 形狀

### B6.1 狀態管理原則

狀態系統使用自製輕量 store，不引入 Redux/Zustand。

狀態分類：

1. **Simulation State**
   - 時間是否播放
   - 時間倍率
   - 當前模擬時間
   - scale mode

2. **View State**
   - selected body
   - camera target
   - labels on/off
   - orbit lines on/off

3. **Render State**
   - quality preset
   - bloom enabled
   - pixel ratio cap
   - texture quality

4. **UI State**
   - panel open/closed
   - language
   - tooltip visibility

---

### B6.2 Scale Mode

必須支援兩種模式：

```ts
type ScaleMode = 'educational-compressed' | 'near-real-au';
```

#### educational-compressed

用途：

- 預設模式。
- 適合作品集與商業展示。
- 行星可同時看見。
- 半徑與距離皆經過視覺壓縮。

#### near-real-au

用途：

- 教育切換模式。
- 盡量接近 AU 距離比例。
- 必須搭配 camera focus、速度控制與 UI 說明。
- 不要求真實半徑完全可視，否則使用者難以辨識行星。

---

### B6.3 State Interface

概念介面如下：

```ts
type BodyId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'asteroid-belt';

type RenderQuality = 'low' | 'medium' | 'high';

interface SimulationState {
  scaleMode: ScaleMode;
  isPlaying: boolean;
  timeMultiplier: number;
  simulatedDays: number;
  selectedBodyId: BodyId | null;
  showOrbitLines: boolean;
  showLabels: boolean;
  renderQuality: RenderQuality;
  bloomEnabled: boolean;
  locale: 'zh-TW';
}
```

---

### B6.4 Store API

```ts
interface SimulationStore {
  getState(): SimulationState;

  setScaleMode(mode: ScaleMode): void;
  setPlaying(isPlaying: boolean): void;
  setTimeMultiplier(multiplier: number): void;
  setSelectedBody(bodyId: BodyId | null): void;
  setRenderQuality(quality: RenderQuality): void;
  setBloomEnabled(enabled: boolean): void;

  subscribe(listener: (state: SimulationState) => void): () => void;
}
```

規則：

- UI 只能透過 store 改狀態。
- render loop 每 frame 讀取必要狀態。
- feature modules 不應直接操作 DOM UI。
- store 不應持有 Three.js mesh 實例，避免狀態層與渲染層耦合。

---

### B6.5 Time System API

```ts
interface SimulationClockOptions {
  initialSimulatedDays: number;
  timeMultiplier: number;
  isPlaying: boolean;
}

interface SimulationTick {
  deltaSeconds: number;
  simulatedDeltaDays: number;
  totalSimulatedDays: number;
}

interface SimulationClock {
  update(realDeltaSeconds: number): SimulationTick;
  setPlaying(isPlaying: boolean): void;
  setTimeMultiplier(multiplier: number): void;
  setSimulatedDays(days: number): void;
  getSimulatedDays(): number;
}
```

---

### B6.6 時間倍率建議

UI 顯示為繁體中文：

| UI 標籤 | 倍率 |
|---|---:|
| 暫停 | 0 |
| 慢速 | 1 日 / 秒 |
| 標準 | 7 日 / 秒 |
| 快速 | 30 日 / 秒 |
| 展示 | 180 日 / 秒 |
| 極速 | 365 日 / 秒 |

注意：

- 倍率是展示用，不代表真實時間流速。
- 介面需標註「此為教育展示時間比例」。

---

### B6.7 天體資料形狀

`public/assets/data/bodies.json` 概念：

```ts
interface CelestialBodyData {
  id: BodyId;
  displayNameZhTW: string;
  parentId: BodyId | null;

  radiusKm: number;
  semiMajorAxisAu?: number;
  orbitalPeriodDays?: number;
  rotationPeriodHours?: number;

  educationalScale: {
    radius: number;
    orbitRadius: number;
  };

  visual: {
    textureId?: string;
    color?: string;
    hasAtmosphere?: boolean;
    hasRing?: boolean;
  };
}
```

---

## B7. 建置與部署

### B7.1 Vite 設定

`vite.config.ts` 必須支援 base path 設定：

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsInlineLimit: 0
  }
});
```

原則：

- Vercel 部署在 root domain 時：`VITE_BASE_PATH=/`
- 若部署在子路徑，例如 `/solar-system/`：`VITE_BASE_PATH=/solar-system/`
- 大型貼圖不可被 inline 成 base64，因此 `assetsInlineLimit: 0`。

---

### B7.2 環境變數

環境變數只允許 `VITE_` 前綴。

建議：

```txt
VITE_BASE_PATH=/
VITE_DEFAULT_QUALITY=medium
VITE_ENABLE_PERFORMANCE_HUD=false
VITE_ASSET_CDN_BASE=
```

說明：

| 變數 | 用途 |
|---|---|
| `VITE_BASE_PATH` | Vite base path |
| `VITE_DEFAULT_QUALITY` | 預設渲染品質 |
| `VITE_ENABLE_PERFORMANCE_HUD` | 是否顯示 FPS/debug 資訊 |
| `VITE_ASSET_CDN_BASE` | 若未來貼圖移至 CDN，可指定外部 base URL |

不得在前端 env 放入 secret、API key 或私密 token。

---

### B7.3 Build Scripts

`package.json` scripts 概念：

```json
{
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc --noEmit",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write ."
  }
}
```

部署前至少執行：

```bash
npm run typecheck
npm run build
npm run preview
```

---

### B7.4 Vercel 設定

建議新增：

```txt
vercel.json
```

內容概念：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "cleanUrls": true
}
```

注意事項：

1. Vercel 專案 Framework Preset 選 `Vite`。
2. Build Command 使用 `npm run build`。
3. Output Directory 使用 `dist`。
4. 若使用 Vercel 環境變數，需設定：
   - Production
   - Preview
   - Development
5. 若使用子路徑部署，必須確認 `VITE_BASE_PATH` 與 Vite `base` 一致。
6. 貼圖放在 `public/assets` 時，部署後路徑為：
   - `/assets/textures/...`
   - 若 base path 非 `/`，需透過 helper 統一組合 URL。

---

### B7.5 Asset URL Helper

不得在各模組硬編 `/assets/...`。應集中處理：

```ts
interface AssetUrlOptions {
  basePath: string;
  cdnBase?: string;
}

function resolveAssetUrl(path: string, options: AssetUrlOptions): string {
  // path example: assets/textures/planets/earth_day_2k.ktx2
  // implementation handled in actual app
  return '';
}
```

規則：

- `path` 不以 `/` 開頭。
- 若有 `VITE_ASSET_CDN_BASE`，優先使用 CDN。
- 否則使用 `VITE_BASE_PATH`。
- 避免部署到子路徑時貼圖 404。

---

## B8. 效能預算

### B8.1 目標裝置

| 裝置類型 | 目標 |
|---|---|
| Desktop modern browser | 60 FPS |
| Mid-range laptop | 45 - 60 FPS |
| High-end mobile | 30 - 60 FPS |
| Mid-range mobile | 30 FPS |
| Low-end mobile | 啟用降級模式，維持可操作 |

---

### B8.2 Draw Calls 預算

| 模式 | Draw Calls 目標 |
|---|---:|
| Desktop High | ≤ 120 |
| Desktop Medium | ≤ 80 |
| Mobile Low | ≤ 50 |

控制策略：

- 行星本體每顆 1 draw call。
- 地球雲層額外 1 draw call。
- 土星環 1 draw call。
- 軌道線合併或控制數量。
- 小行星帶使用 `Points` 或 `InstancedMesh`，避免每顆獨立 mesh。
- Label 使用 DOM overlay，不納入 WebGL draw call。

---

### B8.3 Geometry 預算

| 物件 | High | Medium | Low |
|---|---:|---:|---:|
| 太陽 sphere segments | 96 | 64 | 32 |
| 主要行星 sphere segments | 64 | 48 | 32 |
| 小型行星 sphere segments | 48 | 32 | 24 |
| 月球 segments | 48 | 32 | 24 |
| 土星環 segments | 128 | 96 | 64 |
| 軌道線 segments | 256 | 160 | 96 |

---

### B8.4 貼圖記憶體預算

壓縮後 runtime texture 預算：

| 模式 | 貼圖總量目標 |
|---|---:|
| Desktop High | ≤ 80 MB |
| Desktop Medium | ≤ 45 MB |
| Mobile Low | ≤ 25 MB |

原則：

- 優先 `.ktx2`。
- mobile 使用 512 / 1024 貼圖。
- 不同 quality preset 載入不同解析度。
- 不同品質切換時需 dispose 舊 texture。

---

### B8.5 後處理預算

| 模式 | Bloom | Pixel Ratio |
|---|---|---:|
| High | 開啟 selective bloom | ≤ 2.0 |
| Medium | 開啟 selective bloom，降低 pass resolution | ≤ 1.5 |
| Low | 關閉 bloom 或降低強度 | ≤ 1.0 |

Mobile 預設：

- 若偵測到低階裝置，關閉 bloom。
- 若 FPS 連續低於 25，提示使用者切換「效能模式」。
- 不自動大幅降低到破壞畫面，但可降低 pixel ratio 與小行星數量。

---

### B8.6 行動裝置降級策略

偵測條件：

- `navigator.hardwareConcurrency <= 4`
- `devicePixelRatio > 2`
- viewport width `< 768`
- 初始 5 秒平均 FPS `< 30`

降級項目：

1. `renderQuality = 'low'`
2. `maxPixelRatio = 1`
3. 關閉 bloom
4. 小行星數量降低
5. 軌道線 segments 降低
6. 星背景解析度降低
7. 降低 sphere segments
8. 關閉 debug/performance HUD

不得降級：

- 天體範圍不得減少。
- 不可移除 8 行星、月球、土星環。
- 不可移除教育壓縮 / 接近真實 AU 模式切換。

---

### B8.7 Runtime 監控

可選擇加入內建 performance tracker，不依賴外部套件：

```ts
interface PerformanceSample {
  fps: number;
  frameMs: number;
  drawCalls: number;
  triangles: number;
  textureCount: number;
}

interface PerformanceTracker {
  beginFrame(): void;
  endFrame(renderer: THREE.WebGLRenderer): PerformanceSample;
  getAverageFps(seconds: number): number;
}
```

HUD 顯示繁體中文：

```txt
FPS：58
Draw Calls：72
三角形數：184k
品質：中
模式：教育壓縮
```

Performance HUD 預設僅在 development 或 `VITE_ENABLE_PERFORMANCE_HUD=true` 時顯示。

---

### B8.8 驗收標準

本段工程架構完成後，實作階段需滿足：

1. `npm run typecheck` 通過。
2. `npm run build` 通過。
3. Vercel preview 可正常載入。
4. 首頁無 404 texture。
5. Desktop medium 預設可達 45 FPS 以上。
6. Mobile low 可維持 30 FPS 左右。
7. 所有素材可於 `asset-manifest.json` 追溯來源。
8. Bloom 僅影響太陽與指定 glow 物件。
9. UI 顯示以繁體中文為主。
10. 可切換：
    - 教育壓縮模式
    - 接近真實 AU 模式
    - 時間播放 / 暫停 / 倍速
    - 行星 focus
    - 品質模式

---

### 完成摘要

- 已產出 Master Spec 第 B 段：工程架構／技術棧／資產管線。
- 內容涵蓋 B1 至 B8：技術棧、目錄結構、Scene Graph、渲染管線、資產授權與格式、狀態與時間 API、Vercel 部署、效能預算。
- 未建立或修改任何檔案。
- 未遇到阻礙。