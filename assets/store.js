(function () {
  const { escape: esc, formatPrice } = window.SouqAPI;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  $("#year").textContent = new Date().getFullYear();

  let products = [];
  const loaded = SouqAPI.listProducts().then(d => (products = d || [])).catch(err => { products = []; throw err; });

  // ================= INTRO =================
  const stage = $("#introStage");
  const emojis = ["👜", "📱", "🏺", "⌚"];
  const glow = ["rgba(31,174,122,.55)", "rgba(139,108,255,.55)", "rgba(217,149,42,.55)", "rgba(22,181,166,.55)"];
  const start = [[-47, -47], [47, -47], [-47, 47], [47, 47]];
  const spread = [[-150, -70, "-12deg"], [150, -70, "12deg"], [-150, 70, "10deg"], [150, 70, "-10deg"]];
  const tiles = emojis.map((e, i) => {
    const t = document.createElement("div");
    t.className = "i-tile";
    t.textContent = e;
    t.style.background = ["#2a8f4a", "#5b4bd6", "#f4ead8", "#1b9c95"][i];
    t.style.setProperty("--c", glow[i]);
    t.style.setProperty("--x0", start[i][0] + "px"); t.style.setProperty("--y0", start[i][1] + "px");
    t.style.setProperty("--x1", spread[i][0] + "px"); t.style.setProperty("--y1", spread[i][1] + "px");
    t.style.setProperty("--r1", spread[i][2]);
    t.style.animationDelay = `${.1 + i * .12}s, ${1.25 + i * .05}s`;
    stage.appendChild(t);
    return t;
  });
  const word = "Souq Amman";
  $("#introWord").innerHTML = [...word].map((c, i) =>
    `<span class="${c === " " ? "sp" : ""}" style="animation-delay:${1.85 + i * .05}s">${c === " " ? "" : c}</span>`).join("");
  loaded.then(() => products.slice(0, 4).forEach((p, i) => { tiles[i].innerHTML = `<img src="${esc(p.image)}" alt="">`; })).catch(() => {});

  let done = false;
  function finishIntro() {
    if (done) return; done = true;
    const intro = $("#intro");
    intro.classList.add("out");
    document.body.classList.remove("locked");
    setTimeout(() => document.body.classList.add("ready"), 150);
    setTimeout(() => intro.remove(), 1000);
    loaded.then(() => setTimeout(() => countUp($("#statCount"), products.length), 600)).catch(() => {});
  }
  $("#skip").addEventListener("click", finishIntro);
  $("#intro").addEventListener("click", finishIntro);
  setTimeout(finishIntro, reduce ? 200 : 3500);

  // ================= HERO SCENE =================
  const scene = $("#scene"), inner = $("#sceneInner");
  if (matchMedia("(pointer:fine)").matches && !reduce) {
    addEventListener("pointermove", e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      inner.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 12}deg)`;
    });
  }
  function fillHero() {
    if (!products.length) return;
    const core = $("#core");
    core.innerHTML = `<img src="${esc(products[0].image)}" alt="${esc(products[0].name)}">`;
    core.style.cursor = "pointer"; core.onclick = () => openModal(products[0]);
    const rest = products.length > 1 ? products.slice(1, 5) : [];
    $$("[data-slot]").forEach((tile, i) => {
      const p = rest[i]; if (!p) return;
      tile.innerHTML = `<img src="${esc(p.image)}" alt="${esc(p.name)}">`;
      tile.style.cursor = "pointer"; tile.onclick = () => openModal(p);
      const tag = document.querySelector(`[data-tag="${i}"]`);
      if (tag) tag.innerHTML = `${esc(p.name)}<em>${esc(formatPrice(p.price))}</em>`;
    });
    const st = $("#stack");
    st.innerHTML = products.slice(0, 4).map(p => `<i style="background-image:url('${p.image.replace(/'/g, "%27")}')"></i>`).join("");
    $("#miniText").textContent = products.length === 1 ? "1 product available now" : `${products.length} products available now`;
  }

  // ================= FEATURED =================
  function fillFeatured() {
    const cards = $$("#feat .fcard");
    products.slice(0, 4).forEach((p, i) => {
      const c = cards[i];
      c.innerHTML = `<div class="im"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"></div>
        <div class="nm">${esc(p.name)}</div><span class="pr">${esc(formatPrice(p.price))}</span>`;
      c.onclick = () => openModal(p);
    });
    cards.slice(products.length).forEach(c => {
      c.innerHTML = `<div class="im">✨</div><div class="nm" style="color:var(--muted)">More coming soon</div><span class="pr">Stay tuned</span>`;
      c.style.cursor = "default";
    });
  }

  // ================= MARQUEE =================
  const tags = ["👜 Fashion", "📱 Electronics", "🏺 Home & décor", "⌚ Accessories", "📚 Books", "💍 Jewellery", "🪑 Furniture", "🎁 Gifts", "⚽ Sports", "🧸 Kids"];
  const row = tags.map(t => `<span>${t}</span>`).join("");
  $("#mq").innerHTML = row + row;

  // ================= SHOP =================
  const grid = $("#grid");
  let sort = "new";
  const isNew = d => Date.now() - new Date(d).getTime() < 4 * 864e5;
  const pin = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>';

  function card(p, i) {
    const el = document.createElement("article");
    el.className = "card"; el.tabIndex = 0;
    el.style.transitionDelay = `${(i % 4) * 80}ms, ${(i % 4) * 80}ms, ${(i % 4) * 80}ms, ${(i % 4) * 80}ms, ${(i % 4) * 80}ms`;
    el.innerHTML = `
      <div class="im">${isNew(p.created_at) ? '<span class="new">New</span>' : ""}<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"></div>
      <div class="body">
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.description)}</p>
        <div class="foot">
          <div style="min-width:0"><div class="price">${esc(formatPrice(p.price))}</div>
          <div class="loc">${pin}<span>${esc(p.address || "Amman, Jordan")}</span></div></div>
          <span class="go">↗</span>
        </div>
      </div>`;
    el.addEventListener("click", () => openModal(p));
    el.addEventListener("keydown", e => { if (e.key === "Enter") openModal(p); });
    el.addEventListener("transitionend", () => { el.style.transitionDelay = ""; }, { once: true });
    addTilt(el, 6);
    return el;
  }

  function render() {
    const q = $("#q").value.trim().toLowerCase();
    let list = products.filter(p => !q || [p.name, p.description, p.address].some(v => (v || "").toLowerCase().includes(q)));
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    else if (sort === "high") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    grid.innerHTML = "";
    if (!list.length) {
      grid.innerHTML = products.length
        ? `<div class="empty"><div class="big">🔍</div><h3>No matches</h3><p>Try a different word.</p></div>`
        : `<div class="empty"><div class="big">🛍️</div><h3>New products are on the way</h3><p>Our collection is being prepared. Check back very soon.</p></div>`;
      return;
    }
    list.forEach((p, i) => { const el = card(p, i); grid.appendChild(el); observeReveal(el); });
  }

  // segmented control
  const seg = $("#seg"), thumb = seg.querySelector(".thumb");
  function moveThumb() {
    const on = seg.querySelector(".on");
    thumb.style.left = on.offsetLeft + "px"; thumb.style.width = on.offsetWidth + "px";
  }
  seg.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    seg.querySelectorAll("button").forEach(x => x.classList.remove("on"));
    b.classList.add("on"); sort = b.dataset.sort; moveThumb(); render();
  }));
  addEventListener("resize", moveThumb);
  document.fonts && document.fonts.ready.then(moveThumb);
  moveThumb();
  $("#q").addEventListener("input", render);

  loaded.then(() => { render(); fillHero(); fillFeatured(); }).catch(err => {
    grid.innerHTML = `<div class="empty"><div class="big">⚠️</div><h3>Couldn't load products</h3><p>${esc(err.message)}. Please refresh.</p></div>`;
    fillFeatured();
  });

  // ================= MODAL =================
  const modal = $("#modal");
  function openModal(p) {
    $("#mImg").src = p.image; $("#mImg").alt = p.name;
    $("#mTitle").textContent = p.name;
    $("#mPrice").textContent = formatPrice(p.price);
    $("#mDesc").textContent = p.description;
    const a = p.address;
    $("#mAddr").innerHTML = `<div class="addr">${pin.replace(/13/g, "18")}<div><b>${esc(a || "Amman, Jordan")}</b>${a ? `<br><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a + ", Amman, Jordan")}">Open in Google Maps ↗</a>` : ""}</div></div>`;
    $("#mDate").textContent = "Added " + new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    modal.classList.add("open"); document.body.classList.add("locked");
  }
  function closeModal() { modal.classList.remove("open"); document.body.classList.remove("locked"); }
  modal.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeModal));
  addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
})();
