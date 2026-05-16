/* =================================================================
   HARTRON SKILL CENTRE — Main JavaScript
   ================================================================= */

// ===== CONFIG =====
// EDIT THESE if your contact details change
const HARTRON_CONFIG = {
  whatsapp: '919215838058', // Primary WhatsApp (with country code, no +/spaces)
  whatsappAlt: '919812086917',
  phone1: '92158-38058',
  phone2: '98120-86917',
  email: 'info@hartronhisar.com', // TODO: replace with real email
  address: 'Between Nagori Gate & Bus Stand, Near Gurudwara, Hisar',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3471.5!2d75.7228!3d29.1492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zSGFydHJvbiBTa2lsbCBDZW50cmUgSGlzYXI!5e0!3m2!1sen!2sin!4v1700000000000'
};

// ===== UTILITY: WhatsApp link builder =====
function buildWhatsAppLink(message = '', number = HARTRON_CONFIG.whatsapp) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}

// ===== Default enquiry message =====
function defaultEnquiryMessage(courseName = null) {
  if (courseName) {
    return `Hello Hartron Skill Centre,

I am interested in the *${courseName}* course. Please share details about:
- Fees & batch timings
- Admission process
- Course duration

My details:
Name: 
Phone: 
City/Area: 

Thank you.`;
  }
  return `Hello Hartron Skill Centre,

I would like to enquire about your computer courses. Please share details.

My details:
Name: 
Phone: 
City/Area: 

Thank you.`;
}

// ===== Wire up all WhatsApp links =====
function initWhatsAppLinks() {
  document.querySelectorAll('[data-wa]').forEach(el => {
    const courseName = el.getAttribute('data-wa-course') || null;
    const customMsg = el.getAttribute('data-wa-message');
    const msg = customMsg || defaultEnquiryMessage(courseName);
    el.setAttribute('href', buildWhatsAppLink(msg));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });
}

// ===== Mobile nav toggle =====
function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const navRow = document.querySelector('.header-nav-row');
  const nav = document.querySelector('.nav-primary');
  if (!toggle || !navRow || !nav) return;
  toggle.addEventListener('click', () => {
    navRow.classList.toggle('is-open');
  });
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navRow.classList.remove('is-open'));
  });
}

// ===== Scroll reveal =====
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ===== Course data loading =====
let COURSES_CACHE = null;
async function loadCourses() {
  if (COURSES_CACHE) return COURSES_CACHE;
  // Resolve data path relative to root regardless of current page depth
  const isInCoursesDir = location.pathname.includes('/courses/');
  const dataPath = isInCoursesDir ? '../data/courses.json' : 'data/courses.json';
  try {
    const res = await fetch(dataPath);
    const data = await res.json();
    COURSES_CACHE = data.courses;
    return COURSES_CACHE;
  } catch (e) {
    console.error('Failed to load courses', e);
    return [];
  }
}

