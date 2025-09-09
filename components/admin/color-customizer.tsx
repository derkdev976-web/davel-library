"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Palette, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ColorTheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  preview: string
}

const colorThemes: ColorTheme[] = [
  {
    id: "royal-indigo",
    name: "Royal Indigo",
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#06b6d4",
    background: "#0f172a",
    text: "#f8fafc",
    preview: "bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]"
  },
  {
    id: "midnight-emerald",
    name: "Midnight Emerald",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    background: "#064e3b",
    text: "#ecfdf5",
    preview: "bg-gradient-to-br from-[#10b981] to-[#059669]"
  },
  {
    id: "cosmic-purple",
    name: "Cosmic Purple",
    primary: "#8b5cf6",
    secondary: "#a855f7",
    accent: "#c084fc",
    background: "#1e1b4b",
    text: "#f3f4f6",
    preview: "bg-gradient-to-br from-[#8b5cf6] to-[#a855f7]"
  },
  {
    id: "obsidian-gold",
    name: "Obsidian Gold",
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "#fbbf24",
    background: "#1c1917",
    text: "#fef3c7",
    preview: "bg-gradient-to-br from-[#f59e0b] to-[#d97706]"
  },
  {
    id: "crimson-steel",
    name: "Crimson Steel",
    primary: "#dc2626",
    secondary: "#b91c1c",
    accent: "#ef4444",
    background: "#1f2937",
    text: "#f9fafb",
    preview: "bg-gradient-to-br from-[#dc2626] to-[#b91c1c]"
  },
  {
    id: "arctic-blue",
    name: "Arctic Blue",
    primary: "#0ea5e9",
    secondary: "#0284c7",
    accent: "#38bdf8",
    background: "#0c4a6e",
    text: "#e0f2fe",
    preview: "bg-gradient-to-br from-[#0ea5e9] to-[#0284c7]"
  },
  {
    id: "mahogany-brown",
    name: "Mahogany Brown",
    primary: "#8B4513",
    secondary: "#800020",
    accent: "#CD853F",
    background: "#2D1810",
    text: "#F5F5DC",
    preview: "bg-gradient-to-br from-[#8B4513] to-[#800020]"
  }
]

export function ColorCustomizer() {
  const [selectedTheme, setSelectedTheme] = useState<string>("mahogany-brown")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load current global theme
    const fetchCurrentTheme = async () => {
      try {
        const response = await fetch('/api/admin/theme')
        if (response.ok) {
          const data = await response.json()
          setSelectedTheme(data.theme?.id || "mahogany-brown")
        }
      } catch (error) {
        console.error('Error fetching current theme:', error)
      }
    }

    fetchCurrentTheme()
  }, [])

  const applyTheme = (themeId: string) => {
    const theme = colorThemes.find(t => t.id === themeId)
    if (!theme) return

    // Apply theme to CSS custom properties
    const root = document.documentElement
    root.style.setProperty("--primary-color", theme.primary)
    root.style.setProperty("--secondary-color", theme.secondary)
    root.style.setProperty("--accent-color", theme.accent)
    root.style.setProperty("--background-color", theme.background)
    root.style.setProperty("--text-color", theme.text)
  }

  const handleThemeChange = async (themeId: string) => {
    setIsLoading(true)
    setSelectedTheme(themeId)
    
    const theme = colorThemes.find(t => t.id === themeId)
    if (!theme) {
      setIsLoading(false)
      return
    }

    // Apply theme locally first
    applyTheme(themeId)
    
    try {
      // Save to global theme API
      const response = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme })
      })

      if (response.ok) {
        toast({ 
          title: "Theme Updated", 
          description: `Global theme changed to ${theme.name}. All users will see this theme.` 
        })
      } else {
        throw new Error('Failed to save theme')
      }
    } catch (error) {
      console.error('Error saving theme:', error)
      toast({ 
        title: "Error", 
        description: "Failed to save global theme. Please try again.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Palette className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Global Color Theme Customization</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colorThemes.map((theme) => (
          <Card 
            key={theme.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedTheme === theme.id 
                ? "ring-2 ring-blue-500 ring-offset-2" 
                : "hover:ring-1 hover:ring-gray-300"
            }`}
            onClick={() => handleThemeChange(theme.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{theme.name}</CardTitle>
                {selectedTheme === theme.id && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`h-16 rounded-lg ${theme.preview} flex items-center justify-center`}>
                <span className="text-white font-medium text-sm">Preview</span>
              </div>
              
              <div className="grid grid-cols-5 gap-1">
                <div 
                  className="h-6 rounded border"
                  style={{ backgroundColor: theme.primary }}
                  title="Primary"
                />
                <div 
                  className="h-6 rounded border"
                  style={{ backgroundColor: theme.secondary }}
                  title="Secondary"
                />
                <div 
                  className="h-6 rounded border"
                  style={{ backgroundColor: theme.accent }}
                  title="Accent"
                />
                <div 
                  className="h-6 rounded border"
                  style={{ backgroundColor: theme.background }}
                  title="Background"
                />
                <div 
                  className="h-6 rounded border"
                  style={{ backgroundColor: theme.text }}
                  title="Text"
                />
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <div>Primary: {theme.primary}</div>
                <div>Secondary: {theme.secondary}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Updating global theme...</p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Global Theme Information</h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Choose from 7 beautiful color themes to customize the appearance of your library website. 
          The selected theme will be applied globally to ALL users and visitors.
        </p>
      </div>
    </div>
  )
}
