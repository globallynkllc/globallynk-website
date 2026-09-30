"""Build the GL monogram as pure SVG paths (no font needed at view time).

Geometry is measured from the business card (card logo crop, 660x764 px space):
ring centre ~(320,455) r~250, tapering at the bottom, ending in a ball at top-right;
"C" bbox x148-375 / y280-535; "L" bbox x293-520 / y420-668. The C's lower terminal
meets the L's stem, which completes the "G".
"""
import io, math, sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.varLib.instancer import instantiateVariableFont

HERE = os.path.dirname(os.path.abspath(__file__))


def glyph_path(font, ch, box):
    """SVG path for glyph `ch`, scaled/placed so its ink bbox fills `box` height at (x0, y0)."""
    gs = font.getGlyphSet()
    name = font.getBestCmap()[ord(ch)]
    bp = BoundsPen(gs); gs[name].draw(bp)
    xmin, ymin, xmax, ymax = bp.bounds
    x0, y0, h = box
    s = h / (ymax - ymin)
    sp = SVGPathPen(gs)
    # font y-up -> svg y-down
    tp = TransformPen(sp, (s, 0, 0, -s, x0 - xmin * s, y0 + ymax * s))
    gs[name].draw(tp)
    return sp.getCommands(), (xmax - xmin) * s


def ring_path():
    cx, cy = 320.0, 455.0
    a0, a1 = math.radians(95), math.radians(310)
    n = 160
    outer, inner = [], []
    for i in range(n + 1):
        t = i / n
        a = a0 + (a1 - a0) * t
        r = 236 + 74 * t - 88 * t * t
        w = (0.3 + 9.5 * math.sin(math.pi * t) ** 0.55) if t <= 0.5 else (3.6 + 6.2 * math.sin(math.pi * t) ** 0.55)
        ux, uy = math.cos(a), math.sin(a)
        outer.append((cx + (r + w / 2) * ux, cy + (r + w / 2) * uy))
        inner.append((cx + (r - w / 2) * ux, cy + (r - w / 2) * uy))
    pts = outer + inner[::-1]
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z"
    end = (cx + (222) * math.cos(a1), cy + (222) * math.sin(a1))
    return d, end


def build(font_file, weight, out, bg=None, opsz=None):
    f = TTFont(os.path.join(HERE, font_file))
    axes = {"wght": weight}
    if opsz and "fvar" in f and any(a.axisTag == "opsz" for a in f["fvar"].axes):
        axes["opsz"] = opsz
    f = instantiateVariableFont(f, axes)
    c_d, _ = glyph_path(f, "C", (148, 280, 255))
    l_d, _ = glyph_path(f, "L", (293, 420, 248))
    ring_d, (dx, dy) = ring_path()
    bgrect = f'<rect x="25" y="180" width="540" height="540" fill="{bg}"/>' if bg else ""
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="25 180 540 540" role="img" aria-label="GlobalLynk GL monogram">
  <defs>
    <linearGradient id="m" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="#F3ECDF"/>
      <stop offset="0.45" stop-color="#D2C3A8"/>
      <stop offset="0.7" stop-color="#A89478"/>
      <stop offset="1" stop-color="#E2D6C2"/>
    </linearGradient>
    <radialGradient id="b" cx="0.38" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#FBF6EC"/>
      <stop offset="0.6" stop-color="#CBBB9F"/>
      <stop offset="1" stop-color="#8F7C60"/>
    </radialGradient>
  </defs>
  {bgrect}
  <g fill="url(#m)" stroke="#7E6A4E" stroke-width="2.2" stroke-linejoin="round">
    <path d="{ring_d}" stroke-width="1.4"/>
    <path d="{c_d}"/>
    <path d="{l_d}"/>
  </g>
  <circle cx="{dx:.1f}" cy="{dy:.1f}" r="13" fill="url(#b)" stroke="#7E6A4E" stroke-width="2"/>
</svg>
'''
    open(os.path.join(HERE, out), "w", encoding="utf8").write(svg)


if __name__ == "__main__":
    # Writes ../logo-mark.svg (transparent) and ../favicon.svg (ivory rounded tile).
    # Font: Playfair Display 700 (OFL), stored beside this script.
    build("PlayfairDisplay.ttf", 700, "../logo-mark.svg")
    build("PlayfairDisplay.ttf", 700, "../favicon.svg", bg="#EFE8DD")
    fav = os.path.join(HERE, "../favicon.svg")
    s = io.open(fav, encoding="utf8").read().replace('height="540" fill="#EFE8DD"/>', 'height="540" rx="110" fill="#EFE8DD"/>')
    io.open(fav, "w", encoding="utf8").write(s)
    print("wrote logo-mark.svg and favicon.svg")
