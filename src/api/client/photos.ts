import { authManager } from './auth';

export interface PhotoApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
  limit?: number;
  offset?: number;
}

export interface PhotoFilters {
  year?: number;
  title?: string;
  description?: string;
  cloudinary_folder?: string;
  limit?: number;
  offset?: number;
}

export interface PhotoCreateData {
  url: string;
  alt_text: string;
  visible?: boolean;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  year?: number;
  cloudinary_folder?: string;
}

export interface PhotoUpdateData {
  title?: string;
  description?: string;
  visible?: boolean;
  alt_text?: string;
  thumbnail_url?: string;
  year?: number;
  cloudinary_folder?: string;
}

class PhotoApiClient {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<PhotoApiResponse> {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com';
    const fullUrl = `${apiBase}${endpoint}`;

    try {
      const response = await authManager.makeAuthenticatedRequest(fullUrl, options);
      
      // Backend returns direct array for list endpoints, wrap it
      if (Array.isArray(response)) {
        return {
          success: true,
          data: response
        };
      }
      
      // Backend returns direct object for single items, wrap it
      if (response && typeof response === 'object' && !('success' in response)) {
        return {
          success: true,
          data: response
        };
      }
      
      // Already wrapped response
      return response as PhotoApiResponse;
    } catch (error) {
      console.error(`Photo API request failed for ${fullUrl}:`, error);
      throw error;
    }
  }

  async getPhotos(filters: PhotoFilters = {}): Promise<PhotoApiResponse> {
    const params = new URLSearchParams();

    if (filters.year) params.append('year', filters.year.toString());
    if (filters.title) params.append('title', filters.title);
    if (filters.description) params.append('description', filters.description);
    if (filters.cloudinary_folder) params.append('cloudinary_folder', filters.cloudinary_folder);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `/api/photos${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest(endpoint);
  }

  async getPhotosAdmin(filters: { limit?: number; offset?: number } = {}): Promise<PhotoApiResponse> {
    const params = new URLSearchParams();

    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `/api/photos/admin${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest(endpoint);
  }

  async getPhoto(id: string): Promise<PhotoApiResponse> {
    return this.makeRequest(`/api/photos/${id}`);
  }

  async createPhoto(data: PhotoCreateData): Promise<PhotoApiResponse> {
    return this.makeRequest('/api/photos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePhoto(id: string, data: PhotoUpdateData): Promise<PhotoApiResponse> {
    return this.makeRequest(`/api/photos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePhoto(id: string): Promise<PhotoApiResponse> {
    return this.makeRequest(`/api/photos/${id}`, {
      method: 'DELETE',
    });
  }
}

export const photoApiClient = new PhotoApiClient();