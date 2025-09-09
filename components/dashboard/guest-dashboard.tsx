"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  UserPlus, 
  Calendar, 
  MessageSquare, 
  ArrowRight,
  Bookmark,
  Heart,
  Star
} from "lucide-react"
import Link from "next/link"

export function GuestDashboard() {
  const { data: session } = useSession()

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Free Ebooks",
      description: "Access our collection of free digital books and resources",
      action: "Browse Free Ebooks",
      href: "/free-ebooks"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Events & Programs",
      description: "Discover upcoming events, workshops, and community programs",
      action: "See Events",
      href: "/news-events"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Learn More",
      description: "Find out about our services, membership benefits, and facilities",
      action: "Learn More",
      href: "/learn-more"
    },
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: "Apply for Membership",
      description: "Join our community and unlock full access to all library services",
      action: "Apply Now",
      href: "/apply"
    }
  ]

  const benefits = [
    "Access to physical and digital book collections",
    "Reserve books and study spaces",
    "Attend exclusive events and workshops",
    "Get personalized reading recommendations",
    "Access to research databases",
    "Printing and photocopying services",
    "Study group facilities",
    "24/7 online resource access"
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white">
        <CardContent className="p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">
              Welcome to Davel Library, {session?.user?.name || "Guest"}!
            </h1>
            <p className="text-lg opacity-90 mb-6">
              Discover the world of knowledge and join our vibrant community of readers and learners.
            </p>
                         <div className="flex flex-wrap justify-center gap-4">
               <Link href="/apply">
                 <Button size="lg" className="bg-white text-[#8B4513] hover:bg-gray-100">
                   <UserPlus className="h-5 w-5 mr-2" />
                   Apply for Membership
                 </Button>
               </Link>
               <Link href="/free-ebooks">
                 <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#8B4513]">
                   <BookOpen className="h-5 w-5 mr-2" />
                   Browse Free Ebooks
                 </Button>
               </Link>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-[#8B4513]/10 rounded-lg mb-4">
                <div className="text-[#8B4513]">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {feature.description}
              </p>
              <Link href={feature.href}>
                <Button variant="outline" size="sm" className="w-full">
                  {feature.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Membership Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-[#8B4513]" />
            Membership Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#8B4513] rounded-full"></div>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/apply">
              <Button className="bg-[#8B4513] hover:bg-[#A0522D]">
                <UserPlus className="h-4 w-4 mr-2" />
                Start Your Membership Application
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

             {/* Free Ebooks Section */}
       <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
         <CardHeader>
           <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
             <BookOpen className="h-5 w-5" />
             Free Ebooks Available Now
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <h3 className="text-lg font-semibold mb-3">What You Can Access:</h3>
               <ul className="space-y-2 text-sm">
                 <li className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <span>Classic literature and public domain books</span>
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <span>Educational resources and textbooks</span>
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <span>Research papers and academic materials</span>
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <span>Children&apos;s books and learning materials</span>
                 </li>
               </ul>
             </div>
             <div className="text-center">
               <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">500+</div>
               <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Free Ebooks Available</div>
               <Link href="/free-ebooks">
                 <Button className="bg-green-600 hover:bg-green-700 text-white">
                   <BookOpen className="h-4 w-4 mr-2" />
                   Start Reading Now
                 </Button>
               </Link>
             </div>
           </div>
         </CardContent>
       </Card>

       {/* Library Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card>
           <CardContent className="p-6 text-center">
             <div className="text-3xl font-bold text-[#8B4513] mb-2">10,000+</div>
             <div className="text-sm text-gray-600 dark:text-gray-400">Total Books Available</div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-6 text-center">
             <div className="text-3xl font-bold text-[#8B4513] mb-2">500+</div>
             <div className="text-sm text-gray-600 dark:text-gray-400">Active Members</div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-6 text-center">
             <div className="text-3xl font-bold text-[#8B4513] mb-2">50+</div>
             <div className="text-sm text-gray-600 dark:text-gray-400">Events This Year</div>
           </CardContent>
         </Card>
       </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Join Our Community?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Become a member today and unlock unlimited access to our resources, events, and community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg" className="bg-[#8B4513] hover:bg-[#A0522D]">
                <UserPlus className="h-5 w-5 mr-2" />
                Apply for Membership
              </Button>
            </Link>
            <Link href="/learn-more/membership">
              <Button size="lg" variant="outline">
                Learn More About Membership
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
