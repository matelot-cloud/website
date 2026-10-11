#!/usr/bin/env node
// Builds the public website into dist/, ready for GitHub Pages:
//   node tools/build.mjs [--out dist] [--check]
// - index.html from content.json on the Luminary structure (tools/landing.mjs), assets/ copied as they are;
// - docs/: the documentation folders committed in this repository (docs/latest/ and docs/vX.Y/, generated and pushed
//   by the platform's release workflow — never edited by hand), plus docs/versions.json for the version switcher and
//   a docs/index.html redirect to latest;
// - sitemap.xml, robots.txt, 404.html, .nojekyll, and CNAME when SITE_DOMAIN is set.
// Then every HTML file is link-checked: a relative link, asset or anchor without a target fails the build.
// Build-time settings: SITE_DOMAIN (custom domain, e.g. matelot.io; empty → GitHub Pages URL from content.json).
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderLanding } from './landing.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const OUT = resolve(ROOT, opt('--out', 'dist'));
const CHECK_ONLY = args.includes('--check');
const content = JSON.parse(readFileSync(join(ROOT, 'content.json'), 'utf8'));
const PRODUCT = content.product;
const SITE_DOMAIN = (process.env.SITE_DOMAIN ?? '').trim();
const siteUrl = (SITE_DOMAIN ? `https://${SITE_DOMAIN}` : content.site.url).replace(/\/$/, '');

// ---- versions: the folders under docs/ --------------------------------------------------------
const semver = (t) => t.slice(1).split('.').map((n) => parseInt(n, 10) || 0);
const docsSrc = join(ROOT, 'docs');
const versionDirs = existsSync(docsSrc)
  ? readdirSync(docsSrc).filter((d) => statSync(join(docsSrc, d)).isDirectory() && existsSync(join(docsSrc, d, 'index.html')))
  : [];
const tags = versionDirs.filter((d) => /^v\d+\.\d+/.test(d)).sort((a, b) => { const [x, y] = [semver(a), semver(b)]; return y[0] - x[0] || y[1] - x[1] || y[2] - x[2]; });
const versions = [...(versionDirs.includes('latest') ? [{ name: 'latest', label: 'latest (main)' }] : []), ...tags.map((t) => ({ name: t, label: t }))];
const siteVersion = tags[0] ?? 'latest';

// ---- build ------------------------------------------------------------------------------------
const stage = CHECK_ONLY ? mkdtempSync(join(tmpdir(), 'site-check-')) : OUT;
rmSync(stage, { recursive: true, force: true });
mkdirSync(join(stage, 'docs'), { recursive: true });
const problems = [];
if (!versions.length) problems.push('docs/: no documentation version found (expected docs/latest/index.html; the platform release workflow pushes it)');

writeFileSync(join(stage, 'index.html'), renderLanding(content, { version: siteVersion, siteUrl }));
cpSync(join(ROOT, 'assets'), join(stage, 'assets'), { recursive: true });
for (const f of ['404.html']) cpSync(join(ROOT, f), join(stage, f));
writeFileSync(join(stage, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
writeFileSync(join(stage, '.nojekyll'), ''); // GitHub Pages: serve files and folders as they are
if (SITE_DOMAIN) writeFileSync(join(stage, 'CNAME'), `${SITE_DOMAIN}\n`);
for (const v of versions) cpSync(join(docsSrc, v.name), join(stage, 'docs', v.name), { recursive: true });
writeFileSync(join(stage, 'docs', 'versions.json'), JSON.stringify({ versions }, null, 2));
writeFileSync(join(stage, 'docs', 'index.html'), `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=latest/"><title>${PRODUCT} docs</title><a href="latest/">Documentation (latest)</a>`);
const latestPages = versions.length ? readdirSync(join(stage, 'docs', 'latest')).filter((f) => f.endsWith('.html')) : [];
writeFileSync(join(stage, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[`${siteUrl}/`, ...latestPages.map((f) => `${siteUrl}/docs/latest/${f}`)].map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);

// ---- link check over everything generated ------------------------------------------------------
function* htmlFiles(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (e.endsWith('.html')) yield p;
  }
}
let pages = 0;
for (const file of htmlFiles(stage)) {
  pages++;
  const html = readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const ref = m[1];
    if (/^(https?:|mailto:|data:|javascript:)/.test(ref)) continue;
    if (ref === '#') continue;
    if (ref.startsWith('#')) { if (!ids.has(ref.slice(1))) problems.push(`${relative(stage, file)}: anchor ${ref} does not exist`); continue; }
    const [path, hash] = ref.split('#');
    let target = path.startsWith('/') ? join(stage, path) : resolve(dirname(file), path);
    if (path.endsWith('/') || statSync(target, { throwIfNoEntry: false })?.isDirectory()) target = join(target, 'index.html');
    if (!existsSync(target)) { problems.push(`${relative(stage, file)}: link "${ref}" has no target`); continue; }
    if (hash && target.endsWith('.html')) {
      const tids = new Set([...readFileSync(target, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
      if (!tids.has(hash)) problems.push(`${relative(stage, file)}: link "${ref}" points at a missing anchor`);
    }
  }
}

if (problems.length) {
  console.error(`site: ${problems.length} problem(s)`);
  for (const p of problems) console.error(`  ${p}`);
  if (CHECK_ONLY) rmSync(stage, { recursive: true, force: true });
  process.exit(1);
}
const summary = `landing + docs [${versions.map((v) => v.name).join(', ')}], ${pages} pages, ${SITE_DOMAIN ? `domain ${SITE_DOMAIN}` : siteUrl}`;
if (CHECK_ONLY) { rmSync(stage, { recursive: true, force: true }); console.log(`site: ${summary}, links ok`); }
else console.log(`site: ${summary} → ${relative(ROOT, OUT)}`);
