#!/usr/bin/env node
/**
 * Hartron Hisar — blog post builder.
 *
 * Renders a fully-formed blog post HTML file that matches the existing
 * site template exactly (GA4, canonical, OG/Twitter, JSON-LD BlogPosting +
 * FAQPage + Breadcrumb), and wires it into blog.html (card + JSON-LD list)
 * and sitemap.xml.
 *
 * The WRITING (title, body prose, FAQ, excerpt) is supplied by the caller as
 * a JSON "post spec". This script only guarantees template + wiring
 * consistency — it never invents facts.
 *
 * Usage:
 *   node build-post.js path/to/spec.json            # build + wire into site
 *   node build-post.js path/to/spec.json --no-wire  # build the post file only
 *
 * A spec can describe one language or be a bilingual pair (see SPEC SCHEMA in
 * README.md). For a bilingual pair, pass an array of two specs (en + hi) or a
 * single spec object with a `hi` sub-object.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const BLOG_INDEX = path.join(ROOT, 'blog.html');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const COURSES = path.join(ROOT, 'data', 'courses.json');

// ---- Site constants (kept in sync with existing pages) ----------------------
const SITE = {
  domain: 'https://hartronhisar.in',
  gaId: 'G-1DZG7KC9W6',
  assetVer: '20260516',
  ogImage: 'https://hartronhisar.in/assets/images/og-image.jpg',
  orgName: 'Hartron Skill Centre, Hisar',
  phone1: '+919215838058',
  phone1Display: '92158-38058',
  phone2: '+919812086917',
};

// ---- helpers ----------------------------------------------------------------
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
// strip any HTML tags -> plain text (for <title>, meta, JSON-LD strings)
function plain(s) {
  return String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}
function jsonAttr(obj) {
  return JSON.stringify(obj);
}
function loadCourses() {
  const data = JSON.parse(fs.readFileSync(COURSES, 'utf8'));
  const byId = {};
  for (const c of data.courses) byId[c.id] = c;
  return byId;
}

// Validate that any course figures referenced in the spec match courses.json.
// This is the guardrail against invented fees/durations.
function assertCourseFacts(spec, courses) {
  if (!spec.courseChecks) return;
  for (const chk of spec.courseChecks) {
    const c = courses[chk.id];
    if (!c) throw new Error(`Spec references unknown course id: ${chk.id}`);
    for (const [field, val] of Object.entries(chk.expect || {})) {
      if (String(c[field]) !== String(val)) {
        throw new Error(
          `Course-fact mismatch for ${chk.id}.${field}: spec says "${val}" ` +
          `but courses.json says "${c[field]}". Fix the spec — do not guess.`);
      }
    }
  }
}

// ---- shared chrome (header / footer / floating whatsapp) --------------------
// prefix = "../" for /blog/ pages
function header(prefix) {
  return `  <header class="site-header">
    <div class="header-top">
      <div class="container">
        <div class="header-top-inner">
          <a href="${prefix}index.html" class="brand">
            <img src="${prefix}assets/images/logo.png?v=${SITE.assetVer}" alt="Hartron Skill Centre Hisar" class="brand-logo">
            <span class="brand-divider"></span>
            <img src="${prefix}assets/images/logo-hartron.png?v=${SITE.assetVer}" alt="HARTRON" class="brand-logo-parent">
          </a>
          <div class="header-contact">
            <div class="header-contact-item">
              <span class="header-contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <span class="header-contact-text">
                <small>Location</small>
                <strong>Between Nagori Gate &amp; Bus Stand</strong>
              </span>
            </div>
            <a href="tel:${SITE.phone1}" class="header-contact-item hide-md">
              <span class="header-contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              <span class="header-contact-text">
                <small>Call us</small>
                <strong>${SITE.phone1Display}</strong>
              </span>
            </a>
            <a href="#" data-wa class="btn btn-whatsapp">
              <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>
              WhatsApp
            </a>
            <button class="mobile-toggle" aria-label="Toggle menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="header-nav-row">
      <div class="container">
        <div class="header-nav-inner">
          <nav class="nav-primary">
            <a href="${prefix}index.html">Home</a>
            <a href="${prefix}courses.html">Courses</a>
            <a href="${prefix}about.html">About</a>
            <a href="${prefix}gallery.html">Gallery</a>
            <a href="${prefix}blog.html">Blog</a>
            <a href="${prefix}contact.html">Contact</a>
            <a href="${prefix}contact.html" class="btn btn-accent btn-sm nav-cta">Enquire Now</a>
          </nav>
        </div>
      </div>
    </div>
  </header>`;
}

function footer(prefix) {
  return `  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="${prefix}index.html" class="brand">
            <span class="brand-mark">H</span>
            <span class="brand-text"><strong>HARTRON</strong><small style="color: rgba(255,255,255,0.7);">Skill Centre · Hisar</small></span>
          </a>
          <p>An NCVET-approved, NSQF-aligned computer training institute. A Haryana Government Undertaking — serving Hisar since 1999.</p>
        </div>
        <div class="footer-col"><h5>Quick Links</h5><ul><li><a href="${prefix}index.html">Home</a></li><li><a href="${prefix}courses.html">All Courses</a></li><li><a href="${prefix}about.html">About Us</a></li><li><a href="${prefix}gallery.html">Gallery</a></li><li><a href="${prefix}blog.html">Blog</a></li><li><a href="${prefix}contact.html">Contact</a></li></ul></div>
        <div class="footer-col"><h5>Popular Courses</h5><ul><li><a href="${prefix}courses/cca.html">CCA · 52 Weeks</a></li><li><a href="${prefix}courses/cda.html">CDA · Digital Accounting</a></li><li><a href="${prefix}courses/pwp.html">PWP · Python</a></li><li><a href="${prefix}courses/cift.html">CIFT</a></li><li><a href="${prefix}courses/ccba.html">CCBA</a></li><li><a href="${prefix}courses/fc.html">FC · Foundation</a></li></ul></div>
        <div class="footer-col"><h5>Get in Touch</h5><ul><li><a href="tel:${SITE.phone1}">📞 ${SITE.phone1Display}</a></li><li><a href="tel:${SITE.phone2}">📞 98120-86917</a></li><li><a href="#" data-wa>💬 WhatsApp</a></li><li style="line-height: 1.5; color: rgba(255,255,255,0.7); margin-top: 4px;">Between Nagori Gate &amp; Bus Stand, Near Gurudwara, Hisar</li></ul></div>
      </div>
      <div class="footer-bottom">
        <div>© <span id="footer-year">2026</span> Hartron Skill Centre, Hisar · Authorised Franchisee of HARTRON (Haryana State Electronics Development Corporation Limited)</div>
        <div class="footer-recognition"><span>NCVET Approved</span><span>NSQF Aligned</span><span>Since 1999</span></div>
      </div>
    </div>
  </footer>

  <a href="#" data-wa class="whatsapp-float" aria-label="Chat on WhatsApp">
    <span class="whatsapp-float-tooltip">Chat with us</span>
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>
  </a>

  <script>document.getElementById('footer-year').textContent = new Date().getFullYear();</script>
  <script src="${prefix}assets/js/main.js?v=${SITE.assetVer}"></script>`;
}

// ---- post renderer ----------------------------------------------------------
function renderPost(spec) {
  const prefix = '../';
  const lang = spec.lang === 'hi' ? 'hi' : 'en';
  const locale = lang === 'hi' ? 'hi_IN' : 'en_IN';
  const url = `${SITE.domain}/blog/${spec.slug}`;
  const titlePlain = plain(spec.titlePlain || spec.title);
  const desc = plain(spec.metaDescription);

  // hreflang alternates linking the EN <-> HI pair
  let alternates = '';
  if (spec.enSlug && spec.hiSlug) {
    alternates =
`  <link rel="alternate" hreflang="en" href="${SITE.domain}/blog/${spec.enSlug}">
  <link rel="alternate" hreflang="hi" href="${SITE.domain}/blog/${spec.hiSlug}">
  <link rel="alternate" hreflang="x-default" href="${SITE.domain}/blog/${spec.enSlug}">
`;
  }

  // JSON-LD blocks
  const blogPosting = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: titlePlain, description: plain(spec.schemaDescription || spec.metaDescription),
    image: SITE.ogImage, datePublished: spec.datePublished, dateModified: spec.dateModified || spec.datePublished,
    inLanguage: lang,
    author: { '@type': 'Organization', name: SITE.orgName, url: SITE.domain },
    publisher: { '@type': 'EducationalOrganization', name: SITE.orgName, logo: { '@type': 'ImageObject', url: `${SITE.domain}/assets/images/logo.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.domain },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE.domain}/blog` },
      { '@type': 'ListItem', position: 3, name: plain(spec.breadcrumbName || titlePlain), item: url },
    ],
  };
  const faqPage = (spec.faq && spec.faq.length) ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: spec.faq.map(f => ({
      '@type': 'Question', name: plain(f.q),
      acceptedAnswer: { '@type': 'Answer', text: plain(f.a) },
    })),
  } : null;

  // FAQ visible section
  let faqSection = '';
  if (spec.faq && spec.faq.length) {
    const items = spec.faq.map(f =>
`            <details class="faq-item">
              <summary>${esc(plain(f.q))}</summary>
              <p>${f.a}</p>
            </details>`).join('\n');
    faqSection =
`          <h2>${lang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently asked questions'}</h2>
          <div class="faq-list">
${items}
          </div>`;
  }

  // language toggle link (shown under breadcrumb)
  let langLink = '';
  const langLinkStyle = 'display:inline-block;margin-top:12px;font-weight:600;color:var(--accent,#c8102e);text-decoration:underline;';
  if (spec.enSlug && spec.hiSlug) {
    if (lang === 'en') langLink = `        <a class="lang-switch" style="${langLinkStyle}" href="${spec.hiSlug}.html" hreflang="hi" lang="hi">हिंदी में पढ़ें →</a>`;
    else langLink = `        <a class="lang-switch" style="${langLinkStyle}" href="${spec.enSlug}.html" hreflang="en" lang="en">Read in English →</a>`;
  }

  const schemaBlocks = [blogPosting, breadcrumb].concat(faqPage ? [faqPage] : [])
    .map(b => `  <script type="application/ld+json">${jsonAttr(b)}</script>`).join('\n');

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Google Analytics 4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${SITE.gaId}', { 'anonymize_ip': true });
  </script>

  <!-- Primary Meta -->
  <title>${esc(titlePlain)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="keywords" content="${esc(spec.keywords || '')}">
  <meta name="author" content="${SITE.orgName}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url}">
${alternates}
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(titlePlain)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE.ogImage}">
  <meta property="og:site_name" content="${SITE.orgName}">
  <meta property="og:locale" content="${locale}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(titlePlain)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${SITE.ogImage}">

  <!-- Fonts & styles -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Hind:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${prefix}assets/css/style.css?v=${SITE.assetVer}">
  <link rel="icon" href="${prefix}favicon.ico" sizes="32x32">
  <link rel="icon" type="image/svg+xml" href="${prefix}assets/images/favicon.svg">
  <link rel="icon" type="image/png" sizes="16x16" href="${prefix}assets/images/favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}assets/images/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="${prefix}apple-touch-icon.png">

  <!-- Schema.org JSON-LD -->
${schemaBlocks}
</head>
<body>

${header(prefix)}

  <section class="page-hero">
    <div class="container">
      <div class="page-hero-content">
        <div class="breadcrumbs">
          <a href="${prefix}index.html">Home</a>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <a href="${prefix}blog.html">Blog</a>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span>${esc(plain(spec.breadcrumbName || titlePlain))}</span>
        </div>
${langLink}
        <span class="eyebrow">${esc(spec.eyebrow || spec.category || '')}</span>
        <h1 class="display" style="margin-top: 16px;">${spec.heroTitle || esc(titlePlain)}</h1>
      </div>
    </div>
  </section>

  <section>
    <div class="container">
      <article class="post">
        <div class="post-meta">
          <span class="post-cat">${esc(spec.category || '')}</span>
          <span>${lang === 'hi' ? 'अपडेटेड' : 'Updated'} ${esc(spec.dateDisplay || spec.datePublished)}</span>
          <span>${esc(spec.readMins || 7)} ${lang === 'hi' ? 'मिनट पढ़ें' : 'min read'}</span>
        </div>

        <div class="post-body">
${spec.bodyHtml}

${faqSection}
        </div>
      </article>
    </div>
  </section>

  <section style="padding-top: 0;">
    <div class="container">
      <div class="cta-block">
        <h2>${spec.ctaHeading || (lang === 'hi' ? 'सही कोर्स चुनने में मदद चाहिए?' : 'Want help choosing the <em>right course</em>?')}</h2>
        <p>${esc(spec.ctaText || '')}</p>
        <div class="btn-group">
          <a href="#" data-wa${spec.ctaCourseName ? ` data-wa-course="${esc(spec.ctaCourseName)}"` : ''} class="btn btn-accent btn-lg">${esc(spec.ctaPrimaryLabel || 'Ask on WhatsApp')}</a>
          ${spec.ctaSecondaryHref ? `<a href="${esc(spec.ctaSecondaryHref)}" class="btn btn-outline btn-lg">${esc(spec.ctaSecondaryLabel || 'View Course')}</a>` : ''}
        </div>
      </div>
    </div>
  </section>

${footer(prefix)}
</body>
</html>
`;
}

// ---- blog.html card ---------------------------------------------------------
function renderCard(spec) {
  return `        <a href="blog/${spec.slug}.html" class="blog-card">
          <span class="blog-card-cat">${esc(spec.category || '')}</span>
          <h3>${esc(plain(spec.cardTitle || spec.titlePlain || spec.title))}</h3>
          <p class="blog-card-excerpt">${esc(spec.cardExcerpt || '')}</p>
          <div class="blog-card-meta">
            <span>${esc(spec.readMins || 7)} min read</span>
            <span class="blog-card-readmore">Read guide
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </div>
        </a>`;
}

// ---- wiring: blog.html card + JSON-LD, sitemap.xml --------------------------
function wireIndexCard(spec) {
  let html = fs.readFileSync(BLOG_INDEX, 'utf8');
  const marker = '<div class="blog-grid">';
  const idx = html.indexOf(marker);
  if (idx === -1) throw new Error('Could not find blog-grid in blog.html');
  const insertAt = idx + marker.length;
  const card = '\n\n' + renderCard(spec);
  html = html.slice(0, insertAt) + card + html.slice(insertAt);
  fs.writeFileSync(BLOG_INDEX, html);
}

function wireIndexJsonLd(spec) {
  let html = fs.readFileSync(BLOG_INDEX, 'utf8');
  const marker = '"blogPost": [';
  const idx = html.indexOf(marker);
  if (idx === -1) throw new Error('Could not find blogPost array in blog.html');
  const insertAt = idx + marker.length;
  const entry = jsonAttr({
    '@type': 'BlogPosting',
    headline: plain(spec.titlePlain || spec.title),
    url: `${SITE.domain}/blog/${spec.slug}`,
    datePublished: spec.datePublished,
  }) + ', ';
  html = html.slice(0, insertAt) + entry + html.slice(insertAt);
  fs.writeFileSync(BLOG_INDEX, html);
}

function wireSitemap(spec) {
  let xml = fs.readFileSync(SITEMAP, 'utf8');
  if (xml.includes(`<loc>${SITE.domain}/blog/${spec.slug}</loc>`)) return; // idempotent
  const block =
`  <url>
    <loc>${SITE.domain}/blog/${spec.slug}</loc>
    <lastmod>${spec.datePublished}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  xml = xml.replace('</urlset>', block + '</urlset>');
  fs.writeFileSync(SITEMAP, xml);
}

// ---- build one spec ---------------------------------------------------------
function buildOne(spec, courses, wire) {
  assertCourseFacts(spec, courses);
  const outPath = path.join(BLOG_DIR, `${spec.slug}.html`);
  fs.writeFileSync(outPath, renderPost(spec));
  const rel = path.relative(ROOT, outPath);
  const written = [rel];
  if (wire) {
    // Visible index card: English only, to keep the blog grid single-language.
    // Hindi stays discoverable via the in-post language toggle, hreflang, and sitemap.
    if (spec.lang !== 'hi') wireIndexCard(spec);
    wireIndexJsonLd(spec);   // both languages listed in blog JSON-LD (good for SEO)
    wireSitemap(spec);       // both languages in sitemap
    written.push('blog.html', 'sitemap.xml');
  }
  return written;
}

// Expand a spec that may be bilingual (array, or {en,hi}) into flat specs,
// cross-linking slugs for hreflang.
function expandSpecs(input) {
  let list;
  if (Array.isArray(input)) list = input;
  else if (input.hi || input.en) {
    const en = Object.assign({}, input, input.en || {}); delete en.en; delete en.hi;
    const hi = Object.assign({}, input, input.hi || {}); delete hi.en; delete hi.hi;
    en.lang = 'en'; hi.lang = 'hi';
    list = [en, hi];
  } else list = [input];

  const en = list.find(s => s.lang !== 'hi');
  const hi = list.find(s => s.lang === 'hi');
  for (const s of list) {
    if (en && hi) { s.enSlug = en.slug; s.hiSlug = hi.slug; }
  }
  return list;
}

function main() {
  const args = process.argv.slice(2);
  const specPath = args.find(a => !a.startsWith('--'));
  const wire = !args.includes('--no-wire');
  if (!specPath) {
    console.error('Usage: node build-post.js <spec.json> [--no-wire]');
    process.exit(1);
  }
  const courses = loadCourses();
  const input = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const specs = expandSpecs(input);
  const allWritten = [];
  for (const spec of specs) {
    if (!spec.slug) throw new Error('Each spec needs a slug');
    allWritten.push(...buildOne(spec, courses, wire));
  }
  console.log('Wrote:\n  ' + [...new Set(allWritten)].join('\n  '));
}

if (require.main === module) main();

module.exports = { renderPost, renderCard, expandSpecs, loadCourses };
