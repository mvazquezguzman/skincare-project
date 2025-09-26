export interface IngredientConflict {
  ingredient1: string
  ingredient2: string
  severity: "low" | "medium" | "high"
  reason: string
  recommendation: string
}

export interface RoutineAnalysis {
  score: number
  conflicts: IngredientConflict[]
  strengths: string[]
  improvements: string[]
  recommendations: string[]
}

export class ConflictAnalyzer {
  private static conflictRules: IngredientConflict[] = [
    {
      ingredient1: "Retinol",
      ingredient2: "Vitamin C",
      severity: "high",
      reason: "Can cause irritation and reduce effectiveness when used together",
      recommendation: "Use Vitamin C in the morning and Retinol at night",
    },
    {
      ingredient1: "Retinol",
      ingredient2: "AHA",
      severity: "high",
      reason: "Both are exfoliating and can cause over-exfoliation",
      recommendation: "Alternate nights or use AHA in morning, Retinol at night",
    },
    {
      ingredient1: "Retinol",
      ingredient2: "BHA",
      severity: "medium",
      reason: "May increase skin sensitivity",
      recommendation: "Start slowly and monitor skin reaction",
    },
    {
      ingredient1: "Vitamin C",
      ingredient2: "Niacinamide",
      severity: "low",
      reason: "May reduce effectiveness at high concentrations",
      recommendation: "Use at different times or look for stable formulations",
    },
    {
      ingredient1: "AHA",
      ingredient2: "BHA",
      severity: "medium",
      reason: "Can cause over-exfoliation",
      recommendation: "Use on alternate days or reduce frequency",
    },
  ]

  static analyzeRoutine(products: Array<{ name: string; ingredients: string[]; timeOfUse: string }>): RoutineAnalysis {
    const conflicts: IngredientConflict[] = []
    const strengths: string[] = []
    const improvements: string[] = []
    const recommendations: string[] = []

    // Check for conflicts
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        const product1 = products[i]
        const product2 = products[j]

        // Check if products are used at the same time
        if (product1.timeOfUse === product2.timeOfUse) {
          for (const ingredient1 of product1.ingredients) {
            for (const ingredient2 of product2.ingredients) {
              const conflict = this.conflictRules.find(
                (rule) =>
                  (rule.ingredient1.toLowerCase() === ingredient1.toLowerCase() &&
                    rule.ingredient2.toLowerCase() === ingredient2.toLowerCase()) ||
                  (rule.ingredient2.toLowerCase() === ingredient1.toLowerCase() &&
                    rule.ingredient1.toLowerCase() === ingredient2.toLowerCase()),
              )

              if (conflict) {
                conflicts.push(conflict)
              }
            }
          }
        }
      }
    }

    // Analyze strengths
    const allIngredients = products.flatMap((p) => p.ingredients)
    if (allIngredients.some((i) => i.toLowerCase().includes("hyaluronic acid"))) {
      strengths.push("Good hydration with Hyaluronic Acid")
    }
    if (allIngredients.some((i) => i.toLowerCase().includes("sunscreen") || i.toLowerCase().includes("spf"))) {
      strengths.push("Sun protection included")
    }
    if (allIngredients.some((i) => i.toLowerCase().includes("retinol"))) {
      strengths.push("Anti-aging ingredients present")
    }

    // Generate improvements
    if (!allIngredients.some((i) => i.toLowerCase().includes("sunscreen") || i.toLowerCase().includes("spf"))) {
      improvements.push("Add sunscreen for daily protection")
    }
    if (conflicts.length > 0) {
      improvements.push("Resolve ingredient conflicts for better results")
    }
    if (!allIngredients.some((i) => i.toLowerCase().includes("moistur"))) {
      improvements.push("Consider adding a dedicated moisturizer")
    }

    // Calculate score
    let score = 100
    score -= conflicts.filter((c) => c.severity === "high").length * 20
    score -= conflicts.filter((c) => c.severity === "medium").length * 10
    score -= conflicts.filter((c) => c.severity === "low").length * 5
    score = Math.max(0, Math.min(100, score))

    // Generate recommendations
    if (score < 70) {
      recommendations.push("Consider simplifying your routine to reduce conflicts")
    }
    if (conflicts.length > 0) {
      recommendations.push("Separate conflicting ingredients by time of day")
    }
    recommendations.push("Always patch test new products")
    recommendations.push("Introduce new actives gradually")

    return {
      score,
      conflicts,
      strengths,
      improvements,
      recommendations,
    }
  }
}
