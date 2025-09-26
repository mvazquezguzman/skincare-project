"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import {
  BeakerIcon,
  ShieldCheckIcon,
  CalendarIcon,
  BookOpenIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import { WelcomeMessage } from "@/components/WelcomeMessage"

export default function HomePage() {
  const { user, isAuthenticated, signup, login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(false)
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords don't match")
      return
    }
    
    try {
      await signup({
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password
      })
      // Reset form after successful signup
      setSignupData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
      })
    } catch (err) {
      setError("Failed to create account. Please try again.")
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      await login(loginData.email, loginData.password)
      // Reset form after successful login
      setLoginData({
        email: "",
        password: ""
      })
    } catch (err) {
      setError("Invalid email or password. Please try again.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoginMode) {
      setLoginData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }))
    } else {
      setSignupData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }))
    }
  }

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setError("")
    setSignupData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    })
    setLoginData({
      email: "",
      password: ""
    })
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {isAuthenticated ? (
            /* Welcome Message for Logged-in Users */
            <div className="text-center">
              <WelcomeMessage user={user} />
            </div>
          ) : (
            /* About and Login/Signup Layout for Guest Users */
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* About Section - Left Side */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <SparklesIcon className="h-12 w-12 text-primary" />
                  <h1 className="font-montserrat font-black text-3xl md:text-4xl text-foreground">
                    SkinWise
                  </h1>
                </div>
                <h2 className="font-montserrat font-bold text-2xl md:text-3xl text-foreground">
                  Your Skincare Journey Starts with Safe Ingredients
                </h2>
                <p className="font-open-sans text-lg text-muted-foreground leading-relaxed">
                  Discover the science behind skincare ingredients, build personalized routines, 
                  and track your progress with our comprehensive ingredient library and 
                  compatibility checker.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <BeakerIcon className="h-5 w-5 text-primary" />
                    <span className="font-open-sans text-foreground">Comprehensive Ingredient Database</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-5 w-5 text-primary" />
                    <span className="font-open-sans text-foreground">Safety and Compatibility Checker</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <span className="font-open-sans text-foreground">Personalized Routine Builder</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BookOpenIcon className="h-5 w-5 text-primary" />
                    <span className="font-open-sans text-foreground">Skincare Diary and Progress Tracking</span>
                  </div>
                </div>
              </div>

              {/* Auth Form Section - Right Side */}
              <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="font-montserrat font-bold text-2xl text-foreground mb-2">
                    {isLoginMode ? "Welcome Back" : "Get Started Today"}
                  </h3>
                  <p className="font-open-sans text-muted-foreground">
                    {isLoginMode 
                      ? "Sign in to continue your skincare journey" 
                      : "Join Now to Start Your Skincare Journey!"
                    }
                  </p>
                </div>

                {/* Toggle Buttons */}
                <div className="flex bg-muted rounded-lg p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => setIsLoginMode(false)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      !isLoginMode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLoginMode(true)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      isLoginMode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign In
                  </button>
                </div>

                {/* Auth Form */}
                <form onSubmit={isLoginMode ? handleLoginSubmit : handleSignupSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  {!isLoginMode && (
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
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-open-sans font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={isLoginMode ? loginData.email : signupData.email}
                      onChange={handleInputChange}
                      required
                      className="font-open-sans"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-open-sans font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={isLoginMode ? "Enter your password" : "Create a password"}
                        value={isLoginMode ? loginData.password : signupData.password}
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

                  {!isLoginMode && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="font-open-sans font-medium">
                        Confirm Password
                      </Label>
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
                  )}

                  <Button 
                    type="submit" 
                    className="w-full font-open-sans font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading 
                      ? (isLoginMode ? "Signing In..." : "Creating Account...") 
                      : (isLoginMode ? "Sign In" : "Create Account")
                    }
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="font-open-sans text-sm text-muted-foreground text-center">
                    {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      {isLoginMode ? "Sign up here" : "Sign in here"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}