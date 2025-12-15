const API_BASE = "/api";
async function getQuotes() {
  try {
    const res = await fetch(`${API_BASE}/quotes`);
    if (!res.ok) throw new Error("fetch_failed");
    const j = await res.json();
    return j.quotes || [];
  } catch (e) {
    return [];
  }
}
async function createQuote(payload) {
  try {
    const res = await fetch(`${API_BASE}/quotes`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const j = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error("create_failed");
      err.status = res.status;
      err.body = j;
      throw err;
    }
    return j.quote || j || null;
  } catch (e) {
    if (e && e.body) throw e;
    const tmp = { ...payload, id: "tmp_" + Math.random().toString(36).slice(2, 8), createdAt: (/* @__PURE__ */ new Date()).toISOString(), updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return tmp;
  }
}
async function deleteQuote(id) {
  try {
    const res = await fetch(`${API_BASE}/quotes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("delete_failed");
    return true;
  } catch (e) {
    return false;
  }
}
async function updateQuote(id, patch) {
  try {
    const res = await fetch(`${API_BASE}/quotes/${id}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(patch) });
    const j = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error("update_failed");
      err.status = res.status;
      err.body = j;
      throw err;
    }
    return j.quote || null;
  } catch (e) {
    if (e && e.body) throw e;
    return null;
  }
}
export {
  createQuote as c,
  deleteQuote as d,
  getQuotes as g,
  updateQuote as u
};
//# sourceMappingURL=quotes-Cs8OmkV4.js.map
