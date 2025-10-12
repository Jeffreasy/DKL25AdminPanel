import { authManager } from './auth';
import type { UnderConstruction, UnderConstructionFormData, UnderConstructionResponse } from '../../features/under-construction/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com';

class UnderConstructionClient {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    const url = `${API_BASE}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      // For 404 responses, include the status code in the error message
      if (response.status === 404) {
        throw new Error('404');
      }
      const error = await response.json().catch(() => ({ error: 'API Error' }));
      throw new Error(error.error || 'API Error');
    }

    return response.json();
  }

  private async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    return authManager.makeAuthenticatedRequest(endpoint, options);
  }

  // Public endpoint - no authentication required
  async getActiveUnderConstruction(): Promise<UnderConstructionResponse | null> {
    try {
      const data = await this.makeRequest('/api/under-construction/active') as UnderConstruction;
      return this.mapFromAPI(data);
    } catch (error) {
      // Check if it's a 404 (no active under construction) - this is expected
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      // For other errors, still throw them
      throw error;
    }
  }

  // Admin endpoints - require authentication
  async getUnderConstructionList(limit = 10, offset = 0): Promise<UnderConstructionResponse[]> {
    const data = await this.makeAuthenticatedRequest(
      `/api/under-construction/admin?limit=${limit}&offset=${offset}`
    ) as UnderConstruction[];

    return data.map(item => this.mapFromAPI(item));
  }

  async getUnderConstructionById(id: number): Promise<UnderConstructionResponse | null> {
    try {
      const data = await this.makeAuthenticatedRequest(`/api/under-construction/${id}`) as UnderConstruction;
      return this.mapFromAPI(data);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async createUnderConstruction(data: UnderConstructionFormData): Promise<UnderConstructionResponse> {
    const apiData = this.mapToAPI(data);
    const result = await this.makeAuthenticatedRequest('/api/under-construction', {
      method: 'POST',
      body: JSON.stringify(apiData),
    }) as UnderConstruction;

    return this.mapFromAPI(result);
  }

  async updateUnderConstruction(id: number, data: UnderConstructionFormData): Promise<UnderConstructionResponse> {
    const apiData = this.mapToAPI(data);
    const result = await this.makeAuthenticatedRequest(`/api/under-construction/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
    }) as UnderConstruction;

    return this.mapFromAPI(result);
  }

  async deleteUnderConstruction(id: number): Promise<void> {
    await this.makeAuthenticatedRequest(`/api/under-construction/${id}`, {
      method: 'DELETE',
    });
  }

  private mapFromAPI(data: UnderConstruction): UnderConstructionResponse {
    return {
      id: data.id,
      isActive: data.is_active,
      title: data.title,
      message: data.message,
      footerText: data.footer_text,
      logoUrl: data.logo_url,
      expectedDate: data.expected_date,
      socialLinks: data.social_links ? JSON.parse(data.social_links) : [],
      progressPercentage: data.progress_percentage,
      contactEmail: data.contact_email,
      newsletterEnabled: data.newsletter_enabled,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapToAPI(data: UnderConstructionFormData): Partial<UnderConstruction> {
    return {
      is_active: data.is_active,
      title: data.title,
      message: data.message,
      footer_text: data.footer_text,
      logo_url: data.logo_url,
      expected_date: data.expected_date,
      social_links: JSON.stringify(data.social_links),
      progress_percentage: data.progress_percentage,
      contact_email: data.contact_email,
      newsletter_enabled: data.newsletter_enabled,
    };
  }
}

export const underConstructionClient = new UnderConstructionClient();