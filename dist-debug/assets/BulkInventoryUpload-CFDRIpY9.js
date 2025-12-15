import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import "./react-4gMnsuNC.js";
function BulkInventoryUpload() {
  const [uploading, setUploading] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(null);
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/inventory/bulk-upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setResult(data);
    } catch (e2) {
      setResult({ error: "Upload failed" });
    } finally {
      setUploading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-6", children: "Bulk Inventory Upload" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 bg-white rounded-xl border shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mb-3", children: "Upload Inventory CSV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Upload a CSV file with your inventory. Required columns: name, type, price, currency, availability" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "file",
          accept: ".csv",
          onChange: handleUpload,
          disabled: uploading,
          className: "border p-2 rounded w-full mb-4"
        }
      ),
      uploading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-600", children: "Uploading..." }),
      result && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-4 p-4 rounded ${result.error ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`, children: result.error ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700", children: result.error }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-700 font-semibold", children: "Upload successful!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          "Processed: ",
          result.processed || 0,
          " items"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-2", children: "CSV Format Example" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-xs bg-white p-3 rounded border overflow-x-auto", children: `name,type,price,currency,availability
Deluxe Room,accommodation,1200,ZAR,10
Standard Room,accommodation,850,ZAR,20
SUV Rental,car,500,ZAR,5` })
    ] })
  ] });
}
export {
  BulkInventoryUpload as default
};
//# sourceMappingURL=BulkInventoryUpload-CFDRIpY9.js.map
