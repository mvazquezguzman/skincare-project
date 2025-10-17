"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
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

export default function IngredientChartPage() {
  const getCompatibilityMatrix = () => {
    const matrix: { [key: string]: { [key: string]: "safe" | "avoid" | "caution" } } = {}

    ingredientsData.forEach((ingredient) => {
      matrix[ingredient.id] = {}
      ingredientsData.forEach((other) => {
        if (ingredient.id === other.id) {
          matrix[ingredient.id][other.id] = "safe"
        } else if (ingredient.avoidWith.some((avoid) => other.name.toLowerCase().includes(avoid.toLowerCase()))) {
          matrix[ingredient.id][other.id] = "avoid"
        } else if (ingredient.pairsWith.some((pair) => other.name.toLowerCase().includes(pair.toLowerCase()))) {
          matrix[ingredient.id][other.id] = "safe"
        } else {
          matrix[ingredient.id][other.id] = "caution"
        }
      })
    })

    return matrix
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="font-montserrat font-black text-3xl md:text-4xl text-foreground">Ingredient Compatibility Chart</h1>
            <p className="font-open-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              Check which ingredients work well together and which to avoid mixing for optimal skincare results
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-montserrat font-bold flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-primary" />
                Ingredient Compatibility Matrix
              </CardTitle>
              <p className="font-open-sans text-sm text-muted-foreground">
                Check which ingredients work well together and which to avoid mixing
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-9 gap-1 min-w-[600px]">
                  {/* Header row */}
                  <div></div>
                  {ingredientsData.slice(0, 8).map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="text-xs font-medium text-center p-2 bg-muted rounded font-open-sans"
                    >
                      {ingredient.name.split(" ")[0]}
                    </div>
                  ))}

                  {/* Matrix rows */}
                  {ingredientsData.slice(0, 8).map((rowIngredient) => (
                    <div key={`row-${rowIngredient.id}`} className="contents">
                      <div className="text-xs font-medium p-2 bg-muted rounded flex items-center font-open-sans">
                        {rowIngredient.name.split(" ")[0]}
                      </div>
                      {ingredientsData.slice(0, 8).map((colIngredient) => {
                        const compatibility =
                          getCompatibilityMatrix()[rowIngredient.id]?.[colIngredient.id] || "caution"
                        return (
                          <div
                            key={`${rowIngredient.id}-${colIngredient.id}`}
                            className={`w-8 h-8 rounded flex items-center justify-center ${
                              compatibility === "safe"
                                ? "bg-green-100 text-green-600"
                                : compatibility === "avoid"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-yellow-100 text-yellow-600"
                            }`}
                          >
                            {compatibility === "safe" ? (
                              <CheckCircleIcon className="w-4 h-4" />
                            ) : compatibility === "avoid" ? (
                              <XCircleIcon className="w-4 h-4" />
                            ) : (
                              <InformationCircleIcon className="w-4 h-4" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mt-6 text-sm font-open-sans">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span>Safe to combine</span>
                </div>
                <div className="flex items-center gap-2">
                  <InformationCircleIcon className="w-4 h-4 text-yellow-600" />
                  <span>Use with caution</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircleIcon className="w-4 h-4 text-red-600" />
                  <span>Avoid combining</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional information section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-montserrat font-bold text-lg">Safe Combinations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="font-open-sans text-sm">
                    <strong>Hyaluronic Acid + Niacinamide:</strong> Perfect for oily skin - hydration without heaviness
                  </div>
                  <div className="font-open-sans text-sm">
                    <strong>Vitamin C + Vitamin E:</strong> Enhanced antioxidant protection when used together
                  </div>
                  <div className="font-open-sans text-sm">
                    <strong>Retinol + Ceramides:</strong> Anti-aging benefits with barrier protection
                  </div>
                  <div className="font-open-sans text-sm">
                    <strong>Peptides + Hyaluronic Acid:</strong> Firming and hydrating combination
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-montserrat font-bold text-lg">Avoid These Combinations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="font-open-sans text-sm">
                    <strong>Vitamin C + Niacinamide:</strong> Can cause irritation and reduce effectiveness
                  </div>
                  <div className="font-open-sans text-sm">
                    <strong>Retinol + AHA/BHA:</strong> Too much exfoliation can damage skin barrier
                  </div>
                  <div className="font-open-sans text-sm">
                    <strong>Benzoyl Peroxide + Retinol:</strong> Can cause excessive dryness and irritation
                  </div>
                  <div className="font-open-sans text-sm">
                    <strong>Vitamin C + AHA/BHA:</strong> Can be too harsh and cause sensitivity
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
