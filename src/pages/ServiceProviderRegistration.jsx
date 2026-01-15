import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, User, Mail, Phone, MapPin, Calendar, Building2, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Lock, Eye, EyeOff, Briefcase } from "lucide-react";
import Button from "../components/ui/Button";
import LegalConsentModal from "../components/LegalConsentModal";

/**
 * Service Provider Registration
 * For businesses that want to sell services on CollEco:
 * - Tour Operators
 * - Destination Management Companies (DMCs)
 * - Shuttle Services
 * - Flights
 * - Activities & Experiences
 * - Event Organizers
 * - Restaurants & Dining
 * - Accommodations
 */
export default function ServiceProviderRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showLegalConsent, setShowLegalConsent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Contact Person
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    position: "",
    // Business Information
    businessName: "",
    businessType: "",
    businessRegNumber: "",
    taxNumber: "",
    businessAddress: "",
    city: "",
    province: "",
    country: "South Africa",
    postalCode: "",
    website: "",
    // Banking Details
    bankAccountName: "",
    bankName: "",
    accountNumber: "",
    branchCode: "",
    // Services
    serviceCategories: [],
    description: "",
  });

  const businessTypes = [
    { id: "accommodation", label: "Accommodation (Hotels, Guest Houses, B&Bs)" },
    { id: "tours", label: "Tour Operator" },
    { id: "dmc", label: "Destination Management Company (DMC)" },
    { id: "transport", label: "Transport Services (Shuttles, Car Rental)" },
    { id: "flights", label: "Flight Services" },
    { id: "activities", label: "Activities & Experiences" },
    { id: "events", label: "Event Organizer" },
    { id: "dining", label: "Restaurant & Dining" },
    { id: "wellness", label: "Wellness & Spa" },
    { id: "other", label: "Other Service Provider" },
  ];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const toggleServiceCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.includes(category)
        ? prev.serviceCategories.filter(c => c !== category)
        : [...prev.serviceCategories, category]
    }));
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^[0-9+\s()-]{8,}$/.test(phone);

  const validateStep = (currentStep) => {
    setError("");

    if (currentStep === 1) {
      if (!formData.name || formData.name.trim().length < 2) {
        setError("Please enter the contact person's full name.");
        return false;
      }
      if (!formData.email || !validateEmail(formData.email)) {
        setError("Please enter a valid email address.");
        return false;
      }
      if (!formData.phone || !validatePhone(formData.phone)) {
        setError("Please enter a valid phone number.");
        return false;
      }
      if (!formData.password || formData.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
      if (localStorage.getItem("user:" + formData.email)) {
        setError("An account with this email already exists.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.businessName || formData.businessName.trim().length < 2) {
        setError("Please enter your business name.");
        return false;
      }
      if (!formData.businessType) {
        setError("Please select your business type.");
        return false;
      }
      if (!formData.businessRegNumber) {
        setError("Please provide your business registration number.");
        return false;
      }
      if (!formData.businessAddress || !formData.city) {
        setError("Please provide your business address.");
        return false;
      }
    }

    if (currentStep === 3) {
      if (formData.serviceCategories.length === 0) {
        setError("Please select at least one service category.");
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError("");
    window.scrollTo(0, 0);
  };

  const handleRegister = () => {
    if (!validateStep(step)) return;
    setShowLegalConsent(true);
  };

  const handleConsentAccept = (consentRecord) => {
    setIsSubmitting(true);
    
    const partner = {
      id: Date.now().toString(),
      type: "partner",
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      position: formData.position,
      country: formData.country,
      businessName: formData.businessName,
      businessType: formData.businessType,
      businessRegNumber: formData.businessRegNumber,
      taxNumber: formData.taxNumber,
      businessAddress: formData.businessAddress,
      city: formData.city,
      province: formData.province,
      postalCode: formData.postalCode,
      website: formData.website,
      serviceCategories: formData.serviceCategories,
      description: formData.description,
      bankDetails: {
        accountName: formData.bankAccountName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        branchCode: formData.branchCode,
      },
      registeredAt: new Date().toISOString(),
      emailVerified: false,
      phoneVerified: false,
      kycStatus: "pending",
      partnerStatus: "pending_verification",
      legalConsent: consentRecord,
    };

    localStorage.setItem("user:" + formData.email, JSON.stringify(partner));
    localStorage.setItem("user", JSON.stringify(partner));
    localStorage.setItem("user:lastIdentifier", formData.email);

    setIsSubmitting(false);
    setShowLegalConsent(false);
    
    // Navigate to partner onboarding
    navigate(`/partner-onboarding?new=true`);
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Briefcase className="w-8 h-8 text-brand-orange" />
            <h1 className="text-3xl font-bold text-brand-brown">Join as Service Provider</h1>
          </div>
          <p className="text-gray-600">
            Partner with CollEco to reach travelers across Southern Africa
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Looking to book travel? <button onClick={() => navigate('/register')} className="text-brand-orange hover:underline font-semibold">Register as a traveler</button>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {step} of {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-orange to-brand-gold transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Contact Person Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brand-brown mb-2">Contact Person</h2>
                <p className="text-gray-600">Primary contact for your business account</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value.toLowerCase())}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                      placeholder="john@business.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                      placeholder="+27 82 123 4567"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    Position/Title
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => updateField('position', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    placeholder="e.g., Managing Director, Operations Manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={nextStep}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Business Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-6 h-6 text-brand-orange" />
                  <h2 className="text-2xl font-bold text-brand-brown">Business Information</h2>
                </div>
                <p className="text-gray-600">Tell us about your business</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    Business/Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    placeholder="Your Business Name (Pty) Ltd"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => updateField('businessType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  >
                    <option value="">Select your business type</option>
                    {businessTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    CIPC Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessRegNumber}
                    onChange={(e) => updateField('businessRegNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    placeholder="2024/123456/07"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    Tax/VAT Number
                  </label>
                  <input
                    type="text"
                    value={formData.taxNumber}
                    onChange={(e) => updateField('taxNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    placeholder="4123456789"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    Business Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessAddress}
                    onChange={(e) => updateField('businessAddress', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    placeholder="Cape Town"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    Province
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => updateField('province', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    placeholder="Western Cape"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brand-brown mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    placeholder="https://www.yourbusiness.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={nextStep} className="flex-1">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Services & Description */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brand-brown mb-2">Services You Offer</h2>
                <p className="text-gray-600">Select all the service categories that apply</p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {["Accommodation", "Tours & Activities", "Transport", "Dining", "Events", "Experiences"].map(category => (
                  <button
                    key={category}
                    onClick={() => toggleServiceCategory(category)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.serviceCategories.includes(category)
                        ? 'border-brand-orange bg-orange-50 shadow-md'
                        : 'border-gray-200 hover:border-orange-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-brand-brown">{category}</span>
                      {formData.serviceCategories.includes(category) && (
                        <CheckCircle2 className="w-5 h-5 text-brand-orange" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-2">
                  Business Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  placeholder="Tell us about your business and what makes you unique..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={nextStep} className="flex-1">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brand-brown mb-2">Review Your Information</h2>
                <p className="text-gray-600">Please verify your details before submitting</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-brand-brown mb-2">Contact Person</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-600">Name:</span> <span className="font-medium">{formData.name}</span></div>
                    <div><span className="text-gray-600">Email:</span> <span className="font-medium">{formData.email}</span></div>
                    <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{formData.phone}</span></div>
                    {formData.position && <div><span className="text-gray-600">Position:</span> <span className="font-medium">{formData.position}</span></div>}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-brand-brown mb-2">Business Details</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-600">Business:</span> <span className="font-medium">{formData.businessName}</span></div>
                    <div><span className="text-gray-600">Type:</span> <span className="font-medium">{formData.businessType}</span></div>
                    <div><span className="text-gray-600">Reg. No:</span> <span className="font-medium">{formData.businessRegNumber}</span></div>
                    <div><span className="text-gray-600">City:</span> <span className="font-medium">{formData.city}</span></div>
                  </div>
                </div>

                {formData.serviceCategories.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-brand-brown mb-2">Services</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.serviceCategories.map(cat => (
                        <span key={cat} className="px-3 py-1 bg-brand-orange text-white rounded-full text-sm">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Verification Process</p>
                    <p className="text-blue-700">
                      After submission, our team will review your application and verify your business documentation. 
                      You'll receive an email within 1-2 business days with next steps.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleRegister} className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Review Legal Terms"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already registered?{" "}
            <button
              onClick={() => navigate('/login')}
              className="text-brand-orange hover:text-brand-gold font-semibold"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* Legal Consent Modal */}
      {showLegalConsent && (
        <LegalConsentModal
          userId={formData.email}
          userType="partner"
          onAccept={handleConsentAccept}
          onDecline={() => setShowLegalConsent(false)}
          isRegistration={true}
        />
      )}
    </div>
  );
}
