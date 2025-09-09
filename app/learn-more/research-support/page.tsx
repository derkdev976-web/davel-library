import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Library, Search, BookOpen, Users, 
  Clock, ArrowLeft, Database, FileText,
  Globe, Award, HelpCircle, MessageSquare
} from "lucide-react"

export default function ResearchSupportPage() {
  const services = [
    {
      title: "Research Consultation",
      description: "One-on-one sessions with professional librarians",
      icon: Users,
      features: ["Topic development", "Search strategy", "Resource evaluation", "Citation help"]
    },
    {
      title: "Database Access",
      description: "Access to premium academic and research databases",
      icon: Database,
      features: ["Academic journals", "Research papers", "Statistical data", "Industry reports"]
    },
    {
      title: "Citation Management",
      description: "Tools and training for proper citation practices",
      icon: FileText,
      features: ["Citation tools", "Style guides", "Bibliography help", "Plagiarism prevention"]
    },
    {
      title: "Inter-library Loans",
      description: "Access to resources from partner libraries worldwide",
      icon: Globe,
      features: ["Book requests", "Article delivery", "Rare materials", "International access"]
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
          <h1 className="text-4xl font-bold mb-4 text-gradient">Research Support</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get expert help with your research projects, from initial planning to final citations.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Research Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <service.icon className="h-10 w-10 text-[#8B4513] dark:text-[#d2691e]" />
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-3">Services Include:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#8B4513] dark:bg-[#d2691e] rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4">Need Research Help?</h2>
              <p className="text-xl mb-6 opacity-90">
                Our expert librarians are here to help you succeed in your research projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/apply">
                  <Button size="lg" variant="secondary" className="bg-white text-[#8B4513] hover:bg-gray-100">
                    Become a Member
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#8B4513]">
                  Schedule Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
