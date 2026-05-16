# Hartron Skill Centre, Hisar — Website

Production-ready static site for **Hartron Skill Centre, Hisar** — a Govt. of Haryana franchisee NCVET-approved computer education centre, serving Hisar since 1999.

---

## Quick Start

### Local preview
Open `index.html` in a browser — works directly from the filesystem for most pages. For the courses/* pages to load the JSON via `fetch()`, run a local server:

```cmd
:: Windows Command Prompt — option A: Python
cd path\to\hartron
python -m http.server 8000

:: Or option B: Node.js (if you have it)
npx serve .
```

Then visit `http://localhost:8000`.

### Deploy to Vercel
Same flow as LUMOS:

```cmd
:: Install once
npm install -g vercel

:: From this folder
cd path\to\hartron
vercel

:: Or just drag-drop this folder to vercel.com
```

The `vercel.json` is already configured (clean URLs, caching, security headers).

---

## Editing content

### Course fees & batch timings
**Everything is in one file:** `data/courses.json`

Each course has `fee` and `batchTimings` fields. Update them and every page (homepage, courses listing, individual course detail, contact form dropdown) reflects the change. No HTML editing needed.

```json
{
  "id": "cca",
  "fee": "₹X,XXX (instead of 'Contact for fees')",
  "batchTimings": ["Morning: 9:00 AM – 11:00 AM", "Evening: 5:00 PM – 7:00 PM"]
}
```

### Adding photos

Drop files into `assets/images/` with these exact names:

| File | Used on |
|---|---|
| `head.jpg` | Homepage + About (Bhupender Singla photo) |
| `gallery-01.jpg` … `gallery-08.jpg` | Gallery page |

Missing photos gracefully fall back to gradient placeholder tiles.

### Contact details

Edit `assets/js/main.js` — top of the file has a `HARTRON_CONFIG` object:

```js
const HARTRON_CONFIG = {
  whatsapp: '919215838058',       // Primary WhatsApp (no + or spaces)
  whatsappAlt: '919812086917',
  phone1: '92158-38058',
  phone2: '98120-86917',
  email: 'info@hartronhisar.com', // TODO: replace with real email
  address: '...',
  mapEmbedUrl: '...'              // Replace with real Google Maps embed URL
};
```

### Google Maps embed
On `contact.html`, the iframe currently uses a generic Google Maps search for "Grover Market Hisar". For a pinpoint location:
1. Go to Google Maps → find Hartron Skill Centre Hisar
2. Click Share → Embed a map → COPY HTML
3. Replace the `<iframe>` `src` in `contact.html`

---

## File structure

```
hartron/
├── index.html              ← Homepage
├── courses.html            ← All courses listing
├── about.html              ← About / Head's message
├── gallery.html            ← Photo gallery
├── contact.html            ← Contact + enquiry form
├── courses/                ← 20 individual course pages
│   ├── cca.html
│   ├── cda.html
│   └── ... (18 more)
├── data/
│   └── courses.json        ← ★ Single source of truth for all course data
├── assets/
│   ├── css/style.css       ← All styles
│   ├── js/main.js          ← All JS + HARTRON_CONFIG
│   └── images/             ← Drop your photos here
├── generate-course-pages.js ← Regenerate course pages if courses.json structure changes
├── vercel.json             ← Deployment config
└── README.md
```

---

## Form submissions → WhatsApp

The enquiry form on `contact.html` opens WhatsApp with prefilled student details. No backend needed, no spam, no leads getting lost in email.

Default WhatsApp target: `919215838058` (Primary). Change in `HARTRON_CONFIG`.

---

## What still needs filling in (TODOs)

These are the items you marked as ready-to-provide but haven't shared yet — drop them in:

- [ ] **Course fees** — edit `data/courses.json`, replace `"Contact for fees"` per course
- [ ] **Batch timings** — same file, `batchTimings` array per course
- [ ] **Centre photos** — drop into `assets/images/` (see filenames above)
- [ ] **Bhupender Singla photo** — `assets/images/head.jpg`
- [ ] **Real email address** — edit `HARTRON_CONFIG` in `main.js`
- [ ] **Google Maps embed URL** — see contact.html section above
- [ ] **Domain** — once decided, add to Vercel project settings

---

## Tech notes

- **No build step.** Pure HTML/CSS/JS. Edit and refresh.
- **Course pages are templated.** All 20 course detail pages share the same shell — content renders client-side from `courses.json` via `main.js`. If you ever need to change the page structure, edit `generate-course-pages.js` once and rerun: `node generate-course-pages.js`.
- **Fonts:** Fraunces (display), Manrope (body), Hind (Devanagari) — all from Google Fonts, with `preconnect` for fast load.
- **WhatsApp deep links** use `wa.me/<number>?text=<encoded-message>` so prefilled messages work on every device.
- **Floating WhatsApp button** is on every page, course-aware on detail pages (knows which course the visitor was viewing).

---

## Browser support

Modern browsers (Chrome, Edge, Firefox, Safari, Samsung Internet). Mobile-first responsive. Tested down to 320px.

---

## License

Site code: free for Hartron Skill Centre Hisar's use.
Logo, brand name "HARTRON", and brochure content: property of Hartron Skill Centre / HARTRON (Haryana State Electronics Development Corporation Limited).
