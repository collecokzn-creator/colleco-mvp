/**
 * Privacy Settings Page
 * Allows users to view and manage their consent and data privacy
 * POPI Act Compliance: Section 14 (User rights to access and control personal data)
 */

import { useState, useEffect } from 'react';
import { Shield, Lock, Trash2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getConsentSummary, getConsentHistory, withdrawConsent } from '../utils/consentApi';

export default function PrivacySettings() {
  const { user } = useUser();
  const [consentSummary, setConsentSummary] = useState(null);
  const [consentHistory, setConsentHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [showWithdrawalConfirm, setShowWithdrawalConfirm] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  // Load consent data on mount
  useEffect(() => {
    if (!user?.id && !user?.email) {
      setError('Please log in to view privacy settings');
      setLoading(false);
      return;
    }

    loadConsentData();
  }, [user]);

  const loadConsentData = async () => {
    try {
      setLoading(true);
      setError('');

      const userId = user?.id || user?.email;
      
      const [summary, history] = await Promise.all([
        getConsentSummary(userId),
        getConsentHistory(userId),
      ]);

      setConsentSummary(summary);
      setConsentHistory(history);
    } catch (err) {
      console.error('Failed to load consent data:', err);
      setError('Failed to load privacy settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawConsent = async () => {
    if (!withdrawalReason.trim()) {
      setError('Please provide a reason for withdrawal');
      return;
    }

    try {
      setWithdrawing(true);
      const userId = user?.id || user?.email;
      
      await withdrawConsent(userId, withdrawalReason);
      
      setError('');
      setShowWithdrawalConfirm(false);
      setWithdrawalReason('');
      
      // Reload consent data
      await loadConsentData();
      
      // Show success message
      alert('Consent withdrawn successfully. Your data will be deleted or anonymized per POPI Act requirements.');
    } catch (err) {
      setError('Failed to withdraw consent: ' + err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-6 sm:p-10 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-brand-orange mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading privacy settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream p-6 sm:p-10 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brand-brown mb-2">Not Logged In</h1>
          <p className="text-gray-600 mb-6">Please log in to view your privacy settings.</p>
          <a href="/login" className="btn btn-primary">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Shield className="w-8 h-8 text-brand-orange" />
          <div>
            <h1 className="text-3xl font-bold text-brand-brown mb-2">Privacy & Data Settings</h1>
            <p className="text-gray-600">Manage your consent and personal data (POPI Act Compliant)</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Consent Status Summary */}
        {consentSummary && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Terms Status */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-brand-brown">Terms & Conditions</h3>
                {consentSummary.termsAccepted ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {consentSummary.termsAccepted ? 'Accepted' : 'Not accepted'}
              </p>
              {consentSummary.latestConsent && (
                <>
                  <p className="text-xs text-gray-500 mb-1">
                    <strong>Version:</strong> {consentSummary.versions?.termsVersion || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Date:</strong> {new Date(consentSummary.lastConsentDate).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>

            {/* Privacy Policy Status */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-brand-brown">Privacy Policy</h3>
                {consentSummary.privacyAccepted ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {consentSummary.privacyAccepted ? 'Accepted' : 'Not accepted'}
              </p>
              {consentSummary.latestConsent && (
                <>
                  <p className="text-xs text-gray-500 mb-1">
                    <strong>Version:</strong> {consentSummary.versions?.privacyVersion || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Date:</strong> {new Date(consentSummary.lastConsentDate).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>

            {/* SLA Status (if applicable) */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-brand-brown">Service Agreement</h3>
                {consentSummary.slaAccepted ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {consentSummary.slaAccepted ? 'Accepted (Partner)' : 'Not applicable'}
              </p>
              {consentSummary.slaAccepted && consentSummary.latestConsent && (
                <>
                  <p className="text-xs text-gray-500 mb-1">
                    <strong>Version:</strong> {consentSummary.versions?.slaVersion || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Date:</strong> {new Date(consentSummary.lastConsentDate).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Consent History */}
        {consentHistory && consentHistory.consentHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-brand-brown mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Consent History
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              POPI Act: This is your audit trail showing when you provided consent.
            </p>
            
            {consentHistory.consentHistory.map((record, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-brand-brown capitalize">
                    {record.consentType?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(record.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Terms:</span> {record.acceptedTerms?.accepted ? '✓' : '✗'}
                  </div>
                  <div>
                    <span className="font-medium">Privacy:</span> {record.acceptedPrivacy?.accepted ? '✓' : '✗'}
                  </div>
                  <div>
                    <span className="font-medium">SLA:</span> {record.acceptedSLA?.accepted ? '✓' : '✗'}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  IP: {record.ipAddress} | Version: T{record.termsVersion}, P{record.privacyVersion}, S{record.slaVersion}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Data Access Rights */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-brand-brown mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Your Data Rights (POPI Act)
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-brand-brown mb-2">✓ Right to Access</h3>
              <p>You have the right to know what personal data CollEco stores about you. Request your data export at any time.</p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-brown mb-2">✓ Right to Correct</h3>
              <p>If your information is inaccurate, contact support@colleco.com to request corrections within 5 business days.</p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-brown mb-2">✓ Right to Delete</h3>
              <p>Withdraw consent to delete your account and personal data. Processing begins within 30 days.</p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-brown mb-2">✓ Right to Portability</h3>
              <p>Request your data in a machine-readable format (JSON/CSV) for transfer to another service.</p>
            </div>
          </div>
        </div>

        {/* Withdraw Consent Section */}
        <div className="bg-red-50 rounded-lg shadow-sm p-6 border border-red-200">
          <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Withdraw Consent & Delete Account
          </h2>
          
          <p className="text-sm text-red-600 mb-4">
            Withdrawing consent will delete your account and personal data per POPI Act requirements. This action cannot be undone.
          </p>

          {!showWithdrawalConfirm ? (
            <button
              onClick={() => setShowWithdrawalConfirm(true)}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              Withdraw Consent & Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you withdrawing consent? (required)
                </label>
                <textarea
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  placeholder="Please tell us why..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  rows="3"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-700">
                <strong>⚠️ Warning:</strong> This will permanently delete your account and all associated data.
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowWithdrawalConfirm(false);
                    setWithdrawalReason('');
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdrawConsent}
                  disabled={withdrawing}
                  className="btn bg-red-600 hover:bg-red-700 text-white flex-1 disabled:opacity-50"
                >
                  {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg shadow-sm p-6 mt-8 border border-gray-200">
          <h3 className="font-semibold text-brand-brown mb-4">Privacy Officer Contact</h3>
          <p className="text-sm text-gray-600 mb-4">
            For questions about your privacy rights or to exercise your POPI Act rights, contact our Privacy Officer:
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> <a href="mailto:privacy@colleco.com" className="text-brand-orange hover:underline">privacy@colleco.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:+27XXXXXXXXX" className="text-brand-orange hover:underline">[PLACEHOLDER]</a></p>
            <p><strong>Address:</strong> [PLACEHOLDER - Company address]</p>
            <p className="text-xs text-gray-500 mt-4">Response time: Within 15 business days per POPI Act requirements</p>
          </div>
        </div>
      </div>
    </div>
  );
}
