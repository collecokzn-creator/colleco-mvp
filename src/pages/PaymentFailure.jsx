import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

/**
 * Payment Failure Page
 * Shows after payment fails or is cancelled
 * Allows customer to retry or contact support
 */
export default function PaymentFailure() {
  const location = useLocation();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('reference') || params.get('m_payment_id') || params.get('bookingId') || '';
    const err = params.get('error') || params.get('reason') || 'Unknown error';

    setBookingId(ref);
    setReason(err);
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Failure Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
            <p className="text-gray-600 mb-6">Your payment could not be completed.</p>

            {/* Error Details */}
            {reason && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left">
                <p className="text-red-800 font-semibold text-sm">Reason:</p>
                <p className="text-red-700 text-sm">{decodeURIComponent(reason)}</p>
              </div>
            )}

            {/* Details Box */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">What Happened?</h2>
              <p className="text-gray-700 mb-4">
                Your payment was not completed. This could be due to:
              </p>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start">
                  <span className="text-red-600 font-bold mr-2">•</span>
                  <span>Incorrect card details</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 font-bold mr-2">•</span>
                  <span>Insufficient funds</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 font-bold mr-2">•</span>
                  <span>Card declined by bank</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 font-bold mr-2">•</span>
                  <span>Session timeout</span>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-brand-orange text-white rounded-lg hover:bg-opacity-90 transition"
              >
                Try Again
              </button>
              <Link
                to="/"
                className="px-6 py-3 border-2 border-brand-orange text-brand-orange rounded-lg hover:bg-brand-orange hover:text-white transition"
              >
                Back to Home
              </Link>
            </div>

            {/* Support Info */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Still having issues? Our support team is here to help.
              </p>
              <a
                href="mailto:support@colleco.travel"
                className="inline-block px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-semibold"
              >
                Contact Support
              </a>
            </div>

            {/* Booking Reference (if available) */}
            {bookingId && (
              <div className="mt-6 text-xs text-gray-500">
                Booking Reference: <span className="font-mono bg-gray-100 px-2 py-1">{bookingId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
