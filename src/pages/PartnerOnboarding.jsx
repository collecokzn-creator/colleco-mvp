import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, Phone, Mail, MapPin, FileText, CheckCircle2, ArrowRight, ArrowLeft, Briefcase, Globe, DollarSign } from "lucide-react";

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

export default function PartnerOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
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
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(5)) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          appliedAt: new Date().toISOString(),
          status: 'pending'
        })
      });

      if (!response.ok) throw new Error('Application submission failed');

      const result = await response.json();
      
      // Store application ID for tracking
      localStorage.setItem('colleco.partner.applicationId', result.applicationId);
      
      // Navigate to verification page
      navigate('/partner/verification', { 
        state: { applicationId: result.applicationId, step: 'documents' }
      });
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {[
          { num: 1, label: "Business Info" },
          { num: 2, label: "Contact" },
          { num: 3, label: "Location" },
          { num: 4, label: "Details" },
          { num: 5, label: "Agreement" }
        ].map((step, idx, arr) => (
          <div key={step.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep > step.num ? 'bg-green-500 text-white' :
                currentStep === step.num ? 'bg-brand-orange text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step.num ? <CheckCircle2 className="w-5 h-5" /> : step.num}
              </div>
              <span className={`mt-2 text-xs font-medium hidden sm:block ${
                currentStep >= step.num ? 'text-brand-brown' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            {idx < arr.length - 1 && (
              <div className={`flex-1 h-1 mx-2 transition-all ${
                currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.businessName}
          onChange={(e) => updateField('businessName', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${errors.businessName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
          placeholder="Enter registered business name"
        />
        {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">Trading As (if different)</label>
        <input
          type="text"
          value={formData.tradingAs}
          onChange={(e) => updateField('tradingAs', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          placeholder="Optional trading name"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Registration/Company Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.registrationNumber}
          onChange={(e) => updateField('registrationNumber', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${errors.registrationNumber ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
          placeholder="e.g., 2024/123456/07"
        />
        {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Business Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.businessType}
          onChange={(e) => updateField('businessType', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${errors.businessType ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
        >
          <option value="">Select business type</option>
          {BUSINESS_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Partner Category <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.category}
          onChange={(e) => updateField('category', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
        >
          <option value="">Select your primary category</option>
          {PARTNER_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Primary Contact Person <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={formData.contactPerson}
            onChange={(e) => updateField('contactPerson', e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border ${errors.contactPerson ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
            placeholder="Full name"
          />
        </div>
        {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
            placeholder="business@example.com"
          />
        </div>
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
            placeholder="+27 XX XXX XXXX"
          />
        </div>
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">Alternate Phone</label>
        <div className="relative">
          <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="tel"
            value={formData.alternatePhone}
            onChange={(e) => updateField('alternatePhone', e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
            placeholder="Optional alternate contact"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">Website</label>
        <div className="relative">
          <Globe className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="url"
            value={formData.website}
            onChange={(e) => updateField('website', e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
            placeholder="https://www.example.com"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Street Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
            placeholder="Street address"
          />
        </div>
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-brand-brown mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
            placeholder="City"
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-brown mb-2">
            Province/State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) => updateField('province', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${errors.province ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
            placeholder="Province/State"
          />
          {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-brand-brown mb-2">Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => updateField('country', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-brown mb-2">Postal Code</label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
            placeholder="Postal code"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Years in Business <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.yearsInBusiness}
          onChange={(e) => updateField('yearsInBusiness', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${errors.yearsInBusiness ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
        >
          <option value="">Select</option>
          <option value="0-1">Less than 1 year</option>
          <option value="1-3">1-3 years</option>
          <option value="3-5">3-5 years</option>
          <option value="5-10">5-10 years</option>
          <option value="10+">10+ years</option>
        </select>
        {errors.yearsInBusiness && <p className="text-red-500 text-sm mt-1">{errors.yearsInBusiness}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Business Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
          rows={5}
          placeholder="Describe your business, target market, and unique offerings (minimum 50 characters)"
        />
        <div className="flex justify-between items-center mt-1">
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          <p className="text-sm text-gray-500 ml-auto">{formData.description.length} characters</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">Services/Products Offered</label>
        <textarea
          value={formData.servicesOffered}
          onChange={(e) => updateField('servicesOffered', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          rows={3}
          placeholder="List key services or products"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">Target Markets / Regions Served</label>
        <input
          type="text"
          value={formData.targetMarkets}
          onChange={(e) => updateField('targetMarkets', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          placeholder="e.g., Southern Africa, Europe, Corporate travelers"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">Estimated Annual Turnover (Optional)</label>
        <select
          value={formData.annualTurnover}
          onChange={(e) => updateField('annualTurnover', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
        >
          <option value="">Prefer not to say</option>
          <option value="0-500k">Under R500k</option>
          <option value="500k-2m">R500k - R2M</option>
          <option value="2m-5m">R2M - R5M</option>
          <option value="5m-10m">R5M - R10M</option>
          <option value="10m+">Over R10M</option>
        </select>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="bg-cream-light p-6 rounded-lg">
        <h3 className="font-bold text-brand-brown mb-3">Commission Structure</h3>
        <p className="text-sm text-gray-700 mb-4">
          CollEco charges a commission on bookings generated through the platform. Choose your preferred model:
        </p>
        
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-brand-orange transition-colors">
            <input
              type="radio"
              name="commissionModel"
              value="standard"
              checked={formData.preferredCommissionModel === "standard"}
              onChange={(e) => updateField('preferredCommissionModel', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-semibold text-brand-brown">Standard (15%)</div>
              <div className="text-sm text-gray-600">15% commission on all bookings. Standard listing placement.</div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-brand-orange transition-colors">
            <input
              type="radio"
              name="commissionModel"
              value="premium"
              checked={formData.preferredCommissionModel === "premium"}
              onChange={(e) => updateField('preferredCommissionModel', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-semibold text-brand-brown">Premium (10%)</div>
              <div className="text-sm text-gray-600">10% commission + Featured placement + Priority support + Marketing assistance</div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-brand-orange transition-colors">
            <input
              type="radio"
              name="commissionModel"
              value="enterprise"
              checked={formData.preferredCommissionModel === "enterprise"}
              onChange={(e) => updateField('preferredCommissionModel', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-semibold text-brand-brown">Enterprise (Custom)</div>
              <div className="text-sm text-gray-600">Negotiated rates for high-volume partners. Dedicated account manager.</div>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => updateField('agreedToTerms', e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm">
            I agree to the <a href="/terms" target="_blank" className="text-brand-orange underline">Terms & Conditions</a> and <a href="/privacy" target="_blank" className="text-brand-orange underline">Privacy Policy</a> <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.agreedToTerms && <p className="text-red-500 text-sm">{errors.agreedToTerms}</p>}

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={formData.agreedToCommission}
            onChange={(e) => updateField('agreedToCommission', e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm">
            I agree to the commission structure selected above and understand that CollEco will deduct this from bookings. <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.agreedToCommission && <p className="text-red-500 text-sm">{errors.agreedToCommission}</p>}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Next Steps</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Submit your application</li>
          <li>• Upload required documents (licenses, insurance, banking details)</li>
          <li>• Our team reviews your application (typically 3-5 business days)</li>
          <li>• Receive approval notification and activate your account</li>
          <li>• Start listing your products and receiving bookings!</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-brown mb-2">
            Join the CollEco Partner Network
          </h1>
          <p className="text-gray-600">
            Complete the application to start your journey with CollEco Travel
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}

            {errors.submit && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-orange text-white font-semibold hover:bg-orange-600 transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Need help? Contact our Partner Support team at{' '}
            <a href="mailto:partners@collecotravel.com" className="text-brand-orange underline">
              partners@collecotravel.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
