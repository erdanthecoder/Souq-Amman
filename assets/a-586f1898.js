(function () {
  const { escape: esc, formatPrice } = window.SouqAPI;
  const $ = s => document.querySelector(s);
  const KEY = "souq_admin_pw";
  let password = null;
  let imageData = null;

  function store(v) { try { v ? sessionStorage.setItem(KEY, v) : sessionStorage.removeItem(KEY); } catch (_) {} }
  function stored() { try { return sessionStorage.getItem(KEY); } catch (_) { return null; } }

  function setLoading(btn, on) { btn.classList.toggle("loading", on); btn.disabled = on; }

  function unlock(pw) {
    password = pw; store(pw);
    $("#gate").style.display = "none";
    $("#dash").classList.add("show");
    loadMine();
  }

  // ---------- Login ----------
  $("#pwToggle").addEventListener("click", () => {
    const i = $("#pw"); const show = i.type === "password";
    i.type = show ? "text" : "password"; $("#pwToggle").textContent = show ? "Hide" : "Show";
  });

  $("#loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const btn = e.submitter || $("#loginForm button[type=submit]");
    const pw = $("#pw").value;
    setLoading(btn, true);
    try {
      const ok = await SouqAPI.checkPassword(pw);
      if (ok === true) { toast("Unlocked ✓", "ok"); unlock(pw); }
      else {
        const card = $("#gate"); card.classList.remove("bad"); void card.offsetWidth; card.classList.add("bad");
        toast("Wrong password. Please try again.", "err");
      }
    } catch (err) { toast("Connection error: " + err.message, "err"); }
    finally { setLoading(btn, false); }
  });

  $("#logout").addEventListener("click", () => {
    password = null; store(null);
    $("#dash").classList.remove("show");
    $("#gate").style.display = "";
    $("#pw").value = "";
  });

  const saved = stored();
  if (saved) SouqAPI.checkPassword(saved).then(ok => ok === true ? unlock(saved) : store(null)).catch(() => {});

  // ---------- Image handling ----------
  function resize(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) return reject(new Error("Please choose an image file"));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read the file"));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("This image format is not supported"));
        img.onload = () => {
          const max = 1200;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
          const ctx = c.getContext("2d");
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          let q = .85, out = c.toDataURL("image/jpeg", q);
          while (out.length > 900000 && q > .4) { q -= .1; out = c.toDataURL("image/jpeg", q); }
          resolve(out);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function takeFile(file) {
    try {
      imageData = await resize(file);
      const drop = $("#drop");
      drop.querySelectorAll("img.preview, .change").forEach(n => n.remove());
      drop.insertAdjacentHTML("beforeend", `<img class="preview" src="${imageData}" alt=""><span class="change">Change photo</span>`);
      $("#dropHint").style.visibility = "hidden";
      $("#pvImg").src = imageData; $("#pvImg").style.display = ""; $("#pvPh").style.display = "none";
    } catch (err) { toast(err.message, "err"); }
  }

  const drop = $("#drop");
  $("#file").addEventListener("change", e => takeFile(e.target.files[0]));
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, () => drop.classList.remove("over")));
  drop.addEventListener("drop", e => { e.preventDefault(); takeFile(e.dataTransfer.files[0]); });

  // ---------- Live preview ----------
  function updatePreview() {
    $("#pvName").textContent = $("#name").value || "Product name";
    $("#pvDesc").textContent = $("#desc").value || "Your description will appear here.";
    $("#pvPrice").textContent = formatPrice($("#price").value || 0);
    $("#pvAddr").textContent = $("#addr").value || "Amman, Jordan";
  }
  ["name", "desc", "price", "addr"].forEach(id => $("#" + id).addEventListener("input", updatePreview));

  // ---------- Publish ----------
  $("#productForm").addEventListener("submit", async e => {
    e.preventDefault();
    if (!imageData) return toast("Please add a picture of the product", "err");
    const price = parseFloat($("#price").value);
    if (!(price >= 0)) return toast("Please enter a valid price", "err");
    const btn = $("#publish");
    setLoading(btn, true);
    try {
      await SouqAPI.addProduct(password, {
        name: $("#name").value.trim(),
        description: $("#desc").value.trim(),
        price,
        address: $("#addr").value.trim(),
        image: imageData
      });
      confetti();
      toast("Product published! It's now live on the store 🎉", "ok");
      e.target.reset(); imageData = null;
      drop.querySelectorAll("img.preview, .change").forEach(n => n.remove());
      $("#dropHint").style.visibility = "";
      $("#pvImg").style.display = "none"; $("#pvPh").style.display = "grid";
      updatePreview();
      loadMine();
    } catch (err) {
      if (/password/i.test(err.message)) { toast("Wrong password — please unlock again", "err"); $("#logout").click(); }
      else toast("Could not publish: " + err.message, "err");
    } finally { setLoading(btn, false); }
  });

  // ---------- Listed products ----------
  async function loadMine() {
    const list = $("#myList");
    list.innerHTML = `<div class="skeleton" style="aspect-ratio:auto;height:78px"></div>`;
    try {
      const items = await SouqAPI.listProducts();
      $("#myCount").textContent = "(" + items.length + ")";
      if (!items.length) { list.innerHTML = `<p style="color:var(--muted)">Nothing listed yet — your first product will appear here.</p>`; return; }
      list.innerHTML = items.map(p => `
        <div class="my-item">
          <img src="${esc(p.image)}" alt="">
          <div class="t"><b>${esc(p.name)}</b><span>${esc(formatPrice(p.price))}</span></div>
          <button class="del" data-id="${esc(p.id)}" type="button">Delete</button>
        </div>`).join("");
    } catch (err) { list.innerHTML = `<p style="color:#ff9c99">Could not load: ${esc(err.message)}</p>`; }
  }

  $("#myList").addEventListener("click", async e => {
    const b = e.target.closest(".del"); if (!b) return;
    if (!confirm("Delete this product from the store?")) return;
    b.disabled = true; b.textContent = "…";
    try { await SouqAPI.deleteProduct(password, b.dataset.id); toast("Product deleted", "ok"); loadMine(); }
    catch (err) { toast("Could not delete: " + err.message, "err"); b.disabled = false; b.textContent = "Delete"; }
  });
})();
