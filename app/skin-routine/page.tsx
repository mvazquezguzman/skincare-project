"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { UserProfile, RoutineStep } from "@/lib/profile-types"
import { getUserProfile, saveUserProfile, parseArrayField } from "@/lib/profile-utils"
import { getCurrentRoutine, saveRoutineVersion } from "@/lib/routine-service"
import { extractExcludeProductIds, extractProductIdsFromStep, extractProductIdFromIdentifier } from "@/lib/routine-helpers"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoadingState from "@/components/profile/LoadingState"
import AuthDenied from "@/components/profile/AuthDenied"
import PageHeader from "@/components/routine/PageHeader"
import ProfileSummary from "@/components/routine/ProfileSummary"
import RoutineGeneratorButton from "@/components/routine/RoutineGeneratorButton"
import RoutineDisplay from "@/components/routine/RoutineDisplay"
import RoutineAnalyzer from "@/components/routine/RoutineAnalyzer"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SkinRoutinePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [generatedRoutine, setGeneratedRoutine] = useState<{
    morning: RoutineStep[]
    evening: RoutineStep[]
  } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"morning" | "evening">("morning")
  const [activeMainTab, setActiveMainTab] = useState("builder")
  const [error, setError] = useState<string | null>(null)
  const [authCheckComplete, setAuthCheckComplete] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [regeneratingStepId, setRegeneratingStepId] = useState<string | null>(null)
  const [currentRoutineId, setCurrentRoutineId] = useState<string | null>(null)
  const [isSavingAnalysis, setIsSavingAnalysis] = useState(false)
  const [isAnalysisSaved, setIsAnalysisSaved] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthCheckComplete(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Refresh routine when switching to analyzer tab
  useEffect(() => {
    const refreshRoutine = async () => {
      if (!user || activeMainTab !== "analyzer" || !profile) return

      try {
        const userRoutine = await getCurrentRoutine(user.id)
        if (userRoutine && userRoutine.routine) {
          const updatedProfile = {
            ...profile,
            currentRoutine: {
              morning: userRoutine.routine.morning || [],
              evening: userRoutine.routine.evening || []
            }
          }
          saveUserProfile(updatedProfile)
          setProfile(updatedProfile)
        }
      } catch (error) {
        console.error('Error refreshing routine:', error)
      }
    }

    refreshRoutine()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMainTab, user?.id])

  useEffect(() => {
    const initializeProfile = async () => {
      if (!user) return

      try {
        // Fetch user profile from database
        const { data: dbProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          return
        }

        // Fetch current routine from database
        let currentRoutine: { morning: RoutineStep[]; evening: RoutineStep[] } = { morning: [], evening: [] }
        try {
          const userRoutine = await getCurrentRoutine(user.id)
          if (userRoutine && userRoutine.routine) {
            currentRoutine = {
              morning: userRoutine.routine.morning || [],
              evening: userRoutine.routine.evening || []
            }
          }
        } catch (error) {
          console.error('Error fetching current routine:', error)
          // Fallback to empty routine if fetch fails
        }

        // Create profile from database data
        const userProfile: UserProfile = {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          bio: dbProfile.bio || undefined,
          city: dbProfile.city || undefined,
          skinType: dbProfile.skin_type as UserProfile["skinType"] || null,
          skinConcerns: parseArrayField(dbProfile.skin_concerns),
          skinGoals: parseArrayField(dbProfile.skin_goals),
          allergies: parseArrayField(dbProfile.allergies || dbProfile.ingredient_preferences),
          budgetRange: dbProfile.budget_range || undefined,
          currentRoutine: currentRoutine
        }

        // Check for extra quiz data in localStorage
        try {
          const extraData = localStorage.getItem('skinwise-quiz-extra-data')
          if (extraData) {
            const parsedExtraData = JSON.parse(extraData)
            if (parsedExtraData.ingredientPreferences?.length > 0) {
              userProfile.allergies = [...userProfile.allergies, ...parsedExtraData.ingredientPreferences]
            }
            if (parsedExtraData.budgetRange && !userProfile.budgetRange) {
              userProfile.budgetRange = parsedExtraData.budgetRange
            }
          }
        } catch {
          // No extra quiz data found
        }
        
        saveUserProfile(userProfile)
        setProfile(userProfile)
      } catch (error) {
        console.error('Error initializing profile:', error)
        // Fallback to localStorage if database fails
        const userProfile = getUserProfile()
        if (userProfile) {
          setProfile(userProfile)
        }
      }
    }

    if (isAuthenticated && user) {
      initializeProfile()
    }
  }, [user, isAuthenticated])

  const handleGenerateRoutine = async () => {
    if (!profile) return

    setIsGenerating(true)
    setError(null)

    try {
      const excludeProductIds = extractExcludeProductIds(generatedRoutine)

      const response = await fetch('/api/generate-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          excludeProductIds: excludeProductIds.length > 0 ? excludeProductIds : undefined
        })
      })

      if (!response.ok) {
        let errorMessage = 'Failed to generate routine'
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch (e) {
          // If response is not JSON (e.g., HTML error page), use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setGeneratedRoutine(data.routine)
    } catch (error) {
      console.error('Error generating routine:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate routine')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveRoutine = async () => {
    if (!profile || !generatedRoutine || !user) return

    setIsSaving(true)
    setError(null)
    
    try {
      // Save routine to database
      await saveRoutineVersion(user.id, generatedRoutine)
      
      // Also update local profile for consistency
      const updatedProfile = {
        ...profile,
        currentRoutine: generatedRoutine
      }
      
      saveUserProfile(updatedProfile)
      setProfile(updatedProfile)
      
      // Redirect to profile page
      router.push('/user-profile')
    } catch (error) {
      console.error('Error saving routine:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save routine. Please try again.'
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAnalyzeRoutine = async () => {
    if (!profile || !user) return

    setIsAnalyzing(true)
    setAnalysisError(null)
    setAnalysisResult(null)
    setIsAnalysisSaved(false)

    try {
      const response = await fetch('/api/analyze-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        let errorMessage = 'Failed to analyze routine'
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch (e) {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      // Extract routineId from response if present
      if (data.routineId) {
        setCurrentRoutineId(data.routineId)
      }
      // Remove routineId from analysis result before storing
      const { routineId, ...analysisData } = data
      setAnalysisResult(analysisData)
    } catch (error) {
      console.error('Error analyzing routine:', error)
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze routine')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveAnalysis = async () => {
    if (!analysisResult || !currentRoutineId || !user) return

    setIsSavingAnalysis(true)
    setAnalysisError(null)

    try {
      const response = await fetch('/api/save-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          routineId: currentRoutineId,
          analysisResult: analysisResult
        })
      })

      if (!response.ok) {
        let errorMessage = 'Failed to save analysis'
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch (e) {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      setIsAnalysisSaved(true)
    } catch (error) {
      console.error('Error saving analysis:', error)
      setAnalysisError(error instanceof Error ? error.message : 'Failed to save analysis')
      alert(error instanceof Error ? error.message : 'Failed to save analysis')
    } finally {
      setIsSavingAnalysis(false)
    }
  }

  const handleRemoveProduct = async (stepId: string, productId: string, timeOfDay: "morning" | "evening") => {
    if (!generatedRoutine || !profile) return

    // Find the step
    const steps = generatedRoutine[timeOfDay]
    const step = steps.find(s => s.id === stepId)
    if (!step) return

    // Get all product IDs from the step to exclude them
    const stepProductIds = extractProductIdsFromStep(step)
    const removedProductIds = extractProductIdFromIdentifier(productId)
    
    // Combine all product IDs to exclude (all products in step + the removed product)
    const excludeProductIds = [...stepProductIds, ...removedProductIds]

    // Regenerate the step
    await handleRegenerateStep(stepId, timeOfDay, excludeProductIds)
  }

  const handleSelectProduct = (stepId: string, productId: string, timeOfDay: "morning" | "evening") => {
    if (!generatedRoutine) return

    const steps = generatedRoutine[timeOfDay]
    const step = steps.find(s => s.id === stepId)
    if (!step) return

    // Get products array
    const products = (step as any).products || []
    if (products.length === 0) return

    // Find the selected product
    const getProductIdentifier = (product: any) => {
      if (product.id) return product.id
      if (product.brand && product.productName) {
        return `${product.brand}-${product.productName}`
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .trim()
      }
      return product.productName || ''
    }

    const selectedProductIndex = products.findIndex((p: any) => getProductIdentifier(p) === productId)
    if (selectedProductIndex === -1) return

    // Reorder products: move selected product to the front
    const reorderedProducts = [
      products[selectedProductIndex],
      ...products.filter((_: any, index: number) => index !== selectedProductIndex)
    ]

    // Update the step with reordered products
    const updatedStep = {
      ...step,
      products: reorderedProducts,
      // Update legacy fields to match the selected product
      productName: reorderedProducts[0].productName,
      brand: reorderedProducts[0].brand,
      price: reorderedProducts[0].price,
      imageUrl: reorderedProducts[0].imageUrl,
      productURL: reorderedProducts[0].productURL,
      description: reorderedProducts[0].description
    }

    // Update the routine for the current time of day
    let updatedRoutine = {
      ...generatedRoutine,
      [timeOfDay]: steps.map(s => s.id === stepId ? updatedStep : s)
    }

    // If selecting in morning routine, also update the corresponding evening step
    // Categories that are shared: cleanser, toner, serum, moisturizer
    const sharedCategories = ['cleanser', 'toner', 'serum', 'moisturizer']
    if (timeOfDay === 'morning' && sharedCategories.includes(step.category)) {
      const eveningSteps = generatedRoutine.evening
      const correspondingEveningStep = eveningSteps.find(s => s.category === step.category)
      
      if (correspondingEveningStep) {
        const eveningProducts = (correspondingEveningStep as any).products || []
        const selectedProduct = reorderedProducts[0] // The product that was just selected in morning
        
        // Find the selected product in the evening step by matching identifier
        const selectedProductId = getProductIdentifier(selectedProduct)
        const eveningProductIndex = eveningProducts.findIndex((p: any) => 
          getProductIdentifier(p) === selectedProductId
        )
        
        let updatedEveningProducts: any[]
        
        if (eveningProductIndex >= 0) {
          // Product exists in evening - move it to the front
          updatedEveningProducts = [
            eveningProducts[eveningProductIndex],
            ...eveningProducts.filter((_: any, index: number) => index !== eveningProductIndex)
          ]
        } else if (eveningProducts.length === 0) {
          // No products in evening yet - copy from morning
          updatedEveningProducts = [...reorderedProducts]
        } else {
          // Product doesn't exist in evening, but evening has products
          // Check if they have the same product set (just different order)
          const getProductIdSet = (prods: any[]) => {
            return new Set(prods.map((p: any) => getProductIdentifier(p)))
          }
          
          const morningProductIds = getProductIdSet(reorderedProducts)
          const eveningProductIds = getProductIdSet(eveningProducts)
          
          const hasSameProductSet = morningProductIds.size === eveningProductIds.size &&
            Array.from(morningProductIds).every(id => eveningProductIds.has(id))
          
          if (hasSameProductSet) {
            // Same products, just sync the order from morning
            updatedEveningProducts = [...reorderedProducts]
          } else {
            // Different products - keep evening products but try to match the selected one
            // For now, just keep evening as is (user can manually select if needed)
            updatedEveningProducts = eveningProducts
          }
        }
        
        // Update the evening step with the reordered products
        const updatedEveningStep = {
          ...correspondingEveningStep,
          products: updatedEveningProducts,
          // Update legacy fields to match the selected product (first in array)
          productName: updatedEveningProducts[0]?.productName || correspondingEveningStep.productName,
          brand: updatedEveningProducts[0]?.brand || correspondingEveningStep.brand,
          price: updatedEveningProducts[0]?.price || correspondingEveningStep.price,
          imageUrl: updatedEveningProducts[0]?.imageUrl || correspondingEveningStep.imageUrl,
          productURL: updatedEveningProducts[0]?.productURL || correspondingEveningStep.productURL,
          description: updatedEveningProducts[0]?.description || correspondingEveningStep.description
        }

        updatedRoutine = {
          ...updatedRoutine,
          evening: eveningSteps.map(s => s.id === correspondingEveningStep.id ? updatedEveningStep : s)
        }
      }
    }

    setGeneratedRoutine(updatedRoutine)
  }

  const handleRegenerateStep = async (
    stepId: string, 
    timeOfDay: "morning" | "evening",
    excludeProductIds?: string[]
  ) => {
    if (!generatedRoutine || !profile) return

    setRegeneratingStepId(stepId)
    setError(null)

    try {
      // Find the step to get its category
      const steps = generatedRoutine[timeOfDay]
      const step = steps.find(s => s.id === stepId)
      if (!step) {
        throw new Error('Step not found')
      }

      // If excludeProductIds not provided, get all products from the step
      let excludeIds = excludeProductIds
      if (!excludeIds) {
        excludeIds = extractProductIdsFromStep(step)
      }

      // Call the regenerate step API
      const response = await fetch('/api/regenerate-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stepId,
          category: step.category,
          timeOfDay,
          excludeProductIds: excludeIds,
          originalStepNumber: step.step,
          originalStepId: step.id
        })
      })

      if (!response.ok) {
        let errorMessage = 'Failed to regenerate step'
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch (e) {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const regeneratedStep = data.step

      // Update the routine with the regenerated step
      let updatedRoutine = {
        ...generatedRoutine,
        [timeOfDay]: steps.map(s => s.id === stepId ? regeneratedStep : s)
      }

      // If regenerating in morning routine, also update the corresponding evening step
      // Categories that are shared: cleanser, toner, serum, moisturizer
      const sharedCategories = ['cleanser', 'toner', 'serum', 'moisturizer']
      if (timeOfDay === 'morning' && sharedCategories.includes(step.category)) {
        const eveningSteps = generatedRoutine.evening
        const correspondingEveningStep = eveningSteps.find(s => s.category === step.category)
        
        if (correspondingEveningStep) {
          // Copy the regenerated morning step's products to evening to keep them in sync
          const syncedEveningStep = {
            ...correspondingEveningStep,
            products: regeneratedStep.products, // Use morning's regenerated products
            // Update legacy fields to match morning's selected product
            productName: regeneratedStep.productName,
            brand: regeneratedStep.brand,
            price: regeneratedStep.price,
            imageUrl: regeneratedStep.imageUrl,
            productURL: regeneratedStep.productURL,
            description: regeneratedStep.description
          }
          
          updatedRoutine = {
            ...updatedRoutine,
            evening: eveningSteps.map(s => s.id === correspondingEveningStep.id ? syncedEveningStep : s)
          }
        }
      }

      setGeneratedRoutine(updatedRoutine)
    } catch (error) {
      console.error('Error regenerating step:', error)
      setError(error instanceof Error ? error.message : 'Failed to regenerate step')
    } finally {
      setRegeneratingStepId(null)
    }
  }

  // Show loading while authentication is being checked
  if (isLoading || !authCheckComplete) {
    return <LoadingState />
  }

  // Check authentication
  if (!isAuthenticated) {
    return <AuthDenied />
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Please complete your skin profile first.
            </p>
            <Button asChild>
              <Link href="/skin-quiz">Complete Skin Quiz</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <PageHeader activeTab={activeMainTab as "builder" | "analyzer"} />

          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="builder" className="font-open-sans">
                Routine Generator
              </TabsTrigger>
              <TabsTrigger value="analyzer" className="font-open-sans">
                Routine Analyzer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder">
              <div className="space-y-8">
                {profile && <ProfileSummary profile={profile} />}

                {!generatedRoutine && (
                  <RoutineGeneratorButton
                    onGenerate={handleGenerateRoutine}
                    isGenerating={isGenerating}
                    error={error}
                  />
                )}

                {generatedRoutine && (
                  <RoutineDisplay
                    generatedRoutine={generatedRoutine}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onGenerate={handleGenerateRoutine}
                    onSave={handleSaveRoutine}
                    isGenerating={isGenerating}
                    isSaving={isSaving}
                    onRemoveProduct={handleRemoveProduct}
                    onRegenerateStep={handleRegenerateStep}
                    onSelectProduct={handleSelectProduct}
                    regeneratingStepId={regeneratingStepId}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="analyzer">
              {profile && (
                <RoutineAnalyzer
                  profile={profile}
                  analysisResult={analysisResult}
                  analysisError={analysisError}
                  isAnalyzing={isAnalyzing}
                  onAnalyze={handleAnalyzeRoutine}
                  onSwitchToBuilder={() => setActiveMainTab("builder")}
                  onSaveAnalysis={handleSaveAnalysis}
                  isSavingAnalysis={isSavingAnalysis}
                  isAnalysisSaved={isAnalysisSaved}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
