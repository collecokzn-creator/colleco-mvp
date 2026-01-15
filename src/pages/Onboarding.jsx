import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Sparkles, CheckCircle2, Mail, Phone, MapPin, Camera, 
  Upload, Gift, Bell, Heart, Calendar, Shield, ArrowRight, 
  ArrowLeft, Star, Palmtree, Mountain, Building2, Users
} from "lucide-react";
import Button from "../components/ui/Button";
import { useUser } from "../context/UserContext.jsx";

/**
 * Magical Onboarding Experience
 * - Welcome new users with delight
 * - Progressive profile completion
 * - Preference collection for personalization
 * - Email/phone verification
 * - Quick tour of key features
 */
export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setUser } = useUser();
  const [step, setStep] = useState(1);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [generatedEmailCode] = useState(Math.floor(100000 + Math.random() * 900000).toString());
  const [generatedPhoneCode] = useState(Math.floor(100000 + Math.random() * 900000).toString());

  const isNewUser = searchParams.get('new') === 'true';

  const [preferences, setPreferences] = useState({
    interests: [],
    budget: "",
    travelStyle: [],
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    favoriteDestinations: [],
  });

  useEffect(() => {
    // Simulate sending verification codes
    if (step === 2 && user?.email) {
      console.log(`📧 Email verification code for ${user.email}: ${generatedEmailCode}`);
      // In production, this would trigger an actual email
    }
    if (step === 2 && user?.phone) {
      console.log(`📱 SMS verification code for ${user.phone}: ${generatedPhoneCode}`);
      // In production, this would trigger an actual SMS
    }
  }, [step, user, generatedEmailCode, generatedPhoneCode]);

  const travelInterests = [
    { id: 'adventure', label: 'Adventure', icon: Mountain },
    { id: 'beach', label: 'Beach & Relaxation', icon: Palmtree },
    { id: 'culture', label: 'Culture & History', icon: Building2 },
    { id: 'wildlife', label: 'Wildlife & Safari', icon: Heart },
    { id: 'food', label: 'Food & Dining', icon: Gift },
    { id: 'events', label: 'Events & Festivals', icon: Calendar },
  ];

  const budgetRanges = [
    { id: 'budget', label: 'Budget-Friendly', range: 'Under R5,000' },
    { id: 'moderate', label: 'Moderate', range: 'R5,000 - R15,000' },
    { id: 'luxury', label: 'Luxury', range: 'R15,000 - R50,000' },
    { id: 'premium', label: 'Premium', range: 'Over R50,000' },
  ];

  const travelStyles = [
    { id: 'solo', label: 'Solo Travel' },
    { id: 'couple', label: 'Couples' },
    { id: 'family', label: 'Family' },
    { id: 'group', label: 'Group Travel' },
  ];

  const toggleInterest = (interestId) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const toggleTravelStyle = (styleId) => {
    setPreferences(prev => ({
      ...prev,
      travelStyle: prev.travelStyle.includes(styleId)
        ? prev.travelStyle.filter(id => id !== styleId)
        : [...prev.travelStyle, styleId]
    }));
  };

  const verifyEmail = () => {
    if (emailCode === generatedEmailCode) {
      setEmailVerified(true);
      // Update user in localStorage
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
      setPhoneVerified(true);
      // Update user in localStorage
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
        onboardingComplete: true,
        preferences,
        onboardedAt: new Date().toISOString(),
      };
      localStorage.setItem("user:" + user.email, JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    navigate('/');
  };

  const totalSteps = 5;

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
                Welcome to CollEco! 🎉
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We're excited to help you discover amazing travel experiences across Southern Africa!
              </p>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mt-8">
                <h3 className="font-semibold text-brand-brown mb-3">Quick Setup (2 minutes)</h3>
                <ul className="space-y-2 text-left text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Verify your contact information</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Tell us about your travel preferences</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Customize your notification settings</span>
                  </li>
                </ul>
              </div>

              <Button onClick={() => setStep(2)} size="lg" className="mt-8">
                Let's Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <button
                onClick={() => navigate('/')}
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
                  This helps us keep your account secure and ensures you receive important updates.
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
                  {emailVerified && (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                </div>

                {!emailVerified ? (
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
                  {phoneVerified && (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  )}
                </div>

                {!phoneVerified ? (
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
                  disabled={!emailVerified && !phoneVerified}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {!emailVerified && !phoneVerified && (
                <p className="text-sm text-gray-500 text-center">
                  Please verify at least one contact method to continue
                </p>
              )}
            </div>
          )}

          {/* Step 3: Travel Interests */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Heart className="w-16 h-16 mx-auto mb-4 text-brand-orange" />
                <h2 className="text-3xl font-bold text-brand-brown mb-2">What Interests You?</h2>
                <p className="text-gray-600">
                  Select your travel interests so we can show you the most relevant experiences.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {travelInterests.map((interest) => {
                  const Icon = interest.icon;
                  const isSelected = preferences.interests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                        isSelected
                          ? 'border-brand-orange bg-orange-50 shadow-lg'
                          : 'border-gray-200 hover:border-orange-200'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-3 ${isSelected ? 'text-brand-orange' : 'text-gray-400'}`} />
                      <h3 className="font-semibold text-brand-brown text-sm">{interest.label}</h3>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-brand-orange mx-auto mt-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(4)} 
                  className="flex-1"
                  disabled={preferences.interests.length === 0}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Budget & Travel Style */}
          {step === 4 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <Star className="w-16 h-16 mx-auto mb-4 text-brand-orange" />
                <h2 className="text-3xl font-bold text-brand-brown mb-2">Personalize Your Experience</h2>
                <p className="text-gray-600">
                  Help us recommend experiences that fit your style and budget.
                </p>
              </div>

              {/* Budget Selection */}
              <div>
                <h3 className="font-semibold text-brand-brown mb-4">Typical Trip Budget</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {budgetRanges.map((budget) => (
                    <button
                      key={budget.id}
                      onClick={() => setPreferences(prev => ({ ...prev, budget: budget.id }))}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        preferences.budget === budget.id
                          ? 'border-brand-orange bg-orange-50 shadow-lg'
                          : 'border-gray-200 hover:border-orange-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-brand-brown">{budget.label}</h4>
                          <p className="text-sm text-gray-600">{budget.range}</p>
                        </div>
                        {preferences.budget === budget.id && (
                          <CheckCircle2 className="w-5 h-5 text-brand-orange" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <h3 className="font-semibold text-brand-brown mb-4">How Do You Usually Travel?</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {travelStyles.map((style) => {
                    const isSelected = preferences.travelStyle.includes(style.id);
                    return (
                      <button
                        key={style.id}
                        onClick={() => toggleTravelStyle(style.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-brand-orange bg-orange-50 shadow-lg'
                            : 'border-gray-200 hover:border-orange-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-brand-brown">{style.label}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-brand-orange" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(5)} 
                  className="flex-1"
                  disabled={!preferences.budget || preferences.travelStyle.length === 0}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}



          {/* Step 5: Notifications & Complete */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Bell className="w-16 h-16 mx-auto mb-4 text-brand-orange" />
                <h2 className="text-3xl font-bold text-brand-brown mb-2">Stay Updated</h2>
                <p className="text-gray-600">
                  Choose how you'd like to receive notifications about your trips and deals.
                </p>
              </div>

              <div className="space-y-4">
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
                    <p className="text-sm text-gray-600 mt-1">Booking confirmations, updates, and special offers</p>
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
                    <p className="text-sm text-gray-600 mt-1">Important alerts and reminders</p>
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
                    <p className="text-sm text-gray-600 mt-1">Real-time updates and exclusive deals</p>
                  </div>
                </label>
              </div>

              <div className="bg-gradient-to-r from-brand-orange to-brand-gold rounded-xl p-8 text-white text-center mt-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">You're All Set!</h3>
                <p className="text-orange-50 mb-6">
                  Start discovering amazing travel experiences tailored just for you!
                </p>
                <Button 
                  onClick={completeOnboarding}
                  variant="outline"
                  className="bg-white text-brand-orange border-white hover:bg-orange-50"
                >
                  Explore CollEco
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(4)}>
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
