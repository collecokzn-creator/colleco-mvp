import { useEffect } from 'react';
import { FileText, Building2, Shield, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-cream p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <FileText className="w-8 h-8 text-brand-orange" />
          <div>
            <h1 className="text-3xl font-bold text-brand-brown mb-2">Terms and Conditions</h1>
            <p className="text-gray-600">Last updated: December 8, 2025</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <Building2 className="w-5 h-5 text-brand-orange mb-2" />
            <p className="font-semibold text-sm text-brand-brown">Company Details</p>
            <p className="text-xs text-gray-600 mt-1">CollEco Travel Services (Pty) Ltd</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <Shield className="w-5 h-5 text-brand-orange mb-2" />
            <p className="font-semibold text-sm text-brand-brown">Legal Compliance</p>
            <p className="text-xs text-gray-600 mt-1">POPI Act 2013, Consumer Protection Act</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <AlertCircle className="w-5 h-5 text-brand-orange mb-2" />
            <p className="font-semibold text-sm text-brand-brown">Version Control</p>
            <p className="text-xs text-gray-600 mt-1">v1.0 - Effective now</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-brand-brown mb-4">1. Service Overview</h2>
            <p className="text-gray-700 mb-4">
              CollEco Travel ("Platform") is a digital marketplace connecting business travelers, leisure travelers, and travel service partners (accommodations, transfers, experiences). This agreement governs your use of our platform.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> By registering, you agree to these terms and our Privacy Policy. Your continued use indicates acceptance of any updates.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-brown mb-4">2. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              You accept these Terms by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Creating a CollEco account</li>
              <li>Using our website or mobile app</li>
              <li>Making bookings or transactions through our platform</li>
              <li>Offering services as a partner</li>
            </ul>
            <p className="text-gray-700 mt-4">
              If you don't accept these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-brown mb-4">3. User Responsibilities</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-brand-brown mb-2">3.1 Account Security</h3>
                <p className="text-gray-700 mb-3">
                  You are responsible for maintaining the confidentiality of your login credentials. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Use a unique, secure password</li>
                  <li>Enable two-factor authentication (recommended)</li>
                  <li>Never share your credentials with others</li>
                  <li>Report unauthorized access immediately</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-brand-brown mb-2">3.2 Accurate Information</h3>
                <p className="text-gray-700">
                  You agree to provide accurate, complete information when registering and maintain current details. False information may result in account suspension.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-brand-brown mb-2">3.3 Legal Compliance</h3>
                <p className="text-gray-700">
                  You must be at least 18 years old and comply with all local, national, and international laws. You agree not to use our platform for:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li>Illegal activities</li>
                  <li>Fraud or deception</li>
                  <li>Harassment or discrimination</li>
                  <li>Money laundering or sanctions evasion</li>
                  <li>Intellectual property infringement</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-brown mb-4">4. Booking & Payment Terms</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-brand-brown mb-2">4.1 Booking Process</h3>
                <p className="text-gray-700">
                  When you request a booking, you are making an offer to contract. Partners accept or decline. Once accepted, a binding contract exists between you and the partner.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-brand-brown mb-2">4.2 Payment Processing</h3>
                <p className="text-gray-700 mb-3">
                  Payments are processed by secure payment providers. We accept:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Credit/debit cards (Visa, Mastercard, Amex)</li>
                  <li>Bank transfers (EFT)</li>
                  <li>Digital wallets</li>
                  <li>PayFast and other providers</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  Payment disputes must be raised within 30 days. We reserve the right to decline transactions and refund amounts if fraud is suspected.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-brand-brown mb-2">4.3 Pricing</h3>
                <p className="text-gray-700">
                  Prices are in South African Rand (ZAR) unless stated otherwise. Final prices include applicable taxes. CollEco may charge service fees (typically 15-20% for accommodations, 10-15% for other services).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-brand-brown mb-2">4.4 Cancellation & Refunds</h3>
                <p className="text-gray-700">
                  Cancellation policies vary by partner and are clearly displayed before booking. Generally:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li>Free cancellation: Up to 7 days before the booking date</li>
                  <li>50% refund: 3-7 days before</li>
                  <li>No refund: Less than 3 days before or after service</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  Refunds are processed within 7-10 business days to the original payment method.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-brown mb-4">5. Partner Responsibilities</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-brand-brown mb-2">5.1 Service Quality Standards</h3>
                <p className="text-gray-700">
                  Partners must maintain agreed service levels:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li>Respond to inquiries within 2 hours</li>
                  <li>Confirm bookings within 4 hours</li>
                  <li>Maintain cleanliness and safety standards</li>
                  <li>Provide accurate property/service descriptions</li>
                  <li>Achieve minimum 3.5-star guest rating</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-brand-brown mb-2">5.2 Data Security</h3>
                <p className="text-gray-700">
                  Partners must NOT collect or store payment card data. All guest payments must be processed through CollEco. Partners found collecting payment information directly will be immediately suspended.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-brand-brown mb-2">5.3 Cancellation Policy</h3>
                <p className="text-gray-700">
                  Partners must honor cancellation policies. Arbitrary cancellations are prohibited and may result in suspension or termination.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-brand-brown mb-2">5.4 Non-Discrimination</h3>
                <p className="text-gray-700">
                  Partners must not discriminate based on race, religion, gender, nationality, sexual orientation, disability, or other protected characteristics. Zero-tolerance policy - violations result in immediate account termination with no appeal.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-brown mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 mb-3">
              All content on CollEco (text, images, code, logos) is owned by CollEco or licensed partners. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Copy, modify, or distribute our content</li>
              <li>Reverse engineer our platform</li>
              <li>Use our branding without permission</li>
              <li>Scrape or automate access</li>
            </ul>
            <p className="text-gray-700 mt-4">
              User-generated content (reviews, photos) grants CollEco a perpetual, royalty-free license to use, modify, and display it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-brown mb-4">7. Liability & Indemnification</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-brand-brown mb-2">7.1 Limitation of Liability</h3>
                <p className="text-gray-700">
                  COLLECO IS PROVIDED "AS-IS" WITHOUT WARRANTIES. TO THE MAXIMUM EXTENT PERMITTED, COLLECO IS NOT LIABLE FOR:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li>Indirect, incidental, special, or consequential damages</li>
                  <li>Loss of profits, data, or business interruption</li>
                  <li>Guest or partner conduct (e.g., theft, injury)</li>
                  <li>Third-party services or content</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-brand-brown mb-2">7.2 Your Indemnification</h3>
                <p className="text-gray-700">
                  You agree to indemnify CollEco from claims arising from:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li>Your violation of these terms</li>
                  <li>Your illegal conduct</li>
                  <li>Your content or transactions</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-brown mb-4">8. Dispute Resolution</h2>
            <p className="text-gray-700 mb-3">
              Disputes are resolved through:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Direct negotiation:</strong> Contact our support team within 14 days</li>
              <li><strong>Mediation:</strong> CollEco facilitates resolution between parties</li>
              <li><strong>Arbitration:</strong> Binding arbitration in South Africa (if necessary)</li>
            </ol>
            <p className="text-gray-700 mt-4">
              Legal action is a last resort. Disputes must be resolved according to South African law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-brown mb-4">9. Termination</h2>
            <p className="text-gray-700 mb-3">
              CollEco may terminate your account immediately if you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Violate these terms</li>
              <li>Engage in fraud or illegal activity</li>
              <li>Discriminate against other users</li>
              <li>Harass or threaten others</li>
              <li>Breach payment obligations</li>
            </ul>
            <p className="text-gray-700 mt-4">
              You may request account closure anytime via Settings → Privacy & Data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-brown mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700">
              CollEco may update these terms anytime. Continued use after updates constitutes acceptance. Material changes will be notified via email. Your continued use indicates acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-brown mb-4">11. Contact & Compliance</h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-brand-brown mb-4">CollEco Travel Services (Pty) Ltd</h3>
              <p className="text-gray-700 mb-2"><strong>Company Registration:</strong> [PLACEHOLDER - Add real registration number]</p>
              <p className="text-gray-700 mb-2"><strong>Physical Address:</strong> [PLACEHOLDER - Add real office address]</p>
              <p className="text-gray-700 mb-2"><strong>Email:</strong> <a href="mailto:legal@colleco.com" className="text-brand-orange hover:underline">legal@colleco.com</a></p>
              <p className="text-gray-700"><strong>Phone:</strong> <a href="tel:+27XXXXXXXXX" className="text-brand-orange hover:underline">[PLACEHOLDER - Add phone]</a></p>
            </div>
          </section>

          <section className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm text-yellow-900">
              <strong>Last Updated:</strong> December 8, 2025. These terms are legally binding. If you have questions, contact legal@colleco.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
