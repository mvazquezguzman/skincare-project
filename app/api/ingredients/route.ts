import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Ingredient service implementation pending
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    // Placeholder response - implement with ingredient service
    return NextResponse.json({
      success: true,
      ingredients: [],
      count: 0,
      message: 'Ingredient API endpoint - to be implemented'
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      ingredients: []
    }, { status: 500 });
  }
}
