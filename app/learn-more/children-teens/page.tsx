import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Heart, BookOpen, Users, Star, 
  ArrowLeft, Palette, Music, Gamepad2,
  GraduationCap, Award, Shield, Smile
} from "lucide-react"

export default function ChildrenTeensPage() {
  const programs = [
    {
      title: "Story Time",
      ageGroup: "Ages 3-8",
      description: "Interactive reading sessions with crafts and activities",
      icon: BookOpen,
      schedule: "Weekly",
      features: ["Themed stories", "Craft activities", "Songs and rhymes", "Parent participation"]
    },
    {
      title: "Teen Book Club",
      ageGroup: "Ages 13-18",
      description: "Monthly book discussions and literary activities",
      icon: Users,
      schedule: "Monthly",
      features: ["Book discussions", "Author visits", "Writing workshops", "Reading challenges"]
    },
    {
      title: "Creative Arts",
      ageGroup: "All Ages",
      description: "Art, music, and creative expression programs",
      icon: Palette,
      schedule: "Bi-weekly",
      features: ["Art workshops", "Music sessions", "Drama activities", "Digital art"]
    },
    {
      title: "Homework Help",
      ageGroup: "Ages 8-18",
      description: "Academic support and tutoring services",
      icon: GraduationCap,
      schedule: "Daily",
      features: ["Math help", "Reading support", "Science projects", "Study skills"]
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
          <h1 className="text-4xl font-bold mb-4 text-gradient">Children & Teens</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Nurturing young minds through engaging programs, educational activities, and a love for reading.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Programs for Young Readers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <program.icon className="h-10 w-10 text-[#8B4513] dark:text-[#d2691e]" />
                    <div>
                      <CardTitle className="text-2xl">{program.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">{program.ageGroup}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{program.description}</p>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{program.schedule}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-3">Activities Include:</h4>
                  <ul className="space-y-2">
                    {program.features.map((feature, featureIndex) => (
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
              <h2 className="text-3xl font-bold mb-4">Join Our Young Readers</h2>
              <p className="text-xl mb-6 opacity-90">
                Help your child discover the joy of reading and learning through our engaging programs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/apply">
                  <Button size="lg" variant="secondary" className="bg-white text-[#8B4513] hover:bg-gray-100">
                    Family Membership
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#8B4513]">
                  Register for Programs
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
