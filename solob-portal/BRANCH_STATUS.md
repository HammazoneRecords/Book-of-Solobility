# BRANCH_STATUS — solob-portal (whatissolob.com)

**App path:** `solob-portal/`
**Live domain:** `whatissolob.com`
**VPS container:** `mw-solob`
**VPS port:** `3000`
**Repo:** `https://github.com/HammazoneRecords/Book-of-Solobility`

---

## Current State

| Branch | Last Updated | Deployed? | Notes |
|---|---|---|---|
| main | 2026-06-15 | ✅ Production | SEO OG fix deployed — `55f72a1`, live at whatissolob.com |

> **Deploy repo & path:** pushes go to the `book-of-solobility` remote (`HammazoneRecords/Book-of-Solobility`), NOT origin (`ovandobrown.blog`, a diverged blog repo — do not force). VPS pulls `/opt/mw/solob-portal-repo/`; compose `solob` build context = `./solob-portal-repo/solob-portal`. Full deploy gotchas: `vps_management/docker_facts.md` → "solob-portal — Deploy Gotchas".

## Last Action

**Date:** 2026-06-15
**Branch:** main (merged from `feature/solob-seo-fixes`)
**Action:** SEO fix — per-gate + absolute OG images, tightened robots, prerender Docker fix; deployed to VPS
**What changed:**
- `src/components/PageSeo.tsx` — og:image / twitter:image now absolute URLs (relative paths break social card scrapers)
- `src/pages/seo/GatePage.tsx` — each gate uses its own glyph (was all `syla.png`); canonical lowercased
- `public/robots.txt` — `Disallow: /gates$` + `/reader`
- `scripts/prerender.js` — `--no-sandbox` so Chromium launches as root in the Docker build
- `/opt/mw/docker-compose.yml` — repointed `solob` build context to `./solob-portal-repo/solob-portal` (was building a stale copy)

**Verified:** local build + prerender, 13/13 logic checks, and live container serves absolute per-gate og:image + prerendered gate pages.
**Schema migration:** none

---

### Previous Action: 2026-04-30 — SEO infrastructure
- `src/components/PageSeo.tsx` — per-page meta tag manager
- `src/pages/seo/About.tsx` — /about page
- `src/pages/seo/GatesIndex.tsx` — /gates-overview page
- `src/pages/seo/GatePage.tsx` — /gates/:gateName (all 8 gates)
- `src/pages/seo/Glossary.tsx` — /glossary page
- `scripts/prerender.js` — Puppeteer prerender pipeline
- `public/robots.txt` + `public/sitemap.xml`
- `src/App.tsx` — 4 new unprotected routes
- `package.json` — build script: vite build && node scripts/prerender.js
- `logic-check.config.js` — 13-check automated validator (all passing)

---

## Active Feature Branches

| Branch | Purpose | Created | Status |
|---|---|---|---|
| — | No active feature branches | — | — |

## Pending Merges

- None

---

## History

| Date | Branch | Action | Notes |
|---|---|---|---|
| 2026-04-30 | main | BRANCH_STATUS.md created | — |
| 2026-04-30 | main | SEO infrastructure deployed | 13/13 logic checks passing, VPS rebuilt |
| 2026-05-02 | main | Nav border-b hotfix | Removed from 4 SEO pages, deployed to VPS |
