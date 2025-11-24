import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';

export default function PartnerTemplates() {
  const { user } = useUser();
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  
  const [templateForm, setTemplateForm] = useState({
    id: '',
    name: 'Default Template',
    isDefault: false,
    partnerId: user?.id || '',
    companyInfo: {
      name: '',
      legalName: '',
      registration: '',
      taxNumber: '',
      vatNumber: '',
      csd: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      logo: null
    },
    banking: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      branchCode: '',
      accountType: 'Business'
    },
    styling: {
      primaryColor: '#F47C20',
      secondaryColor: '#3A2C1A',
      accentColor: '#E6B422',
      font: 'Arial'
    },
    terms: [
      'Payment terms: 50% deposit required, balance due 7 days before travel.',
      'Cancellation policy applies as per booking terms.',
      'Prices valid for 14 days from quote date.',
      'Subject to availability at time of booking.',
      'Travel insurance strongly recommended.',
      'All services subject to supplier terms and conditions.'
    ],
    layout: {
      showLogo: true,
      logoPosition: 'top-right',
      showBanking: true,
      showTerms: true,
      headerStyle: 'classic',
      footerText: 'Thank you for choosing us for your travel needs!'
    }
  });

  const loadTemplates = useCallback(() => {
    const savedTemplates = JSON.parse(localStorage.getItem(`partner_templates_${user?.id}`) || '[]');
    setTemplates(savedTemplates);
    
    // Load default template if exists
    const defaultTemplate = savedTemplates.find(t => t.isDefault);
    if (defaultTemplate) {
      setActiveTemplate(defaultTemplate);
    }
  }, [user?.id]);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be less than 2MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Logo = event.target.result;
      setLogoPreview(base64Logo);
      setTemplateForm(prev => ({
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
      alert('Please enter company name');
      return;
    }

    const newTemplate = {
      ...templateForm,
      id: templateForm.id || `TPL-${Date.now()}`,
      partnerId: user?.id,
      createdAt: templateForm.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const allTemplates = [...templates];
    const existingIndex = allTemplates.findIndex(t => t.id === newTemplate.id);

    // If setting as default, remove default from others
    if (newTemplate.isDefault) {
      allTemplates.forEach(t => t.isDefault = false);
    }

    if (existingIndex >= 0) {
      allTemplates[existingIndex] = newTemplate;
    } else {
      allTemplates.push(newTemplate);
    }

    localStorage.setItem(`partner_templates_${user?.id}`, JSON.stringify(allTemplates));
    setTemplates(allTemplates);
    setActiveTemplate(newTemplate);
    setIsEditing(false);
    alert('Template saved successfully!');
  }

  function editTemplate(template) {
    setTemplateForm(template);
    setLogoPreview(template.companyInfo.logo || '');
    setIsEditing(true);
  }

  function deleteTemplate(id) {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const filtered = templates.filter(t => t.id !== id);
    localStorage.setItem(`partner_templates_${user?.id}`, JSON.stringify(filtered));
    setTemplates(filtered);
    
    if (activeTemplate?.id === id) {
      setActiveTemplate(filtered[0] || null);
    }
  }

  function newTemplate() {
    setTemplateForm({
      id: '',
      name: 'New Template',
      isDefault: templates.length === 0,
      partnerId: user?.id || '',
      companyInfo: {
        name: '',
        legalName: '',
        registration: '',
        taxNumber: '',
        vatNumber: '',
        csd: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        logo: null
      },
      banking: {
        bankName: '',
        accountName: '',
        accountNumber: '',
        branchCode: '',
        accountType: 'Business'
      },
      styling: {
        primaryColor: '#F47C20',
        secondaryColor: '#3A2C1A',
        accentColor: '#E6B422',
        font: 'Arial'
      },
      terms: [
        'Payment terms: 50% deposit required, balance due 7 days before travel.',
        'Cancellation policy applies as per booking terms.',
        'Prices valid for 14 days from quote date.',
        'Subject to availability at time of booking.',
        'Travel insurance strongly recommended.',
        'All services subject to supplier terms and conditions.'
      ],
      layout: {
        showLogo: true,
        logoPosition: 'top-right',
        showBanking: true,
        showTerms: true,
        headerStyle: 'classic',
        footerText: 'Thank you for choosing us for your travel needs!'
      }
    });
    setLogoPreview('');
    setIsEditing(true);
  }

  function duplicateTemplate(template) {
    const duplicated = {
      ...template,
      id: `TPL-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString()
    };
    setTemplateForm(duplicated);
    setLogoPreview(duplicated.companyInfo.logo || '');
    setIsEditing(true);
  }

  function addTerm() {
    setTemplateForm(prev => ({
      ...prev,
      terms: [...prev.terms, '']
    }));
  }

  function updateTerm(index, value) {
    setTemplateForm(prev => ({
      ...prev,
      terms: prev.terms.map((term, i) => i === index ? value : term)
    }));
  }

  function removeTerm(index) {
    setTemplateForm(prev => ({
      ...prev,
      terms: prev.terms.filter((_, i) => i !== index)
    }));
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-brown mb-2">Invoice Templates</h1>
            <p className="text-brand-russty">Create and manage your branded invoice templates</p>
          </div>
          <button
            onClick={newTemplate}
            data-testid="create-new-template-btn"
            className="px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-highlight transition-colors"
          >
            + Create New Template
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Templates Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h3 className="text-lg font-bold text-brand-brown mb-4">Your Templates</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {templates.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-brand-russty mb-3">No templates yet</p>
                    <button
                      onClick={newTemplate}
                      data-testid="create-first-template-btn"
                      className="text-sm px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-highlight"
                    >
                      Create First Template
                    </button>
                  </div>
                ) : (
                  templates.map(template => (
                    <div
                      key={template.id}
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                        activeTemplate?.id === template.id
                          ? 'border-brand-orange bg-brand-orange/5'
                          : 'border-cream-border hover:border-brand-orange/50'
                      }`}
                      data-testid="template-item"
                      onClick={() => setActiveTemplate(template)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-sm text-brand-brown truncate flex-1">
                          {template.name}
                        </span>
                        {template.isDefault && (
                          <span className="text-xs bg-brand-gold text-white px-2 py-0.5 rounded" data-testid="template-default-badge">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-brand-russty mb-2">
                        {template.companyInfo.name}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editTemplate(template);
                          }}
                          data-testid="template-edit-btn"
                          className="text-xs px-2 py-1 bg-brand-orange text-white rounded hover:bg-brand-highlight"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateTemplate(template);
                          }}
                          data-testid="template-copy-btn"
                          className="text-xs px-2 py-1 bg-brand-brown text-white rounded hover:bg-brand-russty"
                        >
                          Copy
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template.id);
                          }}
                          data-testid="template-delete-btn"
                          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isEditing ? (
              /* Template Editor */
              <div className="space-y-6">
                {/* Template Name */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-brand-brown mb-4">Template Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Template Name *</label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={e => setTemplateForm({...templateForm, name: e.target.value})}
                        data-testid="template-name-input"
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="e.g., Safari Specialists Template"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={templateForm.isDefault}
                          onChange={e => setTemplateForm({...templateForm, isDefault: e.target.checked})}
                          className="w-5 h-5 text-brand-orange focus:ring-brand-orange"
                        />
                        <span className="text-sm font-semibold text-brand-brown">Set as Default Template</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-brand-brown mb-4">Company Information</h3>
                  
                  {/* Logo Upload */}
                  <div className="mb-6 p-4 bg-cream-sand rounded-lg">
                    <label className="block text-sm font-semibold text-brand-brown mb-2">Company Logo</label>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="w-full text-sm"
                        />
                        <p className="text-xs text-brand-russty mt-1">Max 2MB. Recommended: 300x100px PNG or JPG</p>
                      </div>
                      {logoPreview && (
                        <div className="w-32 h-20 border-2 border-cream-border rounded-lg p-2 bg-white flex items-center justify-center">
                          <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Company Name *</label>
                      <input
                        type="text"
                        value={templateForm.companyInfo.name}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          companyInfo: {...templateForm.companyInfo, name: e.target.value}
                        })}
                        data-testid="company-name-input"
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="e.g., Safari Adventures"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Legal Name</label>
                      <input
                        type="text"
                        value={templateForm.companyInfo.legalName}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          companyInfo: {...templateForm.companyInfo, legalName: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="e.g., Safari Adventures (PTY) Ltd"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Registration Number</label>
                      <input
                        type="text"
                        value={templateForm.companyInfo.registration}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          companyInfo: {...templateForm.companyInfo, registration: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="Reg: 2020/123456/07"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Tax Number</label>
                      <input
                        type="text"
                        value={templateForm.companyInfo.taxNumber}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          companyInfo: {...templateForm.companyInfo, taxNumber: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="Tax: 9055225222"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">VAT Number</label>
                      <input
                        type="text"
                        value={templateForm.companyInfo.vatNumber}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          companyInfo: {...templateForm.companyInfo, vatNumber: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="VAT: 4123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">CSD Number</label>
                      <input
                        type="text"
                        value={templateForm.companyInfo.csd}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          companyInfo: {...templateForm.companyInfo, csd: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="CSD: MAAA07802746"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Physical Address</label>
                      <textarea
                        value={templateForm.companyInfo.address}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          companyInfo: {...templateForm.companyInfo, address: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        rows="2"
                        placeholder="123 Safari Road, Durban, 4001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={templateForm.companyInfo.phone}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          companyInfo: {...templateForm.companyInfo, phone: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="(031) 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Email Address</label>
                      <input
                        type="email"
                        value={templateForm.companyInfo.email}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          companyInfo: {...templateForm.companyInfo, email: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="info@safariventures.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Website</label>
                      <input
                        type="url"
                        value={templateForm.companyInfo.website}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          companyInfo: {...templateForm.companyInfo, website: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="www.safariventures.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Banking Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-brand-brown mb-4">Banking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={templateForm.banking.bankName}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          banking: {...templateForm.banking, bankName: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="e.g., FNB, Standard Bank, Capitec"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Account Name</label>
                      <input
                        type="text"
                        value={templateForm.banking.accountName}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          banking: {...templateForm.banking, accountName: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="Safari Adventures (PTY) Ltd"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Account Number</label>
                      <input
                        type="text"
                        value={templateForm.banking.accountNumber}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          banking: {...templateForm.banking, accountNumber: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Branch Code</label>
                      <input
                        type="text"
                        value={templateForm.banking.branchCode}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          banking: {...templateForm.banking, branchCode: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="250655"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Account Type</label>
                      <select
                        value={templateForm.banking.accountType}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          banking: {...templateForm.banking, accountType: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                      >
                        <option>Business</option>
                        <option>Cheque</option>
                        <option>Savings</option>
                        <option>Current</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-brand-brown">Terms & Conditions</h3>
                    <button
                      onClick={addTerm}
                      className="px-4 py-2 bg-brand-orange text-white rounded-lg text-sm font-semibold hover:bg-brand-highlight"
                    >
                      + Add Term
                    </button>
                  </div>
                  <div className="space-y-3">
                    {templateForm.terms.map((term, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-brand-brown font-semibold mt-2">{index + 1}.</span>
                        <textarea
                          value={term}
                          onChange={e => updateTerm(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                          rows="2"
                          placeholder="Enter term or condition..."
                        />
                        <button
                          onClick={() => removeTerm(index)}
                          className="text-red-500 hover:text-red-700 font-bold px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layout & Styling */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-brand-brown mb-4">Layout & Styling</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Primary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={templateForm.styling.primaryColor}
                          onChange={e => setTemplateForm({
                            ...templateForm,
                            styling: {...templateForm.styling, primaryColor: e.target.value}
                          })}
                          className="w-16 h-10 border border-cream-border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={templateForm.styling.primaryColor}
                          onChange={e => setTemplateForm({
                            ...templateForm,
                            styling: {...templateForm.styling, primaryColor: e.target.value}
                          })}
                          className="flex-1 px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Logo Position</label>
                      <select
                        value={templateForm.layout.logoPosition}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          layout: {...templateForm.layout, logoPosition: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                      >
                        <option value="top-left">Top Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-center">Top Center</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-brand-brown mb-1">Footer Text</label>
                      <input
                        type="text"
                        value={templateForm.layout.footerText}
                        onChange={e => setTemplateForm({
                          ...templateForm,
                          layout: {...templateForm.layout, footerText: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-cream-border rounded-lg focus:border-brand-orange focus:outline-none"
                        placeholder="Thank you for your business!"
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={templateForm.layout.showLogo}
                          onChange={e => setTemplateForm({
                            ...templateForm,
                            layout: {...templateForm.layout, showLogo: e.target.checked}
                          })}
                          className="w-5 h-5"
                        />
                        <span className="text-sm">Show Logo</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={templateForm.layout.showBanking}
                          onChange={e => setTemplateForm({
                            ...templateForm,
                            layout: {...templateForm.layout, showBanking: e.target.checked}
                          })}
                          className="w-5 h-5"
                        />
                        <span className="text-sm">Show Banking Details</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={templateForm.layout.showTerms}
                          onChange={e => setTemplateForm({
                            ...templateForm,
                            layout: {...templateForm.layout, showTerms: e.target.checked}
                          })}
                          className="w-5 h-5"
                        />
                        <span className="text-sm">Show Terms & Conditions</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 sticky bottom-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-white border-2 border-brand-brown text-brand-brown rounded-lg font-semibold hover:bg-cream-sand transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTemplate}
                    data-testid="save-template-btn"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-orange to-brand-gold text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    💾 Save Template
                  </button>
                </div>
              </div>
            ) : activeTemplate ? (
              /* Template Preview */
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-brand-brown">{activeTemplate.name}</h3>
                  <button
                    onClick={() => editTemplate(activeTemplate)}
                    data-testid="edit-template-btn"
                    className="px-4 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-highlight"
                  >
                    ✏️ Edit Template
                  </button>
                </div>

                {/* Preview */}
                <div className="border-2 border-cream-border rounded-lg p-8 bg-cream-sand">
                  <div className="bg-white p-8 rounded shadow-lg max-w-4xl mx-auto">
                    {/* Header with Logo */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h1 className="text-3xl font-bold mb-2" style={{color: activeTemplate.styling.primaryColor}}>
                          INVOICE
                        </h1>
                        <p className="text-sm text-gray-600">Sample Preview</p>
                      </div>
                      {activeTemplate.layout.showLogo && activeTemplate.companyInfo.logo && (
                        <img src={activeTemplate.companyInfo.logo} alt="Logo" className="max-w-32 max-h-20 object-contain" />
                      )}
                    </div>

                    {/* Company Info */}
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-800">{activeTemplate.companyInfo.name}</h2>
                      {activeTemplate.companyInfo.legalName && (
                        <p className="text-sm text-gray-600">{activeTemplate.companyInfo.legalName}</p>
                      )}
                      {activeTemplate.companyInfo.address && (
                        <p className="text-sm text-gray-600">{activeTemplate.companyInfo.address}</p>
                      )}
                      <div className="text-sm text-gray-600 mt-1">
                        {activeTemplate.companyInfo.phone && <span>{activeTemplate.companyInfo.phone} | </span>}
                        {activeTemplate.companyInfo.email && <span>{activeTemplate.companyInfo.email}</span>}
                      </div>
                      {activeTemplate.companyInfo.registration && (
                        <p className="text-xs text-gray-500 mt-1">{activeTemplate.companyInfo.registration}</p>
                      )}
                    </div>

                    {/* Sample Items Table */}
                    <table className="w-full mb-6">
                      <thead>
                        <tr className="border-b-2" style={{borderColor: activeTemplate.styling.primaryColor}}>
                          <th className="text-left py-2">Description</th>
                          <th className="text-right py-2">Qty</th>
                          <th className="text-right py-2">Price</th>
                          <th className="text-right py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Sample Service</td>
                          <td className="text-right">1</td>
                          <td className="text-right">R1,000.00</td>
                          <td className="text-right">R1,000.00</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Banking */}
                    {activeTemplate.layout.showBanking && (
                      <div className="mb-6 p-4 bg-gray-50 rounded">
                        <h3 className="font-bold mb-2">Banking Details</h3>
                        <div className="text-sm">
                          <p>Bank: {activeTemplate.banking.bankName || 'Not set'}</p>
                          <p>Account: {activeTemplate.banking.accountNumber || 'Not set'}</p>
                          <p>Branch Code: {activeTemplate.banking.branchCode || 'Not set'}</p>
                        </div>
                      </div>
                    )}

                    {/* Terms */}
                    {activeTemplate.layout.showTerms && activeTemplate.terms.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-bold mb-2">Terms & Conditions</h3>
                        <ol className="text-xs text-gray-600 space-y-1">
                          {activeTemplate.terms.slice(0, 3).map((term, i) => (
                            <li key={i}>{i + 1}. {term}</li>
                          ))}
                          {activeTemplate.terms.length > 3 && <li>...</li>}
                        </ol>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="text-center text-sm text-gray-600 pt-4 border-t">
                      {activeTemplate.layout.footerText}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-brand-orange/10 rounded-lg">
                  <h4 className="font-bold text-brand-brown mb-2">✨ Template Ready!</h4>
                  <p className="text-sm text-brand-russty">
                    This template will be used when generating quotes and invoices. 
                    All your branding, company details, and banking information are saved.
                  </p>
                </div>
              </div>
            ) : (
              /* No Template Selected */
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-2xl font-bold text-brand-brown mb-2">No Template Selected</h3>
                <p className="text-brand-russty mb-6">
                  Create your first branded invoice template to get started
                </p>
                <button
                  onClick={newTemplate}
                  className="px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-highlight transition-colors"
                >
                  Create Template
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
