(function () {
  const { escape: esc, formatPrice } = window.SouqAPI;
  const $ = s => document.querySelector(s);

  // ---------- Stamped title letters ----------
  let i = 0;
  document.querySelectorAll(".title .ln").forEach(ln => {
    ln.innerHTML = [...ln.dataset.word].map(c => `<span class="lt" style="--d:${(2.55 + i++ * .09).toFixed(2)}s">${c}</span>`).join("");
  });

  // ---------- Collection ----------
  let products = [];
  let sort = "new";
  const grid = $("#grid");
  const pin = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  const isNew = d => Date.now() - new Date(d).getTime() < 4 * 864e5;
  const column = '<svg viewBox="0 0 24 80" fill="currentColor"><rect width="24" height="6"/><rect x="5" y="6" width="14" height="66"/><rect x="1" y="72" width="22" height="8"/></svg>';

  function numberOf(p) {
    const ordered = [...products].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return ordered.indexOf(p) + 1;
  }

  function card(p, idx) {
    const el = document.createElement("article");
    el.className = "art"; el.tabIndex = 0;
    el.style.transitionDelay = `${(idx % 3) * 140}ms`;
    el.innerHTML = `
      ${isNew(p.created_at) ? '<span class="new">NEW</span>' : ""}
      <div class="arch"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"><span class="door l"></span><span class="door r"></span></div>
      <div class="no">Nº ${roman(numberOf(p))}</div>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.description)}</p>
      <div class="plaque">${esc(formatPrice(p.price))}</div>
      <div class="loc">${pin}<span>${esc(p.address || "Amman, Jordan")}</span></div>`;
    el.addEventListener("click", () => openScroll(p));
    el.addEventListener("keydown", e => { if (e.key === "Enter") openScroll(p); });
    el.addEventListener("transitionend", () => { el.style.transitionDelay = ""; }, { once: true });
    const slot = document.createElement("div");
    slot.className = "slot"; slot.appendChild(el);
    return slot;
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
        ? `<div class="empty">${column}<h3>Nothing found</h3><p>No treasure matches that search.</p></div>`
        : `<div class="empty">${column}<h3>The collection is being gathered</h3><p>New treasures arrive soon. Return to the souq shortly.</p></div>`;
      return;
    }
    list.forEach((p, n) => { const el = card(p, n); grid.appendChild(el); observeReveal(el); });
  }

  document.querySelectorAll("#sorts button").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll("#sorts button").forEach(x => x.classList.remove("on"));
    b.classList.add("on"); sort = b.dataset.sort; render();
  }));
  $("#q").addEventListener("input", render);

  SouqAPI.listProducts().then(d => { products = d || []; render(); }).catch(err => {
    grid.innerHTML = `<div class="empty">${column}<h3>The souq could not be reached</h3><p>${esc(err.message)}. Please refresh.</p></div>`;
  });

  // ---------- Scroll modal ----------
  const modal = $("#modal");
  function openScroll(p) {
    $("#mImg").src = p.image; $("#mImg").alt = p.name;
    $("#mNo").textContent = "Nº " + roman(numberOf(p));
    $("#mTitle").textContent = p.name;
    $("#mPrice").textContent = formatPrice(p.price);
    $("#mDesc").textContent = p.description;
    const a = p.address;
    $("#mAddr").innerHTML = `<div class="addr">${pin.replace(/13/g, "18")}<div><b>${esc(a || "Amman, Jordan")}</b>${a ? `<br><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a + ", Amman, Jordan")}">Open in Google Maps ↗</a>` : ""}</div></div>`;
    $("#mDate").textContent = "Added " + new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    modal.querySelector(".sheet").scrollTop = 0;
    modal.classList.add("open"); document.body.classList.add("locked"); if (window.souqLenis) window.souqLenis.stop();
  }
  function closeScroll() { modal.classList.remove("open"); document.body.classList.remove("locked"); if (window.souqLenis) window.souqLenis.start(); }
  modal.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeScroll));
  addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("open")) closeScroll(); });
})();
