"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { 
  Users, CreditCard, BookOpen, Smartphone, 
  Clock, Shield, Award, CheckCircle, ArrowLeft
} from "lucide-react"
import { getRandomMembershipFee, getRandomReplacementCardFee } from "@/lib/currency-utils"

export default function MembershipPage() {
  const { data: session } = useSession()
  const membershipTypes = [
    {
      name: "Student",
      price: "Free",
      duration: "Academic Year",
      features: [
        "Borrow up to 10 books",
        "Access to digital library",
        "Study space access",
        "Research support",
        "Free printing (50 pages/month)"
      ],
      requirements: ["Valid student ID", "School enrollment verification"],
      color: "bg-blue-50 border-blue-200"
    },
    {
      name: "Individual",
      price: `R${getRandomMembershipFee()}/year`,
      duration: "12 Months",
      features: [
        "Borrow up to 20 books",
        "Full digital library access",
        "Priority study space booking",
        "Extended research support",
        "Free printing (100 pages/month)",
        "Access to premium events"
      ],
      requirements: ["Government-issued ID", "Proof of address"],
      color: "bg-green-50 border-green-200"
    },
    {
      name: "Family",
      price: `R${getRandomMembershipFee()}/year`,
      duration: "12 Months",
      features: [
        "Borrow up to 40 books",
        "Full digital library access",
        "Family study room access",
        "Children's programs included",
        "Free printing (200 pages/month)",
        "Priority event registration",
        "Home delivery service"
      ],
      requirements: ["Government-issued ID", "Proof of address", "Family composition"],
      color: "bg-purple-50 border-purple-200"
    },
    {
      name: "Premium",
      price: `R${getRandomMembershipFee()}/year`,
      duration: "12 Months",
      features: [
        "Unlimited book borrowing",
        "Full digital library access",
        "Private study rooms",
        "Personal research assistance",
        "Unlimited printing",
        "VIP event access",
        "Home delivery service",
        "Inter-library loan privileges",
        "Early access to new releases"
      ],
      requirements: ["Government-issued ID", "Proof of address", "Income verification"],
      color: "bg-orange-50 border-orange-200"
    }
  ]

  const benefits = [
    {
      title: "Extensive Collection",
      description: "Access to over 50,000 physical books and 100,000+ digital resources",
      icon: BookOpen
    },
    {
      title: "Digital Access",
      description: "24/7 access to e-books, audiobooks, and online databases",
      icon: Smartphone
    },
    {
      title: "Study Spaces",
      description: "Quiet study areas, group rooms, and computer workstations",
      icon: Clock
    },
    {
      title: "Expert Support",
      description: "Professional librarians to help with research and information needs",
      icon: Award
    },
    {
      title: "Community Events",
      description: "Free access to author talks, workshops, and cultural programs",
      icon: Users
    },
    {
      title: "Secure & Private",
      description: "Your reading history and personal information are protected",
      icon: Shield
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-white to-[#F5F5DC] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/learn-more">
            <Button variant="ghost" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Learn More</span>
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Membership & Access</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose the perfect membership plan for your needs and unlock access to our comprehensive library services.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Become a Member?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <benefit.icon className="h-12 w-12 mx-auto mb-4 text-[#8B4513] dark:text-[#d2691e]" />
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Membership Plans */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Membership Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {membershipTypes.map((plan, index) => (
              <Card key={index} className={`${plan.color} dark:bg-gray-800`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <Badge variant="outline">{plan.duration}</Badge>
                  </div>
                  <div className="text-3xl font-bold text-[#8B4513] dark:text-[#d2691e]">
                    {plan.price}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Features:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Requirements:</h4>
                      <ul className="space-y-1">
                        {plan.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="text-sm text-gray-600 dark:text-gray-400">
                            • {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link href="/apply">
                      <Button className="w-full bg-[#8B4513] hover:bg-[#A0522D]">
                        Apply for {plan.name} Membership
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How to Apply */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">How to Apply</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#8B4513] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Fill Application</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Complete our online application form with your personal information and preferred membership type.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#8B4513] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Submit Documents</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload required documents like ID, proof of address, and any additional verification materials.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#8B4513] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Approved</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Receive approval within 2-3 business days and start enjoying your library membership immediately.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Can I change my membership plan later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, you can upgrade or downgrade your membership plan at any time. Changes will be prorated based on your remaining membership period.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>What happens if I lose my library card?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Report the loss immediately to prevent unauthorized use. A replacement card can be issued for a small fee (${getRandomReplacementCardFee()}.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Can I access the library without a membership?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, you can visit and use our study spaces without a membership. However, borrowing books and accessing digital resources requires membership.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
              <p className="text-xl mb-6 opacity-90">
                Start your library journey today and unlock access to thousands of resources.
              </p>
              {!session && (
                <Link href="/apply">
                  <Button size="lg" variant="secondary" className="bg-white text-[#8B4513] hover:bg-gray-100">
                    Apply for Membership Now
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
