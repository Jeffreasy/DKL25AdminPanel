import { authManager } from './auth';
import type { Sponsor, SponsorFormData } from '../../features/sponsors/types';

interface SponsorAPIResponse {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website_url?: string;
  order_number: number;
  is_active: boolean;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com';

class SponsorClient {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    const url = `${API_BASE}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'API Error' }));
      throw new Error(error.error || 'API Error');
    }

    return response.json();
  }

  private async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    return authManager.makeAuthenticatedRequest(endpoint, options);
  }

  // Public endpoint - no authentication required
  async getSponsors(): Promise<Sponsor[]> {
    const data = await this.makeRequest('/api/sponsors') as SponsorAPIResponse[];
    return data.map(item => this.mapFromAPI(item));
  }

  // Admin endpoints - require authentication
  async getSponsorsAdmin(limit?: number, offset?: number): Promise<Sponsor[]> {
    let endpoint = '/api/sponsors/admin';
    if (limit !== undefined || offset !== undefined) {
      const params = new URLSearchParams();
      if (limit !== undefined) params.append('limit', limit.toString());
      if (offset !== undefined) params.append('offset', offset.toString());
      endpoint += `?${params.toString()}`;
    }
    const data = await this.makeAuthenticatedRequest(endpoint) as SponsorAPIResponse[];
    return data.map(item => this.mapFromAPI(item));
  }

  async getSponsorById(id: string): Promise<Sponsor | null> {
    try {
      const data = await this.makeAuthenticatedRequest(`/api/sponsors/${id}`) as SponsorAPIResponse;
      return this.mapFromAPI(data);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async createSponsor(data: SponsorFormData): Promise<Sponsor> {
    const apiData = this.mapToAPI(data);
    const result = await this.makeAuthenticatedRequest('/api/sponsors', {
      method: 'POST',
      body: JSON.stringify(apiData),
    }) as SponsorAPIResponse;

    return this.mapFromAPI(result);
  }

  async updateSponsor(id: string, data: SponsorFormData): Promise<Sponsor> {
    const apiData = this.mapToAPI(data);
    const result = await this.makeAuthenticatedRequest(`/api/sponsors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiData),
    }) as SponsorAPIResponse;

    return this.mapFromAPI(result);
  }

  async deleteSponsor(id: string): Promise<void> {
    await this.makeAuthenticatedRequest(`/api/sponsors/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadLogo(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/photos`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${authManager.getToken()}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  private mapFromAPI(data: SponsorAPIResponse): Sponsor {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      logoUrl: data.logo_url,
      websiteUrl: data.website_url,
      order: data.order_number,
      isActive: data.is_active,
      visible: data.visible,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapToAPI(data: SponsorFormData): Omit<SponsorAPIResponse, 'id' | 'created_at' | 'updated_at'> {
    return {
      name: data.name,
      description: data.description,
      logo_url: data.logoUrl,
      website_url: data.websiteUrl,
      order_number: data.order,
      is_active: data.isActive,
      visible: data.visible,
    };
  }
}

export const sponsorClient = new SponsorClient();