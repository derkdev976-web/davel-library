"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Calendar, MessageCircle, Search, Shield } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Extensive Catalog",
    description: "Access thousands of books, e-books, and digital resources",
    color: "text-[#8B4513]",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with fellow readers and join book discussions",
    color: "text-[#A0522D]",
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Attend book clubs, author talks, and literary events",
    color: "text-[#D2691E]",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Real-time discussions with the community",
    color: "text-[#8B4513]",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find books quickly with our advanced search system",
    color: "text-[#A0522D]",
  },
  {
    icon: Shield,
    title: "Secure",
    description: "Your data is protected with enterprise-grade security",
    color: "text-[#D2691E]",
  },
]

export function FeatureCards() {
  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">Why Choose Davel Library?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the perfect blend of traditional library services with modern technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card hover:shadow-xl transition-all duration-300 group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/20">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <feature.icon
                      className={`h-12 w-12 mx-auto ${feature.color} dark:text-[#d2691e] group-hover:scale-110 transition-transform duration-300`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
