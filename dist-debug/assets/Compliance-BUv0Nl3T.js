import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { A as AutoSyncBanner } from "./AutoSyncBanner-CKsB_6Rd.js";
import { C as ComplianceStatusCard } from "./ComplianceStatusCard-HFK_OdFt.js";
import "./react-4gMnsuNC.js";
import "./icons-C4AMPM7L.js";
import "./index-DlOecmR0.js";
import "./pdf-DKpnIAzb.js";
function isExpired(ts) {
  if (!ts) return false;
  return Number(ts) < Date.now();
}
function isExpiringSoon(ts, days = 30) {
  if (!ts) return false;
  const now = Date.now();
  const diff = Number(ts) - now;
  return diff > 0 && diff <= days * 24 * 60 * 60 * 1e3;
}
function Compliance() {
  const [providers, setProviders] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [showVerifiedOnly, setShowVerifiedOnly] = reactExports.useState(false);
  const REQUIRED_TYPES = ["license", "insurance", "permit"];
  reactExports.useEffect(() => {
    (async () => {
      return;
    })();
  }, []);
  function computeCounts(list) {
    let valid = 0, expiring = 0, missing = 0;
    for (const p of list) {
      const docs = Array.isArray(p.documents) ? p.documents : [];
      const presentTypes = new Set(docs.map((d) => d.docType));
      for (const t of REQUIRED_TYPES) {
        if (!presentTypes.has(t)) missing += 1;
      }
      for (const d of docs) {
        if (isExpired(d.expiresAt)) continue;
        if (isExpiringSoon(d.expiresAt)) expiring += 1;
        else valid += 1;
      }
    }
    return { valid, expiring, missing };
  }
  const viewProviders = showVerifiedOnly ? (providers || []).filter((p) => p.verified) : providers || [];
  const counts = computeCounts(viewProviders);
  async function onUpload(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const providerId = form.providerId.value;
    const docType = form.docType.value;
    const file = form.file.files?.[0];
    form.expiresAt.value ? new Date(form.expiresAt.value).getTime() : void 0;
    if (!providerId || !docType || !file) return;
    {
      alert("Upload stub — enable API to persist");
      return;
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden min-h-screen flex items-start justify-center px-4 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-4xl text-brand-brown", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-4", children: "🛡️ Compliance Center" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoSyncBanner, { message: "Documents are validated automatically; expiry reminders are sent before deadlines." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ComplianceStatusCard, { valid: counts.valid, expiring: counts.expiring, missing: counts.missing }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream-sand p-4 border border-cream-border rounded", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2", children: "Upload and manage licenses, permits, and insurance documents." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-brown/70 text-sm", children: "Automation-ready placeholder — upload tools and live validation results will appear here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "mt-3 flex flex-col sm:flex-row gap-2", onSubmit: onUpload, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { name: "providerId", className: "border rounded px-2 py-1 flex-1", placeholder: "Provider ID (e.g., hotel-123)", required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { name: "docType", className: "border rounded px-2 py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "license", children: "Business license" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "insurance", children: "Insurance certificate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "permit", children: "Operating permit" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { name: "file", type: "file", className: "border rounded px-2 py-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { name: "expiresAt", type: "date", className: "border rounded px-2 py-1", "aria-label": "Expiry date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-3 py-1.5 bg-brand-orange text-white rounded", children: "Upload" })
      ] }),
      error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-red-600 mt-2", children: error }) : null,
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-brown/70 mt-2", children: "Loading…" }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        counts.expiring > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 text-sm flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1 rounded", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Heads up:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            counts.expiring,
            " document",
            counts.expiring > 1 ? "s" : "",
            " expiring soon."
          ] })
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Providers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "accent-brand-orange", checked: showVerifiedOnly, onChange: (e) => setShowVerifiedOnly(e.target.checked) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Verified only" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-brand-brown/70", children: "Enable API to view persisted providers/documents." })
      ] })
    ] })
  ] }) });
}
export {
  Compliance as default
};
//# sourceMappingURL=Compliance-BUv0Nl3T.js.map
