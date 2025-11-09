import { authManager } from './auth';
import type { Newsletter, CreateNewsletterData, UpdateNewsletterData, NewsletterSendResponse } from '../../features/newsletter/types';

// Re-export types for convenience
export type { Newsletter, CreateNewsletterData, UpdateNewsletterData };

/**
 * Newsletter Client - Manage newsletter resources
 * 
 * Replaces legacy `api.newsletter.*` methods with modern, typed implementation.
 * 
 * @example
 * ```typescript
 * import { newsletterClient } from '@/api/client';
 * 
 * // Get all newsletters
 * const newsletters = await newsletterClient.getAll();
 * 
 * // Create new newsletter
 * const newsletter = await newsletterClient.create({
 *   onderwerp: 'Monthly Update',
 *   inhoud: '<p>Newsletter content</p>'
 * });
 * 
 * // Send newsletter
 * await newsletterClient.send(newsletter.id);
 * ```
 */
export const newsletterClient = {
  /**
   * Get all newsletters with optional pagination
   * 
   * @param limit - Number of items per page (default: 50)
   * @param offset - Number of items to skip (default: 0)
   * @returns Array of newsletters
   */
  async getAll(limit = 50, offset = 0): Promise<Newsletter[]> {
    const response = await authManager.makeAuthenticatedRequest(
      `/api/newsletter?limit=${limit}&offset=${offset}`,
      { method: 'GET' }
    );
    return response as Newsletter[];
  },

  /**
   * Get specific newsletter by ID
   * 
   * @param id - Newsletter ID
   * @returns Newsletter data
   */
  async getById(id: string): Promise<Newsletter> {
    const response = await authManager.makeAuthenticatedRequest(
      `/api/newsletter/${id}`,
      { method: 'GET' }
    );
    return response as Newsletter;
  },

  /**
   * Create new newsletter
   * 
   * Requires permission: `newsletter:write`
   * 
   * @param data - Newsletter data
   * @returns Created newsletter
   */
  async create(data: CreateNewsletterData): Promise<Newsletter> {
    const response = await authManager.makeAuthenticatedRequest(
      '/api/newsletter',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    return response as Newsletter;
  },

  /**
   * Update existing newsletter
   * 
   * Requires permission: `newsletter:write`
   * 
   * @param id - Newsletter ID
   * @param data - Newsletter update data
   * @returns Updated newsletter
   */
  async update(id: string, data: UpdateNewsletterData): Promise<Newsletter> {
    const response = await authManager.makeAuthenticatedRequest(
      `/api/newsletter/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
    return response as Newsletter;
  },

  /**
   * Delete newsletter
   * 
   * Requires permission: `newsletter:delete`
   * 
   * @param id - Newsletter ID
   */
  async delete(id: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(
      `/api/newsletter/${id}`,
      { method: 'DELETE' }
    );
  },

  /**
   * Send newsletter to all subscribers
   * 
   * Requires permission: `newsletter:send`
   * 
   * @param id - Newsletter ID
   * @returns Send confirmation
   */
  async send(id: string): Promise<NewsletterSendResponse> {
    const response = await authManager.makeAuthenticatedRequest(
      `/api/newsletter/${id}/send`,
      { method: 'POST' }
    );
    return response as NewsletterSendResponse;
  },

  /**
   * Get sent newsletters only
   * 
   * @returns Array of sent newsletters
   */
  async getSent(): Promise<Newsletter[]> {
    const all = await this.getAll();
    return all.filter(n => n.sent_at);
  },

  /**
   * Get draft newsletters only
   *
   * @returns Array of draft newsletters
   */
  async getDrafts(): Promise<Newsletter[]> {
    const all = await this.getAll();
    return all.filter(n => !n.sent_at);
  }
};