import { createClient } from '../supabase-server';
import { createClient as createDirectClient } from '@supabase/supabase-js';
import { apiClient } from '../api-client';

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

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  description: string;
  category?: string;
  ingredients?: string[];
  skinType?: string[];
  concerns?: string[];
  subcategory?: string;
  detailedDescription?: string;
}

export interface ApiProduct {
  id?: string;
  productId?: string;
  displayName: string;
  brandName: string;
  currentSku: {
    listPrice: string | number;
  };
  heroImage: string;
  rating: string | number;
  reviewsCount?: string | number;
  reviews?: string | number;
  shortDescription?: string;
  categoryId?: string;
  ingredients?: string[];
  skinType?: string[];
  concerns?: string[];
  subcategory?: string;
  detailedDescription?: string;
  targetUrl?: string;
}

export class ProductService {
  // Fetch products from external API
  async fetchProductsFromApi(pageSize: number = 50, currentPage: number = 1) {
    const apiKey = process.env.RAPIDAPI_KEY;
    
    if (!apiKey) {
      throw new Error('RAPIDAPI_KEY is required. Please set it in your .env.local file');
    }

    const options = {
      method: 'GET',
      url: 'https://sephora.p.rapidapi.com/us/products/v2/list',
      params: {
        pageSize: pageSize.toString(),
        currentPage: currentPage.toString(),
        categoryId: 'cat150006' // Skincare category
      },
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'sephora.p.rapidapi.com'
      }
    };
    
