"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
  const { data: session } = useSession()
  
  return (
    <footer className="bg-gray-900 dark:bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-8 w-8 text-[#D2691E]" />
              <span className="text-xl font-bold">Davel Library</span>
            </div>
            <p className="text-gray-300 mb-4">
              A modern digital library management system connecting readers with knowledge and community.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-[#D2691E] cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-[#D2691E] cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-[#D2691E] cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-gray-400 hover:text-[#D2691E] cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/catalog" className="text-gray-300 hover:text-[#D2691E] transition-colors">
                  Book Catalog
                </Link>
              </li>
              {!session && (
                <li>
                  <Link href="/apply" className="text-gray-300 hover:text-[#D2691E] transition-colors">
                    Apply for Membership
                  </Link>
                </li>
              )}
              <li>
                <Link href="/news-events" className="text-gray-300 hover:text-[#D2691E] transition-colors">
                  News & Events
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-300 hover:text-[#D2691E] transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-gray-300 hover:text-[#D2691E] transition-colors">
                  Community Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/digital-library" className="text-gray-300 hover:text-[#D2691E] transition-colors">
                  Digital Library
                </Link>
              </li>
              <li>
                <Link
                  href="/book-reservations"
                  className="text-gray-300 hover:text-[#D2691E] transition-colors"
                >
                  Book Reservations
                </Link>
              </li>
              <li>
                <Link
                  href="/research-assistance"
                  className="text-gray-300 hover:text-[#D2691E] transition-colors"
                >
                  Research Assistance
                </Link>
              </li>
              <li>
                <Link href="/study-spaces" className="text-gray-300 hover:text-[#D2691E] transition-colors">
                  Study Spaces
                </Link>
              </li>
              <li>
                <Link href="/printing-services" className="text-gray-300 hover:text-[#D2691E] transition-colors">
                  Printing Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-[#D2691E]" />
                <span className="text-gray-300">123 Library Street, City, State 12345</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#D2691E]" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#D2691E]" />
                <span className="text-gray-300">info@davellibrary.com</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Library Hours</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Monday - Friday: 8:00 AM - 9:00 PM</div>
                <div>Saturday: 9:00 AM - 6:00 PM</div>
                <div>Sunday: 12:00 PM - 5:00 PM</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm">© {new Date().getFullYear()} Davel Library. All rights reserved.</div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="text-gray-300 hover:text-[#D2691E] text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-300 hover:text-[#D2691E] text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="text-gray-300 hover:text-[#D2691E] text-sm transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
