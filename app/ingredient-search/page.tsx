"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  HeartIcon,
} from "@heroicons/react/24/outline"
import jsonIngredients from "./scanalyze-skincare-ingredients.json"

interface Ingredient {
  id: string
  name: string
  category: string
  benefits: string[]
  description: string
  bestFor: string[]
  pairsWith: string[]
  avoidWith: string[]
  concentration: string
  whenToUse: "AM" | "PM" | "Both"
  sensitivity: "Low" | "Medium" | "High"
}

const ingredientsData: Ingredient[] = [
  {
    id: "niacinamide",
    name: "Niacinamide",
    category: "Vitamin",
    benefits: ["Oil Control", "Pore Minimizing", "Brightening", "Anti-inflammatory"],
    description:
      "A form of Vitamin B3 that helps regulate oil production, minimize pores, and improve skin texture. Gentle and suitable for most skin types.",
    bestFor: ["Oily Skin", "Large Pores", "Uneven Tone"],
    pairsWith: ["Hyaluronic Acid", "Ceramides", "Zinc", "Peptides"],
    avoidWith: ["Vitamin C (L-Ascorbic Acid)", "Alpha Arbutin"],
    concentration: "5-10%",
    whenToUse: "Both",
    sensitivity: "Low",
  },
  {
    id: "retinol",
    name: "Retinol",
    category: "Retinoid",
    benefits: ["Anti-aging", "Acne Treatment", "Cell Turnover", "Collagen Boost"],
    description:
      "A powerful anti-aging ingredient that increases cell turnover and stimulates collagen production. Start slowly to build tolerance.",
    bestFor: ["Aging Skin", "Acne", "Uneven Texture"],
    pairsWith: ["Hyaluronic Acid", "Ceramides", "Peptides"],
    avoidWith: ["AHA/BHA", "Benzoyl Peroxide", "Vitamin C"],
    concentration: "0.25-1%",
    whenToUse: "PM",
    sensitivity: "High",
  },
  {
    id: "hyaluronic-acid",
    name: "Hyaluronic Acid",
    category: "Humectant",
    benefits: ["Hydration", "Plumping", "Moisture Retention"],
    description:
      "A powerful humectant that can hold up to 1000 times its weight in water. Perfect for all skin types seeking hydration.",
    bestFor: ["Dry Skin", "Dehydrated Skin", "All Skin Types"],
    pairsWith: ["Niacinamide", "Vitamin C", "Retinol", "Ceramides"],
    avoidWith: [],
    concentration: "1-2%",
    whenToUse: "Both",
    sensitivity: "Low",
  },
  {
    id: "vitamin-c",
    name: "Vitamin C (L-Ascorbic Acid)",
    category: "Antioxidant",
    benefits: ["Brightening", "Antioxidant Protection", "Collagen Support"],
    description:
      "A potent antioxidant that brightens skin, protects against environmental damage, and supports collagen production.",
    bestFor: ["Dull Skin", "Dark Spots", "Environmental Protection"],
    pairsWith: ["Vitamin E", "Ferulic Acid", "Hyaluronic Acid"],
    avoidWith: ["Niacinamide", "Retinol", "AHA/BHA"],
    concentration: "10-20%",
    whenToUse: "AM",
    sensitivity: "Medium",
  },
  {
    id: "salicylic-acid",
    name: "Salicylic Acid (BHA)",
    category: "Chemical Exfoliant",
    benefits: ["Acne Treatment", "Pore Cleansing", "Oil Control"],
    description:
      "A beta hydroxy acid that penetrates deep into pores to remove oil and dead skin cells. Ideal for oily and acne-prone skin.",
    bestFor: ["Oily Skin", "Acne", "Blackheads"],
    pairsWith: ["Niacinamide", "Hyaluronic Acid"],
    avoidWith: ["Retinol", "AHA", "Vitamin C"],
    concentration: "0.5-2%",
    whenToUse: "Both",
    sensitivity: "Medium",
  },
  {
    id: "glycolic-acid",
    name: "Glycolic Acid (AHA)",
    category: "Chemical Exfoliant",
    benefits: ["Exfoliation", "Brightening", "Texture Improvement"],
    description:
      "An alpha hydroxy acid that exfoliates the skin surface, improving texture and promoting cell turnover for brighter skin.",
    bestFor: ["Dull Skin", "Uneven Texture", "Fine Lines"],
    pairsWith: ["Hyaluronic Acid", "Ceramides"],
    avoidWith: ["Retinol", "BHA", "Vitamin C"],
    concentration: "5-10%",
    whenToUse: "PM",
    sensitivity: "High",
  },
  {
    id: "ceramides",
    name: "Ceramides",
    category: "Barrier Repair",
    benefits: ["Barrier Repair", "Moisture Retention", "Soothing"],
    description:
      "Essential lipids that help restore and maintain the skin barrier, preventing moisture loss and protecting against irritants.",
    bestFor: ["Dry Skin", "Sensitive Skin", "Damaged Barrier"],
    pairsWith: ["Hyaluronic Acid", "Niacinamide", "Retinol"],
    avoidWith: [],
    concentration: "1-5%",
    whenToUse: "Both",
    sensitivity: "Low",
  },
  {
    id: "peptides",
    name: "Peptides",
    category: "Anti-aging",
    benefits: ["Collagen Support", "Firming", "Anti-aging"],
    description:
      "Short chains of amino acids that signal the skin to produce more collagen, helping to firm and smooth the skin.",
    bestFor: ["Aging Skin", "Loss of Firmness", "Fine Lines"],
    pairsWith: ["Hyaluronic Acid", "Niacinamide", "Retinol"],
    avoidWith: ["AHA/BHA at high concentrations"],
    concentration: "2-10%",
    whenToUse: "Both",
    sensitivity: "Low",
  },
]

