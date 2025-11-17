"use client"

import { useState, useEffect } from "react"
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
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"

interface SkinProfile {
  topConcerns: string[]
  skinFeel: string
  makeupUsage: string
  ingredientPreferences: string[]
  budgetRange: string
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
    "Ingredient Preferences",
    "Budget Range"
  ]

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save quiz results to database
      setIsSaving(true)
      try {
        if (isAuthenticated && user) {
          // Map quiz results to database fields - start with basic fields
          const updateData: any = {
            skin_type: skinProfile.skinFeel,
            skin_concerns: skinProfile.topConcerns || [],
            skin_goals: [], // Could be derived from concerns or added as separate step
            allergies: [], // Keep separate from ingredient preferences
            updated_at: new Date().toISOString()
          }

          // Add quiz completion fields if they exist
          updateData.quiz_completed = true
          updateData.quiz_completed_at = new Date().toISOString()

          // Add new fields if they exist in the database
          if (skinProfile.makeupUsage) {
            updateData.makeup_usage = skinProfile.makeupUsage
          }
          if (skinProfile.ingredientPreferences && skinProfile.ingredientPreferences.length > 0) {
            updateData.ingredient_preferences = skinProfile.ingredientPreferences
          }
          if (skinProfile.budgetRange) {
            updateData.budget_range = skinProfile.budgetRange
          }

          // Try to save with all fields first
          let { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id)

          // If that fails, try saving without the new fields
          if (error && (error.code === 'PGRST116' || error.message.includes('column') || error.message.includes('does not exist'))) {
            console.log('New columns not found, trying with basic fields only...')
            
            const basicUpdateData = {
              skin_type: skinProfile.skinFeel,
              skin_concerns: skinProfile.topConcerns || [],
              skin_goals: [],
              allergies: [],
              updated_at: new Date().toISOString()
            }

            const { error: basicError } = await supabase
              .from('users')
              .update(basicUpdateData)
              .eq('id', user.id)

            if (basicError) {
              console.error('Error saving basic quiz results:', basicError)
              // Fallback to localStorage if database save fails
              localStorage.setItem('skinwise-quiz-results', JSON.stringify(skinProfile))
            } else {
              console.log('Basic quiz results saved to database successfully')
              setSaveSuccess(true)
              // Save additional data to localStorage as fallback
              localStorage.setItem('skinwise-quiz-extra-data', JSON.stringify({
                makeupUsage: skinProfile.makeupUsage,
                ingredientPreferences: skinProfile.ingredientPreferences,
                budgetRange: skinProfile.budgetRange
              }))
              // Clear old localStorage if it exists
              localStorage.removeItem('skinwise-quiz-results')
            }
          } else if (error) {
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
            <p className="font-sans text-muted-foreground">Based on your answers, here&rsquo;s your personalized skin analysis</p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                <strong>Your personalized skincare profile is ready!</strong> 
                {saveSuccess && isAuthenticated ? (
                  <span className="text-green-600 font-medium"> Your results have been automatically saved to your profile.</span>
                ) : (
                  " Click &lsquo;Save to My Profile&rsquo; to save your results and access dermatologist-developed recommendations and track your progress."
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

            <Card>
              <CardHeader> <CardTitle>Budget Range</CardTitle> </CardHeader>
              <CardContent>
                <Badge variant="secondary">
                  {skinProfile.budgetRange || "Not specified"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="font-sans"
              onClick={async () => {
                if (isAuthenticated && user) {
                  setIsSaving(true)
                  try {
                    // First, let's try to save only the basic fields that we know exist
                    const updateData: any = {
                      skin_type: skinProfile.skinFeel,
                      skin_concerns: skinProfile.topConcerns || [],
                      skin_goals: [], // Could be derived from concerns or added as separate step
                      allergies: [], // Keep separate from ingredient preferences
                      updated_at: new Date().toISOString()
                    }

                    // Add quiz completion fields if they exist
                    updateData.quiz_completed = true
                    updateData.quiz_completed_at = new Date().toISOString()

                    // Try to add the new fields if they exist
                    if (skinProfile.makeupUsage) {
                      updateData.makeup_usage = skinProfile.makeupUsage
                    }
                    if (skinProfile.ingredientPreferences && skinProfile.ingredientPreferences.length > 0) {
                      updateData.ingredient_preferences = skinProfile.ingredientPreferences
                    }
                    if (skinProfile.budgetRange) {
                      updateData.budget_range = skinProfile.budgetRange
                    }

                    // Try to save with all fields first
                    let { error } = await supabase
                      .from('users')
                      .update(updateData)
                      .eq('id', user.id)

                    // If that fails, try saving without the new fields
                    if (error && (error.code === 'PGRST116' || error.message.includes('column') || error.message.includes('does not exist'))) {
                      console.log('New columns not found, trying with basic fields only...')
                      
                      const basicUpdateData = {
                        skin_type: skinProfile.skinFeel,
                        skin_concerns: skinProfile.topConcerns || [],
                        skin_goals: [],
                        allergies: [],
                        updated_at: new Date().toISOString()
                      }

                      const { error: basicError } = await supabase
                        .from('users')
                        .update(basicUpdateData)
                        .eq('id', user.id)

                      if (basicError) {
                        console.error('Error saving basic quiz results:', basicError)
                        alert(`Failed to save to profile: ${basicError.message}. Please try again.`)
                      } else {
                        console.log('Basic quiz results saved successfully')
                        setSaveSuccess(true)
                        // Save additional data to localStorage as fallback
                        localStorage.setItem('skinwise-quiz-extra-data', JSON.stringify({
                          makeupUsage: skinProfile.makeupUsage,
                          ingredientPreferences: skinProfile.ingredientPreferences,
                          budgetRange: skinProfile.budgetRange
                        }))
                        router.push('/user-profile')
                      }
                    } else if (error) {
                      console.error('Error saving quiz results:', error)
                      console.error('Error details:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                      })
                      alert(`Failed to save to profile: ${error.message}. Please try again.`)
                    } else {
                      console.log('Quiz results saved to database successfully')
                      setSaveSuccess(true)
                      // Navigate to profile page after successful save
                      router.push('/user-profile')
                    }
                  } catch (error) {
                    console.error('Error saving quiz results:', error)
                    alert('Failed to save to profile. Please try again.')
                  } finally {
                    setIsSaving(false)
                  }
                } else {
                  // User not authenticated, redirect to sign in
                  router.push('/auth/signin')
                }
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                  Save to My Profile
                </>
              )}
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
              <IngredientPreferencesStep 
                value={skinProfile.ingredientPreferences || []} 
                onChange={(value) => setSkinProfile(prev => ({ ...prev, ingredientPreferences: value }))} 
              />
            )}
            {currentStep === 4 && (
              <BudgetRangeStep 
                value={skinProfile.budgetRange} 
                onChange={(value) => setSkinProfile(prev => ({ ...prev, budgetRange: value }))} 
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
  const [concerns, setConcerns] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSkinConcerns() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch all products with skin_concerns in batches
        const batchSize = 1000
        let allProducts: any[] = []
        let from = 0
        let hasMore = true

        while (hasMore) {
          const { data: products, error: fetchError } = await supabase
            .from('all_products')
            .select('skin_concerns')
            .range(from, from + batchSize - 1)

          if (fetchError) {
            throw fetchError
          }

          if (products && products.length > 0) {
            allProducts = [...allProducts, ...products]
            from += batchSize
            hasMore = products.length === batchSize
          } else {
            hasMore = false
          }
        }

        // Extract all unique skin concerns from the products
        const allConcernsSet = new Set<string>()
        
        allProducts.forEach((product) => {
          if (product.skin_concerns) {
            try {
              // Handle both array and JSONB formats
              let concernsArray: string[] = []
              
              if (Array.isArray(product.skin_concerns)) {
                concernsArray = product.skin_concerns
              } else if (typeof product.skin_concerns === 'string') {
                // Try to parse if it's a JSON string
                concernsArray = JSON.parse(product.skin_concerns)
              } else {
                // Try to convert JSONB object to array
                concernsArray = JSON.parse(JSON.stringify(product.skin_concerns))
              }
              
              if (Array.isArray(concernsArray)) {
                concernsArray.forEach((concern: any) => {
                  if (concern && typeof concern === 'string' && concern.trim()) {
                    allConcernsSet.add(concern.trim())
                  }
                })
              }
            } catch (parseError) {
              // Skip products with invalid skin_concerns format
              console.warn('Failed to parse skin_concerns for product:', parseError)
            }
          }
        })

        // Convert set to sorted array
        const uniqueConcerns = Array.from(allConcernsSet).sort()
        
        // Add "Prefer Not to Answer" option if not already present
        if (!uniqueConcerns.includes("Prefer Not to Answer")) {
          uniqueConcerns.push("Prefer Not to Answer")
        }

        setConcerns(uniqueConcerns)
      } catch (err) {
        console.error('Error fetching skin concerns:', err)
        setError('Failed to load skin concerns. Please try again.')
        // Fallback to default concerns if fetch fails
        setConcerns([
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
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSkinConcerns()
  }, [])

  const handleChange = (concern: string, checked: boolean) => {
    if (checked && value.length < 2) {
      onChange([...value, concern])
    } else if (!checked) {
      onChange(value.filter(c => c !== concern))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground mb-3">Please select your top two concerns:</p>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Loading skin concerns...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground mb-3">Please select your top two concerns:</p>
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
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
      </div>
    )
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
    { value: "normal", label: "Normal", description: "My skin feels comfortable, not too oily, and not too dry." }
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
    { value: "none", label: "I don&rsquo;t wear makeup" },
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

function BudgetRangeStep({ value, onChange }: { value?: string, onChange: (value: string) => void }) {
  const options = [
    { value: "budget", label: "Budget-Friendly", description: "Below $20 per product" },
    { value: "moderate", label: "Moderate", description: "Up to $30 per product" },
    { value: "premium", label: "Premium", description: "Up to $50 per product" },
    { value: "luxury", label: "Luxury", description: "$50+ per product" },
    { value: "flexible", label: "Flexible", description: "Budget varies based on product effectiveness" }
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

function isStepValid(step: number, profile: Partial<SkinProfile>): boolean {
  switch (step) {
    case 0: return (profile.topConcerns?.length || 0) > 0
    case 1: return !!profile.skinFeel
    case 2: return !!profile.makeupUsage
    case 3: return (profile.ingredientPreferences?.length || 0) > 0
    case 4: return !!profile.budgetRange
    default: return false
  }
}

export default SkinQuiz