"use client"

import { useEffect } from "react"

interface BackgroundSettings {
  type: 'gradient' | 'solid' | 'image'
  primaryColor: string
  secondaryColor: string
  imageUrl?: string
  opacity: number
  position: string
  size: string
  repeat: string
}

export function BackgroundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load saved background settings and apply them
    const applySavedBackground = () => {
      try {
        const savedSettings = localStorage.getItem('background-settings')
        if (savedSettings) {
          const settings: BackgroundSettings = JSON.parse(savedSettings)
          const root = document.documentElement
          const body = document.body

          if (settings.type === 'gradient') {
            const gradient = `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)`
            root.style.setProperty('--app-background', gradient)
            root.style.setProperty('--card-background', `rgba(255, 255, 255, ${settings.opacity * 0.9})`)
            root.style.setProperty('--flashcard-background', `rgba(255, 255, 255, ${settings.opacity * 0.95})`)
            body.style.background = gradient
          } else if (settings.type === 'solid') {
            root.style.setProperty('--app-background', settings.primaryColor)
            root.style.setProperty('--card-background', `rgba(255, 255, 255, ${settings.opacity * 0.9})`)
            root.style.setProperty('--flashcard-background', `rgba(255, 255, 255, ${settings.opacity * 0.95})`)
            body.style.background = settings.primaryColor
          } else if (settings.type === 'image' && settings.imageUrl) {
            const imageStyle = `url('${settings.imageUrl}') ${settings.repeat} ${settings.position} / ${settings.size}`
            root.style.setProperty('--app-background', imageStyle)
            root.style.setProperty('--card-background', `rgba(255, 255, 255, ${settings.opacity * 0.9})`)
            root.style.setProperty('--flashcard-background', `rgba(255, 255, 255, ${settings.opacity * 0.95})`)
            body.style.background = imageStyle
          }

          // Apply opacity
          root.style.setProperty('--background-opacity', settings.opacity.toString())
        }
      } catch (error) {
        console.error('Error applying saved background settings:', error)
      }
    }

    // Apply immediately
    applySavedBackground()

    // Also apply when the page becomes visible (for navigation)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        applySavedBackground()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return <>{children}</>
}
