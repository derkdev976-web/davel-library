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
  Globe
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
    id: "creative",
    name: "Creative",
    description: "Eye-catching design for creative and design roles",
    sections: [
      { id: "personal", type: "personal", title: "About Me", content: "", order: 1 },
      { id: "experience", type: "experience", title: "Experience", content: "", order: 2 },
      { id: "projects", type: "projects", title: "Projects", content: "", order: 3 },
      { id: "skills", type: "skills", title: "Skills", content: "", order: 4 },
      { id: "education", type: "education", title: "Education", content: "", order: 5 }
    ],
    styling: {
      fontFamily: "Poppins",
      fontSize: "16px",
      colorScheme: "purple",
      layout: "two-column"
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

  const generateCV = () => {
    // This would generate a PDF or HTML version of the CV
    toast({ title: "CV generated successfully!" })
  }

  const saveTemplate = () => {
    // Save the current template
    toast({ title: "Template saved successfully!" })
  }

  const loadTemplate = (template: CVTemplate) => {
    setSelectedTemplate(template)
    toast({ title: `Loaded template: ${template.name}` })
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
            <div className="flex space-x-2">
              <Button onClick={() => setPreviewMode(!previewMode)} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button onClick={saveTemplate} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
              <Button onClick={generateCV} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Generate CV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <CardTitle>CV Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-8 shadow-lg">
              {/* CV Preview Content */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{cvData.personal.fullName || "Your Name"}</h1>
                <div className="flex justify-center space-x-4 text-gray-600 mt-2">
                  {cvData.personal.email && <span>{cvData.personal.email}</span>}
                  {cvData.personal.phone && <span>{cvData.personal.phone}</span>}
                  {cvData.personal.address && <span>{cvData.personal.address}</span>}
                </div>
              </div>

              {cvData.personal.summary && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Professional Summary</h2>
                  <p className="text-gray-700">{cvData.personal.summary}</p>
                </div>
              )}

              {cvData.experience.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
                  {cvData.experience.map((exp) => (
                    <div key={exp.id} className="mb-4">
                      <h3 className="font-semibold">{exp.title} at {exp.company}</h3>
                      <p className="text-gray-600">{exp.location} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                      <p className="text-gray-700 mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {cvData.education.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Education</h2>
                  {cvData.education.map((edu) => (
                    <div key={edu.id} className="mb-4">
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}, {edu.location}</p>
                      <p className="text-gray-600">{edu.startDate} - {edu.endDate}</p>
                      {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                      {edu.description && <p className="text-gray-700 mt-2">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {cvData.skills.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Skills</h2>
                  {cvData.skills.map((skill) => (
                    <div key={skill.id} className="mb-2">
                      <h3 className="font-semibold">{skill.category}</h3>
                      <p className="text-gray-700">{skill.items.join(', ')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