// ===== Category illustrations (SVG icons by course category) =====
const CATEGORY_ICONS = {
  'Flagship': `<svg viewBox="0 0 48 48" fill="none" stroke="#1A4DA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="24,5 29,18 43,19 32,28 36,42 24,34 12,42 16,28 5,19 19,18" fill="#A6224B" fill-opacity="0.15" class="accent-fill"/><circle cx="24" cy="24" r="3" fill="#1A4DA5"/></svg>`,

  'Advanced': `<svg viewBox="0 0 48 48" fill="none" stroke="#1A4DA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,38 16,28 24,32 36,16 42,20"/><polyline points="36,16 36,12 32,12"/><circle cx="16" cy="28" r="2.5" fill="#A6224B" class="accent-fill" stroke="none"/><circle cx="24" cy="32" r="2.5" fill="#A6224B" class="accent-fill" stroke="none"/></svg>`,

  'Hardware': `<svg viewBox="0 0 48 48" fill="none" stroke="#1A4DA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="12" width="24" height="24" rx="2"/><rect x="18" y="18" width="12" height="12" rx="1" fill="#A6224B" fill-opacity="0.18" class="accent-fill"/><line x1="20" y1="12" x2="20" y2="8"/><line x1="28" y1="12" x2="28" y2="8"/><line x1="20" y1="40" x2="20" y2="36"/><line x1="28" y1="40" x2="28" y2="36"/><line x1="12" y1="20" x2="8" y2="20"/><line x1="12" y1="28" x2="8" y2="28"/><line x1="40" y1="20" x2="36" y2="20"/><line x1="40" y1="28" x2="36" y2="28"/></svg>`,

  'Digital': `<svg viewBox="0 0 48 48" fill="none" stroke="#1A4DA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="16"/><path d="M8 24 H40"/><path d="M24 8 C29 14, 29 34, 24 40"/><path d="M24 8 C19 14, 19 34, 24 40"/><circle cx="24" cy="14" r="3" fill="#A6224B" class="accent-fill" stroke="none"/></svg>`,

  'Creative': `<svg viewBox="0 0 48 48" fill="none" stroke="#1A4DA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6 C12 6 6 14 6 24 C6 30 10 32 14 32 L18 32 C19 32 20 33 20 34 L20 38 C20 41 22 42 24 42 C36 42 42 32 42 22 C42 12 36 6 24 6 Z"/><circle cx="14" cy="20" r="2.5" fill="#A6224B" class="accent-fill" stroke="none"/><circle cx="20" cy="14" r="2.5" fill="#1A4DA5" stroke="none"/><circle cx="30" cy="14" r="2.5" fill="#A6224B" class="accent-fill" stroke="none"/><circle cx="34" cy="22" r="2.5" fill="#1A4DA5" stroke="none"/></svg>`,

  'Programming': `<svg viewBox="0 0 48 48" fill="none" stroke="#1A4DA5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16,16 8,24 16,32"/><polyline points="32,16 40,24 32,32"/><line x1="28" y1="12" x2="20" y2="36" stroke="#A6224B" class="accent-fill"/></svg>`,

  'Foundation': `<svg viewBox="0 0 48 48" fill="none" stroke="#1A4DA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="12" width="32" height="22" rx="2"/><line x1="4" y1="38" x2="44" y2="38"/><rect x="14" y="18" width="20" height="10" rx="1" fill="#A6224B" fill-opacity="0.18" class="accent-fill"/><circle cx="24" cy="34" r="1.5" fill="#1A4DA5" stroke="none"/></svg>`,

  'Finance': `<svg viewBox="0 0 48 48" fill="none" stroke="#1A4DA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="8" width="28" height="32" rx="3"/><line x1="16" y1="16" x2="32" y2="16"/><line x1="20" y1="22" x2="28" y2="22"/><path d="M18 22 L18 26 C18 28 19 30 22 30 L26 30 L18 38" stroke-width="2" fill="none"/><circle cx="32" cy="32" r="3" fill="#A6224B" class="accent-fill" stroke="none"/></svg>`,

  'Business': `<svg viewBox="0 0 48 48" fill="none" stroke="#1A4DA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="14" width="36" height="26" rx="2"/><path d="M18 14 L18 10 C18 9 19 8 20 8 L28 8 C29 8 30 9 30 10 L30 14"/><line x1="6" y1="24" x2="42" y2="24"/><rect x="20" y="22" width="8" height="4" fill="#A6224B" class="accent-fill" stroke="none"/></svg>`,

  'Design': `<svg viewBox="0 0 48 48" fill="none" stroke="#1A4DA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 40 L18 8 L24 12 L20 22 L34 30 L38 40 Z" fill="#A6224B" fill-opacity="0.12" class="accent-fill"/><circle cx="18" cy="8" r="2" fill="#1A4DA5" stroke="none"/><line x1="20" y1="22" x2="34" y2="30"/></svg>`,

  'Mobile': `<svg viewBox="0 0 48 48" fill="none" stroke="#1A4DA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="6" width="20" height="36" rx="3"/><line x1="22" y1="38" x2="26" y2="38"/><rect x="17" y="11" width="14" height="22" rx="1" fill="#A6224B" fill-opacity="0.15" class="accent-fill"/><circle cx="20" cy="18" r="1.5" fill="#1A4DA5" stroke="none"/><circle cx="28" cy="18" r="1.5" fill="#1A4DA5" stroke="none"/><circle cx="20" cy="24" r="1.5" fill="#A6224B" class="accent-fill" stroke="none"/><circle cx="28" cy="24" r="1.5" fill="#1A4DA5" stroke="none"/></svg>`
};

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS['Foundation'];
}

