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
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...')
        
        // First try to get the session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('AuthContext: Session data:', { 
          hasSession: !!session, 
          hasUser: !!session?.user, 
          userId: session?.user?.id,
          error: error?.message 
        })
        
        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
          setIsLoading(false)
          return
        }

        // If no session, try to refresh the session
        let sessionToUse = session
        if (!session) {
          console.log('AuthContext: No session found, attempting to refresh...')
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
          
          if (refreshError) {
            console.log('AuthContext: Session refresh failed:', refreshError.message)
            setUser(null)
            setIsLoading(false)
            return
          }
          
          if (refreshedSession?.user) {
            console.log('AuthContext: Session refreshed successfully')
            sessionToUse = refreshedSession
          } else {
            console.log('AuthContext: No session after refresh')
            setUser(null)
            setIsLoading(false)
            return
          }
        }

        if (sessionToUse?.user) {
          console.log('AuthContext: User found, fetching profile...')
          // Get user profile data
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionToUse.user.id)
            .single()

          if (profileError) {
            console.log('AuthContext: Profile not found, creating user record:', profileError.message)
            
            // Create user record if it doesn't exist
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
              console.log('AuthContext: Error creating user record:', insertError.message)
            } else {
              console.log('AuthContext: User record created successfully')
            }
          }

          const userData: User = {
            id: sessionToUse.user.id,
            email: sessionToUse.user.email || "",
            firstName: profile?.first_name || sessionToUse.user.user_metadata?.first_name || "",
            lastName: profile?.last_name || sessionToUse.user.user_metadata?.last_name || "",
            avatar: profile?.avatar || '/placeholder-user.jpg',
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
          console.log('AuthContext: Setting user data:', userData)
          console.log('AuthContext: Quiz completion status:', {
            quizCompleted: userData.quizCompleted,
            quizCompletedAt: userData.quizCompletedAt,
            profileQuizCompleted: profile?.quiz_completed
          })
          setUser(userData)
        } else {
          console.log('AuthContext: No session found')
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state change:', { event, hasSession: !!session, hasUser: !!session?.user })
        
        if (session?.user) {
          console.log('AuthContext: User authenticated, fetching profile...')
          // Get user profile data
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            console.log('AuthContext: Profile not found in auth state change, creating user record:', profileError.message)
            
            // Create user record if it doesn't exist
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
              console.log('AuthContext: Error creating user record in auth state change:', insertError.message)
            } else {
              console.log('AuthContext: User record created successfully in auth state change')
            }
          }

          const userData: User = {
            id: session.user.id,
            email: session.user.email || "",
            firstName: profile?.first_name || session.user.user_metadata?.first_name || "",
            lastName: profile?.last_name || session.user.user_metadata?.last_name || "",
            avatar: profile?.avatar || '/placeholder-user.jpg',
            skinType: profile?.skin_type,
            skinConcerns: profile?.skin_concerns,
            skinGoals: profile?.skin_goals,
            allergies: profile?.allergies,
            quizCompleted: profile?.quiz_completed || false,
            quizCompletedAt: profile?.quiz_completed_at
          }
          console.log('AuthContext: Setting user data from auth state change:', userData)
          console.log('AuthContext: Quiz completion status (auth state change):', {
            quizCompleted: userData.quizCompleted,
            quizCompletedAt: userData.quizCompletedAt,
            profileQuizCompleted: profile?.quiz_completed
          })
          setUser(userData)
        } else {
          console.log('AuthContext: No session in auth state change, clearing user')
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
      console.log('AuthContext: Attempting login for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('AuthContext: Login error:', error)
        throw new Error(error.message || 'Login failed')
      }

      console.log('AuthContext: Login successful')
      
      // The auth state change listener will handle updating the user
      // No need to manually set user here as it will be handled by onAuthStateChange
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
      console.log('AuthContext: Attempting signup for:', userData.email)
      
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

      console.log('AuthContext: Signup successful')
      
      // The session will be automatically updated by Supabase auth state change
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

  // Debug authentication state
  console.log('AuthContext: Current state:', { 
    hasUser: !!user, 
    userId: user?.id, 
    isAuthenticated: !!user,
    isLoading 
  })

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
