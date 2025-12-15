import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { F as Footer } from "./Footer-ByqUfdvj.js";
import { A as AlertCircle, n as CheckCircle2, L as Loader, b as FileText, V as XCircle, a6 as ExternalLink, a7 as Upload } from "./icons-C4AMPM7L.js";
import { u as useNavigate, b as useLocation } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
const REQUIRED_DOCUMENTS = [
  {
    id: "business_registration",
    label: "Business Registration Certificate",
    description: "CIPC registration or equivalent",
    required: true,
    formats: [".pdf", ".jpg", ".png"],
    maxSize: 5
    // MB
  },
  {
    id: "tax_clearance",
    label: "Tax Clearance Certificate",
    description: "Valid tax compliance certificate",
    required: true,
    formats: [".pdf"],
    maxSize: 5
  },
  {
    id: "liability_insurance",
    label: "Public Liability Insurance",
    description: "Minimum R5M coverage",
    required: true,
    formats: [".pdf"],
    maxSize: 5
  },
  {
    id: "trade_license",
    label: "Trade License / Tourism Registration",
    description: "e.g., SATSA, TGCSA, or relevant authority",
    required: false,
    formats: [".pdf", ".jpg", ".png"],
    maxSize: 5
  },
  {
    id: "banking_details",
    label: "Banking Details",
    description: "Proof of banking (bank letter or cancelled cheque)",
    required: true,
    formats: [".pdf", ".jpg", ".png"],
    maxSize: 3
  },
  {
    id: "id_document",
    label: "ID/Passport of Director/Owner",
    description: "Valid identification document",
    required: true,
    formats: [".pdf", ".jpg", ".png"],
    maxSize: 3
  },
  {
    id: "bbbee_certificate",
    label: "B-BBEE Certificate",
    description: "South African partners (if applicable)",
    required: false,
    formats: [".pdf"],
    maxSize: 3
  }
];
function PartnerVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const applicationId = location.state?.applicationId || localStorage.getItem("colleco.partner.applicationId");
  const [properties, setProperties] = reactExports.useState([]);
  const [selectedProperty, setSelectedProperty] = reactExports.useState(null);
  const [favoriteProperties, setFavoriteProperties] = reactExports.useState([]);
  const [_canScrollLeft, _setCanScrollLeft] = reactExports.useState(false);
  const [_canScrollRight, _setCanScrollRight] = reactExports.useState(false);
  const scrollContainerRef = reactExports.useRef(null);
  const [documents, setDocuments] = reactExports.useState({});
  const [uploadProgress, setUploadProgress] = reactExports.useState({});
  const [errors, setErrors] = reactExports.useState({});
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [applicationStatus, setApplicationStatus] = reactExports.useState(null);
  const fetchApplicationStatus = reactExports.useCallback(async () => {
    try {
      const response = await fetch(`/api/partners/${applicationId}/status`);
      if (!response.ok) throw new Error("Failed to fetch status");
      const data = await response.json();
      setApplicationStatus(data);
      if (data.documents) {
        const docMap = {};
        data.documents.forEach((doc) => {
          docMap[doc.type] = {
            file: null,
            uploaded: true,
            url: doc.url,
            uploadedAt: doc.uploadedAt,
            status: doc.status
          };
        });
        setDocuments(docMap);
      }
    } catch (error) {
      console.error("Status fetch error:", error);
    }
  }, [applicationId]);
  reactExports.useEffect(() => {
    fetch("/api/accommodation/available-properties").then((res) => res.json()).then((data) => setProperties(data.properties || []));
    if (!applicationId) {
      navigate("/partner/onboarding");
      return;
    }
    fetchApplicationStatus();
  }, [applicationId, navigate, fetchApplicationStatus]);
  const validateFile = (file, docConfig) => {
    const errors2 = [];
    const fileExt = "." + file.name.split(".").pop().toLowerCase();
    if (!docConfig.formats.includes(fileExt)) {
      errors2.push(`Invalid format. Accepted: ${docConfig.formats.join(", ")}`);
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > docConfig.maxSize) {
      errors2.push(`File too large. Maximum: ${docConfig.maxSize}MB`);
    }
    return errors2;
  };
  const handleFileSelect = (docId, file) => {
    const docConfig = REQUIRED_DOCUMENTS.find((d) => d.id === docId);
    const validationErrors = validateFile(file, docConfig);
    if (validationErrors.length > 0) {
      setErrors((prev) => ({ ...prev, [docId]: validationErrors.join(". ") }));
      return;
    }
    setErrors((prev) => ({ ...prev, [docId]: null }));
    setDocuments((prev) => ({
      ...prev,
      [docId]: { file, uploaded: false, status: "pending" }
    }));
  };
  const uploadDocument = async (docId) => {
    const doc = documents[docId];
    if (!doc || !doc.file || doc.uploaded) return;
    setUploadProgress((prev) => ({ ...prev, [docId]: 0 }));
    const formData = new FormData();
    formData.append("document", doc.file);
    formData.append("type", docId);
    formData.append("applicationId", applicationId);
    try {
      const response = await fetch(`/api/partners/${applicationId}/documents`, {
        method: "POST",
        body: formData
      });
      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      setDocuments((prev) => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          uploaded: true,
          url: result.url,
          uploadedAt: result.uploadedAt,
          status: "pending_review"
        }
      }));
      setUploadProgress((prev) => ({ ...prev, [docId]: 100 }));
    } catch (error) {
      console.error("Upload error:", error);
      setErrors((prev) => ({ ...prev, [docId]: "Upload failed. Please try again." }));
      setUploadProgress((prev) => ({ ...prev, [docId]: null }));
    }
  };
  const handleSubmitForReview = async () => {
    const missingDocs = REQUIRED_DOCUMENTS.filter((doc) => doc.required).filter((doc) => !documents[doc.id]?.uploaded);
    if (missingDocs.length > 0) {
      setErrors({
        submit: `Please upload all required documents: ${missingDocs.map((d) => d.label).join(", ")}`
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/partners/${applicationId}/submit-for-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Submission failed");
      navigate("/partner/application-status", {
        state: { applicationId, message: "Application submitted successfully!" }
      });
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ submit: "Failed to submit for review. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderDocumentCard = (docConfig) => {
    const doc = documents[docConfig.id];
    const progress = uploadProgress[docConfig.id];
    const error = errors[docConfig.id];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-brand-orange transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-brand-brown" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-brand-brown", children: [
              docConfig.label,
              docConfig.required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 ml-1", children: "*" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: docConfig.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
            "Formats: ",
            docConfig.formats.join(", "),
            " | Max: ",
            docConfig.maxSize,
            "MB"
          ] })
        ] }),
        doc?.uploaded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          doc.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-6 h-6 text-green-500" }),
          doc.status === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsx(XCircle, { className: "w-6 h-6 text-red-500" }),
          doc.status === "pending_review" && /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "w-6 h-6 text-yellow-500" })
        ] })
      ] }),
      doc?.uploaded ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-4 h-4 text-green-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-700", children: [
            "Uploaded ",
            new Date(doc.uploadedAt).toLocaleDateString()
          ] })
        ] }),
        doc.url && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            href: doc.url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "inline-flex items-center gap-1 text-brand-orange text-sm hover:underline",
            children: [
              "View Document",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3" })
            ]
          }
        ),
        doc.status === "rejected" && doc.rejectionReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 p-3 bg-red-50 border border-red-200 rounded", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700 font-semibold", children: "Rejected:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: doc.rejectionReason })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex-1 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-orange transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-5 h-5 text-gray-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: doc?.file ? doc.file.name : "Choose file..." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                accept: docConfig.formats.join(","),
                onChange: (e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(docConfig.id, e.target.files[0]);
                  }
                },
                className: "hidden"
              }
            )
          ] }),
          doc?.file && !doc.uploaded && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => uploadDocument(docConfig.id),
              disabled: progress !== void 0 && progress < 100,
              className: "px-4 py-3 bg-brand-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
              children: progress !== void 0 && progress < 100 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "w-5 h-5 animate-spin" }) : "Upload"
            }
          )
        ] }),
        progress !== void 0 && progress < 100 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "bg-brand-orange h-2 rounded-full transition-all",
            style: { width: `${progress}%` }
          }
        ) }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm", children: error })
      ] })
    ] }, docConfig.id);
  };
  const uploadedCount = Object.values(documents).filter((d) => d?.uploaded).length;
  const requiredCount = REQUIRED_DOCUMENTS.filter((d) => d.required).length;
  const allRequiredUploaded = REQUIRED_DOCUMENTS.filter((d) => d.required).every((d) => documents[d.id]?.uploaded);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream py-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-4xl font-bold text-brand-brown mb-2", children: "Document Verification" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: "Upload required documents for your partner application. Our team will review within 3-5 business days." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mb-2", children: "Select Accommodation for Verification" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto pb-4", ref: scrollContainerRef, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4", children: properties.map((property) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg bg-white shadow p-4 min-w-[280px] sm:min-w-[340px] max-w-xs flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-bold text-brand-brown", children: property.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: favoriteProperties.includes(property.id) ? "text-red-500" : "text-gray-300",
              onClick: () => setFavoriteProperties((fav) => fav.includes(property.id) ? fav.filter((id) => id !== property.id) : [...fav, property.id]),
              title: favoriteProperties.includes(property.id) ? "Remove from favorites" : "Add to favorites",
              children: "❤"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700 mb-1", children: property.address }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mb-2", children: [
            property.type,
            " • ",
            property.stars,
            " stars"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Amenities:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc ml-4 text-xs", children: property.amenities?.map((amenity, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: amenity }, i)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Meal Plans:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "mt-1 block w-full rounded border px-2 py-1", children: property.mealPlans?.map((plan, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: plan, children: plan }, i)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "mt-2 px-4 py-1 bg-brand-orange text-white rounded",
              onClick: () => setSelectedProperty(property),
              children: "Select"
            }
          )
        ] }, property.id)) }) }),
        selectedProperty && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 p-4 border rounded bg-cream", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-bold mb-2", children: "Selected Property" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Name:" }),
            " ",
            selectedProperty.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Address:" }),
            " ",
            selectedProperty.address
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Type:" }),
            " ",
            selectedProperty.type
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Stars:" }),
            " ",
            selectedProperty.stars
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Amenities:" }),
            " ",
            selectedProperty.amenities?.join(", ")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Meal Plans:" }),
            " ",
            selectedProperty.mealPlans?.join(", ")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-lg border border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-brand-brown", children: "Upload Progress" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-600", children: [
            uploadedCount,
            " of ",
            REQUIRED_DOCUMENTS.length,
            " uploaded"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "bg-brand-orange h-3 rounded-full transition-all",
            style: { width: `${uploadedCount / REQUIRED_DOCUMENTS.length * 100}%` }
          }
        ) })
      ] })
    ] }),
    applicationStatus?.status === "pending_documents" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertCircle, { className: "w-5 h-5 text-yellow-600 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-yellow-900", children: "Documents Required" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-yellow-700", children: "Please upload all required documents to proceed with your application." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-6 mb-8", children: REQUIRED_DOCUMENTS.map(renderDocumentCard) }),
    errors.submit && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: errors.submit }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-6 rounded-lg border border-gray-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: allRequiredUploaded ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-green-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-5 h-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "All required documents uploaded!" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        requiredCount - Object.values(documents).filter((d) => d?.uploaded && REQUIRED_DOCUMENTS.find((doc) => doc.id === Object.keys(documents).find((key) => documents[key] === d))?.required).length,
        " required documents remaining"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => navigate("/partner/dashboard"),
            className: "px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors",
            children: "Save & Exit"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleSubmitForReview,
            disabled: !allRequiredUploaded || isSubmitting,
            className: "px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2",
            children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Loader, { className: "w-5 h-5 animate-spin" }),
              "Submitting..."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "Submit for Review",
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-5 h-5" })
            ] })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-blue-900 mb-2", children: "Document Guidelines" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-blue-800 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• All documents must be clear and legible" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Certificates must be current and valid" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Banking proof must match the registered business name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Insurance must have minimum R5M public liability coverage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          "• Questions? Email ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:verification@collecotravel.com", className: "underline", children: "verification@collecotravel.com" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] }) });
}
export {
  PartnerVerification as default
};
//# sourceMappingURL=PartnerVerification-C5xV2x3J.js.map
