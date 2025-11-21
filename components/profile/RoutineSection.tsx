"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile, RoutineStep } from "@/lib/profile-types"
import RoutineStepCard from "./RoutineStepCard"
import { getCategoryOrder } from "@/lib/profile-utils"
import Link from "next/link"
import ProductSearchDialog from "./ProductSearchDialog"

interface RoutineSectionProps {
  profile: UserProfile
  activeTab: "morning" | "evening"
  favorites: Set<string>
  onTabChange: (tab: "morning" | "evening") => void
  onToggleFavorite: (stepId: string) => void
  onRemoveStep?: (stepId: string, timeOfDay: "morning" | "evening") => void
  onAddProduct?: (product: any, category: RoutineStep["category"], timeOfDay: "morning" | "evening") => void
  onSkipProduct?: (category: RoutineStep["category"], timeOfDay: "morning" | "evening") => void
  onSaveRoutine?: () => void
  isSavingRoutine?: boolean
  makeupUsage?: string
}

// Category display names
const getCategoryDisplayName = (category: RoutineStep["category"]): string => {
  const displayNames: Record<string, string> = {
    "makeup-remover": "Makeup Remover",
    "cleanser": "Cleanser",
    "toner": "Toner",
    "serum": "Serum",
    "moisturizer": "Moisturizer",
    "sunscreen": "SPF",
    "eye-cream": "Eye Cream",
    "exfoliant": "Exfoliant",
    "retinoid": "Retinoid",
    "mask": "Mask",
    "treatment": "Treatment"
  }
  return displayNames[category] || category
}

// Define which categories to show for each time of day
const getCategoriesForTimeOfDay = (
  timeOfDay: "morning" | "evening",
  makeupUsage?: string,
  morningRoutine?: RoutineStep[]
): RoutineStep["category"][] => {
  if (timeOfDay === "morning") {
    return ["cleanser", "toner", "serum", "moisturizer", "sunscreen"]
  } else {
    // PM Routine: Makeup Remover → Cleanser → Toner → Serum → Moisturizer
    // Exclude SPF from PM routine
    // Always show makeup remover so users can add it if needed
    return ["makeup-remover", "cleanser", "toner", "serum", "moisturizer"]
  }
}

const getCategoryPriority = (
  category: RoutineStep["category"],
  timeOfDay: "morning" | "evening"
) => {
  if (timeOfDay === "evening" && category === "makeup-remover") {
    return -1
  }
  return getCategoryOrder(category)
}