    try {
      const response = await apiClient.get(options.url, {
        params: options.params,
        headers: options.headers
      }, 3); // 3 retries with exponential backoff
      
      // The API returns products in response.data.products, not response.data.data.products
      return response?.products || [];
    } catch (error) {
      console.error('Error fetching products from API:', error);
      
      // Handle specific API subscription errors
      if (error instanceof Error && error.message.includes('not subscribed')) {
        throw new Error('API subscription required. Please subscribe to the Sephora API on RapidAPI.');
      }
      
      throw error;
    }
  }

  // Transform API product to our database format
  transformApiProduct(apiProduct: ApiProduct): Omit<Product, 'reviewCount'> & { 
    review_count: number;
    ingredients?: string[];
    skin_type?: string[];
    concerns?: string[];
    subcategory?: string;
    detailed_description?: string;
  } {
    // Parse price from string format like "$649.00" to number
    const parsePrice = (priceStr: string | number): number => {
      if (typeof priceStr === 'number') return priceStr;
      if (typeof priceStr === 'string') {
        // Remove $ and convert to number
        const cleanPrice = priceStr.replace('$', '').replace(',', '');
        return parseFloat(cleanPrice) || 0;
      }
      return 0;
    };

    return {
      id: apiProduct.productId || apiProduct.id || `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: apiProduct.displayName,
      brand: apiProduct.brandName,
      price: parsePrice(apiProduct.currentSku?.listPrice || 0),
      image: apiProduct.heroImage || '/photo-placeholder.jpg',
      rating: parseFloat(apiProduct.rating?.toString() || '0') || 0,
      review_count: parseInt((apiProduct.reviewsCount || apiProduct.reviews || '0').toString()) || 0,
      description: apiProduct.shortDescription || '',
      category: apiProduct.categoryId,
      ingredients: apiProduct.ingredients || [],
      skin_type: apiProduct.skinType || [],
      concerns: apiProduct.concerns || [],
      subcategory: apiProduct.subcategory,
      detailed_description: apiProduct.detailedDescription || apiProduct.shortDescription || ''
    };
  }

  // Store products in database
  async storeProductsInDatabase(products: any[]) {
    const supabase = getSupabaseClient();
    
    const transformedProducts = products.map(product => this.transformApiProduct(product));
    
    // Remove duplicates within the same batch to avoid constraint errors
    const uniqueProducts = transformedProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );
    
    console.log(`Storing ${uniqueProducts.length} unique products (removed ${transformedProducts.length - uniqueProducts.length} duplicates)`);
    
    const { data, error } = await supabase
      .from('products')
      .upsert(uniqueProducts, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Error storing products:', error);
      throw error;
    }

    return data;
  }

  // Fetch products from database
  async getProductsFromDatabase(limit?: number, offset?: number) {
    const supabase = getSupabaseClient();
    
    // If no limit specified, fetch all products in batches
    if (!limit) {
      let allProducts: any[] = [];
      let currentOffset = 0;
      const batchSize = 1000;
      
      while (true) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .range(currentOffset, currentOffset + batchSize - 1);
        
        if (error) {
          console.error('Error fetching products from database:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          break;
        }
        
        allProducts = [...allProducts, ...data];
        
        // If we got less than batchSize, we've reached the end
        if (data.length < batchSize) {
          break;
        }
        
        currentOffset += batchSize;
      }
      
      // Transform all products
      return allProducts.map(product => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        rating: product.rating,
        reviewCount: product.review_count,
        description: product.description,
        category: product.category,
        ingredients: product.ingredients,
        skinType: product.skin_type,
        concerns: product.concerns,
        subcategory: product.subcategory,
        detailedDescription: product.detailed_description
      }));
    }
    
    // Original logic for when limit is specified
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    query = query.limit(limit);
    
    if (offset) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products from database:', error);
      throw error;
    }

    // Transform database products to match our Product interface
    return data?.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      rating: product.rating,
      reviewCount: product.review_count,
      description: product.description,
      category: product.category,
      ingredients: product.ingredients,
      skinType: product.skin_type,
      concerns: product.concerns,
      subcategory: product.subcategory,
      detailedDescription: product.detailed_description
    })) || [];
  }

  // Sync products from API to database
  async syncProductsFromApi() {
    try {
      console.log('Starting product sync from API...');
      
      let allProducts: any[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const pageSize = 50; // API max page size
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 3;
      
      // Fetch all pages of products
      while (hasMorePages && consecutiveErrors < maxConsecutiveErrors) {
        console.log(`Fetching page ${currentPage}...`);
        
        try {
          const apiProducts = await this.fetchProductsFromApi(pageSize, currentPage);
          
          if (apiProducts.length === 0) {
            console.log(`No products found on page ${currentPage}, stopping pagination`);
            hasMorePages = false;
            break;
          }
          
          allProducts = allProducts.concat(apiProducts);
          console.log(`Fetched ${apiProducts.length} products from page ${currentPage} (total: ${allProducts.length})`);
          
          // Reset error counter on successful fetch
          consecutiveErrors = 0;
          
          // If we got fewer products than the page size, we've reached the end
          if (apiProducts.length < pageSize) {
            hasMorePages = false;
          } else {
            currentPage++;
          }
          
          // Add a delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          consecutiveErrors++;
          console.error(`Error fetching page ${currentPage} (attempt ${consecutiveErrors}/${maxConsecutiveErrors}):`, error);
          
          // If it's a rate limit error, wait longer before continuing
          if (error instanceof Error && (error.message.includes('rate limit') || error.message.includes('429'))) {
            console.log('Rate limit hit, waiting 10 seconds before continuing...');
            await new Promise(resolve => setTimeout(resolve, 10000));
            continue;
          }
          
          // If it's a 403 error (forbidden), the API key might be invalid
          if (error instanceof Error && error.message.includes('403')) {
            console.log('❌ API key is invalid or expired. Please check your RAPIDAPI_KEY.');
            throw new Error('API access forbidden. Please check your API key.');
          }
          
          // If we've hit max consecutive errors, stop
          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.log(`❌ Too many consecutive errors (${consecutiveErrors}), stopping sync`);
            throw new Error(`Too many consecutive errors (${consecutiveErrors}). Please check your API key and try again.`);
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      if (allProducts.length === 0) {
        console.log('No products found in API response');
        return { success: false, message: 'No products found in API response' };
      }

      console.log(`Total products fetched: ${allProducts.length}`);
      
      // Store all products in database
      const storedProducts = await this.storeProductsInDatabase(allProducts);
      
      console.log(`Successfully synced ${storedProducts?.length || 0} products`);
      
      return { 
        success: true, 
        message: `Successfully synced ${storedProducts?.length || 0} products from ${currentPage} pages`,
        count: storedProducts?.length || 0
      };
    } catch (error) {
      console.error('Error syncing products:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Get product count from database
  async getProductCount() {
    const supabase = getSupabaseClient();
    
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting product count:', error);
      throw error;
    }

    return count || 0;
  }
}

// Export a singleton instance
export const productService = new ProductService();
