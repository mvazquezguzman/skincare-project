import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { RoutineStep } from '@/lib/profile-types'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Authenticated User
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to analyze your routine.' },
        { status: 401 }
      )
    }

    // Check for Gemini API key
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Fetch current routine
    const { data: userRoutine, error: routineError } = await supabase
      .from('user_routines')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_current', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (routineError) {
      if (routineError.code === 'PGRST116') {
        // No current routine found
        return NextResponse.json(
          { error: 'No routine found. Please create and save a routine first.' },
          { status: 400 }
        )
      }
      console.error('Error fetching current routine:', routineError)
      return NextResponse.json(
        { error: 'Failed to fetch routine. Please try again.' },
        { status: 500 }
      )
    }

    if (!userRoutine || !userRoutine.routine) {
      return NextResponse.json(
        { error: 'No routine found. Please create and save a routine first.' },
        { status: 400 }
      )
    }

    const routine: { morning: RoutineStep[]; evening: RoutineStep[] } = userRoutine.routine
    const allSteps = [...routine.morning, ...routine.evening]

    if (allSteps.length === 0) {
      return NextResponse.json(
        { error: 'Your routine is empty. Please add products to your routine first.' },
        { status: 400 }
      )
    }

    // Check for cached analysis first (if routine hasn't changed)
    const { data: existingAnalysis } = await supabase
      .from('routine_analyses')
      .select('analysis_result, created_at')
      .eq('routine_id', userRoutine.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // If analysis exists and routine hasn't been updated since, return cached result
    if (existingAnalysis && existingAnalysis.created_at >= userRoutine.updated_at) {
      return NextResponse.json({
        ...existingAnalysis.analysis_result,
        routineId: userRoutine.id
      })
    }

    // Fetch product details with ingredients from database
    const productIds = allSteps
      .map(step => step.productName)
      .filter(Boolean)
      .filter(name => name !== "Skipped - No product")

    // Fetch products from both sephora_products and ulta_products in parallel
    const [sephoraResult, ultaResult] = await Promise.all([
      productIds.length > 0 
        ? supabase
            .from('sephora_products')
            .select('productId, productBrand, productName, ingredients')
            .in('productName', productIds)
        : Promise.resolve({ data: null, error: null }),
      productIds.length > 0
        ? supabase
            .from('ulta_products')
            .select('id, productBrand, productName, ingredients')
            .in('productName', productIds)
        : Promise.resolve({ data: null, error: null })
    ])

    const sephoraProducts = sephoraResult
    const ultaProducts = ultaResult

    // Helper function to parse ingredients efficiently
    const parseIngredients = (ingredients: any): string[] => {
      if (Array.isArray(ingredients)) {
        return ingredients
      }
      if (!ingredients) {
        return []
      }
      if (typeof ingredients === 'string') {
        try {
          const parsed = JSON.parse(ingredients)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          // If not JSON, split by comma
          return ingredients.split(',').map((ing: string) => ing.trim()).filter(Boolean)
        }
      }
      return []
    }

    // Create a map of product names to their details
    const productMap = new Map<string, { brand?: string; ingredients?: string[] }>()
    
    if (sephoraProducts.data) {
      sephoraProducts.data.forEach((product: any) => {
        productMap.set(product.productName, {
          brand: product.productBrand,
          ingredients: parseIngredients(product.ingredients)
        })
      })
    }

    if (ultaProducts.data) {
      ultaProducts.data.forEach((product: any) => {
        productMap.set(product.productName, {
          brand: product.productBrand,
          ingredients: parseIngredients(product.ingredients)
        })
      })
    }

    // Build routine data for Gemini
    const routineData = {
      morning: routine.morning.map(step => ({
        category: step.category,
        productName: step.productName,
        brand: step.brand || productMap.get(step.productName)?.brand,
        ingredients: step.ingredients || productMap.get(step.productName)?.ingredients || []
      })),
      evening: routine.evening.map(step => ({
        category: step.category,
        productName: step.productName,
        brand: step.brand || productMap.get(step.productName)?.brand,
        ingredients: step.ingredients || productMap.get(step.productName)?.ingredients || []
      }))
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    // gemini-2.5-flash
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    console.log('Using Gemini model:', modelName)
    
    let model
    try {
      model = genAI.getGenerativeModel({ model: modelName })
    } catch (modelError) {
      console.error('Error initializing Gemini model:', modelError)
      // Try fallback to gemini-1.5-flash if gemini-2.5-flash fails
      if (modelName === 'gemini-2.5-flash') {
        console.log('Falling back to gemini-1.5-flash')
        model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      } else {
        throw modelError
      }
    }

    // Prompt for Gemini
    const prompt = `You are a skincare expert analyzing a skincare routine for potential ingredient conflicts and compatibility issues.

Routine Details:
Morning Routine:
${routineData.morning.map((step: { category: string; productName: string; brand?: string; ingredients: string[] }, idx: number) => 
  `${idx + 1}. ${step.category}: ${step.brand ? step.brand + ' ' : ''}${step.productName}
   Ingredients: ${step.ingredients.length > 0 ? step.ingredients.join(', ') : 'Not available'}`
).join('\n')}

Evening Routine:
${routineData.evening.map((step: { category: string; productName: string; brand?: string; ingredients: string[] }, idx: number) => 
  `${idx + 1}. ${step.category}: ${step.brand ? step.brand + ' ' : ''}${step.productName}
   Ingredients: ${step.ingredients.length > 0 ? step.ingredients.join(', ') : 'Not available'}`
).join('\n')}

Please analyze this skincare routine and identify:
1. Ingredient conflicts (e.g., incompatible ingredients used together, pH conflicts, over-exfoliation)
2. Potential irritations or sensitivities
3. Best practices violations (e.g., using retinol with AHA/BHA, mixing incompatible actives)
4. Recommendations for improvement

Respond in JSON format with the following structure:
{
  "overallScore": <number 0-100>,
  "summary": "<brief overall assessment>",
  "conflicts": [
    {
      "title": "<conflict title>",
      "description": "<detailed description>",
      "severity": "high" | "medium" | "low",
      "affectedProducts": ["<product name 1>", "<product name 2>"],
      "recommendation": "<specific recommendation>"
    }
  ],
  "recommendations": [
    {
      "title": "<recommendation title>",
      "description": "<detailed description>",
      "priority": "high" | "medium" | "low"
    }
  ]
}

Be thorough and specific. If no conflicts are found, return an empty conflicts array but still provide helpful recommendations.`

    // Call Gemini
    let result
    let response
    let text
    try {
      result = await model.generateContent(prompt)
      response = await result.response
      text = response.text()
    } catch (apiError: any) {
      console.error('Error calling Gemini API:', apiError)
      // If the model is not found, try falling back to gemini-1.5-flash
      if (apiError?.message?.includes('not found') || apiError?.message?.includes('404')) {
        console.log('Model not found, falling back to gemini-1.5-flash')
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        result = await fallbackModel.generateContent(prompt)
        response = await result.response
        text = response.text()
      } else {
        throw apiError
      }
    }

    // Parse JSON from response (Gemini may wrap it in markdown code blocks)
    let analysisResult
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/)
      const jsonString = jsonMatch ? jsonMatch[1] : text
      analysisResult = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError)
      console.error('Raw response:', text)
      // Fallback: create a structured response from the text
      analysisResult = {
        overallScore: 75,
        summary: text.substring(0, 500),
        conflicts: [],
        recommendations: [{
          title: "Analysis Complete",
          description: text,
          priority: "medium"
        }]
      }
    }

    // Validate and format the response
    const formattedResult = {
      overallScore: typeof analysisResult.overallScore === 'number' 
        ? Math.max(0, Math.min(100, analysisResult.overallScore)) 
        : 75,
      summary: analysisResult.summary || 'Analysis completed.',
      conflicts: Array.isArray(analysisResult.conflicts) 
        ? analysisResult.conflicts.map((conflict: any) => ({
            title: conflict.title || 'Conflict Detected',
            description: conflict.description || '',
            severity: ['high', 'medium', 'low'].includes(conflict.severity) 
              ? conflict.severity 
              : 'medium',
            affectedProducts: Array.isArray(conflict.affectedProducts) 
              ? conflict.affectedProducts 
              : [],
            recommendation: conflict.recommendation || ''
          }))
        : [],
      recommendations: Array.isArray(analysisResult.recommendations)
        ? analysisResult.recommendations.map((rec: any) => ({
            title: rec.title || 'Recommendation',
            description: rec.description || '',
            priority: ['high', 'medium', 'low'].includes(rec.priority)
              ? rec.priority
              : 'medium'
          }))
        : []
    }

    // Cache the analysis result in the background (don't wait for it)
    ;(async () => {
      const { error } = await supabase
        .from('routine_analyses')
        .insert({
          user_id: user.id,
          routine_id: userRoutine.id,
          analysis_result: formattedResult
        })
      if (error) {
        // Log but don't fail the request if caching fails
        console.error('Error caching analysis result:', error)
      }
    })()

    return NextResponse.json({
      ...formattedResult,
      routineId: userRoutine.id
    })
  } catch (error) {
    console.error('Error analyzing routine:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to analyze routine. Please try again.' 
      },
      { status: 500 }
    )
  }
}
