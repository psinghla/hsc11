// generate-course-pages.js
// Generates SEO-optimized course HTML with content pre-rendered (not JS-injected).
// Run: node generate-course-pages.js

const fs = require('fs');
const path = require('path');

const SITE = {
  domain: 'https://hartronhisar.in',
  name: 'Hartron Skill Centre, Hisar',
  shortName: 'Hartron Hisar',
  phone: '+919215838058',
  phoneDisplay: '92158-38058',
  phone2: '+919812086917',
  phone2Display: '98120-86917',
  email: 'info@hartronhisar.com',
  address: {
    street: 'Between Nagori Gate & Bus Stand, Near Gurudwara',
    locality: 'Hisar',
    region: 'Haryana',
    postalCode: '125001',
    country: 'IN'
  },
  geo: { lat: 29.1492, lng: 75.7228 },
  openingHours: 'Mo-Sa 09:00-19:00',
  founded: 1999,
  alumni: '20000+',
  yearsOfExperience: '27+',
  ogImage: 'https://hartronhisar.in/assets/images/og-image.jpg'
};

const NEARBY_AREAS = ["Hisar", "Hisar Cantt", "Balsamand", "Mirzapur", "Khedar", "Agroha", "Mangali", "Nalwa", "Sisai", "Adampur", "Hansi", "Uklana", "Barwala", "Bhuna", "Narnaund"];

const courses = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/courses.json'), 'utf8')
).courses;

// === Helpers ===
function buildCourseSchema(course) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name,
    "alternateName": course.code,
    "description": course.tagline,
    "provider": {
      "@type": "EducationalOrganization",
      "name": SITE.name,
      "sameAs": SITE.domain,
      "url": SITE.domain
    },
    "courseCode": course.code,
    "educationalLevel": "Certificate",
    "occupationalCategory": course.category,
    "timeRequired": course.duration,
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "onsite",
      "courseSchedule": {
        "@type": "Schedule",
        "duration": course.duration,
        "repeatFrequency": "weekly"
      },
      "location": {
        "@type": "Place",
        "name": SITE.name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": SITE.address.street,
          "addressLocality": SITE.address.locality,
          "addressRegion": SITE.address.region,
          "postalCode": SITE.address.postalCode,
          "addressCountry": SITE.address.country
        }
      }
    },
    "offers": {
      "@type": "Offer",
      "category": "Educational",
      "availability": "https://schema.org/InStock",
      "url": `${SITE.domain}/courses/${course.id}`
    }
  };
}

function buildBreadcrumbSchema(course) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE.domain },
      { "@type": "ListItem", "position": 2, "name": "Courses", "item": `${SITE.domain}/courses` },
      { "@type": "ListItem", "position": 3, "name": course.name, "item": `${SITE.domain}/courses/${course.id}` }
    ]
  };
}

