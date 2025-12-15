import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { C as CONTACT_EMAIL, P as PUBLIC_SITE_URL } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function Contact() {
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [message, setMessage] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    try {
      const res = await fetch("http://localhost:4000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("ok");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("err");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-hidden min-h-screen flex items-start justify-center px-4 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-4xl text-brand-russty", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-4", children: "Contact Us" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface p-6 rounded-md border border-cream-border space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "📍 Address: South Africa, South Coast, Port Shepstone" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "📞 Phone / WhatsApp: 0733994708" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "📧 Email: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${CONTACT_EMAIL}`, className: "underline", children: CONTACT_EMAIL })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "🌍 Website: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: PUBLIC_SITE_URL, target: "_blank", rel: "noreferrer", className: "underline", children: PUBLIC_SITE_URL })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "mt-4 grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
          "Name",
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "block w-full mt-1 p-2 rounded border border-cream-border bg-cream", required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
          "Email",
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "block w-full mt-1 p-2 rounded border border-cream-border bg-cream", required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
          "Message",
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: message, onChange: (e) => setMessage(e.target.value), rows: 4, className: "block w-full mt-1 p-2 rounded border border-cream-border bg-cream", required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-4 py-2 rounded bg-brand-orange text-white text-sm", children: "Send" }),
          status === "ok" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-cream-sand text-brand-brown px-3 py-1 rounded text-sm", children: "Thanks! We'll reply shortly." }),
          status === "err" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-amber-100 text-brand-russty px-3 py-1 rounded text-sm", children: "Could not send right now." })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  Contact as default
};
//# sourceMappingURL=Contact-BKAKnX_9.js.map
