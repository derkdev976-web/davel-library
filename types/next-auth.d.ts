import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "LIBRARIAN" | "MEMBER" | "GUEST"
    } & DefaultSession["user"]
  }

  interface User {
    role: "ADMIN" | "LIBRARIAN" | "MEMBER" | "GUEST"
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and `getToken`, when using JWT sessions
   */
  interface JWT {
    uid: string
    role: "ADMIN" | "LIBRARIAN" | "MEMBER" | "GUEST"
  }
}
