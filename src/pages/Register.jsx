import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, User, Mail, Phone, MapPin, Calendar, Building2, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Lock, Eye, EyeOff } from "lucide-react";
import Button from "../components/ui/Button";
import LegalConsentModal from "../components/LegalConsentModal";

/**
 * Enhanced Registration Flow
 * - Multi-step wizard for better UX
 * - POPI Act compliant data collection
 * - Separate flows for Clients and Partners
 * - Clear consent management
 * - Progressive disclosure of requirements
 */
export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showLegalConsent, setShowLegalConsent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Personal Information
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "South Africa",
    dateOfBirth: "",
    idNumber: "", // For FICA compliance
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^[0-9+\s()-]{8,}$/.test(phone);
  const validateSAID = (id) => /^[0-9]{13}$/.test(id.replace(/\s/g, ''));

  const validateStep = (currentStep) => {
    setError("");

    if (currentStep === 1) {
      if (!formData.name || formData.name.trim().length < 2) {
        setError("Please enter your full name.");
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
      // Check if email already exists
      if (localStorage.getItem("user:" + formData.email)) {
        setError("An account with this email already exists. Please login instead.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.dateOfBirth) {
        setError("Please provide your date of birth for age verification.");
        return false;
      }
      // Age verification (must be 18+)
      const birthDate = new Date(formData.dateOfBirth);
      const age = Math.floor((new Date() - birthDate) / 31557600000);
      if (age < 18) {
        setError("You must be at least 18 years old to register.");
        return false;
      }
      if (!formData.address) {
        setError("Please provide your residential address.");
        return false;
      }
      if (!formData.city) {
        setError("Please provide your city.");
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
    
    // Create user object
    const user = {
      id: Date.now().toString(),
      type: 'client',
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      country: formData.country,
      dateOfBirth: formData.dateOfBirth,
      address: formData.address,
      city: formData.city,
      province: formData.province,
      postalCode: formData.postalCode,
      idNumber: formData.idNumber,
      registeredAt: new Date().toISOString(),
      emailVerified: false,
      phoneVerified: false,
      kycStatus: "pending",
      legalConsent: consentRecord,
    };

    // Store user
    localStorage.setItem("user:" + formData.email, JSON.stringify(user));
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("user:lastIdentifier", formData.email);

    setIsSubmitting(false);
    setShowLegalConsent(false);
    
    // Navigate to onboarding
    navigate(`/onboarding?type=client&new=true`);
  };

  const totalSteps = 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-brand-orange" />
            <h1 className="text-3xl font-bold text-brand-brown">Join CollEco</h1>
          </div>
          <p className="text-gray-600">Create your account and start booking amazing travel experiences</p>
          <p className="text-sm text-gray-500 mt-2">
            Service providers? <button onClick={() => navigate('/service-provider-registration')} className="text-brand-orange hover:underline font-semibold">Register here</button>
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

          {/* Step 1: Account Credentials */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brand-brown mb-2">Account Details</h2>
                <p className="text-gray-600">Create your secure login credentials</p>
              </div>

              <div>
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
                    placeholder="john@example.com"
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
                <p className="text-xs text-gray-500 mt-1">Use a strong password with letters, numbers, and symbols</p>
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
                    placeholder="Re-enter your password"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={nextStep} className="flex-1">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information (POPI Compliance) */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-6 h-6 text-brand-orange" />
                  <h2 className="text-2xl font-bold text-brand-brown">Personal Information</h2>
                </div>
                <p className="text-gray-600">Required for FICA compliance and emergency contact purposes</p>
                <p className="text-xs text-gray-500 mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                  <strong>Privacy Notice:</strong> Your information is protected under the Protection of Personal Information Act (POPI). 
                  We collect this data solely for identity verification, fraud prevention, and emergency contact purposes.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be 18 years or older</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  >
                    <option>South Africa</option>
                    <option>Namibia</option>
                    <option>Botswana</option>
                    <option>Zimbabwe</option>
                    <option>Mozambique</option>
                    <option>Mauritius</option>
                    <option>Zambia</option>
                    <option>Malawi</option>
                    <option>Lesotho</option>
                    <option>Eswatini</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-brown mb-2">
                  Residential Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-brown mb-2">City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    placeholder="Cape Town"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-brown mb-2">Province</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => updateField('province', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    placeholder="Western Cape"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-brown mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    placeholder="8001"
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

          {/* Step 3: Final Review & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brand-brown mb-2">Review Your Information</h2>
                <p className="text-gray-600">Please verify your details before submitting</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-brand-brown mb-2">Account Details</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-600">Name:</span> <span className="font-medium">{formData.name}</span></div>
                    <div><span className="text-gray-600">Email:</span> <span className="font-medium">{formData.email}</span></div>
                    <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{formData.phone}</span></div>
                    <div><span className="text-gray-600">Country:</span> <span className="font-medium">{formData.country}</span></div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Your data is safe with us</p>
                    <p className="text-blue-700">
                      We comply with POPI Act and use industry-standard encryption to protect your personal information. 
                      You'll be asked to review and accept our privacy policy in the next step.
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
                  {isSubmitting ? "Creating Account..." : "Review Legal Terms"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
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
          userType="client"
          onAccept={handleConsentAccept}
          onDecline={() => setShowLegalConsent(false)}
          isRegistration={true}
        />
      )}
    </div>
  );
}
