import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { o as Clock, V as XCircle, A as AlertCircle, n as CheckCircle2, b as FileText, S as Shield, q as ArrowRight, E as Sparkles } from "./icons-C4AMPM7L.js";
import { u as useNavigate, b as useLocation } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
const VERIFICATION_STAGES = [
  {
    id: "application_submitted",
    label: "Application Submitted",
    icon: FileText,
    description: "Your application has been received"
  },
  {
    id: "documents_uploaded",
    label: "Documents Uploaded",
    icon: Shield,
    description: "All required documents provided"
  },
  {
    id: "under_review",
    label: "Under Review",
    icon: Clock,
    description: "Our team is reviewing your application"
  },
  {
    id: "approved",
    label: "Approved",
    icon: CheckCircle2,
    description: "Welcome to the CollEco Partner Network!"
  }
];
const STATUS_BADGES = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  pending_documents: { label: "Awaiting Documents", color: "bg-orange-100 text-orange-800", icon: AlertCircle },
  under_review: { label: "Under Review", color: "bg-blue-100 text-blue-800", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
  on_hold: { label: "On Hold", color: "bg-gray-100 text-gray-800", icon: AlertCircle }
};
function PartnerApplicationStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = location.state?.applicationId || localStorage.getItem("colleco.partner.applicationId");
  const successMessage = location.state?.message;
  const [application, setApplication] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const fetchApplicationStatus = reactExports.useCallback(async () => {
    try {
      const response = await fetch(`/api/partners/${applicationId}/status`);
      if (!response.ok) throw new Error("Failed to fetch status");
      const data = await response.json();
      setApplication(data);
      setLoading(false);
    } catch (err) {
      console.error("Status fetch error:", err);
      setError("Failed to load application status");
      setLoading(false);
    }
  }, [applicationId]);
  reactExports.useEffect(() => {
    if (!applicationId) {
      navigate("/partner/onboarding");
      return;
    }
    fetchApplicationStatus();
    const interval = setInterval(fetchApplicationStatus, 3e4);
    return () => clearInterval(interval);
  }, [applicationId, navigate, fetchApplicationStatus]);
  const getCurrentStageIndex = () => {
    if (!application) return 0;
    if (application.status === "approved") return 3;
    if (application.status === "under_review") return 2;
    if (application.documentsComplete) return 1;
    return 0;
  };
  const renderTimeline = () => {
    const currentStageIndex = getCurrentStageIndex();
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: VERIFICATION_STAGES.map((stage, index) => {
      const Icon = stage.icon;
      const isCompleted = index < currentStageIndex;
      const isCurrent = index === currentStageIndex;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mb-8 last:mb-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted ? "bg-green-500 text-white" : isCurrent ? "bg-brand-orange text-white animate-pulse" : "bg-gray-200 text-gray-400"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-6 h-6" }) }),
          index < VERIFICATION_STAGES.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-0.5 h-16 transition-all ${isCompleted ? "bg-green-500" : "bg-gray-200"}` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 pb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: `font-bold text-lg ${isCompleted || isCurrent ? "text-brand-brown" : "text-gray-400"}`, children: stage.label }),
            isCompleted && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-5 h-5 text-green-500" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm ${isCompleted || isCurrent ? "text-gray-600" : "text-gray-400"}`, children: stage.description }),
          isCurrent && stage.id === "documents_uploaded" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => navigate("/partner/verification", { state: { applicationId } }),
              className: "mt-3 px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2",
              children: [
                "Upload Documents",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
              ]
            }
          ),
          isCurrent && stage.id === "under_review" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-800", children: [
            "⏱️ Estimated review time: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3-5 business days" })
          ] }) }),
          isCompleted && stage.id === "approved" && application?.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-800 mb-2", children: "🎉 Congratulations! You're now part of the CollEco Partner Network." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-700", children: [
                "Approved on ",
                new Date(application.approvedAt).toLocaleDateString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => navigate("/partner/dashboard"),
                className: "px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5" }),
                  "Go to Partner Dashboard"
                ]
              }
            )
          ] })
        ] })
      ] }, stage.id);
    }) });
  };
  const renderDocumentsList = () => {
    if (!application?.documents || application.documents.length === 0) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-gray-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-12 h-12 mx-auto mb-2 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No documents uploaded yet" })
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: application.documents.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-gray-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-brand-brown text-sm", children: doc.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
            "Uploaded ",
            new Date(doc.uploadedAt).toLocaleDateString()
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        doc.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-5 h-5 text-green-500" }),
        doc.status === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { className: "w-5 h-5 text-red-500" }),
        doc.status === "pending_review" && /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5 text-yellow-500" })
      ] })
    ] }, doc.id)) });
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-12 h-12 animate-spin text-brand-orange mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading application status..." })
    ] }) });
  }
  if (error || !application) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-8 rounded-lg shadow-lg max-w-md text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { className: "w-12 h-12 text-red-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-brand-brown mb-2", children: "Error" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: error || "Application not found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate("/partner/onboarding"),
          className: "px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors",
          children: "Start New Application"
        }
      )
    ] }) });
  }
  const statusBadge = STATUS_BADGES[application.status] || STATUS_BADGES.pending;
  const StatusIcon = statusBadge.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream py-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
    successMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-5 h-5 text-green-600 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-green-900", children: successMessage }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-700", children: "We'll notify you once our team reviews your application." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-brand-brown mb-2", children: "Partner Application Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-600", children: [
            "Application ID: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-brand-orange", children: applicationId?.slice(0, 8) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusBadge.color} font-semibold`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: "w-5 h-5" }),
          statusBadge.label
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-cream-light rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Business Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: application.businessName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: application.category })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Submitted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-brand-brown", children: new Date(application.submittedAt).toLocaleDateString() })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 bg-white rounded-xl shadow-lg p-6 md:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-brand-brown mb-6", children: "Verification Progress" }),
        renderTimeline()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Documents" }),
          renderDocumentsList(),
          application.status === "pending_documents" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => navigate("/partner/verification", { state: { applicationId } }),
              className: "mt-4 w-full px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors",
              children: "Upload Missing Documents"
            }
          )
        ] }),
        application.status === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { className: "w-6 h-6 text-red-600 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-red-900", children: "Application Rejected" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700 mt-1", children: application.rejectionReason })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => navigate("/partner/onboarding"),
              className: "w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors",
              children: "Submit New Application"
            }
          )
        ] }),
        application.status === "on_hold" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-xl p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "w-6 h-6 text-yellow-600 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-yellow-900", children: "Application On Hold" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-yellow-700 mt-1", children: application.holdReason })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-blue-900 mb-2", children: "Need Help?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-800 mb-3", children: "Contact our Partner Support team if you have questions about your application." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: "mailto:partners@collecotravel.com",
              className: "inline-block text-sm text-blue-700 underline hover:text-blue-900",
              children: "partners@collecotravel.com"
            }
          )
        ] })
      ] })
    ] })
  ] }) });
}
export {
  PartnerApplicationStatus as default
};
//# sourceMappingURL=PartnerApplicationStatus-BlEupfZ-.js.map
