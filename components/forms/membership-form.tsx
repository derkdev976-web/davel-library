"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils" // Import cn for conditional class joining
import { getRandomApplicationFee } from "@/lib/currency-utils"

const membershipSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),

  // Contact Details
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  alternatePhone: z.string().optional(),

  // Address
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required").regex(/^[0-9A-Za-z\s\-]+$/, "ZIP code can only contain letters, numbers, spaces, and hyphens"),
  country: z.string().min(2, "Country is required"),

  // Accessibility & Preferences
  hasDisability: z.boolean(),
  disabilityDetails: z.string().optional(),
  preferredGenres: z.array(z.string()).min(1, "Select at least one genre"),
  readingFrequency: z.enum(["daily", "weekly", "monthly", "occasionally"], {
    errorMap: () => ({ message: "Please select a reading frequency" }),
  }),

  // Supporting Documents
  idDocument: z.array(z.instanceof(File)).min(1, "Please upload a valid ID document"),
  proofOfAddress: z.array(z.instanceof(File)).min(1, "Please upload proof of address"),
  additionalDocuments: z.array(z.instanceof(File)).optional(),

  // Terms
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
  subscribeNewsletter: z.boolean(),
  applicationFee: z.number().min(0, "Application fee must be non-negative"),
})

type MembershipFormData = z.infer<typeof membershipSchema>

const steps = [
  { id: 1, title: "Personal Information", description: "Basic details about you", icon: "👤" },
  { id: 2, title: "Contact Details", description: "How we can reach you", icon: "📞" },
  { id: 3, title: "Address", description: "Your location information", icon: "📍" },
  { id: 4, title: "Preferences", description: "Your reading preferences", icon: "📚" },
  { id: 5, title: "Documents", description: "Upload required documents", icon: "📄" },
  { id: 6, title: "Review & Submit", description: "Confirm your application", icon: "✅" },
]

const genres = [
  "Fiction",
  "Non-Fiction",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Fantasy",
  "Biography",
  "History",
  "Self-Help",
  "Technology",
  "Art",
  "Poetry",
  "Drama",
  "Children's Books",
  "Young Adult",
]

