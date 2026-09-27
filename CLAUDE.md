# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

Marketing website for **GlobalLynk LLC**, a US-registered international
general trading and ecommerce company. Plain static HTML/CSS/JS — no build
step, no framework, no backend, no package.json.

Pages (siblings in the repo root, sharing `styles.css` and `main.js`):

```
index.html     -- Home: hero globe, about, nonwoven fabric explorer, process, load planner, portfolio
products.html  -- 01 Nonwoven fabrics, 02 e-MTBs, 03 auto parts, 04 baby products (coming soon)
markets.html   -- Markets & logistics: region explorer globe, transit lookup, terms, QC
contact.html   -- 3-step quote builder (sends via mailto: or WhatsApp — nothing stored)
styles.css     -- All styles
main.js        -- All interactions (vanilla JS IIFE, no dependencies)
logo-mark.svg  -- GL monogram with orbit arc (from the business card)
favicon.svg
```

When adding a page, copy the header/footer markup from an existing page and
update the nav in **every** page's `<header>` and the footer "Explore" list.

## Company Facts (use these, don't invent new ones)

- **Legal name:** GlobalLynk LLC — motto "Linking Global Trade"
- **Registered address:** 30 N Gould St, Ste N, Sheridan, WY 82801, USA
- **Email:** globallynkllc@gmail.com · **Phone/WhatsApp:** +1 (557) 243-1736 (`wa.me/15572431736`)
- **Focus:** Nonwoven fabric is the ONLY active line — lead with it everywhere.
  Types: PP spunbond (S/SS/SSS), SMS/SMMS, meltblown, needle punched, spunlace,
  laminated, specialty treated, printed/perforated, plus finished nonwoven goods.
- **Other lines:** Electric mountain bikes and auto spare parts are "On request"
  (via Athena's network). **Baby Products** is "Coming soon" — non-food,
  non-medical only (diapers, wipes, toys, clothing, strollers, nursery gear).
  Don't call it "Baby Care". Say "product lines", not "divisions", in copy.
- **Images:** Don't copy photos from supplier/competitor sites (e.g. raysonchina.com,
  spunweb.com). Fabric visuals are CSS textures (`.tx-*` classes). Real photos
  go in only if they're GlobalLynk's own or used with written permission.
- **Sister company:** Athena General Trading (athenageneraltrading.com). Product
  content (parts categories, vehicle brands, e-MTB specs, QC process, trade
  terms) is shared with Athena. Do **not** copy Athena's Dubai-specific claims
  (Dubai/Ajman offices, Jebel Ali shipping origin, "15+ years", "40+ markets",
  "180+ ports", UAE tax advantages) onto GlobalLynk.
- **Confidential:** Do not mention specific past deals, customers, or
  destination countries tied to them (e.g. individual shipments). Keep
  market lists generic.

## Design System (styles.css :root) — based on the business card

- **Colors:** PRIMARY = champagne gold `#C4A46E` (deeper `#A8844E` for
  links/small text, `#E0C894` highlights) on ivory paper `#EFE8DD` / `#FAF7F2`,
  from the business card, plus `--metal` (brushed-gold strip: ticker, footer
  top, CTA band). SECONDARY = navy `#12233F` / `#0B1830` (token `--espresso`)
  for headings, dark sections, footer, dark buttons and the globe; steel
  `#2E4A73` as a minor accent. Taupe `#4A4238` is only for the wordmark.
  Avoid drifting back to an all-brown palette.
- **Type:** Fraunces (headings), Inter (body, and the "GlobalLynk" wordmark),
  JetBrains Mono (labels/eyebrows). Google Fonts in each page `<head>`.
- **Icons:** gold medallion circles (`.medal`, `.fact-icon`) as on the card.
- **Layout:** `.container` max 1160px. Sections: `.section`, `.section-alt`,
  `.section-dark`. Breakpoints: 980px, 800px (mobile nav), 560px.
- Floating email + WhatsApp buttons (`.float-actions`) appear on every page.
- Scroll-reveal: add `.reveal` (optional `data-delay="1..3"`).

## main.js notes

- `FABRICS` holds the home-page fabric explorer data; the lens magnifier scales a
  copy of the CSS texture. Products catalog filter uses `data-apps` on `.fab-card`.
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