function buildFaqSchema(course) {
  const faqs = [
    {
      q: `What is the duration of the ${course.name} course?`,
      a: `The ${course.name} (${course.code}) course at Hartron Skill Centre Hisar is ${course.duration}. ${course.batchTimings.join(' ')}.`
    },
    {
      q: `Who is eligible for the ${course.code} course?`,
      a: `Eligibility for ${course.name} is: ${course.eligibility}. Students from Hisar, Hansi, Adampur, Barwala, Uklana, Agroha, Narnaund and surrounding villages within 40 km are welcome.`
    },
    {
      q: `What are the career outcomes after completing ${course.code}?`,
      a: `After completing ${course.name}, students can pursue roles including: ${course.outcomes.join('; ')}.`
    },
    {
      q: `Where is Hartron Skill Centre Hisar located?`,
      a: `Hartron Skill Centre is located ${SITE.address.street}, ${SITE.address.locality}, ${SITE.address.region} ${SITE.address.postalCode}. Call ${SITE.phoneDisplay} to enquire.`
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// === Page template ===
function template(course) {
  const url = `${SITE.domain}/courses/${course.id}`;
  const title = `${course.name} (${course.code}) Course in Hisar | Hartron Skill Centre`;
  const description = `Learn ${course.name} at Hartron Skill Centre Hisar. ${course.tagline} Duration: ${course.duration}. Eligibility: ${course.eligibility}. Govt. recognized. Call ${SITE.phoneDisplay}.`;

  const courseSchema = buildCourseSchema(course);
  const breadcrumbSchema = buildBreadcrumbSchema(course);
  const faqSchema = buildFaqSchema(course);

  // Server-rendered course detail content
  const heroBlock = `
    <section class="course-detail-hero">
      <div class="container">
        <div class="breadcrumbs" style="color: rgba(255,255,255,0.7); margin-bottom: 24px;">
          <a href="../index.html" style="color: rgba(255,255,255,0.7);">Home</a>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <a href="../courses.html" style="color: rgba(255,255,255,0.7);">Courses</a>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style="color: #fff;">${escapeHtml(course.code)}</span>
        </div>
        <span class="course-code">${escapeHtml(course.code)}</span>
        <h1>${escapeHtml(course.name)}</h1>
        <p class="lede">${escapeHtml(course.tagline)}</p>
        <div class="course-detail-meta">
          <div class="course-detail-meta-item"><small>Duration</small><strong>${escapeHtml(course.duration)}</strong></div>
          <div class="course-detail-meta-item"><small>Eligibility</small><strong>${escapeHtml(course.eligibility)}</strong></div>
          <div class="course-detail-meta-item"><small>Category</small><strong>${escapeHtml(course.category)}</strong></div>
          <div class="course-detail-meta-item"><small>Fees</small><strong>${escapeHtml(course.fee)}</strong></div>
        </div>
        <div class="course-detail-actions">
          <a href="#" data-wa data-wa-course="${escapeHtml(course.name)}" class="btn btn-accent btn-lg">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
            Enquire on WhatsApp
          </a>
          <a href="../contact.html" class="btn btn-outline btn-lg" style="background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.3);">Submit enquiry form</a>
        </div>
      </div>
    </section>
  `;

  const bodyBlock = `
    <section>
      <div class="container">
        <div class="course-body">
          <div class="course-body-main">
            <h2 style="font-size: clamp(1.5rem, 2.5vw, 2rem); margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--color-primary); display: inline-block;">What You Will Learn</h2>
            <div class="curriculum-grid">
              ${course.curriculum.map((item, i) => `
                <div class="curriculum-item">
                  <span class="curriculum-number">${i + 1}</span>
                  <span>${escapeHtml(item)}</span>
                </div>
              `).join('')}
            </div>

            <h2 style="font-size: clamp(1.5rem, 2.5vw, 2rem); margin: 56px 0 24px; padding-bottom: 16px; border-bottom: 2px solid var(--color-primary); display: inline-block;">Career Outcomes</h2>
            <ul class="outcomes-list">
              ${course.outcomes.map(o => `<li>${escapeHtml(o)}</li>`).join('')}
            </ul>

            <h2 style="font-size: clamp(1.5rem, 2.5vw, 2rem); margin: 56px 0 24px; padding-bottom: 16px; border-bottom: 2px solid var(--color-primary); display: inline-block;">Frequently Asked Questions</h2>
            <div class="faq-list">
              <details class="faq-item">
                <summary>What is the duration of the ${escapeHtml(course.name)} course?</summary>
                <p>The ${escapeHtml(course.name)} (${escapeHtml(course.code)}) course at Hartron Skill Centre Hisar runs for ${escapeHtml(course.duration)}. Batch options: ${course.batchTimings.map(escapeHtml).join('; ')}.</p>
              </details>
              <details class="faq-item">
                <summary>Who is eligible for ${escapeHtml(course.code)}?</summary>
                <p>Eligibility: ${escapeHtml(course.eligibility)}. We welcome students from Hisar, Hansi, Adampur, Barwala, Uklana, Agroha, Narnaund and surrounding villages within 40 km.</p>
              </details>
              <details class="faq-item">
                <summary>What career outcomes can I expect after ${escapeHtml(course.code)}?</summary>
                <p>After completing ${escapeHtml(course.name)}, common career paths include: ${course.outcomes.map(escapeHtml).join('; ')}.</p>
              </details>
              <details class="faq-item">
                <summary>How do I enrol or get fee details?</summary>
                <p>Call <a href="tel:${SITE.phone}">${SITE.phoneDisplay}</a> or <a href="tel:${SITE.phone2}">${SITE.phone2Display}</a>, message us on WhatsApp, or visit our centre ${escapeHtml(SITE.address.street)}, ${escapeHtml(SITE.address.locality)}. Free counselling available.</p>
              </details>
              <details class="faq-item">
                <summary>Is Hartron's ${escapeHtml(course.code)} certificate recognized for government jobs?</summary>
                <p>Yes. Hartron Skill Centre is NCVET-approved and aligned with NSQF. Our CCA certificate specifically exempts holders from the SETC written test for Clerk Post. Other certificates are recognized for relevant government, banking, and private sector roles.</p>
              </details>
            </div>
          </div>

          <aside class="course-sidebar">
            <h4>Quick Enquiry</h4>
            <p><strong style="color: var(--color-text);">${escapeHtml(course.highlight)}</strong></p>

            <h4 style="margin-top: 28px;">Batch Timings</h4>
            <ul class="batch-list">
              ${course.batchTimings.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
            </ul>

            <div class="sidebar-cta">
              <a href="#" data-wa data-wa-course="${escapeHtml(course.name)}" class="btn btn-whatsapp">
                <svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
                Chat on WhatsApp
              </a>
              <a href="tel:${SITE.phone}" class="btn btn-outline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call ${SITE.phoneDisplay}
              </a>
            </div>

            <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-muted);">
              <strong style="display: block; color: var(--color-text); margin-bottom: 6px; font-size: 0.9rem;">Serving students from:</strong>
              ${NEARBY_AREAS.join(' · ')}
            </div>
          </aside>
        </div>
      </div>
    </section>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta -->
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="${escapeHtml(course.code)} course Hisar, ${escapeHtml(course.name)} Hisar, computer course Hisar, ${escapeHtml(course.name)} Haryana, Hartron Hisar, NCVET approved ${escapeHtml(course.code)}, ${NEARBY_AREAS.slice(0, 6).join(' computer course, ')} computer course">
  <meta name="author" content="${SITE.name}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${SITE.ogImage}">
  <meta property="og:site_name" content="${SITE.name}">
  <meta property="og:locale" content="en_IN">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${SITE.ogImage}">

  <!-- Fonts & styles -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Hind:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/style.css?v=20260516">
  <link rel="icon" type="image/svg+xml" href="../assets/images/favicon.svg">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">${JSON.stringify(courseSchema, null, 2)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema, null, 2)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema, null, 2)}</script>
</head>
<body>

  <header class="site-header">
    <div class="header-top">
      <div class="container">
        <div class="header-top-inner">
          <a href="../index.html" class="brand">
            <img src="../assets/images/logo.png" alt="Hartron Skill Centre Hisar" class="brand-logo">
            <span class="brand-divider"></span>
            <img src="../assets/images/logo-hartron.png" alt="HARTRON" class="brand-logo-parent">
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
            <a href="tel:${SITE.phone}" class="header-contact-item hide-md">
              <span class="header-contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </span>
              <span class="header-contact-text">
                <small>Call us</small>
                <strong>${SITE.phoneDisplay}</strong>
              </span>
            </a>
            <a href="#" data-wa class="btn btn-whatsapp">
              <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
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
            <a href="../index.html">Home</a>
            <a href="../courses.html">Courses</a>
            <a href="../about.html">About</a>
            <a href="../gallery.html">Gallery</a>
            <a href="../contact.html">Contact</a>
            <a href="../contact.html" class="btn btn-accent btn-sm nav-cta">Enquire Now</a>
          </nav>
        </div>
      </div>
    </div>
  </header>

  <main>
    ${heroBlock}
    ${bodyBlock}
  </main>

  <section style="padding-top: 0;">
    <div class="container">
      <div class="cta-block">
        <h2>Ready to Enrol in <em>${escapeHtml(course.code)}</em>?</h2>
        <p>Talk to us about fees, batch timings, and admission. Free counselling for students from Hisar, Hansi, Adampur, Barwala, Uklana, Agroha, Narnaund and surrounding villages within 40 km.</p>
        <div class="btn-group">
          <a href="#" data-wa data-wa-course="${escapeHtml(course.name)}" class="btn btn-accent btn-lg">WhatsApp Us</a>
          <a href="../contact.html" class="btn btn-outline btn-lg">Submit Enquiry Form</a>
        </div>
      </div>
    </div>
  </section>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="../index.html" class="brand">
            <span class="brand-mark">H</span>
            <span class="brand-text"><strong>HARTRON</strong><small style="color: rgba(255,255,255,0.7);">Skill Centre · Hisar</small></span>
          </a>
          <p>An NCVET-approved, NSQF-aligned computer training institute. A Haryana Government Undertaking — serving Hisar since 1999.</p>
        </div>
        <div class="footer-col"><h5>Quick Links</h5><ul><li><a href="../index.html">Home</a></li><li><a href="../courses.html">All Courses</a></li><li><a href="../about.html">About Us</a></li><li><a href="../gallery.html">Gallery</a></li><li><a href="../contact.html">Contact</a></li></ul></div>
        <div class="footer-col"><h5>Popular Courses</h5><ul><li><a href="cca.html">CCA · 12 Months</a></li><li><a href="cda.html">CDA · Accounting</a></li><li><a href="python.html">Python Programming</a></li><li><a href="cift.html">CIFT</a></li><li><a href="ccba.html">CCBA</a></li><li><a href="fc.html">Foundation Course</a></li></ul></div>
        <div class="footer-col"><h5>Get in Touch</h5><ul><li><a href="tel:${SITE.phone}">📞 ${SITE.phoneDisplay}</a></li><li><a href="tel:${SITE.phone2}">📞 ${SITE.phone2Display}</a></li><li><a href="#" data-wa>💬 WhatsApp</a></li><li style="line-height: 1.5; color: rgba(255,255,255,0.7); margin-top: 4px;">${SITE.address.street}, ${SITE.address.locality}</li></ul></div>
      </div>
            <div class="footer-social">
        <a href="https://share.google/2ALIZINPc3PBDrQ7k" target="_blank" rel="noopener noreferrer" aria-label="Google Business Profile">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        </a>
        <a href="https://www.facebook.com/hartronWorkstationHisar" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
        <a href="https://www.instagram.com/hartronhisar/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
        </a>
        <a href="https://jsdl.in/DT-992QEU66MMI" target="_blank" rel="noopener noreferrer" aria-label="Justdial">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><text x="12" y="16" font-family="Arial Black" font-size="10" font-weight="900" text-anchor="middle" fill="white">JD</text></svg>
        </a>
      </div>
      <div class="footer-bottom">
        <div>© <span id="footer-year">2026</span> ${SITE.name} · Authorised Franchisee of HARTRON</div>
        <div class="footer-recognition"><span>NCVET Approved</span><span>NSQF Aligned</span><span>Since ${SITE.founded}</span></div>
      </div>
    </div>
  </footer>

  <a href="#" data-wa data-wa-course="${escapeHtml(course.name)}" class="whatsapp-float" aria-label="Chat on WhatsApp">
    <span class="whatsapp-float-tooltip">Ask about ${escapeHtml(course.code)}</span>
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
  </a>

  <script>document.getElementById('footer-year').textContent = new Date().getFullYear();</script>
  <script src="../assets/js/main.js?v=20260516"></script>
</body>
</html>
`;
}

// === Run ===
const outDir = path.join(__dirname, 'courses');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

let count = 0;
courses.forEach(course => {
  const filepath = path.join(outDir, `${course.id}.html`);
  fs.writeFileSync(filepath, template(course), 'utf8');
  count++;
  console.log(`✓ ${course.id}.html`);
});

console.log(`\nGenerated ${count} SEO-optimized course pages in /courses/`);