export function MembershipForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const form = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: undefined, // Initialize as undefined to allow Zod enum validation
      email: "",
      phone: "",
      alternatePhone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      hasDisability: false,
      disabilityDetails: "",
      preferredGenres: [],
      readingFrequency: undefined, // Initialize as undefined
      agreeToTerms: false,
      subscribeNewsletter: true,
      applicationFee: getRandomApplicationFee(),
    },
    shouldUnregister: false, // Keep fields mounted even when hidden
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger, // Use trigger for manual validation
    formState: { errors },
  } = form

  const watchedValues = watch()
  const progress = (currentStep / steps.length) * 100

  const handleNextStep = async () => {
    let isValid = false
    if (currentStep === 1) {
      isValid = await trigger(["firstName", "lastName", "dateOfBirth", "gender"])
    } else if (currentStep === 2) {
      isValid = await trigger(["email", "phone"])
    } else if (currentStep === 3) {
      isValid = await trigger(["street", "city", "state", "zipCode", "country"])
    } else if (currentStep === 4) {
      isValid = await trigger(["preferredGenres", "readingFrequency"])
    } else if (currentStep === 5) {
      isValid = await trigger(["idDocument", "proofOfAddress"])
    }

    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else if (!isValid) {
      // Scroll to first error if validation fails
      const firstError = Object.keys(errors).find((key) => (errors as any)[key])
      if (firstError) {
        document.getElementById(firstError)?.focus()
      }
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveProgress = async () => {
    setIsSaving(true)
    try {
      // Save form data to localStorage for now (in a real app, this would go to a database)
      const formData = {
        ...watchedValues,
        lastSaved: new Date().toISOString(),
        currentStep
      }
      localStorage.setItem('membershipFormProgress', JSON.stringify(formData))
      
      toast({
        title: "Progress Saved!",
        description: "Your application progress has been saved. You can continue later.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadProgress = () => {
    try {
      const savedProgress = localStorage.getItem('membershipFormProgress')
      if (savedProgress) {
        const data = JSON.parse(savedProgress)
        Object.keys(data).forEach(key => {
          if (key !== 'lastSaved' && key !== 'currentStep') {
            setValue(key as any, data[key])
          }
        })
        setCurrentStep(data.currentStep || 1)
        
        toast({
          title: "Progress Loaded!",
          description: "Your saved application progress has been restored.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load saved progress.",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: MembershipFormData) => {
    setIsSubmitting(true)
    try {
      // Prepare form data without File objects for JSON submission
      const formData = {
        ...data,
        idDocument: data.idDocument && data.idDocument.length > 0 ? "Documents uploaded" : null,
        proofOfAddress: data.proofOfAddress && data.proofOfAddress.length > 0 ? "Documents uploaded" : null,
        additionalDocuments: (data.additionalDocuments?.length ?? 0) > 0 ? "Documents uploaded" : null,
      }

      const response = await fetch("/api/membership/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "🎉 Application Submitted Successfully!",
          description: "Thank you for applying! We'll review your application and get back to you within 2-3 business days. Check your email for confirmation.",
        })
        
        // Clear saved progress
        localStorage.removeItem('membershipFormProgress')
        
        // Reset form and go to first step
        form.reset()
        setCurrentStep(1)
        
        // Show success message
        setTimeout(() => {
          toast({
            title: "📧 Next Steps",
            description: "You will receive an email confirmation shortly. Please check your spam folder if you don't see it.",
          })
        }, 2000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit application")
      }
    } catch (error: any) {
      toast({
        title: "❌ Submission Failed",
        description: error.message || "Failed to submit application. Please check your internet connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
             <CardHeader>
         <div className="flex justify-between items-center mb-4">
           <div>
             <CardTitle className="text-2xl">Membership Application</CardTitle>
             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
               Complete all steps to submit your application
             </p>
           </div>
           <div className="text-right">
             <span className="text-sm text-gray-500">
               Step {currentStep} of {steps.length}
             </span>
             <div className="text-2xl font-bold text-[#8B4513] dark:text-[#d2691e]">
               {Math.round(progress)}%
             </div>
           </div>
         </div>
         
         <div className="text-center mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
           <p className="text-sm text-gray-700 dark:text-gray-300">
             Application Fee: <span className="font-semibold text-green-600">R{watch("applicationFee")}</span>
           </p>
           <p className="text-xs text-gray-500 mt-1">
             This fee is non-refundable and covers processing costs
           </p>
         </div>
         
                  <Progress value={progress} className="w-full h-3" />

         <div className="flex justify-between items-center mt-4">
           <div className="flex space-x-2">
             <Button
               type="button"
               variant="outline"
               size="sm"
               onClick={handleSaveProgress}
               disabled={isSaving}
               className="text-xs"
             >
               {isSaving ? "Saving..." : "💾 Save Progress"}
             </Button>
             <Button
               type="button"
               variant="outline"
               size="sm"
               onClick={handleLoadProgress}
               className="text-xs"
             >
               📂 Load Progress
             </Button>
           </div>
         </div>

         <div className="flex justify-between mt-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center text-center ${
                step.id <= currentStep ? "text-[#8B4513] dark:text-[#d2691e]" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  step.id < currentStep
                    ? "bg-[#8B4513] text-white scale-110"
                    : step.id === currentStep
                      ? "bg-[#8B4513] text-white scale-110 ring-2 ring-[#8B4513] ring-opacity-50"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                }`}
              >
                {step.id < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-lg">{step.icon}</span>
                )}
              </div>
              <div className="mt-2 hidden sm:block">
                <p className="text-xs font-medium">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          {/* Step 1: Personal Information */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out",
              currentStep === 1 ? "block opacity-100 relative" : "opacity-0 pointer-events-none",
            )}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                 <Label htmlFor="firstName">First Name *</Label>
                 <Input
                   id="firstName"
                   {...register("firstName")}
                   placeholder="Enter your first name"
                   className={errors.firstName ? "border-red-500" : ""}
                 />
                 <div className="flex justify-between items-center mt-1">
                   {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                   <span className="text-xs text-gray-500">
                     {watchedValues.firstName?.length || 0}/50 characters
                   </span>
                 </div>
               </div>
               <div>
                 <Label htmlFor="lastName">Last Name *</Label>
                 <Input 
                   id="lastName" 
                   {...register("lastName")} 
                   placeholder="Enter your last name"
                   className={errors.lastName ? "border-red-500" : ""} 
                 />
                 <div className="flex justify-between items-center mt-1">
                   {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                   <span className="text-xs text-gray-500">
                     {watchedValues.lastName?.length || 0}/50 characters
                   </span>
                 </div>
               </div>
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  className={errors.dateOfBirth ? "border-red-500" : ""}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
              </div>

              <div>
                <Label>Gender *</Label>
                <RadioGroup
                  value={watchedValues.gender}
                  onValueChange={(value) => setValue("gender", value as any, { shouldValidate: true })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                    <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
                  </div>
                </RadioGroup>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
              </div>
            </div>
          </div>

          {/* Step 2: Contact Details */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out",
              currentStep === 2 ? "block opacity-100 relative" : "opacity-0 pointer-events-none",
            )}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <Input id="alternatePhone" type="tel" {...register("alternatePhone")} />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Address */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out",
              currentStep === 3 ? "block opacity-100 relative" : "opacity-0 pointer-events-none",
            )}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Input id="street" {...register("street")} className={errors.street ? "border-red-500" : ""} />
                {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" {...register("city")} className={errors.city ? "border-red-500" : ""} />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" {...register("state")} className={errors.state ? "border-red-500" : ""} />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input 
                    id="zipCode" 
                    type="text"
                    placeholder="Enter ZIP/Postal code"
                    {...register("zipCode", {
                      required: "ZIP code is required",
                      minLength: { value: 1, message: "ZIP code is required" }
                    })} 
                    className={errors.zipCode ? "border-red-500" : ""} 
                  />
                  {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>}
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" {...register("country")} className={errors.country ? "border-red-500" : ""} />
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
                </div>
              </div>
            </div>
          </div>

                     {/* Step 4: Accessibility & Preferences */}
           <div
             className={cn(
               "absolute inset-0 transition-all duration-300 ease-in-out",
               currentStep === 4 ? "block opacity-100 relative" : "opacity-0 pointer-events-none",
             )}
           >
             <div className="space-y-6">
               <div>
                 <div className="flex items-center space-x-2 mb-4">
                   <Checkbox
                     id="hasDisability"
                     checked={watchedValues.hasDisability}
                     onCheckedChange={(checked) => setValue("hasDisability", checked as boolean)}
                   />
                   <Label htmlFor="hasDisability">I have accessibility needs</Label>
                 </div>

                 {watchedValues.hasDisability && (
                   <div>
                     <Label htmlFor="disabilityDetails">Please describe your accessibility needs</Label>
                     <Textarea
                       id="disabilityDetails"
                       {...register("disabilityDetails")}
                       placeholder="Please describe any accommodations you may need..."
                       className="mt-2"
                     />
                   </div>
                 )}
               </div>

               <div>
                 <Label>Preferred Genres * (Select at least one)</Label>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                   {genres.map((genre) => (
                     <div key={genre} className="flex items-center space-x-2">
                       <Checkbox
                         id={genre}
                         checked={watchedValues.preferredGenres?.includes(genre)}
                         onCheckedChange={(checked) => {
                           const current = watchedValues.preferredGenres || []
                           if (checked) {
                             setValue("preferredGenres", [...current, genre], { shouldValidate: true })
                           } else {
                             setValue(
                               "preferredGenres",
                               current.filter((g) => g !== genre),
                               { shouldValidate: true },
                             )
                           }
                         }}
                       />
                       <Label htmlFor={genre} className="text-sm">
                         {genre}
                       </Label>
                     </div>
                   ))}
                 </div>
                 {errors.preferredGenres && (
                   <p className="text-red-500 text-sm mt-1">{errors.preferredGenres.message}</p>
                 )}
               </div>

               <div>
                 <Label>How often do you read? *</Label>
                 <RadioGroup
                   value={watchedValues.readingFrequency}
                   onValueChange={(value) => setValue("readingFrequency", value as any, { shouldValidate: true })}
                   className="mt-2"
                 >
                   <div className="flex items-center space-x-2">
                     <RadioGroupItem value="daily" id="daily" />
                     <Label htmlFor="daily">Daily</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <RadioGroupItem value="weekly" id="weekly" />
                     <Label htmlFor="weekly">Weekly</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <RadioGroupItem value="monthly" id="monthly" />
                     <Label htmlFor="monthly">Monthly</Label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <RadioGroupItem value="occasionally" id="occasionally" />
                     <Label htmlFor="occasionally">Occasionally</Label>
                   </div>
                 </RadioGroup>
                 {errors.readingFrequency && (
                   <p className="text-red-500 text-sm mt-1">{errors.readingFrequency.message}</p>
                 )}
               </div>
             </div>
           </div>

           {/* Step 5: Document Upload */}
           <div
             className={cn(
               "absolute inset-0 transition-all duration-300 ease-in-out",
               currentStep === 5 ? "block opacity-100 relative" : "opacity-0 pointer-events-none",
             )}
           >
             <div className="space-y-6">
               <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                 <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">📄 Required Documents</h3>
                 <p className="text-blue-700 dark:text-blue-300 text-sm">
                   Please upload the following documents to complete your application. All documents should be clear and legible.
                 </p>
               </div>

               <div className="space-y-4">
                 <div>
                   <Label htmlFor="idDocument" className="text-base font-medium">
                     Government-Issued ID * (Passport, Driver&apos;s License, or National ID)
                   </Label>
                   <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                     Accepted formats: PDF, JPG, PNG (Max size: 5MB)
                   </p>
                   <Input
                     id="idDocument"
                     type="file"
                     accept=".pdf,.jpg,.jpeg,.png"
                     multiple
                     onChange={(e) => {
                       const files = Array.from(e.target.files || [])
                       setValue("idDocument", files, { shouldValidate: true })
                     }}
                     className={errors.idDocument ? "border-red-500" : ""}
                   />
                   {errors.idDocument && <p className="text-red-500 text-sm mt-1">{errors.idDocument.message}</p>}
                   {watchedValues.idDocument && watchedValues.idDocument.length > 0 && (
                     <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                       <p className="text-sm text-green-700 dark:text-green-300">
                         ✓ {watchedValues.idDocument.length} file(s) selected
                       </p>
                     </div>
                   )}
                 </div>

                 <div>
                   <Label htmlFor="proofOfAddress" className="text-base font-medium">
                     Proof of Address *
                   </Label>
                   <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                     Utility bill, bank statement, or lease agreement (Max size: 5MB)
                   </p>
                   <Input
                     id="proofOfAddress"
                     type="file"
                     accept=".pdf,.jpg,.jpeg,.png"
                     multiple
                     onChange={(e) => {
                       const files = Array.from(e.target.files || [])
                       setValue("proofOfAddress", files, { shouldValidate: true })
                     }}
                     className={errors.proofOfAddress ? "border-red-500" : ""}
                   />
                   {errors.proofOfAddress && <p className="text-red-500 text-sm mt-1">{errors.proofOfAddress.message}</p>}
                   {watchedValues.proofOfAddress && watchedValues.proofOfAddress.length > 0 && (
                     <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                       <p className="text-sm text-green-700 dark:text-green-300">
                         ✓ {watchedValues.proofOfAddress.length} file(s) selected
                       </p>
                     </div>
                   )}
                 </div>

                 <div>
                   <Label htmlFor="additionalDocuments" className="text-base font-medium">
                     Additional Documents (Optional)
                   </Label>
                   <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                     Any other documents that support your application
                   </p>
                   <Input
                     id="additionalDocuments"
                     type="file"
                     accept=".pdf,.jpg,.jpeg,.png"
                     multiple
                     onChange={(e) => {
                       const files = Array.from(e.target.files || [])
                       setValue("additionalDocuments", files)
                     }}
                   />
                 </div>
               </div>
             </div>
           </div>

          {/* Step 6: Review & Submit */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out",
              currentStep === 6 ? "block opacity-100 relative" : "opacity-0 pointer-events-none",
            )}
          >
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Review Your Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Name:</strong> {watchedValues.firstName || ""} {watchedValues.lastName || ""}
                  </div>
                  <div>
                    <strong>Email:</strong> {watchedValues.email || ""}
                  </div>
                  <div>
                    <strong>Phone:</strong> {watchedValues.phone || ""}
                  </div>
                  <div>
                    <strong>Address:</strong>{" "}
                    {`${watchedValues.street || ""}${watchedValues.city ? `, ${watchedValues.city}` : ""}${
                      watchedValues.state ? `, ${watchedValues.state}` : ""
                    }${watchedValues.zipCode ? ` ${watchedValues.zipCode}` : ""}${
                      watchedValues.country ? `, ${watchedValues.country}` : ""
                    }`}
                  </div>
                  <div>
                    <strong>Date of Birth:</strong>{" "}
                    {watchedValues.dateOfBirth
                      ? new Date(watchedValues.dateOfBirth).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </div>
                  <div>
                    <strong>Gender:</strong>{" "}
                    {watchedValues.gender
                      ? watchedValues.gender
                          .replace(/-/g, " ")
                          .split(" ")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")
                      : "N/A"}
                  </div>
                  <div>
                    <strong>Has Disability:</strong> {watchedValues.hasDisability ? "Yes" : "No"}
                    {watchedValues.hasDisability && watchedValues.disabilityDetails && (
                      <p className="text-xs text-gray-500 mt-1">Details: {watchedValues.disabilityDetails}</p>
                    )}
                  </div>
                  <div>
                    <strong>Preferred Genres:</strong>{" "}
                    {watchedValues.preferredGenres && watchedValues.preferredGenres.length > 0
                      ? watchedValues.preferredGenres.join(", ")
                      : "None selected"}
                  </div>
                  <div>
                    <strong>Reading Frequency:</strong>{" "}
                    {watchedValues.readingFrequency
                      ? watchedValues.readingFrequency.charAt(0).toUpperCase() + watchedValues.readingFrequency.slice(1)
                      : "N/A"}
                  </div>
                                     <div>
                     <strong>Subscribe Newsletter:</strong> {watchedValues.subscribeNewsletter ? "Yes" : "No"}
                   </div>
                   <div>
                     <strong>Application Fee:</strong> <span className="text-green-600 font-semibold">R{watchedValues.applicationFee}</span>
                   </div>
                   <div>
                     <strong>Documents Uploaded:</strong>{" "}
                     <span className="text-blue-600">
                       ID: {watchedValues.idDocument?.length || 0} file(s), 
                       Address: {watchedValues.proofOfAddress?.length || 0} file(s)
                       {watchedValues.additionalDocuments && watchedValues.additionalDocuments.length > 0 && 
                         `, Additional: ${watchedValues.additionalDocuments.length} file(s)`}
                     </span>
                   </div>
                </div>
              </div>

                             <div className="space-y-4">
                 <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                   <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Important Reminders</h4>
                   <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                     <li>• Application fee of R{watchedValues.applicationFee} will be charged</li>
                     <li>• All required documents must be uploaded</li>
                     <li>• Processing takes 2-3 business days</li>
                     <li>• You will receive email confirmation</li>
                   </ul>
                 </div>

                 <div className="flex items-center space-x-2">
                   <Checkbox
                     id="agreeToTerms"
                     checked={watchedValues.agreeToTerms}
                     onCheckedChange={(checked) =>
                       setValue("agreeToTerms", checked as boolean, { shouldValidate: true })
                     }
                   />
                   <Label htmlFor="agreeToTerms">
                     I agree to the{" "}
                     <a href="/terms" className="text-[#8B4513] underline hover:text-[#A0522D]">
                       Terms of Service
                     </a>{" "}
                     and{" "}
                     <a href="/privacy" className="text-[#8B4513] underline hover:text-[#A0522D]">
                       Privacy Policy
                     </a>{" "}
                     *
                   </Label>
                 </div>
                 {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>}

                 <div className="flex items-center space-x-2">
                   <Checkbox
                     id="subscribeNewsletter"
                     checked={watchedValues.subscribeNewsletter}
                     onCheckedChange={(checked) => setValue("subscribeNewsletter", checked as boolean)}
                   />
                   <Label htmlFor="subscribeNewsletter">Subscribe to our newsletter for updates and events</Label>
                 </div>
               </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={handlePrevStep} disabled={currentStep === 1}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button type="button" onClick={handleNextStep} className="bg-[#8B4513] hover:bg-[#A0522D]">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="bg-[#8B4513] hover:bg-[#A0522D]">
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
