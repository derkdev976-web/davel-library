import type { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: false,
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
        auth: {
          user: process.env.EMAIL_SERVER_USER || "",
          pass: process.env.EMAIL_SERVER_PASSWORD || "",
        },
      },
      from: process.env.EMAIL_FROM || "noreply@davellibrary.com",

      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { host } = new URL(url)
        const transport = nodemailer.createTransport(provider.server)
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Sign in to Davel Library`,
          text: `Sign in to Davel Library by clicking on this link: ${url}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
              <div style="background-color: #8B4513; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Davel Library</h1>
              </div>
              
              <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #8B4513; margin-top: 0; text-align: center;">Welcome to Davel Library</h2>
                
                <p style="color: #333; font-size: 16px; line-height: 1.6;">
                  Hello! You requested to sign in to your Davel Library account. Click the button below to securely sign in:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${url}" 
                     style="background-color: #8B4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                    Sign In to Davel Library
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px; line-height: 1.5;">
                  If the button doesn't work, you can copy and paste this link into your browser:
                </p>
                
                <p style="color: #8B4513; font-size: 14px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
                  ${url}
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 12px; margin: 0;">
                    This link will expire in 24 hours. If you didn't request this email, you can safely ignore it.
                  </p>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                <p>© 2024 Davel Library. All rights reserved.</p>
              </div>
            </div>
          `,
        })
      },
    }),
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email.toLowerCase().trim()
        const password = credentials.password

        try {
          // console.log("=== AUTHENTICATION ATTEMPT ===")
          // console.log("Email:", email)
          
          // First, check for existing users in database with hashed passwords
          const user = await prisma.user.findUnique({ 
            where: { email: email },
            include: {
              membershipApplication: true
            }
          })
          
          if (user) {
            // console.log("User found in database:", user.role, user.id)
            
            // If user has password, verify it with bcrypt
            if (user.password) {
              // console.log("Verifying password with bcrypt...")
              const isValidPassword = await bcrypt.compare(password, user.password)
              if (isValidPassword) {
                // console.log("Password verified successfully for:", email, "Role:", user.role)
                
                // Additional security: Validate user is active
                if (!user.isActive) {
                  // console.log("Login rejected - user account is deactivated:", email)
                  return null
                }
                
                return { 
                  id: user.id, 
                  email: user.email, 
                  name: user.name, 
                  role: user.role as "MEMBER" | "ADMIN" | "LIBRARIAN" | "GUEST"
                }
              } else {
                console.log("Invalid password for user:", email)
                return null
              }
            } else {
              console.log("User has no password set:", email)
            }
            
            // If no password but user exists, check if they're an approved member
            if (user.role === "MEMBER" && user.membershipApplication?.status === "APPROVED") {
              const memberPassword = process.env.MEMBER_DEFAULT_PASSWORD || "member123"
              if (password === memberPassword) {
                console.log("Approved member login successful with default password:", email)
                
                // Additional security: Validate user is active
                if (!user.isActive) {
                  console.log("Login rejected - member account is deactivated:", email)
                  return null
                }
                
                return { 
                  id: user.id, 
                  email: user.email, 
                  name: user.name, 
                  role: "MEMBER" as const 
                }
              }
            }
          } else {
            console.log("No user found in database for:", email)
          }

          // Check for approved member applications (for users not yet in User table)
          const application = await prisma.membershipApplication.findUnique({
            where: { email: email }
          })
          
          if (application) {
            console.log("Membership application found:", application.status)
            
            if (application.status === "APPROVED") {
              const memberPassword = process.env.MEMBER_DEFAULT_PASSWORD || "member123"
              
              if (password === memberPassword) {
                console.log("Approved application member login successful:", email)
                
                // Create user account for approved member if it doesn't exist
                let memberUser = await prisma.user.findUnique({
                  where: { email: email }
                })
                
                if (!memberUser) {
                  memberUser = await prisma.user.create({
                    data: {
                      email: email,
                      name: `${application.firstName} ${application.lastName}`,
                      role: "MEMBER",
                      isActive: true,
                      membershipApplication: {
                        connect: { id: application.id }
                      }
                    }
                  })
                  console.log("Created new user account for approved member:", memberUser.id)
                }
                
                return { 
                  id: memberUser.id, 
                  email: memberUser.email, 
                  name: memberUser.name, 
                  role: "MEMBER" as const 
                }
              } else {
                console.log("Invalid default password for approved application:", email)
              }
            } else {
              console.log("Login rejected - application not approved:", email, "Status:", application.status)
            }
          }
          
          console.log("Login failed - no valid credentials found for:", email)
          return null
        } catch (error) {
          console.error("Error in authorize function:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      try {
        // Initial sign in
        if (account && user) {
          token.id = user.id
          token.role = (user as any).role || "GUEST"
          token.name = user.name
          
          // Store intended redirect based on user role
          if ((user as any).intendedRedirect) {
            token.intendedRedirect = (user as any).intendedRedirect
          } else {
            // Set default redirect based on role
            const userRole = (user as any).role
            if (userRole === "ADMIN") {
              token.intendedRedirect = "/dashboard/admin"
            } else if (userRole === "LIBRARIAN") {
              token.intendedRedirect = "/dashboard/librarian"
            } else if (userRole === "MEMBER") {
              token.intendedRedirect = "/dashboard/member"
            } else {
              token.intendedRedirect = "/dashboard/user"
            }
          }
          
          console.log("JWT token created for user:", {
            id: user.id,
            email: user.email,
            role: (user as any).role,
            intendedRedirect: token.intendedRedirect
          })
        }
        
        // Ensure token has required fields
        if (!token.id) {
          console.error("JWT token missing user ID")
          token.id = "unknown"
        }
        
        if (!token.role) {
          console.error("JWT token missing user role, defaulting to GUEST")
          token.role = "GUEST"
        }
        
        if (!token.name) {
          console.error("JWT token missing user name")
          token.name = "Unknown User"
        }
        
        if (!token.intendedRedirect) {
          console.error("JWT token missing intended redirect, setting default")
          token.intendedRedirect = "/dashboard/user"
        }
        
        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        return {
          ...token,
          id: "error",
          role: "GUEST",
          name: "Error User",
          intendedRedirect: "/dashboard/user"
        }
      }
    },
    
    session: async ({ session, user, token }) => {
      // console.log("=== SESSION CALLBACK START ===")
      
      try {
        if (token) {
          // Handle JWT strategy
          session.user.id = token.id as string
          session.user.role = (token.role as "ADMIN" | "LIBRARIAN" | "MEMBER" | "GUEST") || "GUEST"
          session.user.name = token.name as string
          // Add intended redirect to session for client-side use
          ;(session.user as any).intendedRedirect = token.intendedRedirect || "/dashboard/user"
        } else if (user) {
          // Handle database strategy
          session.user.id = user.id
          session.user.role = (user as any).role || "GUEST"
          session.user.name = user.name
          // Set default redirect based on role
          const userRole = (user as any).role
          if (userRole === "ADMIN") {
            ;(session.user as any).intendedRedirect = "/dashboard/admin"
          } else if (userRole === "LIBRARIAN") {
            ;(session.user as any).intendedRedirect = "/dashboard/librarian"
          } else if (userRole === "MEMBER") {
            ;(session.user as any).intendedRedirect = "/dashboard/member"
          } else {
            ;(session.user as any).intendedRedirect = "/dashboard/user"
          }
        }
        
        // Ensure all required fields are present
        if (!session.user.id) {
          console.error("Session missing user ID")
          session.user.id = "unknown"
        }
        
        if (!session.user.role) {
          console.error("Session missing user role, defaulting to GUEST")
          session.user.role = "GUEST"
        }
        
        if (!session.user.name) {
          console.error("Session missing user name")
          session.user.name = "Unknown User"
        }
        
        // Ensure intended redirect is present
        if (!(session.user as any).intendedRedirect) {
          console.error("Session missing intended redirect, setting default")
          ;(session.user as any).intendedRedirect = "/dashboard/user"
        }
        
        // console.log("Final session object:", {
        //   id: session.user.id,
        //   email: session.user.email,
        //   name: session.user.name,
        //   role: session.user.role,
        //   intendedRedirect: (session.user as any).intendedRedirect
        // })
        
        // console.log("=== SESSION CALLBACK END ===")
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        // Return a safe default session
        return {
          ...session,
          user: {
            ...session.user,
            id: "error",
            role: "GUEST",
            name: "Error User"
          }
        }
      }
    },

    signIn: async ({ user, account, profile, email, credentials }) => {
      try {
        // console.log("=== SIGN IN CALLBACK START ===")
        // console.log("User:", { id: user?.id, email: user?.email, role: (user as any)?.role })
        // console.log("Account:", account?.type)
        // console.log("Email:", email)
        
        // For email-based authentication, we'll handle redirect in the redirect callback
        if (account?.type === "email") {
          // console.log("Email-based authentication detected")
          return true
        }
        
        // For credentials-based authentication, determine redirect based on role
        if (account?.type === "credentials" && user) {
          const userRole = (user as any)?.role
          // console.log("Credentials authentication for role:", userRole)
          
          // Store the intended redirect in the user object for the redirect callback
          if (userRole === "ADMIN") {
            (user as any).intendedRedirect = "/dashboard/admin"
          } else if (userRole === "LIBRARIAN") {
            (user as any).intendedRedirect = "/dashboard/librarian"
          } else if (userRole === "MEMBER") {
            (user as any).intendedRedirect = "/dashboard/member"
          } else {
            (user as any).intendedRedirect = "/dashboard/user"
          }
          
          // console.log("Intended redirect:", (user as any).intendedRedirect)
        }
        
        // console.log("=== SIGN IN CALLBACK END ===")
        return true
      } catch (error) {
        console.error("Sign in callback error:", error)
        return true
      }
    },

    redirect: async ({ url, baseUrl }) => {
      try {
        // console.log("=== REDIRECT CALLBACK START ===")
        // console.log("URL:", url)
        // console.log("Base URL:", baseUrl)
        
        // Handle signin redirects
        if (url.startsWith(`${baseUrl}/api/auth/signin`)) {
          // console.log("Redirecting from signin page")
          return `${baseUrl}/dashboard/user`
        }
        
        // Handle signout redirects
        if (url.startsWith(`${baseUrl}/api/auth/signout`)) {
          // console.log("Redirecting after signout")
          return `${baseUrl}/`
        }
        
        // Handle callback URLs with specific dashboard targets
        if (url.includes("callbackUrl")) {
          if (url.includes("dashboard/admin")) {
            // console.log("Redirecting to admin dashboard via callback")
            return `${baseUrl}/dashboard/admin`
          } else if (url.includes("dashboard/librarian")) {
            // console.log("Redirecting to librarian dashboard via callback")
            return `${baseUrl}/dashboard/librarian`
          } else if (url.includes("dashboard/member")) {
            // console.log("Redirecting to member dashboard via callback")
            return `${baseUrl}/dashboard/member`
          } else if (url.includes("dashboard/user")) {
            // console.log("Redirecting to user dashboard via callback")
            return `${baseUrl}/dashboard/user`
          }
        }
        
        // Handle direct dashboard access attempts
        if (url.includes("/dashboard/")) {
          const dashboardMatch = url.match(/\/dashboard\/([^/?]+)/)
          if (dashboardMatch) {
            const dashboard = dashboardMatch[1]
            // console.log("Direct dashboard access detected:", dashboard)
            
            // Validate dashboard access based on user role (this will be handled by middleware)
            return url
          }
        }
        
        // Handle email verification redirects
        if (url.includes("verify-request")) {
          // console.log("Email verification requested")
          return `${baseUrl}/auth/verify-request`
        }
        
        // Handle error redirects
        if (url.includes("error")) {
          // console.log("Authentication error detected")
          return `${baseUrl}/auth/signin?error=AuthenticationError`
        }
        
        // Default fallback
        // console.log("No specific redirect rule, using original URL")
        return url
      } catch (error) {
        console.error("Redirect callback error:", error)
        // console.log("Falling back to user dashboard")
        return `${baseUrl}/dashboard/user`
      }
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (reduced from 30 days for better performance)
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
  },
}
