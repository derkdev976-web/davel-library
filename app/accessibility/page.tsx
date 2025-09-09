"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accessibility, Eye, Ear, Heart, Volume2, Monitor } from "lucide-react"

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent">
            Accessibility
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
            Ensuring equal access to knowledge for everyone
          </p>
        </div>

        <div className="grid gap-6">
          {/* Commitment Section */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Accessibility className="h-6 w-6 mr-2" />
                Our Commitment to Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 dark:text-gray-400">
              <p className="mb-4">
                Davel Library is committed to providing equal access to information, resources, and services for all members of our community. We strive to create an inclusive environment that accommodates diverse needs and abilities.
              </p>
              <p>
                Our accessibility initiatives are guided by the Web Content Accessibility Guidelines (WCAG) 2.1 AA standards and applicable accessibility laws and regulations.
              </p>
            </CardContent>
          </Card>

          {/* Physical Accessibility */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Heart className="h-6 w-6 mr-2" />
                Physical Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600 dark:text-gray-400">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Building Access</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Wheelchair-accessible entrances</li>
                    <li>Elevator access to all floors</li>
                    <li>Accessible restrooms</li>
                    <li>Designated accessible parking spaces</li>
                    <li>Service animal friendly</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Study Spaces</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Adjustable height tables</li>
                    <li>Accessible computer workstations</li>
                    <li>Quiet study areas with reduced lighting</li>
                    <li>Assistive technology stations</li>
                    <li>Reserved accessible seating</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Accessibility */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Eye className="h-6 w-6 mr-2" />
                Visual Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600 dark:text-gray-400">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Assistive Technology</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Screen readers (JAWS, NVDA)</li>
                    <li>Screen magnification software</li>
                    <li>High-contrast displays</li>
                    <li>Large print materials</li>
                    <li>Braille signage and materials</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Digital Resources</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Accessible e-books and audiobooks</li>
                    <li>Text-to-speech functionality</li>
                    <li>Adjustable font sizes</li>
                    <li>High contrast mode</li>
                    <li>Keyboard navigation support</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hearing Accessibility */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Ear className="h-6 w-6 mr-2" />
                Hearing Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600 dark:text-gray-400">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Communication Support</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Assistive listening devices</li>
                    <li>Sign language interpretation services</li>
                    <li>Captioning for videos and events</li>
                    <li>Written communication options</li>
                    <li>Visual alert systems</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Events and Programs</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Captioned presentations</li>
                    <li>Sign language interpreters available</li>
                    <li>Assistive listening systems</li>
                    <li>Visual aids and materials</li>
                    <li>Advance notice for accommodations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Digital Accessibility */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Monitor className="h-6 w-6 mr-2" />
                Digital Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600 dark:text-gray-400">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Website Features</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Keyboard navigation support</li>
                    <li>Screen reader compatibility</li>
                    <li>Alternative text for images</li>
                    <li>High contrast mode</li>
                    <li>Resizable text</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Mobile Accessibility</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Voice control support</li>
                    <li>Gesture navigation</li>
                    <li>Accessible mobile apps</li>
                    <li>Touch-friendly interfaces</li>
                    <li>Responsive design</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services and Support */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Services and Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600 dark:text-gray-400">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Assistance Services</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Personal assistance with materials</li>
                    <li>Reading assistance</li>
                    <li>Technology training</li>
                    <li>Accessibility consultations</li>
                    <li>Emergency assistance</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Specialized Collections</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Large print books</li>
                    <li>Audiobooks and e-audiobooks</li>
                    <li>Braille materials</li>
                    <li>Accessible DVDs with captions</li>
                    <li>Assistive technology guides</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Accommodations */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Request Accommodations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                We encourage you to request accommodations in advance to ensure we can provide the best possible service. Contact our accessibility coordinator to discuss your needs.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Contact Information</h3>
                <p><strong>Accessibility Coordinator:</strong> Sarah Johnson</p>
                <p><strong>Email:</strong> accessibility@davel-library.com</p>
                <p><strong>Phone:</strong> (555) 123-4567 ext. 123</p>
                <p><strong>TTY:</strong> (555) 123-4568</p>
                <p><strong>Hours:</strong> Monday-Friday, 9:00 AM - 5:00 PM</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Advance Notice Preferred</Badge>
                <Badge variant="secondary">Confidential</Badge>
                <Badge variant="secondary">No Cost</Badge>
                <Badge variant="secondary">Individualized</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Feedback and Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 dark:text-gray-400">
              <p className="mb-4">
                We welcome feedback about our accessibility services and suggestions for improvement. Your input helps us better serve our community.
              </p>
              <p>
                To provide feedback or report accessibility issues, please contact us at <strong>accessibility@davel-library.com</strong> or call <strong>(555) 123-4567</strong>.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
