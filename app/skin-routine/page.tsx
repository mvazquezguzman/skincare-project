"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import {
  SunIcon,
  MoonIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  CalendarIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  PencilIcon,
} from "@heroicons/react/24/outline"

const RoutineBuilder = () => {
  const { user, isAuthenticated } = useAuth()
  const [skinProfile, setSkinProfile] = useState<Partial<SkinProfile>>({})
  const [customRoutine, setCustomRoutine] = useState<{
    morning: RoutineStep[]
    evening: RoutineStep[]
  }>({
    morning: [],
    evening: [],
  })
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Fetch user's existing skin profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated || !user) return

      try {
        const { data: dbProfile, error } = await supabase
          .from('users')
          .select('skin_type, skin_concerns, skin_goals, allergies')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          return
        }

        if (dbProfile) {
          const userProfile: Partial<SkinProfile> = {
            skinType: dbProfile.skin_type,
            concerns: dbProfile.skin_concerns ? (Array.isArray(dbProfile.skin_concerns) ? dbProfile.skin_concerns : JSON.parse(dbProfile.skin_concerns)) : [],
            goals: dbProfile.skin_goals ? (Array.isArray(dbProfile.skin_goals) ? dbProfile.skin_goals : JSON.parse(dbProfile.skin_goals)) : [],
            allergies: dbProfile.allergies ? (Array.isArray(dbProfile.allergies) ? dbProfile.allergies : JSON.parse(dbProfile.allergies)) : [],
          }
          setSkinProfile(userProfile)
          setProfileLoaded(true)
          // Auto-generate routine based on existing profile
          generateRoutine(userProfile)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && user) {
      fetchUserProfile()
    }
  }, [isAuthenticated, user])

  const generateRoutine = (profile?: Partial<SkinProfile>) => {
    const userProfile = profile || skinProfile
    // Simple routine generation logic based on skin profile
    const morningRoutine = [...routineSteps.morning]
    const eveningRoutine = [...routineSteps.evening]

    // Customize based on skin type and concerns
    if (userProfile.skinType === "oily") {
      morningRoutine[1] = {
        ...morningRoutine[1],
        name: "Niacinamide Serum",
        ingredient: "Niacinamide",
        description: "Control oil production and minimize pores",
      }
    }

    if (userProfile.concerns?.includes("Active Acne Breakouts") || userProfile.concerns?.includes("Help Prevent New Acne")) {
      eveningRoutine[1] = {
        ...eveningRoutine[1],
        name: "BHA Treatment",
        ingredient: "Salicylic Acid",
        description: "Unclog pores and treat acne",
      }
    }

    if (userProfile.skinType === "sensitive") {
      eveningRoutine[1] = {
        ...eveningRoutine[1],
        frequency: "2x per week",
        description: "Start slowly to build tolerance",
      }
    }

    setCustomRoutine({
      morning: morningRoutine,
      evening: eveningRoutine,
    })
    setShowResults(true)
  }

  const removeStep = (timeOfDay: "morning" | "evening", stepId: string) => {
    setCustomRoutine((prev) => ({
      ...prev,
      [timeOfDay]: prev[timeOfDay].filter((step) => step.id !== stepId),
    }))
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <SparklesIcon className="h-12 w-12 text-primary" />
              </div>
              <h1 className="font-montserrat font-black text-3xl md:text-4xl text-foreground">
                Your Personalized Routine
              </h1>
              <p className="font-open-sans text-lg text-muted-foreground max-w-2xl mx-auto">
                Based on your skin profile, here's a customized routine designed just for you
              </p>
            </div>

            <Tabs defaultValue="morning" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="morning" className="font-open-sans flex items-center gap-2">
                  <SunIcon className="h-4 w-4" />
                  Morning Routine
                </TabsTrigger>
                <TabsTrigger value="evening" className="font-open-sans flex items-center gap-2">
                  <MoonIcon className="h-4 w-4" />
                  Evening Routine
                </TabsTrigger>
              </TabsList>

              <TabsContent value="morning" className="space-y-4">
                {customRoutine.morning.map((step, index) => (
                  <Card key={step.id} className="border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-montserrat font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="font-montserrat font-bold text-lg text-foreground">
                              {step.name}
                            </CardTitle>
                            <Badge variant="outline" className="font-open-sans">
                              {step.category}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep("morning", step.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="font-open-sans text-muted-foreground leading-relaxed">{step.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ClockIcon className="h-4 w-4" />
                            <span className="font-open-sans">{step.timing}</span>
                          </div>
                          <Badge variant="secondary" className="font-open-sans">
                            {step.ingredient}
                          </Badge>
                        </div>
                        <span className="font-open-sans text-muted-foreground">{step.frequency}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="evening" className="space-y-4">
                {customRoutine.evening.map((step, index) => (
                  <Card key={step.id} className="border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-montserrat font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="font-montserrat font-bold text-lg text-foreground">
                              {step.name}
                            </CardTitle>
                            <Badge variant="outline" className="font-open-sans">
                              {step.category}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep("evening", step.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="font-open-sans text-muted-foreground leading-relaxed">{step.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ClockIcon className="h-4 w-4" />
                            <span className="font-open-sans">{step.timing}</span>
                          </div>
                          <Badge variant="secondary" className="font-open-sans">
                            {step.ingredient}
                          </Badge>
                        </div>
                        <span className="font-open-sans text-muted-foreground">{step.frequency}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setShowResults(false)} className="font-open-sans">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Modify Routine
              </Button>
              <Button className="font-open-sans">
                Save Routine
                <CheckCircleIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="font-open-sans text-muted-foreground">Loading your skin profile...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // No profile data - redirect to skin quiz
  if (!profileLoaded || !skinProfile.skinType) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-4">
              <UserIcon className="h-12 w-12 text-primary" />
            </div>
            <h2 className="font-montserrat font-black text-2xl text-foreground">Complete Your Skin Profile</h2>
            <p className="font-open-sans text-muted-foreground">
              To get your personalized routine, we need to know more about your skin. Complete your skin profile first.
            </p>
            <div className="space-y-4">
              <Button asChild size="lg" className="font-open-sans">
                <Link href="/skin-quiz">Take Skin Quiz</Link>
              </Button>
              <div>
                <Button asChild variant="outline" className="font-open-sans">
                  <Link href="/user-profile">View Profile</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="font-montserrat font-black text-2xl text-foreground">Your Personalized Routine</h2>
            <p className="font-open-sans text-muted-foreground">
              Based on your skin profile, here's your customized routine
            </p>
          </div>

          {/* Profile Summary */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-montserrat font-bold text-xl text-foreground">Your Skin Profile</CardTitle>
                <Button asChild variant="outline" size="sm" className="font-open-sans">
                  <Link href="/skin-quiz">
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Update Profile
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-montserrat font-bold text-sm text-foreground mb-2">Skin Type</h4>
                  <Badge variant="secondary" className="font-open-sans capitalize">
                    {skinProfile.skinType}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-montserrat font-bold text-sm text-foreground mb-2">Allergies/Preferences</h4>
                  <div className="flex flex-wrap gap-1">
                    {skinProfile.allergies?.slice(0, 2).map((allergy) => (
                      <Badge key={allergy} variant="outline" className="font-open-sans text-xs">
                        {allergy}
                      </Badge>
                    ))}
                    {skinProfile.allergies && skinProfile.allergies.length > 2 && (
                      <Badge variant="outline" className="font-open-sans text-xs">
                        +{skinProfile.allergies.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-montserrat font-bold text-sm text-foreground mb-2">Main Concerns</h4>
                <div className="flex flex-wrap gap-2">
                  {skinProfile.concerns?.map((concern) => (
                    <Badge key={concern} variant="outline" className="font-open-sans">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>
              {skinProfile.goals && skinProfile.goals.length > 0 && (
                <div>
                  <h4 className="font-montserrat font-bold text-sm text-foreground mb-2">Goals</h4>
                  <div className="flex flex-wrap gap-2">
                    {skinProfile.goals.map((goal) => (
                      <Badge key={goal} variant="outline" className="font-open-sans">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center">
            <Button 
              onClick={() => generateRoutine()} 
              size="lg" 
              className="font-open-sans"
            >
              <SparklesIcon className="mr-2 h-5 w-5" />
              Generate My Routine
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

const AdvancedRoutine = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="font-montserrat font-black text-2xl text-foreground">Advanced Routine Generator</h2>
        <p className="font-open-sans text-muted-foreground">
          Create detailed 4-step routines with comprehensive ingredient analysis
        </p>
      </div>
      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <p className="font-open-sans text-muted-foreground">Advanced routine generator coming soon...</p>
      </div>
    </div>
  )
}

const RoutineAnalyzer = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="font-montserrat font-black text-2xl text-foreground">Routine Analyzer</h2>
        <p className="font-open-sans text-muted-foreground">
          Analyze your current routine for conflicts and improvements
        </p>
      </div>
      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <p className="font-open-sans text-muted-foreground">Routine analyzer coming soon...</p>
      </div>
    </div>
  )
}

interface SkinProfile {
  skinType: string
  concerns: string[]
  goals: string[]
  allergies: string[]
}

interface RoutineStep {
  id: string
  name: string
  category: string
  ingredient: string
  description: string
  timing: string
  order: number
  frequency: string
}

// Removed unused constants - now using data from user's existing profile

const routineSteps: { [key: string]: RoutineStep[] } = {
  morning: [
    {
      id: "cleanser-am",
      name: "Gentle Cleanser",
      category: "Cleanser",
      ingredient: "Ceramides",
      description: "Start with a gentle cleanser to remove overnight buildup",
      timing: "1-2 minutes",
      order: 1,
      frequency: "Daily",
    },
    {
      id: "vitamin-c",
      name: "Vitamin C Serum",
      category: "Treatment",
      ingredient: "Vitamin C",
      description: "Antioxidant protection and brightening",
      timing: "Wait 10-15 minutes",
      order: 2,
      frequency: "Daily",
    },
    {
      id: "moisturizer-am",
      name: "Lightweight Moisturizer",
      category: "Moisturizer",
      ingredient: "Hyaluronic Acid",
      description: "Hydrate and prep skin for sunscreen",
      timing: "2-3 minutes",
      order: 3,
      frequency: "Daily",
    },
    {
      id: "sunscreen",
      name: "Broad Spectrum SPF 30+",
      category: "Sun Protection",
      ingredient: "Zinc Oxide",
      description: "Essential daily protection from UV damage",
      timing: "Apply generously",
      order: 4,
      frequency: "Daily",
    },
  ],
  evening: [
    {
      id: "cleanser-pm",
      name: "Double Cleanse",
      category: "Cleanser",
      ingredient: "Salicylic Acid",
      description: "Remove makeup, sunscreen, and daily buildup",
      timing: "2-3 minutes each step",
      order: 1,
      frequency: "Daily",
    },
    {
      id: "treatment",
      name: "Active Treatment",
      category: "Treatment",
      ingredient: "Retinol",
      description: "Target specific concerns with active ingredients",
      timing: "Wait 20-30 minutes",
      order: 2,
      frequency: "3-4x per week",
    },
    {
      id: "hydrating-serum",
      name: "Hydrating Serum",
      category: "Serum",
      ingredient: "Hyaluronic Acid",
      description: "Boost hydration and support skin barrier",
      timing: "2-3 minutes",
      order: 3,
      frequency: "Daily",
    },
    {
      id: "moisturizer-pm",
      name: "Rich Night Moisturizer",
      category: "Moisturizer",
      ingredient: "Ceramides",
      description: "Nourish and repair skin overnight",
      timing: "Apply generously",
      order: 4,
      frequency: "Daily",
    },
  ],
}

export default function RoutineBuilderPage() {
  const [activeTab, setActiveTab] = useState("builder")

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="builder" className="font-open-sans flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Skin Routine
              </TabsTrigger>
              <TabsTrigger value="advanced" className="font-open-sans flex items-center gap-2">
                <ClipboardDocumentListIcon className="h-4 w-4" />
                Advanced Generator
              </TabsTrigger>
              <TabsTrigger value="analyzer" className="font-open-sans flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4" />
                Routine Analyzer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder">
              <RoutineBuilder />
            </TabsContent>

            <TabsContent value="advanced">
              <AdvancedRoutine />
            </TabsContent>

            <TabsContent value="analyzer">
              <RoutineAnalyzer />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
