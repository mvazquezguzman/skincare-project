"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"

interface SkinProfile {
  topConcerns: string[]
  skinFeel: string
  makeupUsage: string
  sunscreenPreference: string
  ingredientPreferences: string[]
}

const SkinQuiz = () => {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [skinProfile, setSkinProfile] = useState<Partial<SkinProfile>>({})
  const [showResults, setShowResults] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const steps = [
    "Top Concerns",
    "Skin Feel",
    "Makeup Usage",
    "Sunscreen Preference",
    "Ingredient Preferences"
  ]

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save quiz results to database
      setIsSaving(true)
      try {
        if (isAuthenticated && user) {
          // Map quiz results to database fields
          const updateData = {
            skin_type: skinProfile.skinFeel,
            skin_concerns: skinProfile.topConcerns || [],
            skin_goals: [], // Could be derived from concerns or added as separate step
            allergies: skinProfile.ingredientPreferences || [],
            quiz_completed: true,
            quiz_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id)

          if (error) {
            console.error('Error saving quiz results:', error)
            // Fallback to localStorage if database save fails
            localStorage.setItem('skinwise-quiz-results', JSON.stringify(skinProfile))
          } else {
            console.log('Quiz results saved to database successfully')
            setSaveSuccess(true)
            // Clear localStorage if it exists
            localStorage.removeItem('skinwise-quiz-results')
          }
        } else {
          // User not authenticated, save to localStorage as fallback
          localStorage.setItem('skinwise-quiz-results', JSON.stringify(skinProfile))
        }
      } catch (error) {
        console.error('Error saving quiz results:', error)
        // Fallback to localStorage
        localStorage.setItem('skinwise-quiz-results', JSON.stringify(skinProfile))
      } finally {
        setIsSaving(false)
        setShowResults(true)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-sans font-bold text-3xl text-foreground mb-4">Your Skin Profile</h1>
            <p className="font-sans text-muted-foreground">Based on your answers, here's your personalized skin analysis</p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                <strong>Your personalized skincare profile is ready!</strong> 
                {saveSuccess && isAuthenticated ? (
                  <span className="text-green-600 font-medium"> Your results have been saved to your profile.</span>
                ) : (
                  " Save your results to your profile to access dermatologist-developed recommendations and track your progress."
                )}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader> <CardTitle className="flex items-center gap-2"> <MagnifyingGlassIcon className="h-5 w-5 text-primary" /> Top Concerns </CardTitle> </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skinProfile.topConcerns?.map((concern, index) => (
                    <Badge key={index} variant="outline">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader> <CardTitle>Skin Feel</CardTitle> </CardHeader>
              <CardContent>
                <Badge variant="secondary">
                  {skinProfile.skinFeel || "Not specified"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader> <CardTitle>Makeup Usage</CardTitle> </CardHeader>
              <CardContent>
                <Badge variant="secondary">
                  {skinProfile.makeupUsage || "Not specified"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader> <CardTitle>Sunscreen Preference</CardTitle> </CardHeader>
              <CardContent>
                <Badge variant="secondary">
                  {skinProfile.sunscreenPreference || "Not specified"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader> <CardTitle>Ingredient Preferences</CardTitle> </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skinProfile.ingredientPreferences?.map((preference, index) => (
                    <Badge key={index} variant="outline">
                      {preference}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-x-4">
            <Button asChild size="lg" className="font-sans">
              <Link href="/user-profile">Save to My Profile</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-sans">
              <Link href="/skin-routine">Create My Routine</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-sans font-bold text-2xl md:text-3xl text-foreground mb-2">Personalized Skin Quiz</h1>
          <p className="font-sans text-sm text-muted-foreground">Answer a few questions to get your custom skincare routine</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground"> Step {currentStep + 1} of {steps.length} </span>
            <span className="text-sm text-muted-foreground"> {Math.round(((currentStep + 1) / steps.length) * 100)}% </span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        </div>

        {/* Quiz Content */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{steps[currentStep]}</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[60vh] overflow-y-auto">
            {currentStep === 0 && (
              <TopConcernsStep 
                value={skinProfile.topConcerns || []} 
                onChange={(value) => setSkinProfile(prev => ({ ...prev, topConcerns: value }))} 
              />
            )}
            {currentStep === 1 && (
              <SkinFeelStep 
                value={skinProfile.skinFeel} 
                onChange={(value) => setSkinProfile(prev => ({ ...prev, skinFeel: value }))} 
              />
            )}
            {currentStep === 2 && (
              <MakeupUsageStep 
                value={skinProfile.makeupUsage} 
                onChange={(value) => setSkinProfile(prev => ({ ...prev, makeupUsage: value }))} 
              />
            )}
            {currentStep === 3 && (
              <SunscreenPreferenceStep 
                value={skinProfile.sunscreenPreference} 
                onChange={(value) => setSkinProfile(prev => ({ ...prev, sunscreenPreference: value }))} 
              />
            )}
            {currentStep === 4 && (
              <IngredientPreferencesStep 
                value={skinProfile.ingredientPreferences || []} 
                onChange={(value) => setSkinProfile(prev => ({ ...prev, ingredientPreferences: value }))} 
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStep === 0}
              className="font-sans text-sm"
              size="sm"
            >
              <ArrowLeftIcon className="mr-1 h-4 w-4" />
              Back
            </Button>
            
            {/* Skip Quiz Button */}
            <Button 
              variant="ghost" 
              onClick={() => router.push('/user-profile')}
              className="font-sans text-muted-foreground text-sm"
              size="sm"
            >
              Skip Quiz
            </Button>
          </div>
          
          <Button 
            onClick={handleNext}
            className="font-sans text-sm"
            size="sm"
            disabled={!isStepValid(currentStep, skinProfile) || isSaving}
          >
            {currentStep === steps.length - 1 ? (
              <>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                    Complete Quiz
                  </>
                )}
              </>
            ) : (
              <>
                Next
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step Components
function TopConcernsStep({ value, onChange }: { value: string[], onChange: (value: string[]) => void }) {
  const concerns = [
    "Texture",
    "Dullness",
    "Wrinkles/Fine Lines",
    "Loss of Firmness (Aging)",
    "Active Acne Breakouts",
    "Help Prevent New Acne",
    "Dryness",
    "Dark Spots/Discoloration",
    "Dark Circles",
    "Oiliness/Shine",
    "Redness",
    "Puffiness Around Eyes",
    "Post-Acne Marks",
    "Establishing a General Skincare Routine",
    "Prefer Not to Answer"
  ]

  const handleChange = (concern: string, checked: boolean) => {
    if (checked && value.length < 2) {
      onChange([...value, concern])
    } else if (!checked) {
      onChange(value.filter(c => c !== concern))
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-3">Please select your top two concerns:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {concerns.map((concern) => (
          <div key={concern} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-muted/50">
            <Checkbox 
              id={concern}
              checked={value.includes(concern)}
              onCheckedChange={(checked) => handleChange(concern, checked as boolean)}
              disabled={!value.includes(concern) && value.length >= 2}
            />
            <Label htmlFor={concern} className="cursor-pointer text-sm"> {concern} </Label>
          </div>
        ))}
      </div>
      {value.length > 0 && (
        <div className="mt-3 p-2 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Selected: {value.join(", ")} ({value.length}/2)</p>
        </div>
      )}
    </div>
  )
}

function SkinFeelStep({ value, onChange }: { value?: string, onChange: (value: string) => void }) {
  const options = [
    { value: "dry", label: "Dry", description: "My whole face feels tight and can be flaky." },
    { value: "oily", label: "Oily", description: "My whole face feels greasy and looks shiny." },
    { value: "combination", label: "Combination", description: "I feel tightness on my cheeks, but my T-zone (nose & forehead) is oily or shiny." },
    { value: "normal", label: "Normal/Balanced", description: "My skin feels comfortable, not too oily, and not too dry." }
  ]

  return (
    <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value={option.value} id={option.value} />
          <div className="flex-1">
            <Label htmlFor={option.value} className="font-medium cursor-pointer text-sm">{option.label}</Label>
            <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
          </div>
        </div>
      ))}
    </RadioGroup>
  )
}

function MakeupUsageStep({ value, onChange }: { value?: string, onChange: (value: string) => void }) {
  const options = [
    { value: "none", label: "I don't wear makeup" },
    { value: "eyes-only", label: "Eye areas only", description: "e.g., mascara, eyeshadow" },
    { value: "full-face", label: "Full face", description: "e.g., foundation, concealer, etc." }
  ]

  return (
    <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value={option.value} id={option.value} />
          <div className="flex-1">
            <Label htmlFor={option.value} className="font-medium cursor-pointer text-sm">{option.label}</Label>
            {option.description && (
              <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
            )}
          </div>
        </div>
      ))}
    </RadioGroup>
  )
}

function SunscreenPreferenceStep({ value, onChange }: { value?: string, onChange: (value: string) => void }) {
  const options = [
    { value: "separate", label: "A separate sunscreen product" },
    { value: "combined", label: "Sunscreen combined with my moisturizer", description: "Moisturizer with SPF" }
  ]

  return (
    <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value={option.value} id={option.value} />
          <div className="flex-1">
            <Label htmlFor={option.value} className="font-medium cursor-pointer text-sm">{option.label}</Label>
            {option.description && (
              <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
            )}
          </div>
        </div>
      ))}
    </RadioGroup>
  )
}

