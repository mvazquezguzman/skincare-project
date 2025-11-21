import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { routineGenerator } from '@/lib/routine-generator'
import { parseArrayField } from '@/lib/profile-utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Authenticated User
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to generate a routine.' },
        { status: 401 }
      )
    }

    // Fetch User Profile
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

    let excludeProductIds: string[] = []
    try {
      const body = await request.json()
      excludeProductIds = body.excludeProductIds || []
    } catch (e) {
      // Do nothing
    }

    // Convert Database Profile to Routine Generator Format
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

    // Validate Required Fields
    if (!userProfile.skinType) {
      return NextResponse.json(
        { error: 'Skin type is required. Please complete your skin quiz first.' },
        { status: 400 }
      )
    }

    // Generate Routine
    const routine = await routineGenerator.generateRoutine(userProfile, excludeProductIds)

    return NextResponse.json({ routine })
  } catch (error) {
    console.error('Error generating routine:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate routine. Please try again.' 
      },
      { status: 500 }
    )
  }
}
