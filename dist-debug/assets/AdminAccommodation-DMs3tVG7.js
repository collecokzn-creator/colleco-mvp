import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { u as useNavigate } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function AdminAccommodation() {
  const [inventory, setInventory] = reactExports.useState(null);
  const [holds, setHolds] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState({});
  const nav = useNavigate();
  reactExports.useEffect(() => {
    async function doLoad() {
      try {
        const res = await fetch("/api/accommodation/admin");
        if (!res.ok) {
          if (res.status === 401) return nav("/login");
          const txt = await res.text();
          throw new Error(txt);
        }
        const j = await res.json();
        setInventory(j.inventory);
        setHolds(j.holds || {});
      } catch (e) {
        console.error(e);
      }
    }
    doLoad();
  }, [nav]);
  async function saveRoomTypes() {
    const body = { roomTypes: editing };
    const res = await fetch("/api/accommodation/inventory", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) {
      const txt = await res.text();
      alert("Save failed: " + txt);
      return;
    }
    const j = await res.json();
    setInventory(j.inventory);
    setEditing({});
  }
  if (!inventory) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: "Loading admin accommodation…" });
  const roomTypes = inventory.roomTypes || {};
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold mb-4", children: "Accommodation Inventory" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Room Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Price" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: Object.entries(roomTypes).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 font-medium", children: k }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: v.total }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: v.price })
      ] }, k)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Edit Room Types" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { placeholder: "name", onChange: (e) => setEditing({ ...editing, [e.target.value]: editing[e.target.value] || { total: 0, price: 0 } }), className: "border p-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { placeholder: "total", type: "number", onChange: (e) => {
          const k = Object.keys(editing)[0];
          if (!k) return;
          editing[k] = { ...editing[k] || {}, total: Number(e.target.value || 0) };
          setEditing({ ...editing });
        }, className: "border p-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { placeholder: "price", type: "number", step: "0.01", onChange: (e) => {
          const k = Object.keys(editing)[0];
          if (!k) return;
          editing[k] = { ...editing[k] || {}, price: Number(e.target.value || 0) };
          setEditing({ ...editing });
        }, className: "border p-2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: saveRoomTypes, className: "px-3 py-2 bg-brand-orange text-white rounded", children: "Save" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Active Holds" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-2 bg-gray-50 p-2 rounded text-sm overflow-auto", children: JSON.stringify(holds, null, 2) })
    ] })
  ] });
}
export {
  AdminAccommodation as default
};
//# sourceMappingURL=AdminAccommodation-DMs3tVG7.js.map
