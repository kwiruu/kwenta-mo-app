import { Link } from 'react-router';
import type { Route } from './+types/privacy';
import { APP_CONFIG } from '~/config/app';
import { ArrowLeft } from 'lucide-react';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: `Privacy Policy - ${APP_CONFIG.name}` },
    { name: 'description', content: `Privacy Policy for ${APP_CONFIG.name}` },
  ];
}

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: January 25, 2026</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Welcome to {APP_CONFIG.name} ("we," "our," or "us"). We are committed to protecting
              your personal information and your right to privacy. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you use our web
              application.
            </p>
            <p className="text-gray-600">
              By using {APP_CONFIG.name}, you agree to the collection and use of information in
              accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h3>
            <p className="text-gray-600 mb-4">When you register for an account, we may collect:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Name</li>
              <li>Email address</li>
              <li>Business name and information</li>
              <li>Profile information from Google (if you sign in with Google)</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-2">Business Data</h3>
            <p className="text-gray-600 mb-4">
              To provide our costing services, we collect and store:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Ingredient and inventory information</li>
              <li>Recipe data and formulations</li>
              <li>Sales records and transactions</li>
              <li>Expense and purchase records</li>
              <li>Receipt images (for scanning features)</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Automatically Collected Information
            </h3>
            <p className="text-gray-600">
              We automatically collect certain information when you visit our application, including
              your IP address, browser type, operating system, access times, and the pages you have
              viewed.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-600 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Provide, operate, and maintain our application</li>
              <li>Create and manage your user account</li>
              <li>Process and calculate your business costs and profits</li>
              <li>Generate financial reports and analytics</li>
              <li>Improve and personalize your experience</li>
              <li>Communicate with you about updates or support</li>
              <li>Ensure the security of our application</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              4. Data Storage and Security
            </h2>
            <p className="text-gray-600 mb-4">
              Your data is stored securely using Supabase, a trusted cloud database provider. We
              implement appropriate technical and organizational security measures to protect your
              personal information, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication using industry-standard protocols</li>
              <li>Row-level security policies to ensure data isolation</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
            <p className="text-gray-600 mb-4">
              We may use third-party services that collect, monitor, and analyze data:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>
                <strong>Supabase:</strong> For authentication and database services
              </li>
              <li>
                <strong>Google OAuth:</strong> For optional social login functionality
              </li>
              <li>
                <strong>OCR Services:</strong> For receipt scanning and text extraction
              </li>
            </ul>
            <p className="text-gray-600 mt-4">
              These third-party service providers have their own privacy policies addressing how
              they use such information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              6. Data Sharing and Disclosure
            </h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may
              share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in operating our application</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p className="text-gray-600 mt-4">
              To exercise any of these rights, please contact us using the information provided
              below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
            <p className="text-gray-600">
              We retain your personal information for as long as your account is active or as needed
              to provide you services. You may request deletion of your account and associated data
              at any time. Some information may be retained as required by law or for legitimate
              business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-600">
              Our application is not intended for use by children under the age of 18. We do not
              knowingly collect personal information from children. If you become aware that a child
              has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
              You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy or our data practices, please
              contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 font-medium">{APP_CONFIG.name}</p>
              <p className="text-gray-600">Email: privacy@kwentamo.com</p>
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
