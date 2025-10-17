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
import { getNewUserRedirectPath } from "@/lib/user-flow"

export default function SignUpPage() {
  const { user, isAuthenticated, signup, isLoading } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const redirectPath = getNewUserRedirectPath(user)
      router.push(redirectPath)
    }
  }, [isAuthenticated, isLoading, router, user])

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords don't match")
      return
    }
    
    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }
    
    try {
      // Normalize email before sending
      const normalizedEmail = signupData.email.trim().toLowerCase()
      await signup({
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: normalizedEmail,
        password: signupData.password
      })
      // The useEffect will handle the redirect once user data is loaded
      // Reset form after successful signup
      setSignupData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
      })
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData(prev => ({
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
              <h2 className="font-montserrat font-bold text-xl text-foreground mb-2">Get Started Today</h2>
              <p className="font-open-sans text-muted-foreground">Join Now to Start Your Skincare Journey!</p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-open-sans font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First name"
                    value={signupData.firstName}
                    onChange={handleInputChange}
                    required
                    className="font-open-sans"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-open-sans font-medium">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last name"
                    value={signupData.lastName}
                    onChange={handleInputChange}
                    required
                    className="font-open-sans"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="font-open-sans font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={signupData.email}
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
                    placeholder="Create a password"
                    value={signupData.password}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-open-sans font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={signupData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="font-open-sans"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full font-open-sans font-medium" 
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="font-open-sans text-sm text-muted-foreground text-center">
                Already have an account?{" "} 
                <Link href="/auth/signin" className="text-primary hover:text-primary/80 font-medium">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}