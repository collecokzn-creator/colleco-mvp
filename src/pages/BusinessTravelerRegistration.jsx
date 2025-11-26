import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, Users, Briefcase, CreditCard, Shield, CheckCircle2,
  ArrowRight, ArrowLeft, User, Mail, Phone, MapPin, FileText, Calendar
} from "lucide-react";

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

export default function BusinessTravelerRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const toggleArrayValue = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
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
      const response = await fetch('/api/business-travelers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          accountType: 'business_traveler',
          registeredAt: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Registration failed');

      const result = await response.json();
      
      // Store account info
      localStorage.setItem('colleco.businessAccount', JSON.stringify(result.account));
      
      // Navigate to business dashboard
      navigate('/business-dashboard', { 
        state: { message: 'Business account created successfully!', accountId: result.accountId }
      });
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Failed to create account. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {[
          { num: 1, label: "Business" },
          { num: 2, label: "Contact" },
          { num: 3, label: "Travel Profile" },
          { num: 4, label: "Billing" },
          { num: 5, label: "Team & Terms" }
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
          Business/Organization Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.businessName}
          onChange={(e) => updateField('businessName', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${errors.businessName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
          placeholder="Your Company Name"
        />
        {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
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
        <div className="space-y-2">
          {BUSINESS_TYPES.map(type => (
            <label key={type.value} className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.businessType === type.value ? 'border-brand-orange bg-orange-50' : 'border-gray-200 hover:border-brand-orange'
            }`}>
              <input
                type="radio"
                name="businessType"
                value={type.value}
                checked={formData.businessType === type.value}
                onChange={(e) => updateField('businessType', e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-semibold text-brand-brown">{type.label}</div>
                <div className="text-sm text-gray-600">{type.description}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Company Size <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.companySize}
          onChange={(e) => updateField('companySize', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${errors.companySize ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
        >
          <option value="">Select company size</option>
          {COMPANY_SIZES.map(size => (
            <option key={size.value} value={size.value}>{size.label}</option>
          ))}
        </select>
        {errors.companySize && <p className="text-red-500 text-sm mt-1">{errors.companySize}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">Industry</label>
        <input
          type="text"
          value={formData.industry}
          onChange={(e) => updateField('industry', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          placeholder="e.g., Technology, Finance, Healthcare"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Primary Contact Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={formData.contactName}
            onChange={(e) => updateField('contactName', e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border ${errors.contactName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
            placeholder="Full name"
          />
        </div>
        {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">Job Title/Role</label>
        <input
          type="text"
          value={formData.contactTitle}
          onChange={(e) => updateField('contactTitle', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          placeholder="e.g., Travel Manager, HR Director"
        />
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
            placeholder="contact@company.com"
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
        <label className="block text-sm font-semibold text-brand-brown mb-2">Alternate Contact</label>
        <input
          type="text"
          value={formData.alternateContact}
          onChange={(e) => updateField('alternateContact', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          placeholder="Backup contact (name & email)"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-3">
          Travel Purposes <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TRAVEL_PURPOSES.map(purpose => {
            const Icon = purpose.icon;
            return (
              <label key={purpose.value} className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.travelPurposes.includes(purpose.value) ? 'border-brand-orange bg-orange-50' : 'border-gray-200 hover:border-brand-orange'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.travelPurposes.includes(purpose.value)}
                  onChange={() => toggleArrayValue('travelPurposes', purpose.value)}
                />
                <Icon className="w-5 h-5 text-brand-orange" />
                <span className="font-medium text-brand-brown">{purpose.label}</span>
              </label>
            );
          })}
        </div>
        {errors.travelPurposes && <p className="text-red-500 text-sm mt-1">{errors.travelPurposes}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">Annual Travel Budget</label>
        <select
          value={formData.annualTravelBudget}
          onChange={(e) => updateField('annualTravelBudget', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
        >
          <option value="">Select budget range</option>
          <option value="0-100k">Under R100k</option>
          <option value="100k-500k">R100k - R500k</option>
          <option value="500k-1m">R500k - R1M</option>
          <option value="1m-5m">R1M - R5M</option>
          <option value="5m+">Over R5M</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">Average Trips Per Year</label>
        <input
          type="number"
          value={formData.averageTripsPerYear}
          onChange={(e) => updateField('averageTripsPerYear', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          placeholder="Estimated number of trips"
          min="1"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">Preferred Destinations</label>
        <textarea
          value={formData.preferredDestinations}
          onChange={(e) => updateField('preferredDestinations', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          rows={3}
          placeholder="e.g., Cape Town, Johannesburg, International conferences"
        />
      </div>

      <div>
        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-brand-orange">
          <input
            type="checkbox"
            checked={formData.travelPolicyExists}
            onChange={(e) => updateField('travelPolicyExists', e.target.checked)}
          />
          <span className="text-sm font-medium text-brand-brown">
            We have an existing corporate travel policy
          </span>
        </label>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Billing Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={formData.billingAddress}
            onChange={(e) => updateField('billingAddress', e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border ${errors.billingAddress ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
            placeholder="Street address"
          />
        </div>
        {errors.billingAddress && <p className="text-red-500 text-sm mt-1">{errors.billingAddress}</p>}
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
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-brown mb-2">Province/State</label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) => updateField('province', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-brand-brown mb-2">Postal Code</label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-brown mb-2">Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => updateField('country', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Tax/VAT Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={formData.taxNumber}
            onChange={(e) => updateField('taxNumber', e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border ${errors.taxNumber ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
            placeholder="Tax/VAT registration number"
          />
        </div>
        {errors.taxNumber && <p className="text-red-500 text-sm mt-1">{errors.taxNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-3">Preferred Payment Method</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-brand-orange">
            <input
              type="radio"
              name="paymentMethod"
              value="invoice"
              checked={formData.paymentMethod === "invoice"}
              onChange={(e) => updateField('paymentMethod', e.target.value)}
            />
            <CreditCard className="w-5 h-5 text-brand-orange" />
            <div>
              <div className="font-semibold text-brand-brown">Monthly Invoice</div>
              <div className="text-sm text-gray-600">Consolidated billing with 30-day payment terms</div>
            </div>
          </label>
          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-brand-orange">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={formData.paymentMethod === "card"}
              onChange={(e) => updateField('paymentMethod', e.target.value)}
            />
            <CreditCard className="w-5 h-5 text-brand-orange" />
            <div>
              <div className="font-semibold text-brand-brown">Corporate Card</div>
              <div className="text-sm text-gray-600">Charge immediately to company credit card</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-brand-brown mb-2">
          Estimated Number of Travelers <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.numberOfTravelers}
          onChange={(e) => updateField('numberOfTravelers', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border ${errors.numberOfTravelers ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-brand-orange focus:border-transparent`}
          placeholder="How many employees will travel?"
          min="1"
        />
        {errors.numberOfTravelers && <p className="text-red-500 text-sm mt-1">{errors.numberOfTravelers}</p>}
      </div>

      <div>
        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-brand-orange">
          <input
            type="checkbox"
            checked={formData.requiresApprovalWorkflow}
            onChange={(e) => updateField('requiresApprovalWorkflow', e.target.checked)}
          />
          <Shield className="w-5 h-5 text-brand-orange" />
          <div>
            <div className="font-semibold text-brand-brown">Enable Approval Workflow</div>
            <div className="text-sm text-gray-600">Require manager approval before booking</div>
          </div>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-brand-orange">
          <input
            type="checkbox"
            checked={formData.centralizedBilling}
            onChange={(e) => updateField('centralizedBilling', e.target.checked)}
          />
          <CreditCard className="w-5 h-5 text-brand-orange" />
          <div>
            <div className="font-semibold text-brand-brown">Centralized Billing</div>
            <div className="text-sm text-gray-600">All bookings billed to company account</div>
          </div>
        </label>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">🎁 Business Traveler Benefits</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Volume discounts on bookings</li>
          <li>• Dedicated account manager</li>
          <li>• Consolidated reporting & analytics</li>
          <li>• Flexible cancellation policies</li>
          <li>• Priority support (24/7)</li>
          <li>• Integration with expense management systems</li>
        </ul>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => updateField('agreedToTerms', e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm">
            I agree to the <a href="/terms" target="_blank" className="text-brand-orange underline">Terms & Conditions</a> <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.agreedToTerms && <p className="text-red-500 text-sm">{errors.agreedToTerms}</p>}

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={formData.agreedToDataProcessing}
            onChange={(e) => updateField('agreedToDataProcessing', e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm">
            I consent to processing of company and employee data for travel booking purposes <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.agreedToDataProcessing && <p className="text-red-500 text-sm">{errors.agreedToDataProcessing}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-brown mb-2">
            Business Travel Account
          </h1>
          <p className="text-gray-600">
            Manage corporate travel, staff recognition trips, and team building experiences
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

            {/* Navigation */}
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
                  {isSubmitting ? 'Creating Account...' : 'Create Business Account'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Help */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Questions? Contact our Business Travel team at{' '}
            <a href="mailto:business@collecotravel.com" className="text-brand-orange underline">
              business@collecotravel.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
