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
  // Card customization
  cardBackground: string
  cardOpacity: number
  cardBorder: string
  // Text customization
  textPrimary: string
  textSecondary: string
  textMuted: string
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
            body.style.background = gradient
          } else if (settings.type === 'solid') {
            root.style.setProperty('--app-background', settings.primaryColor)
            body.style.background = settings.primaryColor
          } else if (settings.type === 'image' && settings.imageUrl) {
            const imageStyle = `url('${settings.imageUrl}') ${settings.repeat} ${settings.position} / ${settings.size}`
            root.style.setProperty('--app-background', imageStyle)
            body.style.background = imageStyle
          }

          // Apply opacity
          root.style.setProperty('--background-opacity', settings.opacity.toString())
          
          // Apply card customization
          root.style.setProperty('--card-background', settings.cardBackground || '#ffffff')
          root.style.setProperty('--card-opacity', (settings.cardOpacity || 0.9).toString())
          root.style.setProperty('--card-border', settings.cardBorder || '#e5e7eb')
          
          // Apply text customization - convert hex to HSL
          const hexToHsl = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16) / 255
            const g = parseInt(hex.slice(3, 5), 16) / 255
            const b = parseInt(hex.slice(5, 7), 16) / 255
            
            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            let h = 0, s = 0, l = (max + min) / 2
            
            if (max !== min) {
              const d = max - min
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
              switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break
                case g: h = (b - r) / d + 2; break
                case b: h = (r - g) / d + 4; break
              }
              h /= 6
            }
            
            return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
          }
          
          root.style.setProperty('--text-primary', hexToHsl(settings.textPrimary || '#1f2937'))
          root.style.setProperty('--text-secondary', hexToHsl(settings.textSecondary || '#4b5563'))
          root.style.setProperty('--text-muted', hexToHsl(settings.textMuted || '#6b7280'))
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
