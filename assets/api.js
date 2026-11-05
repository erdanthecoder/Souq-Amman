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
    async listProducts() {
      const res = await fetch(
        C.url + "/rest/v1/amman_products?select=*&order=created_at.desc",
        { headers }
      );
      return handle(res);
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
        p_image: p.image
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
