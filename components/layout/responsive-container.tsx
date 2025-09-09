"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
}

export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = "7xl",
  padding = "lg"
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full"
  }

  const paddingClasses = {
    none: "",
    sm: "px-2 sm:px-4",
    md: "px-4 sm:px-6",
    lg: "px-4 sm:px-6 lg:px-8",
    xl: "px-4 sm:px-6 lg:px-8 xl:px-12"
  }

  return (
    <div className={cn(
      "mx-auto w-full",
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

// Specialized containers for different use cases
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ResponsiveContainer 
      maxWidth="7xl" 
      padding="lg" 
      className={cn("min-h-screen", className)}
    >
      {children}
    </ResponsiveContainer>
  )
}

export function ContentContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ResponsiveContainer 
      maxWidth="5xl" 
      padding="md" 
      className={className}
    >
      {children}
    </ResponsiveContainer>
  )
}

export function CardContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ResponsiveContainer 
      maxWidth="4xl" 
      padding="sm" 
      className={className}
    >
      {children}
    </ResponsiveContainer>
  )
}

export function FormContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ResponsiveContainer 
      maxWidth="2xl" 
      padding="md" 
      className={className}
    >
      {children}
    </ResponsiveContainer>
  )
}
