import React, { useState, useEffect } from 'react';
import { Shield, FileText, Lock, Check, X, AlertTriangle, Info } from 'lucide-react';

/**
 * Enhanced LegalConsentModal
 * POPI Act Compliant Legal Agreement and Consent Collection
 * - Protection of Personal Information Act (POPI) compliance
 * - Clear data processing explanations
 * - User rights information
 * - Purpose limitation and data minimization
 * - Lawful processing grounds
 */
export default function LegalConsentModal({ 
  userId, 
  userType = 'client', 
  onAccept, 
  onDecline,
  isRegistration = true 
}) {
  const [consents, setConsents] = useState({
    termsAndConditions: false,
    privacyPolicy: false,
    dataProcessing: false,
    sla: false,
    marketingCommunications: false,
    thirdPartySharing: false,
    popiAcknowledgement: false,
  });

  const [showDetails, setShowDetails] = useState({
    terms: false,
    privacy: false,
    sla: false,
    popi: false,
  });

  const [agreedAt, setAgreedAt] = useState(null);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [hasScrolledPrivacy, setHasScrolledPrivacy] = useState(false);
  const [hasScrolledPOPI, setHasScrolledPOPI] = useState(false);

  // Check if user has already accepted legal terms
  useEffect(() => {
    const existingConsent = localStorage.getItem(`colleco.legal.consent.${userId}`);
    if (existingConsent) {
      const parsed = JSON.parse(existingConsent);
      setAgreedAt(parsed.agreedAt);
      setConsents(parsed.consents);
    }
  }, [userId]);

  const handleScroll = (type, e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
    if (scrolledToBottom) {
      if (type === 'terms') setHasScrolledTerms(true);
      if (type === 'privacy') setHasScrolledPrivacy(true);
      if (type === 'popi') setHasScrolledPOPI(true);
    }
  };

  const toggleConsent = (key) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const canSubmit = () => {
    // Required consents for all users (POPI Act compliance)
    const requiredConsents = [
      'termsAndConditions',
      'privacyPolicy',
      'dataProcessing',
      'popiAcknowledgement',
    ];

    // Partners must also accept SLA
    if (userType === 'partner') {
      requiredConsents.push('sla');
    }

    return requiredConsents.every(key => consents[key]);
  };

  const handleAccept = () => {
    if (!canSubmit()) return;

    const consentRecord = {
      userId,
      userType,
      consents,
      agreedAt: new Date().toISOString(),
      version: '1.0',
      ipAddress: 'client-side', // In production, get from server
      userAgent: navigator.userAgent.substring(0, 100),
    };

    // Store consent record
    localStorage.setItem(`colleco.legal.consent.${userId}`, JSON.stringify(consentRecord));

    if (onAccept) onAccept(consentRecord);
  };

  const handleDecline = () => {
    if (onDecline) onDecline();
  };

  // If already accepted and not forcing re-acceptance, don't show modal
  if (agreedAt && !isRegistration) {
    return null;
  }

  const requiredIndicator = <span className="text-red-500 ml-1">*</span>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-orange to-brand-gold p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Legal Agreements & Consents</h2>
          </div>
          <p className="text-sm opacity-90">
            Please review and accept the following terms to continue using CollEco Travel
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Warning Banner */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Important Legal Notice</h3>
                <p className="text-sm text-amber-800">
                  By using CollEco Travel, you agree to these legally binding terms. 
                  Please read them carefully before proceeding.
                </p>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowDetails(prev => ({ ...prev, terms: !prev.terms }))}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand-orange" />
                <span className="font-semibold text-brand-brown">Terms & Conditions</span>
                {requiredIndicator}
              </div>
              <span className="text-gray-500">{showDetails.terms ? '▼' : '▶'}</span>
            </button>
            
            {showDetails.terms && (
              <div 
                className="p-4 max-h-64 overflow-y-auto bg-white text-sm text-gray-700 space-y-3"
                onScroll={(e) => handleScroll('terms', e)}
              >
                <h4 className="font-bold text-brand-brown">CollEco Travel - Terms & Conditions</h4>
                <p className="text-xs text-gray-500">Effective Date: December 8, 2025 | Version 1.0</p>
                
                <div className="space-y-2">
                  <h5 className="font-semibold">1. Acceptance of Terms</h5>
                  <p>By accessing or using CollEco Travel services, you agree to be bound by these Terms and Conditions.</p>

                  <h5 className="font-semibold">2. Service Description</h5>
                  <p>CollEco Travel is a platform connecting travelers with accommodation, experiences, and travel services in South Africa and internationally.</p>

                  <h5 className="font-semibold">3. User Responsibilities</h5>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Use the platform in compliance with applicable laws</li>
                    <li>Honor all confirmed bookings</li>
                  </ul>

                  <h5 className="font-semibold">4. Booking & Payment Terms</h5>
                  <p>All bookings are subject to availability and confirmation. Payment is required at the time of booking unless otherwise specified. Cancellation policies vary by service provider.</p>

                  <h5 className="font-semibold">5. Cancellation & Refund Policy</h5>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Free cancellation: 48+ hours before service date (unless specified otherwise)</li>
                    <li>50% refund: 24-48 hours before service date</li>
                    <li>No refund: Less than 24 hours or no-show</li>
                    <li>Partner-specific policies may apply</li>
                  </ul>

                  <h5 className="font-semibold">6. Limitation of Liability</h5>
                  <p>CollEco Travel acts as an intermediary. We are not liable for service provider actions, travel disruptions, or indirect damages. Maximum liability is limited to the booking value.</p>

                  <h5 className="font-semibold">7. Intellectual Property</h5>
                  <p>All content, logos, and trademarks are property of CollEco Travel or licensed partners. Unauthorized use is prohibited.</p>

                  <h5 className="font-semibold">8. Dispute Resolution</h5>
                  <p>Disputes shall be resolved through good faith negotiation. If unresolved, matters will be subject to South African law and jurisdiction.</p>

                  <h5 className="font-semibold">9. Modifications</h5>
                  <p>We reserve the right to modify these terms. Users will be notified of material changes.</p>
                </div>

                {!hasScrolledTerms && (
                  <p className="text-xs text-amber-600 italic mt-4">
                    ⚠️ Please scroll to the bottom to review all terms
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Privacy Policy */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowDetails(prev => ({ ...prev, privacy: !prev.privacy }))}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-brand-orange" />
                <span className="font-semibold text-brand-brown">Privacy Policy & POPI Act Compliance</span>
                {requiredIndicator}
              </div>
              <span className="text-gray-500">{showDetails.privacy ? '▼' : '▶'}</span>
            </button>
            
            {showDetails.privacy && (
              <div 
                className="p-4 max-h-64 overflow-y-auto bg-white text-sm text-gray-700 space-y-3"
                onScroll={(e) => handleScroll('privacy', e)}
              >
                <h4 className="font-bold text-brand-brown">Privacy Policy</h4>
                <p className="text-xs text-gray-500">In compliance with the Protection of Personal Information Act (POPI Act, 2013)</p>
                
                <div className="space-y-2">
                  <h5 className="font-semibold">1. Information We Collect</h5>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong>Personal Information:</strong> Name, email, phone, ID number (as required)</li>
                    <li><strong>Business Information:</strong> Company name, registration number, tax details</li>
                    <li><strong>Booking Data:</strong> Travel preferences, payment details, booking history</li>
                    <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                  </ul>

                  <h5 className="font-semibold">2. How We Use Your Information</h5>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Process bookings and payments</li>
                    <li>Provide customer support</li>
                    <li>Send service-related communications</li>
                    <li>Improve platform functionality (with consent)</li>
                    <li>Comply with legal obligations</li>
                  </ul>

                  <h5 className="font-semibold">3. Data Sharing & Disclosure</h5>
                  <p>We share data only with:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Service providers (hotels, tour operators) to fulfill bookings</li>
                    <li>Payment processors for secure transactions</li>
                    <li>Legal authorities when required by law</li>
                  </ul>

                  <h5 className="font-semibold">4. Your POPI Act Rights</h5>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li><strong>Access:</strong> Request copies of your personal data</li>
                    <li><strong>Correction:</strong> Update inaccurate information</li>
                    <li><strong>Deletion:</strong> Request data erasure (subject to legal retention)</li>
                    <li><strong>Objection:</strong> Object to specific data processing activities</li>
                    <li><strong>Portability:</strong> Receive data in structured format</li>
                  </ul>

                  <h5 className="font-semibold">5. Data Security</h5>
                  <p>We implement industry-standard security measures including encryption (HTTPS/TLS), access controls, and regular security audits.</p>

                  <h5 className="font-semibold">6. Data Retention</h5>
                  <p>Personal data is retained for 7 years for tax/legal compliance, then securely deleted unless consent is renewed.</p>

                  <h5 className="font-semibold">7. Cookies & Tracking</h5>
                  <p>We use essential cookies for functionality and optional cookies for analytics (with your consent).</p>

                  <h5 className="font-semibold">8. Contact Information</h5>
                  <p>Information Officer: privacy@collecotravel.co.za | Response time: 30 days</p>
                </div>

                {!hasScrolledPrivacy && (
                  <p className="text-xs text-amber-600 italic mt-4">
                    ⚠️ Please scroll to the bottom to review the complete policy
                  </p>
                )}
              </div>
            )}
          </div>

          {/* SLA (for Partners only) */}
          {userType === 'partner' && (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowDetails(prev => ({ ...prev, sla: !prev.sla }))}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-brand-orange" />
                  <span className="font-semibold text-brand-brown">Service Level Agreement (SLA)</span>
                  {requiredIndicator}
                </div>
                <span className="text-gray-500">{showDetails.sla ? '▼' : '▶'}</span>
              </button>
              
              {showDetails.sla && (
                <div className="p-4 max-h-64 overflow-y-auto bg-white text-sm text-gray-700 space-y-3">
                  <h4 className="font-bold text-brand-brown">Partner Service Level Agreement</h4>
                  
                  <div className="space-y-2">
                    <h5 className="font-semibold">1. Response Times</h5>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      <li>Booking requests: Respond within 4 hours</li>
                      <li>Customer inquiries: Respond within 2 hours during business hours</li>
                      <li>Cancellations: Process within 1 hour</li>
                    </ul>

                    <h5 className="font-semibold">2. Availability Standards</h5>
                    <p>Maintain 99% platform uptime. Update availability calendars in real-time.</p>

                    <h5 className="font-semibold">3. Quality Standards</h5>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      <li>Maintain minimum 4.0/5.0 average rating</li>
                      <li>Accurate service descriptions and photos</li>
                      <li>Honor confirmed bookings</li>
                    </ul>

                    <h5 className="font-semibold">4. Payment Terms</h5>
                    <p>Commission deducted from bookings. Payouts processed within 7 business days of service completion.</p>

                    <h5 className="font-semibold">5. Termination</h5>
                    <p>Either party may terminate with 30 days notice. Immediate termination for breach of terms.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Consent Checkboxes */}
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h3 className="font-bold text-brand-brown mb-4">Required Consents</h3>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.termsAndConditions}
                onChange={() => toggleConsent('termsAndConditions')}
                className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
              />
              <span className="text-sm">
                I have read and agree to the <strong>Terms & Conditions</strong> {requiredIndicator}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.privacyPolicy}
                onChange={() => toggleConsent('privacyPolicy')}
                className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
              />
              <span className="text-sm">
                I have read and agree to the <strong>Privacy Policy</strong> {requiredIndicator}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.dataProcessing}
                onChange={() => toggleConsent('dataProcessing')}
                className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
              />
              <span className="text-sm">
                I consent to the processing of my personal data as described in the Privacy Policy (POPI Act compliance) {requiredIndicator}
              </span>
            </label>

            {userType === 'partner' && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.sla}
                  onChange={() => toggleConsent('sla')}
                  className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
                />
                <span className="text-sm">
                  I agree to the <strong>Service Level Agreement</strong> and commit to meeting service standards {requiredIndicator}
                </span>
              </label>
            )}

            {/* POPI Act Acknowledgement */}
            <div className="border-t border-gray-300 pt-4 mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <h4 className="font-semibold mb-2">Protection of Personal Information (POPI Act)</h4>
                    <p className="mb-2">
                      Under South Africa's Protection of Personal Information Act (Act 4 of 2013), 
                      you have the right to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 ml-2">
                      <li>Know what personal information we hold about you</li>
                      <li>Request correction of inaccurate information</li>
                      <li>Request deletion of your data (subject to legal requirements)</li>
                      <li>Object to automated decision-making</li>
                      <li>Lodge a complaint with the Information Regulator</li>
                    </ul>
                    <p className="mt-2 text-xs">
                      <strong>Information Regulator Contact:</strong><br />
                      Email: inforeg@justice.gov.za | Tel: 012 406 4818<br />
                      Website: <a href="https://www.justice.gov.za/inforeg/" className="underline" target="_blank" rel="noopener noreferrer">justice.gov.za/inforeg</a>
                    </p>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.popiAcknowledgement}
                  onChange={() => toggleConsent('popiAcknowledgement')}
                  className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
                />
                <span className="text-sm">
                  <strong>I acknowledge my POPI Act rights</strong> and understand that I can exercise them at any time by contacting privacy@collecotravel.co.za {requiredIndicator}
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-gray-300">
              <h4 className="font-semibold text-gray-700 mb-3">Optional Preferences</h4>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.marketingCommunications}
                  onChange={() => toggleConsent('marketingCommunications')}
                  className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
                />
                <span className="text-sm text-gray-600">
                  I would like to receive promotional offers, travel tips, and updates from CollEco Travel
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer mt-3">
                <input
                  type="checkbox"
                  checked={consents.thirdPartySharing}
                  onChange={() => toggleConsent('thirdPartySharing')}
                  className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
                />
                <span className="text-sm text-gray-600">
                  I consent to sharing my data with trusted partners for enhanced service offerings
                </span>
              </label>
            </div>
          </div>

          {/* Legal Information */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Legal Information</h4>
            <ul className="text-blue-800 space-y-1">
              <li>• CollEco Travel (Pty) Ltd - Registration: [To be completed]</li>
              <li>• Registered Address: [To be completed]</li>
              <li>• Information Officer: privacy@collecotravel.co.za</li>
              <li>• Governed by South African law</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-6 bg-gray-50 flex gap-4">
          <button
            onClick={handleDecline}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={!canSubmit()}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              canSubmit()
                ? 'bg-brand-orange text-white hover:bg-brand-gold'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-5 h-5" />
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
