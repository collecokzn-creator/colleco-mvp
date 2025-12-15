import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import "./react-4gMnsuNC.js";
function AdminChat() {
  const [messages, setMessages] = reactExports.useState([
    { id: 1, from: "Client", text: "Hi, I need help with my booking", timestamp: Date.now() - 36e5 },
    { id: 2, from: "Admin", text: "Hello! I can help. What is your booking ID?", timestamp: Date.now() - 35e5 }
  ]);
  const [newMessage, setNewMessage] = reactExports.useState("");
  function sendMessage() {
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      from: "Admin",
      text: newMessage,
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-6", children: "Admin Chat" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border shadow-sm p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-96 overflow-y-auto bg-gray-50 p-4 rounded mb-4 space-y-3", children: messages.map((msg) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${msg.from === "Admin" ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-w-xs p-3 rounded-lg ${msg.from === "Admin" ? "bg-blue-500 text-white" : "bg-gray-200"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold mb-1", children: msg.from }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: msg.text }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-70 mt-1", children: new Date(msg.timestamp).toLocaleTimeString() })
      ] }) }, msg.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: newMessage,
            onChange: (e) => setNewMessage(e.target.value),
            onKeyPress: (e) => e.key === "Enter" && sendMessage(),
            placeholder: "Type a message...",
            className: "flex-1 border p-2 rounded"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: sendMessage,
            className: "px-4 py-2 bg-blue-600 text-white rounded",
            children: "Send"
          }
        )
      ] })
    ] })
  ] });
}
export {
  AdminChat as default
};
//# sourceMappingURL=AdminChat-BeEbE0lO.js.map
