import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import "./react-4gMnsuNC.js";
function SupportTickets() {
  const [tickets, setTickets] = reactExports.useState([]);
  const [message, setMessage] = reactExports.useState("");
  const [submitting, setSubmitting] = reactExports.useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), email: "user@example.com" })
      });
      if (res.ok) {
        const data = await res.json();
        setTickets((prev) => [data.ticket, ...prev]);
        setMessage("");
        alert("Ticket submitted successfully!");
      } else {
        alert("Failed to submit ticket");
      }
    } catch (e2) {
      alert("Error submitting ticket");
    } finally {
      setSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-6", children: "Support Tickets" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 p-4 border rounded-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mb-3", children: "Submit a Support Ticket" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: message,
            onChange: (e) => setMessage(e.target.value),
            className: "w-full border rounded p-2 h-32",
            placeholder: "Describe your issue...",
            required: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: submitting,
            className: "mt-3 bg-brand-orange text-white p-2 rounded-xl w-full hover:bg-brand-gold transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed",
            children: submitting ? "Submitting..." : "Submit Ticket"
          }
        )
      ] })
    ] }),
    tickets.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mb-3", children: "Your Tickets" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: tickets.map((ticket) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border rounded-xl bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
              "Ticket #",
              ticket.id
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: ticket.message })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-1 rounded bg-yellow-200", children: "New" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-2", children: new Date(ticket.createdAt).toLocaleString() })
      ] }, ticket.id)) })
    ] })
  ] });
}
export {
  SupportTickets as default
};
//# sourceMappingURL=SupportTickets-BOB_5nBK.js.map
