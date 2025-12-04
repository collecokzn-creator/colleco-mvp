import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Info, Download, Trash2, Eye, Lock } from 'lucide-react';
import { 
  getUserConsent, 
  setUserConsent, 
  CONSENT_TYPES,
  exportUserData,
  deleteUserAccount,
} from '../utils/privacyGuard';

/**
 * PrivacyConsentModal
 * POPI Act compliant privacy consent center
 */
export default function PrivacyConsentModal({ userId, onClose, onConsentUpdate }) {
  const [activeTab, setActiveTab] = useState('consent');
  const [consent, setConsent] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const currentConsent = getUserConsent(userId);
    setConsent(currentConsent);
  }, [userId]);

  const handleConsentChange = (type, value) => {
    const newConsent = { ...consent, [type]: value };
    setConsent(newConsent);
  };

  const handleSave = () => {
    const result = setUserConsent(userId, consent);
    if (result.success && onConsentUpdate) {
      onConsentUpdate(result.consent);
    }
    onClose();
  };

  const handleExportData = () => {
    exportUserData(userId);
  };

  const handleDeleteAccount = () => {
    const result = deleteUserAccount(userId, 'user_request');
    alert(result.message);
    setShowDeleteConfirm(false);
  };

  const consentOptions = [
    {
      type: 'essential',
      icon: Lock,
      title: 'Essential Services',
      description: 'Required for booking confirmations, account security, and service delivery',
      required: true,
      color: 'gray',
    },
    {
      type: 'functional',
      icon: Check,
      title: 'Functional Features',
      description: 'Save preferences, remember settings, enhance your experience',
      required: false,
      color: 'blue',
    },
    {
      type: 'analytics',
      icon: Eye,
      title: 'Analytics & Insights',
      description: 'Help us improve the platform with anonymized usage data',
      required: false,
      color: 'purple',
    },
    {
      type: 'marketing',
      icon: Info,
      title: 'Marketing Communications',
      description: 'Receive special offers, travel deals, and personalized recommendations',
      required: false,
      color: 'green',
    },
    {
      type: 'third_party',
      icon: Shield,
      title: 'Third-Party Services',
      description: 'Share data with verified partners (hotels, airlines) to fulfill bookings',
      required: false,
      color: 'orange',
    },
    {
      type: 'location',
      icon: Info,
      title: 'Location Services',
      description: 'Use GPS for nearby recommendations and location-based features',
      required: false,
      color: 'red',
    },
    {
      type: 'profiling',
      icon: Info,
      title: 'Personalization',
      description: 'Tailor content and recommendations based on your preferences',
      required: false,
      color: 'indigo',
    },
  ];

  const tabs = [
    { id: 'consent', label: 'Privacy Settings', icon: Shield },
    { id: 'rights', label: 'Your Rights', icon: Info },
    { id: 'data', label: 'Your Data', icon: Download },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-orange to-amber-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Privacy Center</h2>
                <p className="text-white/90 text-sm">POPI Act Compliant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 px-6 py-4 font-semibold text-sm flex items-center justify-center gap-2
                  border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-brand-orange text-brand-orange bg-orange-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Consent Tab */}
          {activeTab === 'consent' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Your Privacy Matters</h3>
                    <p className="text-sm text-blue-700">
                      We respect your privacy and comply with the Protection of Personal Information Act (POPI Act).
                      You have full control over your data. Changes take effect immediately.
                    </p>
                  </div>
                </div>
              </div>

              {consentOptions.map(option => {
                const Icon = option.icon;
                const isEnabled = consent[option.type];
                
                return (
                  <div
                    key={option.type}
                    className={`
                      border-2 rounded-lg p-4 transition-all
                      ${isEnabled 
                        ? `border-${option.color}-500 bg-${option.color}-50` 
                        : 'border-gray-200 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className={`w-5 h-5 ${isEnabled ? `text-${option.color}-600` : 'text-gray-400'} flex-shrink-0 mt-1`} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {option.title}
                            {option.required && (
                              <span className="ml-2 text-xs bg-gray-600 text-white px-2 py-0.5 rounded-full">
                                Required
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => !option.required && handleConsentChange(option.type, !isEnabled)}
                        disabled={option.required}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${option.required 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : isEnabled 
                              ? `bg-${option.color}-600` 
                              : 'bg-gray-300'
                          }
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Rights Tab */}
          {activeTab === 'rights' && (
            <div className="space-y-6">
              <div className="bg-cream-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Rights Under POPI Act</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Right to Access</h4>
                      <p className="text-sm text-gray-600">View all personal data we hold about you</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Right to Correction</h4>
                      <p className="text-sm text-gray-600">Update or correct inaccurate information</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Right to Erasure</h4>
                      <p className="text-sm text-gray-600">Request deletion of your personal data</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Right to Object</h4>
                      <p className="text-sm text-gray-600">Opt-out of processing for marketing/profiling</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Right to Data Portability</h4>
                      <p className="text-sm text-gray-600">Export your data in machine-readable format</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Right to Withdraw Consent</h4>
                      <p className="text-sm text-gray-600">Change your privacy preferences anytime</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">Contact Our Privacy Officer</h4>
                <p className="text-sm text-amber-700 mb-3">
                  For privacy-related requests or concerns, contact us at:
                </p>
                <p className="text-sm text-amber-900 font-mono">
                  📧 privacy@collecotravel.co.za<br />
                  📞 +27 (0)11 XXX XXXX
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  Response time: 30 days (as per POPI Act Section 23)
                </p>
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Your Data</h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Export Your Data</h4>
                          <p className="text-sm text-gray-600">Download all your personal data</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Download Data (JSON)
                    </button>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 text-red-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Delete Account</h4>
                          <p className="text-sm text-gray-600">Permanently delete your account and data</p>
                        </div>
                      </div>
                    </div>
                    
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                      >
                        Delete My Account
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <p className="text-sm text-red-700 font-semibold">⚠️ This action cannot be undone!</p>
                          <p className="text-xs text-red-600 mt-1">
                            You have 30 days to cancel the deletion request.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleDeleteAccount}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                          >
                            Confirm Deletion
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Data Retention</h4>
                <p className="text-sm text-gray-600 mb-3">We retain your data according to these periods:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Booking data: 7 years (tax/legal requirement)</li>
                  <li>• User profile: 2 years after last activity</li>
                  <li>• Analytics: 1 year (anonymized)</li>
                  <li>• Marketing data: 1 year (with consent)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
