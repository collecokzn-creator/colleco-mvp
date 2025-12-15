import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { g as ArrowLeft, q as ArrowRight, n as CheckCircle2, m as User, r as Mail, s as Phone, j as Briefcase, U as Users, C as Calendar, h as Building2, M as MapPin, b as FileText, l as CreditCard, S as Shield } from "./icons-C4AMPM7L.js";
import { u as useNavigate } from "./index-DlOecmR0.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
const BUSINESS_TYPES = [
  { value: "corporate", label: "Corporate/Enterprise", description: "Large organizations with frequent travel needs" },
  { value: "sme", label: "SME (Small-Medium Enterprise)", description: "Growing businesses with occasional travel" },
  { value: "startup", label: "Startup", description: "Early-stage companies building culture through travel" },
  { value: "ngo", label: "NGO/Non-Profit", description: "Mission-driven organizations" },
  { value: "government", label: "Government/Public Sector", description: "Public institutions and agencies" }
];
const TRAVEL_PURPOSES = [
  { value: "business", label: "Business Travel", icon: Briefcase },
  { value: "recognition", label: "Staff Recognition & Rewards", icon: Users },
  { value: "team_building", label: "Team Building & Retreats", icon: Users },
  { value: "conferences", label: "Conferences & Events", icon: Calendar },
  { value: "mixed", label: "Mixed Purpose", icon: Building2 }
];
const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501+", label: "501+ employees" }
];
function BusinessTravelerRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = reactExports.useState(1);
  const [formData, setFormData] = reactExports.useState({
    // Step 1: Business Info
    businessName: "",
    registrationNumber: "",
    businessType: "",
    companySize: "",
    industry: "",
    // Step 2: Primary Contact
    contactName: "",
    contactTitle: "",
    email: "",
    phone: "",
    alternateContact: "",
    // Step 3: Travel Profile
    travelPurposes: [],
    annualTravelBudget: "",
    averageTripsPerYear: "",
    preferredDestinations: "",
    travelPolicyExists: false,
    // Step 4: Billing & Admin
    billingAddress: "",
    city: "",
    province: "",
    postalCode: "",
    country: "South Africa",
    paymentMethod: "invoice",
    taxNumber: "",
    // Step 5: Team Management
    numberOfTravelers: "",
    requiresApprovalWorkflow: false,
    centralizedBilling: true,
    travelManagers: [],
    // Terms
    agreedToTerms: false,
    agreedToDataProcessing: false
  });
  const [errors, setErrors] = reactExports.useState({});
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };
  const toggleArrayValue = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((v) => v !== value) : [...prev[field], value]
    }));
  };
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
      if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
      if (!formData.businessType) newErrors.businessType = "Please select business type";
      if (!formData.companySize) newErrors.companySize = "Please select company size";
    }
    if (step === 2) {
      if (!formData.contactName.trim()) newErrors.contactName = "Contact name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";
      if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    }
    if (step === 3) {
      if (formData.travelPurposes.length === 0) newErrors.travelPurposes = "Select at least one travel purpose";
    }
    if (step === 4) {
      if (!formData.billingAddress.trim()) newErrors.billingAddress = "Billing address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.taxNumber.trim()) newErrors.taxNumber = "Tax/VAT number is required";
    }
    if (step === 5) {
      if (!formData.numberOfTravelers) newErrors.numberOfTravelers = "Estimated number of travelers is required";
      if (!formData.agreedToTerms) newErrors.agreedToTerms = "You must agree to the terms";
      if (!formData.agreedToDataProcessing) newErrors.agreedToDataProcessing = "You must agree to data processing";
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
      const response = await fetch("/api/business-travelers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          accountType: "business_traveler",
          registeredAt: (/* @__PURE__ */ new Date()).toISOString()
        })
      });
      if (!response.ok) throw new Error("Registration failed");
      const result = await response.json();
      localStorage.setItem("colleco.businessAccount", JSON.stringify(result.account));
      navigate("/business-dashboard", {
        state: { message: "Business account created successfully!", accountId: result.accountId }
      });
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ submit: "Failed to create account. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderStepIndicator = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between max-w-4xl mx-auto", children: [
    { num: 1, label: "Business" },
    { num: 2, label: "Contact" },
    { num: 3, label: "Travel Profile" },
    { num: 4, label: "Billing" },
    { num: 5, label: "Team & Terms" }
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
        "Business/Organization Name ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: formData.businessName,
          onChange: (e) => updateField("businessName", e.target.value),
          className: `w-full px-4 py-3 rounded-lg border ${errors.businessName ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
          placeholder: "Your Company Name"
        }
      ),
      errors.businessName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.businessName })
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: BUSINESS_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.businessType === type.value ? "border-brand-orange bg-orange-50" : "border-gray-200 hover:border-brand-orange"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "radio",
            name: "businessType",
            value: type.value,
            checked: formData.businessType === type.value,
            onChange: (e) => updateField("businessType", e.target.value),
            className: "mt-1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-brand-brown", children: type.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: type.description })
        ] })
      ] }, type.value)) }),
      errors.businessType && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.businessType })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Company Size ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: formData.companySize,
          onChange: (e) => updateField("companySize", e.target.value),
          className: `w-full px-4 py-3 rounded-lg border ${errors.companySize ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select company size" }),
            COMPANY_SIZES.map((size) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: size.value, children: size.label }, size.value))
          ]
        }
      ),
      errors.companySize && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.companySize })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Industry" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: formData.industry,
          onChange: (e) => updateField("industry", e.target.value),
          className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent",
          placeholder: "e.g., Technology, Finance, Healthcare"
        }
      )
    ] })
  ] });
  const renderStep2 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Primary Contact Name ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-3 top-3.5 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.contactName,
            onChange: (e) => updateField("contactName", e.target.value),
            className: `w-full pl-11 pr-4 py-3 rounded-lg border ${errors.contactName ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
            placeholder: "Full name"
          }
        )
      ] }),
      errors.contactName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.contactName })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Job Title/Role" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: formData.contactTitle,
          onChange: (e) => updateField("contactTitle", e.target.value),
          className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent",
          placeholder: "e.g., Travel Manager, HR Director"
        }
      )
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
            placeholder: "contact@company.com"
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Alternate Contact" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: formData.alternateContact,
          onChange: (e) => updateField("alternateContact", e.target.value),
          className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent",
          placeholder: "Backup contact (name & email)"
        }
      )
    ] })
  ] });
  const renderStep3 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-3", children: [
        "Travel Purposes ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: TRAVEL_PURPOSES.map((purpose) => {
        const Icon = purpose.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.travelPurposes.includes(purpose.value) ? "border-brand-orange bg-orange-50" : "border-gray-200 hover:border-brand-orange"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: formData.travelPurposes.includes(purpose.value),
              onChange: () => toggleArrayValue("travelPurposes", purpose.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-5 h-5 text-brand-orange" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-brand-brown", children: purpose.label })
        ] }, purpose.value);
      }) }),
      errors.travelPurposes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.travelPurposes })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Annual Travel Budget" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: formData.annualTravelBudget,
          onChange: (e) => updateField("annualTravelBudget", e.target.value),
          className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select budget range" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "0-100k", children: "Under R100k" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "100k-500k", children: "R100k - R500k" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "500k-1m", children: "R500k - R1M" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "1m-5m", children: "R1M - R5M" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "5m+", children: "Over R5M" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Average Trips Per Year" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "number",
          value: formData.averageTripsPerYear,
          onChange: (e) => updateField("averageTripsPerYear", e.target.value),
          className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent",
          placeholder: "Estimated number of trips",
          min: "1"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Preferred Destinations" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: formData.preferredDestinations,
          onChange: (e) => updateField("preferredDestinations", e.target.value),
          className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent",
          rows: 3,
          placeholder: "e.g., Cape Town, Johannesburg, International conferences"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-brand-orange", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "checkbox",
          checked: formData.travelPolicyExists,
          onChange: (e) => updateField("travelPolicyExists", e.target.checked)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-brand-brown", children: "We have an existing corporate travel policy" })
    ] }) })
  ] });
  const renderStep4 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Billing Address ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "absolute left-3 top-3.5 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.billingAddress,
            onChange: (e) => updateField("billingAddress", e.target.value),
            className: `w-full pl-11 pr-4 py-3 rounded-lg border ${errors.billingAddress ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
            placeholder: "Street address"
          }
        )
      ] }),
      errors.billingAddress && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.billingAddress })
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
            className: `w-full px-4 py-3 rounded-lg border ${errors.city ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`
          }
        ),
        errors.city && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.city })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Province/State" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.province,
            onChange: (e) => updateField("province", e.target.value),
            className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Postal Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.postalCode,
            onChange: (e) => updateField("postalCode", e.target.value),
            className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          }
        )
      ] }),
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
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Tax/VAT Number ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "absolute left-3 top-3.5 h-5 w-5 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.taxNumber,
            onChange: (e) => updateField("taxNumber", e.target.value),
            className: `w-full pl-11 pr-4 py-3 rounded-lg border ${errors.taxNumber ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
            placeholder: "Tax/VAT registration number"
          }
        )
      ] }),
      errors.taxNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.taxNumber })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-3", children: "Preferred Payment Method" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-brand-orange", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "paymentMethod",
              value: "invoice",
              checked: formData.paymentMethod === "invoice",
              onChange: (e) => updateField("paymentMethod", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-5 h-5 text-brand-orange" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-brand-brown", children: "Monthly Invoice" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: "Consolidated billing with 30-day payment terms" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-brand-orange", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "radio",
              name: "paymentMethod",
              value: "card",
              checked: formData.paymentMethod === "card",
              onChange: (e) => updateField("paymentMethod", e.target.value)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-5 h-5 text-brand-orange" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-brand-brown", children: "Corporate Card" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: "Charge immediately to company credit card" })
          ] })
        ] })
      ] })
    ] })
  ] });
  const renderStep5 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: [
        "Estimated Number of Travelers ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "number",
          value: formData.numberOfTravelers,
          onChange: (e) => updateField("numberOfTravelers", e.target.value),
          className: `w-full px-4 py-3 rounded-lg border ${errors.numberOfTravelers ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-brand-orange focus:border-transparent`,
          placeholder: "How many employees will travel?",
          min: "1"
        }
      ),
      errors.numberOfTravelers && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.numberOfTravelers })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-brand-orange", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "checkbox",
          checked: formData.requiresApprovalWorkflow,
          onChange: (e) => updateField("requiresApprovalWorkflow", e.target.checked)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-5 h-5 text-brand-orange" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-brand-brown", children: "Enable Approval Workflow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: "Require manager approval before booking" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-brand-orange", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "checkbox",
          checked: formData.centralizedBilling,
          onChange: (e) => updateField("centralizedBilling", e.target.checked)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-5 h-5 text-brand-orange" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-brand-brown", children: "Centralized Billing" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600", children: "All bookings billed to company account" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 p-6 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-blue-900 mb-2", children: "🎁 Business Traveler Benefits" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-blue-800 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Volume discounts on bookings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Dedicated account manager" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Consolidated reporting & analytics" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Flexible cancellation policies" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Priority support (24/7)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Integration with expense management systems" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-4 border-t", children: [
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
            checked: formData.agreedToDataProcessing,
            onChange: (e) => updateField("agreedToDataProcessing", e.target.checked),
            className: "mt-1"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
          "I consent to processing of company and employee data for travel booking purposes ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
        ] })
      ] }),
      errors.agreedToDataProcessing && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-500 text-sm", children: errors.agreedToDataProcessing })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-cream py-8 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-4xl font-bold text-brand-brown mb-2", children: "Business Travel Account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Manage corporate travel, staff recognition trips, and team building experiences" })
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
              isSubmitting ? "Creating Account..." : "Create Business Account",
              /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { className: "w-4 h-4" })
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-center text-sm text-gray-600", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      "Questions? Contact our Business Travel team at",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:business@collecotravel.com", className: "text-brand-orange underline", children: "business@collecotravel.com" })
    ] }) })
  ] }) });
}
export {
  BusinessTravelerRegistration as default
};
//# sourceMappingURL=BusinessTravelerRegistration-Ctvgp8wh.js.map
