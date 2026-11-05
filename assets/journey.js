/* Scroll-driven storytelling: horizontal journey through the eras,
   gold-filling words, lanterns, spark cursor, progress pillar, smooth scroll. */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer:fine)").matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => 1 - Math.pow(1 - t, 3);

  // ---------- era illustrations (gold line drawings) ----------
  const L = (d, extra = "") => `<path class="ln" pathLength="1" d="${d}" ${extra}/>`;
  const F = (d, fill) => `<path class="fl" d="${d}" fill="${fill}"/>`;
  let s = 3;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;

  const arts = {
    tower() {
      let o = F("M0 360 Q150 330 300 345 T600 340 V420 H0Z", "rgba(201,151,59,.10)");
      o += F("M222 352 L226 150 L375 150 L379 352 Q300 372 222 352Z", "rgba(214,185,139,.16)");
      o += L("M0 360 Q150 330 300 345 T600 340");
      o += L("M0 300 Q120 270 240 290 T480 280 T600 290", 'opacity=".45"');
      o += L("M222 352 L226 150");
      o += L("M379 352 L375 150");
      o += L("M226 150 L240 140 L255 148 L275 134 L300 145 L320 131 L340 146 L360 137 L375 150");
      o += L("M222 352 Q300 372 379 352");
      for (let y = 172; y < 346; y += 22) o += L(`M224 ${y} Q300 ${y + 13} 377 ${y}`, 'opacity=".55"');
      o += L("M286 356 L286 302 Q300 284 314 302 L314 356");
      o += L("M450 90 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0");
      for (let i = 0; i < 9; i++) { const x = 40 + rnd() * 520, y = 20 + rnd() * 110; o += L(`M${x - 4} ${y} H${x + 4} M${x} ${y - 4} V${y + 4}`, 'opacity=".7"'); }
      o += L("M60 345 l10 -24 l8 24 M90 344 l12 -30 l10 30", 'opacity=".6"');
      return o;
    },
    theatre() {
      let o = F("M60 330 A240 170 0 0 1 540 330Z", "rgba(214,185,139,.12)");
      o += L("M0 160 Q140 110 300 130 T600 120", 'opacity=".45"');
      o += L("M520 60 m-26 0 a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0");
      for (let k = 0; k < 8; k++) { const rx = 70 + k * 24, ry = 26 + k * 18.5; o += L(`M${300 - rx} 330 A${rx} ${ry} 0 0 1 ${300 + rx} 330`, k % 2 ? 'opacity=".6"' : ""); }
      for (let a = 1; a < 8; a++) {
        const t = Math.PI * (a / 8), x1 = 300 - Math.cos(t) * 70, y1 = 330 - Math.sin(t) * 26, x2 = 300 - Math.cos(t) * 238, y2 = 330 - Math.sin(t) * 155.5;
        o += L(`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`, 'opacity=".5"');
      }
      o += L("M40 330 H560 V368 H40Z");
      for (let x = 70; x <= 530; x += 46) o += L(`M${x} 368 V396`);
      o += L("M40 396 H560");
      o += L("M0 404 Q300 396 600 404", 'opacity=".5"');
      return o;
    },
    palace() {
      let o = F("M160 352 V232 H440 V352Z", "rgba(214,185,139,.13)");
      o += F("M232 214 Q300 102 368 214Z", "rgba(214,185,139,.18)");
      o += L("M0 352 H600");
      o += L("M160 352 V232 H440 V352");
      o += L("M220 232 V214 H380 V232");
      o += L("M232 214 Q300 102 368 214");
      o += L("M276 352 V284 Q300 252 324 284 V352");
      for (const x of [186, 380]) o += L(`M${x} 330 V290 Q${x + 17} 270 ${x + 34} 290 V330`, 'opacity=".7"');
      o += L("M160 252 H440", 'opacity=".5"');
      o += L("M470 352 A62 15 0 0 0 594 352 A62 15 0 0 0 470 352", 'opacity=".9"');
      o += L("M482 352 A50 10 0 0 0 582 352", 'opacity=".5"');
      o += L("M92 352 Q104 282 88 214");
      o += L("M88 214 Q60 200 36 220 M88 214 Q70 186 44 182 M88 214 Q96 182 122 176 M88 214 Q118 202 140 222 M88 214 Q90 196 82 168");
      o += L("M498 82 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0");
      return o;
    },
    city() {
      let o = "";
      const hill = x => 300 - 30 * Math.sin(x / 90 + 1) - 14 * Math.sin(x / 37);
      let d = "M0 " + hill(0).toFixed(1);
      for (let x = 10; x <= 600; x += 10) d += ` L${x} ${hill(x).toFixed(1)}`;
      o += F(d + " V420 H0Z", "rgba(214,185,139,.07)");
      o += L(d);
      for (let row = 0; row < 4; row++) {
        let x = 4;
        while (x < 590) {
          const w = 12 + rnd() * 14, h = 10 + rnd() * 12, y = hill(x + w / 2) + 6 + row * 26;
          o += L(`M${x.toFixed(1)} ${(y).toFixed(1)} v${(-h).toFixed(1)} h${w.toFixed(1)} v${h.toFixed(1)}`, 'opacity=".6"');
          if (rnd() < .7) o += `<rect class="win" style="--t:${(rnd() * 3).toFixed(2)}s" x="${(x + 3 + rnd() * (w - 7)).toFixed(1)}" y="${(y - h + 3 + rnd() * (h - 7)).toFixed(1)}" width="3" height="3.5" fill="#ffd27a"/>`;
          x += w + 3;
        }
      }
      o += L("M440 300 V110 H476 V300 M486 300 V150 H516 V300");
      for (let y = 124; y < 296; y += 14) o += L(`M446 ${y} H470`, 'opacity=".35"');
      o += L("M120 330 V80");
      o += `<path class="flagw" d="M122 82 h70 v42 h-70z" fill="url(#jflag)"/>`;
      o += L("M516 74 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0");
      for (let i = 0; i < 12; i++) { const x = rnd() * 600, y = rnd() * 90; o += `<circle class="win" style="--t:${(rnd() * 3).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.3" fill="#fff"/>`; }
      return `<defs><linearGradient id="jflag" x1="0" y1="0" x2="0" y2="1"><stop offset=".333" stop-color="#111"/><stop offset=".333" stop-color="#f4f4f4"/><stop offset=".666" stop-color="#f4f4f4"/><stop offset=".666" stop-color="#007a3d"/></linearGradient></defs>` + o + `<path class="flagw" d="M122 82 L150 103 L122 124Z" fill="#ce1126"/>`;
    }
  };
  document.querySelectorAll(".era-art").forEach(svg => { svg.innerHTML = arts[svg.dataset.art](); });
  const eras = [...document.querySelectorAll(".era")].map(el => ({
    el, num: el.querySelector(".era-num"), text: el.querySelector(".era-text"), art: el.querySelector(".era-art"),
    lines: [...el.querySelectorAll(".ln")], fills: [...el.querySelectorAll(".fl, .flagw")]
  }));

  // ---------- gold words ----------
  const wText = document.getElementById("wText");
  const chars = [];
  if (wText) {
    const words = wText.textContent.split(" ");
    wText.innerHTML = words.map(w => `<span class="ww">${[...w].map(c => `<span class="ch">${c}</span>`).join("")}</span>`).join(" ");
    chars.push(...wText.querySelectorAll(".ch"));
  }

  // ---------- lanterns ----------
  const row = document.getElementById("lRow");
  const lanterns = [];
  if (row) {
    const n = innerWidth < 700 ? 5 : 7;
    for (let i = 0; i < n; i++) {
      const t = (i + .5) / n, drop = 40 + Math.sin(t * Math.PI) * 70 + (i % 2 ? 50 : 0);
      const el = document.createElement("div");
      el.className = "lan";
      el.style.left = (t * 100) + "%";
      el.style.setProperty("--drop", drop + "px");
      el.style.setProperty("--sw", (2.6 + (i % 3) * .5) + "s");
      el.style.animationDelay = (-i * .4) + "s";
      el.innerHTML = `<i class="cord"></i><div class="glow"></div>
        <svg viewBox="0 0 60 110"><path d="M24 2h12l4 10H20z" fill="#8a5f1c"/><path d="M14 12h32l6 14H8z" fill="#c9973b"/>
        <path class="glass" d="M10 26h40l-4 52H14z"/><path d="M10 26h40l-4 52H14z" fill="none" stroke="#8a5f1c" stroke-width="2"/>
        <path d="M30 26v52M20 26l-3 52M40 26l3 52M12 44h36M13 62h34" stroke="#8a5f1c" stroke-width="1.6" fill="none"/>
        <path d="M24 34l6-6 6 6-6 6zM24 52l6-6 6 6-6 6z" fill="none" stroke="#f3d58a" stroke-width="1.2" opacity=".8"/>
        <path d="M14 78h32l-6 12H20z" fill="#c9973b"/><path d="M26 90h8l-4 16z" fill="#8a5f1c"/></svg>`;
      row.appendChild(el);
      lanterns.push(el);
    }
  }

  // ---------- spark cursor ----------
  const sc = document.getElementById("sparks");
  let sparks = [];
  if (sc && fine && !reduce) {
    const sx = sc.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2);
    const size = () => { sc.width = innerWidth * dpr; sc.height = innerHeight * dpr; };
    size(); addEventListener("resize", size);
    let lx = 0, ly = 0;
    addEventListener("pointermove", e => {
      const dist = Math.hypot(e.clientX - lx, e.clientY - ly); lx = e.clientX; ly = e.clientY;
      const n = Math.min(4, Math.ceil(dist / 12));
      for (let i = 0; i < n; i++) sparks.push({ x: e.clientX * dpr, y: e.clientY * dpr, vx: (Math.random() - .5) * 1.6 * dpr, vy: (Math.random() - .8) * 1.6 * dpr, life: 1, r: (Math.random() * 1.8 + .6) * dpr });
      if (sparks.length > 220) sparks.splice(0, sparks.length - 220);
    });
    (function frame() {
      sx.clearRect(0, 0, sc.width, sc.height);
      for (const p of sparks) {
        p.x += p.vx; p.y += p.vy; p.vy += .045 * dpr; p.life -= .022;
        if (p.life <= 0) continue;
        sx.beginPath(); sx.arc(p.x, p.y, p.r * p.life + .3, 0, 6.283);
        sx.fillStyle = `rgba(255,${180 + 60 * p.life | 0},${90 + 80 * p.life | 0},${p.life})`; sx.fill();
      }
      sparks = sparks.filter(p => p.life > 0);
      requestAnimationFrame(frame);
    })();
  }

  // ---------- main scroll loop ----------
  const journey = document.querySelector(".journey"), track = document.getElementById("jTrack"), jFill = document.getElementById("jFill");
  const words = document.getElementById("words"), wAr = document.getElementById("wAr");
  const lanSec = document.getElementById("lanterns"), lCopy = document.getElementById("lCopy");
  const pillar = document.getElementById("pillarFill");
  const prog = el => { const r = el.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight)); };

  function drawEra(E, k) {
    const n = E.lines.length;
    E.lines.forEach((ln, i) => { ln.style.strokeDashoffset = (1 - clamp(k * 1.5 - (i / n) * .5)).toFixed(3); });
    const fo = clamp(k * 2 - 1).toFixed(3);
    E.fills.forEach(f => { f.style.opacity = fo; });
  }

  function loop() {
    // journey
    if (journey) {
      const r = journey.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        const p = prog(journey), N = eras.length;
        const pos = p * (N - 1);
        track.style.transform = `translate3d(${(-pos * 100).toFixed(3)}vw,0,0)`;
        jFill.style.width = (p * 100).toFixed(2) + "%";
        const enter = clamp((innerHeight - r.top) / innerHeight);
        eras.forEach((E, i) => {
          const d = pos - i;
          const k = i === 0 ? ease(clamp(enter * 1.15)) : ease(clamp(pos - (i - 1) - .15, 0, 1) / .85);
          drawEra(E, k);
          E.num.style.transform = `translate3d(${(d * 40).toFixed(2)}vw,0,0)`;
          E.text.style.transform = `translate3d(${(d * 22).toFixed(2)}vw,0,0)`;
          E.text.style.opacity = clamp(1 - Math.abs(d) * 1.4).toFixed(3);
          E.art.style.transform = `translate3d(${(d * -12).toFixed(2)}vw,0,0) scale(${(1 - Math.abs(d) * .12).toFixed(3)})`;
        });
      }
    }
    // gold words
    if (words) {
      const p = prog(words), n = chars.length;
      const lit = p * (n + 6);
      chars.forEach((c, i) => {
        const v = clamp(lit - i, 0, 1);
        c.style.setProperty("--v", v.toFixed(3));
      });
      wAr.style.opacity = clamp((p - .75) / .2).toFixed(3);
      wAr.style.transform = `translateY(${((1 - clamp((p - .75) / .2)) * 20).toFixed(1)}px)`;
    }
    // lanterns
    if (lanSec) {
      const p = prog(lanSec), n = lanterns.length;
      lanterns.forEach((el, i) => el.classList.toggle("on", p > (i + .5) / (n + 1.5)));
      const c = clamp((p - .62) / .25);
      lCopy.style.opacity = c.toFixed(3);
      lCopy.style.transform = `translateY(${((1 - c) * 40).toFixed(1)}px) scale(${(.94 + c * .06).toFixed(3)})`;
      lanSec.style.setProperty("--lit", clamp(p * 1.4).toFixed(3));
    }
    // pillar
    if (pillar) {
      const max = document.documentElement.scrollHeight - innerHeight;
      pillar.style.transform = `scaleY(${(max > 0 ? scrollY / max : 0).toFixed(4)})`;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
