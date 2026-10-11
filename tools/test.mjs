// Builds the site into a temp dir and checks the output. Run: node tools/test.mjs
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const content = JSON.parse(readFileSync(join(root, 'content.json'), 'utf8'));

// 1. default build: GitHub Pages URL, no CNAME
const out = mkdtempSync(join(tmpdir(), 'site-'));
execFileSync('node', [join(here, 'build.mjs'), '--out', out], { stdio: 'pipe', env: { ...process.env, SITE_DOMAIN: '' } });

// landing: every string of content.json that should be visible is in index.html; no template placeholder survived
const landing = readFileSync(join(out, 'index.html'), 'utf8');
const visible = [content.hero.badge, content.hero.subtitle, content.capabilities.items[0].title, content.integrations.items[0].name, content.pricing.note, content.faq.items[0].q, content.site.security, content.site.sales, ...content.pricing.tiers.map((t) => t.name)];
for (const needle of visible) assert.ok(landing.includes(needle.replace(/&/g, '&amp;')), `landing lacks "${needle.slice(0, 40)}"`);
for (const t of content.pricing.tiers) assert.ok(landing.includes(`<span class="pricing-amount">${t.price}</span>`), `price of ${t.name} missing`);
assert.equal((landing.match(/class="pricing-indicative"/g) ?? []).length, content.pricing.tiers.length, 'every tier is marked indicative');
assert.doesNotMatch(landing, /Lorem|Meridian Labs|Start Free Trial|Workflows that|Intelligent Automation/, 'template copy survived'); // 'Luminary' stays in the attribution and asset names
assert.match(landing, /templatemo\.com/, 'TemplateMo credit missing (licence)');
assert.match(landing, /<section class="section section-center" id="pricing">/);
assert.doesNotMatch(landing, /id="testimonials"/, 'testimonials rendered although disabled');
assert.doesNotMatch(landing, /pricingToggle|price-option/, 'template price toggle rendered');
assert.match(landing, /href="docs\/latest\/install\.html"/, 'install guide not linked');
assert.match(landing, /href="https:\/\/github\.com\/matelot-io\/matelot" target="_blank"/, 'GitHub link not external');
for (const f of ['assets/logo.png', 'assets/favicon.png', 'assets/matelot.css', 'assets/vendor/templatemo-621-luminary-style.css', 'assets/vendor/templatemo-621-luminary-script.js', 'assets/vendor/LICENSE.md', '404.html', '.nojekyll', 'robots.txt', 'sitemap.xml', 'docs/index.html', 'docs/versions.json', 'docs/latest/index.html', 'docs/latest/install.html', 'docs/latest/search-index.json']) assert.ok(existsSync(join(out, f)), `missing ${f}`);
assert.ok(!existsSync(join(out, 'CNAME')), 'CNAME written without SITE_DOMAIN');
assert.match(readFileSync(join(out, 'robots.txt'), 'utf8'), new RegExp(`Sitemap: ${content.site.url.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}/sitemap.xml`));
assert.match(readFileSync(join(out, 'sitemap.xml'), 'utf8'), /docs\/latest\/install\.html/);

// docs: the committed version folders are served, the switcher lists them, the shared header is there
const pages = readdirSync(join(out, 'docs/latest')).filter((f) => f.endsWith('.html'));
assert.ok(pages.length >= 20, `only ${pages.length} docs pages`);
const install = readFileSync(join(out, 'docs/latest/install.html'), 'utf8');
assert.match(install, /<meta name="docs-version" content="latest">/);
assert.match(install, /class="top-links"><a href="\.\.\/\.\.\/">Home<\/a><a href="index\.html">Docs<\/a><a class="current" href="install\.html">Install<\/a><a href="https:\/\/github\.com\/matelot-io\/matelot"/);
const versions = JSON.parse(readFileSync(join(out, 'docs/versions.json'), 'utf8')).versions.map((v) => v.name);
assert.equal(versions[0], 'latest');
for (const v of versions) assert.ok(existsSync(join(out, 'docs', v, 'index.html')), `version ${v} has no index`);
assert.ok(!existsSync(join(out, 'timer.html')), 'timer.html must not ship');

// 2. custom domain: CNAME and absolute URLs follow SITE_DOMAIN
const out2 = mkdtempSync(join(tmpdir(), 'site-'));
execFileSync('node', [join(here, 'build.mjs'), '--out', out2], { stdio: 'pipe', env: { ...process.env, SITE_DOMAIN: 'matelot.io' } });
assert.equal(readFileSync(join(out2, 'CNAME'), 'utf8'), 'matelot.io\n');
assert.match(readFileSync(join(out2, 'sitemap.xml'), 'utf8'), /<loc>https:\/\/matelot\.io\/<\/loc>/);
assert.match(readFileSync(join(out2, 'robots.txt'), 'utf8'), /https:\/\/matelot\.io\/sitemap\.xml/);
console.log(`site ok (landing + ${pages.length} docs pages, versions: ${versions.join(', ')})`);
