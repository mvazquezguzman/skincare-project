import { createClient } from '../supabase-server';
import { createClient as createDirectClient } from '@supabase/supabase-js';

/**
 * Get Supabase client with fallback to direct client
 */
export function getSupabaseClient() {
  try {
    return createClient();
  } catch (error) {
    return createDirectClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}

/**
 * Filter products by brand name (case-insensitive)
 */
export function filterByBrand(products: any[], brandName: string): any[] {
  const normalizedBrand = brandName.toLowerCase().trim();
  
  return products.filter(product => {
    const productBrand = product.brandName || 
                        product.brand?.displayName || 
                        product.brand?.name || 
                        '';
    return productBrand.toLowerCase().trim() === normalizedBrand;
  });
}

/**
 * Extract product IDs and SKU IDs from product list
 * Returns an array of objects with both productId and skuId for flexibility
 * Prioritizes productId as that's what the API validation seems to require
 */
export function extractProductIdentifiers(products: any[]): Array<{ productId?: string; skuId?: string }> {
  const identifiers: Array<{ productId?: string; skuId?: string }> = [];
  
  for (const product of products) {
    const identifier: { productId?: string; skuId?: string } = {};
    
    // Get productId first (API validation requires this)
    if (product.productId) {
      identifier.productId = String(product.productId);
    } else if (product.id) {
      identifier.productId = String(product.id);
    }
    
    // Also get skuId as fallback
    if (product.currentSku?.skuId) {
      identifier.skuId = String(product.currentSku.skuId);
    } else if (product.skuId) {
      identifier.skuId = String(product.skuId);
    }
    
    // Only add if we have at least one identifier (prefer productId)
    if (identifier.productId || identifier.skuId) {
      identifiers.push(identifier);
    }
  }
  
  return identifiers;
}
