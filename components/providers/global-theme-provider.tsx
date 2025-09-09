"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface Theme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

interface GlobalThemeContextType {
  theme: Theme | null
  isLoading: boolean
  error: string | null
}

const GlobalThemeContext = createContext<GlobalThemeContextType>({
  theme: null,
  isLoading: true,
  error: null
})

export function GlobalThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGlobalTheme = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/theme')
        if (response.ok) {
          const data = await response.json()
          setTheme(data.theme)
          applyTheme(data.theme)
        } else {
          setError('Failed to fetch global theme')
        }
      } catch (err) {
        console.error('Error fetching global theme:', err)
        setError('Failed to fetch global theme')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGlobalTheme()
  }, [])

  const applyTheme = (themeData: Theme) => {
    if (!themeData) return

    // Apply theme to CSS custom properties
    const root = document.documentElement
    root.style.setProperty("--primary-color", themeData.primary)
    root.style.setProperty("--secondary-color", themeData.secondary)
    root.style.setProperty("--accent-color", themeData.accent)
    root.style.setProperty("--background-color", themeData.background)
    root.style.setProperty("--text-color", themeData.text)
  }

  return (
    <GlobalThemeContext.Provider value={{ theme, isLoading, error }}>
      {children}
    </GlobalThemeContext.Provider>
  )
}

export const useGlobalTheme = () => {
  const context = useContext(GlobalThemeContext)
  if (context === undefined) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider')
  }
  return context
}
