# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

Marketing website for **GlobalLynk LLC**, a US-registered international
general trading and ecommerce company. Plain static HTML/CSS/JS — no build
step, no framework, no backend, no package.json.

Pages (siblings in the repo root, sharing `styles.css` and `main.js`):

```
index.html     -- Home: hero globe, about, division explorer, process, load planner
products.html  -- Auto parts, e-MTBs, nonwoven textiles, baby care (coming soon)
markets.html   -- Markets & logistics: region explorer globe, transit lookup, terms, QC
contact.html   -- 3-step quote builder (sends via mailto: or WhatsApp — nothing stored)
styles.css     -- All styles
main.js        -- All interactions (vanilla JS IIFE, no dependencies)
favicon.svg
```

When adding a page, copy the header/footer markup from an existing page and
update the nav in **every** page's `<header>` and the footer "Explore" list.

## Company Facts (use these, don't invent new ones)

- **Legal name:** GlobalLynk LLC — motto "Linking Global Trade"
- **Registered address:** 30 N Gould St, Ste N, Sheridan, WY 82801, USA
- **Email:** globallynkllc@gmail.com · **Phone/WhatsApp:** +1 (557) 243-1736 (`wa.me/15572431736`)
- **Divisions:** Auto spare parts (active), electric mountain bikes (active),
  nonwoven & technical textiles — PP spunbond fabric (active), general
  merchandise sourcing (on request), baby care (coming soon).
- **Sister company:** Athena General Trading (athenageneraltrading.com). Product
  content (parts categories, vehicle brands, e-MTB specs, QC process, trade
  terms) is shared with Athena. Do **not** copy Athena's Dubai-specific claims
  (Dubai/Ajman offices, Jebel Ali shipping origin, "15+ years", "40+ markets",
  "180+ ports", UAE tax advantages) onto GlobalLynk.
- **Confidential:** Do not mention specific past deals, customers, or
  destination countries tied to them (e.g. individual shipments). Keep
  market lists generic.

## Design System (styles.css :root)

- **Colors:** navy `#12233F` / `#0B1830` / `#07101F`, steel `#2E4A73`, brass
  `#A87C3F` / `#C79A5D` / `#E2B878`, cream `#F6F3EC`, ink `#1E2530` / `#4B5566`.
- **Type:** Fraunces (headings), Inter (body), JetBrains Mono (labels/eyebrows,
  "shipping manifest" feel). All loaded from Google Fonts in each page `<head>`.
- **Layout:** `.container` max 1160px. Sections: `.section`, `.section-alt`
  (white), `.section-dark` (navy). Breakpoints: 980px, 800px (mobile nav), 560px.
- Scroll-reveal: add `.reveal` (optional `data-delay="1..3"`).

## main.js notes

- `Globe()` draws an orthographic canvas globe. Continents come from the
  simplified `LAND` polygons; ports/cities from `HUBS`. `index.html` uses the
  auto-spinning mode; `markets.html` (`data-mode="markets"`) rotates to the
  region picked in `REGIONS`.
- Transit times in `SEA` are indicative ranges only — keep the disclaimer.
- Load planner container specs are in `BOXES` (85% usable volume assumption).
- Everything must degrade gracefully and respect `prefers-reduced-motion`.

## Conventions

- No frameworks, build tools or external JS. Google Fonts is the only external dependency.
- Copy should be factual and modest; no invented stats.
- Keep semantic HTML, visible focus states and keyboard support (tabs use arrow keys).

## Local Preview

`python -m http.server 8000` in this folder, then open http://localhost:8000

## Deployment

Static files only, so any static host works. The repo is
`github.com/globallynkllc/globallynk-website`. GitHub Pages (deploy from
`main` / root) or Cloudflare Pages connected to this repo both work with
zero configuration.
