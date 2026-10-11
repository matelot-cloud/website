// Renders the landing page (dist/index.html) from content.json on the TemplateMo 621 "Luminary" structure.
// The structure lives here; every word, price and link comes from content.json.
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const ICONS = {
  github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  git: '<circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9a9 9 0 0 1-9 9M6 9v6"/>',
  registry: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><circle cx="6" cy="6" r="1"/><circle cx="6" cy="18" r="1"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  ticket: '<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z"/><path d="M13 5v14"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  webhook: '<path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"/><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"/><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>',
  k8s: '<path d="M12 2 3 7v10l9 5 9-5V7z"/><circle cx="12" cy="12" r="3"/>',
  ai: '<path d="M12 3a6 6 0 0 1 6 6v1a4 4 0 0 1 0 8H6a4 4 0 0 1 0-8V9a6 6 0 0 1 6-6z"/><circle cx="9.5" cy="11" r="1"/><circle cx="14.5" cy="11" r="1"/>',
};
const icon = (name) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] ?? ICONS.webhook}</svg>`;

export function renderLanding(c, { version, siteUrl = c.site.url, year = new Date().getUTCFullYear() }) {
  const ext = (href) => (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '');
  const nav = c.nav.map((n) => `<li><a href="${esc(n.href)}"${ext(n.href)}>${esc(n.label)}</a></li>`).join('\n    ');
  const mobile = [{ label: 'Home', href: '#' }, ...c.nav].map((n, i) => `<a href="${esc(n.href)}" class="mobile-menu-link" data-index="${String(i + 1).padStart(2, '0')}">${esc(n.label)}</a>`).join('\n      ');
  const metrics = c.hero.metrics.map((m) => `
      <div class="metric">
        <div class="metric-value"><span class="counter" data-target="${esc(m.value)}" data-decimals="0">0</span><span>${esc(m.suffix)}</span></div>
        <div class="metric-label">${esc(m.label)}</div>
      </div>`).join('');
  const pillars = c.pillars.map((p, i) => `
    <div class="feature${i % 2 ? ' reverse' : ''} reveal">
      <div class="feature-visual"><img src="${esc(p.image)}" alt="${esc(p.alt)}" loading="lazy"></div>
      <div class="feature-content">
        <div class="feature-number">${String(i + 1).padStart(2, '0')}</div>
        <p class="section-tag">${esc(p.tag)}</p>
        <h2 class="section-title">${p.title}</h2>
        <p class="section-body">${esc(p.body)}</p>
      </div>
    </div>`).join('');
  const capabilities = c.capabilities.items.map((k, i) => `
      <div class="capability reveal reveal-d${(i % 4) + 1}">
        <div class="capability-index">${String(i + 1).padStart(2, '0')}</div>
        <h3>${esc(k.title)}</h3>
        <p>${esc(k.body).replace(/`([^`]+)`/g, '<code>$1</code>')}</p>
      </div>`).join('');
  const integrations = c.integrations.items.map((it) => `
      <div class="integration-item">
        <div class="integration-icon">${icon(it.icon)}</div>
        <div class="integration-name">${esc(it.name)}</div>
      </div>`).join('');
  const tiers = c.pricing.tiers.map((t, i) => `
      <div class="pricing-card${t.featured ? ' featured' : ''} reveal reveal-d${i + 1}">
        ${t.featured ? '<div class="pricing-badge">Recommended</div>' : ''}
        <div class="pricing-tier">${esc(t.name)}</div>
        <div class="pricing-price"><span class="pricing-currency">${esc(c.pricing.currency)}</span><span class="pricing-amount">${esc(t.price)}</span><span class="pricing-unit">${esc(c.pricing.unit)}</span></div>
        <div class="pricing-billing">${esc(t.billing)} · <span class="pricing-indicative">${esc(c.pricing.indicative)}</span></div>
        <p class="pricing-desc">${esc(t.description)}</p>
        <ul class="pricing-features">${t.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
        <a href="${esc(t.cta.href)}" class="${t.featured ? 'btn-primary' : 'btn-secondary'}">${esc(t.cta.label)}</a>
      </div>`).join('');
  const testimonials = c.testimonials.enabled && c.testimonials.items.length ? `
  <div class="silk-divider reveal"></div>
  <section class="section section-center" id="testimonials">
    <p class="section-tag reveal">${esc(c.testimonials.tag)}</p>
    <h2 class="section-title reveal reveal-d1">${c.testimonials.title}</h2>
    <div class="testimonials-grid">${c.testimonials.items.map((t, i) => `
      <div class="testimonial-card reveal reveal-d${i + 1}">
        <p class="testimonial-quote">${esc(t.quote)}</p>
        <div class="testimonial-author"><div class="testimonial-avatar">${esc(t.initials)}</div><div><div class="testimonial-name">${esc(t.name)}</div><div class="testimonial-role">${esc(t.role)}</div></div></div>
      </div>`).join('')}
    </div>
  </section>` : '<!-- testimonials: disabled in content.json until there are real quotes -->';
  const faq = c.faq.items.map((f) => `
      <div class="faq-item">
        <button class="faq-question">${esc(f.q)}<span class="faq-icon"></span></button>
        <div class="faq-answer"><div class="faq-answer-inner">${esc(f.a).replace(/`([^`]+)`/g, '<code>$1</code>')}</div></div>
      </div>`).join('');
  const footerLinks = c.site.footerLinks.map((l) => `<a href="${esc(l.href)}"${ext(l.href)}>${esc(l.label)}</a>`).join('\n        ');
  const sections = ['hero', 'features', 'capabilities', 'integrations', 'pricing', 'faq', 'cta'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(c.site.title)}</title>
<meta name="description" content="${esc(c.site.description)}">
<meta property="og:title" content="${esc(c.site.title)}">
<meta property="og:description" content="${esc(c.site.description)}">
<meta property="og:image" content="${esc(siteUrl.replace(/\/$/, ''))}/assets/logo.png">
<link rel="icon" href="assets/favicon.png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/vendor/templatemo-621-luminary-style.css">
<link rel="stylesheet" href="assets/matelot.css">
<!--
TemplateMo 621 Luminary
https://templatemo.com/tm-621-luminary
-->
</head>
<body>

<svg class="grain" width="100%" height="100%">
  <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="5" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  <rect width="100%" height="100%" filter="url(#n)"/>
</svg>
<div class="atmosphere"></div>

<nav class="top-nav" id="topNav">
  <a href="#" class="nav-brand"><img class="nav-logo" src="assets/logo.png" alt="">${esc(c.product)}<span>${esc(c.brandTag)}</span></a>
  <ul class="nav-links">
    ${nav}
  </ul>
  <a href="${esc(c.hero.primary.href)}" class="nav-cta">${esc(c.hero.primary.label)}</a>
  <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">
    <span class="toggle-bar"></span><span class="toggle-bar"></span>
  </button>
</nav>

<div class="mobile-menu" id="mobileMenu">
  <div class="mobile-menu-inner">
    <div class="mobile-menu-links">
      ${mobile}
    </div>
    <div class="mobile-menu-footer">
      ${footerLinks}
    </div>
  </div>
</div>

<nav class="side-panel left" aria-label="Scroll indicators">
  <span class="side-label">Scroll</span>
  <div class="side-track"><div class="side-track-fill" id="leftTrack"></div></div>
  ${sections.map((_, i) => `<div class="side-dot${i === 0 ? ' active' : ''}"></div>`).join('\n  ')}
  <div class="side-readout" id="scrollPct">00</div>
</nav>
<nav class="side-panel right" aria-label="Version">
  <span class="side-label">Version</span>
  <div class="side-track"><div class="side-track-fill" id="rightTrack"></div></div>
  ${sections.map((_, i) => `<div class="side-dot${i === 0 ? ' active' : ''}"></div>`).join('\n  ')}
  <div class="side-readout">${esc(version)}</div>
</nav>

<main class="main">

  <section class="hero" id="hero">
    <div class="hero-grid"></div>
    <div class="hero-badge"><div class="hero-badge-dot"></div><span>${esc(c.hero.badge)}</span></div>
    <h1>${c.hero.title}</h1>
    <p class="hero-sub">${esc(c.hero.subtitle)}</p>
    <div class="hero-ctas">
      <a href="${esc(c.hero.primary.href)}" class="btn-primary">${esc(c.hero.primary.label)}</a>
      <a href="${esc(c.hero.secondary.href)}" class="btn-secondary">${esc(c.hero.secondary.label)}</a>
    </div>
    <div class="hero-metrics">${metrics}
    </div>
  </section>

  <section class="section" id="features">${pillars}
  </section>

  <div class="silk-divider reveal"></div>

  <section class="section section-center" id="capabilities">
    <p class="section-tag reveal">${esc(c.capabilities.tag)}</p>
    <h2 class="section-title reveal reveal-d1">${c.capabilities.title}</h2>
    <div class="capability-grid">${capabilities}
    </div>
  </section>

  <div class="silk-divider reveal"></div>

  <section class="section section-center" id="integrations">
    <p class="section-tag reveal">${esc(c.integrations.tag)}</p>
    <h2 class="section-title reveal reveal-d1">${c.integrations.title}</h2>
    <p class="section-body reveal reveal-d2">${esc(c.integrations.body)}</p>
    <div class="integrations-grid reveal reveal-d3">${integrations}
    </div>
  </section>

  <div class="silk-divider reveal"></div>

  <section class="section section-center" id="pricing">
    <p class="section-tag reveal">${esc(c.pricing.tag)}</p>
    <h2 class="section-title reveal reveal-d1">${c.pricing.title}</h2>
    <p class="section-body reveal reveal-d2">${esc(c.pricing.body)}</p>
    <div class="pricing-grid">${tiers}
    </div>
    <p class="pricing-note reveal">${esc(c.pricing.note)}</p>
  </section>
${testimonials}
  <div class="silk-divider reveal"></div>

  <section class="section section-center" id="faq">
    <p class="section-tag reveal">${esc(c.faq.tag)}</p>
    <h2 class="section-title reveal reveal-d1">${c.faq.title}</h2>
    <div class="faq-list reveal reveal-d2">
      <div class="faq-controls"><button class="faq-toggle-all" id="faqToggleAll">Expand All</button></div>${faq}
    </div>
  </section>

  <section class="footer-cta" id="cta">
    <p class="section-tag reveal">${esc(c.cta.tag)}</p>
    <h2 class="section-title reveal reveal-d1">${c.cta.title}</h2>
    <p class="section-body reveal reveal-d2" style="margin: 0 auto;">${esc(c.cta.body)}</p>
    <div class="footer-ctas reveal reveal-d3">
      <a href="${esc(c.cta.primary.href)}" class="btn-primary">${esc(c.cta.primary.label)}</a>
      <a href="${esc(c.cta.secondary.href)}" class="btn-secondary">${esc(c.cta.secondary.label)}</a>
    </div>
    <div class="footer-bar reveal reveal-d4" style="margin-top: 80px;">
      <div class="footer-brand">${esc(c.product)} &mdash; ${year} &middot; ${esc(version)}</div>
      <div class="footer-links">
        ${footerLinks}
        <span class="footer-credit">Design: <a href="https://templatemo.com" target="_blank" rel="nofollow noopener">TemplateMo</a></span>
        <span class="footer-credit">Images: <a href="https://unsplash.com" target="_blank" rel="nofollow noopener">Unsplash</a></span>
      </div>
    </div>
  </section>

</main>

<script src="assets/vendor/templatemo-621-luminary-script.js"></script>
</body>
</html>
`;
}
