import { j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
const SupplierPayoutDashboard = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-4", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: "Earnings & Payouts" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardTile, { label: "Total Earnings", value: "R 0.00" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardTile, { label: "Pending Payouts", value: "R 0.00" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardTile, { label: "Completed Payouts", value: "R 0.00" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "bg-blue-700 text-white p-3 rounded-xl w-full", children: "Request Payout" })
] });
const DashboardTile = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-gray-100 rounded-xl shadow-sm flex justify-between", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: value })
] });
const RefundStatus = ({ status }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border rounded-xl bg-white", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold", children: "Refund Status" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-blue-600 mt-2", children: [
    "Current: ",
    status
  ] })
] });
export {
  RefundStatus as R,
  SupplierPayoutDashboard as S
};
//# sourceMappingURL=EnhancementStubs-DhElvIJq.js.map
