import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Calendar, Users, BookOpen, Mic, 
  Clock, MapPin, Star, ArrowLeft,
  Heart, GraduationCap, Music, Camera
} from "lucide-react"
import Image from 'next/image'

export default function EventsProgramsPage() {
  const eventTypes = [
    {
      title: "Author Talks",
      description: "Meet your favorite authors and discover new voices",
      icon: Mic,
      frequency: "Monthly",
      examples: ["Book launches", "Writing workshops", "Q&A sessions", "Reading events"]
    },
    {
      title: "Children's Programs",
      description: "Fun and educational activities for young readers",
      icon: Heart,
      frequency: "Weekly",
      examples: ["Story time", "Craft sessions", "Educational games", "Summer reading"]
    },
    {
      title: "Academic Workshops",
      description: "Professional development and skill-building sessions",
      icon: GraduationCap,
      frequency: "Bi-weekly",
      examples: ["Research methods", "Digital literacy", "Academic writing", "Citation tools"]
    },
    {
      title: "Cultural Events",
      description: "Celebrate diversity through art, music, and culture",
      icon: Music,
      frequency: "Monthly",
      examples: ["Art exhibitions", "Music performances", "Cultural festivals", "Film screenings"]
    }
  ]

  const upcomingEvents = [
    {
      title: "Author Reading: Modern Fiction",
      date: "January 25, 2025",
      time: "7:00 PM",
      location: "Main Reading Room",
      type: "Author Talk",
      description: "Join acclaimed author Sarah Johnson for a reading from her latest novel.",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop"
    },
    {
      title: "Children's Story Time",
      date: "January 28, 2025",
      time: "10:00 AM",
      location: "Children's Section",
      type: "Children's Program",
      description: "Interactive story time with crafts and activities for ages 3-8.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
    },
    {
      title: "Digital Literacy Workshop",
      date: "February 2, 2025",
      time: "2:00 PM",
      location: "Computer Lab",
      type: "Academic Workshop",
      description: "Learn essential digital skills for research and academic work.",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop"
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
          <h1 className="text-4xl font-bold mb-4 text-gradient">Events & Programs</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join our vibrant community through engaging events, educational programs, and cultural activities.
          </p>
        </div>

        {/* Event Types */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Types of Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {eventTypes.map((eventType, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <eventType.icon className="h-10 w-10 text-[#8B4513] dark:text-[#d2691e]" />
                    <div>
                      <CardTitle className="text-2xl">{eventType.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">{eventType.frequency}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{eventType.description}</p>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-3">Examples:</h4>
                  <ul className="space-y-2">
                    {eventType.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-[#8B4513] dark:bg-[#d2691e] rounded-full"></div>
                        <span className="text-sm">{example}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  <Image 
                    src={event.image} 
                    alt={event.title}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      {event.type}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
                  <Button className="w-full bg-[#8B4513] hover:bg-[#A0522D]">
                    Register Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
              <p className="text-xl mb-6 opacity-90">
                Discover upcoming events and register for programs that interest you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/news-events">
                  <Button size="lg" variant="secondary" className="bg-white text-[#8B4513] hover:bg-gray-100">
                    View All Events
                  </Button>
                </Link>
                <Link href="/apply">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#8B4513]">
                    Become a Member
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
