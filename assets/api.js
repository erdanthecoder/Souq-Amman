(function () {
  const C = window.SOUQ_CONFIG;
  const headers = {
    apikey: C.key,
    Authorization: "Bearer " + C.key,
    "Content-Type": "application/json"
  };

  async function handle(res) {
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || ("Request failed (" + res.status + ")");
      throw new Error(msg);
    }
    return data;
  }

  async function rpc(fn, body) {
    const res = await fetch(C.url + "/rest/v1/rpc/" + fn, {
      method: "POST", headers, body: JSON.stringify(body)
    });
    return handle(res);
  }

  window.SouqAPI = {
    categories: ["Fashion", "Jewellery & Accessories", "Electronics", "Home & Décor", "Furniture", "Beauty", "Books", "Sports", "Kids & Toys", "Other"],
    async listProducts() {
      const res = await fetch(
        C.url + "/rest/v1/amman_products?select=id,name,description,price,address,image,category,created_at&order=created_at.desc",
        { headers }
      );
      return handle(res);
    },
    async getImages(id) {
      const res = await fetch(C.url + "/rest/v1/amman_products?select=images&id=eq." + encodeURIComponent(id), { headers });
      const rows = await handle(res);
      return (rows && rows[0] && rows[0].images) || [];
    },
    whatsappLink(text) {
      const n = String(C.whatsapp || "").replace(/\D/g, "");
      return n ? "https://wa.me/" + n + "?text=" + encodeURIComponent(text) : "";
    },
    emailLink(subject, body) {
      return C.email ? "mailto:" + C.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body) : "";
    },
    checkPassword(password) {
      return rpc("amman_check_password", { p_password: password });
    },
    addProduct(password, p) {
      return rpc("amman_add_product", {
        p_password: password,
        p_name: p.name,
        p_description: p.description,
        p_price: p.price,
        p_address: p.address || null,
        p_image: p.image,
        p_category: p.category || "Other",
        p_images: p.images || []
      });
    },
    deleteProduct(password, id) {
      return rpc("amman_delete_product", { p_password: password, p_id: id });
    },
    formatPrice(v) {
      const n = Number(v);
      return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 }) + " " + C.currency;
    },
    escape(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      }[c]));
    }
  };
})();
