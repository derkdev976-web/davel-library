"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRandomLateFee, getRandomMaxFine } from "@/lib/currency-utils"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Library Service Agreement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-600 dark:text-gray-400">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using Davel Library&apos;s services, including our website, digital resources, and physical facilities, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                2. Membership and Registration
              </h2>
              <div className="space-y-3">
                <p>To access certain library services, you must:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Complete the membership application process</li>
                  <li>Provide accurate and complete information</li>
                  <li>Maintain current contact information</li>
                  <li>Comply with all library policies and procedures</li>
                </ul>
                <p>
                  Membership is granted at the discretion of the library and may be revoked for violations of these terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                3. Book Borrowing and Returns
              </h2>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Borrowing Rules:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Present valid library card for all transactions</li>
                  <li>Return materials by the due date</li>
                  <li>Pay fines for overdue materials</li>
                  <li>Report lost or damaged materials immediately</li>
                  <li>Limit of 10 items per member at any time</li>
                </ul>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Late Fees:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>${getRandomLateFee()} per day for books</li>
                  <li>${getRandomLateFee()} per day for DVDs and media</li>
                  <li>Maximum fine of ${getRandomMaxFine()} per item</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                4. Digital Resources
              </h2>
              <div className="space-y-3">
                <p>Access to digital resources is subject to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Valid library membership</li>
                  <li>Acceptable use policies</li>
                  <li>Copyright and licensing restrictions</li>
                  <li>Fair use guidelines</li>
                </ul>
                <p>
                  Digital content may not be downloaded, copied, or distributed without permission.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                5. Acceptable Use Policy
              </h2>
              <div className="space-y-3">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use library resources for illegal activities</li>
                  <li>Violate copyright or intellectual property rights</li>
                  <li>Disrupt library operations or other users</li>
                  <li>Access inappropriate or harmful content</li>
                  <li>Share account credentials with others</li>
                  <li>Attempt to gain unauthorized access to systems</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                6. Study Spaces and Facilities
              </h2>
              <div className="space-y-3">
                <p>When using library facilities:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Respect quiet study areas</li>
                  <li>Keep spaces clean and organized</li>
                  <li>Follow posted rules and guidelines</li>
                  <li>Reserve study rooms in advance when required</li>
                  <li>Report maintenance issues promptly</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                7. Events and Programs
              </h2>
              <div className="space-y-3">
                <p>Participation in library events:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>May require advance registration</li>
                  <li>Is subject to capacity limits</li>
                  <li>May be photographed or recorded</li>
                  <li>Requires appropriate behavior and conduct</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                8. Privacy and Data Protection
              </h2>
              <p>
                Your privacy is important to us. We collect and use your information in accordance with our Privacy Policy. By using our services, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                9. Intellectual Property
              </h2>
              <p>
                All content on our website and digital platforms, including text, graphics, logos, and software, is the property of Davel Library or its licensors and is protected by copyright and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                10. Disclaimers and Limitations
              </h2>
              <div className="space-y-3">
                <p>Davel Library provides services &quot;as is&quot; and makes no warranties regarding:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Availability of specific materials or resources</li>
                  <li>Accuracy of information provided</li>
                  <li>Uninterrupted access to digital services</li>
                  <li>Compatibility with all devices or browsers</li>
                </ul>
                <p>
                  The library is not liable for any damages arising from the use of our services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                11. Termination
              </h2>
              <p>
                We may terminate or suspend your access to library services at any time, with or without cause, including for violations of these terms. Upon termination, you must return all borrowed materials and settle any outstanding fines.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                12. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                13. Governing Law
              </h2>
              <p>
                These Terms of Service are governed by the laws of the jurisdiction in which Davel Library operates. Any disputes will be resolved in the appropriate courts of that jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                14. Contact Information
              </h2>
              <p className="mb-3">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p><strong>Email:</strong> legal@davel-library.com</p>
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
