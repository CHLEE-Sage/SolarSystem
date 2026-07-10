# 商業級 Three.js 太陽系模擬器 — Master Spec

> **狀態：** 可開工規格（合併完成；Verifier 見 loop log）  
> **日期：** 2026-07-09 22:14  
> **工作區：** `/mnt/c/GdriveM/Hermesworkspace/threejs-solar-system/`  
> **原始片段：** `docs/raw/A-product.md` · `B-engineering.md` · `C-quality.md`

本文件是實作唯一權威規格。實作時以本文件為準；若與對話草稿衝突，以本文件為準。

## 0. 文件控制與跨段一致性

| 項目 | 值 |
|---|---|
| 文件版本 | v1.2（合併 + 純展示 + planets.json 統一 + Verifier） |
| 產生方式 | Loop Prompt Architect：Agent A/B/C 並行 → 父 agent 合併 → Verifier |
| 語言 | 繁體中文 |
| 產品路線 | **純展示模擬器（Showcase / Portfolio）** |
| 不走路線 | 課綱／先備學習路徑產品（含 Marble os-taxonomy） |

### 0.1 6 參數（鎖定）

| # | 參數 | 選擇 |
|---|---|---|
| 1 | 用途 | 作品集 + 商業展示級 demo（可嵌入官網） |
| 2 | 真實度 | 教育壓縮預設 + 可切換接近真實 AU |
| 3 | 範圍 | 太陽 + 8 行星 + 月球 + 土星環 + 簡化小行星帶；矮行星 = Pro |
| 4 | 框架 | Vite + TypeScript + three.js（**非** R3F） |
| 5 | UI 語言 | 繁體中文為主，關鍵參數英數並存 |
| 6 | 部署 | 本機 dev + 靜態 build → Vercel |

### 0.2 跨段名詞統一（A/B/C 合併裁定）

| 概念 | 統一名稱 | 說明 |
|---|---|---|
| 天體主資料 | `public/assets/data/planets.json` | A 段契約名；B 段歷史稿曾用 `bodies.json`，現已統一為 **planets.json** |
| 尺度預設 | `public/assets/data/scale-presets.json` | 教育壓縮 / 接近真實 AU |
| 資產清單 | `public/assets/data/asset-manifest.json` | 貼圖路徑、解析度、授權 key |
| 授權追溯 | `public/assets/legal/asset-attribution.md` | 每張貼圖來源與授權 |

### 0.3 產品決策：純展示（使用者確認）

- **維持純展示模擬器**：核心是 3D 視覺、互動、尺度、效能、作品集完成感。
- **排除教育課綱圖譜產品化**：不整合 Marble os-taxonomy 作為核心依賴。
- 若未來要教育內容，僅能以 **Pro 可選、非 core import** 另立規格；**不得**拖慢 M0–M3。

### 0.4 章節地圖

| 段 | 來源 | 章節 |
|---|---|---|
| A | Product agent | A1–A7 |
| B | Engineering agent | B1–B8 |
| C | Quality agent | C1–C8 |

---

# Part A — 產品／內容

## A1. 產品定位與成功畫面

### 產品定位

本專案定位為一個 **商業展示級 Three.js 太陽系模擬器**，目標是同時滿足以下兩種用途：

1. **作品集展示**
   - 展示開發者對 Three.js、TypeScript、資料驅動視覺化、互動 UI、效能最佳化與前端部署流程的掌握。
   - 成品應能作為履歷、個人網站、技術簡報或客戶提案中的代表作品。

2. **商業官網可嵌入 demo**
   - 可嵌入品牌官網、教育科技網站、互動展示頁或提案 landing page。
   - 需具備穩定載入、清楚導覽、視覺吸引力與基本可維護性，不能只是一次性玩具 demo。

### 鎖定產品假設

- **假設 A1-1：** 使用者不一定懂天文，但能理解「太陽、行星、軌道、距離、時間倍率」等基本概念。
- **假設 A1-2：** 第一版重點是「可展示、可互動、可解釋」，不是做完整天文研究工具。
- **假設 A1-3：** 預設畫面必須好看且易懂，因此採用「教育壓縮尺度」作為預設，而非直接使用真實 AU 比例。
- **假設 A1-4：** 專案需可在一般筆電與桌機瀏覽器上流暢展示，不以高階 GPU 為必要條件。

### 成功畫面

使用者首次進入頁面後，應在 3 秒內看到：

- 中央有發光太陽。
- 8 大行星沿各自軌道運行。
- 地球旁有月球繞行。
- 土星具有可辨識的土星環。
- 火星與木星之間有簡化小行星帶。
- 右側或左側有繁體中文 HUD / 控制面板。
- 畫面上能清楚看出這是一個互動式太陽系，而不是單純背景動畫。

### 可驗收標準

| 項目 | 驗收標準 |
|---|---|
| 初始畫面 | 使用者進入後不需操作，即可看到完整太陽系展示畫面 |
| 商業展示感 | 畫面需具備光照、軌道、行星材質或色彩差異、平滑相機運動 |
| 互動性 | 使用者可點選或切換行星資訊 |
| 教育性 | HUD 可顯示目前模式、時間倍率、尺度模式與選取天體資訊 |
| 嵌入性 | 可透過靜態 build 部署至 Vercel，並可放入官網頁面中展示 |
| 非玩具感 | 不能只有旋轉球體；至少要有資料驅動的行星資訊、軌道、時間控制與展示模式 |

---

## A2. 6 參數決策表（參數／選擇／理由／不做什麼）

| 參數 | 鎖定選擇 | 理由 | 不做什麼 |
|---|---|---|---|
| 用途 | 作品集 + 商業展示級 demo，可嵌入官網 | 需要兼顧視覺完成度、技術展示價值與可部署性。成品應能直接放在個人作品集或商業提案中展示。 | 不做純教學範例、不做臨時 prototype、不做只能在本機跑的玩具 demo。 |
| 真實度 | 預設為教育壓縮尺度，並可切換接近真實 AU 模式 | 真實太陽系尺度在螢幕上不易觀看；教育壓縮模式可讓使用者立即理解行星排列與相對關係。接近真實 AU 模式提供進階展示與可信度。 | 不預設使用完全真實比例；不追求 NASA 級軌道精度；不做完整天體力學模擬。 |
| 範圍 | 太陽 + 8 行星 + 月球 + 土星環 + 簡化小行星帶；矮行星列為 Pro 擴充 | MVP 範圍足以形成完整太陽系印象，且能控制製作複雜度。月球、土星環與小行星帶可提升辨識度與展示感。 | MVP 不加入冥王星、穀神星、鬩神星等矮行星；不加入所有衛星；不加入彗星與航行器。 |
| 框架 | Vite + TypeScript + three.js，非 R3F | Vite 適合快速開發與靜態部署；TypeScript 提升資料契約可靠性；原生 three.js 更能展示底層 3D 控制能力。 | 不使用 React Three Fiber；不依賴大型遊戲引擎；不把主要邏輯綁死在 UI framework。 |
| UI 語言 | 繁體中文為主，關鍵參數英數並存 | 主要面向繁中使用者與商業展示場景；AU、km、day、year、FPS 等技術或科學參數保留英數可提高辨識度。 | 不做全英文 UI；不做多語系系統作為 MVP；不把所有科學單位翻譯到失真。 |
| 部署 | 本機 dev + 靜態 build 可上 Vercel | 靜態網站最適合 demo、作品集與官網嵌入；Vercel 提供低摩擦部署與分享 URL。 | 不做後端服務依賴；不做帳號系統；不要求伺服器渲染；不使用需要長駐 server 的架構。 |

