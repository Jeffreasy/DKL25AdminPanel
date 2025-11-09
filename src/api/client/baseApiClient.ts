/**
 * Base API Client
 * Foundation voor alle API clients met:
 * - Automatic token management
 * - Token refresh op 401
 * - Standaard error handling
 * - Backend response format parsing
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { apiConfig } from '@/config/api.config';
import { TokenManager } from '@/features/auth/contexts/TokenManager';
import {
  BackendSuccessResponse,
  BackendPaginatedResponse,
  parseApiError,
  ApiError,
} from '@/utils/apiErrorHandler';

/**
 * Queue voor failed requests tijdens token refresh
 */
interface FailedRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
}

/**
 * Base API Client Class
 */
export class BaseApiClient {
  protected client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: FailedRequest[] = [];

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor - add token
    this.client.interceptors.request.use(
      (config) => {
        const token = TokenManager.getValidToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - token expired
        if (error.response?.status === 401 && originalRequest) {
          if (this.isRefreshing) {
            // Queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ 
                resolve, 
                reject, 
                config: originalRequest 
              });
            });
          }

          this.isRefreshing = true;

          try {
            // Attempt token refresh
            await this.refreshToken();

            // Retry all queued requests
            this.failedQueue.forEach(({ config, resolve }) => {
              resolve(this.client(config));
            });
            this.failedQueue = [];

            // Retry original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - reject all queued requests
            this.failedQueue.forEach(({ reject }) => {
              reject(refreshError);
            });
            this.failedQueue = [];

            // Clear tokens and redirect to login
            TokenManager.clearTokens();
            window.location.href = '/login';

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle 403 Forbidden - don't logout, just show error
        if (error.response?.status === 403) {
          const apiError = parseApiError(error);
          return Promise.reject(apiError);
        }

        // Handle other errors
        return Promise.reject(parseApiError(error));
      }
    );
  }

  /**
   * Refresh access token
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${apiConfig.baseURL}/api/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = response.data as BackendSuccessResponse<{
      access_token: string;
      refresh_token: string;
    }>;

    if (data.success && data.data) {
      TokenManager.setTokens(data.data.access_token, data.data.refresh_token);
    } else {
      throw new Error('Invalid refresh response');
    }
  }

  /**
   * GET request met automatic response parsing
   */
  protected async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.get<BackendSuccessResponse<T>>(url, config);
    
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    
    throw new ApiError('Invalid response format', 'INVALID_RESPONSE');
  }

  /**
   * GET request voor paginated data
   */
  protected async getPaginated<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<BackendPaginatedResponse<T>> {
    const response = await this.client.get<BackendPaginatedResponse<T>>(url, config);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new ApiError('Invalid response format', 'INVALID_RESPONSE');
  }

  /**
   * POST request met automatic response parsing
   */
  protected async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<BackendSuccessResponse<T>>(url, data, config);
    
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    
    throw new ApiError('Invalid response format', 'INVALID_RESPONSE');
  }

  /**
   * PUT request met automatic response parsing
   */
  protected async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<BackendSuccessResponse<T>>(url, data, config);
    
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    
    throw new ApiError('Invalid response format', 'INVALID_RESPONSE');
  }

  /**
   * DELETE request
   */
  protected async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T | void> {
    const response = await this.client.delete<BackendSuccessResponse<T>>(url, config);
    
    // Delete might not return data
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new ApiError('Invalid response format', 'INVALID_RESPONSE');
  }

  /**
   * PATCH request met automatic response parsing
   */
  protected async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<BackendSuccessResponse<T>>(url, data, config);
    
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    
    throw new ApiError('Invalid response format', 'INVALID_RESPONSE');
  }

  /**
   * Upload file (multipart/form-data)
   */
  protected async upload<T>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  ): Promise<T> {
    const response = await this.client.post<BackendSuccessResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    
    throw new ApiError('Invalid response format', 'INVALID_RESPONSE');
  }

  /**
   * Get axios instance for direct access (gebruik met voorzichtigheid)
   */
  protected getClient(): AxiosInstance {
    return this.client;
  }
}

/**
 * Singleton instance voor algemeen gebruik
 */
export const baseApiClient = new BaseApiClient();