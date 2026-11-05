(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Nav turns solid once past the citadel
  const nav = document.getElementById("nav");
  const hero = document.querySelector(".hero");
  function onScroll() {
    if (!nav) return;
    const limit = hero ? hero.offsetHeight - 80 : 20;
    nav.classList.toggle("solid", scrollY > limit);
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .14, rootMargin: "0px 0px -40px 0px" });
  window.observeReveal = el => io.observe(el);
  document.querySelectorAll(".reveal, .tablets").forEach(el => io.observe(el));

  // Roman numerals
  window.roman = function (n) {
    const map = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    let s = ""; for (const [v, r] of map) while (n >= v) { s += r; n -= v; } return s;
  };

  // Toast
  let tt;
  window.toast = function (msg, type) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); document.body.appendChild(t); }
    t.className = "toast " + (type || ""); t.textContent = msg;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 3200);
  };

  // Gold confetti
  window.confetti = function () {
    if (reduce) return;
    const colors = ["#f3d58a", "#c9973b", "#8a5f1c", "#007a3d", "#ce1126", "#ffffff"];
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
