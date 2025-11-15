import { getSupabaseClient } from './utils';
import { SephoraProduct } from './types';

export class SephoraDatabaseService {
  /**
   * Store a single product in the database
   */
  async storeProduct(product: SephoraProduct): Promise<any> {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('sephora_products')
      .upsert(product, { 
        onConflict: 'productId',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing product:', error);
      throw error;
    }

    return data;
  }

  /**
   * Store multiple products in the database
   */
  async storeProducts(products: SephoraProduct[]): Promise<any[]> {
    const supabase = getSupabaseClient();
    
    // Remove duplicates within the same batch
    const uniqueProducts = products.filter((product, index, self) => 
      index === self.findIndex(p => p.productId === product.productId)
    );
    
    console.log(`Storing ${uniqueProducts.length} unique products (removed ${products.length - uniqueProducts.length} duplicates)`);
    
    const { data, error } = await supabase
      .from('sephora_products')
      .upsert(uniqueProducts, { 
        onConflict: 'productId',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Error storing products:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get products from database
   */
  async getProducts(limit?: number, offset?: number) {
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from('sephora_products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    if (offset !== undefined) {
      query = query.range(offset, offset + (limit || 1000) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products from database:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get product count from database
   */
  async getProductCount(): Promise<number> {
    const supabase = getSupabaseClient();
    
    const { count, error } = await supabase
      .from('sephora_products')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting product count:', error);
      throw error;
    }

    return count || 0;
  }

  /**
   * Update a product in the database
   */
  async updateProduct(productId: string, updates: Partial<SephoraProduct>): Promise<void> {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('sephora_products')
      .update(updates)
      .eq('productId', productId);

    if (error) {
      console.error(`Error updating product ${productId}:`, error);
      throw error;
    }
  }
}
