/* GlobalLynk LLC — site interactions. Plain JS, no dependencies. */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Toast ---------- */
  var toastEl = $(".toast"), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------- Header, progress bar, mobile nav ---------- */
  var header = $(".site-header"), progress = $(".progress");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 20);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = $(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$(".site-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Dropdown menus ---------- */
  var navItems = $$(".nav-item");
  function closeMenus(except) {
    navItems.forEach(function (it) {
      if (it === except) return;
      it.classList.remove("open");
      $(".nav-caret", it).setAttribute("aria-expanded", "false");
    });
  }
  navItems.forEach(function (it) {
    var caret = $(".nav-caret", it);
    caret.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !it.classList.contains("open");
      closeMenus(it);
      it.classList.toggle("open", open);
      caret.setAttribute("aria-expanded", open);
    });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".nav-item")) closeMenus(); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openItem = $(".nav-item.open");
    closeMenus();
    if (openItem) $(".nav-caret", openItem).focus();
  });

  /* ---------- Reveal on scroll ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal, [data-process]").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal, [data-process]").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Hero word rotator ---------- */
  var rot = $(".rotator");
  if (rot && !reduceMotion) {
    var words = rot.getAttribute("data-words").split("|"), wi = 0;
    setInterval(function () {
      wi = (wi + 1) % words.length;
      rot.innerHTML = '<span class="word">' + words[wi] + "</span>";
    }, 2400);
  }

  /* ---------- Cursor glow on cards ---------- */
  $$(".why-card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- Copy buttons ---------- */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () { toast("Copied " + text); });
      }
    });
  });

  /* =====================================================================
     Globe — orthographic canvas globe with animated trade routes
     ===================================================================== */
  var HUBS = {
    sheridan:  { n: "Sheridan, WY", lat: 44.80, lon: -106.96, r: "hq" },
    la:        { n: "Los Angeles", lat: 33.74, lon: -118.27, r: "na" },
    houston:   { n: "Houston", lat: 29.73, lon: -95.27, r: "na" },
    newyork:   { n: "New York", lat: 40.68, lon: -74.04, r: "na" },
    miami:     { n: "Miami", lat: 25.77, lon: -80.17, r: "na" },
    vancouver: { n: "Vancouver", lat: 49.29, lon: -123.11, r: "na" },
    manzanillo:{ n: "Manzanillo", lat: 19.05, lon: -104.31, r: "la" },
    colon:     { n: "Colón", lat: 9.36, lon: -79.90, r: "la" },
    kingston:  { n: "Kingston", lat: 17.97, lon: -76.79, r: "la" },
    callao:    { n: "Callao", lat: -12.05, lon: -77.15, r: "la" },
    guayaquil: { n: "Guayaquil", lat: -2.20, lon: -79.90, r: "la" },
    santos:    { n: "Santos", lat: -23.96, lon: -46.33, r: "la" },
    sanantonio:{ n: "San Antonio", lat: -33.59, lon: -71.61, r: "la" },
    buenos:    { n: "Buenos Aires", lat: -34.60, lon: -58.37, r: "la" },
    rotterdam: { n: "Rotterdam", lat: 51.95, lon: 4.14, r: "eu" },
    hamburg:   { n: "Hamburg", lat: 53.54, lon: 9.97, r: "eu" },
    felixstowe:{ n: "Felixstowe", lat: 51.96, lon: 1.35, r: "eu" },
    valencia:  { n: "Valencia", lat: 39.45, lon: -0.32, r: "eu" },
    istanbul:  { n: "Istanbul", lat: 41.00, lon: 28.97, r: "eu" },
    jebelali:  { n: "Jebel Ali", lat: 25.01, lon: 55.06, r: "me" },
    jeddah:    { n: "Jeddah", lat: 21.48, lon: 39.18, r: "me" },
    dammam:    { n: "Dammam", lat: 26.43, lon: 50.10, r: "me" },
    sohar:     { n: "Sohar", lat: 24.36, lon: 56.75, r: "me" },
    kuwait:    { n: "Kuwait", lat: 29.37, lon: 47.98, r: "me" },
    lagos:     { n: "Lagos", lat: 6.45, lon: 3.39, r: "af" },
    tema:      { n: "Tema", lat: 5.63, lon: 0.01, r: "af" },
    dakar:     { n: "Dakar", lat: 14.68, lon: -17.43, r: "af" },
    mombasa:   { n: "Mombasa", lat: -4.04, lon: 39.67, r: "af" },
    dar:       { n: "Dar es Salaam", lat: -6.82, lon: 39.29, r: "af" },
    durban:    { n: "Durban", lat: -29.87, lon: 31.03, r: "af" },
    portsaid:  { n: "Port Said", lat: 31.26, lon: 32.30, r: "af" },
    casablanca:{ n: "Casablanca", lat: 33.60, lon: -7.62, r: "af" },
    almaty:    { n: "Almaty", lat: 43.24, lon: 76.89, r: "cis" },
    tashkent:  { n: "Tashkent", lat: 41.30, lon: 69.24, r: "cis" },
    poti:      { n: "Poti", lat: 42.15, lon: 41.67, r: "cis" },
    baku:      { n: "Baku", lat: 40.41, lon: 49.87, r: "cis" },
    nhava:     { n: "Nhava Sheva", lat: 18.95, lon: 72.95, r: "sa" },
    karachi:   { n: "Karachi", lat: 24.84, lon: 66.98, r: "sa" },
    chittagong:{ n: "Chattogram", lat: 22.33, lon: 91.80, r: "sa" },
    colombo:   { n: "Colombo", lat: 6.94, lon: 79.84, r: "sa" },
    singapore: { n: "Singapore", lat: 1.26, lon: 103.84, r: "sa" },
    jakarta:   { n: "Jakarta", lat: -6.10, lon: 106.88, r: "sa" },
    hcmc:      { n: "Ho Chi Minh City", lat: 10.77, lon: 106.70, r: "sa" },
    manila:    { n: "Manila", lat: 14.59, lon: 120.97, r: "sa" },
    sydney:    { n: "Sydney", lat: -33.86, lon: 151.20, r: "oc" },
    melbourne: { n: "Melbourne", lat: -37.84, lon: 144.90, r: "oc" },
    auckland:  { n: "Auckland", lat: -36.84, lon: 174.77, r: "oc" },
    shanghai:  { n: "Shanghai", lat: 31.23, lon: 121.47, r: "src" },
    ningbo:    { n: "Ningbo", lat: 29.87, lon: 121.55, r: "src" },
    shenzhen:  { n: "Shenzhen", lat: 22.54, lon: 114.06, r: "src" },
    qingdao:   { n: "Qingdao", lat: 36.07, lon: 120.38, r: "src" },
    busan:     { n: "Busan", lat: 35.10, lon: 129.04, r: "src" },
    yokohama:  { n: "Yokohama", lat: 35.44, lon: 139.64, r: "src" },
    kaohsiung: { n: "Kaohsiung", lat: 22.61, lon: 120.28, r: "src" }
  };

  var HERO_ROUTES = [
    ["shanghai", "la"], ["ningbo", "callao"], ["shenzhen", "lagos"], ["qingdao", "rotterdam"],
    ["busan", "houston"], ["shenzhen", "jebelali"], ["yokohama", "sydney"], ["shanghai", "mombasa"],
    ["hamburg", "newyork"], ["istanbul", "tashkent"], ["nhava", "durban"], ["houston", "santos"],
    ["kaohsiung", "manila"], ["ningbo", "karachi"], ["rotterdam", "dakar"], ["shanghai", "manzanillo"],
    ["sheridan", "shanghai"], ["sheridan", "hamburg"]
  ];

  // Simplified continent outlines [lon, lat] — only used to shade the globe's dots
  var LAND = [
    [[-166,68],[-156,71],[-140,70],[-125,70],[-110,73],[-95,72],[-82,70],[-75,62],[-65,60],[-60,53],[-55,50],[-66,45],[-70,42],[-76,38],[-76,35],[-81,31],[-80,26],[-82,28],[-84,30],[-90,29],[-97,27],[-97,22],[-92,18],[-87,21],[-88,16],[-84,11],[-80,8],[-78,8],[-83,9],[-86,12],[-92,14],[-96,16],[-105,20],[-110,24],[-112,29],[-115,30],[-117,33],[-121,35],[-124,40],[-124,46],[-125,49],[-131,54],[-136,58],[-146,60],[-152,59],[-158,57],[-165,55],[-160,59],[-165,62]],
    [[-55,60],[-44,60],[-40,65],[-22,70],[-20,76],[-18,81],[-35,83],[-60,82],[-72,78],[-58,75],[-54,70],[-52,65]],
    [[-78,8],[-72,12],[-63,11],[-55,6],[-50,1],[-44,-2],[-35,-6],[-35,-9],[-39,-15],[-40,-22],[-48,-26],[-53,-34],[-58,-38],[-63,-41],[-65,-45],[-68,-50],[-69,-55],[-73,-53],[-75,-46],[-73,-37],[-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,0],[-78,4]],
    [[-10,36],[-9,43],[-2,43],[-5,48],[2,51],[8,54],[10,57],[5,58],[5,62],[12,66],[18,70],[28,71],[40,68],[44,66],[60,70],[60,55],[50,47],[40,46],[36,45],[29,41],[26,40],[22,37],[20,40],[16,38],[18,40],[12,44],[13,45],[8,44],[3,43],[-1,37],[-5,36]],
    [[60,70],[80,73],[100,77],[112,74],[130,71],[150,71],[170,70],[180,68],[180,65],[170,60],[162,58],[156,51],[160,60],[155,60],[142,59],[136,54],[140,48],[132,43],[128,38],[126,35],[122,40],[118,38],[122,31],[120,26],[116,23],[110,21],[108,17],[109,12],[105,9],[103,10],[100,13],[100,8],[104,1],[100,3],[98,8],[98,16],[94,17],[92,22],[88,22],[80,15],[78,8],[73,18],[72,22],[67,25],[62,25],[57,26],[50,30],[48,30],[44,37],[36,36],[36,42],[40,46],[50,47],[60,55]],
    [[35,28],[39,22],[43,13],[45,13],[52,16],[57,19],[60,22],[56,26],[51,24],[50,27],[48,30],[44,32],[38,32],[35,31]],
    [[-17,21],[-16,28],[-10,30],[-9,34],[-5,36],[3,37],[10,37],[11,33],[20,31],[25,32],[32,31],[35,28],[34,26],[38,18],[43,12],[51,12],[48,5],[40,-3],[40,-11],[36,-18],[35,-24],[32,-29],[27,-34],[20,-35],[18,-32],[12,-17],[13,-8],[9,-1],[9,4],[4,6],[-4,5],[-8,4],[-13,8],[-17,14]],
    [[44,-25],[47,-25],[50,-16],[49,-12],[44,-17]],
    [[114,-22],[122,-18],[130,-12],[137,-12],[136,-16],[141,-12],[146,-19],[153,-26],[151,-33],[146,-39],[140,-38],[135,-35],[131,-31],[124,-34],[115,-34],[113,-26]],
    [[109,1],[117,7],[119,1],[116,-4],[110,-3]],
    [[95,5],[98,4],[106,-6],[102,-5]],
    [[105,-6],[115,-7],[115,-8.5],[106,-7.5]],
    [[131,-1],[141,-2],[150,-10],[141,-9],[137,-5]],
    [[120,18],[122,18],[126,7],[122,7]],
    [[130,31],[135,34],[141,36],[142,43],[145,44],[141,45],[139,38],[132,34]],
    [[-5,50],[1,51],[0,53],[-3,56],[-5,58],[-6,56],[-3,54]],
    [[172,-34],[178,-38],[174,-41],[171,-46],[167,-46],[172,-41]],
    [[-180,-72],[180,-72],[180,-90],[-180,-90]]
  ];
  function isLand(lon, lat) {
    for (var p = 0; p < LAND.length; p++) {
      var poly = LAND[p], inside = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
        if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
      }
      if (inside) return true;
    }
    return false;
  }

  var SOURCES = ["shanghai", "ningbo", "shenzhen", "busan", "yokohama", "nhava", "hamburg", "istanbul", "houston"];

  function Globe(canvas, opts) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, R = 0, dpr = 1;
    var cLon = opts.lon, cLat = opts.lat, tLon = null, tLat = null;
    var dragging = false, lastX = 0, lastY = 0, idleUntil = 0, visible = true, raf = 0;
    var routes = [], highlight = null, t0 = performance.now();
    var D2R = Math.PI / 180;

    // Evenly spread dots (Fibonacci sphere); dots over land are drawn brighter
    var dots = [], N = 11000, ga = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = ga * i;
      var v0 = [Math.cos(th) * rr, y, Math.sin(th) * rr];
      var lat = Math.asin(y) / D2R, lon = Math.atan2(v0[0], v0[2]) / D2R;
      var land = isLand(lon, lat);
      if (land || i % 6 === 0) dots.push([v0[0], v0[1], v0[2], land]);
    }

    function vec(lat, lon) {
      var p = lat * D2R, l = lon * D2R;
      return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
    }
    function rotate(v) {
      var c = cLon * D2R, t = cLat * D2R;
      var x = v[0] * Math.cos(c) - v[2] * Math.sin(c);
      var z = v[0] * Math.sin(c) + v[2] * Math.cos(c);
      var y = v[1] * Math.cos(t) - z * Math.sin(t);
      var z2 = v[1] * Math.sin(t) + z * Math.cos(t);
      return [x, y, z2];
    }
    function slerp(a, b, t) {
      var d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      var om = Math.acos(d);
      if (om < 1e-4) return a.slice();
      var s = Math.sin(om), k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s;
      return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
    }

    function setRoutes(list) {
      routes = list.filter(function (p) { return HUBS[p[0]] && HUBS[p[1]]; }).map(function (p, i) {
        var a = vec(HUBS[p[0]].lat, HUBS[p[0]].lon), b = vec(HUBS[p[1]].lat, HUBS[p[1]].lon);
        var ang = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
        var pts = [], steps = 64, lift = 0.03 + 0.12 * (ang / Math.PI);
        for (var s = 0; s <= steps; s++) {
          var t = s / steps, v = slerp(a, b, t), h = 1 + lift * Math.sin(Math.PI * t);
          pts.push([v[0] * h, v[1] * h, v[2] * h]);
        }
        return { pts: pts, off: (i * 0.137) % 1, speed: 0.10 + ((i * 7) % 5) * 0.015 };
      });
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W, H) * 0.40;
      draw(performance.now());
    }

    function screen(v) { return [W / 2 + v[0] * R, H / 2 - v[1] * R]; }
    function shown(v) { return v[2] > 0 || v[0] * v[0] + v[1] * v[1] > 1; }

    function draw(now) {
      if (!W) return;
      var time = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2;

      // Atmosphere glow
      var g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.35);
      g.addColorStop(0, "rgba(199,154,93,0.28)");
      g.addColorStop(1, "rgba(199,154,93,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2); ctx.fill();

      // Sphere body
      var s = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      s.addColorStop(0, "#1D3560");
      s.addColorStop(1, "#08132A");
      ctx.fillStyle = s;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(199,154,93,0.45)"; ctx.lineWidth = 1; ctx.stroke();

      // Lattice dots
      var ds = Math.max(1.2, R / 190);
      for (var i = 0; i < dots.length; i++) {
        var v = rotate(dots[i]);
        if (v[2] <= 0) continue;
        var p = screen(v);
        if (dots[i][3]) {
          ctx.fillStyle = "rgba(226,184,120," + (0.25 + v[2] * 0.6).toFixed(3) + ")";
          ctx.fillRect(p[0] - ds / 2, p[1] - ds / 2, ds, ds);
        } else {
          ctx.fillStyle = "rgba(143,179,232," + (0.04 + v[2] * 0.10).toFixed(3) + ")";
          ctx.fillRect(p[0] - 0.6, p[1] - 0.6, 1.2, 1.2);
        }
      }

      // Routes
      ctx.lineCap = "round";
      routes.forEach(function (rt) {
        var pts = rt.pts.map(rotate), n = pts.length - 1;
        ctx.strokeStyle = "rgba(199,154,93,0.55)"; ctx.lineWidth = 1.1;
        ctx.beginPath();
        var pen = false;
        for (var k = 0; k <= n; k++) {
          if (!shown(pts[k])) { pen = false; continue; }
          var q = screen(pts[k]);
          if (!pen) { ctx.moveTo(q[0], q[1]); pen = true; } else ctx.lineTo(q[0], q[1]);
        }
        ctx.stroke();
        if (reduceMotion) return;
        // Travelling pulse
        var head = (time * rt.speed + rt.off) % 1, tail = Math.max(0, head - 0.14);
        var a = Math.floor(tail * n), b = Math.floor(head * n);
        for (var j = a; j < b; j++) {
          if (!shown(pts[j]) || !shown(pts[j + 1])) continue;
          var p1 = screen(pts[j]), p2 = screen(pts[j + 1]);
          var alpha = (j - a) / Math.max(1, b - a);
          ctx.strokeStyle = "rgba(255,214,140," + alpha.toFixed(3) + ")";
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
        }
      });

      // Hubs
      var pulse = reduceMotion ? 0.5 : (Math.sin(time * 2.4) + 1) / 2;
      ctx.font = "500 11px Inter, sans-serif";
      Object.keys(HUBS).forEach(function (key) {
        var h = HUBS[key], v = rotate(vec(h.lat, h.lon));
        if (v[2] <= 0.02) return;
        var p = screen(v), hq = h.r === "hq", src = h.r === "src";
        var lit = highlight && (h.r === highlight || (highlight === "src" && SOURCES.indexOf(key) > -1));
        if (!opts.allHubs && !hq && !lit && !isRouted(key)) return;
        var base = hq ? 4 : lit ? 3.4 : 2.2;
        if (hq || lit) {
          ctx.strokeStyle = "rgba(226,184,120," + (0.6 - pulse * 0.5).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(p[0], p[1], base + 3 + pulse * 7, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = hq ? "#FFE2B0" : src ? "#8FB3E8" : lit ? "#E2B878" : "rgba(226,184,120,.85)";
        ctx.beginPath(); ctx.arc(p[0], p[1], base, 0, Math.PI * 2); ctx.fill();
        if ((hq || lit) && v[2] > 0.25) {
          ctx.fillStyle = "rgba(255,255,255," + Math.min(1, v[2] * 1.2).toFixed(3) + ")";
          ctx.fillText(hq ? "GlobalLynk · " + h.n : h.n, p[0] + base + 5, p[1] + 4);
        }
      });
    }

    var routedCache = null;
    function isRouted(key) {
      if (!routedCache) {
        routedCache = {};
        (opts.routes || []).forEach(function (p) { routedCache[p[0]] = routedCache[p[1]] = true; });
      }
      return routedCache[key];
    }

    function tick(now) {
      raf = 0;
      if (!visible) return;
      if (tLon !== null) {
        var dl = ((tLon - cLon + 540) % 360) - 180;
        cLon += dl * 0.08; cLat += (tLat - cLat) * 0.08;
        if (Math.abs(dl) < 0.05 && Math.abs(tLat - cLat) < 0.05) { tLon = tLat = null; }
      } else if (!dragging && now > idleUntil && opts.spin) {
        cLon -= 0.06;
      }
      draw(now);
      if (!reduceMotion || tLon !== null) raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }

    canvas.addEventListener("pointerdown", function (e) {
      dragging = true; lastX = e.clientX; lastY = e.clientY; tLon = tLat = null;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      cLon -= (e.clientX - lastX) * 0.35;
      cLat = Math.max(-70, Math.min(70, cLat + (e.clientY - lastY) * 0.35));
      lastX = e.clientX; lastY = e.clientY;
      if (reduceMotion) draw(performance.now());
    });
    function end() { dragging = false; idleUntil = performance.now() + 2500; }
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); }).observe(canvas);
    }

    setRoutes(opts.routes || []);
    resize();
    kick();

    return {
      focus: function (lon, lat) { tLon = lon; tLat = lat; idleUntil = performance.now() + 6000; kick(); },
      setRoutes: function (list) { opts.routes = list; routedCache = null; setRoutes(list); kick(); if (reduceMotion) draw(performance.now()); },
      setHighlight: function (r) { highlight = r; kick(); if (reduceMotion) draw(performance.now()); }
    };
  }

  /* ---------- Hero / markets globe ---------- */
  var globeCanvas = $("#globe"), globe = null;
  if (globeCanvas && globeCanvas.getContext) {
    var marketsMode = globeCanvas.getAttribute("data-mode") === "markets";
    globe = Globe(globeCanvas, {
      lon: marketsMode ? -100 : 20,
      lat: marketsMode ? 30 : 18,
      spin: !marketsMode,
      routes: marketsMode ? [] : HERO_ROUTES,
      allHubs: false
    });
  }

  /* ---------- Markets region explorer ---------- */
  var REGIONS = {
    na:  { k: "Region 01", t: "North America", c: [-98, 38], x: "Distributors, retailers and online sellers across the US, Canada and Mexico — served from our US base with import and domestic delivery options.", l: ["United States", "Canada", "Mexico"], ports: "Los Angeles · Houston · New York · Miami · Vancouver" },
    la:  { k: "Region 02", t: "Latin America & Caribbean", c: [-68, -8], x: "A fast-growing vehicle parc and strong demand for affordable, genuine parts and industrial materials along both coasts.", l: ["Mexico", "Guatemala", "Costa Rica", "Panama", "Dominican Republic", "Jamaica", "Ecuador", "Peru", "Chile", "Brazil", "Argentina", "Uruguay", "Paraguay"], ports: "Manzanillo · Colón · Callao · Guayaquil · Santos · Buenos Aires" },
    eu:  { k: "Region 03", t: "Europe", c: [12, 48], x: "A sourcing origin and a destination: we buy from European manufacturers and supply importers across the continent.", l: ["United Kingdom", "Germany", "Netherlands", "Belgium", "France", "Spain", "Italy", "Poland", "Greece", "Türkiye"], ports: "Rotterdam · Hamburg · Antwerp · Felixstowe · Valencia · Istanbul" },
    me:  { k: "Region 04", t: "Middle East & GCC", c: [48, 25], x: "High vehicle density, strong aftermarket demand and growing interest in e-mobility — supported through our sister company's Gulf network.", l: ["Saudi Arabia", "United Arab Emirates", "Oman", "Kuwait", "Bahrain", "Qatar", "Iraq", "Jordan", "Lebanon", "Yemen"], ports: "Jebel Ali · Jeddah · Dammam · Sohar · Shuwaikh" },
    af:  { k: "Region 05", t: "Africa", c: [20, 0], x: "A rapidly growing vehicle parc and urban markets that need affordable genuine parts, mobility and packaging materials.", l: ["Kenya", "Tanzania", "Uganda", "Ethiopia", "Rwanda", "Nigeria", "Ghana", "Senegal", "Côte d'Ivoire", "Cameroon", "Egypt", "Morocco", "Tunisia", "Libya", "South Africa", "Mozambique", "Zambia"], ports: "Mombasa · Dar es Salaam · Lagos · Tema · Dakar · Durban · Port Said" },
    cis: { k: "Region 06", t: "CIS & Central Asia", c: [62, 42], x: "Markets moving towards genuine-parts sourcing, reached by sea to the Black Sea and Gulf, then onward by rail and road.", l: ["Kazakhstan", "Uzbekistan", "Turkmenistan", "Kyrgyzstan", "Georgia", "Azerbaijan"], ports: "Poti · Baku · via Bandar Abbas · rail to Almaty & Tashkent" },
    sa:  { k: "Region 07", t: "South & Southeast Asia", c: [95, 12], x: "Massive vehicle populations and manufacturing clusters — both buyers and suppliers for our network.", l: ["India", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Singapore", "Malaysia", "Thailand", "Vietnam", "Indonesia", "Philippines"], ports: "Nhava Sheva · Karachi · Chattogram · Colombo · Singapore · Jakarta · Manila" },
    oc:  { k: "Region 08", t: "Oceania", c: [150, -28], x: "Importers and distributors in Australia, New Zealand and the Pacific islands.", l: ["Australia", "New Zealand", "Papua New Guinea", "Fiji"], ports: "Sydney · Melbourne · Auckland" },
    src: { k: "Where we buy", t: "Sourcing origins", c: [110, 30], x: "We buy from vetted manufacturers wherever the best product-to-price fit is — most often in East Asia, with suppliers in South Asia, Europe and the Americas too.", l: ["China", "South Korea", "Japan", "Taiwan", "Vietnam", "India", "Türkiye", "Germany", "Italy", "United States"], ports: "Shanghai · Ningbo · Shenzhen · Qingdao · Busan · Yokohama · Nhava Sheva · Hamburg" }
  };

  var regionBtns = $$(".region-btn");
  function selectRegion(key, focusTab) {
    var r = REGIONS[key]; if (!r) return;
    regionBtns.forEach(function (b) {
      var on = b.getAttribute("data-region") === key;
      b.setAttribute("aria-selected", on);
      b.tabIndex = on ? 0 : -1;
      if (on && focusTab) b.focus();
    });
    var card = $(".region-card");
    card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
    $("[data-r=kicker]").textContent = r.k;
    $("[data-r=title]").textContent = r.t;
    $("[data-r=text]").textContent = r.x;
    $("[data-r=countries]").innerHTML = r.l.map(function (c, i) {
      return '<span style="animation-delay:' + i * 30 + 'ms">' + c + "</span>";
    }).join("");
    $("[data-r=lines]").textContent = "Key ports · " + r.ports;
    if (globe) {
      globe.focus(r.c[0], r.c[1]);
      globe.setHighlight(key);
      var dests = Object.keys(HUBS).filter(function (h) { return HUBS[h].r === key; });
      var pairs = [];
      if (key === "src") {
        ["la", "houston", "rotterdam", "lagos", "jebelali", "mombasa", "sydney", "santos", "karachi"].forEach(function (d, i) {
          pairs.push([SOURCES[i % SOURCES.length], d]);
        });
      } else {
        dests.forEach(function (d, i) { pairs.push([SOURCES[i % 5], d]); });
        pairs.push(["sheridan", dests[0]]);
      }
      globe.setRoutes(pairs);
    }
  }
  if (regionBtns.length) {
    regionBtns.forEach(function (b, i) {
      b.addEventListener("click", function () { selectRegion(b.getAttribute("data-region")); });
      b.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var nb = regionBtns[(i + d + regionBtns.length) % regionBtns.length];
        selectRegion(nb.getAttribute("data-region"), true);
      });
    });
    selectRegion("na");
  }

  /* ---------- Division explorer tabs ---------- */
  var tabs = $$(".explorer-tab");
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      selectTab(tabs[(i + d + tabs.length) % tabs.length], true);
    });
  });

  /* ---------- Nonwoven fabric explorer (home) ---------- */
  var FABRICS = {
    spunbond: { g: "pp-spunbond", k: "Most versatile", t: "PP Spunbond", s: "Continuous filaments, thermally bonded", x: "Polypropylene filaments laid into a web and heat-bonded. Strong, light, breathable and cost-effective — the workhorse of the nonwoven world, available in single, double or triple beam (S, SS, SSS).", gsm: "10–200 gsm", w: "Up to 3.2m", m: "100% polypropylene", p: "Strength-to-weight", u: ["Shopping bags", "Furniture & mattresses", "Crop covers", "Hygiene", "Tablecloths", "Packaging"] },
    sms: { g: "sms", k: "Barrier fabric", t: "SMS / SMMS", s: "Spunbond + meltblown + spunbond layers", x: "A meltblown barrier layer sandwiched between spunbond layers. Breathable, but resists fluids and bacteria, which makes it the standard for disposable medical wear.", gsm: "15–80 gsm", w: "Up to 3.2m", m: "Polypropylene", p: "Fluid & bacterial barrier", u: ["Surgical gowns", "Drapes", "Caps", "Protective clothing", "Hygiene leg cuffs"] },
    meltblown: { g: "meltblown", k: "Filtration grade", t: "Meltblown", s: "Ultra-fine microfiber web", x: "Extremely fine fibers blown into a dense, random web. The fine structure traps particles, which is why meltblown is used as the filter layer in masks and air or liquid filters.", gsm: "15–100 gsm", w: "Up to 1.6m", m: "Polypropylene", p: "High filtration", u: ["Mask filter layer", "Air filters", "Liquid filtration", "Oil absorbents", "Insulation"] },
    needle: { g: "needle-punched", k: "Heavy duty", t: "Needle Punched", s: "Fibers mechanically interlocked by needles", x: "Staple fibers entangled by barbed needles into a dense, felt-like fabric. Tough, thick and dimensionally stable.", gsm: "80–1,000 gsm", w: "Up to 4m+", m: "Polyester (PET) or PP", p: "Durability & bulk", u: ["Geotextiles", "Carpet backing", "Automotive interiors", "Mattress padding", "Felt"] },
    spunlace: { g: "spunlace", k: "Soft & absorbent", t: "Spunlace", s: "Fibers entangled by water jets", x: "High-pressure water jets entangle the fibers, giving a soft, cloth-like fabric with no binders. Absorbent and gentle on skin.", gsm: "30–120 gsm", w: "Up to 3.4m", m: "Viscose / polyester blends", p: "Softness & absorbency", u: ["Wet wipes", "Baby wipes", "Cosmetic pads", "Cleaning cloths", "Towels"] },
    laminated: { g: "laminated", k: "Waterproof", t: "Laminated Nonwoven", s: "Nonwoven bonded to film or woven", x: "Nonwoven laminated with PE film, BOPP or woven raffia for a waterproof, printable, tougher fabric.", gsm: "40–150 gsm", w: "Up to 3.2m", m: "PP + PE / BOPP / raffia", p: "Waterproof", u: ["Protective gowns", "Laminated bags", "Mattress protectors", "Roofing underlay", "Packaging"] },
    treated: { g: "specialty-treated", k: "Performance finishes", t: "Specialty Treated", s: "Spunbond with functional treatment", x: "Spunbond fabric finished for a specific job: hydrophilic for hygiene topsheets, UV-stabilized for outdoor use, flame-retardant for furniture, anti-static, anti-slip, antibacterial or super soft.", gsm: "10–200 gsm", w: "Up to 3.2m", m: "Polypropylene + additives", p: "Built for purpose", u: ["Hygiene topsheets", "UV crop covers", "FR upholstery", "Anti-slip backing", "Electronics packing"] },
    printed: { g: "printed-perforated", k: "Custom finish", t: "Printed & Perforated", s: "Spunbond with print or perforation", x: "Your pattern, brand or logo printed on the roll, or precision perforations for tearing and airflow. Popular for tableware and gift wrap.", gsm: "25–120 gsm", w: "Up to 3.2m", m: "Polypropylene", p: "Your design", u: ["Printed tablecloths", "Flower wrapping", "Branded bags", "Place mats", "Hygiene"] }
  };
  var fx = $(".fx");
  if (fx) {
    var fxTabs = $$(".fx-tab", fx), swatch = $("[data-swatch]", fx), lensEl = $(".lens", fx), lensIn = $("[data-lens]", fx);
    var stage = $(".fx-stage", fx), body = $(".fx-body", fx), dots = $$(".color-dot", fx);
    var setTexture = function (el, key) { el.className = el.className.replace(/\btx-\w+/g, "") + " tx-" + key; };
    var showFab = function (key, focus) {
      var f = FABRICS[key];
      fxTabs.forEach(function (tb) {
        var on = tb.getAttribute("data-fab") === key;
        tb.setAttribute("aria-selected", on); tb.tabIndex = on ? 0 : -1;
        if (on && focus) tb.focus();
      });
      setTexture(swatch, key); setTexture(lensIn, key);
      $('[data-fx="kicker"]', fx).textContent = f.k;
      $('[data-fx="title"]', fx).textContent = f.t;
      $('[data-fx="structure"]', fx).textContent = f.s;
      $('[data-fx="text"]', fx).textContent = f.x;
      $('[data-fx="gsm"]', fx).textContent = f.gsm;
      $('[data-fx="width"]', fx).textContent = f.w;
      $('[data-fx="material"]', fx).textContent = f.m;
      $('[data-fx="prop"]', fx).textContent = f.p;
      var guide = $('[data-fx="guide"]', fx), quoteBtn = $('[data-fx="quote"]', fx);
      if (guide) { guide.href = "/nonwoven/" + f.g; guide.textContent = f.t + " specs & FAQ →"; }
      if (quoteBtn) quoteBtn.href = "/contact?division=textile&fabric=" + encodeURIComponent(f.t);
      $('[data-fx="uses"]', fx).innerHTML = f.u.map(function (u) { return "<span>" + u + "</span>"; }).join("");
      body.classList.remove("swap"); void body.offsetWidth; body.classList.add("swap");
    };
    fxTabs.forEach(function (tb, i) {
      tb.addEventListener("click", function () { showFab(tb.getAttribute("data-fab")); });
      tb.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        showFab(fxTabs[(i + d + fxTabs.length) % fxTabs.length].getAttribute("data-fab"), true);
      });
    });
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        dots.forEach(function (x) { x.setAttribute("aria-pressed", x === dot); });
        stage.style.setProperty("--fab", dot.getAttribute("data-color"));
        [swatch, lensIn].forEach(function (el) {
          el.style.setProperty("--fab", dot.getAttribute("data-color"));
          el.classList.toggle("dark-fab", dot.hasAttribute("data-dark"));
        });
      });
    });
    // Magnifier: the lens holds a copy of the swatch scaled up around the cursor
    var ZOOM = 3;
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, L = lensEl.offsetWidth;
      lensEl.style.left = x - L / 2 + "px";
      lensEl.style.top = y - L / 2 + "px";
      lensIn.style.width = r.width + "px";
      lensIn.style.height = r.height + "px";
      lensIn.style.transform = "translate(" + (L / 2 - x * ZOOM) + "px," + (L / 2 - y * ZOOM) + "px) scale(" + ZOOM + ")";
    });
    // Catalog cards (products page) open their fabric in the explorer
    var fabCardsAll = $$(".fab-card[data-fab]");
    var markCurrent = function (key) { fabCardsAll.forEach(function (c) { c.classList.toggle("current", c.getAttribute("data-fab") === key); }); };
    fxTabs.forEach(function (tb) { tb.addEventListener("click", function () { markCurrent(tb.getAttribute("data-fab")); }); });
    fabCardsAll.forEach(function (card) {
      var open = function () {
        var key = card.getAttribute("data-fab");
        showFab(key); markCurrent(key);
        fx.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      };
      card.addEventListener("click", open);
      card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    showFab("spunbond"); markCurrent("spunbond");
  }

  /* ---------- Fabric catalog filter (products) ---------- */
  var appBtns = $$("[data-app]");
  if (appBtns.length) {
    var fabCards = $$("#fab-grid .fab-card");
    appBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.getAttribute("data-app");
        appBtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        fabCards.forEach(function (c) {
          var match = a === "all" || c.getAttribute("data-apps").split(" ").indexOf(a) > -1;
          c.classList.toggle("dim", !match);
          c.classList.toggle("hit", match && a !== "all");
        });
      });
    });
  }

  /* ---------- Container load planner ---------- */
  var planner = $("[data-planner]");
  if (planner) {
    var BOXES = { "20": { v: 33.2, kg: 28200 }, "40": { v: 67.7, kg: 26700 }, "40hc": { v: 76.4, kg: 26500 } };
    var USABLE = 0.85;
    var inL = $("#pl-l"), inW = $("#pl-w"), inH = $("#pl-h"), inKg = $("#pl-kg"), inQ = $("#pl-q"), range = $("#pl-range");
    var fmt = function (n, d) { return n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d }); };

    function calc() {
      var unit = (+inL.value || 0) * (+inW.value || 0) * (+inH.value || 0) / 1e6;
      var q = Math.max(0, Math.round(+inQ.value || 0));
      var cbm = unit * q, kg = (+inKg.value || 0) * q;
      $("[data-out=cbm]").textContent = fmt(cbm, 2);
      $("[data-out=kg]").textContent = fmt(kg, 0);
      var best = null;
      ["20", "40", "40hc"].forEach(function (k) {
        var b = BOXES[k], volPct = cbm / (b.v * USABLE) * 100, kgPct = kg / b.kg * 100, pct = Math.max(volPct, kgPct);
        var row = $('[data-box="' + k + '"]', planner), fill = $(".box-fill", row);
        fill.style.width = Math.min(100, pct) + "%";
        fill.classList.toggle("over", pct > 100);
        $(".box-pct", row).textContent = pct > 100 ? "Over by " + fmt(pct - 100, 0) + "%" : fmt(pct, 0) + "% full" + (kgPct > volPct ? " (weight)" : "");
        if (!best && pct <= 100 && cbm > 0) best = k;
      });
      $$(".box", planner).forEach(function (r) { r.classList.toggle("best", r.getAttribute("data-box") === best); });
      var names = { "20": "one 20ft container", "40": "one 40ft container", "40hc": "one 40ft High Cube" };
      var verdict = $("[data-out=verdict]");
      if (cbm <= 0) verdict.innerHTML = "Enter carton dimensions and quantity to see an estimate.";
      else if (best === "20" && cbm < 12 && kg < 8000) verdict.innerHTML = "At about <b>" + fmt(cbm, 1) + " m³</b>, a shared container (<b>LCL</b>) is likely more cost-effective than a full 20ft container.";
      else if (best) verdict.innerHTML = "Your order should fit in <b>" + names[best] + "</b>.";
      else {
        var n = Math.ceil(Math.max(cbm / (BOXES["40hc"].v * USABLE), kg / BOXES["40hc"].kg));
        verdict.innerHTML = "You'll need about <b>" + n + " × 40ft High Cube</b> containers — or a mix of sizes. We'll plan the exact load.";
      }
    }
    [inL, inW, inH, inKg].forEach(function (el) { el.addEventListener("input", function () { clearPresets(); calc(); }); });
    inQ.addEventListener("input", function () { range.value = inQ.value; calc(); });
    range.addEventListener("input", function () { inQ.value = range.value; calc(); });
    function clearPresets() { $$("[data-preset]", planner).forEach(function (b) { b.setAttribute("aria-pressed", "false"); }); }
    $$("[data-preset]", planner).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var v = btn.getAttribute("data-preset").split(",");
        inL.value = v[0]; inW.value = v[1]; inH.value = v[2]; inKg.value = v[3];
        if (btn.hasAttribute("data-qty")) { inQ.value = range.value = btn.getAttribute("data-qty"); }
        clearPresets(); btn.setAttribute("aria-pressed", "true");
        calc();
      });
    });
    calc();
  }

  /* ---------- Parts search ---------- */
  var partSearch = $("#part-search");
  if (partSearch) {
    var cats = $$("#part-grid .cat");
    cats.forEach(function (c) { c._p = $("p", c).textContent; c._h = $("h3", c).textContent; });
    partSearch.addEventListener("input", function () {
      var q = partSearch.value.trim().toLowerCase(), hits = 0;
      cats.forEach(function (c) {
        var p = $("p", c);
        if (!q) { c.classList.remove("dim", "hit"); p.textContent = c._p; return; }
        var match = (c._p + " " + c._h).toLowerCase().indexOf(q) > -1;
        c.classList.toggle("dim", !match);
        c.classList.toggle("hit", match);
        if (match) {
          hits++;
          var idx = c._p.toLowerCase().indexOf(q);
          if (idx > -1) {
            p.innerHTML = "";
            p.appendChild(document.createTextNode(c._p.slice(0, idx)));
            var m = document.createElement("mark"); m.textContent = c._p.slice(idx, idx + q.length); p.appendChild(m);
            p.appendChild(document.createTextNode(c._p.slice(idx + q.length)));
          } else p.textContent = c._p;
        } else p.textContent = c._p;
      });
      $("#part-empty").classList.toggle("show", q && !hits);
    });
  }

  /* ---------- Brand filter ---------- */
  var brandCloud = $("#brand-cloud");
  if (brandCloud) {
    var brands = $$(".brand", brandCloud), fbtns = $$("[data-filter]");
    fbtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-filter");
        fbtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        brands.forEach(function (el) { el.classList.toggle("out", f !== "all" && el.getAttribute("data-o") !== f); });
      });
    });
  }

  /* ---------- E-bike regulation toggle ---------- */
  var REG = {
    eu: { t: "EU pedelec (EN 15194)", a: "250W", b: "25 km/h", c: "CE", n: "Controllers programmed to EU limits, CE Declaration of Conformity and ISO 4210 bicycle safety. Batteries shipped with UN 38.3 test reports." },
    us: { t: "US e-bike classes 1–3", a: "750W", b: "32 km/h+", c: "UL 2849", n: "Configured for US Class 1–3 limits (20–28 mph assist), CPSC requirements and UL 2849 electrical-system certification." },
    other: { t: "Destination-specific", a: "Custom", b: "Custom", c: "Local", n: "Motor power, speed limits and certification configured to your destination's regulations, so bikes arrive market-legal." }
  };
  var regBtns = $$("[data-reg]");
  regBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var r = REG[b.getAttribute("data-reg")];
      regBtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      $("[data-reg-title]").textContent = r.t;
      $("[data-reg-a]").textContent = r.a;
      $("[data-reg-b]").textContent = r.b;
      $("[data-reg-c]").textContent = r.c;
      $("[data-reg-note]").textContent = r.n;
    });
  });

  /* ---------- Nonwoven GSM explorer ---------- */
  var gsm = $("#gsm");
  if (gsm) {
    var USES = [
      [25, "Hygiene components, medical disposables (masks, caps, shoe covers), lightweight crop covers."],
      [45, "Disposable gowns and drapes, frost protection, furniture dust covers and interlining."],
      [80, "Reusable shopping and promotional bags, spring pocket covers, table covers."],
      [120, "Heavier-duty bags, upholstery backing, weed-control fabric and packaging."],
      [200, "Durable bags, landscaping, construction underlayment and industrial uses."]
    ];
    var fabric = $("#fabric");
    var upd = function () {
      var v = +gsm.value;
      $("#gsm-val").textContent = v;
      var u = USES.filter(function (x) { return v <= x[0]; })[0] || USES[USES.length - 1];
      $("#gsm-uses").textContent = u[1];
      var d = 0.2 + (v / 200) * 0.8;
      fabric.style.filter = "contrast(" + (0.7 + d * 0.9).toFixed(2) + ")";
      fabric.style.opacity = (0.55 + d * 0.45).toFixed(2);
    };
    gsm.addEventListener("input", upd);
    upd();
  }

  /* ---------- Transit lookup ---------- */
  var transit = $("[data-transit]");
  if (transit) {
    // Indicative port-to-port sea days [min, max]; null = overland / domestic
    var SEA = {
      cn: { usw: [14, 20], use: [28, 38], law: [22, 32], lae: [30, 42], eun: [30, 40], gcc: [16, 22], eaf: [18, 26], waf: [32, 45], sas: [12, 18], sea: [5, 10], oce: [14, 20] },
      in: { usw: [30, 40], use: [28, 38], law: [35, 45], lae: [32, 42], eun: [20, 30], gcc: [4, 8], eaf: [10, 16], waf: [25, 35], sas: [3, 7], sea: [8, 14], oce: [18, 26] },
      eu: { usw: [26, 34], use: [10, 16], law: [22, 30], lae: [16, 26], eun: [3, 7], gcc: [16, 24], eaf: [20, 28], waf: [12, 20], sas: [20, 28], sea: [26, 34], oce: [35, 45] },
      us: { usw: null, use: null, law: [10, 20], lae: [7, 16], eun: [10, 16], gcc: [26, 34], eaf: [30, 40], waf: [18, 26], sas: [28, 38], sea: [26, 36], oce: [22, 32] }
    };
    var AIR = { near: "1–3 days", far: "3–6 days" };
    var from = $("#tr-from"), to = $("#tr-to"), ship = $(".ship", transit);
    var updT = function () {
      var d = SEA[from.value][to.value];
      $("[data-t=from]").textContent = from.options[from.selectedIndex].text;
      $("[data-t=to]").textContent = to.options[to.selectedIndex].text;
      $("[data-t=sea]").textContent = d ? d[0] + "–" + d[1] + " days" : "Truck / rail (domestic)";
      $("[data-t=air]").textContent = d && d[1] <= 10 ? AIR.near : d ? AIR.far : "1–2 days";
      if (ship && !reduceMotion) {
        ship.style.animation = "none"; void ship.offsetWidth;
        var dur = d ? Math.max(1.4, d[1] / 10) : 1.2;
        ship.style.animation = "sail " + dur + "s cubic-bezier(.4,0,.2,1) forwards";
      }
    };
    from.addEventListener("change", updT);
    to.addEventListener("change", updT);
    updT();
  }

  /* ---------- Quote builder ---------- */
  var form = $("#quote");
  if (form) {
    var step = 1;
    var steps = $$("[data-step]", form), inds = $$("[data-step-ind]", form);
    var HINTS = {
      "Auto Spare Parts": ["OEM part numbers, or vehicle make, model, year and engine code.", "e.g. Brake pads for Toyota Hilux 2018–2022, OEM 04465-0K360"],
      "Electric Mountain Bikes": ["Bike type, motor/battery preference, branded or private label.", "e.g. Full-suspension e-MTB, mid-drive 250W, 630Wh, private label with our logo"],
      "Nonwoven Fabric": ["Fabric type, GSM, width, color and any treatment.", "e.g. PP spunbond, 70 GSM, 1.6m width, white, UV treated, rolls"],
      "Baby Products (coming soon)": ["Tell us which baby products interest you (non-food, non-medical) — we'll contact you at launch.", "e.g. Diapers sizes 1–5, soft toys and strollers for retail"],
      "Other / General sourcing": ["Describe the product, specification and any reference photos or links.", "e.g. Stainless steel kitchen sinks, 60×45cm, single bowl"]
    };
    var params = new URLSearchParams(location.search);
    var preset = { auto: "d-auto", bike: "d-bike", textile: "d-tex", baby: "d-baby", other: "d-other" }[params.get("division")];
    if (preset) $("#" + preset).checked = true;
    // ?fabric=PP%20Spunbond (from fabric pages) starts the description for the buyer
    var fabricParam = (params.get("fabric") || "").slice(0, 60);
    if (fabricParam) {
      if (!preset) $("#d-tex").checked = true;
      $("#q-desc").value = fabricParam + " nonwoven fabric\nWeight (GSM): \nWidth: \nColor: \nTreatment: ";
    }

    function val(name) { var el = form.elements[name]; return el ? (el.value || "").trim() : ""; }
    function division() { var c = $("input[name=division]:checked", form); return c ? c.value : ""; }

    function show(n) {
      step = n;
      steps.forEach(function (s) { s.hidden = +s.getAttribute("data-step") !== n; });
      inds.forEach(function (li) {
        var i = +li.getAttribute("data-step-ind");
        li.classList.toggle("active", i === n);
        li.classList.toggle("done", i < n);
      });
      if (n === 2) {
        var h = HINTS[division()];
        if (h) { $("[data-hint]", form).textContent = h[0]; $("#q-desc").placeholder = h[1]; }
      }
      if (n === 3) $("#q-summary").textContent = summary();
      var first = $('[data-step="' + n + '"] input:not([type=radio]), [data-step="' + n + '"] textarea', form);
      if (first && n > 1) first.focus({ preventScroll: true });
      form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }

    function check(n) {
      var err = $('[data-err="' + n + '"]', form);
      err.textContent = "";
      if (n === 1 && !division()) { err.textContent = "Please choose a division to continue."; return false; }
      if (n === 2) {
        var missing = ["desc", "qty", "dest"].filter(function (k) { return !val(k); });
        if (missing.length) { err.textContent = "Please fill in the product details, quantity and destination."; form.elements[missing[0]].focus(); return false; }
      }
      if (n === 3) {
        if (!val("name")) { err.textContent = "Please enter your name."; form.elements.name.focus(); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email"))) { err.textContent = "Please enter a valid email address."; form.elements.email.focus(); return false; }
      }
      return true;
    }

    function summary() {
      return [
        "Division:     " + division(),
        "Products:     " + val("desc"),
        "Quantity:     " + val("qty"),
        "Destination:  " + val("dest"),
        "Incoterm:     " + val("inco"),
        "Timeline:     " + val("time"),
        "",
        "Name:         " + (val("name") || "—"),
        "Company:      " + (val("company") || "—"),
        "Email:        " + (val("email") || "—"),
        "Phone:        " + (val("phone") || "—")
      ].join("\n");
    }

    $$("[data-next]", form).forEach(function (b) { b.addEventListener("click", function () { if (check(step)) show(step + 1); }); });
    $$("[data-prev]", form).forEach(function (b) { b.addEventListener("click", function () { show(step - 1); }); });
    $$("input[name=division]", form).forEach(function (r) { r.addEventListener("change", function () { $('[data-err="1"]', form).textContent = ""; }); });
    ["name", "company", "email", "phone"].forEach(function (k) {
      form.elements[k].addEventListener("input", function () { $("#q-summary").textContent = summary(); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!check(3)) return;
      var subject = "Quote request — " + division() + " — " + (val("company") || val("name"));
      window.location.href = "mailto:globallynkllc@gmail.com?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent("Hello GlobalLynk,\n\nPlease quote for the following:\n\n" + summary() + "\n\nThank you.");
      toast("Opening your email app…");
    });
    $("[data-send=wa]", form).addEventListener("click", function () {
      if (!check(3)) return;
      window.open("https://wa.me/15572431736?text=" + encodeURIComponent("Hello GlobalLynk, I'd like a quote:\n\n" + summary()), "_blank", "noopener");
    });
  }

  /* ---------- Office clock ---------- */
  var clock = $("[data-clock]");
  if (clock && window.Intl) {
    var tz = "America/Denver";
    var tick = function () {
      var now = new Date();
      $("[data-clock-time]").textContent = now.toLocaleTimeString([], { timeZone: tz, hour: "2-digit", minute: "2-digit" }) +
        " · " + now.toLocaleDateString([], { timeZone: tz, weekday: "short" });
      var there = new Date(now.toLocaleString("en-US", { timeZone: tz }));
      var here = new Date(now.toLocaleString("en-US"));
      var diff = Math.round((here - there) / 36e5);
      $("[data-clock-note]").textContent = diff === 0 ? "Same time zone as you." :
        "You are " + Math.abs(diff) + " hour" + (Math.abs(diff) === 1 ? "" : "s") + (diff > 0 ? " ahead of" : " behind") + " us. Message anytime — we'll reply as soon as we're online.";
    };
    tick();
    setInterval(tick, 30000);
  }
})();
