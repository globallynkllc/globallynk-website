"""Fabric guide pages: data + generator.

Run from the repo root:  python tools/fabrics.py
Writes nonwoven/<slug>.html for every fabric below, reusing the header and footer
from products.html. Edit the data here and re-run — don't hand-edit the output.
Specs are typical industry ranges; keep the "typical" wording unless a supplier confirms figures.
"""
import html
import io
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://globallynkllc.com"

FABRICS = [
    {
        "slug": "pp-spunbond", "key": "spunbond", "name": "PP Spunbond",
        "h1": "PP Spunbond Nonwoven Fabric",
        "title": "PP Spunbond Nonwoven Fabric Supplier | 10–200 GSM Rolls | GlobalLynk",
        "desc": "Wholesale PP spunbond nonwoven fabric in rolls: 10–200 gsm, widths up to 3.2 m, any color, with UV, hydrophilic and flame-retardant grades. Sourced from vetted mills and shipped worldwide.",
        "lede": "Polypropylene spunbond (S, SS, SSS) — the most widely used nonwoven. Strong, light, breathable and cost-effective, supplied in jumbo or slit rolls to your specification.",
        "aka": ["Non-woven fabric", "Polypropylene nonwoven", "TNT fabric", "Tela no tejida", "Friselina", "Tecido não tecido"],
        "specs": [
            ("Material", "100% polypropylene (PP)"),
            ("Structure", "S, SS or SSS spunbond (single, double or triple beam)"),
            ("Weight", "10–200 gsm (typical range)"),
            ("Width", "Up to 3.2 m full width, or slit to your width"),
            ("Color", "White, black and custom colors matched to a sample or Pantone reference"),
            ("Finish", "Plain or embossed (dot or oval pattern)"),
            ("Treatments", "Hydrophilic, UV-stabilized, anti-static, flame-retardant, antibacterial, anti-slip, super soft"),
            ("Roll", "Paper core (typically 3 in / 76 mm); roll length and diameter set per order"),
        ],
        "apps": [
            ("Shopping & promotional bags", "Reusable bags and packaging, typically 60–100 gsm."),
            ("Furniture & bedding", "Dust covers from about 20 gsm; pocket spring covers around 60–80 gsm."),
            ("Agriculture", "Crop covers and frost protection, usually 17–30 gsm with UV treatment."),
            ("Hygiene & medical", "Diaper and pad components, caps and shoe covers, often 10–25 gsm."),
            ("Tablecloths & hospitality", "Disposable tablecloths, runners and place mats, around 40–80 gsm."),
            ("Packaging & wrapping", "Protective wraps, garment covers and flower wrapping."),
        ],
        "options": [
            ("Hydrophilic", "Lets liquid pass through — for hygiene topsheets."),
            ("UV-stabilized", "Longer outdoor life for crop covers and weed control."),
            ("Flame-retardant", "For furniture and automotive uses with fire standards."),
            ("Super soft", "A gentler hand for skin-contact products."),
        ],
        "faq": [
            ("What GSM should I choose?", "It depends on the end product: light grades (10–25 gsm) for hygiene, 17–30 gsm for crop covers, 60–100 gsm for bags. Tell us what you are making and we will recommend a weight."),
            ("What is the difference between S, SS and SSS?", "The number of spinning beams used to lay the web. More beams give a more uniform, stronger fabric at the same weight — SSS is typically used where evenness matters most, such as hygiene."),
            ("Can you match a specific color?", "Yes. Send a physical sample or a Pantone reference and we will confirm the match with the mill before production."),
            ("How many rolls fit in a container?", "It depends on width, weight and roll length. Use our container load planner for an estimate, and we will confirm the exact loading with your quote."),
        ],
    },
    {
        "slug": "sms", "key": "sms", "name": "SMS / SMMS",
        "h1": "SMS & SMMS Nonwoven Fabric",
        "title": "SMS & SMMS Nonwoven Fabric Supplier | Medical Barrier Fabric | GlobalLynk",
        "desc": "SMS and SMMS polypropylene nonwoven for surgical gowns, drapes and protective wear: 15–80 gsm, blue, green or white, with anti-alcohol, anti-blood and anti-static finishes.",
        "lede": "Spunbond–meltblown–spunbond layers in one fabric: breathable, yet a barrier to fluids and bacteria. The standard material for disposable medical and protective wear.",
        "aka": ["SMS fabric", "SMMS nonwoven", "Medical nonwoven", "Tela SMS", "No tejido SMS"],
        "specs": [
            ("Material", "100% polypropylene"),
            ("Structure", "SMS, SMMS or SSMMS"),
            ("Weight", "15–80 gsm (typical range)"),
            ("Width", "Up to 3.2 m, or slit to your width"),
            ("Color", "White, blue, green or custom"),
            ("Key property", "Breathable barrier to fluids and bacteria"),
            ("Treatments", "Anti-alcohol, anti-blood and anti-static (“three-anti”); hydrophilic grades for hygiene"),
            ("Testing", "Hydrostatic head, filtration and tensile reports available on request"),
        ],
        "apps": [
            ("Surgical gowns & drapes", "Barrier fabric for operating-room disposables."),
            ("Protective & isolation wear", "Coveralls and isolation gowns."),
            ("Caps, masks & shoe covers", "Lightweight disposables for clinics and food processing."),
            ("Hygiene", "Leg cuffs and barrier layers in diapers."),
            ("Sterilization wrap", "Wrapping for instrument sterilization."),
            ("Industrial wipes", "Durable, low-lint wiping."),
        ],
        "options": [
            ("Three-anti finish", "Resists alcohol, blood and static — for medical use."),
            ("Hydrophilic SMS", "For hygiene layers that need to pass liquid."),
            ("SMMS / SSMMS", "Extra meltblown layers for a better barrier."),
            ("Custom colors", "Hospital blue and green, or matched to your brand."),
        ],
        "faq": [
            ("What is the difference between SMS and SMMS?", "SMMS has two meltblown layers instead of one, which generally gives a better barrier at a similar weight."),
            ("What weight is used for surgical gowns?", "Roughly 25–45 gsm is common, depending on the required protection level. Follow the standard your gowns must meet, and we will source fabric with matching test reports."),
            ("Can you provide test reports?", "Yes. Hydrostatic head, filtration and tensile reports from the mill or a third-party lab are available on request."),
            ("Do you supply finished gowns and drapes?", "We can source finished disposables on request. Finished medical products must meet your market's regulations; we provide the manufacturer's documentation."),
        ],
    },
    {
        "slug": "meltblown", "key": "meltblown", "name": "Meltblown",
        "h1": "Meltblown Nonwoven Fabric",
        "title": "Meltblown Nonwoven Fabric Supplier | BFE95 & BFE99 Filter Grades | GlobalLynk",
        "desc": "Meltblown polypropylene nonwoven for mask filter layers, air and liquid filtration and oil absorbents: 15–100 gsm, BFE95 and BFE99 grades, electrostatically charged.",
        "lede": "Ultra-fine microfibers blown into a dense web. The fine structure traps particles, which makes meltblown the filter layer in face masks and many air and liquid filters.",
        "aka": ["Melt-blown fabric", "Filter media", "Electret meltblown", "Tela meltblown", "Tecido meltblown"],
        "specs": [
            ("Material", "100% polypropylene"),
            ("Fiber", "Microfibers, typically about 1–5 μm in diameter"),
            ("Weight", "15–100 gsm (typical range)"),
            ("Width", "Typically up to 1.6 m, or slit rolls"),
            ("Grades", "BFE95, BFE99 and higher-efficiency filter grades"),
            ("Charging", "Electrostatic (electret) treatment for higher filtration efficiency"),
            ("Color", "White"),
            ("Testing", "Filtration efficiency and air-resistance reports on request"),
        ],
        "apps": [
            ("Face mask filter layer", "The middle, filtering layer of medical and protective masks."),
            ("Air & HVAC filters", "Filter media for air-handling and appliance filters."),
            ("Liquid filtration", "Cartridge and sheet filters."),
            ("Oil absorbents", "Spill pads and booms — heavier, untreated grades."),
            ("Insulation", "Thermal and acoustic layers."),
            ("Wipes", "As a layer in composite wiping fabrics."),
        ],
        "options": [
            ("BFE95", "Bacterial filtration efficiency of 95% or more."),
            ("BFE99", "99% or more — typical for medical masks."),
            ("Oil-absorbent grade", "Heavier, uncharged meltblown for spills."),
            ("Mask material set", "Meltblown plus the spunbond outer layers."),
        ],
        "faq": [
            ("What does BFE mean?", "Bacterial filtration efficiency: the percentage of test bacteria the fabric stops. BFE99 means at least 99%."),
            ("Which grade do I need for masks?", "Medical masks commonly use a BFE99 layer, but it depends on the standard you must meet (for example EN 14683 or ASTM F2100). Tell us the standard and we will match the grade and test reports."),
            ("Does the electrostatic charge last?", "The charge can weaken with heat, humidity and time. Store rolls sealed, cool and dry, and use them within the supplier's recommended period."),
            ("Can you supply all the fabrics for a mask?", "Yes — meltblown together with the spunbond inner and outer layers, matched in width for your machines."),
        ],
    },
    {
        "slug": "needle-punched", "key": "needle", "name": "Needle Punched",
        "h1": "Needle Punched Nonwoven & Geotextile",
        "title": "Needle Punched Nonwoven Fabric & Geotextile Supplier | GlobalLynk",
        "desc": "Needle punched nonwoven felt and geotextile in polyester or polypropylene, 80–1,000+ gsm, for road and drainage geotextiles, carpet backing, automotive interiors and padding.",
        "lede": "Staple fibers mechanically entangled by barbed needles into a dense, felt-like fabric — thick, tough and dimensionally stable.",
        "aka": ["Needle felt", "Nonwoven geotextile", "Geotextil no tejido", "Fieltro punzonado", "Manta geotêxtil"],
        "specs": [
            ("Material", "Polyester (PET) or polypropylene (PP); virgin or recycled fiber"),
            ("Weight", "80–1,000+ gsm (typical range)"),
            ("Width", "Wide widths available for geotextiles — confirmed per order"),
            ("Finish", "Plain, calendered (smooth), singed or heat-set"),
            ("Color", "White, grey, black or custom"),
            ("Testing", "Tensile, puncture (CBR) and permeability reports for geotextiles"),
        ],
        "apps": [
            ("Geotextiles", "Separation, filtration and drainage in roads, walls and landfills."),
            ("Carpet & flooring", "Backing and underlay."),
            ("Automotive interiors", "Trunk liners, headliner and floor components."),
            ("Furniture & mattresses", "Padding and insulation layers."),
            ("Industrial felt", "Filter felt, polishing and protective pads."),
            ("Landscaping", "Heavy-duty ground and pond underlay."),
        ],
        "options": [
            ("PET or PP", "PP resists chemicals; PET handles higher temperatures."),
            ("Calendered", "Smooth, dense surface for printing or lamination."),
            ("Recycled fiber", "Lower-cost, lower-footprint grades."),
            ("Custom weights", "Matched to your engineer's specification."),
        ],
        "faq": [
            ("PET or PP geotextile — which should I use?", "Polypropylene is lighter and more resistant to chemicals; polyester handles higher temperatures and long-term load better. Your project specification usually decides."),
            ("What weight is used for road separation?", "Often 150–400 gsm, depending on the design. Always follow the engineer's specification; we will source to it and supply the test reports."),
            ("Can you provide geotextile test reports?", "Yes — tensile strength, CBR puncture and permeability from the mill or a third-party lab."),
            ("Do you supply rolls for automotive use?", "Yes, to the customer's specification for weight, thickness, color and any flame-retardant requirement."),
        ],
    },
    {
        "slug": "spunlace", "key": "spunlace", "name": "Spunlace",
        "h1": "Spunlace Nonwoven Fabric",
        "title": "Spunlace Nonwoven Fabric Supplier | Wet Wipes Fabric 30–120 GSM | GlobalLynk",
        "desc": "Spunlace (hydroentangled) nonwoven in viscose/polyester blends for wet wipes, baby wipes, cosmetic pads and cleaning cloths. Plain, mesh or embossed, 30–120 gsm.",
        "lede": "High-pressure water jets entangle the fibers into a soft, strong, cloth-like fabric with no chemical binders — absorbent and gentle on skin.",
        "aka": ["Hydroentangled nonwoven", "Wipes fabric", "Tela spunlace", "No tejido spunlace", "Tecido spunlace"],
        "specs": [
            ("Material", "Viscose/polyester blends (e.g. 30/70, 50/50, 70/30), 100% polyester, viscose or cotton"),
            ("Weight", "30–120 gsm (typical range)"),
            ("Width", "Wide jumbo rolls, or slit to your converting width"),
            ("Pattern", "Plain, mesh (perforated) or embossed (e.g. pearl dot)"),
            ("Color", "White, dyed or printed"),
            ("Key property", "Soft, absorbent and binder-free"),
        ],
        "apps": [
            ("Wet wipes & baby wipes", "The base fabric for personal-care wipes."),
            ("Cosmetic pads & sheet masks", "Soft, absorbent facial products."),
            ("Household cleaning", "Kitchen cloths and cleaning wipes."),
            ("Industrial wiping", "Low-lint wipes for workshops and cleanrooms."),
            ("Medical & hygiene", "Components for hygiene and care products."),
            ("Kitchen towels", "Reusable and disposable towels."),
        ],
        "options": [
            ("Blend ratio", "More viscose = softer and more absorbent."),
            ("Mesh or embossed", "Texture for scrubbing or a premium feel."),
            ("Plastic-free", "100% viscose or cotton for biodegradable wipes."),
            ("Printed", "Patterns or branding on the fabric."),
        ],
        "faq": [
            ("Which blend is best for wet wipes?", "More viscose gives a softer, more absorbent wipe; more polyester adds strength and lowers cost. Around 40–50 gsm is common for wet wipes."),
            ("Can you supply plastic-free wipes fabric?", "Yes — 100% viscose or cotton spunlace for biodegradable wipes."),
            ("Do you supply finished wipes?", "We can source finished and packed wipes on request, under your brand."),
            ("What width should I order?", "Tell us your converting machine's width and we will supply slit rolls to match."),
        ],
    },
    {
        "slug": "laminated", "key": "laminated", "name": "Laminated",
        "h1": "Laminated Nonwoven Fabric",
        "title": "Laminated Nonwoven Fabric Supplier | PE Film & Microporous | GlobalLynk",
        "desc": "PP nonwoven laminated with PE film, breathable microporous film, BOPP or woven raffia: waterproof fabric for protective gowns, laminated bags, mattress protectors, backsheets and roofing.",
        "lede": "Nonwoven bonded to a film or woven layer for a fabric that is waterproof, tougher and printable — while keeping the soft nonwoven feel on one side.",
        "aka": ["PE laminated nonwoven", "Film-coated nonwoven", "Microporous laminate", "Tela laminada", "No tejido laminado"],
        "specs": [
            ("Base fabric", "PP spunbond or SMS"),
            ("Laminate", "PE film (waterproof), microporous film (breathable and waterproof), BOPP film (glossy, printable) or woven PP raffia (strength)"),
            ("Weight", "About 40–150 gsm total (typical range)"),
            ("Method", "Extrusion coating, hot-melt adhesive or thermal lamination"),
            ("Color & print", "Custom colors; BOPP can be printed in multiple colors"),
            ("Forms", "Rolls or sheet-cut"),
        ],
        "apps": [
            ("Protective & isolation gowns", "Fluid-proof disposable wear."),
            ("Laminated shopping bags", "Glossy printed BOPP bags."),
            ("Mattress & pillow protectors", "Waterproof, quiet covers."),
            ("Hygiene backsheets", "The outer layer of diapers and pads."),
            ("Roofing & building wrap", "Breathable membranes and underlay."),
            ("Sheet cutting", "Pre-cut sheets for converters."),
        ],
        "options": [
            ("PE film", "Fully waterproof."),
            ("Microporous film", "Waterproof but breathable."),
            ("BOPP", "Glossy, printable finish for bags."),
            ("Raffia + nonwoven", "Extra strength for heavy-duty bags."),
        ],
        "faq": [
            ("What is the difference between PE and microporous laminate?", "PE film is fully waterproof but does not breathe. Microporous film blocks liquid while letting water vapor through, so it is more comfortable to wear."),
            ("Can you print laminated bag fabric?", "Yes — BOPP laminates are commonly printed in several colors to your artwork."),
            ("Which laminate for protective gowns?", "It depends on the protection level required; microporous laminates are common for comfort. Tell us the standard and we will match test reports."),
            ("Can you supply sheets instead of rolls?", "Yes, we can supply sheet-cut fabric to your dimensions."),
        ],
    },
    {
        "slug": "specialty-treated", "key": "treated", "name": "Specialty Treated",
        "h1": "UV, Hydrophilic & Flame-Retardant Nonwoven",
        "title": "UV Treated, Hydrophilic & Flame-Retardant Nonwoven Fabric | GlobalLynk",
        "desc": "Spunbond nonwoven with functional finishes: UV-stabilized crop covers and weed control, hydrophilic hygiene topsheet, flame-retardant, anti-static, anti-slip, antibacterial and super-soft grades.",
        "lede": "Standard spunbond, finished for a specific job. Tell us where the fabric will be used and we will match the treatment.",
        "aka": ["Anti-UV nonwoven", "Frost cloth", "Manta térmica", "Weed control fabric", "Tela antimaleza", "FR nonwoven"],
        "specs": [
            ("UV-stabilized", "UV additive level set to the outdoor life you need — crop covers, frost cloth, weed barrier"),
            ("Hydrophilic", "Liquid passes through quickly — hygiene topsheets and absorbent layers"),
            ("Flame-retardant", "For furniture and automotive; tested to the standard you specify"),
            ("Anti-static", "Reduces static for electronics packaging and cleanrooms"),
            ("Anti-slip", "Dotted coating for rug backing and furniture"),
            ("Antibacterial", "Additive finish for hygiene and bedding"),
            ("Super soft", "Softer hand for skin-contact products"),
            ("Base fabric", "PP spunbond, typically 10–200 gsm"),
        ],
        "apps": [
            ("Crop & frost covers", "UV-stabilized light fabric for agriculture."),
            ("Weed control", "Heavier UV grades for landscaping."),
            ("Hygiene topsheets", "Hydrophilic, super-soft grades."),
            ("Upholstered furniture", "Flame-retardant backing and dust covers."),
            ("Electronics packaging", "Anti-static wraps and bags."),
            ("Rugs & furniture", "Anti-slip backing."),
        ],
        "options": [
            ("Combine finishes", "e.g. UV plus hydrophilic, or FR plus anti-slip."),
            ("Any weight", "Treatments available across the spunbond range."),
            ("Any color", "Black and green are common for agriculture."),
            ("Test reports", "UV, flame and absorbency tests on request."),
        ],
        "faq": [
            ("How long do UV-treated crop covers last?", "It depends on the UV additive level, weight and your climate. Tell us how many seasons you need and we will specify the stabilizer level."),
            ("Which flame-retardant standard can you meet?", "Tell us the standard your product must pass (for example a furniture fire-safety standard) and we will source fabric with matching test reports."),
            ("Can one fabric have several treatments?", "Yes — for example UV-stabilized and hydrophilic, or flame-retardant and anti-slip."),
            ("What is frost cloth (manta térmica)?", "Light UV-stabilized spunbond, often 17–30 gsm, laid over crops to protect them from frost and insects while letting light and water through."),
        ],
    },
    {
        "slug": "printed-perforated", "key": "printed", "name": "Printed & Perforated",
        "h1": "Printed & Perforated Nonwoven Fabric",
        "title": "Printed & Perforated Nonwoven Fabric | TNT Tablecloth Rolls | GlobalLynk",
        "desc": "Printed spunbond nonwoven with your pattern or logo, and perforated nonwoven rolls for disposable tablecloths, flower wrapping, branded bags and spa sheets. Rolls or pre-cut.",
        "lede": "Spunbond printed with your design, brand or pattern — or perforated for easy tear-off. The go-to fabric for disposable tableware, gift wrap and branded bags.",
        "aka": ["TNT tablecloth", "Printed non-woven", "Mantel TNT", "TNT estampado", "Perforated nonwoven roll"],
        "specs": [
            ("Base fabric", "PP spunbond, typically 25–120 gsm"),
            ("Printing", "Flexographic or rotary printing; number of colors confirmed per design"),
            ("Perforation", "Tear lines at set intervals — for tablecloth and sheet rolls"),
            ("Formats", "Rolls, pre-cut sheets or round tablecloths"),
            ("Color", "Any base color"),
            ("Artwork", "Your pattern or logo; we confirm a proof before production"),
        ],
        "apps": [
            ("Disposable tablecloths", "Rolls, pre-cut and round tablecloths for events and restaurants."),
            ("Flower & gift wrapping", "Printed and colored wrap."),
            ("Branded bags", "Your logo on promotional bags."),
            ("Place mats & runners", "Coordinated tableware."),
            ("Spa & salon sheets", "Perforated disposable bed-sheet rolls."),
            ("Decoration", "Event and seasonal decor."),
        ],
        "options": [
            ("Custom print", "Your pattern, logo or seasonal design."),
            ("Perforated rolls", "Tear off at set lengths."),
            ("Pre-cut", "Squares, rectangles or rounds."),
            ("Embossed", "Textured patterns for a premium feel."),
        ],
        "faq": [
            ("Can you print our logo?", "Yes. Send your artwork; we confirm a printed proof with you before production."),
            ("Is there a minimum for printed fabric?", "Printing needs plates set up for each design, so custom prints have a higher minimum than plain fabric. Tell us your quantity and we will confirm."),
            ("What sizes do tablecloths come in?", "Common rectangular and round sizes, or rolls perforated at the length you choose."),
            ("Can you supply finished tablecloths?", "Yes — pre-cut and packed, ready for retail or catering."),
        ],
    },
]

CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>'


def esc(s):
    return html.escape(s, quote=False)


def page(f, header, footer_and_tail):
    url = f"{SITE}/nonwoven/{f['slug']}"
    others = [o for o in FABRICS if o["slug"] != f["slug"]]
    idx = FABRICS.index(f)
    related = [FABRICS[(idx + k) % len(FABRICS)] for k in (1, 2, 3)]
    ld = [
        {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Nonwoven Fabrics", "item": SITE + "/products#nonwoven"},
            {"@type": "ListItem", "position": 3, "name": f["h1"], "item": url}]},
        {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in f["faq"]]},
    ]
    quote = "/contact?division=textile&fabric=" + f["name"].replace(" & ", " and ").replace(" / ", "/").replace(" ", "%20")

    h = header
    h = re.sub(r"<title>.*?</title>", f"<title>{esc(f['title'])}</title>", h, flags=re.S)
    h = re.sub(r'<meta name="description" content="[^"]*"', f'<meta name="description" content="{html.escape(f["desc"])}"', h)
    h = re.sub(r'<link rel="canonical" href="[^"]*"', f'<link rel="canonical" href="{url}"', h)
    h = re.sub(r'<meta property="og:title" content="[^"]*"', f'<meta property="og:title" content="{html.escape(f["h1"])} | GlobalLynk LLC"', h)
    h = re.sub(r'<meta property="og:description" content="[^"]*"', f'<meta property="og:description" content="{html.escape(f["desc"])}"', h)
    h = re.sub(r'<meta property="og:url" content="[^"]*"', f'<meta property="og:url" content="{url}"', h)
    h = h.replace("</head>", '  <script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + "</script>\n</head>", 1)

    specs = "\n".join(f"              <tr><th>{esc(k)}</th><td>{esc(v)}</td></tr>" for k, v in f["specs"])
    aka = "".join(f"<span>{esc(a)}</span>" for a in f["aka"])
    apps = "\n".join(f'          <div class="app reveal" data-n="{i+1:02d}"><h3>{esc(t)}</h3><p>{esc(d)}</p></div>' for i, (t, d) in enumerate(f["apps"]))
    opts = "\n".join(f'            <div class="type-card"><span class="mono">Option</span><h3>{esc(t)}</h3><p>{esc(d)}</p></div>' for t, d in f["options"])
    faq = "\n".join(f"              <details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for q, a in f["faq"])
    rel = "\n".join(
        f'          <a class="fab-card fab-link reveal" href="/nonwoven/{o["slug"]}"><div class="tx tx-{o["key"]}"></div>'
        f'<div class="fab-body"><span class="mono">Fabric guide</span><h3>{esc(o["h1"])}</h3><span class="view mono">Read guide →</span></div></a>'
        for o in related)
    others_links = " ".join(f'<a href="/nonwoven/{o["slug"]}">{esc(o["name"])}</a>' for o in FABRICS)

    main = f'''  <main id="main">
    <section class="page-hero">
      <div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/products#nonwoven">Nonwoven Fabrics</a><span aria-hidden="true">/</span><span aria-current="page">{esc(f["name"])}</span></nav>
        <h1>{esc(f["h1"])}</h1>
        <p>{esc(f["lede"])}</p>
        <div class="aka"><span class="mono">Also known as</span>{aka}</div>
        <div class="hero-cta" style="margin:28px 0 0">
          <a href="{quote}" class="btn btn-primary">Request pricing <span class="arrow">→</span></a>
          <a href="/products#nonwoven" class="btn btn-ghost">All nonwoven fabrics</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container split">
        <div class="reveal">
          <div class="guide-swatch tx tx-{f["key"]}" role="img" aria-label="Illustration of {esc(f["name"])} fabric texture"></div>
          <ul class="guide-points">
            <li>{CHECK}Sourced from vetted mills</li>
            <li>{CHECK}Checked before loading — weight, width and roll condition</li>
            <li>{CHECK}Full export documents; shipped worldwide</li>
          </ul>
        </div>
        <div class="reveal" data-delay="1">
          <p class="eyebrow">Typical specifications</p>
          <table class="spec-table">
{specs}
          </table>
          <p class="planner-note">Typical ranges. Exact specifications are confirmed with the mill for each order.</p>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <p class="eyebrow">Applications</p>
            <h2>What {esc(f["name"])} is used for.</h2>
          </div>
          <p class="section-lede">Tell us what you are making and we will recommend the right weight, width and finish.</p>
        </div>
        <div class="app-grid">
{apps}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container split">
        <div class="reveal">
          <p class="eyebrow">Options</p>
          <div class="type-grid">
{opts}
          </div>
          <p class="eyebrow" style="margin-top:36px">Packing &amp; shipping</p>
          <table class="spec-table">
            <tr><th>Packing</th><td>Rolls on cores, poly-wrapped and labelled; sheets in cartons</td></tr>
            <tr><th>Shipping</th><td>Full or shared containers (FCL / LCL), worldwide</td></tr>
            <tr><th>Documents</th><td>Commercial invoice, packing list, certificate of origin, bill of lading, test reports</td></tr>
            <tr><th>Loading</th><td>Estimate container fit with our <a href="/markets#planner">load planner</a></td></tr>
          </table>
        </div>
        <div class="reveal" data-delay="1">
          <p class="eyebrow">FAQ</p>
          <div class="faq">
{faq}
          </div>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <p class="eyebrow">Related fabrics</p>
            <h2>Other nonwovens we supply.</h2>
          </div>
          <p class="section-lede guide-index">{others_links}</p>
        </div>
        <div class="fab-grid related">
{rel}
        </div>
        <div class="cta-band reveal">
          <div>
            <h2>Need {esc(f["name"])} pricing?</h2>
            <p>Send the weight, width, color, treatment, quantity and destination. We will come back with pricing, lead time and a freight estimate.</p>
          </div>
          <div class="actions">
            <a href="{quote}" class="btn btn-dark">Request pricing <span class="arrow">→</span></a>
            <a href="https://wa.me/15572431736" class="btn btn-ghost" target="_blank" rel="noopener">WhatsApp us</a>
          </div>
        </div>
      </div>
    </section>
'''
    return h + main + footer_and_tail


def main():
    src = io.open(os.path.join(ROOT, "products.html"), encoding="utf8").read()
    header = src[:src.index('  <main id="main">')]
    tail = src[src.index("  </main>"):]
    # Pages live one folder down: make asset paths root-absolute.
    for a in ("styles.css", "main.js", "favicon.svg", "logo-mark.svg"):
        header = header.replace(f'"{a}"', f'"/{a}"')
        tail = tail.replace(f'"{a}"', f'"/{a}"')
    # Header nav: Products stays the current section.
    out = os.path.join(ROOT, "nonwoven")
    os.makedirs(out, exist_ok=True)
    for f in FABRICS:
        io.open(os.path.join(out, f["slug"] + ".html"), "w", encoding="utf8", newline="\n").write(page(f, header, tail))
    print("wrote", len(FABRICS), "pages")


if __name__ == "__main__":
    main()
