import React, { useState, useEffect } from 'react';
import { Shield, Info, X } from 'lucide-react';
import { getLeaderboardConsent, setLeaderboardConsent } from '../utils/gamificationEngine';

/**
 * LeaderboardConsentBanner
 * POPI Act compliant consent banner for leaderboard participation
 */
export default function LeaderboardConsentBanner({ userId, userType, onConsent }) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState({
    leaderboardParticipation: false,
    showCity: false,
    showBusinessName: false,
  });

  useEffect(() => {
    const existingConsent = getLeaderboardConsent(userId);
    if (!existingConsent.consentDate) {
      setShowBanner(true);
    }
  }, [userId]);

  const handleAccept = (options) => {
    const result = setLeaderboardConsent(userId, options);
    if (result.success) {
      setShowBanner(false);
      if (onConsent) {
        onConsent(result.consent);
      }
    }
  };

  const handleDecline = () => {
    handleAccept({ leaderboardParticipation: false });
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-brand-orange shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-brand-orange flex-shrink-0 mt-1" />
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Leaderboard Participation - Your Privacy Matters
            </h3>
            
            <p className="text-sm text-gray-700 mb-3">
              In compliance with the <strong>Protection of Personal Information Act (POPI Act)</strong>, 
              we need your consent to display your ranking on public leaderboards.
            </p>

            {!showDetails ? (
              <button
                onClick={() => setShowDetails(true)}
                className="text-sm text-brand-orange hover:underline flex items-center gap-1 mb-3"
              >
                <Info className="w-4 h-4" />
                Learn more about how we protect your privacy
              </button>
            ) : (
              <div className="bg-cream-50 rounded-lg p-4 mb-4 text-sm">
                <h4 className="font-semibold text-gray-900 mb-2">How We Protect Your Privacy:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>
                      <strong>Anonymization:</strong> Other users see &quot;User 1&quot;, &quot;User 2&quot;, etc. - never your real name
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>
                      <strong>No Personal Data:</strong> We never display email, phone, ID number, or full address
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>
                      <strong>Optional Location:</strong> You choose whether to show your city (general location only)
                    </span>
                  </li>
                  {userType === 'partner' && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>
                        <strong>Business Name:</strong> Partners can optionally display business name (not personal name)
                      </span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>
                      <strong>Opt-Out Anytime:</strong> Change your preferences in Settings at any time
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>
                      <strong>POPI Compliant:</strong> Full compliance with South African data protection laws
                    </span>
                  </li>
                </ul>
              </div>
            )}

            <div className="space-y-3">
              {/* Granular consent options */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent.leaderboardParticipation}
                  onChange={(e) => setConsent({ ...consent, leaderboardParticipation: e.target.checked })}
                  className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
                />
                <span className="text-sm text-gray-700">
                  <strong>I consent to appear on leaderboards</strong> (anonymized as &quot;User [Rank]&quot;)
                </span>
              </label>

              {consent.leaderboardParticipation && (
                <>
                  <label className="flex items-start gap-3 cursor-pointer ml-7">
                    <input
                      type="checkbox"
                      checked={consent.showCity}
                      onChange={(e) => setConsent({ ...consent, showCity: e.target.checked })}
                      className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
                    />
                    <span className="text-sm text-gray-600">
                      Show my city (e.g., &quot;Johannesburg&quot;) - optional
                    </span>
                  </label>

                  {userType === 'partner' && (
                    <label className="flex items-start gap-3 cursor-pointer ml-7">
                      <input
                        type="checkbox"
                        checked={consent.showBusinessName}
                        onChange={(e) => setConsent({ ...consent, showBusinessName: e.target.checked })}
                        className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange"
                      />
                      <span className="text-sm text-gray-600">
                        Show my business name (for brand visibility) - optional
                      </span>
                    </label>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleAccept(consent)}
                disabled={!consent.leaderboardParticipation}
                className={`
                  px-6 py-2 rounded-lg font-semibold text-sm transition-colors
                  ${consent.leaderboardParticipation
                    ? 'bg-brand-orange text-white hover:bg-orange-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Accept & Continue
              </button>
              
              <button
                onClick={handleDecline}
                className="px-6 py-2 rounded-lg font-semibold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Decline (Hide from Leaderboards)
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              By declining, you can still earn points and complete challenges privately.
              Your rank will be visible only to you.
            </p>
          </div>

          <button
            onClick={handleDecline}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
