import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Sparkles, CheckCircle2, Mail, Phone, Shield, ArrowRight, 
  ArrowLeft, Building2, FileText, Upload, Bell, DollarSign,
  Clock, Award, TrendingUp
} from "lucide-react";
import Button from "../components/ui/Button";
import { useUser } from "../context/UserContext.jsx";

/**
 * Partner Onboarding - Post-Registration Setup
 * - Welcome service providers after registration
 * - Verification status tracking
 * - Document upload guidance
 * - Payment preferences setup
 * - Service listing preparation
 */
export default function PartnerOnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setUser } = useUser();
  const [step, setStep] = useState(1);
  const _isNewPartner = searchParams.get('new') === 'true';

  const [verificationStatus, setVerificationStatus] = useState({
    email: user?.emailVerified || false,
    phone: user?.phoneVerified || false,
    business: false,
    documents: false,
  });

  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [generatedEmailCode] = useState(Math.floor(100000 + Math.random() * 900000).toString());
  const [generatedPhoneCode] = useState(Math.floor(100000 + Math.random() * 900000).toString());

  const [preferences, setPreferences] = useState({
    payoutFrequency: "monthly",
    payoutMethod: "bank_transfer",
    notifications: {
      email: true,
      sms: false,
      push: true,
      bookings: true,
      reviews: true,
    },
    autoAcceptBookings: false,
  });

  useEffect(() => {
    // Simulate sending verification codes
    if (step === 2 && user?.email && !verificationStatus.email) {
      console.log(`📧 Email verification code for ${user.email}: ${generatedEmailCode}`);
    }
    if (step === 2 && user?.phone && !verificationStatus.phone) {
      console.log(`📱 SMS verification code for ${user.phone}: ${generatedPhoneCode}`);
    }
  }, [step, user, generatedEmailCode, generatedPhoneCode, verificationStatus]);

  const verifyEmail = () => {
    if (emailCode === generatedEmailCode) {
      setVerificationStatus(prev => ({ ...prev, email: true }));
      if (user) {
        const updatedUser = { ...user, emailVerified: true };
        localStorage.setItem("user:" + user.email, JSON.stringify(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } else {
      alert("Invalid verification code. Please try again.");
    }
  };

  const verifyPhone = () => {
    if (phoneCode === generatedPhoneCode) {
      setVerificationStatus(prev => ({ ...prev, phone: true }));
      if (user) {
        const updatedUser = { ...user, phoneVerified: true };
        localStorage.setItem("user:" + user.email, JSON.stringify(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } else {
      alert("Invalid verification code. Please try again.");
    }
  };

  const completeOnboarding = () => {
    if (user) {
      const updatedUser = {
        ...user,
        partnerOnboardingComplete: true,
        preferences,
        onboardedAt: new Date().toISOString(),
      };
      localStorage.setItem("user:" + user.email, JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    navigate('/partner/dashboard');
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
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
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-orange to-brand-gold rounded-full mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl font-bold text-brand-brown">
                Welcome, Partner! 🎉
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Thank you for joining the CollEco ecosystem. Let's get your business set up to start receiving bookings!
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
                <h3 className="font-semibold text-brand-brown mb-3">What happens next?</h3>
                <ul className="space-y-3 text-left text-gray-700">
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Verification (1-2 business days)</strong>
                      <p className="text-sm text-gray-600 mt-1">Our team will review your business registration documents</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Document Submission</strong>
                      <p className="text-sm text-gray-600 mt-1">Upload required legal documents (CIPC, tax clearance)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Account Activation</strong>
                      <p className="text-sm text-gray-600 mt-1">Once approved, start listing your services and accepting bookings</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mt-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h4 className="font-semibold text-brand-brown mb-2">Partner Benefits</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Access to thousands of travelers</li>
                      <li>• Secure payment processing</li>
                      <li>• Marketing & promotional support</li>
                      <li>• Real-time booking management</li>
                      <li>• Analytics & reporting tools</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button onClick={() => setStep(2)} size="lg" className="mt-8">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <button
                onClick={() => navigate('/partner/dashboard')}
                className="text-sm text-gray-500 hover:text-gray-700 mt-4 block"
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Step 2: Verify Email & Phone */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <Shield className="w-16 h-16 mx-auto mb-4 text-brand-orange" />
                <h2 className="text-3xl font-bold text-brand-brown mb-2">Verify Your Contact</h2>
                <p className="text-gray-600">
                  Verified contact information helps customers trust your business and ensures you receive booking notifications.
                </p>
              </div>

              {/* Email Verification */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-6 h-6 text-brand-orange" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-brand-brown">Email Verification</h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                  {verificationStatus.email && (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                </div>

                {!verificationStatus.email ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      We've sent a 6-digit code to your email. Please enter it below:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={emailCode}
                        onChange={(e) => setEmailCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                      />
                      <Button onClick={verifyEmail} disabled={emailCode.length !== 6}>
                        Verify
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Demo code: <code className="bg-gray-100 px-2 py-1 rounded">{generatedEmailCode}</code>
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                    ✓ Email verified successfully!
                  </div>
                )}
              </div>

              {/* Phone Verification */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="w-6 h-6 text-brand-orange" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-brand-brown">Phone Verification</h3>
                    <p className="text-sm text-gray-600">{user?.phone}</p>
                  </div>
                  {verificationStatus.phone && (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                </div>

                {!verificationStatus.phone ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      We've sent a 6-digit code to your phone. Please enter it below:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                      />
                      <Button onClick={verifyPhone} disabled={phoneCode.length !== 6}>
                        Verify
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Demo code: <code className="bg-gray-100 px-2 py-1 rounded">{generatedPhoneCode}</code>
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                    ✓ Phone verified successfully!
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1"
                  disabled={!verificationStatus.email && !verificationStatus.phone}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {!verificationStatus.email && !verificationStatus.phone && (
                <p className="text-sm text-gray-500 text-center">
                  Please verify at least one contact method to continue
                </p>
              )}
            </div>
          )}

          {/* Step 3: Business Verification Status */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-brand-orange" />
                <h2 className="text-3xl font-bold text-brand-brown mb-2">Verification Status</h2>
                <p className="text-gray-600">
                  Track the progress of your business verification and document review.
                </p>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {verificationStatus.email ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-brand-brown">Email Verified</h4>
                      <p className="text-sm text-gray-600 mt-1">Your email address has been confirmed</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {verificationStatus.phone ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-brand-brown">Phone Verified</h4>
                      <p className="text-sm text-gray-600 mt-1">Your phone number has been confirmed</p>
                    </div>
                  </div>
                </div>

                <div className="border border-orange-200 rounded-xl p-5 bg-orange-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-brand-brown">Business Verification</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Our team is reviewing your CIPC registration and tax documents
                      </p>
                      <div className="mt-3 text-xs text-gray-600">
                        <strong>Estimated time:</strong> 1-2 business days
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-brand-brown">Document Upload</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Upload required documents for final approval
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setVerificationStatus(prev => ({ ...prev, documents: true }))}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Documents
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6">
                <h4 className="font-semibold text-brand-brown mb-2">Required Documents:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• CIPC Company Registration Certificate</li>
                  <li>• Tax Clearance Certificate (SARS)</li>
                  <li>• Director/Owner ID Documents</li>
                  <li>• Proof of Bank Account</li>
                  <li>• Professional Licenses (if applicable)</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Payment & Preferences */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-brand-orange" />
                <h2 className="text-3xl font-bold text-brand-brown mb-2">Payment & Preferences</h2>
                <p className="text-gray-600">
                  Configure how you receive payments and manage booking notifications.
                </p>
              </div>

              {/* Payout Settings */}
              <div>
                <h3 className="font-semibold text-brand-brown mb-4">Payout Settings</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payout Frequency
                    </label>
                    <select
                      value={preferences.payoutFrequency}
                      onChange={(e) => setPreferences(prev => ({ ...prev, payoutFrequency: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payout Method
                    </label>
                    <select
                      value={preferences.payoutMethod}
                      onChange={(e) => setPreferences(prev => ({ ...prev, payoutMethod: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                    >
                      <option value="bank_transfer">Bank Transfer (EFT)</option>
                      <option value="paypal">PayPal</option>
                      <option value="payoneer">Payoneer</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  <strong>Commission:</strong> CollEco charges a 15% commission on all bookings.
                  Payments are processed securely and transferred according to your selected frequency.
                </div>
              </div>

              {/* Booking Preferences */}
              <div>
                <h3 className="font-semibold text-brand-brown mb-4">Booking Management</h3>
                
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={preferences.autoAcceptBookings}
                    onChange={(e) => setPreferences(prev => ({ ...prev, autoAcceptBookings: e.target.checked }))}
                    className="w-5 h-5 text-brand-orange rounded focus:ring-brand-orange"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-brand-brown">Auto-accept Bookings</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Automatically accept booking requests (recommended for high availability)
                    </p>
                  </div>
                </label>
              </div>

              {/* Notification Preferences */}
              <div>
                <h3 className="font-semibold text-brand-brown mb-4">Notification Preferences</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.email}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: e.target.checked }
                      }))}
                      className="w-5 h-5 text-brand-orange rounded focus:ring-brand-orange"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-brand-orange" />
                        <span className="font-semibold text-brand-brown">Email Notifications</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Booking confirmations, reviews, and updates</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.sms}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, sms: e.target.checked }
                      }))}
                      className="w-5 h-5 text-brand-orange rounded focus:ring-brand-orange"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-brand-orange" />
                        <span className="font-semibold text-brand-brown">SMS Notifications</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Urgent booking alerts and customer inquiries</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.push}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, push: e.target.checked }
                      }))}
                      className="w-5 h-5 text-brand-orange rounded focus:ring-brand-orange"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-brand-orange" />
                        <span className="font-semibold text-brand-brown">Push Notifications</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Real-time booking and review notifications</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-gradient-to-r from-brand-orange to-brand-gold rounded-xl p-8 text-white text-center mt-8">
                <Award className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Setup Complete!</h3>
                <p className="text-orange-50 mb-6">
                  You're all set! Access your partner dashboard to start listing services and managing bookings.
                </p>
                <Button 
                  onClick={completeOnboarding}
                  variant="outline"
                  className="bg-white text-brand-orange border-white hover:bg-orange-50"
                >
                  Go to Partner Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
