import { Link } from 'react-router';
import type { Route } from './+types/terms';
import { APP_CONFIG } from '~/config/app';
import { ArrowLeft } from 'lucide-react';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: `Terms of Service - ${APP_CONFIG.name}` },
    {
      name: 'description',
      content: `Read the terms and conditions for using ${APP_CONFIG.name}, a web-based costing assistant for small food businesses in the Philippines.`,
    },
    { name: 'robots', content: 'index, follow' },
    { tagName: 'link', rel: 'canonical', href: `${APP_CONFIG.url}/terms` },
  ];
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-text.svg" alt="Kwenta MO" className="h-8" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: January 25, 2026</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing and using {APP_CONFIG.name} ("the Service"), you accept and agree to be
              bound by these Terms of Service. If you do not agree to these terms, please do not use
              our Service.
            </p>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. Your continued use of the
              Service following any changes indicates your acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              {APP_CONFIG.name} is a web-based costing assistant designed for small food business
              owners. The Service provides tools for:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Tracking ingredients and inventory</li>
              <li>Managing recipes and calculating food costs</li>
              <li>Recording sales and expenses</li>
              <li>Generating financial reports and analytics</li>
              <li>Scanning receipts for automated data entry</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">To use certain features of the Service, you must:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Register for an account with accurate and complete information</li>
              <li>Be at least 18 years of age</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
            <p className="text-gray-600">
              You are responsible for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-600 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Attempt to gain unauthorized access to the Service or its systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Upload malicious code or content</li>
              <li>Use the Service to compete with us or build a similar product</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. User Content</h2>
            <p className="text-gray-600 mb-4">
              You retain ownership of all data and content you upload to the Service ("User
              Content"). By uploading User Content, you grant us a limited license to store,
              process, and display your content solely for the purpose of providing the Service.
            </p>
            <p className="text-gray-600">
              You are responsible for ensuring that your User Content does not violate any
              third-party rights or applicable laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              The Service, including its original content, features, and functionality, is owned by
              {APP_CONFIG.name} and is protected by copyright, trademark, and other intellectual
              property laws.
            </p>
            <p className="text-gray-600">
              You may not copy, modify, distribute, sell, or lease any part of our Service without
              our express written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Privacy</h2>
            <p className="text-gray-600">
              Your use of the Service is also governed by our{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              , which describes how we collect, use, and protect your personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              8. Disclaimer of Warranties
            </h2>
            <p className="text-gray-600 mb-4">
              The Service is provided "as is" and "as available" without warranties of any kind,
              either express or implied, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Merchantability or fitness for a particular purpose</li>
              <li>Accuracy or completeness of calculations and reports</li>
              <li>Uninterrupted or error-free operation</li>
              <li>Security of data transmission</li>
            </ul>
            <p className="text-gray-600 mt-4">
              <strong>Important:</strong> The financial calculations and reports provided by the
              Service are for informational purposes only. You should verify all calculations and
              consult with a qualified accountant for professional financial advice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-600">
              To the maximum extent permitted by law, {APP_CONFIG.name} shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, including but not
              limited to loss of profits, data, or business opportunities, arising out of or in
              connection with your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-600">
              You agree to indemnify and hold harmless {APP_CONFIG.name}, its affiliates, and their
              respective officers, directors, employees, and agents from any claims, damages,
              losses, or expenses arising out of your use of the Service or violation of these
              Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Termination</h2>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your account and access to the Service at our sole
              discretion, without prior notice, for conduct that we believe:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Violates these Terms</li>
              <li>Is harmful to other users or third parties</li>
              <li>Is harmful to the Service or our business interests</li>
            </ul>
            <p className="text-gray-600 mt-4">
              You may terminate your account at any time by contacting us or using the account
              deletion feature if available.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-600">
              These Terms shall be governed by and construed in accordance with the laws of the
              Republic of the Philippines, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Dispute Resolution</h2>
            <p className="text-gray-600">
              Any disputes arising from these Terms or your use of the Service shall be resolved
              through good faith negotiation. If negotiation fails, the dispute shall be submitted
              to the appropriate courts of the Republic of the Philippines.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Severability</h2>
            <p className="text-gray-600">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining
              provisions shall continue in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 font-medium">{APP_CONFIG.name}</p>
              <p className="text-gray-600">Email: support@kwentamo.com</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-6 bg-gray-50/50">
        <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">© 2025 {APP_CONFIG.name}. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
