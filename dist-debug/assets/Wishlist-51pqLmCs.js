import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { L as Link } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function Wishlist() {
  const [items, setItems] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const saved = localStorage.getItem("colleco.wishlist");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
      }
    }
  }, []);
  function removeItem(id) {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    localStorage.setItem("colleco.wishlist", JSON.stringify(updated));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto max-w-6xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-6", children: "My Wishlist" }),
    items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 bg-gray-50 rounded-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: "Your wishlist is empty" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/packages", className: "text-brand-orange hover:underline", children: "Browse packages" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-xl p-4 bg-white shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg mb-2", children: item.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-3", children: item.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: item.link || "/packages", className: "flex-1 px-3 py-2 bg-brand-orange text-white rounded text-sm text-center", children: "View Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => removeItem(item.id),
            className: "px-3 py-2 bg-brand-russty text-white rounded text-sm hover:bg-brand-brown transition",
            children: "Remove"
          }
        )
      ] })
    ] }, item.id)) })
  ] }) });
}
export {
  Wishlist as default
};
//# sourceMappingURL=Wishlist-51pqLmCs.js.map
