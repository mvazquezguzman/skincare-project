export interface RoutineStep {
  id: string
  name: string
  product: string
  ingredients: string[]
  benefits: string[]
  instructions: string
  timeOfDay: "morning" | "evening"
  order: number
  optional: boolean
  frequency?: string
}

export interface GeneratedRoutine {
  morning: RoutineStep[]
  evening: RoutineStep[]
  notes: string[]
  totalSteps: number
  estimatedTime: string
}

export interface UserProfile {
  skinType: string
  concerns: string[]
  sensitivity: string
  experience: string
  goals: string[]
  currentProducts?: string[]
  allergies?: string[]
}

export class RoutineGenerator {
  private static productDatabase = {
    cleansers: [
      {
        name: "Gentle Foaming Cleanser",
        ingredients: ["Sodium Cocoyl Glutamate", "Glycerin", "Panthenol"],
        benefits: ["Removes impurities", "Maintains pH balance", "Gentle on skin"],
        suitableFor: ["sensitive", "dry", "normal"],
        instructions: "Massage onto damp skin for 30 seconds, rinse with lukewarm water",
      },
      {
        name: "Salicylic Acid Cleanser",
        ingredients: ["Salicylic Acid", "Niacinamide", "Zinc PCA"],
        benefits: ["Unclogs pores", "Reduces oil", "Prevents breakouts"],
        suitableFor: ["oily", "acne-prone", "combination"],
        instructions: "Use 2-3 times per week, massage gently and rinse thoroughly",
      },
    ],
    treatments: [
      {
        name: "Vitamin C Serum",
        ingredients: ["L-Ascorbic Acid", "Vitamin E", "Ferulic Acid"],
        benefits: ["Brightens skin", "Antioxidant protection", "Collagen support"],
        suitableFor: ["all skin types"],
        instructions: "Apply 2-3 drops to clean skin, follow with moisturizer",
        timeOfDay: "morning",
      },
      {
        name: "Retinol Serum",
        ingredients: ["Retinol", "Squalane", "Vitamin E"],
        benefits: ["Anti-aging", "Improves texture", "Reduces fine lines"],
        suitableFor: ["normal", "oily", "mature"],
        instructions: "Start 2x per week, gradually increase. Always use sunscreen.",
        timeOfDay: "evening",
      },
      {
        name: "Niacinamide Serum",
        ingredients: ["Niacinamide", "Zinc PCA", "Hyaluronic Acid"],
        benefits: ["Controls oil", "Minimizes pores", "Reduces redness"],
        suitableFor: ["oily", "acne-prone", "sensitive"],
        instructions: "Apply to clean skin before moisturizer",
      },
      {
        name: "Hyaluronic Acid Serum",
        ingredients: ["Hyaluronic Acid", "Sodium Hyaluronate", "Glycerin"],
        benefits: ["Deep hydration", "Plumps skin", "Improves texture"],
        suitableFor: ["all skin types"],
        instructions: "Apply to damp skin for best absorption",
      },
    ],
    moisturizers: [
      {
        name: "Lightweight Gel Moisturizer",
        ingredients: ["Hyaluronic Acid", "Niacinamide", "Ceramides"],
        benefits: ["Hydrates without heaviness", "Strengthens barrier", "Non-comedogenic"],
        suitableFor: ["oily", "combination", "acne-prone"],
        instructions: "Apply evenly to face and neck",
      },
      {
        name: "Rich Cream Moisturizer",
        ingredients: ["Ceramides", "Cholesterol", "Fatty Acids", "Shea Butter"],
        benefits: ["Deep moisturization", "Repairs barrier", "Long-lasting hydration"],
        suitableFor: ["dry", "sensitive", "mature"],
        instructions: "Apply generously, especially to dry areas",
      },
    ],
    sunscreens: [
      {
        name: "Mineral Sunscreen SPF 50",
        ingredients: ["Zinc Oxide", "Titanium Dioxide", "Niacinamide"],
        benefits: ["Broad spectrum protection", "Gentle for sensitive skin", "No white cast"],
        suitableFor: ["sensitive", "all skin types"],
        instructions: "Apply 1/4 teaspoon to face, reapply every 2 hours",
      },
      {
        name: "Chemical Sunscreen SPF 30",
        ingredients: ["Avobenzone", "Octinoxate", "Antioxidants"],
        benefits: ["Lightweight feel", "Easy application", "Water resistant"],
        suitableFor: ["normal", "oily", "combination"],
        instructions: "Apply 15 minutes before sun exposure",
      },
    ],
  }

