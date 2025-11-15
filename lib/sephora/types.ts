// Sephora API types

export interface SephoraApiResponse {
  success: boolean;
  data: {
    productId: string;
    currentSku: {
      skuId: string;
      listPrice: string;
      targetUrl: string;
      isOutOfStock: boolean;
      size?: string;
      variationType?: string;
      variationValue?: string;
      skuImages: {
        image250: string;
        altText: string;
        imageUrl: string;
      };
      alternateImages: Array<{
        image250: string;
        altText: string;
        imageUrl: string;
      }>;
      ingredientDesc?: string;
      highlights?: Array<{
        name: string;
        description?: string;
        appsImageUrl: string;
      }>;
    };
    productDetails: {
      productId: string;
      displayName: string;
      brand: {
        brandId: string;
        displayName: string;
        description?: string;
        targetUrl: string;
      };
      longDescription: string;
      shortDescription: string;
      suggestedUsage: string;
      lovesCount: number;
      rating: number;
      reviews: number;
    };
    parentCategory?: {
      categoryId: string;
      displayName: string;
      targetUrl: string;
    };
    fullSiteProductUrl?: string;
  };
}

export interface SephoraProduct {
  productId: string;
  productBrand: string;
  productName: string;
  price: number;
  categoryID?: string | null;
  categoryName?: string;
  skin_type?: string[];
  skin_concerns?: string[];
  ingredients?: string[];
  highlighted_ingredients?: string[];
  description?: string;
  detailed_description?: string;
  suggestedUsage?: string;
  imageURL?: string;
  productURL?: string;
}

export interface ProductIdentifier {
  productId?: string;
  skuId?: string;
}
