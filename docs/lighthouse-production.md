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

## M5.1 performance optimization (2026-07-10)

### Root cause and controlled change

The production reports identified main-thread boot work as the limiting factor (Mobile `bootup-time` 4.6 s / `mainthread-work-breakdown` 8.0 s). The initial scene synchronously allocated the background starfield and full-capacity asteroid `InstancedMesh` before the primary solar-system frame could paint.

M5.1 keeps the Sun, planets, Moon, controls, picking, and all HUD functions in the critical path. It defers **only decorative** starfield and asteroid-belt allocation until 450 ms after the first rendered frame. The renderer remains fully interactive before those details are added. Source maps are also disabled for the public production build, removing a 2.83 MB deploy artifact.

A new unit regression test verifies that deferred decoration allocation does not occur until `activateDecorations()` is called. Full gates passed: typecheck, lint, **20/20** unit tests, production build, and static e2e smoke. Production browser visual verification showed the completed starfield, asteroid belt, planets, and controls, with no console errors.

### Fresh post-M5.1 production audit

| Form factor | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Desktop (`--preset=desktop`) | **96** | **100** | **100** | **100** |
| Mobile | **91** | **100** | **100** | **100** |

| Metric | Desktop | Mobile |
|---|---:|---:|
| FCP | 0.4 s | 1.8 s |
| LCP | 0.4 s | 1.9 s |
| TBT | 170 ms | 310 ms |
| Speed Index | 0.6 s | 2.9 s |
| Interactive | 0.6 s | 2.3 s |
| Main-thread work | 1.1 s | 3.7 s |
| Bootup time | 0.7 s | 2.0 s |
| CLS | 0 | 0 |

The current release no longer has a performance-release blocker. Lighthouse scores will still vary modestly by browser/GPU load, so performance should be tracked as a trend rather than a single absolute number.

## Remaining performance opportunity

No further refactor is required for release. If a future version adds texture streaming, labels, or richer effects, keep those assets outside the first-paint path and rerun both Lighthouse form factors after each isolated change.
