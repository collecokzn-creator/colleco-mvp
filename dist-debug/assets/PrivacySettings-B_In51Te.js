import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { c as useUser } from "./index-DlOecmR0.js";
import { S as Shield, A as AlertCircle, a4 as CheckCircle, N as Lock, D as Download, a9 as Trash2 } from "./icons-C4AMPM7L.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
const API_BASE = "http://localhost:4000";
async function getConsentHistory(userId) {
  try {
    const response = await fetch(`${API_BASE}/api/legal/consent/${userId}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("[consentApi] getConsentHistory failed:", error);
    throw error;
  }
}
async function getConsentSummary(userId) {
  try {
    const response = await fetch(`${API_BASE}/api/legal/consent-summary/${userId}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("[consentApi] getConsentSummary failed:", error);
    throw error;
  }
}
async function withdrawConsent(userId, reason = "") {
  try {
    const response = await fetch(`${API_BASE}/api/legal/consent/${userId}/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reason: reason || "Not specified"
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("[consentApi] withdrawConsent failed:", error);
    throw error;
  }
}
function PrivacySettings() {
  const { user } = useUser();
  const [consentSummary, setConsentSummary] = reactExports.useState(null);
  const [consentHistory, setConsentHistory] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [withdrawalReason, setWithdrawalReason] = reactExports.useState("");
  const [showWithdrawalConfirm, setShowWithdrawalConfirm] = reactExports.useState(false);
  const [withdrawing, setWithdrawing] = reactExports.useState(false);
  const loadConsentData = reactExports.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const userId = user?.id || user?.email;
      const [summary, history] = await Promise.all([
        getConsentSummary(userId),
        getConsentHistory(userId)
      ]);
      setConsentSummary(summary);
      setConsentHistory(history);
    } catch (err) {
      console.error("Failed to load consent data:", err);
      setError("Failed to load privacy settings: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email]);
  reactExports.useEffect(() => {
    if (!user?.id && !user?.email) {
      setError("Please log in to view privacy settings");
      setLoading(false);
      return;
    }
    loadConsentData();
  }, [loadConsentData]);
  const handleWithdrawConsent = async () => {
    if (!withdrawalReason.trim()) {
      setError("Please provide a reason for withdrawal");
      return;
    }
    try {
      setWithdrawing(true);
      const userId = user?.id || user?.email;
      await withdrawConsent(userId, withdrawalReason);
      setError("");
      setShowWithdrawalConfirm(false);
      setWithdrawalReason("");
      await loadConsentData();
      alert("Consent withdrawn successfully. Your data will be deleted or anonymized per POPI Act requirements.");
    } catch (err) {
      setError("Failed to withdraw consent: " + err.message);
    } finally {
      setWithdrawing(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream p-6 sm:p-10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-12 h-12 text-brand-orange mx-auto mb-4 animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading privacy settings..." })
    ] }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream p-6 sm:p-10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm p-8 text-center max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "w-12 h-12 text-orange-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-brand-brown mb-2", children: "Not Logged In" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: "Please log in to view your privacy settings." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/login", className: "btn btn-primary", children: "Go to Login" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream p-6 sm:p-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-8 h-8 text-brand-orange" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-brand-brown mb-2", children: "Privacy & Data Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Manage your consent and personal data (POPI Act Compliant)" })
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700", children: error }) }),
    consentSummary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown", children: "Terms & Conditions" }),
          consentSummary.termsAccepted ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "w-5 h-5 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "w-5 h-5 text-red-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: consentSummary.termsAccepted ? "Accepted" : "Not accepted" }),
        consentSummary.latestConsent && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Version:" }),
            " ",
            consentSummary.versions?.termsVersion || "N/A"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Date:" }),
            " ",
            new Date(consentSummary.lastConsentDate).toLocaleDateString()
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown", children: "Privacy Policy" }),
          consentSummary.privacyAccepted ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "w-5 h-5 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "w-5 h-5 text-red-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: consentSummary.privacyAccepted ? "Accepted" : "Not accepted" }),
        consentSummary.latestConsent && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Version:" }),
            " ",
            consentSummary.versions?.privacyVersion || "N/A"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Date:" }),
            " ",
            new Date(consentSummary.lastConsentDate).toLocaleDateString()
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown", children: "Service Agreement" }),
          consentSummary.slaAccepted ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle, { className: "w-5 h-5 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "w-5 h-5 text-gray-400" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: consentSummary.slaAccepted ? "Accepted (Partner)" : "Not applicable" }),
        consentSummary.slaAccepted && consentSummary.latestConsent && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Version:" }),
            " ",
            consentSummary.versions?.slaVersion || "N/A"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Date:" }),
            " ",
            new Date(consentSummary.lastConsentDate).toLocaleDateString()
          ] })
        ] })
      ] })
    ] }),
    consentHistory && consentHistory.consentHistory.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-brand-brown mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-5 h-5" }),
        "Consent History"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-6", children: "POPI Act: This is your audit trail showing when you provided consent." }),
      consentHistory.consentHistory.map((record, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:mb-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown capitalize", children: record.consentType?.replace(/_/g, " ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: new Date(record.timestamp).toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-4 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Terms:" }),
            " ",
            record.acceptedTerms?.accepted ? "✓" : "✗"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Privacy:" }),
            " ",
            record.acceptedPrivacy?.accepted ? "✓" : "✗"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "SLA:" }),
            " ",
            record.acceptedSLA?.accepted ? "✓" : "✗"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-400 mt-2", children: [
          "IP: ",
          record.ipAddress,
          " | Version: T",
          record.termsVersion,
          ", P",
          record.privacyVersion,
          ", S",
          record.slaVersion
        ] })
      ] }, idx))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-brand-brown mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-5 h-5" }),
        "Your Data Rights (POPI Act)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6 text-sm text-gray-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-2", children: "✓ Right to Access" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "You have the right to know what personal data CollEco stores about you. Request your data export at any time." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-2", children: "✓ Right to Correct" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "If your information is inaccurate, contact support@colleco.com to request corrections within 5 business days." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-2", children: "✓ Right to Delete" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Withdraw consent to delete your account and personal data. Processing begins within 30 days." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-2", children: "✓ Right to Portability" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Request your data in a machine-readable format (JSON/CSV) for transfer to another service." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 rounded-lg shadow-sm p-6 border border-red-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-red-700 mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-5 h-5" }),
        "Withdraw Consent & Delete Account"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 mb-4", children: "Withdrawing consent will delete your account and personal data per POPI Act requirements. This action cannot be undone." }),
      !showWithdrawalConfirm ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setShowWithdrawalConfirm(true),
          className: "btn bg-red-600 hover:bg-red-700 text-white",
          children: "Withdraw Consent & Delete Account"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Why are you withdrawing consent? (required)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: withdrawalReason,
              onChange: (e) => setWithdrawalReason(e.target.value),
              placeholder: "Please tell us why...",
              className: "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange",
              rows: "3"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "⚠️ Warning:" }),
          " This will permanently delete your account and all associated data."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setShowWithdrawalConfirm(false);
                setWithdrawalReason("");
              },
              className: "btn btn-secondary flex-1",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleWithdrawConsent,
              disabled: withdrawing,
              className: "btn bg-red-600 hover:bg-red-700 text-white flex-1 disabled:opacity-50",
              children: withdrawing ? "Processing..." : "Confirm Withdrawal"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg shadow-sm p-6 mt-8 border border-gray-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-brand-brown mb-4", children: "Privacy Officer Contact" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: "For questions about your privacy rights or to exercise your POPI Act rights, contact our Privacy Officer:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Email:" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:privacy@colleco.com", className: "text-brand-orange hover:underline", children: "privacy@colleco.com" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Phone:" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "tel:+27XXXXXXXXX", className: "text-brand-orange hover:underline", children: "[PLACEHOLDER]" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Address:" }),
          " [PLACEHOLDER - Company address]"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-4", children: "Response time: Within 15 business days per POPI Act requirements" })
      ] })
    ] })
  ] }) });
}
export {
  PrivacySettings as default
};
//# sourceMappingURL=PrivacySettings-B_In51Te.js.map
