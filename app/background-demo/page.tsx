"use client"

import { FlashCard } from "@/components/ui/flash-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { BackgroundCustomizer } from "@/components/admin/background-customizer"
import { useState } from "react"
import { Settings, BookOpen, Users, Calendar } from "lucide-react"

export default function BackgroundDemoPage() {
  const [showCustomizer, setShowCustomizer] = useState(false)

  const sampleFlashCards = [
    {
      front: "What is the capital of France?",
      back: "Paris",
      category: "Geography",
      difficulty: "easy" as const
    },
    {
      front: "What is the chemical symbol for gold?",
      back: "Au",
      category: "Chemistry",
      difficulty: "medium" as const
    },
    {
      front: "Who wrote 'To Kill a Mockingbird'?",
      back: "Harper Lee",
      category: "Literature",
      difficulty: "medium" as const
    },
    {
      front: "What is the derivative of x²?",
      back: "2x",
      category: "Mathematics",
      difficulty: "hard" as const
    }
  ]

  return (
    <div className="min-h-screen app-background">
      <Header />
      
      <main className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Background Customization Demo
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  See how background changes apply to all components including flash cards
                </p>
              </div>
              <Button
                onClick={() => setShowCustomizer(!showCustomizer)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {showCustomizer ? "Hide" : "Show"} Customizer
              </Button>
            </div>
          </div>

          {/* Background Customizer */}
          {showCustomizer && (
            <div className="mb-8">
              <BackgroundCustomizer />
            </div>
          )}

          {/* Demo Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="card-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Library Books
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  This card demonstrates how the background customization affects regular cards throughout the app.
                </p>
              </CardContent>
            </Card>

            <Card className="card-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  All card components will automatically use the customized background with glass effects.
                </p>
              </CardContent>
            </Card>

            <Card className="card-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  The background changes apply consistently across all pages and components.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Flash Cards Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Flash Cards with Custom Background
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sampleFlashCards.map((card, index) => (
                <FlashCard
                  key={index}
                  front={card.front}
                  back={card.back}
                  category={card.category}
                  difficulty={card.difficulty}
                />
              ))}
            </div>
          </div>

          {/* Glass Effect Demo */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Glass Effect Components
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-background p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Glass Card 1
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This demonstrates the glass effect with backdrop blur.
                </p>
              </div>
              <div className="glass-background p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Glass Card 2
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All glass elements adapt to the background customization.
                </p>
              </div>
              <div className="glass-background p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Glass Card 3
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Perfect for overlays and floating elements.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <Card className="card-background">
            <CardHeader>
              <CardTitle>How to Use Background Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  1. Access the Customizer
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Click the "Show Customizer" button above to open the background customization panel.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  2. Choose Background Type
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Select from gradient, solid color, or background image options.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  3. Customize Colors
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Use the color pickers or choose from preset gradients to match your brand.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  4. Adjust Opacity
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Control the transparency of background elements for the perfect look.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  5. Save Settings
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Your changes will be applied immediately and saved for future visits.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
