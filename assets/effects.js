(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Starfield / floating golden dust
  const canvas = document.getElementById("stars");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w, h, parts = [], mouse = { x: -9999, y: -9999 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      w = canvas.width = innerWidth * dpr; h = canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
      const n = Math.min(140, Math.floor(innerWidth * innerHeight / 9000));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: (Math.random() * 1.6 + .3) * dpr,
        vx: (Math.random() - .5) * .15 * dpr, vy: (-Math.random() * .25 - .05) * dpr,
        a: Math.random() * .6 + .2, t: Math.random() * Math.PI * 2,
        gold: Math.random() < .35
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.t += .02; p.x += p.vx; p.y += p.vy;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 120 * dpr) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        const alpha = p.a * (.6 + .4 * Math.sin(p.t));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? `rgba(255,210,140,${alpha})` : `rgba(255,255,255,${alpha * .7})`;
        ctx.fill();
      }
      if (!reduce) requestAnimationFrame(tick);
    }
    addEventListener("resize", resize);
    addEventListener("pointermove", e => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
    resize(); tick();
  }

  // Cursor glow
  const glow = document.querySelector(".cursor-glow");
  if (glow && matchMedia("(pointer:fine)").matches) {
    addEventListener("pointermove", e => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; });
  }

  // Nav on scroll
  const nav = document.querySelector(".nav");
  if (nav) addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 30), { passive: true });

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: .12 });
  window.observeReveal = el => io.observe(el);
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  // 3D tilt + spotlight
  window.addTilt = function (el) {
    if (!matchMedia("(pointer:fine)").matches || reduce) return;
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(900px) rotateX(${(.5 - y) * 10}deg) rotateY(${(x - .5) * 12}deg) translateY(-6px)`;
      el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  };

  // Toast
  let toastTimer;
  window.toast = function (msg, type) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.className = "toast " + (type || "");
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  };

  // Confetti
  window.confetti = function () {
    if (reduce) return;
    const colors = ["#e9b45c", "#ffd99a", "#d9534f", "#2e9e6a", "#ffffff"];
    for (let i = 0; i < 90; i++) {
      const c = document.createElement("i");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colors[i % colors.length];
      c.style.setProperty("--dx", (Math.random() - .5) * 300 + "px");
      c.style.setProperty("--rot", Math.random() * 1080 + "deg");
      c.style.animationDuration = 1.8 + Math.random() * 1.8 + "s";
      c.style.animationDelay = Math.random() * .4 + "s";
      c.style.borderRadius = Math.random() < .5 ? "50%" : "2px";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4500);
    }
  };
})();
