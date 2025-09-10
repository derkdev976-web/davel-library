"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  Palette, 
  Image, 
  Upload, 
  Save, 
  RotateCcw, 
  Eye,
  Download,
  Trash2
} from "lucide-react"

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

const defaultSettings: BackgroundSettings = {
  type: 'gradient',
  primaryColor: '#8B4513',
  secondaryColor: '#800020',
  opacity: 1,
  position: 'center',
  size: 'cover',
  repeat: 'no-repeat',
  // Card customization defaults
  cardBackground: '#ffffff',
  cardOpacity: 0.9,
  cardBorder: '#e5e7eb',
  // Text customization defaults
  textPrimary: '#1f2937',
  textSecondary: '#4b5563',
  textMuted: '#6b7280'
}

const presetGradients = [
  { name: 'Library Brown', primary: '#8B4513', secondary: '#800020' },
  { name: 'Ocean Blue', primary: '#1e40af', secondary: '#0ea5e9' },
  { name: 'Forest Green', primary: '#166534', secondary: '#22c55e' },
  { name: 'Sunset Orange', primary: '#ea580c', secondary: '#f97316' },
  { name: 'Royal Purple', primary: '#7c3aed', secondary: '#a855f7' },
  { name: 'Midnight Dark', primary: '#1f2937', secondary: '#374151' }
]

const presetCardThemes = [
  { 
    name: 'Classic White', 
    cardBackground: '#ffffff', 
    cardBorder: '#e5e7eb',
    textPrimary: '#1f2937',
    textSecondary: '#4b5563',
    textMuted: '#6b7280'
  },
  { 
    name: 'Warm Cream', 
    cardBackground: '#fef7ed', 
    cardBorder: '#fed7aa',
    textPrimary: '#92400e',
    textSecondary: '#a16207',
    textMuted: '#ca8a04'
  },
  { 
    name: 'Cool Blue', 
    cardBackground: '#eff6ff', 
    cardBorder: '#bfdbfe',
    textPrimary: '#1e40af',
    textSecondary: '#2563eb',
    textMuted: '#3b82f6'
  },
  { 
    name: 'Soft Gray', 
    cardBackground: '#f9fafb', 
    cardBorder: '#d1d5db',
    textPrimary: '#374151',
    textSecondary: '#4b5563',
    textMuted: '#6b7280'
  },
  { 
    name: 'Dark Theme', 
    cardBackground: '#1f2937', 
    cardBorder: '#374151',
    textPrimary: '#f9fafb',
    textSecondary: '#d1d5db',
    textMuted: '#9ca3af'
  }
]

