const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com';

export interface Partner {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  tier: 'bronze' | 'silver' | 'gold';
  since: string;
  visible: boolean;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export interface PartnerCreateData {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  tier: 'bronze' | 'silver' | 'gold';
  since: string;
  visible?: boolean;
  order_number?: number;
}

export interface PartnerUpdateData {
  name?: string;
  description?: string;
  logo?: string;
  website?: string;
  tier?: 'bronze' | 'silver' | 'gold';
  since?: string;
  visible?: boolean;
  order_number?: number;
}

class PartnerClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getPartners(): Promise<Partner[]> {
    const response = await fetch(`${API_BASE}/api/partners`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch partners: ${response.status}`);
    }

    return response.json();
  }

  async getPartner(id: string): Promise<Partner> {
    const response = await fetch(`${API_BASE}/api/partners/${id}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch partner: ${response.status}`);
    }

    return response.json();
  }

  async createPartner(data: PartnerCreateData): Promise<Partner> {
    const response = await fetch(`${API_BASE}/api/partners`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to create partner: ${response.status}`);
    }

    return response.json();
  }

  async updatePartner(id: string, data: PartnerUpdateData): Promise<Partner> {
    const response = await fetch(`${API_BASE}/api/partners/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to update partner: ${response.status}`);
    }

    return response.json();
  }

  async deletePartner(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/partners/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete partner: ${response.status}`);
    }
  }

  async reorderPartners(partnerIds: Array<{ id: string; order_number: number }>): Promise<void> {
    const response = await fetch(`${API_BASE}/api/partners/reorder`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ partners: partnerIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to reorder partners: ${response.status}`);
    }
  }
}

export const partnerClient = new PartnerClient();