// Transform JSON data to match Ingredient interface
const transformJsonIngredient = (jsonItem: any): Ingredient => {
  const name = jsonItem["Ingredient Name"]
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  
  // Map Safety Rating to sensitivity
  const safetyRating = jsonItem["Safety Rating"]
  let sensitivity: "Low" | "Medium" | "High" = "Low"
  if (safetyRating === "Moderate Risk" || safetyRating === "Safe (in low %)") {
    sensitivity = "Medium"
  } else if (safetyRating === "High Risk") {
    sensitivity = "High"
  } else if (safetyRating === "Safe" || !safetyRating) {
    sensitivity = "Low"
  }

  // Extract benefits from description
  const description = jsonItem["Brief Description"] || ""
  const functionType = jsonItem["Function"] || "Other"
  
  // Generate benefits from function and description
  const benefits: string[] = []
  if (functionType.includes("Humectant") || description.toLowerCase().includes("hydrat")) {
    benefits.push("Hydration")
  }
  if (functionType.includes("Exfoliant") || description.toLowerCase().includes("exfoliat")) {
    benefits.push("Exfoliation")
  }
  if (functionType.includes("Anti-aging") || description.toLowerCase().includes("aging") || description.toLowerCase().includes("wrinkle")) {
    benefits.push("Anti-aging")
  }
  if (functionType.includes("Brightening") || description.toLowerCase().includes("brighten") || description.toLowerCase().includes("pigmentation")) {
    benefits.push("Brightening")
  }
  if (functionType.includes("Soothing") || description.toLowerCase().includes("soothe") || description.toLowerCase().includes("calm")) {
    benefits.push("Soothing")
  }
  if (functionType.includes("Antioxidant") || description.toLowerCase().includes("antioxidant") || description.toLowerCase().includes("protect")) {
    benefits.push("Antioxidant Protection")
  }
  if (description.toLowerCase().includes("acne")) {
    benefits.push("Acne Treatment")
  }
  if (benefits.length === 0) {
    benefits.push(functionType)
  }

  return {
    id,
    name,
    category: jsonItem["Category"] || functionType,
    benefits,
    description,
    bestFor: [], // Can be enhanced later
    pairsWith: [], // Can be enhanced later
    avoidWith: [], // Can be enhanced later
    concentration: "Varies",
    whenToUse: "Both",
    sensitivity,
  }
}

// Transform and merge JSON ingredients with existing data
const jsonIngredientsTransformed: Ingredient[] = jsonIngredients.map(transformJsonIngredient)

// Create a map of existing ingredients by name (case-insensitive)
const existingIngredientsMap = new Map(
  ingredientsData.map(ing => [ing.name.toLowerCase(), ing])
)

// Merge: keep existing detailed data, add new from JSON
const mergedIngredients: Ingredient[] = [
  ...ingredientsData,
  ...jsonIngredientsTransformed.filter(jsonIng => {
    // Only add if not already in existing data
    return !existingIngredientsMap.has(jsonIng.name.toLowerCase())
  })
]

const normalizeCategoryName = (category?: string) => (category?.trim().toLowerCase() ?? "other")
const getCategoryDisplayName = (category?: string) => category?.trim() || "Other"

interface CategoryOption {
  value: string
  label: string
}

const categoryDisplayMap = new Map<string, string>()
mergedIngredients.forEach((ingredient) => {
  const normalized = normalizeCategoryName(ingredient.category)
  if (!categoryDisplayMap.has(normalized)) {
    categoryDisplayMap.set(normalized, getCategoryDisplayName(ingredient.category))
  }
})

const categories: CategoryOption[] = [
  { value: "all", label: "All" },
  ...Array.from(categoryDisplayMap.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([value, label]) => ({ value, label })),
]