---

## A3. 功能範圍：MVP vs Pro 對照表

| 功能領域 | MVP 必須包含 | Pro 擴充 |
|---|---|---|
| 天體範圍 | 太陽、8 大行星、月球、土星環、簡化小行星帶 | 矮行星、更多衛星、彗星、探測器、人造衛星 |
| 行星資料 | 名稱、英文名、半徑、距離、軌道週期、自轉週期、簡介、顏色或材質 key | 更完整物理資料，例如質量、重力、溫度、大氣組成、發現史 |
| 尺度模式 | 教育壓縮模式、接近真實 AU 模式 | 自訂尺度 slider、半徑與距離分離調整、科學展示 preset |
| 時間系統 | 暫停 / 播放、時間倍率、重置時間 | 指定日期、歷史天象、軌道回放、時間軸 scrubber |
| 視覺表現 | 發光太陽、行星球體、軌道線、基本星空背景、土星環、小行星帶 | 高解析貼圖、程序式星雲、後處理 bloom、鏡頭景深、HDR 環境光 |
| 互動 | 點選行星、聚焦行星、顯示資訊面板、切換尺度模式 | 搜尋天體、比較兩顆行星、導覽教學、故事模式 |
| 展示模式 | 自動巡航鏡頭，可依序展示主要天體 | 可編輯展示腳本、簡報模式、錄影輸出 |
| HUD | 繁中資訊、目前天體、尺度模式、時間倍率、FPS 或效能提示 | 多語系、可自訂 UI layout、無障礙高對比模式 |
| 效能 | 桌機瀏覽器穩定運行，避免過量粒子與高解析資源 | 裝置分級渲染、LOD、多品質 preset |
| 部署 | Vite dev、本機 build、Vercel 靜態部署 | 官網 iframe 嵌入包、白標品牌設定、CMS 資料接入 |

### MVP 完成定義

MVP 不只是「能跑」，而是必須達到以下條件：

- 開啟頁面即可看見完整太陽系。
- 8 大行星都有獨立軌道與資料。
- 地球與月球關係可被辨識。
- 土星環可被辨識。
- 小行星帶存在且不嚴重影響效能。
- 使用者可切換教育壓縮尺度與接近真實 AU 模式。
- 使用者可控制時間播放、暫停與倍率。
- 可執行 production build 並部署至 Vercel。

---

## A4. 使用者旅程（首次進入、探索行星、展示模式）

### 旅程 1：首次進入

#### 目標

讓使用者在不閱讀說明的情況下，立即理解這是可互動的太陽系展示。

#### 流程

1. 使用者打開頁面。
2. 載入畫面顯示品牌標題與簡短提示，例如「正在載入太陽系模型」。
3. 進入主畫面後，相機以斜上方角度觀看太陽系。
4. HUD 顯示目前狀態：
   - 尺度模式：教育壓縮
   - 時間倍率：例如 `10 days / sec`
   - 目前選取：未選取
5. 畫面提示使用者：
   - 點選行星查看資訊
   - 滾輪縮放
   - 拖曳旋轉視角
6. 行星開始沿軌道運行。

#### 可驗收標準

- 使用者不操作也能看見太陽、行星、軌道與動態。
- 初始視角不能太近或太遠。
- HUD 不遮擋主要天體。
- 若資源尚未載入完成，需有明確 loading 狀態。

---

### 旅程 2：探索行星

#### 目標

讓使用者能針對單一行星取得資訊，並透過相機聚焦形成展示感。

#### 流程

1. 使用者點選任一行星，例如地球。
2. 相機平滑移動至適合觀察該行星的位置。
3. HUD 顯示該行星資訊：
   - 名稱：地球
   - 英文名：Earth
   - 平均距離：1 AU
   - 半徑：6,371 km
   - 軌道週期：365.25 days
   - 自轉週期：23.93 hours
   - 簡介：一段繁體中文說明
4. 若選取地球，月球仍可見並繞行。
5. 使用者可切換至其他行星或返回全景。
6. 使用者可切換尺度模式，觀察教育壓縮與接近真實 AU 的差異。

#### 可驗收標準

- 點選行星後資訊必須與資料契約一致。
- 相機移動需平滑，不能瞬間跳切造成迷失。
- 被選取天體需有視覺提示，例如外框、光暈或標籤。
- 返回全景功能必須存在。

---

### 旅程 3：展示模式

#### 目標

提供可用於作品集、簡報、官網 hero section 的自動展示流程。

#### 流程

1. 使用者點擊「展示模式」。
2. 系統隱藏或簡化部分控制 UI，保留必要 HUD。
3. 相機自動巡航：
   - 從太陽開始
   - 展示內行星
   - 展示地球與月球
   - 展示小行星帶
   - 展示木星與土星環
   - 最後回到太陽系全景
4. 每個停留段落顯示簡短繁中說明。
5. 使用者可隨時退出展示模式。

#### 可驗收標準

- 展示模式需可無人操作完整播放。
- 鏡頭移動不能穿過行星或過度抖動。
- 展示文案需短、清楚、適合商業展示。
- 使用者按下 Esc 或「退出展示」後可恢復一般探索模式。

---

## A5. 內容與資料契約（planets.json 欄位、尺度策略、時間系統）

### 資料來源與資料契約原則

本專案採用資料驅動方式管理天體內容。行星與主要天體資料應集中於 `planets.json` 或等價資料檔中，由渲染層讀取後生成場景物件。

### 鎖定假設

- **假設 A5-1：** MVP 階段資料以靜態 JSON 維護，不接遠端 API。
- **假設 A5-2：** 數值允許為展示用途做尺度轉換，但原始參考值需保留。
- **假設 A5-3：** `planets.json` 不負責儲存 runtime 狀態，例如目前選取天體、相機位置或使用者操作狀態。
- **假設 A5-4：** 天文資料以「足夠教育展示」為標準，不承諾研究級精度。

### planets.json 建議欄位

