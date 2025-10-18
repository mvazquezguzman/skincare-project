import { productService } from './product-service';
import { createClient } from '../supabase-server';
import { createClient as createDirectClient } from '@supabase/supabase-js';

// Helper function to get the appropriate Supabase client
function getSupabaseClient() {
  try {
    // Try to use the server client first (for API routes)
    return createClient();
  } catch (error) {
    // If that fails (e.g., in scripts), use the direct client
    return createDirectClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
}

export class SeedService {
  // Sample products for seeding
  private getSampleProducts() {
    return [
      {
        id: 'sample-1',
        name: 'Gentle Cleanser',
        brand: 'Sample Brand',
        price: 25.99,
        image: '/photo-placeholder.jpg',
        rating: 4.5,
        review_count: 120,
        description: 'A gentle cleanser perfect for all skin types',
        category: 'cleanser',
        ingredients: ['Water', 'Glycerin', 'Hyaluronic Acid'],
        skin_type: ['normal', 'dry', 'sensitive'],
        concerns: ['hydration', 'gentle cleansing'],
        subcategory: 'facial cleanser',
        detailed_description: 'This gentle cleanser removes dirt and makeup while maintaining your skin\'s natural moisture barrier.'
      },
      {
        id: 'sample-2',
        name: 'Vitamin C Serum',
        brand: 'Glow Co',
        price: 45.00,
        image: '/photo-placeholder.jpg',
        rating: 4.8,
        review_count: 89,
        description: 'Brightening vitamin C serum for radiant skin',
        category: 'serum',
        ingredients: ['Vitamin C', 'Vitamin E', 'Ferulic Acid'],
        skin_type: ['normal', 'oily', 'combination'],
        concerns: ['brightening', 'anti-aging'],
        subcategory: 'vitamin c serum',
        detailed_description: 'Powerful vitamin C serum that brightens skin and reduces signs of aging.'
      },
      {
        id: 'sample-3',
        name: 'Hydrating Moisturizer',
        brand: 'Hydrate Plus',
        price: 32.50,
        image: '/photo-placeholder.jpg',
        rating: 4.3,
        review_count: 156,
        description: 'Intensely hydrating moisturizer for dry skin',
        category: 'moisturizer',
        ingredients: ['Hyaluronic Acid', 'Ceramides', 'Niacinamide'],
        skin_type: ['dry', 'normal'],
        concerns: ['hydration', 'moisture barrier'],
        subcategory: 'face moisturizer',
        detailed_description: 'Rich moisturizer that provides 24-hour hydration and strengthens the skin barrier.'
      }
    ];
  }

  // Check if products exist and seed if needed
  async checkAndSeedProducts() {
    try {
      const supabase = getSupabaseClient();
      
      // Check if we already have products
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error checking product count:', countError);
        throw countError;
      }

      if (count && count > 0) {
        return {
          success: true,
          message: `Database already contains ${count} products. No seeding needed.`,
          count: count
        };
      }

      // No products found, seed with sample data
      console.log('No products found, seeding with sample data...');
      const sampleProducts = this.getSampleProducts();
      
      const { data, error } = await supabase
        .from('products')
        .insert(sampleProducts)
        .select();

      if (error) {
        console.error('Error seeding products:', error);
        throw error;
      }

      return {
        success: true,
        message: `Successfully seeded ${data?.length || 0} sample products`,
        count: data?.length || 0
      };
    } catch (error) {
      console.error('Error in checkAndSeedProducts:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Force seed with sample products (overwrites existing)
  async forceSeedWithSamples() {
    try {
      const supabase = getSupabaseClient();
      
      // Clear existing products
      console.log('Clearing existing products...');
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all products
      
      if (deleteError) {
        console.error('Error clearing products:', deleteError);
        throw deleteError;
      }

      // Insert sample products
      console.log('Inserting sample products...');
      const sampleProducts = this.getSampleProducts();
      
      const { data, error } = await supabase
        .from('products')
        .insert(sampleProducts)
        .select();

      if (error) {
        console.error('Error inserting sample products:', error);
        throw error;
      }

      return {
        success: true,
        message: `Successfully force-seeded ${data?.length || 0} sample products`,
        count: data?.length || 0
      };
    } catch (error) {
      console.error('Error in forceSeedWithSamples:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Export a singleton instance
export const seedService = new SeedService();