export default function IngredientSearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)

  const filteredIngredients = useMemo(() => {
    return mergedIngredients.filter((ingredient) => {
      const matchesSearch =
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.benefits.some((benefit) => benefit.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ingredient.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === "all" || normalizeCategoryName(ingredient.category) === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case "Low":
        return "text-green-600 bg-green-50 border-green-200"
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "High":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="font-montserrat font-black text-3xl md:text-4xl text-foreground">Ingredient Search</h1>
            <p className="font-open-sans text-lg text-muted-foreground max-w-2xl">
              Discover the science behind skincare ingredients and learn which combinations work best for your skin
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search ingredients, benefits, or concerns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-open-sans w-full rounded-lg border border-gray-200 bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-nowrap md:flex-wrap gap-1.5 md:gap-2 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              {categories.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedCategory(value)}
                  className={`px-2 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredIngredients.map((ingredient) => (
                <Card
                  key={ingredient.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-border group h-full flex flex-col"
                  onClick={() => setSelectedIngredient(ingredient)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="font-montserrat font-bold text-lg text-foreground group-hover:text-primary transition-colors flex-1">
                        {ingredient.name}
                      </CardTitle>
                      <Badge variant="outline" className={getSensitivityColor(ingredient.sensitivity)}>
                        {ingredient.sensitivity}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="w-fit font-open-sans mt-2">
                      {getCategoryDisplayName(ingredient.category)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1 flex flex-col">
                    <p className="font-open-sans text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {ingredient.description}
                    </p>
                    {ingredient.benefits.length > 0 && (
                      <div className="flex-1">
                        <h4 className="font-open-sans font-medium text-sm text-foreground mb-2">Benefits:</h4>
                        <div className="flex flex-wrap gap-1">
                          {ingredient.benefits.slice(0, 3).map((benefit) => (
                            <Badge key={benefit} variant="outline" className="text-xs font-open-sans">
                              {benefit}
                            </Badge>
                          ))}
                          {ingredient.benefits.length > 3 && (
                            <Badge variant="outline" className="text-xs font-open-sans">
                              +{ingredient.benefits.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-open-sans pt-2 border-t border-border">
                      <span>Use: {ingredient.whenToUse}</span>
                      <span>{ingredient.concentration}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredIngredients.length === 0 && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-montserrat font-bold text-lg text-foreground mb-2">No ingredients found</h3>
                <p className="font-open-sans text-muted-foreground">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedIngredient && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedIngredient(null)}
        >
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-montserrat font-black text-2xl text-foreground">
                    {selectedIngredient.name}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-2 font-open-sans">
                    {getCategoryDisplayName(selectedIngredient.category)}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIngredient(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="font-open-sans text-muted-foreground leading-relaxed">{selectedIngredient.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-montserrat font-bold text-foreground mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-primary" />
                    Benefits
                  </h4>
                  <div className="space-y-2">
                    {selectedIngredient.benefits.length > 0 ? (
                      selectedIngredient.benefits.map((benefit) => (
                        <Badge key={benefit} variant="outline" className="mr-2 mb-2 font-open-sans">
                          {benefit}
                        </Badge>
                      ))
                    ) : (
                      <div className="font-open-sans text-sm text-muted-foreground">No benefits listed</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-montserrat font-bold text-foreground mb-3 flex items-center gap-2">
                    <HeartIcon className="w-4 h-4 text-secondary" />
                    Best For
                  </h4>
                  <div className="space-y-2">
                    {selectedIngredient.bestFor.length > 0 ? (
                      selectedIngredient.bestFor.map((condition) => (
                        <Badge key={condition} variant="secondary" className="mr-2 mb-2 font-open-sans">
                          {condition}
                        </Badge>
                      ))
                    ) : (
                      <div className="font-open-sans text-sm text-muted-foreground">Suitable for all skin types</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-montserrat font-bold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    Pairs Well With
                  </h4>
                  <div className="space-y-1">
                    {selectedIngredient.pairsWith.length > 0 ? (
                      selectedIngredient.pairsWith.map((ingredient) => (
                        <div
                          key={ingredient}
                          className="font-open-sans text-sm text-green-600 bg-green-50 px-2 py-1 rounded"
                        >
                          {ingredient}
                        </div>
                      ))
                    ) : (
                      <div className="font-open-sans text-sm text-muted-foreground">No specific pairing information</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-montserrat font-bold text-foreground mb-3 flex items-center gap-2">
                    <XCircleIcon className="w-4 h-4 text-red-600" />
                    Avoid With
                  </h4>
                  <div className="space-y-1">
                    {selectedIngredient.avoidWith.length > 0 ? (
                      selectedIngredient.avoidWith.map((ingredient) => (
                        <div
                          key={ingredient}
                          className="font-open-sans text-sm text-red-600 bg-red-50 px-2 py-1 rounded"
                        >
                          {ingredient}
                        </div>
                      ))
                    ) : (
                      <div className="font-open-sans text-sm text-muted-foreground">No known conflicts</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="font-open-sans font-medium text-sm text-foreground">Concentration</div>
                  <div className="font-open-sans text-sm text-muted-foreground">{selectedIngredient.concentration}</div>
                </div>
                <div className="text-center">
                  <div className="font-open-sans font-medium text-sm text-foreground">When to Use</div>
                  <div className="font-open-sans text-sm text-muted-foreground">{selectedIngredient.whenToUse}</div>
                </div>
                <div className="text-center">
                  <div className="font-open-sans font-medium text-sm text-foreground">Sensitivity</div>
                  <Badge className={getSensitivityColor(selectedIngredient.sensitivity)}>
                    {selectedIngredient.sensitivity}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
