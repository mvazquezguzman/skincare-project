"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  skinType?: string
  skinConcerns?: any
  skinGoals?: any
  allergies?: any
  makeupUsage?: string
  sunscreenPreference?: string
  ingredientPreferences?: any
  quizCompleted?: boolean
  quizCompletedAt?: string
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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
          setIsLoading(false)
          return
        }

        let sessionToUse = session
        if (!session) {
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
          
          if (refreshError) {
            setUser(null)
            setIsLoading(false)
            return
          }
          
          if (refreshedSession?.user) {
            sessionToUse = refreshedSession
          } else {
            setUser(null)
            setIsLoading(false)
            return
          }
        }

        if (sessionToUse?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionToUse.user.id)
            .single()

          if (profileError) {
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: sessionToUse.user.id,
                email: sessionToUse.user.email || '',
                first_name: sessionToUse.user.user_metadata?.first_name || '',
                last_name: sessionToUse.user.user_metadata?.last_name || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (insertError) {
              console.error('Error creating user record:', insertError)
            }
          }

          const userData: User = {
            id: sessionToUse.user.id,
            email: sessionToUse.user.email || "",
            firstName: profile?.first_name || sessionToUse.user.user_metadata?.first_name || "",
            lastName: profile?.last_name || sessionToUse.user.user_metadata?.last_name || "",
            avatar: profile?.avatar || '/placeholder.jpg',
            skinType: profile?.skin_type,
            skinConcerns: profile?.skin_concerns,
            skinGoals: profile?.skin_goals,
            allergies: profile?.allergies,
            makeupUsage: profile?.makeup_usage,
            sunscreenPreference: profile?.sunscreen_preference,
            ingredientPreferences: profile?.ingredient_preferences,
            quizCompleted: profile?.quiz_completed || false,
            quizCompletedAt: profile?.quiz_completed_at
          }
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email || '',
                first_name: session.user.user_metadata?.first_name || '',
                last_name: session.user.user_metadata?.last_name || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (insertError) {
              console.error('Error creating user record in auth state change:', insertError)
            }
          }

          const userData: User = {
            id: session.user.id,
            email: session.user.email || "",
            firstName: profile?.first_name || session.user.user_metadata?.first_name || "",
            lastName: profile?.last_name || session.user.user_metadata?.last_name || "",
            avatar: profile?.avatar || '/placeholder.jpg',
            skinType: profile?.skin_type,
            skinConcerns: profile?.skin_concerns,
            skinGoals: profile?.skin_goals,
            allergies: profile?.allergies,
            quizCompleted: profile?.quiz_completed || false,
            quizCompletedAt: profile?.quiz_completed_at
          }
          setUser(userData)
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('AuthContext: Login error:', error)
        throw new Error(error.message || 'Login failed')
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error)
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
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          }
        }
      })

      if (error) {
        console.error('AuthContext: Signup error:', error)
        throw new Error(error.message || 'Signup failed')
      }
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
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
