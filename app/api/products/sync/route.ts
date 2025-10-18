import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/services/product-service';

export async function POST(request: NextRequest) {
  try {
    const existingCount = await productService.getProductCount();
    
    console.log(`Current products in database: ${existingCount}`);
    
    const result = await productService.syncProductsFromApi();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        count: result.count
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in sync API route:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await productService.getProductCount();
    return NextResponse.json({
      success: true,
      count,
      message: `Database contains ${count} products`
    });
  } catch (error) {
    console.error('Error getting product count:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
