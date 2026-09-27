# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

Marketing website for **GlobalLynk LLC**, a US-registered international
general trading and ecommerce company. Plain static HTML/CSS/JS — no build
step, no framework, no backend, no package.json.

Pages (siblings in the repo root, sharing `styles.css` and `main.js`):

```
index.html     -- Home: hero globe, ticker, "What we trade" cards, Why GlobalLynk (6), CTA
about.html     -- Who we are, Meet the team, How it works
products.html  -- 01 Nonwoven (fabric explorer + application catalog), 02 e-MTBs, 03 auto parts, 04 baby
markets.html   -- Region explorer globe, transit lookup, container load planner, terms, QC
contact.html   -- 3-step quote builder (sends via mailto: or WhatsApp — nothing stored)
styles.css     -- All styles
main.js        -- All interactions (vanilla JS IIFE, no dependencies)
serve.py       -- Local preview server with clean URLs (python serve.py 8000)
logo-mark.svg  -- GL monogram with orbit arc (from the business card)
favicon.svg
CNAME          -- custom domain for GitHub Pages; don't delete
```

**Clean URLs:** link internally as `/`, `/products`, `/about#team`, `/contact?division=textile`
— never `something.html`. GitHub Pages serves `/products` from `products.html`.
Local preview must use `python serve.py` (plain `http.server` can't resolve clean URLs).

**Nav:** each page has the same `<nav class="site-nav">` with dropdowns (`.nav-item` >
`.nav-link` + `.nav-caret` + `.dropdown`); only `aria-current` differs. When adding a page,
update the nav and the footer "Explore" list in **every** page.

## Company Facts (use these, don't invent new ones)

- **Legal name:** GlobalLynk LLC — motto "Linking Global Trade"
- **Registered address:** 30 N Gould St, Ste N, Sheridan, WY 82801, USA
- **Team:** Jyoti Adkuloo — Founder; Dheeraj Adkuloo — Managing Director
  ("Meet the team" in the About section of index.html; initials medallions until photos arrive).
- **Email:** globallynkllc@gmail.com · **Phone/WhatsApp:** +1 (557) 243-1736 (`wa.me/15572431736`)
- **Business model:** GlobalLynk does NOT manufacture or produce anything. It sources
  from suppliers and ships to buyers. Never write "we produce", "our mill", "made by us", etc.
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
- **Contrast:** `--gold` (#7E5F2D) is the text-safe gold (4.5:1 on ivory) — use it for any
  gold TEXT. `--gold-mid` / `--gold-light` / `--gold-glow` are for borders, fills and
  large decorative marks only. White text on navy should be at least .62 opacity.
- **Primary buttons (`.btn-primary`):** navy with gold text on light backgrounds; gold with
  navy text inside navy areas (`.section-dark`, `.fx-panel`, `.reg-card`, `.gsm`, footer).
  Add new dark containers to that selector list in styles.css.
- **Names/people:** set in Inter 600 (`.person h3`), not Fraunces.
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

**Live:** https://globallynkllc.com — GitHub Pages with a custom domain, deployed
automatically from `main` (repo root) on every push (~1 minute). The `CNAME` file
in the repo root holds the domain; don't delete it. Old URL
globallynkllc.github.io/globallynk-website redirects here.

DNS is managed at the registered agent (nameservers NS1/NS2.HOSTING.BUSINESSIDENTITY.LLC):
- `@` A → 185.199.108.153 (GitHub Pages; .109/.110/.111 can be added as backups)
- `www` CNAME → globallynkllc.github.io
- Keep MX, TXT (SPF/DKIM/DMARC/_acme-challenge), `mail` and `*` records — they run email.

Repo: `github.com/globallynkllc/globallynk-website` (public — required for free Pages).
