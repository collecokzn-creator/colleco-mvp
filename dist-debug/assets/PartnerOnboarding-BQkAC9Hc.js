import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { F as Footer } from "./Footer-ByqUfdvj.js";
import { g as ArrowLeft, q as ArrowRight, n as CheckCircle2, h as Building2, j as Briefcase, a5 as Globe, M as MapPin, m as User, b as FileText, a as DollarSign, r as Mail, s as Phone } from "./icons-C4AMPM7L.js";
import { u as useNavigate } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
const PARTNER_CATEGORIES = [
  { value: "accommodation", label: "Accommodation (Hotels, Lodges, Guesthouses)", icon: Building2 },
  { value: "tour_operator", label: "Tour Operator / DMC", icon: Briefcase },
  { value: "transport", label: "Transport & Transfers", icon: Globe },
  { value: "activity", label: "Activities & Experiences", icon: MapPin },
  { value: "restaurant", label: "Restaurant / Catering", icon: Building2 },
  { value: "airline", label: "Airline / Flight Services", icon: Globe },
  { value: "car_rental", label: "Car Rental", icon: Globe },
  { value: "travel_agent", label: "Travel Agent / Agency", icon: Briefcase },
  { value: "content_creator", label: "Content Creator / Influencer", icon: User },
  { value: "marketing", label: "Marketing / PR Partner", icon: Briefcase },
  { value: "insurance", label: "Travel Insurance Provider", icon: FileText },
  { value: "other", label: "Other Value-Add Partner", icon: DollarSign }
];
const BUSINESS_TYPES = [
  { value: "sole_proprietor", label: "Sole Proprietor" },
  { value: "pty_ltd", label: "Private Company (Pty Ltd)" },
  { value: "llc", label: "LLC / Limited Company" },
  { value: "partnership", label: "Partnership" },
  { value: "ngo_npo", label: "NGO / NPO" },
  { value: "other", label: "Other" }
];
function PartnerOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = reactExports.useState(1);
  const [formData, setFormData] = reactExports.useState({
    // Step 1: Business Info
    businessName: "",
    tradingAs: "",
    registrationNumber: "",
    businessType: "",
    category: "",
    // Step 2: Contact Details
    contactPerson: "",
    email: "",
    phone: "",
    alternatePhone: "",
    website: "",
    // Step 3: Location
    address: "",
    city: "",
    province: "",
    country: "South Africa",
    postalCode: "",
    // Step 4: Business Details
    yearsInBusiness: "",
    description: "",
    servicesOffered: "",
    targetMarkets: "",
    annualTurnover: "",
    // Step 5: Agreement
    agreedToTerms: false,
    agreedToCommission: false,
    preferredCommissionModel: "standard"
  });
  const [errors, setErrors] = reactExports.useState({});
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
      if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
      if (!formData.businessType) newErrors.businessType = "Please select business type";
      if (!formData.category) newErrors.category = "Please select a category";
    }
    if (step === 2) {
      if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    }
    if (step === 3) {
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.province.trim()) newErrors.province = "Province/State is required";
    }
    if (step === 4) {
      if (!formData.yearsInBusiness) newErrors.yearsInBusiness = "Years in business is required";
      if (!formData.description.trim()) newErrors.description = "Business description is required";
      if (formData.description.length < 50) newErrors.description = "Description must be at least 50 characters";
    }
    if (step === 5) {
      if (!formData.agreedToTerms) newErrors.agreedToTerms = "You must agree to the terms";
      if (!formData.agreedToCommission) newErrors.agreedToCommission = "You must agree to the commission structure";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(5)) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          appliedAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "pending"
        })
      });
      if (!response.ok) throw new Error("Application submission failed");
      const result = await response.json();
      localStorage.setItem("colleco.partner.applicationId", result.applicationId);
      navigate("/partner/verification", {
        state: { applicationId: result.applicationId, step: "documents" }
      });
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ submit: "Failed to submit application. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderStepIndicator = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between max-w-3xl mx-auto", children: [
    { num: 1, label: "Business Info" },
    { num: 2, label: "Contact" },
    { num: 3, label: "Location" },
    { num: 4, label: "Details" },
    { num: 5, label: "Agreement" }
  ].map((step, idx, arr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center flex-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep > step.num ? "bg-green-500 text-white" : currentStep === step.num ? "bg-brand-orange text-white" : "bg-gray-200 text-gray-500"}`, children: currentStep > step.num ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-5 h-5" }) : step.num }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-2 text-xs font-medium hidden sm:block ${currentStep >= step.num ? "text-brand-brown" : "text-gray-400"}`, children: step.label })
    ] }),
    idx < arr.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex-1 h-1 mx-2 transition-all ${currentStep > step.num ? "bg-green-500" : "bg-gray-200"}` })
  ] }, step.num)) }) });
  const renderStep1 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Business Name ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: formData.businessName,
          onChange: (e) => updateField("businessName", e.target.value),
          className: `w-full px-4 py-3 rounded-lg border ${errors.businessName ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
          placeholder: "Enter registered business name"
        }
      ),
      errors.businessName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.businessName })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Trading As (if different)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: formData.tradingAs,
          onChange: (e) => updateField("tradingAs", e.target.value),
          className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent",
          placeholder: "Optional trading name"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Registration/Company Number ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: formData.registrationNumber,
          onChange: (e) => updateField("registrationNumber", e.target.value),
          className: `w-full px-4 py-3 rounded-lg border ${errors.registrationNumber ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
          placeholder: "e.g., 2024/123456/07"
        }
      ),
      errors.registrationNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.registrationNumber })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Business Type ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: formData.businessType,
          onChange: (e) => updateField("businessType", e.target.value),
          className: `w-full px-4 py-3 rounded-lg border ${errors.businessType ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select business type" }),
            BUSINESS_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: type.value, children: type.label }, type.value))
          ]
        }
      ),
      errors.businessType && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.businessType })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Partner Category ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: formData.category,
          onChange: (e) => updateField("category", e.target.value),
          className: `w-full px-4 py-3 rounded-lg border ${errors.category ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select your primary category" }),
            PARTNER_CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cat.value, children: cat.label }, cat.value))
          ]
        }
      ),
      errors.category && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.category })
    ] })
  ] });
  const renderStep2 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Primary Contact Person ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-3 top-3.5 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.contactPerson,
            onChange: (e) => updateField("contactPerson", e.target.value),
            className: `w-full pl-11 pr-4 py-3 rounded-lg border ${errors.contactPerson ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
            placeholder: "Full name"
          }
        )
      ] }),
      errors.contactPerson && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.contactPerson })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Email Address ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-3 top-3.5 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            value: formData.email,
            onChange: (e) => updateField("email", e.target.value),
            className: `w-full pl-11 pr-4 py-3 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
            placeholder: "business@example.com"
          }
        )
      ] }),
      errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.email })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Phone Number ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "absolute left-3 top-3.5 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "tel",
            value: formData.phone,
            onChange: (e) => updateField("phone", e.target.value),
            className: `w-full pl-11 pr-4 py-3 rounded-lg border ${errors.phone ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
            placeholder: "+27 XX XXX XXXX"
          }
        )
      ] }),
      errors.phone && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.phone })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Alternate Phone" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "absolute left-3 top-3.5 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "tel",
            value: formData.alternatePhone,
            onChange: (e) => updateField("alternatePhone", e.target.value),
            className: "w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent",
            placeholder: "Optional alternate contact"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Website" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "absolute left-3 top-3.5 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "url",
            value: formData.website,
            onChange: (e) => updateField("website", e.target.value),
            className: "w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent",
            placeholder: "https://www.example.com"
          }
        )
      ] })
    ] })
  ] });
  const renderStep3 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Street Address ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "absolute left-3 top-3.5 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.address,
            onChange: (e) => updateField("address", e.target.value),
            className: `w-full pl-11 pr-4 py-3 rounded-lg border ${errors.address ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
            placeholder: "Street address"
          }
        )
      ] }),
      errors.address && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.address })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
          "City ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.city,
            onChange: (e) => updateField("city", e.target.value),
            className: `w-full px-4 py-3 rounded-lg border ${errors.city ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
            placeholder: "City"
          }
        ),
        errors.city && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.city })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
          "Province/State ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.province,
            onChange: (e) => updateField("province", e.target.value),
            className: `w-full px-4 py-3 rounded-lg border ${errors.province ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
            placeholder: "Province/State"
          }
        ),
        errors.province && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.province })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Country" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.country,
            onChange: (e) => updateField("country", e.target.value),
            className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Postal Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.postalCode,
            onChange: (e) => updateField("postalCode", e.target.value),
            className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent",
            placeholder: "Postal code"
          }
        )
      ] })
    ] })
  ] });
  const renderStep4 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Years in Business ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: formData.yearsInBusiness,
          onChange: (e) => updateField("yearsInBusiness", e.target.value),
          className: `w-full px-4 py-3 rounded-lg border ${errors.yearsInBusiness ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "0-1", children: "Less than 1 year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "1-3", children: "1-3 years" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "3-5", children: "3-5 years" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "5-10", children: "5-10 years" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "10+", children: "10+ years" })
          ]
        }
      ),
      errors.yearsInBusiness && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.yearsInBusiness })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Business Description ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: formData.description,
          onChange: (e) => updateField("description", e.target.value),
          className: `w-full px-4 py-3 rounded-lg border ${errors.description ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
          rows: 5,
          placeholder: "Describe your business, target market, and unique offerings (minimum 50 characters)"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mt-1", children: [
        errors.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm", children: errors.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500 ml-auto", children: [
          formData.description.length,
          " characters"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Services/Products Offered" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: formData.servicesOffered,
          onChange: (e) => updateField("servicesOffered", e.target.value),
          className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent",
          rows: 3,
          placeholder: "List key services or products"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Target Markets / Regions Served" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: formData.targetMarkets,
          onChange: (e) => updateField("targetMarkets", e.target.value),
          className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent",
          placeholder: "e.g., Southern Africa, Europe, Corporate travelers"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Estimated Annual Turnover (Optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: formData.annualTurnover,
          onChange: (e) => updateField("annualTurnover", e.target.value),
          className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Prefer not to say" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "0-500k", children: "Under R500k" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "500k-2m", children: "R500k - R2M" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "2m-5m", children: "R2M - R5M" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "5m-10m", children: "R5M - R10M" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "10m+", children: "Over R10M" })
          ]
        }
      )
    ] })
  ] });
  const renderStep5 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-cream-light p-6 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-brand-brown mb-3", children: "Commission Structure" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700 mb-4", children: "CollEco charges a commission on bookings generated through the platform. Choose your preferred model:" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-brand-orange transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "commissionModel",
              value: "standard",
              checked: formData.preferredCommissionModel === "standard",
              onChange: (e) => updateField("preferredCommissionModel", e.target.value),
              className: "mt-1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-brand-brown", children: "Standard (15%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: "15% commission on all bookings. Standard listing placement." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-brand-orange transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "commissionModel",
              value: "premium",
              checked: formData.preferredCommissionModel === "premium",
              onChange: (e) => updateField("preferredCommissionModel", e.target.value),
              className: "mt-1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-brand-brown", children: "Premium (10%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: "10% commission + Featured placement + Priority support + Marketing assistance" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-brand-orange transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "commissionModel",
              value: "enterprise",
              checked: formData.preferredCommissionModel === "enterprise",
              onChange: (e) => updateField("preferredCommissionModel", e.target.value),
              className: "mt-1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-brand-brown", children: "Enterprise (Custom)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: "Negotiated rates for high-volume partners. Dedicated account manager." })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            checked: formData.agreedToTerms,
            onChange: (e) => updateField("agreedToTerms", e.target.checked),
            className: "mt-1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
          "I agree to the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/terms", target: "_blank", className: "text-brand-orange underline", children: "Terms & Conditions" }),
          " and ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/privacy", target: "_blank", className: "text-brand-orange underline", children: "Privacy Policy" }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
        ] })
      ] }),
      errors.agreedToTerms && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm", children: errors.agreedToTerms }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            checked: formData.agreedToCommission,
            onChange: (e) => updateField("agreedToCommission", e.target.checked),
            className: "mt-1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
          "I agree to the commission structure selected above and understand that CollEco will deduct this from bookings. ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
        ] })
      ] }),
      errors.agreedToCommission && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm", children: errors.agreedToCommission })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 p-4 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-blue-900 mb-2", children: "📋 Next Steps" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-blue-800 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Submit your application" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Upload required documents (licenses, insurance, banking details)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Our team reviews your application (typically 3-5 business days)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Receive approval notification and activate your account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Start listing your products and receiving bookings!" })
      ] })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream py-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-4xl font-bold text-brand-brown mb-2", children: "Join the CollEco Partner Network" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Complete the application to start your journey with CollEco Travel" })
    ] }),
    renderStepIndicator(),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg p-6 md:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
      currentStep === 1 && renderStep1(),
      currentStep === 2 && renderStep2(),
      currentStep === 3 && renderStep3(),
      currentStep === 4 && renderStep4(),
      currentStep === 5 && renderStep5(),
      errors.submit && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 p-4 bg-red-50 border border-red-200 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: errors.submit }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mt-8 pt-6 border-t", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: prevStep,
            disabled: currentStep === 1,
            className: "flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
              "Previous"
            ]
          }
        ),
        currentStep < 5 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: nextStep,
            className: "flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-orange text-white font-semibold hover:bg-orange-600 transition-colors",
            children: [
              "Next",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: "flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            children: [
              isSubmitting ? "Submitting..." : "Submit Application",
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-4 h-4" })
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-center text-sm text-gray-600", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      "Need help? Contact our Partner Support team at",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:partners@collecotravel.com", className: "text-brand-orange underline", children: "partners@collecotravel.com" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] }) });
}
export {
  PartnerOnboarding as default
};
//# sourceMappingURL=PartnerOnboarding-BQkAC9Hc.js.map
