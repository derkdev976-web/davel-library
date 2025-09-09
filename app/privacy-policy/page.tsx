"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Your Privacy Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-600 dark:text-gray-400">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                1. Information We Collect
              </h2>
              <p className="mb-3">
                We collect information you provide directly to us, such as when you:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Create an account or apply for membership</li>
                <li>Reserve books or access digital resources</li>
                <li>Contact us for support or inquiries</li>
                <li>Participate in library events or programs</li>
                <li>Subscribe to our newsletter</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                2. Types of Information
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Personal Information:</h3>
                  <ul className="list-disc list-inside ml-4">
                    <li>Name, email address, and phone number</li>
                    <li>Address and contact information</li>
                    <li>Membership details and preferences</li>
                    <li>Profile picture (if uploaded)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Usage Information:</h3>
                  <ul className="list-disc list-inside ml-4">
                    <li>Books borrowed and reserved</li>
                    <li>Digital resources accessed</li>
                    <li>Event attendance and participation</li>
                    <li>Website usage patterns</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                3. How We Use Your Information
              </h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide and maintain library services</li>
                <li>Process book reservations and returns</li>
                <li>Send important notifications about your account</li>
                <li>Improve our services and user experience</li>
                <li>Communicate about events and programs</li>
                <li>Ensure library security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                4. Information Sharing
              </h2>
              <p className="mb-3">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect library rights and safety</li>
                <li>With service providers who assist in our operations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                5. Data Security
              </h2>
              <p className="mb-3">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Encryption of sensitive data</li>
                <li>Secure access controls</li>
                <li>Regular security audits</li>
                <li>Staff training on data protection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                6. Your Rights
              </h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>File a complaint about data handling</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                7. Cookies and Tracking
              </h2>
              <p className="mb-3">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Remember your preferences</li>
                <li>Analyze website usage</li>
                <li>Improve user experience</li>
                <li>Provide personalized content</li>
              </ul>
              <p className="mt-3">
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                8. Children&apos;s Privacy
              </h2>
              <p>
                We are committed to protecting the privacy of children. We collect personal information from children under 13 only with parental consent, in accordance with applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                9. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                10. Contact Us
              </h2>
              <p className="mb-3">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p><strong>Email:</strong> privacy@davel-library.com</p>
                <p><strong>Phone:</strong> (555) 123-4567</p>
                <p><strong>Address:</strong> 123 Library Street, City, State 12345</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
