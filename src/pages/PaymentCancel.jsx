import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Payment Cancelled Page
 * Shows when customer explicitly cancels the payment (clicks Back on payment provider)
 */
export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Cancel Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Cancel Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
            <p className="text-gray-600 mb-6">You have cancelled the payment process.</p>

            {/* Details Box */}
            <div className="bg-yellow-50 rounded-lg p-6 mb-8 text-left border-l-4 border-yellow-400">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Booking</h2>
              <p className="text-gray-700">
                Your booking has not been confirmed and no payment has been taken. You can return to checkout and try
                again at any time.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-brand-orange text-white rounded-lg hover:bg-opacity-90 transition"
              >
                Return to Checkout
              </button>
              <Link
                to="/"
                className="px-6 py-3 border-2 border-brand-orange text-brand-orange rounded-lg hover:bg-brand-orange hover:text-white transition"
              >
                Back to Home
              </Link>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Questions? Contact us at{' '}
                <a href="mailto:support@colleco.travel" className="text-brand-orange hover:underline">
                  support@colleco.travel
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
