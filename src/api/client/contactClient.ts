const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com';

/**
 * Contact antwoord interface
 * Komt overeen met ContactAntwoord uit backend API
 */
export interface ContactAntwoord {
  id: string;
  contact_id: string;
  tekst: string;
  verzond_door: string;
  email_verzonden: boolean;
  created_at: string;
}

/**
 * Contact formulier interface
 * Komt overeen met ContactFormulier uit backend API
 */
export interface ContactMessage {
  id: string;
  naam: string;
  email: string;
  telefoon: string | null;
  bericht: string;
  status: 'nieuw' | 'in_behandeling' | 'beantwoord' | 'gesloten';
  privacy_akkoord: boolean;
  notities: string | null;
  beantwoord: boolean;
  antwoord_tekst: string | null;
  antwoord_datum: string | null;
  antwoord_door: string | null;
  behandeld_door: string | null;
  behandeld_op: string | null;
  created_at: string;
  updated_at: string;
  antwoorden?: ContactAntwoord[];
}

/**
 * Contact update parameters
 */
export interface ContactUpdateParams {
  status?: ContactMessage['status'];
  notities?: string;
}

export interface ContactStats {
  counts: {
    total: number;
    new: number;
    inProgress: number;
    handled: number;
  };
  avgResponseTime: number;
  messagesByPeriod: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

class ContactClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('jwtToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Haal lijst van contact formulieren op met paginering
   * GET /api/contact?limit=:limit&offset=:offset
   */
  async getMessages(limit: number = 10, offset: number = 0): Promise<ContactMessage[]> {
    const response = await fetch(`${API_BASE}/api/contact?limit=${limit}&offset=${offset}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch contact messages: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Haal specifiek contact formulier op inclusief antwoorden
   * GET /api/contact/:id
   */
  async getMessage(id: string): Promise<ContactMessage> {
    const response = await fetch(`${API_BASE}/api/contact/${id}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch contact message: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update contact formulier (status, notities, etc.)
   * PUT /api/contact/:id
   */
  async updateMessage(id: string, updates: ContactUpdateParams): Promise<ContactMessage> {
    const response = await fetch(`${API_BASE}/api/contact/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Failed to update message: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Voeg antwoord toe aan contact formulier
   * POST /api/contact/:id/antwoord
   * Dit stuurt automatisch een email naar de gebruiker
   */
  async addAnswer(contactId: string, tekst: string): Promise<ContactAntwoord> {
    const response = await fetch(`${API_BASE}/api/contact/${contactId}/antwoord`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ tekst })
    });

    if (!response.ok) {
      throw new Error(`Failed to add answer: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Filter contact formulieren op status
   * GET /api/contact/status/:status
   */
  async getMessagesByStatus(status: ContactMessage['status']): Promise<ContactMessage[]> {
    const response = await fetch(`${API_BASE}/api/contact/status/${status}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages by status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Verwijder contact formulier
   * DELETE /api/contact/:id
   */
  async deleteMessage(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/contact/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete contact message: ${response.status}`);
    }
  }

  /**
   * Haal statistieken op (custom endpoint, niet in PART 2 docs)
   * GET /api/contact/stats
   */
  async getStats(): Promise<ContactStats> {
    const response = await fetch(`${API_BASE}/api/contact/stats`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch contact stats: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Legacy method voor backwards compatibility
   * @deprecated Gebruik updateMessage() in plaats daarvan
   */
  async updateMessageStatus(id: string, status: ContactMessage['status']): Promise<ContactMessage> {
    return this.updateMessage(id, { status });
  }
}

export const contactClient = new ContactClient();