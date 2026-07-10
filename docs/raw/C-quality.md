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