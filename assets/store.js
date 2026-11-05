(function () {
  const { escape: esc, formatPrice } = window.SouqAPI;
  const $ = s => document.querySelector(s);
  $("#year").textContent = new Date().getFullYear();

  // ---------- Intro ----------
  const word = "AMMAN";
  $("#introWord").innerHTML = [...word].map((c, i) =>
    `<span style="animation-delay:${.35 + i * .11}s">${c}</span>`).join("");
  let introClosed = false;
  function closeIntro() {
    if (introClosed) return; introClosed = true;
    $("#intro").classList.add("done");
    document.body.classList.remove("locked");
    setTimeout(() => document.body.classList.add("ready"), 250);
    setTimeout(() => $("#intro").remove(), 1700);
  }
  $("#skipIntro").addEventListener("click", closeIntro);
  $("#intro").addEventListener("click", closeIntro);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  setTimeout(closeIntro, reduce ? 300 : 3300);

  // ---------- Marquee ----------
  const words = ["Handmade crafts", "Fashion", "Electronics", "Home & décor", "Antiques", "Books", "Jewellery", "Furniture", "Gifts", "Sports"];
  const half = words.map(w => `<span>${w}</span>`).join("");
  $("#marquee").innerHTML = half + half;

  // ---------- Hero parallax ----------
  const hv = $("#heroVisual");
  if (matchMedia("(pointer:fine)").matches && !reduce) {
    addEventListener("pointermove", e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      hv.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    });
  }

  // ---------- Products ----------
  let products = [];
  const grid = $("#grid");

  function countUp(el, to) {
    const start = performance.now(), dur = 1400;
    (function step(now) {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  function isNew(d) { return Date.now() - new Date(d).getTime() < 3 * 864e5; }

  function card(p, i) {
    const el = document.createElement("article");
    el.className = "product";
    el.tabIndex = 0;
    el.style.transitionDelay = (i % 4) * 90 + "ms";
    el.innerHTML = `
      <div class="img">
        ${isNew(p.created_at) ? '<span class="badge">✦ New</span>' : ""}
        <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
        <span class="price-tag">${esc(formatPrice(p.price))}</span>
      </div>
      <div class="body">
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.description)}</p>
        ${p.address ? `<div class="loc">📍 ${esc(p.address)}</div>` : `<div class="loc">📍 Amman, Jordan</div>`}
      </div>`;
    el.addEventListener("click", () => openModal(p));
    el.addEventListener("keydown", e => { if (e.key === "Enter") openModal(p); });
    addTilt(el);
    return el;
  }

  function render() {
    const q = $("#q").value.trim().toLowerCase();
    const sort = $("#sort").value;
    let list = products.filter(p =>
      !q || [p.name, p.description, p.address].some(v => (v || "").toLowerCase().includes(q)));
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    else if (sort === "high") list.sort((a, b) => b.price - a.price);
    else if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    grid.innerHTML = "";
    if (!list.length) {
      grid.innerHTML = products.length
        ? `<div class="empty" style="grid-column:1/-1"><div class="big">🔍</div><h3>No matches</h3><p>Try another search word.</p></div>`
        : `<div class="empty" style="grid-column:1/-1"><div class="big">🛍️</div><h3>The souq is opening soon</h3><p>No products have been listed yet. Sellers can add the first one from the <a href="sell.html" style="color:var(--gold)">seller studio</a>.</p></div>`;
      return;
    }
    list.forEach((p, i) => { const el = card(p, i); grid.appendChild(el); observeReveal(el); });
  }

  function fillHeroCards() {
    const withImg = products.slice(0, 3);
    document.querySelectorAll(".float-card").forEach((fc, i) => {
      const p = withImg[i]; if (!p) return;
      fc.querySelector(".ph").innerHTML = `<img src="${esc(p.image)}" alt="">`;
      fc.querySelector(".meta").innerHTML = `<span>${esc(p.name)}</span><b>${esc(formatPrice(p.price))}</b>`;
      fc.style.cursor = "pointer";
      fc.onclick = () => openModal(p);
    });
  }

  $("#q").addEventListener("input", render);
  $("#sort").addEventListener("change", render);

  SouqAPI.listProducts().then(data => {
    products = data || [];
    render();
    fillHeroCards();
    const go = () => countUp($("#statCount"), products.length);
    document.body.classList.contains("ready") ? go() : setTimeout(go, 3600);
  }).catch(err => {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="big">⚠️</div><h3>Couldn't load products</h3><p>${esc(err.message)}. Please refresh the page.</p></div>`;
  });

  // ---------- Modal ----------
  const modal = $("#modal");
  function openModal(p) {
    $("#mImg").src = p.image; $("#mImg").alt = p.name;
    $("#mTitle").textContent = p.name;
    $("#mPrice").textContent = formatPrice(p.price);
    $("#mDesc").textContent = p.description;
    const addr = p.address;
    $("#mAddr").innerHTML = addr
      ? `<div class="addr">📍 <div><b>${esc(addr)}</b><br><a style="color:var(--gold)" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr + ", Amman, Jordan")}">Open in Google Maps ↗</a></div></div>`
      : `<div class="addr">📍 <div>Amman, Jordan</div></div>`;
    $("#mDate").textContent = "Listed " + new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    modal.classList.add("open");
    document.body.classList.add("locked");
  }
  function closeModal() { modal.classList.remove("open"); document.body.classList.remove("locked"); }
  modal.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeModal));
  addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
})();