function IngredientPreferencesStep({ value, onChange }: { value: string[], onChange: (value: string[]) => void }) {
  const preferences = [
    "Fragrance-Free",
    "Silicone-Free",
    "Paraben-Free",
    "Sulfate-Free",
    "Cruelty-Free",
    "Vegan",
    "Clean Ingredients",
    "All Natural",
    "None of the above / No preferences"
  ]

  const handleChange = (preference: string, checked: boolean) => {
    if (checked) {
      onChange([...value, preference])
    } else {
      onChange(value.filter(p => p !== preference))
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-3">Do you have any ingredient allergies or product preferences? (Please check all that apply)</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {preferences.map((preference) => (
          <div key={preference} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-muted/50">
            <Checkbox 
              id={preference}
              checked={value.includes(preference)}
              onCheckedChange={(checked) => handleChange(preference, checked as boolean)}
            />
            <Label htmlFor={preference} className="cursor-pointer text-sm">{preference}</Label>
          </div>
        ))}
      </div>
    </div>
  )
}

function isStepValid(step: number, profile: Partial<SkinProfile>): boolean {
  switch (step) {
    case 0: return (profile.topConcerns?.length || 0) > 0
    case 1: return !!profile.skinFeel
    case 2: return !!profile.makeupUsage
    case 3: return !!profile.sunscreenPreference
    case 4: return (profile.ingredientPreferences?.length || 0) > 0
    default: return false
  }
}

export default SkinQuiz