export default function RoutineSection({
  profile,
  activeTab,
  favorites,
  onTabChange,
  onToggleFavorite,
  onRemoveStep,
  onAddProduct,
  onSkipProduct,
  onSaveRoutine,
  isSavingRoutine,
  makeupUsage
}: RoutineSectionProps) {
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<RoutineStep["category"] | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const getRoutineSteps = (timeOfDay: "morning" | "evening"): RoutineStep[] => {
    return profile?.currentRoutine[timeOfDay] || []
  }

  // Get all categories in order for the active tab
  const allCategories = useMemo(() => {
    const morningRoutine = activeTab === "evening" ? profile?.currentRoutine.morning : undefined
    return getCategoriesForTimeOfDay(activeTab, makeupUsage, morningRoutine)
      .map(cat => ({
        category: cat,
        order: getCategoryPriority(cat, activeTab)
      }))
      .sort((a, b) => a.order - b.order)
  }, [activeTab, makeupUsage, profile?.currentRoutine.morning])

  // Get steps grouped by category
  // Only show actual products in the routine (no automatic defaulting)
  const stepsByCategory = useMemo(() => {
    const steps = profile?.currentRoutine[activeTab] || []
    const grouped: Record<string, RoutineStep[]> = {}
    
    steps.forEach(step => {
      if (!grouped[step.category]) {
        grouped[step.category] = []
      }
      grouped[step.category].push(step)
    })
    
    return grouped
  }, [profile?.currentRoutine, activeTab])

  // Find the current step (first category without a product)
  const currentStepCategory = useMemo(() => {
    for (const { category } of allCategories) {
      if (!stepsByCategory[category] || stepsByCategory[category].length === 0) {
        return category
      }
    }
    return null // All steps have products
  }, [allCategories, stepsByCategory])

  // Check if routine is completely empty (no products at all)
  const isRoutineEmpty = allCategories.every(({ category }) => 
    !stepsByCategory[category] || stepsByCategory[category].length === 0
  )

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-montserrat font-black text-3xl">MY ROUTINE</h1>
        {!isRoutineEmpty && (
          isEditing ? (
            onSaveRoutine && (
              <Button 
                onClick={() => {
                  onSaveRoutine()
                  setIsEditing(false)
                }}
                disabled={isSavingRoutine}
                variant="outline"
              >
                {isSavingRoutine ? "Saving..." : "Save Routine"}
              </Button>
            )
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              Edit Routine
            </Button>
          )
        )}
      </div>

      {/* Routine Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as typeof activeTab)}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="morning" className="flex items-center gap-2">
            ☀️
            AM Routine
          </TabsTrigger>
          <TabsTrigger value="evening" className="flex items-center gap-2">
            🌙
            PM Routine
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card className="border shadow-sm">
            <CardContent className="p-8">
              {isRoutineEmpty ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground text-lg mb-6 text-center">
                    No {activeTab === "morning" ? "morning" : "evening"} routine yet
                  </p>
                  <div className="flex flex-col gap-3 items-center w-full max-w-xs">
                    <Button asChild size="lg" className="w-full">
                      <Link href="/skin-routine">
                        Generate Routine
                      </Link>
                    </Button>
                    {onAddProduct && currentStepCategory && (
                      <Button 
                        onClick={() => {
                          setSelectedCategory(currentStepCategory)
                          setIsProductDialogOpen(true)
                        }}
                        size="lg"
                        variant="outline"
                        className="w-full"
                      >
                        Add Routine
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {allCategories.map(({ category, order }) => {
                    const steps = stepsByCategory[category] || []
                    // Filter out skipped/empty steps
                    const validSteps = steps.filter(step => {
                      const productName = step.productName
                      return productName && 
                             productName.trim() !== "" && 
                             productName !== "Skipped - No product"
                    })
                    
                    const hasProduct = validSteps.length > 0
                    const isCurrentStep = category === currentStepCategory
                    const canAddProduct = isCurrentStep && onAddProduct

                    // Only display sections that have products
                    if (!hasProduct) {
                      return null
                    }

                    return (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                            {getCategoryDisplayName(category)}
                          </h2>
                        </div>
                        
                        {/* Show product if it exists */}
                        <div className="space-y-2">
                          {validSteps.map((step, index) => (
                            <RoutineStepCard
                              key={step.id}
                              step={step}
                              stepNumber={order}
                              isFavorite={favorites.has(step.id)}
                              onToggleFavorite={() => onToggleFavorite(step.id)}
                              onRemove={onRemoveStep ? () => onRemoveStep(step.id, activeTab) : undefined}
                              isEditing={isEditing}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Search Dialog */}
      {onAddProduct && (
        <ProductSearchDialog
          open={isProductDialogOpen}
          onOpenChange={(open) => {
            setIsProductDialogOpen(open)
            if (!open) {
              setSelectedCategory(null)
            }
          }}
          onSelectProduct={(product, category, timeOfDay) => {
            onAddProduct(product, category, timeOfDay)
            setIsProductDialogOpen(false)
            setSelectedCategory(null)
            // Keep editing mode active after adding product
            setIsEditing(true)
          }}
          onSkip={onSkipProduct ? (category, timeOfDay) => {
            onSkipProduct(category, timeOfDay)
            setIsProductDialogOpen(false)
            setSelectedCategory(null)
            // Keep editing mode active after skipping
            setIsEditing(true)
          } : undefined}
          timeOfDay={activeTab}
          selectedCategory={selectedCategory}
        />
      )}
    </div>
  )
}
