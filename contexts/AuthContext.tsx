"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useSession, signIn, signOut } from "next-auth/react"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true)
    } else if (status === "authenticated" && session?.user) {
      // Convert NextAuth session to our User format
      const userData: User = {
        id: session.user.id || "",
        email: session.user.email || "",
        firstName: session.user.name?.split(' ')[0] || "",
        lastName: session.user.name?.split(' ').slice(1).join(' ') || "",
        avatar: session.user.image || '/placeholder-user.jpg'
      }
      setUser(userData)
      setIsLoading(false)
    } else {
      setUser(null)
      setIsLoading(false)
    }
  }, [session, status])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Provide more specific error messages
        if (result.error === 'CredentialsSignin') {
          throw new Error('Invalid email or password')
        }
        throw new Error(result.error)
      }

      if (!result?.ok) {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      // After successful signup, automatically log in the user
      const result = await signIn('credentials', {
        email: userData.email,
        password: userData.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (!result?.ok) {
        throw new Error('Auto-login after signup failed')
      }
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    signOut()
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