| 欄位 | 型別 | 必填 | 說明 |
|---|---:|---:|---|
| `id` | string | 是 | 系統內部識別，例如 `earth`、`mars` |
| `nameZh` | string | 是 | 繁體中文名稱，例如 `地球` |
| `nameEn` | string | 是 | 英文名稱，例如 `Earth` |
| `type` | string | 是 | 天體類型，例如 `star`、`planet`、`moon`、`belt` |
| `parentId` | string 或 null | 是 | 繞行中心，例如行星繞 `sun`，月球繞 `earth` |
| `radiusKm` | number | 是 | 真實半徑，單位 km |
| `displayRadius` | number | 是 | 教育壓縮模式下的顯示半徑 |
| `semiMajorAxisAU` | number | 條件必填 | 與父天體平均距離，單位 AU；太陽可為 0 |
| `displayDistance` | number | 是 | 教育壓縮模式下的顯示距離 |
| `orbitalPeriodDays` | number | 條件必填 | 公轉週期，單位 Earth days |
| `rotationPeriodHours` | number | 條件必填 | 自轉週期，單位 hours |
| `axialTiltDeg` | number | 否 | 自轉軸傾角，單位 degree |
| `inclinationDeg` | number | 否 | 軌道傾角，MVP 可先簡化為 0 |
| `eccentricity` | number | 否 | 軌道離心率，MVP 可先不使用或僅保留資料 |
| `color` | string | 是 | fallback 顏色，例如 `#4f8cff` |
| `textureKey` | string 或 null | 否 | 對應材質資源 key |
| `hasRings` | boolean | 否 | 是否有環，MVP 主要用於土星 |
| `ring` | object 或 null | 否 | 土星環資料，例如內外半徑、顏色、透明度 |
| `descriptionZh` | string | 是 | HUD 使用的繁中簡介 |
| `order` | number | 是 | 顯示排序，例如水星為 1、海王星為 8 |
| `isMvp` | boolean | 是 | 是否屬於 MVP 範圍 |
| `proOnly` | boolean | 是 | 是否僅為 Pro 擴充 |

### 尺度策略

本專案需支援兩種尺度模式：

#### 1. 教育壓縮模式

預設模式。目的在於讓太陽、8 大行星與軌道能在單一畫面中被理解。

特性：

- 行星距離經過壓縮。
- 行星半徑經過放大或非線性縮放。
- 月球距離需保留在地球附近可視範圍。
- 小行星帶以視覺帶狀分布呈現，不要求每顆小行星具備真實軌道。
- 適合初始畫面、展示模式與一般使用者探索。

可驗收標準：

- 在全景視角下，使用者能同時辨識太陽與 8 大行星的大致排列。
- 內行星不應全部擠在太陽旁難以點選。
- 外行星不應遠到無法在合理縮放範圍內看到。

#### 2. 接近真實 AU 模式

進階模式。目的在於展示真實距離比例概念。

特性：

- 行星距離依 `semiMajorAxisAU` 轉換。
- 行星半徑仍可使用可視化放大，不必與距離使用同一比例。
- HUD 必須明確標示目前為「接近真實 AU」。
- 相機需提供快速聚焦與返回全景，避免使用者迷失在巨大空間中。

可驗收標準：

- 切換後行星距離明顯拉開。
- HUD 顯示 AU 距離。
- 使用者仍可透過選單或行星列表快速跳轉至任一行星。
- 不要求在同一畫面中同時清楚看見所有行星。

### 時間系統

時間系統需將真實天文週期轉換為可展示動畫。

#### 必要狀態

| 狀態 | 說明 |
|---|---|
| `isPlaying` | 是否播放時間 |
| `timeScale` | 時間倍率，例如 `1 day/sec`、`10 days/sec` |
| `elapsedSimDays` | 模擬已經過的天數 |
| `selectedBodyId` | 目前選取天體 |
| `scaleMode` | `educational` 或 `realisticAU` |

#### MVP 時間控制

- 播放
- 暫停
- 重設
- 調整時間倍率
- 顯示目前倍率

#### 公轉計算原則

- 以 `orbitalPeriodDays` 計算行星沿軌道的位置。
- MVP 可使用圓形軌道。
- 軌道傾角與離心率可先保留資料但不強制渲染。
- 小行星帶可使用多個隨機分布粒子或簡化物件群，依不同速度緩慢旋轉。

#### 自轉計算原則

- 以 `rotationPeriodHours` 控制天體自轉。
- 若某些天體自轉週期造成視覺過快或過慢，可設定顯示用倍率，但需在資料或邏輯中保持可追蹤。

---

## A6. 文案／品牌語氣（繁中 HUD 要有哪些字串）

### 品牌語氣

整體語氣應為：

- 專業
- 清楚
- 沉浸
- 教育友善
- 避免幼稚化
- 避免過度科幻口吻

文案要像商業展示產品，而不是兒童遊戲或純技術 demo。

### 標題與主文案

建議主標：

- `互動式太陽系模擬器`
- `Solar System Interactive Demo`
- `以 Three.js 打造的即時 3D 太陽系展示`

建議副標：

- `探索行星軌道、尺度差異與時間流動`
- `從教育壓縮尺度到接近真實 AU，一鍵切換觀看太陽系`

### HUD 必要字串

#### 狀態資訊

| UI 字串 | 用途 |
|---|---|
| `尺度模式` | 顯示目前尺度模式 |
| `教育壓縮` | 預設尺度模式 |
| `接近真實 AU` | 進階尺度模式 |
| `時間倍率` | 顯示目前模擬速度 |
| `模擬天數` | 顯示 elapsed simulation days |
| `目前選取` | 顯示選取中的天體 |
| `未選取天體` | 尚未選取時顯示 |
| `效能` | 可搭配 FPS 或品質提示 |
| `載入中` | 資源載入狀態 |

#### 控制按鈕

| UI 字串 | 用途 |
|---|---|
| `播放` | 啟動時間 |
| `暫停` | 暫停時間 |
| `重設時間` | 回到初始模擬時間 |
| `返回全景` | 相機回到全太陽系視角 |
| `聚焦天體` | 對選取天體進行相機聚焦 |
| `展示模式` | 啟動自動展示 |
| `退出展示` | 離開展示模式 |
| `切換尺度` | 切換教育壓縮 / 接近真實 AU |
| `顯示軌道` | 顯示或隱藏軌道線 |
| `顯示標籤` | 顯示或隱藏天體名稱 |

#### 操作提示

| UI 字串 | 用途 |
|---|---|
| `拖曳旋轉視角` | 滑鼠或觸控操作提示 |
| `滾輪縮放` | 縮放提示 |
| `點選行星查看資料` | 探索提示 |
| `按 Esc 退出展示模式` | 展示模式提示 |
| `選擇一顆行星開始探索` | 初始引導 |

#### 行星資訊欄位

| UI 字串 | 顯示內容 |
|---|---|
| `中文名稱` | 例如 `地球` |
| `英文名稱` | 例如 `Earth` |
| `平均距離` | 例如 `1 AU` |
| `半徑` | 例如 `6,371 km` |
| `公轉週期` | 例如 `365.25 days` |
| `自轉週期` | 例如 `23.93 hours` |
| `天體類型` | 例如 `行星`、`恆星`、`衛星` |
| `簡介` | 繁中描述 |

### 單位顯示規則

- AU 保留英文大寫：`AU`
- 公里使用：`km`
- 天使用：`days`
- 小時使用：`hours`
- FPS 保留英文大寫：`FPS`
- 時間倍率可使用混合格式：`10 days / sec`
- 中文標籤搭配英數單位，例如：`平均距離：1 AU`

### 文案風格範例

#### 好的文案

- `目前為教育壓縮尺度，行星距離已調整以利觀察。`
- `切換至接近真實 AU 後，行星間距將大幅拉開。`
- `土星環由冰粒與岩石碎片組成，是太陽系最具辨識度的結構之一。`

#### 不採用的文案

