"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SparklesIcon } from "@heroicons/react/24/outline"

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for login mode parameter and redirect if already authenticated
  useEffect(() => {
    const mode = searchParams.get('mode')
    
    if (isAuthenticated && !isLoading) {
      router.push("/")
    } else if (!isLoading) {
      // Redirect to sign-in by default, or sign-up if mode=signup
      if (mode === 'signup') {
        router.push("/auth/signup")
      } else {
        router.push("/auth/signin")
      }
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  // Show loading while determining redirect
  return (
    <div className="min-h-screen bg-background">
      
      {/* Loading Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <SparklesIcon className="h-8 w-8 text-primary" />
                <h1 className="font-montserrat font-black text-2xl text-foreground">
                  SkinWise
                </h1>
              </div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Redirecting...</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}