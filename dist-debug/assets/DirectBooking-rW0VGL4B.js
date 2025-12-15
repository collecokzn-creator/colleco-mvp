import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import "./react-4gMnsuNC.js";
const DirectBooking = () => {
  const [form, setForm] = reactExports.useState({
    name: "",
    email: "",
    phone: "",
    package: "",
    guests: 1,
    date: ""
  });
  const [submitted, setSubmitted] = reactExports.useState(false);
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }
  if (submitted) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg mx-auto mt-12 p-6 bg-white rounded shadow text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-brand-brown mb-2", children: "Booking Submitted!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4", children: "Thank you for your booking. You will be redirected to payment." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/payment-success", className: "btn bg-yellow-400 text-brand-brown px-4 py-2 rounded", children: "Go to Payment" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-lg mx-auto mt-12 p-6 bg-white rounded shadow", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-brand-brown mb-4", children: "Direct Booking" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          name: "name",
          value: form.name,
          onChange: handleChange,
          placeholder: "Full Name",
          required: true,
          className: "w-full border rounded px-3 py-2"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "email",
          name: "email",
          value: form.email,
          onChange: handleChange,
          placeholder: "Email Address",
          required: true,
          className: "w-full border rounded px-3 py-2"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "tel",
          name: "phone",
          value: form.phone,
          onChange: handleChange,
          placeholder: "Phone Number",
          className: "w-full border rounded px-3 py-2"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          name: "package",
          value: form.package,
          onChange: handleChange,
          placeholder: "e.g., 3-Day Safari Package, Beach Getaway",
          required: true,
          className: "w-full border rounded px-3 py-2"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "number",
          name: "guests",
          value: form.guests,
          onChange: handleChange,
          min: 1,
          placeholder: "Number of Guests",
          required: true,
          className: "w-full border rounded px-3 py-2"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "date",
          name: "date",
          value: form.date,
          onChange: handleChange,
          required: true,
          className: "w-full border rounded px-3 py-2"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "w-full bg-yellow-400 text-brand-brown font-bold py-2 rounded", children: "Book & Pay Now" })
    ] })
  ] });
};
export {
  DirectBooking as default
};
//# sourceMappingURL=DirectBooking-rW0VGL4B.js.map