// ===== Course card renderer =====
function renderCourseCard(course, basePath = '') {
  const featured = course.featured ? 'course-card-featured' : '';
  const hasBanner = !!course.image;
  const bannerClass = hasBanner ? 'course-card-banner-wrap' : '';
  const url = `${basePath}courses/${course.id}.html`;
  const bannerHtml = hasBanner
    ? `<div class="course-card-banner" style="background-image: url('${basePath}${course.image}');"></div>`
    : '';
  return `
    <a href="${url}" class="course-card ${featured} ${bannerClass}">
      ${bannerHtml}
      <div class="course-card-inner">
      <div class="course-card-head">
        <div class="course-thumb">${getCategoryIcon(course.category)}</div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
          <span class="course-code">${course.code}</span>
          <span class="course-category">${course.category}</span>
        </div>
      </div>
      <h3 class="course-name">${course.name}</h3>
      <p class="course-tagline">${course.tagline}</p>
      <div class="course-meta">
        <span class="course-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${course.duration}
        </span>
        <span class="course-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          ${course.eligibility}
        </span>
      </div>
      <div class="course-card-link">
        View course details
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
      </div>
    </a>
  `;
}

// ===== Render featured courses on homepage =====
async function renderFeaturedCourses() {
  const container = document.querySelector('[data-featured-courses]');
  if (!container) return;
  const courses = await loadCourses();
  const featured = courses.filter(c => c.featured).slice(0, 6);
  container.innerHTML = featured.map(c => renderCourseCard(c, '')).join('');
}

// ===== Render full course grid with filters =====
async function renderAllCourses() {
  const container = document.querySelector('[data-all-courses]');
  if (!container) return;
  const courses = await loadCourses();

  // Build filter chips from unique categories
  const filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    const categories = ['All', ...new Set(courses.map(c => c.category))];
    filterBar.innerHTML = categories.map((cat, i) =>
      `<button class="filter-chip ${i === 0 ? 'active' : ''}" data-filter="${cat}">${cat}</button>`
    ).join('');

    filterBar.addEventListener('click', (e) => {
      if (!e.target.matches('.filter-chip')) return;
      filterBar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');
      const filtered = filter === 'All' ? courses : courses.filter(c => c.category === filter);
      container.innerHTML = filtered.map(c => renderCourseCard(c, '')).join('');
    });
  }

  container.innerHTML = courses.map(c => renderCourseCard(c, '')).join('');
}

