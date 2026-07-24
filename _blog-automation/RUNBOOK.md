# Weekly auto-blog — Monday runbook

This is the procedure the scheduled Monday task follows. Follow it exactly.

Repo: `D:\websites\hartron-hisar` (github.com/psinghla/hsc11, branch `main`, Vercel auto-deploys `main`).
Live site: https://hartronhisar.in

## 0. Access & credentials
1. Ensure the repo folder is connected. If not, request access to `D:\websites\hartron-hisar`.
2. Ensure git can push (the token persists in `.git/.blog-credentials`, never committed/deployed). If needed, re-run from the repo root:
   ```
   git config user.name "Hartron Blog Bot"
   git config user.email "prashantsinghla@gmail.com"
   git config credential.helper "store --file=.git/.blog-credentials"
   ```
   If `.git/.blog-credentials` is missing, STOP and ask the user for a fresh fine-grained GitHub token (Contents: read/write on hsc11), then recreate it as `https://psinghla:<TOKEN>@github.com`.

## 1. Pick the week
- Read `_blog-automation/_queue.json`.
- Choose the earliest entry with `"status": "pending"`.
- If none are pending: publish nothing. Report "content queue is empty — add more weeks/topics" and stop.
- If fewer than 2 weeks remain pending after this run, note it in the report so the user can top up the pipeline.

## 2. Write the content (this is the real work — do it well)
For EACH of the week's 2 posts:
- Read the entry's `slug`, `type`, `category`, `courses`, `workingTitle`, `angle`.
- Read `data/courses.json` and use ONLY the real `duration`, `fee`, `eligibility`, `outcomes` for the referenced course IDs. Never invent figures. Put them in `courseChecks` so the builder validates them.
- Match the house style of existing posts (`blog/cca-vs-nielit-o-level.html`): honest, local, plain-spoken, helpful; `<h2>` sections, `<p>`, one `<blockquote>`, a `post-table`, an `<ol>`, `post-note` callouts, internal links to `../courses/<id>.html` and relevant sibling posts, and exactly 4 FAQ items.
- Write BOTH an English and a Hindi version (natural Hindi, not machine-literal). Hindi slug = English slug + `-hindi`.
- **If `type` is `circular`:** first web-search the CURRENT official Haryana/HSSC notification. State only facts you can verify (post name, dates, eligibility) and link the official source. If you cannot verify a fact, leave it out. These are higher-risk — accuracy over completeness.
- Save the bilingual spec to `_blog-automation/_specs/week<N><a|b>.json` (schema below).

## 3. Build
- Evergreen post: `node _blog-automation/build-post.js _blog-automation/_specs/week<N><x>.json`
- Circular post: add `--no-wire` (it is NOT wired into the index/sitemap and NOT published yet).

## 4. Validate before publishing
Run the checks: every post's 3 JSON-LD blocks must `JSON.parse` cleanly, `<html lang>` correct, 4 hreflang tags, course figures present, and all non-`?`-suffixed internal links resolve on disk.

## 5. Publish (hybrid rule)
- **Evergreen (auto):** collect the built EN+HI html files + `blog.html` + `sitemap.xml` + `_blog-automation/_queue.json`, then:
  ```
  node _blog-automation/deploy.js --branch main \
    --message "Add week-<N> blog posts (<date>): <short titles> [EN/HI]" \
    --files "blog/<a>.html blog/<a>-hindi.html blog/<b>.html blog/<b>-hindi.html blog.html sitemap.xml _blog-automation/_queue.json"
  ```
  Vercel deploys `main`. Live URLs: `https://hartronhisar.in/blog/<slug>`.
- **Circular (needs approval):** do NOT deploy. Leave the built file(s) in `blog/`. In the report, give the file path(s) and say: "Reply 'publish the week-<N> circular' to review and push it live." When approved, wire it (`build-post.js` without `--no-wire`) and deploy as above.

## 6. Update the queue
Set the chosen week's `"status": "done"` and add `"publishedOn": "<date>"`. (It's included in the evergreen deploy file list, so it persists to GitHub.) If the week had a circular post held for approval, keep `status` `pending` for the circular only — simplest is to split: mark evergreen done, and note the pending circular separately in the report.

## 7. Report to the user (concise)
- What published, with live URLs.
- What is awaiting approval (circular), with the approve phrase.
- Whether the pipeline is running low on pending weeks.

---

## SPEC SCHEMA (bilingual)
A spec is one JSON object with shared fields plus `en` and `hi` sub-objects. Shared: `datePublished`, `dateDisplay`, `category`, `eyebrow`, `keywords`, `courseChecks` (`[{id, expect:{field:value}}]`). Each of `en`/`hi`: `slug`, `title`, `titlePlain`, `heroTitle` (may contain `<em>`), `breadcrumbName`, `metaDescription`, `schemaDescription`, `readMins`, `cardTitle`, `cardExcerpt`, `ctaHeading`, `ctaText`, `ctaPrimaryLabel`, `ctaCourseName`, `ctaSecondaryHref`, `ctaSecondaryLabel`, `bodyHtml` (the article inner HTML), `faq` (`[{q,a}]`). See `_specs/week1a.json` and `_specs/week1b.json` for complete worked examples.

The builder auto-handles: GA4, canonical, OG/Twitter, hreflang alternates, `lang` attribute, the three JSON-LD blocks, the language-switch link, the blog.html card (English only), the blog JSON-LD list (both languages), and the sitemap (both languages).
