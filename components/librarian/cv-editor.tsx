"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  FileText, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Eye,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Mail,
  Phone,
  MapPin,
  Globe,
  Printer,
  FileDown,
  Palette,
  Layout,
  Share2,
  Copy,
  Check
} from "lucide-react"

interface CVTemplate {
  id: string
  name: string
  description: string
  sections: CVSection[]
  styling: {
    fontFamily: string
    fontSize: string
    colorScheme: string
    layout: string
  }
}

interface CVSection {
  id: string
  type: 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'custom'
  title: string
  content: string
  order: number
}

interface CVData {
  personal: {
    fullName: string
    email: string
    phone: string
    address: string
    website: string
    linkedin: string
    summary: string
  }
  experience: Array<{
    id: string
    title: string
    company: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    id: string
    degree: string
    institution: string
    location: string
    startDate: string
    endDate: string
    gpa: string
    description: string
  }>
  skills: Array<{
    id: string
    category: string
    items: string[]
  }>
  projects: Array<{
    id: string
    title: string
    description: string
    technologies: string[]
    link: string
  }>
  certifications: Array<{
    id: string
    name: string
    issuer: string
    date: string
    credentialId: string
  }>
}

const defaultTemplates: CVTemplate[] = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean, modern design perfect for tech and business roles",
    sections: [
      { id: "personal", type: "personal", title: "Personal Information", content: "", order: 1 },
      { id: "summary", type: "custom", title: "Professional Summary", content: "", order: 2 },
      { id: "experience", type: "experience", title: "Work Experience", content: "", order: 3 },
      { id: "education", type: "education", title: "Education", content: "", order: 4 },
      { id: "skills", type: "skills", title: "Skills", content: "", order: 5 }
    ],
    styling: {
      fontFamily: "Inter",
      fontSize: "14px",
      colorScheme: "blue",
      layout: "single-column"
    }
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium design for senior leadership and executive positions",
    sections: [
      { id: "personal", type: "personal", title: "Executive Profile", content: "", order: 1 },
      { id: "summary", type: "custom", title: "Executive Summary", content: "", order: 2 },
      { id: "experience", type: "experience", title: "Leadership Experience", content: "", order: 3 },
      { id: "education", type: "education", title: "Education & Credentials", content: "", order: 4 },
      { id: "certifications", type: "certifications", title: "Professional Certifications", content: "", order: 5 },
      { id: "skills", type: "skills", title: "Core Competencies", content: "", order: 6 }
    ],
    styling: {
      fontFamily: "Playfair Display",
      fontSize: "13px",
      colorScheme: "gold",
      layout: "two-column"
    }
  },
  {
    id: "tech",
    name: "Tech Professional",
    description: "Modern design optimized for software engineers and tech roles",
    sections: [
      { id: "personal", type: "personal", title: "Contact", content: "", order: 1 },
      { id: "summary", type: "custom", title: "About", content: "", order: 2 },
      { id: "experience", type: "experience", title: "Experience", content: "", order: 3 },
      { id: "projects", type: "projects", title: "Projects", content: "", order: 4 },
      { id: "skills", type: "skills", title: "Technical Skills", content: "", order: 5 },
      { id: "education", type: "education", title: "Education", content: "", order: 6 }
    ],
    styling: {
      fontFamily: "JetBrains Mono",
      fontSize: "12px",
      colorScheme: "green",
      layout: "single-column"
    }
  },
  {
    id: "creative",
    name: "Creative Portfolio",
    description: "Eye-catching design for creative and design roles",
    sections: [
      { id: "personal", type: "personal", title: "About Me", content: "", order: 1 },
      { id: "experience", type: "experience", title: "Experience", content: "", order: 2 },
      { id: "projects", type: "projects", title: "Portfolio", content: "", order: 3 },
      { id: "skills", type: "skills", title: "Skills", content: "", order: 4 },
      { id: "education", type: "education", title: "Education", content: "", order: 5 }
    ],
    styling: {
      fontFamily: "Poppins",
      fontSize: "16px",
      colorScheme: "purple",
      layout: "two-column"
    }
  },
  {
    id: "academic",
    name: "Academic",
    description: "Traditional format ideal for academic and research positions",
    sections: [
      { id: "personal", type: "personal", title: "Contact Information", content: "", order: 1 },
      { id: "education", type: "education", title: "Education", content: "", order: 2 },
      { id: "experience", type: "experience", title: "Professional Experience", content: "", order: 3 },
      { id: "publications", type: "custom", title: "Publications", content: "", order: 4 },
      { id: "certifications", type: "certifications", title: "Certifications", content: "", order: 5 }
    ],
    styling: {
      fontFamily: "Times New Roman",
      fontSize: "12px",
      colorScheme: "black",
      layout: "single-column"
    }
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Ultra-clean design focusing on content over decoration",
    sections: [
      { id: "personal", type: "personal", title: "Contact", content: "", order: 1 },
      { id: "experience", type: "experience", title: "Experience", content: "", order: 2 },
      { id: "education", type: "education", title: "Education", content: "", order: 3 },
      { id: "skills", type: "skills", title: "Skills", content: "", order: 4 }
    ],
    styling: {
      fontFamily: "Helvetica",
      fontSize: "11px",
      colorScheme: "gray",
      layout: "single-column"
    }
  }
]

