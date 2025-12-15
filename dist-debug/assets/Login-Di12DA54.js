import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { B as Button } from "./Button-BvBK5int.js";
import { u as useNavigate, c as useUser } from "./index-DlOecmR0.js";
import { S as Shield, $ as AlertTriangle, b as FileText, N as Lock, X, I as Check } from "./icons-C4AMPM7L.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
function LegalConsentModal({
  userId,
  userType = "client",
  onAccept,
  onDecline,
  isRegistration = true
}) {
  const [consents, setConsents] = reactExports.useState({
    termsAndConditions: false,
    privacyPolicy: false,
    dataProcessing: false,
    sla: false,
    marketingCommunications: false,
    thirdPartySharing: false
  });
  const [showDetails, setShowDetails] = reactExports.useState({
    terms: false,
    privacy: false,
    sla: false
  });
  const [agreedAt, setAgreedAt] = reactExports.useState(null);
  const [hasScrolledTerms, setHasScrolledTerms] = reactExports.useState(false);
  const [hasScrolledPrivacy, setHasScrolledPrivacy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const existingConsent = localStorage.getItem(`colleco.legal.consent.${userId}`);
    if (existingConsent) {
      const parsed = JSON.parse(existingConsent);
      setAgreedAt(parsed.agreedAt);
      setConsents(parsed.consents);
    }
  }, [userId]);
  const handleScroll = (type, e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10;
    if (scrolledToBottom) {
      if (type === "terms") setHasScrolledTerms(true);
      if (type === "privacy") setHasScrolledPrivacy(true);
    }
  };
  const toggleConsent = (key) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const canSubmit = () => {
    const requiredConsents = [
      "termsAndConditions",
      "privacyPolicy",
      "dataProcessing"
    ];
    if (userType === "partner") {
      requiredConsents.push("sla");
    }
    return requiredConsents.every((key) => consents[key]);
  };
  const handleAccept = () => {
    if (!canSubmit()) return;
    const consentRecord = {
      userId,
      userType,
      consents,
      agreedAt: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0",
      ipAddress: "client-side",
      // In production, get from server
      userAgent: navigator.userAgent.substring(0, 100)
    };
    localStorage.setItem(`colleco.legal.consent.${userId}`, JSON.stringify(consentRecord));
    if (onAccept) onAccept(consentRecord);
  };
  const handleDecline = () => {
    if (onDecline) onDecline();
  };
  if (agreedAt && !isRegistration) {
    return null;
  }
  const requiredIndicator = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 ml-1", children: "*" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-brand-orange to-brand-gold p-6 text-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-8 h-8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Legal Agreements & Consents" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm opacity-90", children: "Please review and accept the following terms to continue using CollEco Travel" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-50 border-l-4 border-amber-500 p-4 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTriangle, { className: "w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-amber-900 mb-1", children: "Important Legal Notice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-800", children: "By using CollEco Travel, you agree to these legally binding terms. Please read them carefully before proceeding." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-300 rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowDetails((prev) => ({ ...prev, terms: !prev.terms })),
            className: "w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-brand-orange" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown", children: "Terms & Conditions" }),
                requiredIndicator
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: showDetails.terms ? "▼" : "▶" })
            ]
          }
        ),
        showDetails.terms && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "p-4 max-h-64 overflow-y-auto bg-white text-sm text-gray-700 space-y-3",
            onScroll: (e) => handleScroll("terms", e),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-brand-brown", children: "CollEco Travel - Terms & Conditions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Effective Date: December 8, 2025 | Version 1.0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "1. Acceptance of Terms" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "By accessing or using CollEco Travel services, you agree to be bound by these Terms and Conditions." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "2. Service Description" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "CollEco Travel is a platform connecting travelers with accommodation, experiences, and travel services in South Africa and internationally." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "3. User Responsibilities" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 pl-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Provide accurate and complete information" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Maintain the confidentiality of your account credentials" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Use the platform in compliance with applicable laws" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Honor all confirmed bookings" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "4. Booking & Payment Terms" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "All bookings are subject to availability and confirmation. Payment is required at the time of booking unless otherwise specified. Cancellation policies vary by service provider." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "5. Cancellation & Refund Policy" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 pl-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Free cancellation: 48+ hours before service date (unless specified otherwise)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "50% refund: 24-48 hours before service date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "No refund: Less than 24 hours or no-show" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Partner-specific policies may apply" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "6. Limitation of Liability" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "CollEco Travel acts as an intermediary. We are not liable for service provider actions, travel disruptions, or indirect damages. Maximum liability is limited to the booking value." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "7. Intellectual Property" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "All content, logos, and trademarks are property of CollEco Travel or licensed partners. Unauthorized use is prohibited." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "8. Dispute Resolution" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Disputes shall be resolved through good faith negotiation. If unresolved, matters will be subject to South African law and jurisdiction." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "9. Modifications" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We reserve the right to modify these terms. Users will be notified of material changes." })
              ] }),
              !hasScrolledTerms && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 italic mt-4", children: "⚠️ Please scroll to the bottom to review all terms" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-300 rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowDetails((prev) => ({ ...prev, privacy: !prev.privacy })),
            className: "w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-5 h-5 text-brand-orange" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown", children: "Privacy Policy & POPI Act Compliance" }),
                requiredIndicator
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: showDetails.privacy ? "▼" : "▶" })
            ]
          }
        ),
        showDetails.privacy && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "p-4 max-h-64 overflow-y-auto bg-white text-sm text-gray-700 space-y-3",
            onScroll: (e) => handleScroll("privacy", e),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-brand-brown", children: "Privacy Policy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "In compliance with the Protection of Personal Information Act (POPI Act, 2013)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "1. Information We Collect" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 pl-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Personal Information:" }),
                    " Name, email, phone, ID number (as required)"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Business Information:" }),
                    " Company name, registration number, tax details"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Booking Data:" }),
                    " Travel preferences, payment details, booking history"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Technical Data:" }),
                    " IP address, browser type, device information"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "2. How We Use Your Information" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 pl-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Process bookings and payments" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Provide customer support" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Send service-related communications" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Improve platform functionality (with consent)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Comply with legal obligations" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "3. Data Sharing & Disclosure" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We share data only with:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 pl-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Service providers (hotels, tour operators) to fulfill bookings" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Payment processors for secure transactions" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Legal authorities when required by law" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "4. Your POPI Act Rights" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 pl-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Access:" }),
                    " Request copies of your personal data"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Correction:" }),
                    " Update inaccurate information"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Deletion:" }),
                    " Request data erasure (subject to legal retention)"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Objection:" }),
                    " Object to specific data processing activities"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Portability:" }),
                    " Receive data in structured format"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "5. Data Security" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We implement industry-standard security measures including encryption (HTTPS/TLS), access controls, and regular security audits." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "6. Data Retention" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Personal data is retained for 7 years for tax/legal compliance, then securely deleted unless consent is renewed." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "7. Cookies & Tracking" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "We use essential cookies for functionality and optional cookies for analytics (with your consent)." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "8. Contact Information" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Information Officer: privacy@collecotravel.co.za | Response time: 30 days" })
              ] }),
              !hasScrolledPrivacy && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 italic mt-4", children: "⚠️ Please scroll to the bottom to review the complete policy" })
            ]
          }
        )
      ] }),
      userType === "partner" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-300 rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowDetails((prev) => ({ ...prev, sla: !prev.sla })),
            className: "w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-brand-orange" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-brand-brown", children: "Service Level Agreement (SLA)" }),
                requiredIndicator
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-500", children: showDetails.sla ? "▼" : "▶" })
            ]
          }
        ),
        showDetails.sla && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 max-h-64 overflow-y-auto bg-white text-sm text-gray-700 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-brand-brown", children: "Partner Service Level Agreement" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "1. Response Times" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 pl-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Booking requests: Respond within 4 hours" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Customer inquiries: Respond within 2 hours during business hours" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Cancellations: Process within 1 hour" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "2. Availability Standards" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Maintain 99% platform uptime. Update availability calendars in real-time." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "3. Quality Standards" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc list-inside space-y-1 pl-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Maintain minimum 4.0/5.0 average rating" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Accurate service descriptions and photos" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Honor confirmed bookings" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "4. Payment Terms" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Commission deducted from bookings. Payouts processed within 7 business days of service completion." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-semibold", children: "5. Termination" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Either party may terminate with 30 days notice. Immediate termination for breach of terms." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 p-6 rounded-lg space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-brand-brown mb-4", children: "Required Consents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: consents.termsAndConditions,
              onChange: () => toggleConsent("termsAndConditions"),
              className: "mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
            "I have read and agree to the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Terms & Conditions" }),
            " ",
            requiredIndicator
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: consents.privacyPolicy,
              onChange: () => toggleConsent("privacyPolicy"),
              className: "mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
            "I have read and agree to the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Privacy Policy" }),
            " ",
            requiredIndicator
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: consents.dataProcessing,
              onChange: () => toggleConsent("dataProcessing"),
              className: "mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
            "I consent to the processing of my personal data as described in the Privacy Policy (POPI Act compliance) ",
            requiredIndicator
          ] })
        ] }),
        userType === "partner" && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: consents.sla,
              onChange: () => toggleConsent("sla"),
              className: "mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
            "I agree to the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Service Level Agreement" }),
            " and commit to meeting service standards ",
            requiredIndicator
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-gray-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-gray-700 mb-3", children: "Optional Preferences" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: consents.marketingCommunications,
                onChange: () => toggleConsent("marketingCommunications"),
                className: "mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "I would like to receive promotional offers, travel tips, and updates from CollEco Travel" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: consents.thirdPartySharing,
                onChange: () => toggleConsent("thirdPartySharing"),
                className: "mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "I consent to sharing my data with trusted partners for enhanced service offerings" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-blue-900 mb-2", children: "📋 Legal Information" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-blue-800 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• CollEco Travel (Pty) Ltd - Registration: [To be completed]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Registered Address: [To be completed]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Information Officer: privacy@collecotravel.co.za" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Governed by South African law" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t p-6 bg-gray-50 flex gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleDecline,
          className: "flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" }),
            "Decline"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleAccept,
          disabled: !canSubmit(),
          className: `flex-1 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${canSubmit() ? "bg-brand-orange text-white hover:bg-brand-gold" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-5 h-5" }),
            "Accept & Continue"
          ]
        }
      )
    ] })
  ] }) });
}
function Login() {
  const [tab, setTab] = reactExports.useState("login");
  const [userType, setUserType] = reactExports.useState("client");
  const [loginIdentifier, setLoginIdentifier] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [country, setCountry] = reactExports.useState("");
  const [dateOfBirth, setDateOfBirth] = reactExports.useState("");
  const [businessName, setBusinessName] = reactExports.useState("");
  const [businessType, setBusinessType] = reactExports.useState("");
  const [businessAddress, setBusinessAddress] = reactExports.useState("");
  const [registrationNumber, setRegistrationNumber] = reactExports.useState("");
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [success, setSuccess] = reactExports.useState("");
  const [showLegalConsent, setShowLegalConsent] = reactExports.useState(false);
  const [pendingUserData, setPendingUserData] = reactExports.useState(null);
  const [keepLoggedIn, setKeepLoggedIn] = reactExports.useState(() => {
    try {
      return (localStorage.getItem("user:persistence") || "local") === "local";
    } catch {
      return true;
    }
  });
  const [useBiometrics, setUseBiometrics] = reactExports.useState(() => {
    try {
      return localStorage.getItem("user:biometrics") === "1";
    } catch {
      return false;
    }
  });
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useUser();
  const e2eForceShowForm = typeof window !== "undefined" && window.__E2E__;
  const effectiveUser = e2eForceShowForm ? null : currentUser;
  function validateEmail(email2) {
    return /\S+@\S+\.\S+/.test(email2);
  }
  async function handleBiometricLogin() {
    setError("");
    setSuccess("");
    const biometricEnabled = localStorage.getItem("user:biometrics") === "1";
    const lastUser = localStorage.getItem("user:lastIdentifier");
    if (!biometricEnabled || !lastUser) {
      setError("Biometric login not set up. Please login with password first and enable biometrics.");
      return;
    }
    if (window.PublicKeyCredential) {
      try {
        const user = JSON.parse(localStorage.getItem("user:" + lastUser));
        if (user) {
          setSuccess("Biometric login successful! Welcome, " + user.name + ".");
          setUser(user);
          setTimeout(() => navigate("/"), 800);
        } else {
          setError("Biometric authentication failed. Please use password.");
        }
      } catch (err) {
        setError("Biometric authentication not available or failed.");
      }
    } else {
      setError("Biometric authentication not supported on this device.");
    }
  }
  function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!loginIdentifier || loginIdentifier.trim().length === 0) {
      setError("Please enter your email or phone number.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    let user = JSON.parse(localStorage.getItem("user:" + loginIdentifier));
    if (!user) {
      const allKeys = Object.keys(localStorage).filter((key) => key.startsWith("user:"));
      for (const key of allKeys) {
        try {
          const userData = JSON.parse(localStorage.getItem(key));
          if (userData.email === loginIdentifier || userData.phone === loginIdentifier) {
            user = userData;
            break;
          }
        } catch (e2) {
        }
      }
    }
    if (!user || user.password !== password) {
      setError("Invalid credentials. Please check your email/phone and password.");
      return;
    }
    localStorage.setItem("user:lastIdentifier", loginIdentifier);
    setSuccess("Login successful! Welcome, " + user.name + ".");
    try {
      if (typeof window !== "undefined" && window.__E2E__) {
        window.__E2E_LOGS__ = window.__E2E_LOGS__ || [];
        window.__E2E_LOGS__.push({ ts: Date.now(), msg: "handleLogin: setUser", email: user.email });
      }
    } catch (e2) {
    }
    try {
      localStorage.setItem("user:persistence", keepLoggedIn ? "local" : "session");
    } catch (e2) {
    }
    try {
      localStorage.setItem("user:biometrics", useBiometrics ? "1" : "0");
    } catch (e2) {
    }
    try {
      if (typeof window !== "undefined" && window.__E2E__) {
        window.__E2E_USER__ = user;
        window.__E2E_LOGS__ = window.__E2E_LOGS__ || [];
        window.__E2E_LOGS__.push({ ts: Date.now(), msg: "handleLogin: set __E2E_USER__ (pre-setUser)", email: user.email });
        try {
          if (keepLoggedIn) {
            localStorage.setItem("user", JSON.stringify(user));
            sessionStorage.removeItem("user");
          } else {
            sessionStorage.setItem("user", JSON.stringify(user));
            localStorage.removeItem("user");
          }
          localStorage.setItem("user:persistence", keepLoggedIn ? "local" : "session");
          localStorage.setItem("user:biometrics", useBiometrics ? "1" : "0");
        } catch (err) {
          window.__E2E_LOGS__.push({ ts: Date.now(), msg: "handleLogin: storage write failed", err: String(err) });
        }
        try {
          window.__E2E_PROFILE_LOADED__ = true;
        } catch (err) {
        }
        try {
          if (typeof document !== "undefined" && document.body) {
            document.body.setAttribute("data-e2e-login-success", user && user.name || "");
          }
        } catch (err) {
        }
        window.__E2E_LOGS__.push({ ts: Date.now(), msg: "handleLogin: set PROFILE_LOADED and marker" });
        setUser(user);
        window.__E2E_LOGS__.push({ ts: Date.now(), msg: "handleLogin: setUser called (E2E)" });
        try {
          navigate("/");
          window.__E2E_LOGS__.push({ ts: Date.now(), msg: "handleLogin: navigated synchronously (E2E)" });
        } catch (err) {
          window.__E2E_LOGS__.push({ ts: Date.now(), msg: "handleLogin: navigate failed", err: String(err) });
        }
        return;
      }
    } catch (e2) {
      try {
        window.__E2E_LOGS__ = window.__E2E_LOGS__ || [];
        window.__E2E_LOGS__.push({ ts: Date.now(), msg: "handleLogin: e2e wrapper failure", err: String(e2) });
      } catch (e3) {
      }
    }
    setUser(user);
    try {
      if (typeof window !== "undefined" && window.__E2E__) {
        window.__E2E_LOGS__ = window.__E2E_LOGS__ || [];
        try {
          window.__E2E_PROFILE_LOADED__ = true;
        } catch (err) {
        }
        try {
          if (typeof document !== "undefined" && document.body) {
            document.body.setAttribute("data-e2e-login-success", user && user.name || "");
          }
        } catch (err) {
        }
        window.__E2E_LOGS__.push({ ts: Date.now(), msg: "handleLogin: e2e-flag-set-and-marker" });
        setTimeout(() => {
          try {
            window.__E2E_PROFILE_LOADED__ = true;
          } catch (err) {
          }
          window.__E2E_LOGS__.push({ ts: Date.now(), msg: "handleLogin: e2e-navigating-after-tick" });
          navigate("/");
        }, 300);
        return;
      }
    } catch (e2) {
    }
    setTimeout(() => navigate("/"), 800);
  }
  function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!email || !validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phone || phone.trim().length < 5) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!country || country.trim().length < 2) {
      setError("Please select your country for security and emergency contact purposes.");
      return;
    }
    if (userType === "partner") {
      if (!businessName || businessName.trim().length < 2) {
        setError("Please enter your business name.");
        return;
      }
      if (!businessType) {
        setError("Please select your business type.");
        return;
      }
      if (!businessAddress || businessAddress.trim().length < 5) {
        setError("Please enter your business address.");
        return;
      }
    }
    if (email && localStorage.getItem("user:" + email)) {
      setError("An account with this email already exists.");
      return;
    }
    const identifier = email || phone;
    const newUser = {
      email: email || "",
      password,
      name: name.trim(),
      phone: phone.trim() || "",
      country: country.trim(),
      dateOfBirth: dateOfBirth || "",
      role: userType,
      // 'client' or 'partner'
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (userType === "partner") {
      newUser.businessName = businessName.trim();
      newUser.businessType = businessType;
      newUser.businessAddress = businessAddress.trim();
      newUser.registrationNumber = registrationNumber.trim() || "";
    }
    setPendingUserData({ user: newUser, identifier });
    setShowLegalConsent(true);
  }
  function handleLegalConsentAccept(consentRecord) {
    if (!pendingUserData) return;
    const { user, identifier } = pendingUserData;
    user.legalConsent = consentRecord;
    localStorage.setItem("user:" + identifier, JSON.stringify(user));
    try {
      localStorage.setItem("user:persistence", keepLoggedIn ? "local" : "session");
    } catch (e) {
    }
    try {
      localStorage.setItem("user:biometrics", useBiometrics ? "1" : "0");
    } catch (e) {
    }
    setShowLegalConsent(false);
    setPendingUserData(null);
    setSuccess("Registration successful! Redirecting to home...");
    setUser(user);
    try {
      if (typeof window !== "undefined" && window.__E2E__) {
        window.__E2E_USER__ = user;
        window.__E2E_PROFILE_LOADED__ = true;
        if (keepLoggedIn) {
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          sessionStorage.setItem("user", JSON.stringify(user));
        }
      }
    } catch (e) {
    }
    setTimeout(() => navigate("/"), 800);
  }
  function handleLegalConsentDecline() {
    setShowLegalConsent(false);
    setPendingUserData(null);
    setError("You must accept the Terms & Conditions to create an account.");
  }
  function handleLogout() {
    setUser(null);
    setEmail("");
    setPassword("");
    setError("");
    setSuccess("");
  }
  if (effectiveUser) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream flex items-center justify-center px-4 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full bg-white rounded-2xl shadow-sm p-8 border border-cream-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-24 mx-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("picture", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("source", { srcSet: "/assets/Globeicon-128.webp", type: "image/webp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: "/assets/Globeicon.png",
              alt: "CollEco Travel Globe",
              className: "w-full h-full object-contain",
              width: "96",
              height: "96",
              loading: "lazy",
              decoding: "async"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-brand-brown mb-2", children: "Welcome to your world of travel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl text-brand-russty", children: effectiveUser.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream-sand p-6 border border-cream-border rounded-lg mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-russty mb-4", children: "You are logged in and ready to explore the world." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { fullWidth: true, variant: "primary", size: "md", onClick: handleLogout, children: "Logout" }) })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-cream flex items-center justify-center px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl px-6 pt-10 pb-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("picture", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("source", { srcSet: "/assets/Globeicon-128.webp", type: "image/webp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: "/assets/Globeicon.png",
              alt: "CollEco Travel",
              className: "w-24 h-24 object-contain",
              width: "96",
              height: "96",
              loading: "lazy",
              decoding: "async"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-brand-brown mb-2", children: "CollEco Travel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-russty", children: "Start your journey with us" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex mb-6 gap-3 bg-white p-2 rounded-xl shadow-sm border border-cream-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            "data-e2e": "login-tab",
            className: `flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${tab === "login" ? "bg-brand-orange text-white" : "text-brand-brown bg-white border border-cream-border hover:border-brand-orange"}`,
            onClick: () => {
              setTab("login");
              setError("");
              setSuccess("");
              setName("");
              setPhone("");
              setCountry("");
              setDateOfBirth("");
              setUserType("client");
              setBusinessName("");
              setBusinessType("");
              setBusinessAddress("");
              setRegistrationNumber("");
            },
            children: "Login"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            "data-e2e": "register-tab",
            className: `flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${tab === "register" ? "bg-brand-orange text-white" : "text-brand-brown bg-white border border-cream-border hover:border-brand-orange"}`,
            onClick: () => {
              setTab("register");
              setError("");
              setSuccess("");
              setUserType("client");
              setBusinessName("");
              setBusinessType("");
              setBusinessAddress("");
              setRegistrationNumber("");
            },
            children: "Register"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          "data-e2e": "login-form",
          className: "bg-white rounded-2xl shadow-sm p-8 border border-cream-border max-h-[80vh] overflow-y-auto",
          onSubmit: tab === "login" ? handleLogin : handleRegister,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-brand-brown mb-2", children: tab === "login" ? "Welcome Back" : "Create Your Account" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: tab === "login" ? "Sign in to continue your adventure" : "Complete your profile to start your journey" })
            ] }),
            tab === "register" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-3 text-brand-brown font-semibold text-sm", children: "I'm registering as a: *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      className: `flex-1 px-4 py-3 rounded-lg font-semibold border-2 transition-colors ${userType === "client" ? "bg-brand-orange text-white border-brand-orange" : "bg-white text-brand-brown border-cream-border hover:border-brand-orange"}`,
                      onClick: () => setUserType("client"),
                      children: "✈️ Traveler"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      className: `flex-1 px-4 py-3 rounded-lg font-semibold border-2 transition-colors ${userType === "partner" ? "bg-brand-orange text-white border-brand-orange" : "bg-white text-brand-brown border-cream-border hover:border-brand-orange"}`,
                      onClick: () => setUserType("partner"),
                      children: "🏢 Business Partner"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-brand-brown font-semibold text-sm", children: userType === "partner" ? "Contact Name *" : "Name *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    className: "w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors",
                    value: name,
                    onChange: (e) => setName(e.target.value),
                    placeholder: "e.g., Bika Collin Mkhize",
                    required: true
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty mt-1", children: userType === "partner" ? "Primary contact person's name" : "How you'd like to be addressed" })
              ] }),
              userType === "partner" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-brand-brown font-semibold text-sm", children: "Business Name *" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      className: "w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors",
                      value: businessName,
                      onChange: (e) => setBusinessName(e.target.value),
                      placeholder: "e.g., Safari Adventures Ltd",
                      required: true
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-brand-brown font-semibold text-sm", children: "Business Type *" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "select",
                    {
                      className: "w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors",
                      value: businessType,
                      onChange: (e) => setBusinessType(e.target.value),
                      required: true,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select business type" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Hotel", children: "Hotel / Accommodation" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Tour Operator", children: "Tour Operator" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Transport", children: "Transport Services" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Restaurant", children: "Restaurant / Catering" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Activity Provider", children: "Activity Provider" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Travel Agency", children: "Travel Agency" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Other", children: "Other" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-brand-brown font-semibold text-sm", children: "Business Address *" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      className: "w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors",
                      value: businessAddress,
                      onChange: (e) => setBusinessAddress(e.target.value),
                      placeholder: "Full business address including city and postal code",
                      rows: "2",
                      required: true
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-brand-brown font-semibold text-sm", children: "Registration Number" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      className: "w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors",
                      value: registrationNumber,
                      onChange: (e) => setRegistrationNumber(e.target.value),
                      placeholder: "Business/Tax registration number (optional)"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty mt-1", children: "Optional - helps verify your business" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-brand-brown font-semibold text-sm", children: "Email Address *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "email",
                    className: "w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors",
                    value: email,
                    onChange: (e) => setEmail(e.target.value),
                    placeholder: "you@example.com",
                    required: true
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty mt-1", children: "Required for account verification and communication" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-brand-brown font-semibold text-sm", children: "Phone Number *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "tel",
                    className: "w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors",
                    value: phone,
                    onChange: (e) => setPhone(e.target.value),
                    placeholder: "+27 12 345 6789",
                    required: true
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty mt-1", children: "Required for booking confirmations and support" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-brand-brown font-semibold text-sm", children: "Country *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    className: "w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors",
                    value: country,
                    onChange: (e) => setCountry(e.target.value),
                    required: true,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select your country" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "South Africa", children: "South Africa" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Botswana", children: "Botswana" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Zimbabwe", children: "Zimbabwe" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Namibia", children: "Namibia" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Zambia", children: "Zambia" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Mozambique", children: "Mozambique" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Kenya", children: "Kenya" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Tanzania", children: "Tanzania" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Uganda", children: "Uganda" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Rwanda", children: "Rwanda" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Other", children: "Other" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty mt-1", children: "Required for emergency assistance and travel documentation" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-brand-brown font-semibold text-sm", children: "Date of Birth" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "date",
                    className: "w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors",
                    value: dateOfBirth,
                    onChange: (e) => setDateOfBirth(e.target.value)
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty mt-1", children: "Optional - helps us personalize your experience. Minors can use parent/guardian account" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-brand-brown font-semibold text-sm", children: "Password *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: showPassword ? "text" : "password",
                      className: "w-full px-4 py-3 border-2 border-cream-border rounded-lg pr-12 focus:border-brand-orange focus:outline-none transition-colors",
                      value: password,
                      onChange: (e) => setPassword(e.target.value),
                      placeholder: "At least 6 characters",
                      required: true,
                      "aria-label": "Password"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowPassword((v) => !v),
                      "aria-label": showPassword ? "Hide password" : "Show password",
                      "aria-pressed": showPassword,
                      className: "absolute inset-y-0 right-3 my-auto h-10 w-10 flex items-center justify-center rounded-lg hover:bg-cream-sand text-brand-russty transition-colors",
                      title: showPassword ? "Hide" : "Show",
                      children: showPassword ? "🙈" : "👁️"
                    }
                  )
                ] })
              ] })
            ] }),
            tab === "login" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-brand-brown font-semibold text-sm", children: "Email or Phone Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    className: "w-full px-4 py-3 border-2 border-cream-border rounded-lg focus:border-brand-orange focus:outline-none transition-colors",
                    value: loginIdentifier,
                    onChange: (e) => setLoginIdentifier(e.target.value),
                    placeholder: "email@example.com or +27 12 345 6789",
                    required: true
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty mt-1", children: "Enter your email address or phone number" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mb-2 text-brand-brown font-semibold text-sm", children: "Password" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: showPassword ? "text" : "password",
                      className: "w-full px-4 py-3 border-2 border-cream-border rounded-lg pr-12 focus:border-brand-orange focus:outline-none transition-colors",
                      value: password,
                      onChange: (e) => setPassword(e.target.value),
                      placeholder: "Enter your password (e.g., SecurePass123)",
                      required: true,
                      "aria-label": "Password"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowPassword((v) => !v),
                      "aria-label": showPassword ? "Hide password" : "Show password",
                      "aria-pressed": showPassword,
                      className: "absolute inset-y-0 right-3 my-auto h-10 w-10 flex items-center justify-center rounded-lg hover:bg-cream-sand text-brand-russty transition-colors",
                      title: showPassword ? "Hide" : "Show",
                      children: showPassword ? "🙈" : "👁️"
                    }
                  )
                ] })
              ] })
            ] }),
            error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 bg-amber-100 border border-amber-300 text-brand-russty p-4 rounded-lg font-semibold animate-shake", children: [
              "⚠️ ",
              error
            ] }),
            success && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 bg-cream-sand border border-brand-gold text-brand-brown p-4 rounded-lg font-semibold animate-fade-in", children: [
              "✓ ",
              success
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    "data-e2e": "keep-logged-in",
                    type: "checkbox",
                    checked: keepLoggedIn,
                    onChange: (e) => setKeepLoggedIn(e.target.checked),
                    className: "w-4 h-4 accent-brand-orange border-cream-border rounded focus:ring-brand-orange"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-russty", children: "Keep me logged in" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    "data-e2e": "use-biometrics",
                    type: "checkbox",
                    checked: useBiometrics,
                    onChange: (e) => setUseBiometrics(e.target.checked),
                    className: "w-4 h-4 accent-brand-orange border-cream-border rounded focus:ring-brand-orange"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-brand-russty", children: "Biometrics" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { "data-e2e": "submit", type: "submit", fullWidth: true, variant: "primary", size: "lg", children: tab === "login" ? "Sign In →" : "Create Account →" }),
            tab === "login" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full border-t border-cream-border" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-white px-2 text-brand-russty", children: "Or login with" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "md", onClick: handleBiometricLogin, className: "flex flex-col sm:flex-row items-center justify-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "👤" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm sm:text-base", children: "Face ID" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "md", onClick: handleBiometricLogin, className: "flex flex-col sm:flex-row items-center justify-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "👆" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm sm:text-base", children: "Fingerprint" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty text-center mt-2", children: "Enable biometrics in settings after first login" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-brand-russty", children: [
              tab === "login" ? "Don&apos;t have an account? " : "Already have an account? ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setTab(tab === "login" ? "register" : "login");
                    setError("");
                    setSuccess("");
                    setName("");
                    setUserType("client");
                    setBusinessName("");
                    setBusinessType("");
                    setBusinessAddress("");
                    setRegistrationNumber("");
                  },
                  className: "text-brand-orange font-semibold hover:text-brand-gold transition-colors",
                  children: tab === "login" ? "Register here" : "Login here"
                }
              )
            ] }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty", children: "By registering, you agree to review and accept our Terms & Conditions and Privacy Policy" }) })
    ] }),
    showLegalConsent && pendingUserData && /* @__PURE__ */ jsxRuntimeExports.jsx(
      LegalConsentModal,
      {
        userId: pendingUserData.user.email || pendingUserData.user.phone,
        userType: pendingUserData.user.role,
        onAccept: handleLegalConsentAccept,
        onDecline: handleLegalConsentDecline,
        isRegistration: true
      }
    )
  ] });
}
export {
  Login as default
};
//# sourceMappingURL=Login-Di12DA54.js.map
