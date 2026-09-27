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
nonwoven/*.html -- 8 fabric guide pages (/nonwoven/pp-spunbond etc.) — GENERATED, don't hand-edit
tools/fabrics.py -- fabric page data + generator: edit data there, then `python tools/fabrics.py`
                  (re-run after changing header/footer in products.html too)
og-image.png   -- 1200x630 link-preview image (WhatsApp/LinkedIn); logo-512.png -- logo for Google
serve.py       -- Local preview server with clean URLs (python serve.py 8000)
logo-mark.svg  -- GL monogram with orbit arc (from the business card)
favicon.svg
CNAME          -- custom domain for GitHub Pages; don't delete
sitemap.xml    -- list of page URLs for Google (update when adding a page; bump <lastmod> on big changes)
robots.txt     -- allows all crawlers, points to the sitemap
```

**Clean URLs:** link internally as `/`, `/products`, `/about#team`, `/contact?division=textile`
— never `something.html`. GitHub Pages serves `/products` from `products.html`.
Local preview must use `python serve.py` (plain `http.server` can't resolve clean URLs).

**SEO:** titles/descriptions use buyer search terms ("nonwoven fabric supplier", fabric names).
Fabric pages list other-language names (tela no tejida, TNT, friselina, manta térmica…) under
"Also known as" — keep those accurate. index.html has Organization JSON-LD; fabric pages have
BreadcrumbList + FAQPage JSON-LD. Every page has Open Graph tags pointing at og-image.png.
Each page has `<link rel="canonical">` with its clean URL. A new page needs one, plus a
sitemap.xml entry. The domain is verified in Google Search Console (TXT record at the registrar).

**Nav:** each page has the same `<nav class="site-nav">` with dropdowns (`.nav-item` >
`.nav-link` + `.nav-caret` + `.dropdown`); only `aria-current` differs. When adding a page,
update the nav and the footer "Explore" list in **every** page.

## Company Facts (use these, don't invent new ones)

- **Legal name:** GlobalLynk LLC — motto "Linking Global Trade"
- **Registered address:** 30 N Gould St, Ste N, Sheridan, WY 82801, USA
- **Team:** Jyoti Adkuloo — Founder; Dheeraj Adkuloo — Managing Director
  ("Meet the team" on about.html; gold initials medallions until headshots arrive; role shown
  as plain text under the name; LinkedIn buttons). Bios are placeholder wording — replace when
  the user sends real ones. (The printed business card wrongly lists Jyoti as MD; the site is right.)
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
- **Confidential:** Do not describe specific past deals, customers or shipments. The user
  chose to have the home hero rotator start with "Colombia, Dubai" as destination words —
  that's fine, but never say what was shipped there or to whom. Colombia is intentionally
  NOT in the Latin America list in main.js `REGIONS` (user hasn't decided).
- **Settled decisions — don't re-propose:** keep the name "Markets & Logistics"; keep all
  6 "Why GlobalLynk" cards on the home page; navy primary buttons (see Design System).

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

- `FABRICS` holds the fabric explorer data (Products > Nonwoven); `g` is the guide-page slug.
  The lens magnifier scales a copy of the CSS texture. Catalog cards (`.fab-card[data-fab]`)
  open their fabric in the explorer; the application filter uses `data-apps`. Keep `FABRICS`
  consistent with `tools/fabrics.py` when editing specs.
- Dropdown nav: `.nav-caret` toggles `.open`; hover/focus opens on desktop; Escape closes.
- Quote builder (contact.html) reads `?division=auto|bike|textile|baby|other` and
  `?fabric=<name>` (pre-fills the description). It sends via mailto:/WhatsApp only.
- JS strings: never put a literal line break inside a quoted string — use the `\n` escape.
  A syntax error anywhere in main.js silently kills every interactive feature on every page.
  (Beware Python heredocs that write JS: `"\n"` in Python becomes a real line break.)
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

`python serve.py 8000` in this folder, then open http://localhost:8000
(plain `python -m http.server` breaks the clean URLs).

## Testing before every push

1. **Links:** regex over every `href="/page#id"` in `*.html` and `nonwoven/*.html`; confirm each
   page file exists and each `#id` exists in it.
2. **Script ran:** load each page in headless Chrome and confirm `<html>` no longer has the
   `no-js` class; also `new Function(mainJsText)` to catch syntax errors.
3. **Contrast & overflow:** iframe harness at 1400px and 390px computing WCAG ratios
   (4.5:1 body, 3:1 large). Gradient-background buttons are false positives — skip them.
4. **Visual:** headless Chrome screenshots
   (`"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --screenshot=...`),
   with `--force-prefers-reduced-motion` so scroll-reveal content isn't caught mid-fade; wrap
   in a 390px iframe for mobile.
5. After pushing, poll the live URL until the change is served, then re-check it.

## Working with the owner

- Not a developer: explain in plain words; show before/after screenshots (inject proposed CSS
  into an iframe preview — don't edit the site) before visual changes, and wait for a choice.
- Ask before deleting anything. Never touch `D:\Global Data\Wesbite\Archive`.
- Commit and push after each approved change (site auto-deploys). Commit trailer:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Keep temporary files in the session scratchpad and delete them when done.

## Open items (waiting on the owner)

- Real bios + square headshots for Jyoti and Dheeraj.
- Which fabrics they trade most and real supplied specs (replace "typical" ranges).
- Sanity-check transit-time ranges (`SEA` in main.js).
- Whether to add Colombia to the Latin America country list.

## Deployment

**Live:** https://globallynkllc.com — GitHub Pages with a custom domain, deployed
automatically from `main` (repo root) on every push (~1 minute). The `CNAME` file
in the repo root holds the domain; don't delete it. Old URL
globallynkllc.github.io/globallynk-website redirects here.

HTTPS: certificate issued by GitHub (auto-renews); "Enforce HTTPS" is on. If a cert ever
stalls in "pending", remove and re-add the custom domain in Pages settings to retrigger.

DNS is managed at the registered agent's portal (nameservers NS1/NS2.HOSTING.BUSINESSIDENTITY.LLC):
- `@` A → 185.199.108.153, .109.153, .110.153, .111.153 (GitHub Pages)
- `www` CNAME → `globallynkllc.github.io.` (the portal requires the trailing dot)
- TXT `google-site-verification=…` — Google Search Console domain verification; keep it.
- Keep MX, SPF/DKIM/DMARC TXT, `_acme-challenge`, `mail` and `*` records — they run email.

Google Search Console: domain property verified; sitemap submitted as the full URL
`https://globallynkllc.com/sitemap.xml` (the box rejects a bare `sitemap.xml` for domain
properties). Home, Products and PP Spunbond were submitted for indexing on 2026-09-27.

GitHub: account `globallynkllc`; `gh` CLI installed via winget (Bash: add
`/c/Program Files/GitHub CLI` to PATH).

Repo: `github.com/globallynkllc/globallynk-website` (public — required for free Pages).
