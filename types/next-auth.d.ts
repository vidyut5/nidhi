import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: 'USER' | 'ADMIN' | 'SUPERADMIN'
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role?: 'USER' | 'ADMIN' | 'SUPERADMIN'
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: 'USER' | 'ADMIN' | 'SUPERADMIN'
  }
}