export function BackgroundCustomizer() {
  const [settings, setSettings] = useState<BackgroundSettings>(defaultSettings)
  const [previewMode, setPreviewMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('background-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const applyBackground = useCallback(() => {
    const root = document.documentElement
    const body = document.body

    if (settings.type === 'gradient') {
      const gradient = `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)`
      root.style.setProperty('--background-gradient', gradient)
      root.style.setProperty('--app-background', gradient)
      root.style.setProperty('--card-background', `rgba(255, 255, 255, ${settings.opacity * 0.9})`)
      root.style.setProperty('--flashcard-background', `rgba(255, 255, 255, ${settings.opacity * 0.95})`)
      body.style.background = gradient
    } else if (settings.type === 'solid') {
      root.style.setProperty('--background-solid', settings.primaryColor)
      root.style.setProperty('--app-background', settings.primaryColor)
      root.style.setProperty('--card-background', `rgba(255, 255, 255, ${settings.opacity * 0.9})`)
      root.style.setProperty('--flashcard-background', `rgba(255, 255, 255, ${settings.opacity * 0.95})`)
      body.style.background = settings.primaryColor
    } else if (settings.type === 'image' && settings.imageUrl) {
      const imageStyle = `
        url('${settings.imageUrl}') ${settings.repeat} ${settings.position} / ${settings.size}
      `
      root.style.setProperty('--background-image', imageStyle)
      root.style.setProperty('--app-background', imageStyle)
      root.style.setProperty('--card-background', `rgba(255, 255, 255, ${settings.opacity * 0.9})`)
      root.style.setProperty('--flashcard-background', `rgba(255, 255, 255, ${settings.opacity * 0.95})`)
      body.style.background = imageStyle
    }

    // Apply opacity to all background elements
    root.style.setProperty('--background-opacity', settings.opacity.toString())
    
    // Apply card customization
    root.style.setProperty('--card-background', settings.cardBackground)
    root.style.setProperty('--card-opacity', settings.cardOpacity.toString())
    root.style.setProperty('--card-border', settings.cardBorder)
    
    // Apply text customization
    root.style.setProperty('--text-primary', settings.textPrimary)
    root.style.setProperty('--text-secondary', settings.textSecondary)
    root.style.setProperty('--text-muted', settings.textMuted)
    
    // Apply to all elements that might have background overrides
    const allElements = document.querySelectorAll('*')
    allElements.forEach(element => {
      const htmlElement = element as HTMLElement
      const classList = htmlElement.className || ''
      
      // Skip elements that should keep their custom backgrounds
      if (classList.includes('card-background') || 
          classList.includes('flashcard-background') || 
          classList.includes('glass-background') ||
          classList.includes('bg-gradient-to-') ||
          classList.includes('bg-') && !classList.includes('bg-white') && !classList.includes('bg-gray')) {
        return
      }
      
      // Apply background to main containers and pages
      if (element.tagName === 'MAIN' || 
          element.tagName === 'BODY' || 
          element.tagName === 'HTML' ||
          classList.includes('page') ||
          classList.includes('container') ||
          classList.includes('wrapper')) {
        if (settings.type === 'gradient') {
          htmlElement.style.background = `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)`
        } else if (settings.type === 'solid') {
          htmlElement.style.background = settings.primaryColor
        } else if (settings.type === 'image' && settings.imageUrl) {
          htmlElement.style.background = `url('${settings.imageUrl}') ${settings.repeat} ${settings.position} / ${settings.size}`
        }
      }
    })
  }, [settings])

  const saveSettings = async () => {
    setLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem('background-settings', JSON.stringify(settings))
      
      // Apply immediately
      applyBackground()
      
      toast({ title: "Background settings saved successfully!" })
    } catch (error) {
      console.error("Error saving background settings:", error)
      toast({ title: "Failed to save settings", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('background-settings')
    applyBackground()
    toast({ title: "Background settings reset to default" })
  }

  const handlePresetSelect = (preset: typeof presetGradients[0]) => {
    setSettings(prev => ({
      ...prev,
      type: 'gradient',
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // For demo purposes, we'll use a data URL
    // In production, you'd upload to Cloudinary
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setSettings(prev => ({
        ...prev,
        type: 'image',
        imageUrl
      }))
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (previewMode) {
      applyBackground()
    }
  }, [settings, previewMode, applyBackground])

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Background Customization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Background Type */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Background Type</Label>
            <Select value={settings.type} onValueChange={(value: any) => setSettings(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="solid">Solid Color</SelectItem>
                <SelectItem value="image">Background Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preset Gradients */}
          {settings.type === 'gradient' && (
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preset Gradients</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {presetGradients.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetSelect(preset)}
                    className="h-12 flex items-center justify-center space-x-2"
                    style={{
                      background: `linear-gradient(135deg, ${preset.primary} 0%, ${preset.secondary} 100%)`,
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    <span className="text-sm font-medium">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Color Pickers */}
          {settings.type === 'gradient' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Color</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1"
                    placeholder="#8B4513"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Color</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1"
                    placeholder="#800020"
                  />
                </div>
              </div>
            </div>
          )}

          {settings.type === 'solid' && (
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Solid Color</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-12 h-10 p-1 border rounded"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1"
                  placeholder="#8B4513"
                />
              </div>
            </div>
          )}

          {/* Image Upload */}
          {settings.type === 'image' && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Background Image</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mb-2"
                  />
                  {settings.imageUrl && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={settings.imageUrl}
                        alt="Background preview"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Position</Label>
                  <Select value={settings.position} onValueChange={(value) => setSettings(prev => ({ ...prev, position: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Size</Label>
                  <Select value={settings.size} onValueChange={(value) => setSettings(prev => ({ ...prev, size: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="100% 100%">Stretch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Opacity */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Opacity: {Math.round(settings.opacity * 100)}%
            </Label>
            <Input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={settings.opacity}
              onChange={(e) => setSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
              className="mt-2"
            />
          </div>
          {/* Preview */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</Label>
            <div className="mt-2 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 relative overflow-hidden"
                 style={{
                   background: settings.type === 'gradient' 
                     ? `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)`
                     : settings.type === 'solid'
                     ? settings.primaryColor
                     : settings.imageUrl
                     ? `url('${settings.imageUrl}') ${settings.repeat} ${settings.position} / ${settings.size}`
                     : '#f3f4f6',
                   opacity: settings.opacity
                 }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Background Preview</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={saveSettings} disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
            <Button variant="outline" onClick={resetSettings}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button 
              variant={previewMode ? "default" : "outline"} 
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Exit Preview' : 'Preview'}
            </Button>
          </div>

          {previewMode && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Preview Mode:</strong> Background changes are applied in real-time. 
                Click &quot;Save Settings&quot; to make them permanent.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Customization */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Card Customization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preset Card Themes */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preset Card Themes</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {presetCardThemes.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setSettings(prev => ({ 
                    ...prev, 
                    cardBackground: preset.cardBackground,
                    cardBorder: preset.cardBorder,
                    textPrimary: preset.textPrimary,
                    textSecondary: preset.textSecondary,
                    textMuted: preset.textMuted
                  }))}
                  className="h-12 flex items-center justify-center space-x-2"
                  style={{
                    background: preset.cardBackground,
                    color: preset.textPrimary,
                    borderColor: preset.cardBorder
                  }}
                >
                  <span className="text-sm font-medium">{preset.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Card Background Color */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Card Background</Label>
            <div className="flex items-center gap-3 mt-2">
              <Input
                type="color"
                value={settings.cardBackground}
                onChange={(e) => setSettings(prev => ({ ...prev, cardBackground: e.target.value }))}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={settings.cardBackground}
                onChange={(e) => setSettings(prev => ({ ...prev, cardBackground: e.target.value }))}
                className="flex-1"
                placeholder="#ffffff"
              />
            </div>
          </div>

          {/* Card Opacity */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Card Opacity: {Math.round(settings.cardOpacity * 100)}%
            </Label>
            <Input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={settings.cardOpacity}
              onChange={(e) => setSettings(prev => ({ ...prev, cardOpacity: parseFloat(e.target.value) }))}
              className="mt-2"
            />
          </div>

          {/* Card Border Color */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Card Border</Label>
            <div className="flex items-center gap-3 mt-2">
              <Input
                type="color"
                value={settings.cardBorder}
                onChange={(e) => setSettings(prev => ({ ...prev, cardBorder: e.target.value }))}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={settings.cardBorder}
                onChange={(e) => setSettings(prev => ({ ...prev, cardBorder: e.target.value }))}
                className="flex-1"
                placeholder="#e5e7eb"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Customization */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Text Customization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Text Color */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Text (Headings)</Label>
            <div className="flex items-center gap-3 mt-2">
              <Input
                type="color"
                value={settings.textPrimary}
                onChange={(e) => setSettings(prev => ({ ...prev, textPrimary: e.target.value }))}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={settings.textPrimary}
                onChange={(e) => setSettings(prev => ({ ...prev, textPrimary: e.target.value }))}
                className="flex-1"
                placeholder="#1f2937"
              />
            </div>
          </div>

          {/* Secondary Text Color */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Text (Body)</Label>
            <div className="flex items-center gap-3 mt-2">
              <Input
                type="color"
                value={settings.textSecondary}
                onChange={(e) => setSettings(prev => ({ ...prev, textSecondary: e.target.value }))}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={settings.textSecondary}
                onChange={(e) => setSettings(prev => ({ ...prev, textSecondary: e.target.value }))}
                className="flex-1"
                placeholder="#4b5563"
              />
            </div>
          </div>

          {/* Muted Text Color */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Muted Text (Subtitles)</Label>
            <div className="flex items-center gap-3 mt-2">
              <Input
                type="color"
                value={settings.textMuted}
                onChange={(e) => setSettings(prev => ({ ...prev, textMuted: e.target.value }))}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={settings.textMuted}
                onChange={(e) => setSettings(prev => ({ ...prev, textMuted: e.target.value }))}
                className="flex-1"
                placeholder="#6b7280"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
