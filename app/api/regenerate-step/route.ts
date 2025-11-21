import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { routineGenerator } from '@/lib/routine-generator'
import { parseArrayField } from '@/lib/profile-utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to regenerate a step.' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { stepId, category, timeOfDay, excludeProductIds, originalStepNumber, originalStepId } = body

    if (!stepId || !category || !timeOfDay) {
      return NextResponse.json(
        { error: 'Missing required fields: stepId, category, and timeOfDay are required.' },
        { status: 400 }
      )
    }

    // Fetch user profile from database
    const { data: dbProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile. Please complete your skin quiz first.' },
        { status: 400 }
      )
    }

    // Convert database profile to routine generator format
    const userProfile = {
      skinType: dbProfile.skin_type as string | null,
      skinConcerns: parseArrayField(dbProfile.skin_concerns),
      skinGoals: parseArrayField(dbProfile.skin_goals),
      allergies: parseArrayField(dbProfile.allergies || dbProfile.ingredient_preferences),
      ingredientPreferences: parseArrayField(dbProfile.ingredient_preferences),
      budgetRange: dbProfile.budget_range || undefined,
      makeupUsage: dbProfile.makeup_usage || undefined,
      sunscreenPreference: dbProfile.sunscreen_preference || undefined,
    }

    // Validate required fields
    if (!userProfile.skinType) {
      return NextResponse.json(
        { error: 'Skin type is required. Please complete your skin quiz first.' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'eye-cream', 'exfoliant', 'retinoid', 'mask']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate timeOfDay
    if (timeOfDay !== 'morning' && timeOfDay !== 'evening') {
      return NextResponse.json(
        { error: 'Invalid timeOfDay. Must be "morning" or "evening".' },
        { status: 400 }
      )
    }

    // Regenerate step
    const excludeIds = excludeProductIds || []
    const regeneratedStep = await routineGenerator.regenerateStep(
      userProfile,
      category,
      timeOfDay,
      excludeIds,
      originalStepNumber,
      originalStepId
    )

    if (!regeneratedStep) {
      return NextResponse.json(
        { error: 'Failed to regenerate step. No products found matching your criteria.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ step: regeneratedStep })
  } catch (error) {
    console.error('Error regenerating step:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to regenerate step. Please try again.' 
      },
      { status: 500 }
    )
  }
}

