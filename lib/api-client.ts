import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = '', timeout: number = 30000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig, retries: number = 3): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response: AxiosResponse = await axios.get(url, {
          ...config,
          timeout: this.timeout,
          baseURL: this.baseURL
        });
        return response.data;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          // Exponential backoff: wait 2^attempt seconds
          const delay = Math.pow(2, attempt) * 1000;
          // Retrying after delay
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse = await axios.post(url, data, {
      ...config,
      timeout: this.timeout,
      baseURL: this.baseURL
    });
    return response.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse = await axios.put(url, data, {
      ...config,
      timeout: this.timeout,
      baseURL: this.baseURL
    });
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse = await axios.delete(url, {
      ...config,
      timeout: this.timeout,
      baseURL: this.baseURL
    });
    return response.data;
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
