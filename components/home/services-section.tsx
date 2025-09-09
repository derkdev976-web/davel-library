"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Calendar, 
  Search, 
  Monitor, 
  Printer,
  ExternalLink,
  Clock,
  Users,
  FileText,
  Database,
  CheckCircle,
  Phone,
  MessageSquare
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const services = [
  {
    title: "Digital Library",
    description: "Access thousands of e-books, audiobooks, and digital resources from anywhere. Our digital collection includes academic journals, research papers, and multimedia content.",
    icon: Database,
    features: ["24/7 Online Access", "E-books & Audiobooks", "Academic Journals", "Research Databases"],
    status: "Available",
    color: "bg-blue-500"
  },
  {
    title: "Book Reservations",
    description: "Reserve physical books online and get notified when they're available. Manage your reading list and track your borrowed items through our easy-to-use system.",
    icon: BookOpen,
    features: ["Online Reservations", "Email Notifications", "Reading Lists", "Due Date Tracking"],
    status: "Available",
    color: "bg-green-500"
  },
  {
    title: "Research Assistance",
    description: "Get expert help with your research projects. Our librarians provide personalized assistance for academic research, citation help, and information literacy.",
    icon: Search,
    features: ["Expert Librarians", "Research Guidance", "Citation Help", "Information Literacy"],
    status: "Available",
    color: "bg-purple-500"
  },
  {
    title: "Study Spaces",
    description: "Book quiet study rooms, group collaboration spaces, and computer workstations. Perfect for individual study sessions or group projects.",
    icon: Monitor,
    features: ["Quiet Study Rooms", "Group Spaces", "Computer Workstations", "Flexible Booking"],
    status: "Available",
    color: "bg-orange-500"
  },
  {
    title: "Printing Services",
    description: "High-quality printing, scanning, and copying services. Print your documents in color or black & white with various paper sizes and finishing options.",
    icon: Printer,
    features: ["Color & B&W Printing", "Scanning Services", "Multiple Paper Sizes", "Professional Finishing"],
    status: "Available",
    color: "bg-red-500"
  }
]

export function ServicesSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gradient mb-4">
            Our Library Services
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover our comprehensive range of library services designed to support your learning, research, and creative endeavors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${service.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {service.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      Key Features:
                    </h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:border-blue-300 dark:group-hover:border-blue-700"
                      asChild
                    >
                      <a href={service.title === "Digital Library" ? "/learn-more/digital-library" :
                           service.title === "Book Reservations" ? "/book-reservations" :
                           service.title === "Research Assistance" ? "/learn-more/research-support" :
                           service.title === "Study Spaces" ? "/learn-more/study-spaces" :
                           service.title === "Printing Services" ? "/printing-services" : "/learn-more"}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Learn More
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* View All Services Button */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-8 py-3"
            asChild
          >
            <a href="/learn-more">
              View All Services
            </a>
          </Button>
        </div>

        {/* Service Hours & Contact */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Service Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Monday - Friday</span>
                <span>8:00 AM - 10:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Saturday</span>
                <span>9:00 AM - 8:00 PM</span>
              </div>
              <div className="flex-between">
                <span className="font-medium">Sunday</span>
                <span>10:00 AM - 6:00 PM</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Digital Library:</strong> Available 24/7 online
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Get Help
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Need assistance with any of our services?
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Email: help@davel-library.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-green-500" />
                    <span>Phone: (555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Live Chat: Available during hours</span>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
