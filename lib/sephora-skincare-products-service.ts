import { SephoraApiClient } from './sephora/api-client';
import { SephoraDatabaseService } from './sephora/database-service';
import { 
  parsePrice, 
  parseIngredients, 
  extractHighlightedIngredients,
  cleanProductData 
} from './sephora/parsers';
import { filterByBrand, extractProductIdentifiers } from './sephora/utils';
import { SephoraApiResponse, SephoraProduct, ProductIdentifier } from './sephora/types';

export class SephoraSkincareProductsService {
  private readonly apiClient: SephoraApiClient;
  private readonly databaseService: SephoraDatabaseService;

  constructor() {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      throw new Error('RAPIDAPI_KEY is required. Please set it in your .env.local file');
    }
    this.apiClient = new SephoraApiClient(apiKey);
    this.databaseService = new SephoraDatabaseService();
  }

  /**
   * Fetch product details from Sephora API
   * Supports both productId and skuId parameters
   */
  async fetchProductDetails(productIdOrSkuId: string, language: string = 'en-US', useSkuId: boolean = false): Promise<SephoraApiResponse> {
    return this.apiClient.fetchProductDetails(productIdOrSkuId, language, useSkuId);
  }

  /**
   * Transform API response to database format
   * @param apiResponse - The API response from sephora17 product-details endpoint
   * @param fallbackCategoryId - Optional category ID from the list API to use as fallback
   */
  transformApiResponse(apiResponse: SephoraApiResponse, fallbackCategoryId?: string): SephoraProduct {
    // Handle both wrapped and unwrapped response formats
    const data = apiResponse.data || apiResponse as any;
    const { currentSku, productDetails, parentCategory, fullSiteProductUrl, productId } = data;

    // Parse ingredients from HTML
    const ingredients = parseIngredients(currentSku.ingredientDesc);
    
    // Extract highlighted ingredients
    const highlightedIngredients = extractHighlightedIngredients(currentSku.highlights);

    return {
      productId: productId || data.productId || productDetails?.productId,
      productBrand: productDetails?.brand?.displayName || '',
      productName: productDetails?.displayName || '',
      price: parsePrice(currentSku?.listPrice || '0'),
      categoryID: parentCategory?.categoryId || fallbackCategoryId || null,
      categoryName: parentCategory?.displayName,
      skin_type: [], // Not available in API response, will need to be populated separately
      skin_concerns: [], // Not available in API response, will need to be populated separately
      ingredients: ingredients.length > 0 ? ingredients : [],
      highlighted_ingredients: highlightedIngredients.length > 0 ? highlightedIngredients : [],
      description: productDetails?.shortDescription || '',
      detailed_description: productDetails?.longDescription || productDetails?.shortDescription || '',
      suggestedUsage: productDetails?.suggestedUsage || '',
      imageURL: currentSku?.skuImages?.imageUrl || currentSku?.skuImages?.image250 || (currentSku as any)?.image || '',
      productURL: fullSiteProductUrl || (currentSku?.targetUrl ? `https://www.sephora.com${currentSku.targetUrl}` : '') || ''
    };
  }

  /**
   * Store a single product in the database
   */
  async storeProductInDatabase(product: SephoraProduct): Promise<any> {
    return this.databaseService.storeProduct(product);
  }

  /**
   * Store multiple products in the database
   */
  async storeProductsInDatabase(products: SephoraProduct[]): Promise<any[]> {
    return this.databaseService.storeProducts(products);
  }

  /**
   * Fetch and store a single product by Product ID or SKU ID
   */
  async fetchAndStoreProduct(productIdOrSkuId: string, language: string = 'en-US', useSkuId: boolean = false): Promise<any> {
    try {
      const identifierType = useSkuId ? 'skuId' : 'productId';
      console.log(`Fetching product details for ${identifierType}: ${productIdOrSkuId}...`);
      
      const apiResponse = await this.fetchProductDetails(productIdOrSkuId, language, useSkuId);
      const transformedProduct = this.transformApiResponse(apiResponse);
      
      console.log(`Storing product: ${transformedProduct.productName}...`);
      const storedProduct = await this.storeProductInDatabase(transformedProduct);
      
      console.log(`Successfully stored product: ${storedProduct.productName}`);
      return storedProduct;
    } catch (error) {
      console.error(`Error fetching/storing product for ${productIdOrSkuId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch and store multiple products by product identifiers (productId or skuId)
   */
  async fetchAndStoreProductsByIdentifiers(
    identifiers: ProductIdentifier[],
    language: string = 'en-US',
    delayMs: number = 2000
  ): Promise<any[]> {
    const storedProducts: any[] = [];
    const errors: Array<{ identifier: string; error: Error }> = [];

    for (let i = 0; i < identifiers.length; i++) {
      const identifier = identifiers[i];
      
      if (!identifier.productId && !identifier.skuId) {
        console.warn('Skipping product with no identifier');
        continue;
      }
      
      try {
        // Try productId first, fallback to skuId if available
        if (identifier.productId) {
          const product = await this.fetchAndStoreProduct(identifier.productId, language, false);
          storedProducts.push(product);
        } else if (identifier.skuId) {
          // Try with skuId as fallback
          console.log(`Using skuId as fallback: ${identifier.skuId}`);
          const product = await this.fetchAndStoreProduct(identifier.skuId, language, true);
          storedProducts.push(product);
        } else {
          console.warn('Skipping product - no productId or skuId available');
          continue;
        }
        
        // Add delay between requests to respect rate limits (except for last item)
        if (i < identifiers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error : new Error('Unknown error');
        errors.push({ identifier: identifier.productId || identifier.skuId || 'unknown', error: errorMsg });
        console.error(`Failed to fetch/store product ${identifier.productId || identifier.skuId}:`, errorMsg.message);
        
        // Continue with next product even if one fails
      }
    }

    if (errors.length > 0) {
      console.warn(`Completed with ${errors.length} errors out of ${identifiers.length} products`);
      console.warn('Errors:', errors.map(e => `${e.identifier}: ${e.error.message}`));
    }

    return storedProducts;
  }

  /**
   * Fetch and store multiple products by SKU IDs
   */
  async fetchAndStoreProducts(skuIds: string[], language: string = 'en-US', delayMs: number = 2000): Promise<any[]> {
    const storedProducts: any[] = [];
    const errors: Array<{ skuId: string; error: Error }> = [];

    for (let i = 0; i < skuIds.length; i++) {
      const skuId = skuIds[i];
      
      try {
        const product = await this.fetchAndStoreProduct(skuId, language);
        storedProducts.push(product);
        
        // Add delay between requests to respect rate limits (except for last item)
        if (i < skuIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error : new Error('Unknown error');
        errors.push({ skuId, error: errorMsg });
        console.error(`Failed to fetch/store SKU ${skuId}:`, errorMsg.message);
        
        // Continue with next product even if one fails
      }
    }

    if (errors.length > 0) {
      console.warn(`Completed with ${errors.length} errors out of ${skuIds.length} products`);
      console.warn('Errors:', errors.map(e => `${e.skuId}: ${e.error.message}`));
    }

    return storedProducts;
  }

  /**
   * Get products from database
   */
  async getProductsFromDatabase(limit?: number, offset?: number) {
    return this.databaseService.getProducts(limit, offset);
  }

  /**
   * Get product count from database
   */
  async getProductCount(): Promise<number> {
    return this.databaseService.getProductCount();
  }

  /**
   * Fetch product list from Sephora list API by category
   * Uses the sephora.p.rapidapi.com API to get product lists (different host than product-details)
   */
  async fetchProductListByCategory(
    categoryId: string,
    pageSize: number = 50,
    currentPage: number = 1
  ): Promise<any[]> {
    return this.apiClient.fetchProductListByCategory(categoryId, pageSize, currentPage);
  }

  /**
   * Clean a single product's description, suggestedUsage, and extract skin_type/skin_concerns
   */
  cleanProductData(product: any): {
    description: string;
    skin_type: string[];
    skin_concerns: string[];
    suggestedUsage: string;
    detailed_description?: string;
  } {
    return cleanProductData(product);
  }

  /**
   * Clean up all products in the database
   * Updates description, suggestedUsage, skin_type, and skin_concerns fields
   */
  async cleanupProducts(): Promise<{ success: boolean; message: string; updated: number }> {
    try {
      console.log('🧹 Starting product cleanup...');
      
      // Get all products
      const products = await this.getProductsFromDatabase();
      console.log(`📦 Found ${products.length} products to clean`);
      
      if (products.length === 0) {
        return {
          success: true,
          message: 'No products to clean',
          updated: 0
        };
      }

      let updatedCount = 0;
      const errors: Array<{ productId: string; error: string }> = [];

      // Process each product
      for (const product of products) {
        try {
          const cleaned = this.cleanProductData(product);
          
          // Update the product in database
          await this.databaseService.updateProduct(product.productId, {
            description: cleaned.description,
            suggestedUsage: cleaned.suggestedUsage,
            skin_type: cleaned.skin_type,
            skin_concerns: cleaned.skin_concerns,
            ...(cleaned.detailed_description !== undefined && { detailed_description: cleaned.detailed_description })
          });

          updatedCount++;
          if (updatedCount % 10 === 0) {
            console.log(`✅ Updated ${updatedCount}/${products.length} products...`);
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ productId: product.productId, error: errorMsg });
          console.error(`❌ Error processing product ${product.productId}:`, errorMsg);
        }
      }

      console.log(`\n✨ Cleanup completed!`);
      console.log(`   Updated: ${updatedCount}/${products.length}`);
      
      if (errors.length > 0) {
        console.log(`   Errors: ${errors.length}`);
        console.log('   Error details:', errors.slice(0, 5));
      }

      return {
        success: errors.length === 0,
        message: `Updated ${updatedCount} out of ${products.length} products${errors.length > 0 ? ` (${errors.length} errors)` : ''}`,
        updated: updatedCount
      };
    } catch (error) {
      console.error('💥 Cleanup failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        updated: 0
      };
    }
  }

  /**
   * Sync products by category and brand
   * Fetches product lists from categories, filters by brand, then fetches detailed info
   */
  async syncProductsByCategoryAndBrand(
    categoryIds: string[],
    brandName: string,
    delayMs: number = 2000
  ): Promise<{ success: boolean; message: string; count: number }> {
    try {
      console.log(`Starting sync for brand: ${brandName}`);
      console.log(`Categories: ${categoryIds.join(', ')}`);
      
      const pageSize = 50;
      const maxConsecutiveErrors = 3;
      let allMatchingProducts: any[] = [];

      // Step 1: Fetch product lists from all categories
      for (const categoryId of categoryIds) {
        console.log(`\n📦 Fetching products from category: ${categoryId}...`);
        let currentPage = 1;
        let hasMorePages = true;
        let consecutiveErrors = 0;

        while (hasMorePages && consecutiveErrors < maxConsecutiveErrors) {
          try {
            const products = await this.fetchProductListByCategory(categoryId, pageSize, currentPage);
            
            if (!products || products.length === 0) {
              console.log(`No products found for category ${categoryId} on page ${currentPage}`);
              hasMorePages = false;
              break;
            }

            // Filter for the specified brand
            const brandProducts = filterByBrand(products, brandName);
            
            if (brandProducts.length > 0) {
              console.log(`Found ${brandProducts.length} ${brandName} product(s) in category ${categoryId}, page ${currentPage}`);
              allMatchingProducts = allMatchingProducts.concat(brandProducts);
            }

            // Reset error counter on success
            consecutiveErrors = 0;

            // If we got fewer products than page size, we've reached the end
            if (products.length < pageSize) {
              hasMorePages = false;
            } else {
              currentPage++;
            }

            // Add delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, delayMs));
          } catch (error) {
            consecutiveErrors++;
            console.error(`Error fetching category ${categoryId} page ${currentPage} (attempt ${consecutiveErrors}/${maxConsecutiveErrors}):`, error);

            if (consecutiveErrors >= maxConsecutiveErrors) {
              console.log(`❌ Too many consecutive errors for category ${categoryId}, skipping to next category`);
              break;
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }

      if (allMatchingProducts.length === 0) {
        console.log(`\n⚠️  No products found for brand: ${brandName} in the specified categories`);
        return {
          success: false,
          message: `No products found for brand: ${brandName}`,
          count: 0
        };
      }

      // Step 2: Extract product identifiers from matching products
      const productIdentifiers = extractProductIdentifiers(allMatchingProducts);
      
      // Remove duplicates by productId
      const uniqueIdentifiers = productIdentifiers.filter((identifier, index, self) => 
        index === self.findIndex(p => 
          (p.productId && identifier.productId && p.productId === identifier.productId) ||
          (!p.productId && !identifier.productId && p.skuId === identifier.skuId)
        )
      );
      
      console.log(`\n✅ Found ${uniqueIdentifiers.length} unique ${brandName} product(s) across all categories`);
      console.log(`Product identifiers: ${uniqueIdentifiers.slice(0, 5).map(p => p.productId || p.skuId).join(', ')}${uniqueIdentifiers.length > 5 ? '...' : ''}`);

      // Step 3: Fetch detailed product info and store in database
      console.log(`\n📥 Fetching detailed product information...`);
      const storedProducts = await this.fetchAndStoreProductsByIdentifiers(uniqueIdentifiers, 'en-US', delayMs);

      console.log(`\n✨ Successfully synced ${storedProducts.length} ${brandName} product(s) to database`);
      
      return {
        success: true,
        message: `Successfully synced ${storedProducts.length} ${brandName} product(s) from ${categoryIds.length} categories`,
        count: storedProducts.length
      };
    } catch (error) {
      console.error('Error syncing products by category and brand:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        count: 0
      };
    }
  }
}

// Export a singleton instance
export const sephoraSkincareProductsService = new SephoraSkincareProductsService();

// Re-export types for convenience
export type { SephoraApiResponse, SephoraProduct, ProductIdentifier } from './sephora/types';