- `哇！來太空冒險吧！`
- `這是一個超酷炫的宇宙玩具。`
- `保證完全符合真實天文模擬。`

---

## A7. 明確排除範圍（Out of scope）

以下項目不屬於 MVP 範圍，除非進入 Pro 階段或另行立項。

### 天文模擬排除

- 不做完整 N-body 重力模擬。
- 不做 NASA / JPL 等級星曆精度。
- 不計算真實日期下的精確行星位置。
- 不模擬潮汐、歲差、章動、攝動等高階天文現象。
- 不模擬行星大氣流體、雲層動態或真實氣候。
- 不加入所有衛星。
- 不將矮行星納入 MVP；矮行星列為 Pro 擴充。
- 不加入彗星、航行器、人造衛星作為 MVP 必要項目。

### 視覺與互動排除

- 不要求 VR / AR 支援。
- 不要求 WebXR。
- 不做多人同步觀看。
- 不做遊戲化任務、分數、成就系統。
- 不做完整劇情模式。
- 不做高度擬真的星雲或銀河系模擬。
- 不要求所有行星使用 8K 貼圖。
- 不以電影級後製為 MVP 目標。

### 技術架構排除

- 不使用 React Three Fiber。
- 不引入後端服務作為必要依賴。
- 不做登入、帳號、會員或收藏功能。
- 不做資料庫。
- 不做 CMS 管理後台。
- 不做伺服器端渲染作為必要條件。
- 不做 native app。
- 不做 Electron 桌面版。


### 教育／課綱產品排除（純展示決策）

- 不整合課程 taxonomy / prerequisite graph（含 Marble `os-taxonomy`）。
- 不做「先備微主題 → 行星現象」學習路徑 UI。
- 不做課綱對齊、掌握證據、評量提示等教育產品功能。
- 不因教育資料授權（ODbL share-alike 等）改變核心引擎架構。
- Info panel 僅展示天體參數與簡介，**不**綁定課綱 ID。

### 內容與商業排除

- 不承諾科學研究用途。
- 不宣稱所有比例完全真實。
- 不提供正式教材認證內容。
- 不內建付費牆。
- 不做白標多客戶管理系統。
- 不在 MVP 中提供多語系完整翻譯；繁體中文為主，關鍵參數英數並存。

---

# Part B — 工程架構

## B0. 工程總覽

本段定義商業級 Three.js 太陽系模擬器的工程基準。專案目標為「作品集 + 商業展示」，預設採教育壓縮尺度，並提供切換至接近真實 AU 比例的模式。範圍固定為：太陽、8 行星、月球、土星環、簡化小行星帶。技術框架固定為 Vite + TypeScript + three.js，非 React Three Fiber。UI 以繁體中文為主，最終部署為 Vite static 至 Vercel。

---


> **合併註記：** 資料檔統一為 **`planets.json`**（見 §0.2）。

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
│  │  │  ├─ planets.json
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
- 根據 `public/assets/data/planets.json` 建立天體。
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
2. 貼圖路徑由 `public/assets/data/planets.json` 或 asset manifest 提供。
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

`public/assets/data/planets.json` 概念：

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

# Part C — 品質／里程碑／風險

> **合併註記：** 產品路線為純展示模擬器。C 段「教育」指 **教育壓縮尺度展示**，不是課綱產品。

## C1. 商業級品質 Rubric（視覺／互動／工程／內容，可打分）

> 評分方式：每項 0–5 分，總分 100。  
> 商業展示最低門檻：總分 ≥ 85，且「視覺」、「互動」、「工程」三大類不得低於 80%。  
> Portfolio 可發布門檻：總分 ≥ 75，且不得有 Critical / High 缺陷。

### C1.1 視覺品質 Rubric（25 分）

| 項目 | 權重 | 5 分標準 | 3 分標準 | 0–1 分失敗模式 | 驗收方式 |
|---|---:|---|---|---|---|
| 太陽系整體美術一致性 | 5 | 太陽、8 行星、月球、土星環、小行星帶風格一致，具商業展示質感 | 個別物件可辨識但風格不一致 | 材質像測試方塊、缺貼圖、比例混亂 | 開啟首頁，截圖比對設計基準；人工評分 |
| Three.js 光照與材質 | 5 | 太陽可作為主要光源；行星有合理陰影、粗糙度、法線或貼圖層次 | 基本 Lambert/Phong 可看，但缺乏深度 | 全場過曝、全黑、無光影層次 | `npm run dev` 後以 browser 檢視；檢查不同視角 |
| 軌道與空間可讀性 | 5 | 教育預設下軌道清楚、行星不互相遮蔽；真實切換有說明與視覺輔助 | 軌道存在但縮放後難判讀 | 軌道線消失、行星重疊、使用者無法理解位置 | 切換教育／真實尺度，各拍一張截圖 |
| 動畫平滑度 | 5 | 桌機常態 ≥ 55 FPS；中階筆電 ≥ 45 FPS；無明顯卡頓 | 偶有掉幀但可互動 | 轉動卡死、動畫跳躍、頁面凍結 | Chrome Performance / FPS meter；手動拖曳視角 |
| 商業展示完成感 | 5 | 有開場視覺、載入狀態、清楚 UI、細節 polish，可放作品集 | 功能完整但像 demo | 破版、空白區、debug UI 外露 | 全頁 dogfood；截圖可直接放作品集 |

### C1.2 互動品質 Rubric（25 分）

| 項目 | 權重 | 5 分標準 | 3 分標準 | 0–1 分失敗模式 | 驗收方式 |
|---|---:|---|---|---|---|
| 相機控制 | 5 | OrbitControls 流暢；拖曳、滾輪縮放、重置視角皆可用 | 可拖曳但縮放範圍或阻尼不佳 | 滑鼠無反應、視角穿模、無法回復 | browser 實測拖曳、滾輪、重置 |
| 行星選取與資訊面板 | 5 | 點選 8 行星與月球可顯示繁中名稱、資料、目前尺度模式 | 只顯示部分資訊 | 點選無反應、資訊錯誤、英文殘留 | 逐一點選：水金地火木土天海 + 月球 |
| 尺度模式切換 | 5 | 教育預設與真實切換明確，UI 說明「真實比例不利觀察」 | 可切換但缺說明 | 切換後物件消失、位置錯亂、無法返回 | 點擊切換，驗證相機與標籤仍可用 |
| 時間速度控制 | 4 | 暫停、播放、倍率調整、重設時間可用且狀態可見 | 只有播放／暫停 | 速度控制造成軌道錯亂或 NaN | 操作 0x / 1x / 快速倍率，觀察軌道連續性 |
| UI 可理解性 | 3 | 繁中標籤清楚，商業展示無技術噪音 | 可用但文案不精準 | 按鈕意義不明、英文 placeholder、debug 文字 | 人工 QA：首次使用者 1 分鐘內可理解 |
| 錯誤與空狀態 | 3 | 貼圖載入失敗有 fallback；低效能模式有提示 | 只有 console error | 黑畫面、無提示、無法操作 | 模擬貼圖失敗或節流網路後檢查 |

### C1.3 工程品質 Rubric（30 分）

