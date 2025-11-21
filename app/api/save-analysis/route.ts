import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { saveRoutineAnalysis } from '@/lib/routine-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Authenticated User
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to save analysis results.' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { routineId, analysisResult } = body

    if (!routineId) {
      return NextResponse.json(
        { error: 'Routine ID is required.' },
        { status: 400 }
      )
    }

    if (!analysisResult) {
      return NextResponse.json(
        { error: 'Analysis result is required.' },
        { status: 400 }
      )
    }

    // Verify that the routine belongs to the user
    const { data: userRoutine, error: routineError } = await supabase
      .from('user_routines')
      .select('id')
      .eq('id', routineId)
      .eq('user_id', user.id)
      .single()

    if (routineError || !userRoutine) {
      return NextResponse.json(
        { error: 'Routine not found or access denied.' },
        { status: 404 }
      )
    }

    // Save the analysis result
    const savedAnalysis = await saveRoutineAnalysis(
      user.id,
      routineId,
      analysisResult,
      supabase
    )

    return NextResponse.json({
      success: true,
      analysis: savedAnalysis
    })
  } catch (error) {
    console.error('Error saving analysis:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to save analysis. Please try again.' 
      },
      { status: 500 }
    )
  }
}

