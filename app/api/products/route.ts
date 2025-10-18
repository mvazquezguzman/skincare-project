import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/product-service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    
    const products = await productService.getProductsFromDatabase(
      limit ? parseInt(limit) : undefined,
      offset ? parseInt(offset) : undefined
    );
    
    return NextResponse.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      products: []
    }, { status: 500 });
  }
}