| 項目 | 權重 | 5 分標準 | 3 分標準 | 0–1 分失敗模式 | 驗收方式 |
|---|---:|---|---|---|---|
| Vite + TypeScript 架構 | 5 | 模組切分清楚：scene、objects、ui、data、systems；無 `any` 濫用 | 可編譯但結構鬆散 | 全寫在單檔、型別錯誤被忽略 | `npm run typecheck` |
| Three.js 資源生命週期 | 5 | geometry/material/texture 可釋放；重建場景不洩漏 | 大多可運作但未明確 dispose | 切換頁面或模式記憶體持續升高 | Performance memory snapshot |
| 效能與 bundle 控制 | 5 | 首屏資源合理；貼圖壓縮；支援 lazy load；Vercel 靜態部署正常 | 可載入但初始過重 | 首屏 > 10s、手機直接崩潰 | `npm run build` + Lighthouse |
| 測試覆蓋 | 5 | 單元測試涵蓋資料轉換、尺度切換、時間系統；E2E 覆蓋核心互動 | 只有少量 smoke test | 無測試、只能靠手動 | `npm run test`、`npm run test:e2e` |
| Console 潔淨度 | 4 | 正常操作無 error；warning 有追蹤或註解 | 有非阻塞 warning | JS error、WebGL error、資源 404 | browser console 檢查 |
| CI / 部署可靠性 | 3 | build、typecheck、test、preview 全通過；Vercel 可重現 | 本機可跑但 CI 不穩 | Vercel build fail | `npm run build && npm run preview` |
| 可維護性 | 3 | 資料與渲染分離；行星資料可擴充；命名一致 | 邏輯可讀但耦合偏高 | 修改一顆行星需改多處硬編碼 | code review checklist |

### C1.4 內容品質 Rubric（20 分）

| 項目 | 權重 | 5 分標準 | 3 分標準 | 0–1 分失敗模式 | 驗收方式 |
|---|---:|---|---|---|---|
| 天文資料正確性 | 5 | 8 行星、月球、土星環、小行星帶資料來源明確；數值單位一致 | 資料大致正確但來源不完整 | 行星順序錯、數值錯、冥王星誤列為 9 大行星 | 資料表 code review |
| 教育預設合理性 | 5 | 明確說明「非真實比例」；兼顧觀察與學習 | 有縮放但未說明 | 使用者誤以為教育模式是真實比例 | UI 文案檢查 |
| 真實切換誠實性 | 4 | 真實尺度／距離限制清楚揭露；必要時用 log scale 或輔助線 | 可切換但語意模糊 | 號稱真實但實際仍任意縮放且無說明 | 切換模式驗收 |
| 繁中 UI 品質 | 3 | 使用台灣常見術語；無簡中、機翻、英文殘留 | 少量英文技術詞 | UI 中英混雜或簡體字 | 全站文字掃描 |
| 商業展示敘事 | 3 | 有作品介紹、操作提示、技術亮點；適合客戶展示 | 只有功能沒有敘事 | 使用者不知道這是什麼作品 | 首屏與 about 區檢查 |

---

## C2. 里程碑 M0–M5（目標、交付物、驗收指令）

### M0 — 專案骨架與品質閘門

**目標**  
建立 Vite + TypeScript + three 專案基礎，確保後續每次提交都有可驗收品質門檻。

**交付物**

- Vite + TS 專案初始化。
- Three.js 基礎場景可啟動。
- ESLint / Prettier / TypeScript typecheck。
- 測試框架與基本 smoke test。
- README 含本機啟動、建置、部署說明。
- Vercel 靜態部署設定。

**驗收指令**

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
```

**通過標準**

- `npm run build` 成功。
- browser 開啟 preview 後非空白頁。
- console 無 `Uncaught Error`、資源 404、WebGL 初始化失敗。
- README 指令可照抄執行。

**失敗模式**

- TypeScript 有錯但被 `skipLibCheck` 或 `any` 掩蓋。
- Vercel build 與本機 build 結果不同。
- 首頁空白但終端機無明確錯誤。
- Three.js canvas 存在但未 resize，畫面比例錯誤。

---

### M1 — 基礎太陽系場景

**目標**  
完成可辨識的太陽、8 行星、月球、土星環、小行星帶基礎渲染。

**交付物**

- 太陽、8 行星、月球、土星環、小行星帶物件。
- 教育預設尺度。
- 軌道線。
- 基礎材質與貼圖 fallback。
- 場景資料以 typed data config 管理，不硬編碼散落。

**驗收指令**

```bash
npm run test
npm run build
npm run preview
```

browser 檢查：

1. 開啟 preview URL。
2. 確認畫面可見太陽、8 行星、月球、土星環、小行星帶。
3. 旋轉相機 360 度。
4. 檢查 console。

**通過標準**

- 每個天體可視且位置順序正確。
- 月球與地球關係可辨識。
- 土星環附著於土星，非獨立飄移。
- 小行星帶位於火星與木星之間。
- 無 console error。

**失敗模式**

- 小行星帶造成 FPS 明顯下降。
- 月球比例過大或離地球過遠，失去教育意義。
- 貼圖未載入時整個物件變黑或透明。
- 天體順序錯誤。

---

### M2 — 互動控制與資訊 UI

**目標**  
完成繁中 UI、相機操作、行星選取、資訊面板與時間控制。

**交付物**

- OrbitControls。
- 點選天體顯示資訊面板。
- 繁中 UI 文案。
- 播放／暫停／速度倍率／重設。
- 目前選取目標高亮。
- 操作提示或 onboarding。

**驗收指令**

```bash
npm run test
npm run test:e2e
npm run build
```

browser 檢查：

1. 逐一點選 8 行星與月球。
2. 拖曳旋轉、滾輪縮放、重設視角。
3. 測試播放、暫停、速度倍率。
4. 檢查 console。

**通過標準**

- 每個天體點選後資訊正確。
- UI 全文繁中，無簡中與未必要英文。
- 選取狀態可視。
- 時間控制不造成軌道跳動或 NaN。
- 鍵盤 Tab 可聚焦主要控制項。

**失敗模式**

- 點選命中區太小，使用者難以選到行星。
- 資訊面板遮住關鍵畫面且不可關閉。
- 速度切換後行星瞬移。
- 暫停後 UI 顯示暫停但動畫仍繼續。

---

### M3 — 教育預設／真實尺度切換

**目標**  
完成「教育預設 + 真實切換」雙模式，並清楚說明兩者差異。

**交付物**

- 尺度模式切換 UI。
- 教育預設尺度資料。
- 真實尺度／真實距離映射策略。
- 模式說明文案。
- 相機自動 framing 或快速定位。
- 尺度切換測試。

**驗收指令**

```bash
npm run test -- --run
npm run test:e2e
npm run build
```

browser 檢查：

1. 在教育預設模式確認全部天體可觀察。
2. 切換真實模式。
3. 確認 UI 顯示真實模式限制說明。
4. 切回教育預設。
5. 點選地球、木星、海王星確認仍可定位。

**通過標準**

- 模式切換不破壞互動。
- 真實模式不讓使用者誤解為任意比例。
- 教育模式明確標示「為了觀察而調整比例」。
- 切換後相機不迷失在空間中。
- 測試涵蓋尺度轉換函式。

**失敗模式**

- 真實模式下畫面幾乎空白且無導引。
- 切換後軌道與行星不同步。
- UI 文案暗示錯誤科學概念。
- 切換多次後物件重複生成或記憶體上升。

---

### M4 — 商業級 polish、效能與可及性

**目標**  
將作品從技術 demo 提升到可展示、可分享、可在不同裝置使用的商業級品質。

**交付物**

- Loading state。
- 低效能 fallback 或品質切換。
- Responsive UI。
- 可及性改善。
- Lighthouse 初步優化。
- Dogfood 報告與修復清單。
- 錯誤狀態與資源 fallback。

**驗收指令**

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run preview
```

