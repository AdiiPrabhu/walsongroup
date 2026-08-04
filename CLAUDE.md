# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A hand-written static marketing site for Walson Group (an Indian food/agri company), deployed on Vercel. Six pages, one stylesheet, one script. **There is no build system, no package.json, no framework, and no dependencies** — do not reach for npm, a bundler, or a static-site generator. Edit the HTML directly.

## Commands

```bash
# Local preview (see the clean-URL caveat below — nav links will 404)
python3 -m http.server 8000 --directory .

# Accurate local preview, matching production routing
vercel dev

# Deploy (this is a production push; the repo has no preview workflow in use)
vercel --prod --yes
```

Deploys go to the Vercel project `walson` under the `adii-s-projects1` team. Git remote is `AdiiPrabhu/walsongroup`; `main` is the only branch. There are no tests, linters, or CI.

## Clean URLs — the main local-dev trap

`vercel.json` sets `cleanUrls: true`, and every internal link in the markup is written extension-less (`href="/about"`, not `/about.html"`). Vercel resolves these; a plain static server does not.

So under `python3 -m http.server`, **every nav link 404s** while the page itself renders fine. This looks like broken navigation but is purely a local artifact. Use `vercel dev` when routing matters, or hit `/about.html` directly when you only need to eyeball one page. Keep writing new links extension-less.

## Architecture

**Six independent HTML files with no templating.** `index`, `about`, `products`, `farming`, `processing`, `contact`. The header/nav, footer, footer tagline, and certification strip are **copy-pasted into each file**. Any change to the nav, footer, phone number, or tagline must be applied to all six files — grep for the string and fix every hit, then verify the count. This duplication is the single biggest source of missed edits in this repo.

Each page marks its own nav item with `class="active"`.

`styles.css` (~370 lines) is the entire design system: CSS custom properties in `:root` (navy/red brand colours, spacing, shadow, radius), then section-commented blocks matching the page furniture (header, hero, cert strip, grid/cards, compliance, footer, reveal animation, responsive). Two breakpoints only: 900px and 560px.

`app.js` is a single IIFE with no dependencies: current-year stamp, mobile nav toggle, and an IntersectionObserver scroll-reveal that adds `.reveal`/`.in` to `.section-head, .card, .stat, .strength` with a per-grid stagger. It respects `prefers-reduced-motion` and degrades to instantly-visible when IntersectionObserver is absent.

**The contact form is client-side only.** `#contactForm` validates and prints a thank-you message, then resets. Nothing is submitted anywhere — there is no backend, no email, no form service. Do not describe it to the user as working intake without saying this.

### CSS gotcha already fixed — don't regress it

`.section-alt .card` (specificity 0-2-0) sets a white background and will override `.card-accent` (0-1-0). The accent rule is deliberately written as `.card-accent, .section-alt .card-accent` to win. If you add variants that must survive inside `.section-alt`, match that specificity or they will silently render white-on-white.

## Content and brand conventions

These are established decisions, not preferences — breaking them will read as a regression.

- **Four divisions**: Walson NutriFoods, Walson Epicure, Walson Agro, Walson Global. A fifth, "Indo Global Agro Processing", was removed and its content merged into Epicure. If that name reappears anywhere, it is a mistake.
- **Division → page mapping**: NutriFoods is `/farming`, Epicure is `/processing`. **Agro and Global have no pages** — they exist only as cards on About. Their write-ups therefore have nowhere to live beyond that.
- **Brand spelling is `NutriFoods`** with a capital F, everywhere including titles and meta descriptions.
- **No em dashes in site copy.** All 60 were deliberately removed and reworded in context (periods for independent clauses, colons for elaborations, commas for phrases). Do not reintroduce them, and do not "fix" the replacements back to dashes. The only intentional exceptions are the two occurrences of the same client-supplied NutriFoods paragraph, which appears on both About and Farming — so `grep -o "—" *.html | wc -l` should return exactly 2.
- **Separators**: title tags use `|` (`About | Walson Group`); the footer lockup and eyebrows use `·`.
- **Client-supplied copy is verbatim.** The four division write-ups came from the client (Rohan) and must not be reworded without being asked. Only mechanical fixes have been applied (a missing terminal full stop, spacing an em dash to house style).
- Certification strip is ISO 22000, HACCP, BRC, FDA, **FSSAI** — five marks. Processing has a dedicated full compliance section instead of the thin strip.

## Images

`images/` holds all photography; `logo.png` sits at the root. Full-bleed heroes and bands (`.page-hero img`, `.band-media`) paint at 1440px+ on desktop, so **sources below ~1400px wide visibly blur** — this has already drawn one client complaint. Check `sips -g pixelWidth` before using a new photo in a hero, and recompress large files (PIL at quality ~82) to land near 350–400KB, matching the existing full-bleed images.

Watch for the same photo repeating across pages; the farmer shot was previously on three pages and had to be split out.

## Verifying a deploy

`walson.vercel.app` is the reliable URL. The custom domain `walsongroup.in` is aliased correctly on Vercel but has been serving the registrar's suspension page — if it looks wrong, check `dig +short NS walsongroup.in` before assuming a deploy problem.

When verifying live content, **fetch each page once** and run multiple greps against that single response. Rapid sequential `curl` calls get throttled and return empty bodies, which reads as missing content and will send you chasing a bug that isn't there. Note also that Hostinger's suspension page returns HTTP 200 on every path, so status codes alone never prove the site is up — check the `<title>`.
