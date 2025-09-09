import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  GraduationCap, Users, Monitor, Wifi, 
  Clock, MapPin, Volume2, VolumeX, ArrowLeft,
  Coffee, BookOpen, Laptop, Printer
} from "lucide-react"
import Image from 'next/image'

export default function StudySpacesPage() {
  const studyAreas = [
    {
      name: "Quiet Study Room",
      capacity: "20 seats",
      description: "Silent study environment for focused learning",
      icon: VolumeX,
      features: ["Individual study carrels", "Natural lighting", "Power outlets", "No talking policy"],
      availability: "First come, first served",
      image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=300&fit=crop"
    },
    {
      name: "Group Study Rooms",
      capacity: "4-8 people",
      description: "Collaborative spaces for team projects and discussions",
      icon: Users,
      features: ["Whiteboards", "Projector screens", "Audio-visual equipment", "Reservable"],
      availability: "Reservation required",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
    },
    {
      name: "Computer Lab",
      capacity: "15 workstations",
      description: "High-performance computers with specialized software",
      icon: Monitor,
      features: ["Adobe Creative Suite", "Statistical software", "High-speed internet", "Printing services"],
      availability: "Sign-up sheet",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop"
    },
    {
      name: "Reading Lounge",
      capacity: "30 seats",
      description: "Comfortable seating for casual reading and study",
      icon: BookOpen,
      features: ["Comfortable chairs", "Coffee available", "Background music", "Flexible seating"],
      availability: "Open seating",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop"
    }
  ]

  const amenities = [
    {
      title: "Free Wi-Fi",
      description: "High-speed internet access throughout the library",
      icon: Wifi
    },
    {
      title: "Printing Services",
      description: "Black & white and color printing available",
      icon: Printer
    },
    {
      title: "Coffee & Snacks",
      description: "Refreshments available in the café area",
      icon: Coffee
    },
    {
      title: "Power Outlets",
      description: "Convenient charging stations for all devices",
      icon: Laptop
    }
  ]

  const bookingInfo = [
    {
      step: "1",
      title: "Check Availability",
      description: "View real-time availability of study spaces online or at the front desk"
    },
    {
      step: "2",
      title: "Make Reservation",
      description: "Book your preferred space up to 2 weeks in advance"
    },
    {
      step: "3",
      title: "Check In",
      description: "Arrive on time and check in at the front desk or scan QR code"
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
          <h1 className="text-4xl font-bold mb-4 text-gradient">Study Spaces</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Find your perfect study environment with our variety of quiet, collaborative, and technology-equipped spaces.
          </p>
        </div>

        {/* Study Areas Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Available Study Spaces</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {studyAreas.map((area, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  <Image 
                    src={area.image} 
                    alt={area.name}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      {area.capacity}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <area.icon className="h-8 w-8 text-[#8B4513] dark:text-[#d2691e]" />
                    <div>
                      <CardTitle className="text-2xl">{area.name}</CardTitle>
                      <p className="text-gray-600 dark:text-gray-300">{area.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {area.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-[#8B4513] dark:bg-[#d2691e] rounded-full"></div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {area.availability}
                      </span>
                      <Button size="sm" className="bg-[#8B4513] hover:bg-[#A0522D]">
                        Reserve Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Amenities & Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {amenities.map((amenity, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <amenity.icon className="h-12 w-12 mx-auto mb-4 text-[#8B4513] dark:text-[#d2691e]" />
                  <h3 className="text-xl font-semibold mb-2">{amenity.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{amenity.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Booking Process */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">How to Book a Study Space</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bookingInfo.map((info, index) => (
              <div key={index} className="text-center">
                <div className="bg-[#8B4513] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {info.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{info.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{info.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hours & Policies */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Hours & Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-6 w-6" />
                  <span>Opening Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-semibold">9:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-semibold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold">10:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <VolumeX className="h-6 w-6" />
                  <span>Study Policies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Maximum booking time: 4 hours per day</li>
                  <li>• Quiet zones must be respected</li>
                  <li>• No food in computer labs</li>
                  <li>• Clean up after yourself</li>
                  <li>• Report technical issues to staff</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How far in advance can I book a study room?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  You can book study rooms up to 2 weeks in advance. Same-day bookings are also available if space permits.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Can I bring food and drinks?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Food and drinks are allowed in most areas except the computer lab. Please use covered containers and clean up after yourself.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>What if I need to cancel my reservation?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  You can cancel your reservation up to 2 hours before your scheduled time. Late cancellations may affect future booking privileges.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Study?</h2>
              <p className="text-xl mb-6 opacity-90">
                Book your perfect study space and start your learning journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/apply">
                  <Button size="lg" variant="secondary" className="bg-white text-[#8B4513] hover:bg-gray-100">
                    Become a Member
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#8B4513]">
                  Book Study Space
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
