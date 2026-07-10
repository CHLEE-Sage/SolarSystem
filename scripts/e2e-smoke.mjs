#!/usr/bin/env node
/**
 * Lightweight e2e smoke for M4 (no Playwright dependency).
 * Verifies production build artifacts + critical a11y / loading markup.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');

function fail(msg) {
  console.error(`e2e-smoke FAIL: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`✓ ${msg}`);
}

// Ensure fresh build when dist missing or force via env
const needBuild = process.env.E2E_SKIP_BUILD !== '1' || !existsSync(dist);
if (needBuild && process.env.E2E_SKIP_BUILD !== '1') {
  console.log('Building production bundle…');
  const r = spawnSync('npm', ['run', 'build'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
    shell: true,
  });
  if (r.status !== 0) fail('npm run build failed');
}

if (!existsSync(dist)) fail('dist/ missing after build');

const indexPath = join(dist, 'index.html');
if (!existsSync(indexPath)) fail('dist/index.html missing');
const html = readFileSync(indexPath, 'utf8');

const required = [
  ['lang="zh-Hant"', 'html lang'],
  ['id="webgl"', 'canvas'],
  ['id="loading"', 'loading overlay'],
  ['id="fallback"', 'webgl fallback'],
  ['id="scale-mode"', 'scale select'],
  ['id="quality-mode"', 'quality select'],
  ['id="btn-reset-time"', 'reset time'],
  ['id="btn-reset-cam"', 'reset camera'],
  ['aria-label', 'aria labels present'],
  ['aria-label="知道了，關閉操作提示"', 'tip accessible name includes visible label'],
  ['skip-link', 'skip link'],
];

for (const [needle, label] of required) {
  if (!html.includes(needle)) fail(`index.html missing ${label} (${needle})`);
  ok(`markup: ${label}`);
}

const robotsPath = join(dist, 'robots.txt');
if (!existsSync(robotsPath)) fail('robots.txt missing from dist');
const robots = readFileSync(robotsPath, 'utf8');
if (!/^User-agent:\s*\*/m.test(robots) || !/^Allow:\s*\//m.test(robots)) {
  fail('robots.txt does not allow valid crawler directives');
}
ok('robots.txt valid crawler directives');

const assetsDir = join(dist, 'assets');
if (!existsSync(assetsDir)) fail('dist/assets missing');
const files = readdirSync(assetsDir);
const js = files.filter((f) => f.endsWith('.js'));
const css = files.filter((f) => f.endsWith('.css'));
if (js.length < 1) fail('no JS bundle in dist/assets');
if (css.length < 1) fail('no CSS bundle in dist/assets');
ok(`bundles: ${js.length} js, ${css.length} css`);

const dataPath = join(dist, 'assets', 'data', 'planets.json');
if (!existsSync(dataPath)) fail('planets.json not copied to dist');
const planets = JSON.parse(readFileSync(dataPath, 'utf8'));
if (!Array.isArray(planets.bodies) || planets.bodies.length < 10) {
  fail('planets.json bodies incomplete');
}
ok(`planets.json bodies=${planets.bodies.length}`);

// Source-level gates already run in CI; re-check unit tests lightly optional
if (process.env.E2E_WITH_UNIT === '1') {
  const t = spawnSync('npm', ['run', 'test'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
    shell: true,
  });
  if (t.status !== 0) fail('unit tests failed');
  ok('unit tests');
}

const totalBytes = files.reduce((sum, f) => sum + statSync(join(assetsDir, f)).size, 0);
ok(`dist/assets total ~${(totalBytes / 1024).toFixed(0)} KB`);

console.log('\ne2e-smoke PASS');
