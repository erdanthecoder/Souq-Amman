(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer:fine)").matches;
  const root = document.documentElement;

  // ---------- Theme ----------
  try { const t = localStorage.getItem("souq_theme"); if (t) root.dataset.theme = t; } catch (_) {}
  function isDark() {
    return root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  }
  document.querySelectorAll("[data-theme-toggle]").forEach(b => b.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("souq_theme", next); } catch (_) {}
  }));
  if (!root.dataset.theme) root.dataset.theme = isDark() ? "dark" : "light";

  // ---------- Network particles ----------
  const cv = document.getElementById("net");
  if (cv) {
    const ctx = cv.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W, H, pts = [], mx = -1e4, my = -1e4;
    const palette = ["31,174,122", "217,149,42", "90,140,255"];
    function size() {
      W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
      const n = Math.min(70, Math.round(innerWidth * innerHeight / 22000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .25 * dpr, vy: (Math.random() - .5) * .25 * dpr,
        r: (Math.random() * 1.4 + .8) * dpr, c: palette[Math.floor(Math.random() * 3)]
      }));
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      const link = 130 * dpr;
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
        if (d < 140 * dpr && d > 0) { p.x += dx / d * .9; p.y += dy / d * .9; }
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < link) {
            ctx.strokeStyle = `rgba(${a.c},${(1 - d / link) * .28})`;
            ctx.lineWidth = dpr * .8; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${a.c},.7)`; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
      }
      if (!reduce) requestAnimationFrame(frame);
    }
    addEventListener("resize", size);
    addEventListener("pointermove", e => { mx = e.clientX * dpr; my = e.clientY * dpr; });
    size(); frame();
  }

  // ---------- Scroll progress + nav ----------
  const bar = document.querySelector(".progress"), nav = document.querySelector(".nav");
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    if (nav) nav.classList.toggle("scrolled", scrollY > 20);
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // ---------- Split headings into words ----------
  document.querySelectorAll(".split").forEach(el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement("span"); s.className = "wd"; s.textContent = part;
            s.style.transitionDelay = (i++ * 70) + "ms"; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .15, rootMargin: "0px 0px -40px 0px" });
  window.observeReveal = el => io.observe(el);
  document.querySelectorAll(".reveal, .split, .net-wrap").forEach(el => io.observe(el));

  // ---------- Count up ----------
  window.countUp = function (el, to, dur) {
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now(); dur = dur || 1600;
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };

  // ---------- Pointer tilt ----------
  window.addTilt = function (el, amt) {
    if (!fine || reduce) return;
    amt = amt || 8;
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateX(${-y * amt}deg) rotateY(${x * amt}deg) translateY(-8px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  };

  // ---------- Toast ----------
  let tt;
  window.toast = function (msg, type) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); document.body.appendChild(t); }
    t.className = "toast " + (type || ""); t.textContent = msg;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 3200);
  };

  // ---------- Confetti ----------
  window.confetti = function () {
    if (reduce) return;
    const colors = ["#1fae7a", "#12805a", "#f2c063", "#d9952a", "#c8102e", "#ffffff"];
    for (let i = 0; i < 100; i++) {
      const c = document.createElement("i"); c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw"; c.style.background = colors[i % colors.length];
      c.style.setProperty("--dx", (Math.random() - .5) * 320 + "px");
      c.style.setProperty("--rot", Math.random() * 1080 + "deg");
      c.style.animationDuration = 1.8 + Math.random() * 1.8 + "s";
      c.style.animationDelay = Math.random() * .4 + "s";
      if (Math.random() < .5) c.style.borderRadius = "50%";
      document.body.appendChild(c); setTimeout(() => c.remove(), 4500);
    }
  };
})();
