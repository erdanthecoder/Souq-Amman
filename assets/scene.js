/* Builds the Amman Citadel scene (SVG), runs the opening sequence,
   and drives scroll / pointer parallax. */
(function () {
  const svg = document.getElementById("scene");
  if (!svg) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const stage = document.querySelector(".stage");

  // deterministic random so the city looks the same on every visit
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const R = (a, b) => a + rnd() * (b - a);
  const f = n => Math.round(n * 10) / 10;

  const yFar = x => 590 - 34 * Math.sin(x / 160 + 1) - 18 * Math.sin(x / 61);
  const yMid = x => 680 - 46 * Math.sin(x / 210 + .5) - 16 * Math.sin(x / 83);

  function hillPath(fn, from, to, bottom) {
    let d = `M${from} ${bottom} L${from} ${f(fn(from))}`;
    for (let x = from; x <= to; x += 20) d += ` L${x} ${f(fn(x))}`;
    return d + ` L${to} ${bottom} Z`;
  }

  function houses(fn, rows, wMin, wMax, hMin, hMax, palette, windows) {
    let out = "";
    for (let r = 0; r < rows; r++) {
      let x = -30 + R(0, 10);
      while (x < 1640) {
        const w = R(wMin, wMax), h = R(hMin, hMax);
        const base = fn(x + w / 2) + 4 + r * (hMax * .8) + R(-2, 2);
        const c = palette[Math.floor(R(0, palette.length))];
        out += `<rect x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(h)}" fill="${c}"/>`;
        out += `<rect x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(Math.max(1.5, h * .12))}" fill="rgba(0,0,0,.12)"/>`;
        if (windows && w > 9) {
          const n = Math.floor(R(0, 3));
          for (let i = 0; i < n; i++) {
            const wx = x + 2 + R(0, w - 6), wy = base - h + 3 + R(0, h - 8);
            if (rnd() < .45) out += `<rect class="win" style="--t:${f(R(0, 3))}s" x="${f(wx)}" y="${f(wy)}" width="2.6" height="3.4" fill="#ffd27a"/>`;
            else out += `<rect x="${f(wx)}" y="${f(wy)}" width="2.6" height="3.4" fill="rgba(70,45,25,.55)"/>`;
          }
        }
        x += w + R(-1, 3);
      }
    }
    return out;
  }

  function column(cx, base, h, w, d) {
    const top = base - h, sh = top + 36; // shaft top (below capital)
    let s = `<g class="col" style="--d:${d}s">`;
    s += `<rect x="${cx - w * .68}" y="${base - 12}" width="${w * 1.36}" height="12" fill="url(#stoneV)"/>`;
    s += `<rect x="${cx - w * .6}" y="${base - 20}" width="${w * 1.2}" height="9" rx="4" fill="url(#shaft)"/>`;
    s += `<polygon points="${cx - w / 2},${base - 20} ${cx + w / 2},${base - 20} ${cx + w * .43},${sh} ${cx - w * .43},${sh}" fill="url(#shaft)"/>`;
    for (let i = -2; i <= 2; i++) s += `<line x1="${cx + i * w * .19}" y1="${base - 22}" x2="${cx + i * w * .165}" y2="${sh + 2}" stroke="rgba(70,40,15,.28)" stroke-width="1.6"/>`;
    // weathering cracks
    s += `<path d="M${cx - 6} ${base - 90} l4 -10 l-3 -8 l5 -12" stroke="rgba(60,30,10,.35)" stroke-width="1" fill="none"/>`;
    s += `<rect x="${cx - w * .47}" y="${sh - 6}" width="${w * .94}" height="6" fill="url(#shaft)"/>`;
    // corinthian capital
    s += `<path d="M${cx - w * .45} ${sh - 6} L${cx - w * .72} ${top + 10} L${cx + w * .72} ${top + 10} L${cx + w * .45} ${sh - 6} Z" fill="url(#shaft)"/>`;
    for (let i = -2; i <= 2; i++) s += `<path d="M${cx + i * w * .25} ${sh - 6} q${-4} -12 0 -20 q4 8 0 20" fill="rgba(110,70,30,.35)"/>`;
    s += `<path d="M${cx - w * .7} ${top + 22} q -9 -4 -5 -11 q 6 -2 7 6" fill="none" stroke="#6e4a26" stroke-width="2"/>`;
    s += `<path d="M${cx + w * .7} ${top + 22} q 9 -4 5 -11 q -6 -2 -7 6" fill="none" stroke="#6e4a26" stroke-width="2"/>`;
    s += `<rect x="${cx - w * .82}" y="${top}" width="${w * 1.64}" height="11" fill="url(#stoneV)"/>`;
    return s + `</g>`;
  }

  function stump(cx, base, h, w, d) {
    const top = base - h;
    return `<g class="stump" style="--d:${d}s">
      <rect x="${cx - w * .68}" y="${base - 12}" width="${w * 1.36}" height="12" fill="url(#stoneV)"/>
      <rect x="${cx - w * .6}" y="${base - 20}" width="${w * 1.2}" height="9" rx="4" fill="url(#shaft)"/>
      <polygon points="${cx - w / 2},${base - 20} ${cx + w / 2},${base - 20} ${cx + w * .49},${top + 6} ${cx + w * .2},${top - 4} ${cx},${top + 8} ${cx - w * .25},${top} ${cx - w * .49},${top + 10}" fill="url(#shaft)"/>
      ${[-1, 0, 1].map(i => `<line x1="${cx + i * w * .25}" y1="${base - 22}" x2="${cx + i * w * .25}" y2="${top + 12}" stroke="rgba(70,40,15,.28)" stroke-width="1.6"/>`).join("")}
    </g>`;
  }

  // ---------- assemble ----------
  const stars = Array.from({ length: 170 }, () => {
    const r = f(R(.4, 1.7));
    return `<circle cx="${f(R(0, 1600))}" cy="${f(R(-560, 520))}" r="${r}" fill="#fff" opacity="${f(R(.35, 1))}"${rnd() < .3 ? ` class="win" style="--t:${f(R(0, 3))}s"` : ""}/>`;
  }).join("");

  const rays = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2, b = a + .09, L = 1500;
    return `<polygon points="0,0 ${f(Math.cos(a) * L)},${f(Math.sin(a) * L)} ${f(Math.cos(b) * L)},${f(Math.sin(b) * L)}" fill="#fff3d0" opacity=".06"/>`;
  }).join("");

  const farHouses = houses(yFar, 2, 4, 9, 4, 8, ["#c9a79c", "#bf9b93", "#d3b4a6", "#b8948c"], false);
  const midHouses = houses(yMid, 4, 9, 20, 9, 18, ["#efe2c9", "#e5d3b5", "#f4ead8", "#dcc6a2", "#e9dcc4", "#d4bb94"], true);

  const SUNX = 1160, SUNY = 292;
  const temple =
    `<rect x="975" y="492" width="380" height="14" fill="url(#stoneV)"/>
     <rect x="985" y="480" width="360" height="13" fill="url(#stoneV)"/>
     <rect x="995" y="468" width="340" height="13" fill="url(#stoneV)"/>
     <path d="M995 474.5 H1335 M985 486.5 H1345 M975 499 H1355" stroke="rgba(60,30,10,.25)"/>
     ${[1035, 1075, 1115, 1155, 1195, 1235, 1275, 1315].map(x => `<line x1="${x}" y1="468" x2="${x}" y2="506" stroke="rgba(60,30,10,.2)"/>`).join("")}
     ${column(1040, 468, 292, 38, .7)}
     ${column(1120, 468, 292, 38, .9)}
     ${column(1205, 468, 292, 38, 1.1)}
     ${stump(1268, 468, 100, 38, 1.3)}
     ${stump(1318, 468, 44, 36, 1.45)}
     <g class="entab">
       <path d="M996 110 H1166 L1162 98 L1150 104 L1140 96 L1128 104 L1114 95 L1100 102 L1084 96 L1070 103 L1056 95 L1040 103 L1026 97 L1010 104 L998 99 Z" fill="url(#stoneV)"/>
       <rect x="996" y="110" width="170" height="13" fill="url(#stoneV)"/>
       ${Array.from({ length: 16 }, (_, i) => `<rect x="${1002 + i * 10.2}" y="123" width="6" height="6" fill="#b48a58"/>`).join("")}
       <rect x="1002" y="129" width="158" height="22" fill="url(#stoneV)"/>
       <rect x="1006" y="151" width="150" height="27" fill="url(#stoneV)"/>
       <path d="M1006 160 H1156 M1006 169 H1156" stroke="rgba(60,30,10,.3)"/>
       <path d="M1160 178 L1166 140 L1158 128 L1166 110" fill="none" stroke="rgba(60,30,10,.35)"/>
     </g>
     <g class="puff">${[[1010, 182], [1040, 176], [1080, 186], [1120, 176], [1150, 184], [1080, 172]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${f(R(14, 26))}" fill="rgba(240,220,185,.55)"/>`).join("")}</g>
     <g transform="translate(1372 512) rotate(8)"><rect x="-22" y="-12" width="44" height="24" rx="3" fill="url(#shaft)"/><ellipse cx="22" cy="0" rx="6" ry="12" fill="#c7a171"/></g>
     <g transform="translate(1412 530) rotate(-6)"><rect x="-18" y="-11" width="36" height="22" rx="3" fill="url(#shaft)"/><ellipse cx="-18" cy="0" rx="5" ry="11" fill="#a47a4c"/></g>`;

  const hand =
    `<g>
      <rect x="896" y="484" width="50" height="17" rx="8" fill="url(#shaft)"/>
      <rect x="946" y="462" width="13" height="39" rx="6.5" fill="url(#shaft)"/>
      <rect x="960" y="455" width="13" height="46" rx="6.5" fill="url(#shaft)"/>
      <rect x="974" y="466" width="12" height="35" rx="6" fill="url(#shaft)"/>
      <path d="M948 478 h9 M962 474 h9 M976 482 h8" stroke="rgba(70,40,15,.4)"/>
    </g>`;

  const palace =
    `<g>
      <rect x="772" y="420" width="108" height="82" fill="url(#stoneV)"/>
      <rect x="788" y="404" width="76" height="18" fill="url(#stoneV)"/>
      <path d="M786 405 Q826 340 866 405 Z" fill="url(#dome)"/>
      <path d="M813 502 V458 Q826 440 839 458 V502 Z" fill="#3d2414"/>
      ${[784, 852].map(x => `<path d="M${x} 492 V466 Q${x + 8} 456 ${x + 16} 466 V492 Z" fill="rgba(70,40,15,.35)"/>`).join("")}
      <path d="M772 440 H880 M772 470 H880" stroke="rgba(60,30,10,.18)"/>
    </g>`;

  const flagX = 1425, flagBase = f(yMid(1425) + 6), poleTop = flagBase - 290;

  const olive =
    `<g fill="#1f150d">
      <path d="M205 900 C198 850 228 820 204 782 C188 752 214 728 198 696 L214 694 C236 732 214 758 240 790 C256 820 244 862 262 900 Z"/>
      <path d="M210 740 C180 720 150 712 120 700 L124 692 C156 702 186 708 214 728 Z M222 722 C252 700 282 690 312 676 L316 684 C288 698 258 712 230 734 Z"/>
      ${Array.from({ length: 42 }, () => `<ellipse cx="${f(R(90, 350))}" cy="${f(R(600, 720))}" rx="${f(R(16, 34))}" ry="${f(R(9, 18))}" fill="${rnd() < .5 ? "#2a2416" : "#33301c"}"/>`).join("")}
    </g>`;

  const bird = (x, y, s) => `<path class="bird" d="M${x} ${y} q${5 * s} ${-6 * s} ${10 * s} 0 q${5 * s} ${-6 * s} ${10 * s} 0" fill="none" stroke="#2b1a14" stroke-width="${1.8 * s}" stroke-linecap="round" style="animation-delay:${f(R(0, .5))}s"/>`;

  svg.innerHTML = `
  <defs>
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03020a"/><stop offset=".55" stop-color="#0d0a24"/><stop offset="1" stop-color="#2a1d45"/></linearGradient>
    <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1a44"/><stop offset=".36" stop-color="#5a3a6e"/><stop offset=".6" stop-color="#c7705d"/><stop offset=".76" stop-color="#f2a865"/><stop offset=".9" stop-color="#ffd896"/></linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#fff2c8" stop-opacity=".95"/><stop offset=".18" stop-color="#ffd27a" stop-opacity=".6"/><stop offset=".5" stop-color="#f29a55" stop-opacity=".22"/><stop offset="1" stop-color="#f29a55" stop-opacity="0"/></radialGradient>
    <linearGradient id="far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d6680"/><stop offset="1" stop-color="#6f4f66"/></linearGradient>
    <linearGradient id="mid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a87158"/><stop offset="1" stop-color="#6e4433"/></linearGradient>
    <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c99764"/><stop offset=".5" stop-color="#9c6a40"/><stop offset="1" stop-color="#5a3620"/></linearGradient>
    <linearGradient id="shaft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a77c4c"/><stop offset=".3" stop-color="#f3d9a6"/><stop offset=".55" stop-color="#e2bf88"/><stop offset="1" stop-color="#8f6236"/></linearGradient>
    <linearGradient id="stoneV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0d6a2"/><stop offset="1" stop-color="#b48a58"/></linearGradient>
    <linearGradient id="dome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9905e"/><stop offset=".35" stop-color="#ead0a0"/><stop offset="1" stop-color="#8a603a"/></linearGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc58f" stop-opacity="0"/><stop offset=".5" stop-color="#ffc58f" stop-opacity=".4"/><stop offset="1" stop-color="#ffc58f" stop-opacity="0"/></linearGradient>
    <pattern id="blocks" width="38" height="17" patternUnits="userSpaceOnUse"><rect width="38" height="17" fill="none" stroke="rgba(60,30,10,.3)"/><path d="M19 8.5 V17" stroke="rgba(60,30,10,.3)"/></pattern>
    <linearGradient id="pole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#777"/><stop offset=".4" stop-color="#eee"/><stop offset="1" stop-color="#555"/></linearGradient>
  </defs>

  <g class="layer" data-depth="0">
    <rect x="-200" y="-700" width="2000" height="1700" fill="url(#night)"/>
    <rect class="dawn" x="-200" y="-700" width="2000" height="1700" fill="url(#dawn)"/>
    <g class="stars">${stars}</g>
  </g>
  <g class="layer" data-depth=".15">
    <g class="sun">
      <g class="rays" transform="translate(${SUNX} ${SUNY})"><g>${rays}<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="80s" repeatCount="indefinite"/></g></g>
      <circle cx="${SUNX}" cy="${SUNY}" r="460" fill="url(#glow)"/>
      <circle cx="${SUNX}" cy="${SUNY}" r="62" fill="#fff4cf"/>
    </g>
  </g>
  <g class="layer birds" data-depth=".2">
    <g class="flock">${bird(0, 230, 1.2)}${bird(30, 214, 1)}${bird(56, 240, .9)}${bird(80, 222, 1.1)}</g>
    <g class="flock f2">${bird(0, 160, .8)}${bird(24, 150, .7)}${bird(44, 168, .75)}</g>
  </g>
  <g class="layer" data-depth=".3">
    <path d="${hillPath(yFar, -40, 1640, 900)}" fill="url(#far)"/>
    <g opacity=".75">${farHouses}</g>
  </g>
  <rect x="-200" y="430" width="2000" height="330" fill="url(#haze)"/>
  <g class="layer" data-depth=".45">
    <path d="${hillPath(yMid, -40, 1640, 900)}" fill="url(#mid)"/>
    ${midHouses}
    <g>
      <rect x="${flagX - 3}" y="${poleTop}" width="6" height="${flagBase - poleTop}" fill="url(#pole)"/>
      <circle cx="${flagX}" cy="${poleTop - 3}" r="5" fill="#e8c46a"/>
      <path id="fBlack" fill="#111"/><path id="fWhite" fill="#f5f5f5"/><path id="fGreen" fill="#007a3d"/><path id="fRed" fill="#ce1126"/><path id="fStar" fill="#fff"/>
    </g>
  </g>
  <g class="layer" data-depth=".6">
    <path d="M500 900 L500 790 C590 730 650 610 740 518 L760 504 L1362 496 C1420 520 1500 610 1660 668 L1660 900 Z" fill="url(#hill)"/>
    <path d="M748 512 L1366 502 L1396 566 L712 576 Z" fill="#b8895a"/>
    <path d="M748 512 L1366 502 L1396 566 L712 576 Z" fill="url(#blocks)"/>
    <path d="M712 576 L1396 566" stroke="rgba(50,25,10,.4)" stroke-width="2"/>
    ${palace}
    ${hand}
    ${temple}
  </g>
  <g class="layer" data-depth=".9">
    <path d="M-60 900 L-60 830 C120 800 260 846 440 836 C620 826 700 860 900 852 C1120 844 1300 870 1660 846 L1660 900 Z" fill="#1d120b"/>
    ${olive}
  </g>
  <rect class="tint" x="-200" y="-700" width="2000" height="1700" fill="#0b0626" style="mix-blend-mode:multiply"/>
  `;

  // ---------- viewBox framing (keep the temple in view on any screen) ----------
  function frame() {
    const a = innerWidth / innerHeight;
    if (a >= 16 / 9) { svg.setAttribute("viewBox", "0 0 1600 900"); svg.setAttribute("preserveAspectRatio", "xMidYMax slice"); return; }
    const extra = a < .8 ? 600 : a < 1.3 ? 260 : 0;
    const H = 900 + extra, W = H * a;
    const x0 = Math.max(0, Math.min(1600 - W, 1150 - W / 2));
    svg.setAttribute("viewBox", `${f(x0)} ${-extra} ${f(W)} ${H}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMax slice");
  }
  frame();

  // ---------- waving flag ----------
  const fp = ["fBlack", "fWhite", "fGreen"].map(id => svg.querySelector("#" + id));
  const red = svg.querySelector("#fRed"), star = svg.querySelector("#fStar");
  const FW = 170, FH = 102, fx = flagX + 3, fy = poleTop;
  const wave = (x, t) => Math.sin(x * .045 - t * 4.2) * 7 * (x / FW) + Math.sin(x * .02 - t * 2.1) * 3 * (x / FW);
  function drawFlag(t) {
    for (let i = 0; i < 3; i++) {
      const y0 = fy + i * FH / 3, y1 = y0 + FH / 3;
      let d = "";
      for (let x = 0; x <= FW; x += 10) d += (x ? " L" : "M") + f(fx + x) + " " + f(y0 + wave(x, t));
      for (let x = FW; x >= 0; x -= 10) d += " L" + f(fx + x) + " " + f(y1 + wave(x, t));
      fp[i].setAttribute("d", d + "Z");
    }
    const tx = FW * .45;
    red.setAttribute("d", `M${fx} ${fy} L${f(fx + tx)} ${f(fy + FH / 2 + wave(tx, t))} L${fx} ${fy + FH} Z`);
    const sx = fx + FW * .15, sy = fy + FH / 2 + wave(FW * .15, t);
    let sd = "";
    for (let k = 0; k < 14; k++) { const ang = -Math.PI / 2 + k * Math.PI / 7, rr = k % 2 ? 2.2 : 5.2; sd += (k ? "L" : "M") + f(sx + Math.cos(ang) * rr) + " " + f(sy + Math.sin(ang) * rr); }
    star.setAttribute("d", sd + "Z");
  }

  // ---------- dust motes ----------
  const cv = document.getElementById("dust"), ctx = cv.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let motes = [];
  function sizeDust() {
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    motes = Array.from({ length: Math.min(90, Math.round(innerWidth / 14)) }, () => ({
      x: Math.random() * cv.width, y: Math.random() * cv.height, r: (Math.random() * 1.8 + .4) * dpr,
      vx: (Math.random() - .3) * .25 * dpr, vy: -(Math.random() * .35 + .08) * dpr, p: Math.random() * 6.28
    }));
  }
  sizeDust();

  // ---------- parallax ----------
  const layers = [...svg.querySelectorAll(".layer")].map(g => ({ g, d: +g.dataset.depth }));
  const copy = document.querySelector(".hero-copy"), cue = document.querySelector(".cue"), veil = document.querySelector(".veil");
  const hero = document.querySelector(".hero");
  let mx = 0, my = 0, tmx = 0, tmy = 0, origin = null;
  addEventListener("pointermove", e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; });
  function computeOrigin() {
    const m = svg.getScreenCTM(); if (!m) return;
    const pt = svg.createSVGPoint(); pt.x = SUNX - 40; pt.y = 300;
    const s = pt.matrixTransform(m), b = stage.getBoundingClientRect();
    origin = `${f(s.x - b.left)}px ${f(s.y - b.top)}px`;
  }
  addEventListener("resize", () => { frame(); sizeDust(); svg.style.transform = ""; computeOrigin(); });
  computeOrigin();

  function tick(now) {
    const t = now / 1000;
    mx += (tmx - mx) * .05; my += (tmy - my) * .05;
    const max = hero.offsetHeight - innerHeight;
    const p = Math.max(0, Math.min(1, scrollY / max));
    if (scrollY < hero.offsetHeight + 50) {
      for (const L of layers) L.g.style.transform = `translate(${f(-mx * L.d * 40)}px, ${f(-my * L.d * 16 + p * L.d * 120)}px)`;
      svg.style.transformOrigin = origin;
      svg.style.transform = `scale(${1 + p * p * 1.6})`;
      copy.style.opacity = Math.max(0, 1 - p * 2.6);
      copy.style.translate = `0 ${f(-p * 160)}px`;
      cue.style.opacity = body.classList.contains("lit") ? Math.max(0, .85 - p * 5) : "";
      veil.style.opacity = Math.max(0, (p - .55) / .45);
      drawFlag(t);
      // dust
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const m of motes) {
        m.x += m.vx + Math.sin(t + m.p) * .15; m.y += m.vy;
        if (m.y < -10) { m.y = cv.height + 10; m.x = Math.random() * cv.width; }
        if (m.x > cv.width + 10) m.x = -10;
        const a = .35 + .35 * Math.sin(t * 2 + m.p);
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283);
        ctx.fillStyle = `rgba(255,214,140,${a})`; ctx.fill();
      }
    }
    if (!reduce) requestAnimationFrame(tick);
  }
  drawFlag(0);
  requestAnimationFrame(tick);

  // ---------- opening sequence ----------
  let readyDone = false;
  function ready() {
    if (readyDone) return; readyDone = true;
    body.classList.add("ready"); body.classList.remove("locked");
    computeOrigin();
    document.dispatchEvent(new Event("souq:ready"));
  }
  function skip() {
    body.classList.add("lit");
    void body.offsetWidth;
    document.getAnimations().forEach(a => {
      const it = a.effect && a.effect.getTiming().iterations;
      if (it !== Infinity) { try { a.finish(); } catch (_) {} }
    });
    ready();
  }
  requestAnimationFrame(() => setTimeout(() => body.classList.add("lit"), 120));
  setTimeout(() => { if (!readyDone) { stage.classList.add("shake"); setTimeout(() => stage.classList.remove("shake"), 600); } }, 3020);
  setTimeout(ready, reduce ? 300 : 4500);
  document.querySelector(".skip").addEventListener("click", skip);
  addEventListener("keydown", e => { if (!readyDone && (e.key === "Escape" || e.key === " " || e.key === "Enter")) skip(); });
  addEventListener("wheel", () => { if (!readyDone) skip(); }, { passive: true });
  addEventListener("touchmove", () => { if (!readyDone) skip(); }, { passive: true });
})();
