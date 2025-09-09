"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, UserCircle } from "lucide-react"

interface PublicProfilePictureProps {
  src?: string | null
  alt?: string
  size?: "sm" | "md" | "lg" | "xl"
  fallback?: string
  className?: string
  showFallbackIcon?: boolean
  isPublic?: boolean
}

export function PublicProfilePicture({
  src,
  alt = "Profile picture",
  size = "md",
  fallback,
  className = "",
  showFallbackIcon = true,
  isPublic = true
}: PublicProfilePictureProps) {
  const [imageError, setImageError] = useState(false)
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  }

  const fallbackSize = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  const getFallbackContent = () => {
    if (fallback) {
      return fallback
    }
    
    if (showFallbackIcon) {
      return <UserCircle className={`${fallbackSize[size]} text-gray-400`} />
    }
    
    return <User className={`${fallbackSize[size]} text-gray-400`} />
  }

  const getImageSrc = () => {
    if (!src || imageError) return undefined
    
    // If it's already a full URL, use it as is
    if (src.startsWith('http')) {
      return src
    }
    
    // If it's a relative path, construct the full URL
    if (src.startsWith('/')) {
      return `${window.location.origin}${src}`
    }
    
    return src
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage
        src={getImageSrc()}
        alt={alt}
        onError={() => setImageError(true)}
      />
      <AvatarFallback className="bg-gray-100">
        {getFallbackContent()}
      </AvatarFallback>
    </Avatar>
  )
}

// Specialized component for member listings
export function MemberListingPicture({ 
  src, 
  firstName, 
  lastName, 
  size = "md", 
  className = "" 
}: {
  src?: string | null
  firstName?: string | null
  lastName?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}) {
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  
  return (
    <PublicProfilePicture
      src={src}
      alt={fullName ? `${fullName}'s profile picture` : "Member profile picture"}
      size={size}
      fallback={fullName ? fullName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : undefined}
      className={className}
      showFallbackIcon={!fullName}
      isPublic={true}
    />
  )
}

// Alias for MemberListingPicture to maintain compatibility
export const MemberProfilePicture = MemberListingPicture