  static generateRoutine(profile: UserProfile): GeneratedRoutine {
    const morningSteps: RoutineStep[] = []
    const eveningSteps: RoutineStep[] = []
    const notes: string[] = []

    // Step 1: Cleanser (both morning and evening)
    const cleanser = this.selectCleanser(profile)

    morningSteps.push({
      id: "morning-cleanse",
      name: "Gentle Cleanse",
      product: cleanser.name,
      ingredients: cleanser.ingredients,
      benefits: cleanser.benefits,
      instructions: cleanser.instructions,
      timeOfDay: "morning",
      order: 1,
      optional: false,
    })

    eveningSteps.push({
      id: "evening-cleanse",
      name: "Deep Cleanse",
      product: cleanser.name,
      ingredients: cleanser.ingredients,
      benefits: cleanser.benefits,
      instructions: cleanser.instructions,
      timeOfDay: "evening",
      order: 1,
      optional: false,
    })

    // Step 2: Treatment serums
    const morningTreatment = this.selectMorningTreatment(profile)
    const eveningTreatment = this.selectEveningTreatment(profile)

    if (morningTreatment) {
      morningSteps.push({
        id: "morning-treatment",
        name: "Active Treatment",
        product: morningTreatment.name,
        ingredients: morningTreatment.ingredients,
        benefits: morningTreatment.benefits,
        instructions: morningTreatment.instructions,
        timeOfDay: "morning",
        order: 2,
        optional: false,
      })
    }

    if (eveningTreatment) {
      eveningSteps.push({
        id: "evening-treatment",
        name: "Active Treatment",
        product: eveningTreatment.name,
        ingredients: eveningTreatment.ingredients,
        benefits: eveningTreatment.benefits,
        instructions: eveningTreatment.instructions,
        timeOfDay: "evening",
        order: 2,
        optional: false,
        frequency: profile.experience === "beginner" ? "2-3 times per week" : "Daily",
      })
    }

    // Step 3: Moisturizer
    const moisturizer = this.selectMoisturizer(profile)

    morningSteps.push({
      id: "morning-moisturize",
      name: "Hydrate",
      product: moisturizer.name,
      ingredients: moisturizer.ingredients,
      benefits: moisturizer.benefits,
      instructions: moisturizer.instructions,
      timeOfDay: "morning",
      order: 3,
      optional: false,
    })

    eveningSteps.push({
      id: "evening-moisturize",
      name: "Nourish",
      product: moisturizer.name,
      ingredients: moisturizer.ingredients,
      benefits: moisturizer.benefits,
      instructions: moisturizer.instructions,
      timeOfDay: "evening",
      order: 3,
      optional: false,
    })

    // Step 4: Sunscreen (morning only)
    const sunscreen = this.selectSunscreen(profile)
    morningSteps.push({
      id: "morning-sunscreen",
      name: "Protect",
      product: sunscreen.name,
      ingredients: sunscreen.ingredients,
      benefits: sunscreen.benefits,
      instructions: sunscreen.instructions,
      timeOfDay: "morning",
      order: 4,
      optional: false,
    })

    // Generate notes
    this.generateNotes(profile, notes)

    return {
      morning: morningSteps,
      evening: eveningSteps,
      notes,
      totalSteps: morningSteps.length + eveningSteps.length,
      estimatedTime: "5-10 minutes per routine",
    }
  }

  private static selectCleanser(profile: UserProfile) {
    const { cleansers } = this.productDatabase

    if (profile.skinType === "oily" || profile.concerns.includes("acne")) {
      return cleansers.find((c) => c.name.includes("Salicylic")) || cleansers[0]
    }

    return cleansers[0] // Gentle cleanser for most skin types
  }

  private static selectMorningTreatment(profile: UserProfile) {
    const { treatments } = this.productDatabase

    if (profile.goals.includes("brightening") || profile.concerns.includes("dark spots")) {
      return treatments.find((t) => t.name.includes("Vitamin C"))
    }

    if (profile.skinType === "oily" || profile.concerns.includes("large pores")) {
      return treatments.find((t) => t.name.includes("Niacinamide"))
    }

    if (profile.skinType === "dry" || profile.concerns.includes("dehydration")) {
      return treatments.find((t) => t.name.includes("Hyaluronic"))
    }

    return treatments.find((t) => t.name.includes("Vitamin C")) // Default to Vitamin C
  }

  private static selectEveningTreatment(profile: UserProfile) {
    const { treatments } = this.productDatabase

    if (profile.goals.includes("anti-aging") || profile.concerns.includes("fine lines")) {
      return treatments.find((t) => t.name.includes("Retinol"))
    }

    if (profile.skinType === "oily" || profile.concerns.includes("acne")) {
      return treatments.find((t) => t.name.includes("Niacinamide"))
    }

    if (profile.experience === "beginner") {
      return treatments.find((t) => t.name.includes("Hyaluronic"))
    }

    return treatments.find((t) => t.name.includes("Retinol")) // Default for experienced users
  }

  private static selectMoisturizer(profile: UserProfile) {
    const { moisturizers } = this.productDatabase

    if (profile.skinType === "oily" || profile.skinType === "combination") {
      return moisturizers.find((m) => m.name.includes("Gel")) || moisturizers[0]
    }

    return moisturizers.find((m) => m.name.includes("Cream")) || moisturizers[1]
  }

  private static selectSunscreen(profile: UserProfile) {
    const { sunscreens } = this.productDatabase

    if (profile.sensitivity === "high" || profile.skinType === "sensitive") {
      return sunscreens.find((s) => s.name.includes("Mineral")) || sunscreens[0]
    }

    return sunscreens[1] // Chemical sunscreen for normal skin
  }

  private static generateNotes(profile: UserProfile, notes: string[]) {
    notes.push("Always patch test new products before full application")
    notes.push("Introduce new actives gradually to avoid irritation")
    notes.push("Consistency is key - stick to your routine for at least 4-6 weeks")

    if (profile.experience === "beginner") {
      notes.push("Start with basic routine and add products slowly")
      notes.push("Focus on gentle, well-tolerated ingredients first")
    }

    if (profile.sensitivity === "high") {
      notes.push("Avoid fragrances and harsh actives")
      notes.push("Use lukewarm water and pat skin dry gently")
    }

    if (profile.concerns.includes("acne")) {
      notes.push("Avoid over-cleansing which can worsen breakouts")
      notes.push("Non-comedogenic products are essential")
    }

    notes.push("Sunscreen is the most important anti-aging step")
    notes.push("Take progress photos in consistent lighting to track improvements")
  }
}
