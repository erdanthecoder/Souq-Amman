(function () {
  const { escape: esc, formatPrice } = window.SouqAPI;
  const $ = s => document.querySelector(s);

  // ---------- Stamped title letters ----------
  let i = 0;
  document.querySelectorAll(".title .ln").forEach(ln => {
    ln.innerHTML = [...ln.dataset.word].map(c => `<span class="lt" style="--d:${(2.55 + i++ * .09).toFixed(2)}s">${c}</span>`).join("");
  });

  // ---------- Contact ----------
  const WA = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.4-.2z"/></svg>';
  const MAIL = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
  (function contacts() {
    const hello = "Hello! I have a question about Souq Amman.";
    const waL = SouqAPI.whatsappLink(hello), emL = SouqAPI.emailLink("Souq Amman", hello);
    const email = window.SOUQ_CONFIG.email;
    $("#floatContact").innerHTML = (waL ? `<a class="fc wa" target="_blank" rel="noopener" href="${esc(waL)}" aria-label="Chat on WhatsApp">${WA}</a>` : "") +
      (emL ? `<a class="fc em" href="${esc(emL)}" aria-label="Send an email">${MAIL}</a>` : "");
    $("#fContact").innerHTML = (waL ? `<a class="c-btn wa" target="_blank" rel="noopener" href="${esc(waL)}">${WA}<span>WhatsApp</span></a>` : "") +
      (emL ? `<a class="c-btn em" href="${esc(emL)}">${MAIL}<span>${esc(email)}</span></a>` : "");
  })();

  // ---------- Collection ----------
  let products = [];
  let sort = "new";
  let cat = "All";
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
      <div class="arch"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"></div>
      <div class="no">Nº ${roman(numberOf(p))} · ${esc(p.category || "Other")}</div>
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
    let list = products.filter(p => (cat === "All" || (p.category || "Other") === cat) && (!q || [p.name, p.description, p.address, p.category].some(v => (v || "").toLowerCase().includes(q))));
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

  // ---------- categories ----------
  function renderCats() {
    const counts = {};
    products.forEach(p => { const c = p.category || "Other"; counts[c] = (counts[c] || 0) + 1; });
    const list = ["All", ...SouqAPI.categories.filter(c => counts[c])];
    $("#cats").innerHTML = list.map(c => `<button type="button" class="${c === cat ? "on" : ""}" data-cat="${esc(c)}">${esc(c)}<b>${c === "All" ? products.length : counts[c]}</b></button>`).join("");
  }
  $("#cats").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    cat = b.dataset.cat; renderCats(); render();
  });

  SouqAPI.listProducts().then(d => { products = d || []; renderCats(); render(); }).catch(err => {
    grid.innerHTML = `<div class="empty">${column}<h3>The souq could not be reached</h3><p>${esc(err.message)}. Please refresh.</p></div>`;
  });

  // ---------- Scroll modal ----------
  const modal = $("#modal");
  function openScroll(p) {
    $("#mImg").src = p.image; $("#mImg").alt = p.name;
    const thumbs = $("#mThumbs");
    thumbs.innerHTML = "";
    const showGallery = imgs => {
      if (imgs.length < 2) { thumbs.innerHTML = ""; return; }
      thumbs.innerHTML = imgs.map((src, i) => `<button type="button" class="${i ? "" : "on"}" data-i="${i}"><img src="${esc(src)}" alt=""></button>`).join("");
      thumbs.onclick = e => {
        const b = e.target.closest("button"); if (!b) return;
        thumbs.querySelectorAll("button").forEach(x => x.classList.remove("on")); b.classList.add("on");
        const img = $("#mImg"); img.classList.remove("swap"); void img.offsetWidth; img.src = imgs[+b.dataset.i]; img.classList.add("swap");
      };
    };
    const openId = p.id; modal.dataset.pid = openId;
    SouqAPI.getImages(p.id).then(extra => { if (modal.dataset.pid === openId) showGallery([p.image, ...extra]); }).catch(() => {});
    const msg = `Hello! I'm interested in "${p.name}" (${formatPrice(p.price)}) on Souq Amman.`;
    const waL = SouqAPI.whatsappLink(msg), emL = SouqAPI.emailLink("Souq Amman: " + p.name, msg);
    $("#mContact").innerHTML = (waL ? `<a class="c-btn wa" target="_blank" rel="noopener" href="${esc(waL)}">${WA}<span>WhatsApp</span></a>` : "") +
      (emL ? `<a class="c-btn em" href="${esc(emL)}">${MAIL}<span>Email</span></a>` : "");
    $("#mNo").textContent = "Nº " + roman(numberOf(p)) + " · " + (p.category || "Other");
    $("#mTitle").textContent = p.name;
    $("#mPrice").textContent = formatPrice(p.price);
    $("#mDesc").textContent = p.description;
    const a = p.address;
    $("#mAddr").innerHTML = `<div class="addr">${pin.replace(/13/g, "18")}<div><b>${esc(a || "Amman, Jordan")}</b>${a ? `<br><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a + ", Amman, Jordan")}">Open in Google Maps ↗</a>` : ""}</div></div>`;
    $("#mDate").textContent = "Added " + new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    modal.querySelector(".sheet").scrollTop = 0;
    modal.classList.add("open"); document.body.classList.add("locked");
  }
  function closeScroll() { modal.classList.remove("open"); document.body.classList.remove("locked"); }
  modal.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeScroll));
  addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("open")) closeScroll(); });
})();