// ===== Course detail page renderer =====
async function renderCourseDetail() {
  const container = document.querySelector('[data-course-detail]');
  if (!container) return;

  const courseId = container.getAttribute('data-course-id');
  const courses = await loadCourses();
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    container.innerHTML = '<p style="padding: 80px; text-align: center;">Course not found. <a href="../courses.html">View all courses</a></p>';
    return;
  }

  // Update page title and meta
  document.title = `${course.name} (${course.code}) — Hartron Skill Centre Hisar`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', `${course.name} at Hartron Skill Centre Hisar. ${course.tagline} Duration: ${course.duration}.`);

  const waLink = buildWhatsAppLink(defaultEnquiryMessage(course.name));

  container.innerHTML = `
    <section class="course-detail-hero">
      <div class="container">
        <div class="breadcrumbs" style="color: rgba(255,255,255,0.7); margin-bottom: 24px;">
          <a href="../index.html" style="color: rgba(255,255,255,0.7);">Home</a>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <a href="../courses.html" style="color: rgba(255,255,255,0.7);">Courses</a>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style="color: var(--color-white);">${course.code}</span>
        </div>
        <span class="course-code">${course.code}</span>
        <h1>${course.name}</h1>
        <p class="lede">${course.tagline}</p>
        <div class="course-detail-meta">
          <div class="course-detail-meta-item">
            <small>Duration</small>
            <strong>${course.duration}</strong>
          </div>
          <div class="course-detail-meta-item">
            <small>Eligibility</small>
            <strong>${course.eligibility}</strong>
          </div>
          <div class="course-detail-meta-item">
            <small>Category</small>
            <strong>${course.category}</strong>
          </div>
          <div class="course-detail-meta-item">
            <small>Fees</small>
            <strong>${course.fee}</strong>
          </div>
        </div>
        <div class="course-detail-actions">
          <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-accent btn-lg">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
            Enquire on WhatsApp
          </a>
          <a href="../contact.html" class="btn btn-outline btn-lg" style="background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.3);">
            Submit enquiry form
          </a>
        </div>
      </div>
    </section>

    <section>
      <div class="container">
        <div class="course-body">
          <div class="course-body-main">
            <h3>What you will learn</h3>
            <div class="curriculum-grid">
              ${course.curriculum.map((item, i) => `
                <div class="curriculum-item">
                  <span class="curriculum-number">${i + 1}</span>
                  <span>${item}</span>
                </div>
              `).join('')}
            </div>

            <h3>Career outcomes</h3>
            <ul class="outcomes-list">
              ${course.outcomes.map(o => `<li>${o}</li>`).join('')}
            </ul>
          </div>

          <aside class="course-sidebar">
            <h4>Quick enquiry</h4>
            <p><strong style="color: var(--color-text);">${course.highlight}</strong></p>

            <h4 style="margin-top: 28px;">Batch timings</h4>
            <ul class="batch-list">
              ${course.batchTimings.map(t => `<li>${t}</li>`).join('')}
            </ul>

            <div class="sidebar-cta">
              <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-whatsapp">
                <svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
                Chat on WhatsApp
              </a>
              <a href="tel:+91${HARTRON_CONFIG.whatsapp.substring(2)}" class="btn btn-outline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call ${HARTRON_CONFIG.phone1}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  `;
}

// ===== Enquiry form -> WhatsApp redirect =====
function initEnquiryForm() {
  const form = document.querySelector('[data-enquiry-form]');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name')?.trim();
    const phone = data.get('phone')?.trim();
    const course = data.get('course')?.trim();
    const message = data.get('message')?.trim();
    const city = data.get('city')?.trim();

    if (!name || !phone) {
      alert('Please enter your name and phone number.');
      return;
    }

    const waMessage = `Hello Hartron Skill Centre,

I would like to enquire about a course.

*Name:* ${name}
*Phone:* ${phone}
*City/Area:* ${city || 'Hisar'}
*Course of interest:* ${course || 'Not specified'}

*Message:*
${message || 'Please share course details, fees and batch timings.'}

Thank you.`;

    const link = buildWhatsAppLink(waMessage);
    window.open(link, '_blank');

    // Optional: show success message
    const success = document.querySelector('[data-form-success]');
    if (success) {
      success.style.display = 'block';
      form.reset();
      setTimeout(() => { success.style.display = 'none'; }, 6000);
    }
  });

  // Populate course dropdown if present
  const courseSelect = form.querySelector('select[name="course"]');
  if (courseSelect) {
    loadCourses().then(courses => {
      const opts = courses.map(c => `<option value="${c.name}">${c.code} — ${c.name}</option>`).join('');
      courseSelect.insertAdjacentHTML('beforeend', opts);
    });
  }
}

// ===== Set active nav link =====
function setActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-primary a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppLinks();
  initMobileNav();
  initScrollReveal();
  setActiveNav();
  renderFeaturedCourses();
  renderAllCourses();
  renderCourseDetail();
  initEnquiryForm();

  // Re-run WhatsApp link wiring after dynamic content renders
  setTimeout(() => initWhatsAppLinks(), 300);
});