browser / dogfood 檢查：

1. 桌機寬螢幕。
2. 筆電尺寸。
3. 手機 viewport。
4. 慢速網路。
5. WebGL 支援不足或低效能環境 fallback。
6. console error 檢查。
7. Lighthouse Performance / Accessibility / Best Practices。

**通過標準**

- 桌機常態 ≥ 55 FPS。
- 手機可開啟並操作核心功能。
- Lighthouse Accessibility ≥ 90。
- 正常流程 console 無 error。
- Dogfood 無 Critical / High 問題未處理。
- 首屏載入有明確狀態，不是長時間黑畫面。

**失敗模式**

- 手機 UI 控制項重疊。
- Canvas 吃掉頁面滾動或鍵盤操作。
- 高解析貼圖使載入過久。
- 低效能設備無提示直接卡死。
- Lighthouse Accessibility 因按鈕無 label 失敗。

---

### M5 — 發布、驗收與作品集包裝

**目標**  
完成 Vercel 靜態部署，產出可對外展示的作品集版本。

**交付物**

- Vercel production URL。
- README 完整。
- 授權與來源清單。
- 最終 QA 報告。
- 截圖或展示素材。
- Master Spec 對照驗收表。
- Release tag。

**驗收指令**

```bash
npm run clean || true
npm install
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run preview
```

部署後檢查：

1. 開啟 Vercel production URL。
2. Hard refresh。
3. 無登入、無後端依賴即可使用。
4. console 無 error。
5. 分享連結可在無開發環境的瀏覽器開啟。
6. 檢查授權頁或 README 來源清單。

**通過標準**

- Production 與本機 preview 行為一致。
- 所有 DoD 項目完成。
- 無未授權素材。
- 作品集說明可清楚描述技術亮點。
- Master Spec C1 Rubric 總分 ≥ 85。

**失敗模式**

- Vercel base path 或 asset path 錯誤。
- Production 才出現貼圖 404。
- README 缺少授權來源。
- Demo 需要本機 API 或私密環境變數。
- 最終 URL 在手機或 Safari 無法正常操作。

---

## C3. 測試與 QA 計畫（含 browser/console/dogfood 檢查點）

### C3.1 測試層級

| 層級 | 目的 | 必測項目 | 驗收指令 |
|---|---|---|---|
| Typecheck | 防止型別錯誤進入主線 | celestial data schema、scale mode、UI state | `npm run typecheck` |
| Unit Test | 驗證核心計算 | 軌道角度、時間倍率、教育／真實尺度轉換、資料格式 | `npm run test` |
| Component / UI Test | 驗證控制面板 | 按鈕狀態、資訊面板、繁中文案 | `npm run test` 或 `npm run test:ui` |
| E2E Test | 驗證使用者流程 | 載入、點選行星、切換尺度、時間控制 | `npm run test:e2e` |
| Build Test | 驗證靜態部署 | Vite build、asset path、Vercel 相容性 | `npm run build` |
| Manual Browser QA | 驗證視覺與互動 | 相機、FPS、console、responsive | browser / Playwright |
| Dogfood | 找商業展示缺陷 | 新手體驗、破版、錯誤狀態、內容誤導 | dogfood checklist |

### C3.2 Unit Test 必測案例

| 測試目標 | 必測案例 | 失敗模式 |
|---|---|---|
| 行星資料 schema | 8 行星皆有 id、繁中名稱、半徑、軌道半徑、週期、顏色／貼圖設定 | 缺欄位導致 runtime undefined |
| 行星順序 | 水星、金星、地球、火星、木星、土星、天王星、海王星 | 順序錯誤造成教育內容失真 |
| 月球關係 | 月球 parent 或 reference 指向地球 | 月球繞太陽或漂浮 |
| 土星環 | 土星具 ring config | 環錯掛到其他行星 |
| 小行星帶 | 位於火星與木星軌道之間 | 位置錯誤或與行星重疊 |
| 尺度切換 | education / realistic 可互相轉換且無 NaN | 切換後物件消失 |
| 時間倍率 | 0x 暫停、1x 正常、快速倍率連續 | 暫停仍更新、快速倍率跳格 |

### C3.3 Browser QA 檢查點

每次 M2 之後的里程碑都需執行：

1. `npm run dev` 或 `npm run preview`。
2. browser 開啟頁面。
3. 擷取 accessibility snapshot，確認主要按鈕具可讀名稱。
4. 檢查 console：
   - 初次載入後。
   - 點選行星後。
   - 切換尺度後。
   - 調整時間倍率後。
   - resize viewport 後。
5. 截圖保存：
   - 教育模式全景。
   - 真實模式全景或定位畫面。
   - 行星資訊面板。
   - 手機版 UI。
6. 操作檢查：
   - 拖曳旋轉。
   - 滾輪縮放。
   - 點選地球、土星、海王星。
   - 切換教育／真實模式。
   - 暫停與恢復。
   - 重設視角。

**Console 通過標準**

- 不得出現：
  - `Uncaught Error`
  - `TypeError`
  - `ReferenceError`
  - WebGL context lost 未處理
  - 貼圖或模型 404
  - React/Vue 類 hydration 錯誤（若未使用框架則不應出現）
- 允許但需記錄：
  - 已知 Three.js 非阻塞 warning。
  - 受瀏覽器限制的 autoplay / performance warning。

### C3.4 Dogfood 檢查點

Dogfood 需以「第一次接觸作品的客戶／面試官」角度執行。

| 檢查點 | 驗收問題 | 失敗模式 |
|---|---|---|
| 首屏理解 | 10 秒內是否知道這是太陽系模擬器？ | 只有黑畫面或無標題 |
| 操作引導 | 30 秒內是否知道可拖曳、點選、切換尺度？ | 沒有提示，只能猜 |
| 商業展示 | 截圖是否能直接放作品集？ | debug panel、測試文字、破版 |
| 內容可信 | 是否知道教育模式與真實模式差異？ | 誤導比例真實性 |
| 錯誤韌性 | 貼圖慢載時是否有 loading / fallback？ | 空白或閃爍 |
| 裝置適應 | 手機是否能完成核心流程？ | 控制項太小、面板遮滿畫面 |
| 離線／靜態 | 是否無後端也能運作？ | 需要 API、環境變數或登入 |

### C3.5 QA 缺陷分級

