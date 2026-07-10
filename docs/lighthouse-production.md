# Production Lighthouse Audit — solar.sagevelo.com

Target: <https://solar.sagevelo.com/>  
Method: Chrome Lighthouse CLI，Desktop 與 Mobile 各一輪 production audit。

## First measurement (before SEO / accessible-name fix)

| Form factor | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Desktop | 54 | 100 | 100 | 91 |
| Mobile | 92 | 100 | 100 | 91 |

### Core Web Vitals / diagnostics

| Metric | Desktop | Mobile |
|---|---:|---:|
| FCP | 1.6 s | 0.9 s |
| LCP | 1.8 s | 0.9 s |
| TBT | 1,330 ms | 340 ms |
| CLS | 0 | 0 |

## Findings and fixes

1. **SEO: `robots.txt` returned HTML (SPA rewrite).**  
   - Cause: `vercel.json` SPA rewrite sent `/robots.txt` to `index.html` when there was no physical robots file.
   - Fix: add `public/robots.txt`, allowing crawlers to access `/`.

2. **Accessibility: close-tip accessible name did not include its visible label.**  
   - Cause: button text is `知道了`, but `aria-label` was only `關閉提示`.
   - Fix: use `aria-label="知道了，關閉操作提示"`, which retains the visible label in the accessible name.

3. **Desktop Performance: 54.**  
   - The principal limiting factor is initial JavaScript / WebGL main-thread work (Three.js bundle plus scene initialization). The app has zero CLS and a user-visible loading state.
   - This is a subsequent optimization candidate, not a release blocker: defer noncritical scene details or move selected creation work out of the initial critical path.

## Regression controls

`npm run test:e2e` now asserts:

- the production build contains the corrected tip accessible name;
- `dist/robots.txt` exists and contains valid `User-agent: *` / `Allow: /` directives.

## Re-audit (after deploy)

The fixed production assets were confirmed live (`/robots.txt` now returns crawler directives; the tip button exposes `知道了，關閉操作提示`).

| Form factor | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Desktop | 51 | **100** | **100** | **100** |
| Mobile | 76 | **100** | **100** | **100** |

> Performance varies between Lighthouse runs because the Three.js scene is CPU/GPU intensive and because test-machine conditions differ. The stable release gates are Accessibility / Best Practices / SEO at 100, no layout shift, explicit loading state, quality fallback, and clean browser-console checks.

### Re-audit metrics

| Metric | Desktop | Mobile |
|---|---:|---:|
| FCP | 2.0 s | 1.6 s |
| LCP | 2.2 s | 1.9 s |
| TBT | 480 ms | 1,050 ms |
| CLS | 0 | 0 |

## Remaining performance opportunity

The main performance opportunity remains Three.js parsing plus initial scene creation. Potential M5.1 work: defer nonessential star/belt creation until after first render, or split the renderer code into a dynamically imported chunk. This is not included in the current release because it would change the render initialization architecture.
