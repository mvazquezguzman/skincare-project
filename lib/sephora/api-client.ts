import axios, { AxiosRequestConfig } from 'axios';
import { SephoraApiResponse } from './types';

class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequestsPerSecond: number;
  private readonly minDelayMs: number;

  constructor(maxRequestsPerSecond: number = 1, minDelayMs: number = 1000) {
    this.maxRequestsPerSecond = maxRequestsPerSecond;
    this.minDelayMs = minDelayMs;
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const oneSecondAgo = now - 1000;

    this.requests = this.requests.filter(timestamp => timestamp > oneSecondAgo);

    // If we've hit the limit, wait until we can make another request
    if (this.requests.length >= this.maxRequestsPerSecond) {
      const oldestRequest = this.requests[0];
      const waitTime = Math.max(0, 1000 - (now - oldestRequest)) + 100; // Add 100ms buffer
      await new Promise(resolve => setTimeout(resolve, waitTime));
      // Clean up again after waiting
      const newNow = Date.now();
      this.requests = this.requests.filter(timestamp => timestamp > newNow - 1000);
    }

    this.requests.push(Date.now());
  }
}

export class SephoraApiClient {
  private readonly apiKey: string;
  private readonly apiHost: string = 'sephora17.p.rapidapi.com';
  private readonly listApiHost: string = 'sephora.p.rapidapi.com';
  private readonly rateLimiter: RateLimiter;

  constructor(apiKey: string) {
    this.apiKey = apiKey;

    this.rateLimiter = new RateLimiter(1, 1000);
  }

  private async retryWithBackoff<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 5,
    baseDelayMs: number = 2000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.rateLimiter.waitIfNeeded();
        
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        if (!axios.isAxiosError(error)) {
          throw error;
        }

        const statusCode = error.response?.status;
        
        const isRateLimitError = statusCode === 429;
        const isServerError = statusCode !== undefined && statusCode >= 500 && statusCode < 600;
        const isRetryableError = isRateLimitError || isServerError;
        
        if (isRetryableError && attempt < maxRetries) {
          const delayMultiplier = isRateLimitError ? 1 : 0.75;
          const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1) * delayMultiplier;
          const jitter = Math.random() * 1000;
          const delay = exponentialDelay + jitter;
          
          const errorType = isRateLimitError ? 'Rate limit exceeded (429)' : `Server error (${statusCode})`;
          console.warn(
            `${errorType}. Retrying in ${Math.round(delay)}ms (attempt ${attempt}/${maxRetries})...`
          );
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        if (!isRetryableError || attempt >= maxRetries) {
          const errorMessage = `API request failed: ${error.message} - ${error.response?.data ? JSON.stringify(error.response.data) : ''}`;
          throw new Error(errorMessage);
        }
      }
    }
    
    if (lastError) {
      if (axios.isAxiosError(lastError)) {
        const errorMessage = `API request failed after ${maxRetries} retries: ${lastError.message} - ${lastError.response?.data ? JSON.stringify(lastError.response.data) : ''}`;
        throw new Error(errorMessage);
      }
      throw lastError;
    }
    
    throw new Error('Request failed after all retries');
  }

  /**
   * Fetch product details from Sephora API using axios
   * Supports both productId and skuId parameters
   * Includes automatic retry with exponential backoff for rate limit errors (429) and server errors (5xx)
   */
  async fetchProductDetails(productIdOrSkuId: string, language: string = 'en-US', useSkuId: boolean = false): Promise<SephoraApiResponse> {
    return this.retryWithBackoff(async () => {
      const options = {
        method: 'GET',
        url: 'https://sephora17.p.rapidapi.com/product-details',
        params: useSkuId 
          ? { skuId: productIdOrSkuId, language: language }
          : { productId: productIdOrSkuId, language: language },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.apiHost
        }
      };

      try {
        const response = await axios.request(options);
        
        if (response.data.error) {
          throw new Error(`API returned error. Response: ${JSON.stringify(response.data)}`);
        }
        
        // The API returns data directly at top level (not wrapped in success/data)
        // If response has productId at top level, wrap it in the expected format
        if (response.data.productId && !response.data.data) {
          return {
            success: true,
            data: response.data
          } as SephoraApiResponse;
        }
        
        if (response.data.data) {
          return response.data as SephoraApiResponse;
        }
        
        if (response.data.error) {
          throw new Error(`API returned error. Response: ${JSON.stringify(response.data)}`);
        }
        
        return {
          success: true,
          data: response.data
        } as SephoraApiResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw error;
        }
        const errorMessage = `API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        throw new Error(errorMessage);
      }
    });
  }

  /**
   * Fetch product list from Sephora list API by category
   * Uses the sephora.p.rapidapi.com API to get product lists (different host than product-details)
   * Includes automatic retry with exponential backoff for rate limit errors (429) and server errors (5xx)
   */
  async fetchProductListByCategory(
    categoryId: string,
    pageSize: number = 50,
    currentPage: number = 1
  ): Promise<any[]> {
    return this.retryWithBackoff(async () => {
      const options: AxiosRequestConfig = {
        method: 'GET',
        url: 'https://sephora.p.rapidapi.com/us/products/v2/list',
        params: {
          pageSize: pageSize.toString(),
          currentPage: currentPage.toString(),
          categoryId: categoryId
        },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.listApiHost
        }
      };
      
      try {
        const response = await axios.request(options);
        
        return (response.data as any)?.products || (response.data as any)?.data?.products || [];
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw error;
        }
        const errorMessage = `Error fetching product list for category ${categoryId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        throw new Error(errorMessage);
      }
    });
  }
}
