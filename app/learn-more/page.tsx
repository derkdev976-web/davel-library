"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { 
  BookOpen, Users, Calendar, MapPin, Clock, 
  Smartphone, GraduationCap, Heart, Shield, 
  Award, Globe, Library
} from "lucide-react"

export default function LearnMorePage() {
  const { data: session } = useSession()
  const services = [
    {
      title: "Membership & Access",
      description: "Learn about our membership options, borrowing privileges, and access to digital resources.",
      icon: Users,
      href: "/learn-more/membership",
      color: "text-blue-600"
    },
    {
      title: "Digital Library",
      description: "Explore our extensive collection of e-books, audiobooks, and digital resources.",
      icon: Smartphone,
      href: "/learn-more/digital-library",
      color: "text-green-600"
    },
    {
      title: "Study Spaces",
      description: "Discover our quiet study areas, group meeting rooms, and computer workstations.",
      icon: GraduationCap,
      href: "/learn-more/study-spaces",
      color: "text-purple-600"
    },
    {
      title: "Events & Programs",
      description: "Join our community events, author talks, workshops, and educational programs.",
      icon: Calendar,
      href: "/learn-more/events-programs",
      color: "text-orange-600"
    },
    {
      title: "Research Support",
      description: "Get help with research projects, academic writing, and information literacy.",
      icon: Library,
      href: "/learn-more/research-support",
      color: "text-red-600"
    },
    {
      title: "Children & Teens",
      description: "Special programs and resources designed for young readers and students.",
      icon: Heart,
      href: "/learn-more/children-teens",
      color: "text-pink-600"
    }
  ]

  const quickInfo = [
    {
      title: "Opening Hours",
      value: "Mon-Sat: 9AM-9PM, Sun: 10AM-6PM",
      icon: Clock
    },
    {
      title: "Location",
      value: "123 Library Street, City Center",
      icon: MapPin
    },
    {
      title: "Contact",
      value: "info@davellibrary.com",
      icon: Globe
    },
    {
      title: "Collection",
      value: "50,000+ Books & Digital Resources",
      icon: BookOpen
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-white to-[#F5F5DC] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Learn More About Davel Library</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover everything our modern library has to offer - from traditional book lending to cutting-edge digital resources and community programs.
          </p>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickInfo.map((info, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <info.icon className="h-8 w-8 mx-auto mb-3 text-[#8B4513] dark:text-[#d2691e]" />
                <h3 className="font-semibold mb-1">{info.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{info.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Services Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <service.icon className={`h-8 w-8 ${service.color}`} />
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {service.description}
                  </p>
                  <Link href={service.href}>
                    <Button className="w-full bg-[#8B4513] hover:bg-[#A0522D]">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Davel Library?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-[#8B4513] dark:text-[#d2691e]" />
              <h3 className="text-xl font-semibold mb-2">Excellence</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Award-winning library services with a commitment to quality and innovation.
              </p>
            </div>
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-[#8B4513] dark:text-[#d2691e]" />
              <h3 className="text-xl font-semibold mb-2">Trust & Security</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your privacy and data security are our top priorities.
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-[#8B4513] dark:text-[#d2691e]" />
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600 dark:text-gray-300">
                A welcoming space for learning, growth, and community connection.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl mb-6 opacity-90">
                Join thousands of members who are already enjoying our library services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!session && (
                  <Link href="/apply">
                    <Button size="lg" variant="secondary" className="bg-white text-[#8B4513] hover:bg-gray-100">
                      Apply for Membership
                    </Button>
                  </Link>
                )}
                <Link href="/catalog">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#8B4513]">
                    Browse Catalog
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
