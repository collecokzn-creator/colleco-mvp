import { r as reactExports, j as jsxRuntimeExports } from "./motion-D9fZRtSt.js";
import { c as useUser } from "./index-DlOecmR0.js";
import { B as Button } from "./Button-BvBK5int.js";
import "./react-4gMnsuNC.js";
import "./pdf-DKpnIAzb.js";
import "./icons-C4AMPM7L.js";
function PartnerTemplates() {
  const { user } = useUser();
  const [templates, setTemplates] = reactExports.useState([]);
  const [activeTemplate, setActiveTemplate] = reactExports.useState(null);
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [logoPreview, setLogoPreview] = reactExports.useState("");
  const [templateForm, setTemplateForm] = reactExports.useState({
    id: "",
    name: "Default Template",
    isDefault: false,
    partnerId: user?.id || "",
    companyInfo: {
      name: "",
      legalName: "",
      registration: "",
      taxNumber: "",
      vatNumber: "",
      csd: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      logo: null
    },
    banking: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      branchCode: "",
      accountType: "Business"
    },
    styling: {
      primaryColor: "#F47C20",
      secondaryColor: "#3A2C1A",
      accentColor: "#E6B422",
      font: "Arial"
    },
    terms: [
      "Payment terms: 50% deposit required, balance due 7 days before travel.",
      "Cancellation policy applies as per booking terms.",
      "Prices valid for 14 days from quote date.",
      "Subject to availability at time of booking.",
      "Travel insurance strongly recommended.",
      "All services subject to supplier terms and conditions."
    ],
    layout: {
      showLogo: true,
      logoPosition: "top-right",
      showBanking: true,
      showTerms: true,
      headerStyle: "classic",
      footerText: "Thank you for choosing us for your travel needs!"
    }
  });
  const loadTemplates = reactExports.useCallback(() => {
    const savedTemplates = JSON.parse(localStorage.getItem(`partner_templates_${user?.id}`) || "[]");
    setTemplates(savedTemplates);
    const defaultTemplate = savedTemplates.find((t) => t.isDefault);
    if (defaultTemplate) {
      setActiveTemplate(defaultTemplate);
    }
  }, [user?.id]);
  reactExports.useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);
  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo file size must be less than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Logo = event.target.result;
      setLogoPreview(base64Logo);
      setTemplateForm((prev) => ({
        ...prev,
        companyInfo: {
          ...prev.companyInfo,
          logo: base64Logo
        }
      }));
    };
    reader.readAsDataURL(file);
  }
  function saveTemplate() {
    if (!templateForm.companyInfo.name) {
      alert("Please enter company name");
      return;
    }
    const newTemplate2 = {
      ...templateForm,
      id: templateForm.id || `TPL-${Date.now()}`,
      partnerId: user?.id,
      createdAt: templateForm.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const allTemplates = [...templates];
    const existingIndex = allTemplates.findIndex((t) => t.id === newTemplate2.id);
    if (newTemplate2.isDefault) {
      allTemplates.forEach((t) => t.isDefault = false);
    }
    if (existingIndex >= 0) {
      allTemplates[existingIndex] = newTemplate2;
    } else {
      allTemplates.push(newTemplate2);
    }
    localStorage.setItem(`partner_templates_${user?.id}`, JSON.stringify(allTemplates));
    setTemplates(allTemplates);
    setActiveTemplate(newTemplate2);
    setIsEditing(false);
    alert("Template saved successfully!");
  }
  function editTemplate(template) {
    setTemplateForm(template);
    setLogoPreview(template.companyInfo.logo || "");
    setIsEditing(true);
  }
  function deleteTemplate(id) {
    if (!confirm("Are you sure you want to delete this template?")) return;
    const filtered = templates.filter((t) => t.id !== id);
    localStorage.setItem(`partner_templates_${user?.id}`, JSON.stringify(filtered));
    setTemplates(filtered);
    if (activeTemplate?.id === id) {
      setActiveTemplate(filtered[0] || null);
    }
  }
  function newTemplate() {
    setTemplateForm({
      id: "",
      name: "New Template",
      isDefault: templates.length === 0,
      partnerId: user?.id || "",
      companyInfo: {
        name: "",
        legalName: "",
        registration: "",
        taxNumber: "",
        vatNumber: "",
        csd: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        logo: null
      },
      banking: {
        bankName: "",
        accountName: "",
        accountNumber: "",
        branchCode: "",
        accountType: "Business"
      },
      styling: {
        primaryColor: "#F47C20",
        secondaryColor: "#3A2C1A",
        accentColor: "#E6B422",
        font: "Arial"
      },
      terms: [
        "Payment terms: 50% deposit required, balance due 7 days before travel.",
        "Cancellation policy applies as per booking terms.",
        "Prices valid for 14 days from quote date.",
        "Subject to availability at time of booking.",
        "Travel insurance strongly recommended.",
        "All services subject to supplier terms and conditions."
      ],
      layout: {
        showLogo: true,
        logoPosition: "top-right",
        showBanking: true,
        showTerms: true,
        headerStyle: "classic",
        footerText: "Thank you for choosing us for your travel needs!"
      }
    });
    setLogoPreview("");
    setIsEditing(true);
  }
  function duplicateTemplate(template) {
    const duplicated = {
      ...template,
      id: `TPL-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setTemplateForm(duplicated);
    setLogoPreview(duplicated.companyInfo.logo || "");
    setIsEditing(true);
  }
  function addTerm() {
    setTemplateForm((prev) => ({
      ...prev,
      terms: [...prev.terms, ""]
    }));
  }
  function updateTerm(index, value) {
    setTemplateForm((prev) => ({
      ...prev,
      terms: prev.terms.map((term, i) => i === index ? value : term)
    }));
  }
  function removeTerm(index) {
    setTemplateForm((prev) => ({
      ...prev,
      terms: prev.terms.filter((_, i) => i !== index)
    }));
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-cream min-h-screen overflow-x-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-6 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl font-bold tracking-tight text-brand-brown", children: "Invoice Templates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm sm:text-base text-brand-russty max-w-prose", children: "Centralize your branding, legal details, banking and terms for fast quote & invoice generation." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: newTemplate,
            "data-testid": "create-new-template-btn",
            size: "md",
            children: "Create Template"
          }
        ),
        activeTemplate && !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "md",
            onClick: () => editTemplate(activeTemplate),
            children: "✏️ Edit Active"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-4 sticky top-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Your Templates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: templates.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty mb-3", children: "No templates yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: newTemplate,
              "data-testid": "create-first-template-btn",
              size: "sm",
              children: "Create First Template"
            }
          )
        ] }) : templates.map((template) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `border-2 rounded-lg p-3 cursor-pointer transition-all ${activeTemplate?.id === template.id ? "border-brand-orange bg-brand-orange/5" : "border-cream-border hover:border-brand-orange/50"}`,
            "data-testid": "template-item",
            onClick: () => setActiveTemplate(template),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-brand-brown truncate flex-1", children: template.name }),
                template.isDefault && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-brand-gold text-white px-2 py-0.5 rounded", "data-testid": "template-default-badge", children: "Default" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-brand-russty mb-2", children: template.companyInfo.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      editTemplate(template);
                    },
                    "data-testid": "template-edit-btn",
                    variant: "primary",
                    size: "xs",
                    children: "Edit"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      duplicateTemplate(template);
                    },
                    "data-testid": "template-copy-btn",
                    variant: "secondary",
                    size: "xs",
                    children: "Copy"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      deleteTemplate(template.id);
                    },
                    "data-testid": "template-delete-btn",
                    variant: "danger",
                    size: "xs",
                    children: "Delete"
                  }
                )
              ] })
            ]
          },
          template.id
        )) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-3", children: isEditing ? (
        /* Template Editor */
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Template Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Template Name *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: templateForm.name,
                    onChange: (e) => setTemplateForm({ ...templateForm, name: e.target.value }),
                    "data-testid": "template-name-input",
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "e.g., Safari Specialists Template"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: templateForm.isDefault,
                    onChange: (e) => setTemplateForm({ ...templateForm, isDefault: e.target.checked }),
                    className: "w-5 h-5 text-brand-orange focus:ring-brand-orange accent-brand-orange"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-brand-brown", children: "Set as Default Template" })
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Company Information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 p-4 bg-cream-sand rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-2", children: "Company Logo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "file",
                      accept: "image/*",
                      onChange: handleLogoUpload,
                      className: "w-full text-sm"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-brand-russty mt-1", children: "Max 2MB. Recommended: 300x100px PNG or JPG" })
                ] }),
                logoPreview && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32 h-20 border-2 border-cream-border rounded-lg p-2 bg-white flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoPreview, alt: "Logo preview", className: "max-w-full max-h-full object-contain" }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Company Name *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: templateForm.companyInfo.name,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      companyInfo: { ...templateForm.companyInfo, name: e.target.value }
                    }),
                    "data-testid": "company-name-input",
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "e.g., Safari Adventures"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Legal Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: templateForm.companyInfo.legalName,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      companyInfo: { ...templateForm.companyInfo, legalName: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "e.g., Safari Adventures (PTY) Ltd"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Registration Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: templateForm.companyInfo.registration,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      companyInfo: { ...templateForm.companyInfo, registration: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "Reg: 2020/123456/07"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Tax Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: templateForm.companyInfo.taxNumber,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      companyInfo: { ...templateForm.companyInfo, taxNumber: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "Tax: 9055225222"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "VAT Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: templateForm.companyInfo.vatNumber,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      companyInfo: { ...templateForm.companyInfo, vatNumber: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "VAT: 4123456789"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "CSD Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: templateForm.companyInfo.csd,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      companyInfo: { ...templateForm.companyInfo, csd: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "CSD: MAAA07802746"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Physical Address" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    value: templateForm.companyInfo.address,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      companyInfo: { ...templateForm.companyInfo, address: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    rows: "2",
                    placeholder: "123 Safari Road, Durban, 4001"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Phone Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "tel",
                    value: templateForm.companyInfo.phone,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      companyInfo: { ...templateForm.companyInfo, phone: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "(031) 123 4567"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Email Address" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "email",
                    value: templateForm.companyInfo.email,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      companyInfo: { ...templateForm.companyInfo, email: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "info@safariventures.com"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Website" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "url",
                    value: templateForm.companyInfo.website,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      companyInfo: { ...templateForm.companyInfo, website: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "www.safariventures.com"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Banking Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Bank Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: templateForm.banking.bankName,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      banking: { ...templateForm.banking, bankName: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "e.g., FNB, Standard Bank, Capitec"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Account Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: templateForm.banking.accountName,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      banking: { ...templateForm.banking, accountName: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "Safari Adventures (PTY) Ltd"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Account Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: templateForm.banking.accountNumber,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      banking: { ...templateForm.banking, accountNumber: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "1234567890"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Branch Code" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: templateForm.banking.branchCode,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      banking: { ...templateForm.banking, branchCode: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "250655"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Account Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: templateForm.banking.accountType,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      banking: { ...templateForm.banking, accountType: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Business" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Cheque" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Savings" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Current" })
                    ]
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown", children: "Terms & Conditions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addTerm, size: "sm", children: "Add Term" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: templateForm.terms.map((term, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-brand-brown font-semibold mt-2", children: [
                index + 1,
                "."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  value: term,
                  onChange: (e) => updateTerm(index, e.target.value),
                  className: "flex-1 px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                  rows: "2",
                  placeholder: "e.g., Payment terms: 50% deposit required..."
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => removeTerm(index),
                  className: "text-brand-orange hover:text-brand-brown transition-colors px-2 py-1 text-lg font-bold",
                  "aria-label": "Remove term",
                  children: "✕"
                }
              )
            ] }, index)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-brand-brown mb-4", children: "Layout & Styling" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Primary Color" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "color",
                      value: templateForm.styling.primaryColor,
                      onChange: (e) => setTemplateForm({
                        ...templateForm,
                        styling: { ...templateForm.styling, primaryColor: e.target.value }
                      }),
                      className: "w-16 h-10 border border-cream-border rounded cursor-pointer"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      value: templateForm.styling.primaryColor,
                      onChange: (e) => setTemplateForm({
                        ...templateForm,
                        styling: { ...templateForm.styling, primaryColor: e.target.value }
                      }),
                      className: "flex-1 px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Logo Position" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: templateForm.layout.logoPosition,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      layout: { ...templateForm.layout, logoPosition: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "top-left", children: "Top Left" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "top-right", children: "Top Right" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "top-center", children: "Top Center" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-brand-brown mb-1", children: "Footer Text" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: templateForm.layout.footerText,
                    onChange: (e) => setTemplateForm({
                      ...templateForm,
                      layout: { ...templateForm.layout, footerText: e.target.value }
                    }),
                    className: "w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none",
                    placeholder: "Thank you for your business!"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2 flex gap-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: templateForm.layout.showLogo,
                      onChange: (e) => setTemplateForm({
                        ...templateForm,
                        layout: { ...templateForm.layout, showLogo: e.target.checked }
                      }),
                      className: "w-5 h-5 accent-brand-orange"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Show Logo" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: templateForm.layout.showBanking,
                      onChange: (e) => setTemplateForm({
                        ...templateForm,
                        layout: { ...templateForm.layout, showBanking: e.target.checked }
                      }),
                      className: "w-5 h-5 accent-brand-orange"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Show Banking Details" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: templateForm.layout.showTerms,
                      onChange: (e) => setTemplateForm({
                        ...templateForm,
                        layout: { ...templateForm.layout, showTerms: e.target.checked }
                      }),
                      className: "w-5 h-5 accent-brand-orange"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Show Terms & Conditions" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 sticky bottom-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => setIsEditing(false),
                variant: "secondary",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: saveTemplate,
                "data-testid": "save-template-btn",
                fullWidth: true,
                children: "💾 Save Template"
              }
            )
          ] })
        ] })
      ) : activeTemplate ? (
        /* Template Preview */
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-brand-brown", children: activeTemplate.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                onClick: () => editTemplate(activeTemplate),
                "data-testid": "edit-template-btn",
                size: "sm",
                children: "✏️ Edit Template"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-2 border-cream-border rounded-lg p-8 bg-cream-sand", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-8 rounded shadow-lg max-w-4xl mx-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-2", style: { color: activeTemplate.styling.primaryColor }, children: "INVOICE" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Sample Preview" })
              ] }),
              activeTemplate.layout.showLogo && activeTemplate.companyInfo.logo && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: activeTemplate.companyInfo.logo, alt: "Logo", className: "max-w-32 max-h-20 object-contain" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-800", children: activeTemplate.companyInfo.name }),
              activeTemplate.companyInfo.legalName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: activeTemplate.companyInfo.legalName }),
              activeTemplate.companyInfo.address && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: activeTemplate.companyInfo.address }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-600 mt-1", children: [
                activeTemplate.companyInfo.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  activeTemplate.companyInfo.phone,
                  " | "
                ] }),
                activeTemplate.companyInfo.email && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: activeTemplate.companyInfo.email })
              ] }),
              activeTemplate.companyInfo.registration && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: activeTemplate.companyInfo.registration })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b-2", style: { borderColor: activeTemplate.styling.primaryColor }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2", children: "Description" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2", children: "Price" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2", children: "Total" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: "Sample Service" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right", children: "1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right", children: "R1,000.00" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-right", children: "R1,000.00" })
              ] }) })
            ] }),
            activeTemplate.layout.showBanking && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 p-4 bg-gray-50 rounded", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2", children: "Banking Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  "Bank: ",
                  activeTemplate.banking.bankName || "Not set"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  "Account: ",
                  activeTemplate.banking.accountNumber || "Not set"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  "Branch Code: ",
                  activeTemplate.banking.branchCode || "Not set"
                ] })
              ] })
            ] }),
            activeTemplate.layout.showTerms && activeTemplate.terms.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold mb-2", children: "Terms & Conditions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "text-xs text-gray-600 space-y-1", children: [
                activeTemplate.terms.slice(0, 3).map((term, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  i + 1,
                  ". ",
                  term
                ] }, i)),
                activeTemplate.terms.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "..." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-gray-600 pt-4 border-t", children: activeTemplate.layout.footerText })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 p-4 bg-brand-orange/10 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-brand-brown mb-2", children: "Template Ready!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-russty", children: "This template will be used when generating quotes and invoices. All your branding, company details, and banking information are saved." })
          ] })
        ] })
      ) : (
        /* No Template Selected */
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-md p-12 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4", children: "📄" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-brand-brown mb-2", children: "No Template Selected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-brand-russty mb-6", children: "Create your first branded invoice template to get started" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: newTemplate, size: "lg", children: "Create Template" })
        ] })
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] }) });
}
export {
  PartnerTemplates as default
};
//# sourceMappingURL=PartnerTemplates-DP35T7y5.js.map
