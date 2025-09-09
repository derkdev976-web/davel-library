import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Smartphone, BookOpen, Headphones, Globe, 
  Download, Search, Clock, Shield, ArrowLeft,
  Tablet, Monitor, Wifi, Database
} from "lucide-react"

export default function DigitalLibraryPage() {
  const digitalResources = [
    {
      title: "E-Books",
      count: "50,000+",
      description: "Fiction, non-fiction, academic, and reference books in digital format",
      icon: BookOpen,
      features: ["PDF and EPUB formats", "Offline reading", "Text-to-speech", "Searchable content"]
    },
    {
      title: "Audiobooks",
      count: "25,000+",
      description: "Professional narrations of popular and classic literature",
      icon: Headphones,
      features: ["Multiple narrators", "Variable speed", "Chapter navigation", "Offline listening"]
    },
    {
      title: "Academic Journals",
      count: "100+",
      description: "Peer-reviewed research papers and academic publications",
      icon: Database,
      features: ["Full-text access", "Citation tools", "Research databases", "Subject indexing"]
    },
    {
      title: "Online Courses",
      count: "500+",
      description: "Interactive learning modules and educational content",
      icon: Monitor,
      features: ["Video lectures", "Interactive quizzes", "Progress tracking", "Certificates"]
    }
  ]

  const platforms = [
    {
      name: "Web Browser",
      description: "Access from any computer with internet connection",
      icon: Globe,
      features: ["No downloads required", "Cross-platform compatibility", "Automatic updates"]
    },
    {
      name: "Mobile App",
      description: "Read and listen on your smartphone or tablet",
      icon: Smartphone,
      features: ["iOS and Android", "Offline mode", "Sync across devices", "Push notifications"]
    },
    {
      name: "Desktop App",
      description: "Enhanced reading experience on your computer",
      icon: Monitor,
      features: ["Full-screen reading", "Advanced search", "Note-taking tools", "Export options"]
    }
  ]

  const features = [
    {
      title: "24/7 Access",
      description: "Access your digital library anytime, anywhere",
      icon: Clock
    },
    {
      title: "Offline Reading",
      description: "Download content for offline access",
      icon: Download
    },
    {
      title: "Advanced Search",
      description: "Find exactly what you need with powerful search tools",
      icon: Search
    },
    {
      title: "Secure & Private",
      description: "Your reading history is protected and private",
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
          <h1 className="text-4xl font-bold mb-4 text-gradient">Digital Library</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Access our vast collection of digital resources from anywhere in the world, 24/7.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Our Digital Library?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 mx-auto mb-4 text-[#8B4513] dark:text-[#d2691e]" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Digital Resources */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Digital Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {digitalResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <resource.icon className="h-10 w-10 text-[#8B4513] dark:text-[#d2691e]" />
                    <div>
                      <CardTitle className="text-2xl">{resource.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">{resource.count} titles</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{resource.description}</p>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {resource.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#8B4513] dark:bg-[#d2691e] rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Access Platforms */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Access Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {platforms.map((platform, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <platform.icon className="h-16 w-16 mx-auto mb-4 text-[#8B4513] dark:text-[#d2691e]" />
                  <h3 className="text-xl font-semibold mb-2">{platform.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{platform.description}</p>
                  <ul className="space-y-2 text-sm">
                    {platform.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center justify-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How to Access */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">How to Access Digital Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#8B4513] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign In</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Use your library membership credentials to access the digital portal.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#8B4513] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse & Search</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Explore our collection or use advanced search to find specific content.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#8B4513] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Download & Enjoy</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Download content for offline use or stream directly from our servers.
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
                <CardTitle>How many books can I download at once?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  You can download up to 10 items simultaneously, depending on your membership level. Downloads are automatically returned after 21 days.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Can I access the digital library without internet?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                                     Yes! Download content while connected to the internet, then enjoy offline reading. Your progress and notes will sync when you&apos;re back online.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>What devices are supported?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Our digital library works on computers, tablets, and smartphones. We have dedicated apps for iOS and Android, plus web access for all devices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
              <p className="text-xl mb-6 opacity-90">
                Start your digital reading journey with thousands of books at your fingertips.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/free-ebooks">
                  <Button size="lg" variant="secondary" className="bg-white text-[#8B4513] hover:bg-gray-100">
                    Browse Free Ebooks
                  </Button>
                </Link>
                <Link href="/catalog">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#8B4513]">
                    View Full Catalog
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
