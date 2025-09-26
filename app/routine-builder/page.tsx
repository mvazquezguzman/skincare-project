"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import { Progress } from "@/components/ui/progress"
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
} from "@heroicons/react/24/outline"

const RoutineBuilder = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [skinProfile, setSkinProfile] = useState<Partial<SkinProfile>>({})
  const [customRoutine, setCustomRoutine] = useState<{
    morning: RoutineStep[]
    evening: RoutineStep[]
  }>({
    morning: [],
    evening: [],
  })
  const [showResults, setShowResults] = useState(false)

  const steps = ["Skin Type", "Concerns", "Sensitivity", "Experience", "Goals", "Review"]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      generateRoutine()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateRoutine = () => {
    // Simple routine generation logic based on skin profile
    const morningRoutine = [...routineSteps.morning]
    const eveningRoutine = [...routineSteps.evening]

    // Customize based on skin type and concerns
    if (skinProfile.skinType === "Oily") {
      morningRoutine[1] = {
        ...morningRoutine[1],
        name: "Niacinamide Serum",
        ingredient: "Niacinamide",
        description: "Control oil production and minimize pores",
      }
    }

    if (skinProfile.concerns?.includes("Acne")) {
      eveningRoutine[1] = {
        ...eveningRoutine[1],
        name: "BHA Treatment",
        ingredient: "Salicylic Acid",
        description: "Unclog pores and treat acne",
      }
    }

    if (skinProfile.sensitivity === "High") {
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
        <Navigation />
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

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="font-montserrat font-black text-2xl text-foreground">Build Your Routine</h2>
            <p className="font-open-sans text-muted-foreground">
              Answer a few questions to get a personalized skincare routine
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-open-sans text-muted-foreground">
                <span>
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
              <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-montserrat font-bold text-xl text-foreground">
                  {currentStep === 0 && "What's your skin type?"}
                  {currentStep === 1 && "What are your main skin concerns?"}
                  {currentStep === 2 && "How sensitive is your skin?"}
                  {currentStep === 3 && "What's your skincare experience level?"}
                  {currentStep === 4 && "What are your skincare goals?"}
                  {currentStep === 5 && "Review your profile"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStep === 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {skinTypes.map((type) => (
                      <Button
                        key={type}
                        variant={skinProfile.skinType === type ? "default" : "outline"}
                        onClick={() => setSkinProfile({ ...skinProfile, skinType: type })}
                        className="font-open-sans"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="grid grid-cols-2 gap-3">
                    {skinConcerns.map((concern) => (
                      <Button
                        key={concern}
                        variant={skinProfile.concerns?.includes(concern) ? "default" : "outline"}
                        onClick={() => {
                          const concerns = skinProfile.concerns || []
                          const newConcerns = concerns.includes(concern)
                            ? concerns.filter((c) => c !== concern)
                            : [...concerns, concern]
                          setSkinProfile({ ...skinProfile, concerns: newConcerns })
                        }}
                        className="font-open-sans"
                      >
                        {concern}
                      </Button>
                    ))}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid grid-cols-3 gap-3">
                    {sensitivityLevels.map((level) => (
                      <Button
                        key={level}
                        variant={skinProfile.sensitivity === level ? "default" : "outline"}
                        onClick={() => setSkinProfile({ ...skinProfile, sensitivity: level })}
                        className="font-open-sans"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid grid-cols-3 gap-3">
                    {experienceLevels.map((level) => (
                      <Button
                        key={level}
                        variant={skinProfile.experience === level ? "default" : "outline"}
                        onClick={() => setSkinProfile({ ...skinProfile, experience: level })}
                        className="font-open-sans"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="grid grid-cols-2 gap-3">
                    {skinGoals.map((goal) => (
                      <Button
                        key={goal}
                        variant={skinProfile.goals?.includes(goal) ? "default" : "outline"}
                        onClick={() => {
                          const goals = skinProfile.goals || []
                          const newGoals = goals.includes(goal) ? goals.filter((g) => g !== goal) : [...goals, goal]
                          setSkinProfile({ ...skinProfile, goals: newGoals })
                        }}
                        className="font-open-sans"
                      >
                        {goal}
                      </Button>
                    ))}
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-montserrat font-bold text-sm text-foreground mb-2">Skin Type</h4>
                        <Badge variant="secondary" className="font-open-sans">
                          {skinProfile.skinType}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-montserrat font-bold text-sm text-foreground mb-2">Sensitivity</h4>
                        <Badge variant="secondary" className="font-open-sans">
                          {skinProfile.sensitivity}
                        </Badge>
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
                    <div>
                      <h4 className="font-montserrat font-bold text-sm text-foreground mb-2">Goals</h4>
                      <div className="flex flex-wrap gap-2">
                        {skinProfile.goals?.map((goal) => (
                          <Badge key={goal} variant="outline" className="font-open-sans">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="font-open-sans bg-transparent"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && !skinProfile.skinType) ||
                  (currentStep === 1 && (!skinProfile.concerns || skinProfile.concerns.length === 0)) ||
                  (currentStep === 2 && !skinProfile.sensitivity) ||
                  (currentStep === 3 && !skinProfile.experience) ||
                  (currentStep === 4 && (!skinProfile.goals || skinProfile.goals.length === 0))
                }
                className="font-open-sans"
              >
                {currentStep === steps.length - 1 ? "Generate Routine" : "Next"}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
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
  sensitivity: string
  experience: string
  goals: string[]
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

const skinTypes = ["Oily", "Dry", "Combination", "Normal", "Sensitive"]
const skinConcerns = [
  "Acne",
  "Dark Spots",
  "Fine Lines",
  "Large Pores",
  "Dullness",
  "Dehydration",
  "Redness",
  "Uneven Texture",
]
const sensitivityLevels = ["Low", "Medium", "High"]
const experienceLevels = ["Beginner", "Intermediate", "Advanced"]
const skinGoals = ["Clear Skin", "Anti-Aging", "Hydration", "Brightening", "Oil Control", "Barrier Repair"]

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
  const [currentStep, setCurrentStep] = useState(0)
  const [skinProfile, setSkinProfile] = useState<Partial<SkinProfile>>({})
  const [customRoutine, setCustomRoutine] = useState<{
    morning: RoutineStep[]
    evening: RoutineStep[]
  }>({
    morning: [],
    evening: [],
  })
  const [showResults, setShowResults] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="builder" className="font-open-sans flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Routine Builder
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
