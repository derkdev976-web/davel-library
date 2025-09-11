"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProfilePicture } from "@/components/ui/profile-picture"
import { Menu, X, BookOpen, User, Settings, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Header() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null)

  const fetchUserProfilePicture = useCallback(async () => {
    try {
      console.log('Fetching user profile picture for user:', session?.user?.id)
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        console.log('Profile data received:', data)
        console.log('Profile picture path:', data.avatar)
        setUserProfilePicture(data.avatar)
      } else {
        console.error('Failed to fetch profile:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching user profile picture:', error)
    }
  }, [session?.user?.id])

  // Fetch user's profile picture when session changes
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfilePicture()
    }
  }, [session?.user?.id, fetchUserProfilePicture])

  // Debug logging for profile picture state
  useEffect(() => {
    console.log('Header - userProfilePicture state changed:', userProfilePicture)
    console.log('Header - session user image:', session?.user?.image)
  }, [userProfilePicture, session?.user?.image])

  // Expose refresh function globally so it can be called from other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshHeaderProfilePicture = fetchUserProfilePicture
    }
  }, [fetchUserProfilePicture])

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Catalog", href: "/catalog" },
    { name: "Members", href: "/members" },
    { name: "Free Ebooks", href: "/free-ebooks" },
    { name: "News & Events", href: "/news-events" },
    { name: "Gallery", href: "/gallery" },
    { name: "Learn More", href: "/learn-more" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20 dark:border-gray-700/20 backdrop-blur-md bg-white/80 dark:bg-gray-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-[#8B4513] dark:text-[#d2691e]" />
            <span className="text-xl font-bold text-gradient">Davel Library</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-[#8B4513] dark:hover:text-[#d2691e] transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
            {session ? (
              <Link href={session.user.role === "ADMIN" || session.user.role === "LIBRARIAN" ? "/dashboard/admin" : "/dashboard/member"} className="text-gray-700 dark:text-gray-300 hover:text-[#8B4513] dark:hover:text-[#d2691e] transition-colors duration-200">
                Dashboard
              </Link>
            ) : null}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {status === "loading" ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <ProfilePicture 
                      src={userProfilePicture || session.user?.image || ""}
                      alt={session.user?.name || "User"}
                      size="sm"
                      className="h-8 w-8"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user?.name && <p className="font-medium">{session.user.name}</p>}
                      {session.user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{session.user.email}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={session.user.role === "ADMIN" || session.user.role === "LIBRARIAN" ? "/dashboard/admin" : "/dashboard/member"}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onSelect={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/apply">
                  <Button className="bg-[#8B4513] hover:bg-[#A0522D]">Apply Now</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-[#8B4513] dark:hover:text-[#d2691e] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
