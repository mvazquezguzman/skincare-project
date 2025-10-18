import { NextResponse } from 'next/server';
import { seedService } from '@/lib/services/seed-service';

export async function POST(request: Request) {
  try {
    const { force } = await request.json().catch(() => ({}));
    
    let result;
    if (force) {
      console.log('Force seeding with sample products...');
      result = await seedService.forceSeedWithSamples();
    } else {
      result = await seedService.checkAndSeedProducts();
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in seed API route:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await seedService.checkAndSeedProducts();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in seed API route:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
