"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { analyzeIngredientCompatibility, CompatibilityReport } from "@/lib/ingredient-compatibility"
import { UserProfile, RoutineStep } from "@/lib/profile-types"
import { getUserProfile, saveUserProfile, parseArrayField, initializeFavorites, getCategoryOrder } from "@/lib/profile-utils"
import { getCurrentRoutine, saveRoutineVersion } from "@/lib/routine-service"
import LoadingState from "@/components/profile/LoadingState"
import AuthDenied from "@/components/profile/AuthDenied"
import NoProfileState from "@/components/profile/NoProfileState"
import SkinProfileSection from "@/components/profile/SkinProfileSection"
import RoutineSection from "@/components/profile/RoutineSection"
import CompatibilityReportComponent from "@/components/profile/CompatibilityReport"
import PastRoutinesSection from "@/components/profile/PastRoutinesSection"
import AnalysisReportsSection from "@/components/profile/AnalysisReportsSection"

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<"morning" | "evening">("morning")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [authCheckComplete, setAuthCheckComplete] = useState(false)
  const [compatibilityReport, setCompatibilityReport] = useState<CompatibilityReport | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showCompatibilityReport, setShowCompatibilityReport] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isSavingRoutine, setIsSavingRoutine] = useState(false)
  const [currentRoutineId, setCurrentRoutineId] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Give authentication time to load
    const timer = setTimeout(() => {
      setAuthCheckComplete(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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
            setCurrentRoutineId(userRoutine.id)
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
          allergies: parseArrayField(dbProfile.ingredient_preferences),
          budgetRange: dbProfile.budget_range || undefined,
          makeupUsage: dbProfile.makeup_usage || undefined,
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
            if (parsedExtraData.makeupUsage && !userProfile.makeupUsage) {
              userProfile.makeupUsage = parsedExtraData.makeupUsage
            }
          }
        } catch {
          // No extra quiz data found
        }
        
        saveUserProfile(userProfile)
        setProfile(userProfile)
        setFavorites(initializeFavorites(userProfile))
      } catch (error) {
        console.error('Error initializing profile:', error)
        // Fallback to localStorage if database fails
        const userProfile = getUserProfile()
        if (userProfile) {
          setProfile(userProfile)
          setFavorites(initializeFavorites(userProfile))
        }
      }
    }

    if (isAuthenticated && user) {
      initializeProfile()
    }
  }, [user, isAuthenticated])


  const toggleFavorite = (stepId: string) => {
    const currentProfile = getUserProfile()
    if (!currentProfile) return

    const updatedFavorites = new Set(favorites)
    const isFavorite = updatedFavorites.has(stepId)
    if (isFavorite) {
      updatedFavorites.delete(stepId)
    } else {
      updatedFavorites.add(stepId)
    }
    setFavorites(updatedFavorites)

    const updateStepFavorite = (steps: RoutineStep[]) => 
      steps.map(step => step.id === stepId ? { ...step, isFavorite: !isFavorite } : step)

    const updatedProfile = {
      ...currentProfile,
      currentRoutine: {
        morning: updateStepFavorite(currentProfile.currentRoutine.morning),
        evening: updateStepFavorite(currentProfile.currentRoutine.evening)
      }
    }

    saveUserProfile(updatedProfile)
    setProfile(updatedProfile)
  }

  const handleCheckCompatibility = async () => {
    if (!profile) return
    
    setIsAnalyzing(true)
    try {
      const allSteps = [...profile.currentRoutine.morning, ...profile.currentRoutine.evening]
      const products = allSteps.map(step => ({
        id: step.id,
        productName: step.productName,
        brand: step.brand,
        ingredients: step.ingredients,
        category: step.category
      }))
      
      const report = await analyzeIngredientCompatibility(products)
      setCompatibilityReport(report)
      setShowCompatibilityReport(true)
    } catch (error) {
      console.error('Error analyzing compatibility:', error)
      alert('Failed to analyze compatibility. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRegenerateRoutine = async () => {
    if (!profile) return
    
    setIsRegenerating(true)
    try {
      const response = await fetch('/api/generate-routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        let errorMessage = 'Failed to regenerate routine'
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
      const updatedProfile = {
        ...profile,
        currentRoutine: data.routine
      }
      saveUserProfile(updatedProfile)
      setProfile(updatedProfile)
      alert('Routine regenerated successfully!')
    } catch (error) {
      console.error('Error regenerating routine:', error)
      alert(error instanceof Error ? error.message : 'Failed to regenerate routine')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleTabChange = (tab: "morning" | "evening") => {
    setActiveTab(tab)
  }

  const handleEditToggle = () => {
    setIsEditingProfile(prev => !prev)
  }

  const handleRemoveStep = (stepId: string, timeOfDay: "morning" | "evening") => {
    if (!profile) return

    const updatedSteps = profile.currentRoutine[timeOfDay].filter(step => step.id !== stepId)
    
    // Re-assign step numbers based on sorted order
    const sortedSteps = updatedSteps
      .sort((a, b) => {
        const orderA = getCategoryOrder(a.category)
        const orderB = getCategoryOrder(b.category)
        return orderA - orderB
      })
      .map((step, index) => ({
        ...step,
        step: index + 1
      }))

    const updatedProfile = {
      ...profile,
      currentRoutine: {
        ...profile.currentRoutine,
        [timeOfDay]: sortedSteps
      }
    }

    saveUserProfile(updatedProfile)
    setProfile(updatedProfile)
  }

  const handleAddProduct = (product: any, category: RoutineStep["category"], timeOfDay: "morning" | "evening") => {
    if (!profile) return

    // Get existing steps for the time of day
    const existingSteps = [...profile.currentRoutine[timeOfDay]]

    // Parse ingredients - handle both array and JSONB string formats
    let ingredients: string[] = []
    if (product.ingredients) {
      if (Array.isArray(product.ingredients)) {
        ingredients = product.ingredients
      } else if (typeof product.ingredients === 'string') {
        try {
          const parsed = JSON.parse(product.ingredients)
          ingredients = Array.isArray(parsed) ? parsed : []
        } catch {
          // If parsing fails, treat as empty array
          ingredients = []
        }
      }
    }

    // Check if a step with this category already exists
    const existingCategoryIndex = existingSteps.findIndex(step => step.category === category)

    // Create a new RoutineStep from the product
    const newStep: RoutineStep = {
      id: `product-${product.id}-${Date.now()}`,
      step: 0, // Will be set after sorting
      category: category,
      productName: product.productName,
      brand: product.productBrand,
      price: product.price,
      ingredients: ingredients,
      frequency: "daily",
      imageUrl: product.imgURL || undefined,
      productURL: product.productURL || undefined,
      isFavorite: false
    }

    // If category exists, replace it; otherwise add new step
    if (existingCategoryIndex >= 0) {
      existingSteps[existingCategoryIndex] = newStep
    } else {
      existingSteps.push(newStep)
    }

    // Sort steps by category order
    existingSteps.sort((a, b) => {
      const orderA = getCategoryOrder(a.category)
      const orderB = getCategoryOrder(b.category)
      return orderA - orderB
    })

    // Re-assign step numbers based on sorted order
    const sortedSteps = existingSteps.map((step, index) => ({
      ...step,
      step: index + 1
    }))

    // Update the routine
    let updatedProfile = {
      ...profile,
      currentRoutine: {
        ...profile.currentRoutine,
        [timeOfDay]: sortedSteps
      }
    }

    // If adding in morning routine, also add to evening for shared categories
    // Categories that are shared: cleanser, toner, serum, moisturizer
    const sharedCategories = ['cleanser', 'toner', 'serum', 'moisturizer']
    if (timeOfDay === 'morning' && sharedCategories.includes(category)) {
      const eveningSteps = [...updatedProfile.currentRoutine.evening]
      const existingEveningCategoryIndex = eveningSteps.findIndex(step => step.category === category)
      
      // Create the same step for evening
      const eveningStep: RoutineStep = {
        ...newStep,
        id: `product-${product.id}-evening-${Date.now()}` // Different ID for evening
      }
      
      if (existingEveningCategoryIndex >= 0) {
        // Replace existing evening step
        eveningSteps[existingEveningCategoryIndex] = eveningStep
      } else {
        // Add new evening step
        eveningSteps.push(eveningStep)
      }
      
      // Sort evening steps by category order
      eveningSteps.sort((a, b) => {
        const orderA = getCategoryOrder(a.category)
        const orderB = getCategoryOrder(b.category)
        return orderA - orderB
      })
      
      // Re-assign step numbers
      const sortedEveningSteps = eveningSteps.map((step, index) => ({
        ...step,
        step: index + 1
      }))
      
      updatedProfile = {
        ...updatedProfile,
        currentRoutine: {
          ...updatedProfile.currentRoutine,
          evening: sortedEveningSteps
        }
      }
    }

    // Save to localStorage and update state
    saveUserProfile(updatedProfile)
    setProfile(updatedProfile)
  }

  const handleSkipProduct = (category: RoutineStep["category"], timeOfDay: "morning" | "evening") => {
    if (!profile) return

    // Get existing steps for the time of day
    const existingSteps = [...profile.currentRoutine[timeOfDay]]

    // Check if a step with this category already exists
    const existingCategoryIndex = existingSteps.findIndex(step => step.category === category)

    // Create a placeholder step to mark the category as skipped
    const skippedStep: RoutineStep = {
      id: `skipped-${category}-${Date.now()}`,
      step: 0, // Will be set after sorting
      category: category,
      productName: "Skipped - No product",
      brand: undefined,
      ingredients: [],
      frequency: "daily",
      isFavorite: false
    }

    // If category exists, replace it; otherwise add new step
    if (existingCategoryIndex >= 0) {
      existingSteps[existingCategoryIndex] = skippedStep
    } else {
      existingSteps.push(skippedStep)
    }

    // Sort steps by category order
    existingSteps.sort((a, b) => {
      const orderA = getCategoryOrder(a.category)
      const orderB = getCategoryOrder(b.category)
      return orderA - orderB
    })

    // Re-assign step numbers based on sorted order
    const sortedSteps = existingSteps.map((step, index) => ({
      ...step,
      step: index + 1
    }))

    // Update the routine
    const updatedProfile = {
      ...profile,
      currentRoutine: {
        ...profile.currentRoutine,
        [timeOfDay]: sortedSteps
      }
    }

    // Save to localStorage and update state
    saveUserProfile(updatedProfile)
    setProfile(updatedProfile)
  }

  const handleSaveRoutine = async () => {
    if (!profile || !user) return

    setIsSavingRoutine(true)
    try {
      // Use the service function which handles filtering and validation
      // The database trigger automatically unsets other current routines,
      // so we don't need to do that manually
      const newRoutine = await saveRoutineVersion(
        user.id,
        profile.currentRoutine,
        null // name can be set later if needed
      )

      // Update the current routine ID
      if (newRoutine) {
        setCurrentRoutineId(newRoutine.id)
      }

      // Also update users table for backward compatibility (non-blocking)
      // This is optional and runs in the background so it doesn't slow down the save
      ;(async () => {
        try {
          const { error } = await supabase
            .from('users')
            .update({
              current_routine: {
                morning: profile.currentRoutine.morning || [],
                evening: profile.currentRoutine.evening || []
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

          // Only log if it's not a missing column error
          if (error && !error.message.includes('column "current_routine"')) {
            console.warn('Could not update users.current_routine:', error)
          }
        } catch (err) {
          // Silently fail - this is optional
          console.warn('Optional users table update failed:', err)
        }
      })()

      // Also save to localStorage for consistency
      saveUserProfile(profile)
      
      alert('Routine saved successfully!')
    } catch (error) {
      console.error('Error saving routine:', error)
      alert('Failed to save routine. Please try again.')
    } finally {
      setIsSavingRoutine(false)
    }
  }

  // Show loading while authentication is being checked
  if (isLoading || !authCheckComplete) {
    return <LoadingState />
  }

  // Check authentication after giving it time to load
  if (!isAuthenticated) {
    return <AuthDenied />
  }

  if (!profile) {
    return <NoProfileState />
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <SkinProfileSection 
            profile={profile}
            isEditingProfile={isEditingProfile}
            onEditToggle={handleEditToggle}
            onProfileChange={setProfile}
          />

          <RoutineSection
            profile={profile}
            activeTab={activeTab}
            favorites={favorites}
            onTabChange={handleTabChange}
            onToggleFavorite={toggleFavorite}
            onRemoveStep={handleRemoveStep}
            onAddProduct={handleAddProduct}
            onSkipProduct={handleSkipProduct}
            onSaveRoutine={handleSaveRoutine}
            isSavingRoutine={isSavingRoutine}
            makeupUsage={user?.makeupUsage}
          />

          {user && (
            <PastRoutinesSection
              userId={user.id}
              currentRoutineId={currentRoutineId}
              onRoutineRestored={async () => {
                // Refresh the profile and current routine after restoration
                if (!user) return
                
                try {
                  const userRoutine = await getCurrentRoutine(user.id)
                  if (userRoutine && userRoutine.routine) {
                    const updatedProfile = {
                      ...profile!,
                      currentRoutine: {
                        morning: userRoutine.routine.morning || [],
                        evening: userRoutine.routine.evening || []
                      }
                    }
                    setCurrentRoutineId(userRoutine.id)
                    saveUserProfile(updatedProfile)
                    setProfile(updatedProfile)
                  }
                } catch (error) {
                  console.error('Error refreshing routine after restoration:', error)
                }
              }}
            />
          )}

          {user && (
            <AnalysisReportsSection
              userId={user.id}
            />
          )}

          {/* Compatibility Report */}
          {showCompatibilityReport && compatibilityReport && (
            <CompatibilityReportComponent
              report={compatibilityReport}
              onClose={() => setShowCompatibilityReport(false)}
            />
          )}
        </div>
      </main>
    </div>
  )
}