| 等級 | 定義 | 範例 | 發布規則 |
|---|---|---|---|
| Critical | 核心功能不可用或頁面無法開啟 | Vercel production 黑畫面 | 必須修復 |
| High | 主要展示流程受阻 | 無法點選行星、尺度切換壞掉 | 必須修復 |
| Medium | 體驗明顯受損但有 workaround | 手機面板遮擋、FPS 偶發低 | M5 前修復或明確列入已知限制 |
| Low | 小瑕疵 | 文案微調、非核心 warning | 可排入後續 |
| Nit | 不影響體驗 | 命名、註解、格式 | 不阻擋發布 |

---

## C4. 風險表（風險／影響／緩解／早期 spike）

| 風險 | 影響 | 緩解策略 | 早期 Spike | 驗收方式 |
|---|---|---|---|---|
| 真實尺度導致天體不可見 | 使用者切換真實模式後看到空白，誤以為壞掉 | 真實模式加入導覽、尺度說明、快速定位、必要時使用 log scale | M3 前做 1 頁 prototype：太陽、地球、海王星三點切換 | 切換真實模式後 5 秒內可定位任一行星 |
| 小行星帶數量過多造成掉幀 | 商業展示卡頓，手機無法使用 | 使用 InstancedMesh、LOD、數量上限、品質模式 | M1 前測 500 / 2,000 / 10,000 顆小行星 FPS | 桌機 ≥55 FPS，中階筆電 ≥45 FPS |
| 高解析貼圖載入過慢 | 首屏黑畫面、Vercel 頻寬與使用體驗差 | 壓縮貼圖、lazy load、loading UI、低解析 fallback | 測試 1K / 2K / 4K 貼圖載入時間 | Fast 3G 下有 loading，非無限空白 |
| WebGL 相容性問題 | 某些瀏覽器或裝置開不起來 | WebGL capability detection、fallback message | 測試 Chrome、Edge、Safari、手機瀏覽器 | 不支援時顯示友善繁中提示 |
| 點選行星命中困難 | 使用者無法開資訊面板 | Raycaster 使用擴大命中球或 label hit area | M2 前測最小行星水星命中率 | 使用者 3 次內可點到水星 |
| UI 遮擋 3D 畫面 | 商業展示視覺被破壞 | 面板可收合、responsive layout、透明背景控制 | 手機與 1366px viewport mock | 核心控制不遮住選取目標 |
| 行星資料錯誤 | 教育可信度下降 | 建立資料來源清單與單元測試 | M1 前完成資料 schema 與來源欄位 | code review 可追溯每個數值來源 |
| TypeScript 架構失控 | 後期難維護、修 bug 成本高 | 資料、渲染、UI、控制分層；禁止巨型單檔 | M0 建立資料模型與 module boundary | 單檔不超過約 300 行，例外需說明 |
| Vercel 靜態部署路徑錯誤 | 本機正常、production 破圖 | 使用 Vite 正確 base / public asset 策略 | M0 即部署最小版本 | production URL 無 asset 404 |
| 商業 polish 時間不足 | 看起來像課堂 demo，不像作品集 | M4 明確排入 loading、動畫、文案、截圖驗收 | M2 後每週保存展示截圖對比 | C1 視覺分數 ≥20/25 |
| 無障礙被最後才處理 | 鍵盤不可用、Lighthouse 低分 | M2 起納入按鈕 label、focus、contrast | M2 做控制面板 keyboard spike | Lighthouse Accessibility ≥90 |
| Console warning 被忽略變成錯誤 | 發布後才發現資源或記憶體問題 | 每個 milestone 固定 console gate | M0 建立 browser console checklist | M5 正常流程 0 error |
| 記憶體洩漏 | 長時間展示後變卡或崩潰 | dispose geometry/material/texture；避免重複建立 scene | M3 切換尺度 50 次 memory spike | 記憶體不持續單調上升 |
| 繁中 UI 品質不足 | 商業展示不專業 | 建立文案表與術語表 | M2 前完成 UI copy review | 無簡中、無未必要英文殘留 |
| 授權不清 | 無法公開作品集或商業展示 | 所有貼圖、字體、資料來源進 LICENSE / ATTRIBUTIONS | M1 前確認素材授權 | M5 前授權 checklist 全勾選 |

---

## C5. 可及性與裝置支援

### C5.1 可及性最低標準

| 項目 | 標準 | 驗收方式 | 失敗模式 |
|---|---|---|---|
| 鍵盤操作 | 主要 UI 控制可用 Tab 聚焦與 Enter / Space 操作 | browser 按 Tab 走完整控制列 | 只能滑鼠操作 |
| Focus 樣式 | 聚焦中的按鈕、切換器、面板關閉鍵清楚可見 | 手動鍵盤巡覽 | focus ring 被 CSS 移除 |
| ARIA / Label | icon button 必須有 `aria-label` 或可讀文字 | accessibility snapshot | snapshot 出現 unnamed button |
| 色彩對比 | 文字與背景對比符合 WCAG AA | Lighthouse / axe | 淡灰字在深色背景不可讀 |
| 動畫控制 | 使用者可暫停公轉動畫；尊重 reduced motion | OS 啟用 reduced motion 後檢查 | 動畫不可停、造成暈眩 |
| 資訊非只靠顏色 | 選取狀態除顏色外需有面板、outline 或 label | 點選行星檢查 | 色盲使用者無法辨識選取 |
| 錯誤提示 | WebGL 不支援、貼圖失敗需有繁中提示 | 模擬錯誤 | 黑畫面無說明 |

### C5.2 裝置支援矩陣

| 裝置 / 瀏覽器 | 支援等級 | 最低驗收 |
|---|---|---|
| 桌機 Chrome 最新版 | Must | 完整視覺、完整互動、FPS ≥55 |
| 桌機 Edge 最新版 | Must | 功能等同 Chrome |
| macOS Safari 最新版 | Should | 核心互動可用，無 major 破版 |
| iPhone Safari | Should | 可載入、可拖曳、可點選、UI 不重疊 |
| Android Chrome | Should | 可載入、可拖曳、可點選、UI 不重疊 |
| 平板 | Should | 面板與 canvas 佈局合理 |
| 舊型低階手機 | Best effort | 顯示低效能提示或降低品質 |
| 無 WebGL 環境 | Fallback | 顯示繁中說明，不可無限 loading |

### C5.3 Responsive 驗收尺寸

至少測試：

- 390 × 844：手機直向。
- 844 × 390：手機橫向。
- 768 × 1024：平板。
- 1366 × 768：常見筆電。
- 1920 × 1080：展示螢幕。

**通過標準**

- 控制面板不超出 viewport。
- 主要按鈕觸控高度 ≥ 44px。
- 資訊面板可關閉或收合。
- Canvas resize 後不變形。
- 手機上不要求完整桌機視覺，但核心流程必須可完成：
  1. 看見太陽系。
  2. 拖曳視角。
  3. 點選至少一顆行星。
  4. 切換尺度。
  5. 暫停動畫。

---

## C6. 法律／授權 checklist

### C6.1 素材授權

