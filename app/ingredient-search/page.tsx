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

const categories = [
  "All",
  "Vitamin",
  "Retinoid",
  "Humectant",
  "Antioxidant",
  "Chemical Exfoliant",
  "Barrier Repair",
  "Anti-aging",
]

export default function IngredientSearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)

  const filteredIngredients = useMemo(() => {
    return ingredientsData.filter((ingredient) => {
      const matchesSearch =
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.benefits.some((benefit) => benefit.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ingredient.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "All" || ingredient.category === selectedCategory
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
          <div className="text-center space-y-4">
            <h1 className="font-montserrat font-black text-3xl md:text-4xl text-foreground">Ingredient Search</h1>
            <p className="font-open-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the science behind skincare ingredients and learn which combinations work best for your skin
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search ingredients, benefits, or concerns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-open-sans"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="font-open-sans"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIngredients.map((ingredient) => (
                <Card
                  key={ingredient.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-border group"
                  onClick={() => setSelectedIngredient(ingredient)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="font-montserrat font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {ingredient.name}
                      </CardTitle>
                      <Badge variant="outline" className={getSensitivityColor(ingredient.sensitivity)}>
                        {ingredient.sensitivity}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="w-fit font-open-sans">
                      {ingredient.category}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="font-open-sans text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {ingredient.description}
                    </p>
                    <div>
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
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-open-sans">
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
                    {selectedIngredient.category}
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
                    {selectedIngredient.benefits.map((benefit) => (
                      <Badge key={benefit} variant="outline" className="mr-2 mb-2 font-open-sans">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-montserrat font-bold text-foreground mb-3 flex items-center gap-2">
                    <HeartIcon className="w-4 h-4 text-secondary" />
                    Best For
                  </h4>
                  <div className="space-y-2">
                    {selectedIngredient.bestFor.map((condition) => (
                      <Badge key={condition} variant="secondary" className="mr-2 mb-2 font-open-sans">
                        {condition}
                      </Badge>
                    ))}
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
                    {selectedIngredient.pairsWith.map((ingredient) => (
                      <div
                        key={ingredient}
                        className="font-open-sans text-sm text-green-600 bg-green-50 px-2 py-1 rounded"
                      >
                        {ingredient}
                      </div>
                    ))}
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
