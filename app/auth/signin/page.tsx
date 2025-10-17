"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SparklesIcon } from "@heroicons/react/24/outline"
import { getUserRedirectPath } from "@/lib/user-flow"

export default function SignInPage() {
  const { user, isAuthenticated, login, isLoading } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Add a small delay to ensure the session is fully established
      setTimeout(() => {
        const redirectPath = getUserRedirectPath(user)
        router.push(redirectPath)
      }, 200)
    }
  }, [isAuthenticated, isLoading, router, user])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      // Normalize email before sending
      const normalizedEmail = loginData.email.trim().toLowerCase()
      await login(normalizedEmail, loginData.password)
      // Reset form after successful login
      setLoginData({
        email: "",
        password: ""
      })
      // The useEffect will handle the redirect once user data is loaded
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Show loading or redirect if authenticated
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">

      {/* Auth Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <SparklesIcon className="h-8 w-8 text-primary" />
                <h1 className="font-montserrat font-black text-2xl text-foreground">SkinWise</h1>
              </div>
              <h2 className="font-montserrat font-bold text-xl text-foreground mb-2">Welcome Back!</h2>
              <p className="font-open-sans text-muted-foreground">Sign In to Continue Your Skincare Journey.</p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="font-open-sans font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={handleInputChange}
                  required
                  className="font-open-sans"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="font-open-sans font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    required
                    className="font-open-sans pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full font-open-sans font-medium" disabled={isLoading}> {isLoading ? "Signing In..." : "Sign In"} </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="font-open-sans text-sm text-muted-foreground text-center">Don't have an account?{" "}
                <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-medium">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}