| 項目 | 必須確認 | 驗收證據 | 失敗模式 |
|---|---|---|---|
| 行星貼圖 | 來源允許作品集與商業展示使用 | README / ATTRIBUTIONS 記錄 URL、授權 | 使用未授權 NASA 以外素材或來源不明圖片 |
| 星背景 | 可商用或自行生成 | 授權連結或生成紀錄 | 從搜尋引擎下載無授權圖 |
| 字體 | 授權可用於 web demo | 字體 license | 商用限制字體被打包 |
| icon | icon library 授權相容 | package license 或來源 | 未列 attribution |
| 音效 若有 | 可商用或移除 | license | 使用未授權音樂 |
| 程式庫 | npm package license 相容 | `package-lock` / license scan | GPL 類相容性未評估 |

### C6.2 天文資料來源

需在 README 或 `ATTRIBUTIONS.md` 列出：

- 行星半徑。
- 軌道半徑或半長軸。
- 公轉週期。
- 自轉週期 若使用。
- 月球資料。
- 小行星帶位置。
- 尺度模式轉換說明。

**通過標準**

- 每類資料至少有一個可信來源。
- UI 中不宣稱「完全真實模擬」，除非物理模型確實符合。
- 教育模式明確標示為可視化比例。
- 真實模式如使用 log scale、clamp 或 exaggeration，必須揭露。

### C6.3 隱私與追蹤

| 項目 | 標準 |
|---|---|
| Analytics | 若加入分析工具，需在 README 說明；不得收集個資 |
| Cookie | 靜態作品預設不應使用 cookie |
| 外部請求 | 除字體／素材 CDN 外應最小化；最好全部靜態打包 |
| API key | 不得把任何私密 key 放入前端或 Vercel public env |

### C6.4 發布前授權驗收指令

```bash
npm ls --depth=0
npm run build
```

人工檢查：

- `README.md` 有授權與來源段落。
- `ATTRIBUTIONS.md` 或等效章節存在。
- `public/` 與 `src/assets/` 每個非自製素材都有來源。
- 未使用來源不明圖片、音效、字體。
- Vercel production 頁面沒有載入可疑第三方資源。

---

## C7. 完成定義 DoD（Definition of Done）

### C7.1 功能 DoD

- [ ] 顯示太陽、8 行星、月球、土星環、小行星帶。
- [ ] 行星順序正確。
- [ ] 教育預設模式可完整觀察。
- [ ] 真實尺度切換可用，且有繁中說明限制。
- [ ] 可拖曳旋轉、縮放、重設視角。
- [ ] 可點選行星與月球查看繁中資訊。
- [ ] 可播放、暫停、調整時間倍率。
- [ ] 小行星帶不造成核心互動卡死。
- [ ] Loading、fallback、錯誤提示存在。
- [ ] Vercel 靜態部署可用，無後端依賴。

### C7.2 品質 DoD

- [ ] C1 Rubric 總分 ≥ 85。
- [ ] 視覺品質 ≥ 20 / 25。
- [ ] 互動品質 ≥ 20 / 25。
- [ ] 工程品質 ≥ 24 / 30。
- [ ] 內容品質 ≥ 16 / 20。
- [ ] 無 Critical / High QA 缺陷。
- [ ] Medium 缺陷皆已修復或列入已知限制並不阻擋展示。
- [ ] 首屏不是長時間黑畫面。
- [ ] 商業展示截圖可直接放入作品集。

### C7.3 工程 DoD

以下指令全部通過：

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run preview
```

- [ ] 正常 browser 流程 console 無 error。
- [ ] TypeScript 無錯誤。
- [ ] 測試涵蓋資料 schema、尺度切換、時間控制。
- [ ] Production build 無 asset 404。
- [ ] 場景 resize 正常。
- [ ] 長時間展示無明顯記憶體洩漏。
- [ ] 核心設定與資料不散落硬編碼。

### C7.4 內容與可及性 DoD

- [ ] UI 全文繁中。
- [ ] 無簡中殘留。
- [ ] 無不必要英文 placeholder。
- [ ] 行星資料有來源。
- [ ] 教育模式與真實模式差異明確。
- [ ] Lighthouse Accessibility ≥ 90。
- [ ] 主要控制支援鍵盤操作。
- [ ] icon button 具可讀 label。
- [ ] reduced motion 或暫停動畫支援。
- [ ] 手機可完成核心流程。

### C7.5 法律與發布 DoD

- [ ] README 有啟動、建置、部署、操作說明。
- [ ] README 或 ATTRIBUTIONS 有素材與資料來源。
- [ ] 所有第三方素材授權可用於作品集與商業展示。
- [ ] 無私密 API key 或 secret。
- [ ] Vercel production URL 可公開分享。
- [ ] Release tag 或最終交付版本已標記。
- [ ] 最終 QA 報告留存。

---

## C8. 後續可 skill 化項目

以下項目若在實作過程中形成穩定流程，建議沉澱為可重用 skill。

| Skill 名稱建議 | 觸發時機 | 可封裝內容 | 驗收產物 |
|---|---|---|---|
| `threejs-solar-system-qa` | 需要驗收 Three.js 太陽系或類似 3D 教育作品 | browser 檢查、console gate、FPS、尺度切換、行星點選 checklist | QA report markdown |
| `vite-threejs-vercel-static` | 建立 Vite + TS + three + Vercel 靜態部署 | 專案初始化、asset path、build、preview、Vercel 陷阱 | 可部署 starter |
| `threejs-celestial-scale-system` | 需要教育尺度與真實尺度雙模式 | scale schema、log scale、camera framing、UI 揭露文案 | scale module + tests |
| `threejs-performance-instancing` | 小行星帶、星場、粒子大量渲染 | InstancedMesh、LOD、draw call 檢查、FPS 測試 | performance spike report |
| `webgl-dogfood-commercial-demo` | 作品集／商業展示型 WebGL 專案 QA | 首屏、loading、fallback、手機、console、截圖驗收 | dogfood report |
| `traditional-chinese-ui-review` | 需要繁中 UI 品質檢查 | 台灣術語、簡中掃描、英文 placeholder 掃描、文案一致性 | UI copy checklist |
| `asset-license-audit-static-site` | 靜態網站含圖片、字體、音效、資料來源 | public/assets 掃描、授權表、ATTRIBUTIONS 模板 | license checklist |
| `threejs-accessibility-controls` | 3D canvas 搭配 HTML 控制面板 | keyboard nav、aria-label、reduced motion、focus ring | accessibility checklist |
| `threejs-memory-dispose-check` | 場景切換或模式切換造成資源重建 | dispose pattern、memory snapshot、重複切換測試 | leak test notes |

**Skill 化條件**

- 同一流程在本專案中重複使用 2 次以上。
- 有明確指令、檢查清單或失敗模式。
- 可被下一個 Three.js / WebGL / 作品集專案直接套用。
- 包含「如何驗收」而不只是概念說明。

---

## 附錄：實作啟動指令（給下一階段）

```bash
cd /mnt/c/GdriveM/Hermesworkspace/threejs-solar-system
# 下一步：依 C2 的 M0 建立 Vite+TS+three 骨架
# 建議：plan skill 細拆 M0 → subagent-driven-development
```

**下一步推薦：**
1. 用 `plan` / `writing-plans` 把 C2 M0–M5 拆成 bite-sized tasks  
2. 用 `subagent-driven-development` 實作  
3. 每 milestone 用 browser + console 驗收；M5 用 `dogfood`