export function CVEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate>(defaultTemplates[0])
  const [cvData, setCvData] = useState<CVData>({
    personal: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      linkedin: "",
      summary: ""
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  })
  const [activeTab, setActiveTab] = useState("personal")
  const [previewMode, setPreviewMode] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [savedCvs, setSavedCvs] = useState<Array<{id: string, name: string, data: CVData, template: CVTemplate, createdAt: Date}>>([])
  const [showSavedCvs, setShowSavedCvs] = useState(false)
  const { toast } = useToast()

  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now().toString(),
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: ""
      }]
    }))
  }

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        degree: "",
        institution: "",
        location: "",
        startDate: "",
        endDate: "",
        gpa: "",
        description: ""
      }]
    }))
  }

  const addSkill = () => {
    setCvData(prev => ({
      ...prev,
      skills: [...prev.skills, {
        id: Date.now().toString(),
        category: "",
        items: []
      }]
    }))
  }

  const addProject = () => {
    setCvData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: Date.now().toString(),
        title: "",
        description: "",
        technologies: [],
        link: ""
      }]
    }))
  }

  const addCertification = () => {
    setCvData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        id: Date.now().toString(),
        name: "",
        issuer: "",
        date: "",
        credentialId: ""
      }]
    }))
  }

  const removeItem = (type: keyof CVData, id: string) => {
    setCvData(prev => ({
      ...prev,
      [type]: (prev[type] as any[]).filter((item: any) => item.id !== id)
    }))
  }

  const updateItem = (type: keyof CVData, id: string, field: string, value: any) => {
    setCvData(prev => ({
      ...prev,
      [type]: (prev[type] as any[]).map((item: any) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const generatePDF = async () => {
    setIsGeneratingPdf(true)
    try {
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast({ title: "Please allow popups to generate PDF", variant: "destructive" })
        return
      }

      // Generate HTML content for PDF
      const htmlContent = generateCVHTML()
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>CV - ${cvData.personal.fullName || 'Resume'}</title>
          <style>
            ${getCVStyles()}
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print</button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
          </div>
        </body>
        </html>
      `)
      
      printWindow.document.close()
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print()
      }, 500)
      
      toast({ title: "PDF generated successfully! Check the new window." })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({ title: "Error generating PDF", variant: "destructive" })
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const printCV = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({ title: "Please allow popups to print CV", variant: "destructive" })
      return
    }

    const htmlContent = generateCVHTML()
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CV - ${cvData.personal.fullName || 'Resume'}</title>
        <style>
          ${getCVStyles()}
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        </div>
      </body>
      </html>
    `)
    
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }

  const saveCV = () => {
    const cvName = prompt("Enter a name for this CV:")
    if (!cvName) return

    const newCV = {
      id: Date.now().toString(),
      name: cvName,
      data: cvData,
      template: selectedTemplate,
      createdAt: new Date()
    }

    setSavedCvs(prev => [newCV, ...prev])
    toast({ title: "CV saved successfully!" })
  }

  const loadSavedCV = (cv: any) => {
    setCvData(cv.data)
    setSelectedTemplate(cv.template)
    setShowSavedCvs(false)
    toast({ title: `Loaded CV: ${cv.name}` })
  }

  const deleteSavedCV = (id: string) => {
    setSavedCvs(prev => prev.filter(cv => cv.id !== id))
    toast({ title: "CV deleted successfully!" })
  }

  const copyToClipboard = async () => {
    try {
      const htmlContent = generateCVHTML()
      await navigator.clipboard.writeText(htmlContent)
      toast({ title: "CV content copied to clipboard!" })
    } catch (error) {
      toast({ title: "Failed to copy to clipboard", variant: "destructive" })
    }
  }

  const loadTemplate = (template: CVTemplate) => {
    setSelectedTemplate(template)
    toast({ title: `Loaded template: ${template.name}` })
  }

  const getCVStyles = () => {
    const { fontFamily, fontSize, colorScheme, layout } = selectedTemplate.styling
    
    const colorSchemes = {
      blue: { primary: '#3b82f6', secondary: '#1e40af', accent: '#dbeafe' },
      gold: { primary: '#f59e0b', secondary: '#d97706', accent: '#fef3c7' },
      green: { primary: '#10b981', secondary: '#059669', accent: '#d1fae5' },
      purple: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#ede9fe' },
      black: { primary: '#000000', secondary: '#374151', accent: '#f3f4f6' },
      gray: { primary: '#6b7280', secondary: '#4b5563', accent: '#f9fafb' }
    }
    
    const colors = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.blue
    
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: ${fontFamily}, sans-serif; 
        font-size: ${fontSize}; 
        line-height: 1.6; 
        color: #333; 
        max-width: 210mm; 
        margin: 0 auto; 
        padding: 20mm;
        background: white;
      }
      .cv-header { 
        text-align: center; 
        margin-bottom: 30px; 
        padding-bottom: 20px; 
        border-bottom: 3px solid ${colors.primary};
      }
      .cv-name { 
        font-size: 2.5em; 
        font-weight: bold; 
        color: ${colors.primary}; 
        margin-bottom: 10px;
      }
      .cv-contact { 
        color: ${colors.secondary}; 
        font-size: 1.1em;
      }
      .cv-section { 
        margin-bottom: 25px; 
      }
      .cv-section-title { 
        font-size: 1.4em; 
        font-weight: bold; 
        color: ${colors.primary}; 
        margin-bottom: 15px; 
        padding-bottom: 5px; 
        border-bottom: 2px solid ${colors.accent};
      }
      .cv-item { 
        margin-bottom: 15px; 
      }
      .cv-item-header { 
        font-weight: bold; 
        color: ${colors.secondary}; 
        margin-bottom: 5px;
      }
      .cv-item-meta { 
        color: #666; 
        font-style: italic; 
        margin-bottom: 8px;
      }
      .cv-item-description { 
        color: #555; 
        line-height: 1.5;
      }
      .cv-skills { 
        display: flex; 
        flex-wrap: wrap; 
        gap: 8px; 
      }
      .cv-skill { 
        background: ${colors.accent}; 
        color: ${colors.secondary}; 
        padding: 4px 12px; 
        border-radius: 15px; 
        font-size: 0.9em;
      }
      .cv-layout-two-column { 
        display: grid; 
        grid-template-columns: 1fr 2fr; 
        gap: 30px; 
      }
      .cv-layout-single-column { 
        display: block; 
      }
      @media print {
        body { margin: 0; padding: 15mm; }
        .cv-section { page-break-inside: avoid; }
      }
    `
  }

  const generateCVHTML = () => {
    const { layout } = selectedTemplate.styling
    const isTwoColumn = layout === 'two-column'
    
    return `
      <div class="cv-layout-${layout}">
        <div class="cv-header">
          <div class="cv-name">${cvData.personal.fullName || 'Your Name'}</div>
          <div class="cv-contact">
            ${cvData.personal.email ? `<span>${cvData.personal.email}</span>` : ''}
            ${cvData.personal.phone ? `<span> • ${cvData.personal.phone}</span>` : ''}
            ${cvData.personal.address ? `<span> • ${cvData.personal.address}</span>` : ''}
            ${cvData.personal.website ? `<span> • ${cvData.personal.website}</span>` : ''}
            ${cvData.personal.linkedin ? `<span> • ${cvData.personal.linkedin}</span>` : ''}
          </div>
        </div>

        ${cvData.personal.summary ? `
          <div class="cv-section">
            <div class="cv-section-title">Professional Summary</div>
            <div class="cv-item-description">${cvData.personal.summary}</div>
          </div>
        ` : ''}

        ${cvData.experience.length > 0 ? `
          <div class="cv-section">
            <div class="cv-section-title">Work Experience</div>
            ${cvData.experience.map(exp => `
              <div class="cv-item">
                <div class="cv-item-header">${exp.title} at ${exp.company}</div>
                <div class="cv-item-meta">${exp.location} • ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                <div class="cv-item-description">${exp.description}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${cvData.education.length > 0 ? `
          <div class="cv-section">
            <div class="cv-section-title">Education</div>
            ${cvData.education.map(edu => `
              <div class="cv-item">
                <div class="cv-item-header">${edu.degree}</div>
                <div class="cv-item-meta">${edu.institution}, ${edu.location} • ${edu.startDate} - ${edu.endDate}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
                ${edu.description ? `<div class="cv-item-description">${edu.description}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${cvData.skills.length > 0 ? `
          <div class="cv-section">
            <div class="cv-section-title">Skills</div>
            ${cvData.skills.map(skill => `
              <div class="cv-item">
                <div class="cv-item-header">${skill.category}</div>
                <div class="cv-skills">
                  ${skill.items.map(item => `<span class="cv-skill">${item}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${cvData.projects.length > 0 ? `
          <div class="cv-section">
            <div class="cv-section-title">Projects</div>
            ${cvData.projects.map(project => `
              <div class="cv-item">
                <div class="cv-item-header">${project.title}</div>
                <div class="cv-item-description">${project.description}</div>
                ${project.technologies.length > 0 ? `
                  <div class="cv-skills" style="margin-top: 8px;">
                    ${project.technologies.map(tech => `<span class="cv-skill">${tech}</span>`).join('')}
                  </div>
                ` : ''}
                ${project.link ? `<div style="margin-top: 5px;"><a href="${project.link}" target="_blank">View Project</a></div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${cvData.certifications.length > 0 ? `
          <div class="cv-section">
            <div class="cv-section-title">Certifications</div>
            ${cvData.certifications.map(cert => `
              <div class="cv-item">
                <div class="cv-item-header">${cert.name}</div>
                <div class="cv-item-meta">${cert.issuer} • ${cert.date}${cert.credentialId ? ` • ID: ${cert.credentialId}` : ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>CV Editor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Template Selection */}
            <div>
              <Label>Choose Template</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {defaultTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate.id === template.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => loadTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setPreviewMode(!previewMode)} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button onClick={saveCV} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save CV
              </Button>
              <Button onClick={() => setShowSavedCvs(!showSavedCvs)} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Load Saved
              </Button>
              <Button onClick={generatePDF} disabled={isGeneratingPdf} className="bg-blue-600 hover:bg-blue-700">
                <FileDown className="h-4 w-4 mr-2" />
                {isGeneratingPdf ? 'Generating...' : 'Generate PDF'}
              </Button>
              <Button onClick={printCV} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy HTML
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved CVs Section */}
      {showSavedCvs && (
        <Card>
          <CardHeader>
            <CardTitle>Saved CVs</CardTitle>
          </CardHeader>
          <CardContent>
            {savedCvs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No saved CVs yet. Create and save your first CV!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedCvs.map((cv) => (
                  <Card key={cv.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{cv.name}</h3>
                        <Button
                          onClick={() => deleteSavedCV(cv.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Template: {cv.template.name}</p>
                      <p className="text-xs text-gray-500 mb-3">
                        Created: {cv.createdAt.toLocaleDateString()}
                      </p>
                      <Button
                        onClick={() => loadSavedCV(cv)}
                        size="sm"
                        className="w-full"
                      >
                        Load CV
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!previewMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit CV Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="certifications">Certifications</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={cvData.personal.fullName}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personal: { ...prev.personal, fullName: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={cvData.personal.email}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personal: { ...prev.personal, email: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={cvData.personal.phone}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personal: { ...prev.personal, phone: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={cvData.personal.address}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personal: { ...prev.personal, address: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={cvData.personal.website}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personal: { ...prev.personal, website: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={cvData.personal.linkedin}
                      onChange={(e) => setCvData(prev => ({
                        ...prev,
                        personal: { ...prev.personal, linkedin: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    rows={4}
                    value={cvData.personal.summary}
                    onChange={(e) => setCvData(prev => ({
                      ...prev,
                      personal: { ...prev.personal, summary: e.target.value }
                    }))}
                    placeholder="Write a brief summary of your professional background..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Work Experience</h3>
                  <Button onClick={addExperience} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
                {cvData.experience.map((exp, index) => (
                  <Card key={exp.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">Experience #{index + 1}</h4>
                        <Button
                          onClick={() => removeItem('experience', exp.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Job Title</Label>
                          <Input
                            value={exp.title}
                            onChange={(e) => updateItem('experience', exp.id, 'title', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Company</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={exp.location}
                            onChange={(e) => updateItem('experience', exp.id, 'location', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={exp.startDate}
                            onChange={(e) => updateItem('experience', exp.id, 'startDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={exp.endDate}
                            onChange={(e) => updateItem('experience', exp.id, 'endDate', e.target.value)}
                            disabled={exp.current}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`current-${exp.id}`}
                            checked={exp.current}
                            onChange={(e) => updateItem('experience', exp.id, 'current', e.target.checked)}
                          />
                          <Label htmlFor={`current-${exp.id}`}>Currently working here</Label>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label>Description</Label>
                        <Textarea
                          rows={3}
                          value={exp.description}
                          onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="education" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Education</h3>
                  <Button onClick={addEducation} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
                {cvData.education.map((edu, index) => (
                  <Card key={edu.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">Education #{index + 1}</h4>
                        <Button
                          onClick={() => removeItem('education', edu.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Institution</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateItem('education', edu.id, 'institution', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={edu.location}
                            onChange={(e) => updateItem('education', edu.id, 'location', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>GPA</Label>
                          <Input
                            value={edu.gpa}
                            onChange={(e) => updateItem('education', edu.id, 'gpa', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={edu.startDate}
                            onChange={(e) => updateItem('education', edu.id, 'startDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={edu.endDate}
                            onChange={(e) => updateItem('education', edu.id, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label>Description</Label>
                        <Textarea
                          rows={2}
                          value={edu.description}
                          onChange={(e) => updateItem('education', edu.id, 'description', e.target.value)}
                          placeholder="Additional details about your education..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Skills</h3>
                  <Button onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill Category
                  </Button>
                </div>
                {cvData.skills.map((skill, index) => (
                  <Card key={skill.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">Skill Category #{index + 1}</h4>
                        <Button
                          onClick={() => removeItem('skills', skill.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>Category Name</Label>
                          <Input
                            value={skill.category}
                            onChange={(e) => updateItem('skills', skill.id, 'category', e.target.value)}
                            placeholder="e.g., Programming Languages, Tools, etc."
                          />
                        </div>
                        <div>
                          <Label>Skills (comma-separated)</Label>
                          <Input
                            value={skill.items.join(', ')}
                            onChange={(e) => updateItem('skills', skill.id, 'items', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="e.g., JavaScript, Python, React, Node.js"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Projects</h3>
                  <Button onClick={addProject} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </div>
                {cvData.projects.map((project, index) => (
                  <Card key={project.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">Project #{index + 1}</h4>
                        <Button
                          onClick={() => removeItem('projects', project.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>Project Title</Label>
                          <Input
                            value={project.title}
                            onChange={(e) => updateItem('projects', project.id, 'title', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            rows={3}
                            value={project.description}
                            onChange={(e) => updateItem('projects', project.id, 'description', e.target.value)}
                            placeholder="Describe the project, your role, and key achievements..."
                          />
                        </div>
                        <div>
                          <Label>Technologies Used (comma-separated)</Label>
                          <Input
                            value={project.technologies.join(', ')}
                            onChange={(e) => updateItem('projects', project.id, 'technologies', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="e.g., React, Node.js, MongoDB, AWS"
                          />
                        </div>
                        <div>
                          <Label>Project Link</Label>
                          <Input
                            value={project.link}
                            onChange={(e) => updateItem('projects', project.id, 'link', e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="certifications" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Certifications</h3>
                  <Button onClick={addCertification} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                </div>
                {cvData.certifications.map((cert, index) => (
                  <Card key={cert.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold">Certification #{index + 1}</h4>
                        <Button
                          onClick={() => removeItem('certifications', cert.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Certification Name</Label>
                          <Input
                            value={cert.name}
                            onChange={(e) => updateItem('certifications', cert.id, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Issuing Organization</Label>
                          <Input
                            value={cert.issuer}
                            onChange={(e) => updateItem('certifications', cert.id, 'issuer', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Date Obtained</Label>
                          <Input
                            type="date"
                            value={cert.date}
                            onChange={(e) => updateItem('certifications', cert.id, 'date', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Credential ID (Optional)</Label>
                          <Input
                            value={cert.credentialId}
                            onChange={(e) => updateItem('certifications', cert.id, 'credentialId', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>CV Preview - {selectedTemplate.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="bg-white p-8 shadow-lg max-w-4xl mx-auto"
              style={{ 
                fontFamily: selectedTemplate.styling.fontFamily,
                fontSize: selectedTemplate.styling.fontSize 
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: generateCVHTML() }} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
