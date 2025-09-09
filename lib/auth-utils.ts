import { getSession } from "next-auth/react"
import { redirect } from "next/navigation"

/**
 * Get the appropriate dashboard URL for a user based on their role
 */
export function getDashboardUrl(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin"
    case "LIBRARIAN":
      return "/dashboard/librarian"
    case "MEMBER":
      return "/dashboard/member"
    default:
      return "/dashboard/user"
  }
}

/**
 * Redirect user to their appropriate dashboard based on their role
 */
export async function redirectToUserDashboard() {
  try {
    const session = await getSession()
    
    if (!session?.user) {
      redirect("/auth/signin")
      return
    }
    
    const userRole = (session.user as any).role || "GUEST"
    const dashboardUrl = getDashboardUrl(userRole)
    
    console.log("Redirecting user to dashboard:", {
      userId: session.user.id,
      userRole,
      dashboardUrl
    })
    
    redirect(dashboardUrl)
  } catch (error) {
    console.error("Error redirecting to user dashboard:", error)
    redirect("/dashboard/user")
  }
}

/**
 * Check if user has access to a specific dashboard
 */
export function hasDashboardAccess(userRole: string, targetDashboard: string): boolean {
  switch (targetDashboard) {
    case "admin":
      return userRole === "ADMIN"
    case "librarian":
      return userRole === "ADMIN" || userRole === "LIBRARIAN"
    case "member":
      return userRole === "ADMIN" || userRole === "LIBRARIAN" || userRole === "MEMBER"
    case "user":
      return true // All authenticated users can access user dashboard
    default:
      return false
  }
}

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Administrator"
    case "LIBRARIAN":
      return "Librarian"
    case "MEMBER":
      return "Library Member"
    case "GUEST":
      return "Guest"
    default:
      return "Unknown"
  }
}

/**
 * Check if user can perform admin actions
 */
export function isAdmin(userRole: string): boolean {
  return userRole === "ADMIN"
}

/**
 * Check if user can perform librarian actions
 */
export function isLibrarian(userRole: string): boolean {
  return userRole === "ADMIN" || userRole === "LIBRARIAN"
}

/**
 * Check if user can perform member actions
 */
export function isMember(userRole: string): boolean {
  return userRole === "ADMIN" || userRole === "LIBRARIAN" || userRole === "MEMBER"
}
