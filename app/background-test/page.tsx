"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { BackgroundCustomizer } from "@/components/admin/background-customizer"
import { FlashCard } from "@/components/ui/flash-card"
import { 
  Home, 
  BookOpen, 
  Users, 
  Settings, 
  FileText, 
  Calendar,
  Image,
  Printer,
  Bell,
  Search
} from "lucide-react"

export default function BackgroundTestPage() {
  const [showCustomizer, setShowCustomizer] = useState(false)

  const testPages = [
    { name: "Homepage", path: "/", icon: Home, description: "Main landing page" },
    { name: "Catalog", path: "/catalog", icon: BookOpen, description: "Book catalog and search" },
    { name: "Members", path: "/members", icon: Users, description: "Member management" },
    { name: "Admin Dashboard", path: "/dashboard/admin", icon: Settings, description: "Admin control panel" },
    { name: "Member Dashboard", path: "/dashboard/member", icon: Users, description: "Member dashboard" },
    { name: "User Dashboard", path: "/dashboard/user", icon: Users, description: "User dashboard" },
    { name: "News & Events", path: "/news-events", icon: Calendar, description: "News and events" },
    { name: "Gallery", path: "/gallery", icon: Image, description: "Image gallery" },
    { name: "Printing Services", path: "/printing-services", icon: Printer, description: "Print services" },
    { name: "Research Assistance", path: "/research-assistance", icon: FileText, description: "Research help" },
    { name: "Study Spaces", path: "/study-spaces", icon: BookOpen, description: "Study room booking" },
    { name: "Digital Library", path: "/digital-library", icon: BookOpen, description: "Digital books" },
    { name: "Book Reservations", path: "/book-reservations", icon: BookOpen, description: "Reserve books" },
    { name: "Notifications", path: "/notifications", icon: Bell, description: "User notifications" },
    { name: "Search", path: "/search", icon: Search, description: "Global search" }
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
                  Global Background Test
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Test background customization across all pages and components
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

          {/* Test Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="card-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Regular Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  This is a regular card that should use the card-background class.
                </p>
              </CardContent>
            </Card>

            <Card className="flashcard-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Flash Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  This is a flash card with enhanced background effects.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Glass Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  This is a glass card with backdrop blur effects.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Flash Cards Demo */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Flash Cards with Custom Background
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FlashCard
                front="What is the background customization system?"
                back="A comprehensive system that allows admins to customize the background of the entire web app, including all pages, cards, and components."
                category="System"
                difficulty="easy"
              />
              <FlashCard
                front="How does the background apply to all pages?"
                back="Through CSS variables, global classes, and a background provider that applies settings on page load and navigation."
                category="Technical"
                difficulty="medium"
              />
            </div>
          </div>

          {/* Page Links */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Test All Pages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testPages.map((page, index) => {
                const Icon = page.icon
                return (
                  <Card key={index} className="card-background hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {page.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {page.description}
                          </p>
                        </div>
                      </div>
                      <Button 
                        asChild 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3"
                      >
                        <a href={page.path} target="_blank" rel="noopener noreferrer">
                          Visit Page
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Instructions */}
          <Card className="card-background">
            <CardHeader>
              <CardTitle>How to Test Global Background Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  1. Open Background Customizer
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Click the "Show Customizer" button above to open the background customization panel.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  2. Change Background Settings
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Select a different background type (gradient, solid, or image) and customize the colors or upload an image.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  3. Save Settings
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Click "Save Settings" to apply the changes globally across the entire web app.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  4. Test All Pages
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Use the "Visit Page" buttons above to navigate to different pages and verify that the background customization is applied consistently.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  5. Check Components
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Verify that cards, flash cards, glass elements, and all other components respect the background customization.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
