import { authManager } from './auth';

/**
 * Registration/Participant data structure
 */
export interface Registration {
  id: string;
  naam: string;
  email: string;
  telefoon?: string;
  rol: 'deelnemer' | 'vrijwilliger' | 'sponsor' | 'partner';
  afstand?: string;
  privacy_akkoord: boolean;
  nieuwsbrief_akkoord?: boolean;
  status?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create registration request
 */
export interface RegistrationCreateData {
  naam: string;
  email: string;
  telefoon?: string;
  rol: 'deelnemer' | 'vrijwilliger' | 'sponsor' | 'partner';
  afstand?: string;
  privacy_akkoord: boolean;
  nieuwsbrief_akkoord?: boolean;
}

/**
 * Update registration request
 */
export interface RegistrationUpdateData {
  naam?: string;
  email?: string;
  telefoon?: string;
  status?: string;
}

/**
 * Registration Client - Manage event registrations (aanmeldingen)
 * 
 * Replaces legacy `api.registrations.*` methods with modern, typed implementation.
 * 
 * @example
 * ```typescript
 * import { registrationClient } from '@/api/client';
 * 
 * // Get all registrations
 * const registrations = await registrationClient.getAll();
 * 
 * // Filter by role
 * const participants = await registrationClient.getByRole('deelnemer');
 * 
 * // Create new registration
 * const registration = await registrationClient.create({
 *   naam: 'John Doe',
 *   email: 'john@example.com',
 *   rol: 'deelnemer',
 *   afstand: '10km',
 *   privacy_akkoord: true
 * });
 * ```
 */
export const registrationClient = {
  /**
   * Get all registrations with optional pagination
   * 
   * Requires permission: `participant:read` or `registration:read`
   * 
   * @param limit - Number of items per page (default: 50)
   * @param offset - Number of items to skip (default: 0)
   * @returns Array of registrations
   */
  async getAll(limit = 50, offset = 0): Promise<Registration[]> {
    const response = await authManager.makeAuthenticatedRequest(
      `/api/aanmelding?limit=${limit}&offset=${offset}`,
      { method: 'GET' }
    );
    return response as Registration[];
  },

  /**
   * Get specific registration by ID
   * 
   * Requires permission: `participant:read` or `registration:read`
   * 
   * @param id - Registration ID
   * @returns Registration data
   */
  async getById(id: string): Promise<Registration> {
    const response = await authManager.makeAuthenticatedRequest(
      `/api/aanmelding/${id}`,
      { method: 'GET' }
    );
    return response as Registration;
  },

  /**
   * Get registrations by role
   * 
   * Requires permission: `participant:read` or `registration:read`
   * 
   * @param role - Role to filter by
   * @returns Array of registrations
   */
  async getByRole(role: string): Promise<Registration[]> {
    const response = await authManager.makeAuthenticatedRequest(
      `/api/aanmelding/rol/${role}`,
      { method: 'GET' }
    );
    return response as Registration[];
  },

  /**
   * Update existing registration
   * 
   * Requires permission: `participant:write` or `registration:write`
   * 
   * @param id - Registration ID
   * @param data - Registration update data
   * @returns Updated registration
   */
  async update(id: string, data: RegistrationUpdateData): Promise<Registration> {
    const response = await authManager.makeAuthenticatedRequest(
      `/api/aanmelding/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
    return response as Registration;
  },

  /**
   * Delete registration
   * 
   * Requires permission: `participant:delete` or `registration:delete`
   * 
   * @param id - Registration ID
   */
  async delete(id: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(
      `/api/aanmelding/${id}`,
      { method: 'DELETE' }
    );
  },

  /**
   * Add reply/note to registration
   * 
   * Requires permission: `participant:write` or `registration:write`
   * 
   * @param id - Registration ID
   * @param message - Reply message
   * @returns Updated registration
   */
  async addReply(id: string, message: string): Promise<Registration> {
    const response = await authManager.makeAuthenticatedRequest(
      `/api/aanmelding/${id}/antwoord`,
      {
        method: 'POST',
        body: JSON.stringify({ bericht: message })
      }
    );
    return response as Registration;
  },

  /**
   * Get participants (deelnemers) only
   * 
   * @returns Array of participant registrations
   */
  async getParticipants(): Promise<Registration[]> {
    return this.getByRole('deelnemer');
  },

  /**
   * Get volunteers (vrijwilligers) only
   * 
   * @returns Array of volunteer registrations
   */
  async getVolunteers(): Promise<Registration[]> {
    return this.getByRole('vrijwilliger');
  },

  /**
   * Get sponsors only
   * 
   * @returns Array of sponsor registrations
   */
  async getSponsors(): Promise<Registration[]> {
    return this.getByRole('sponsor');
  },

  /**
   * Get partners only
   * 
   * @returns Array of partner registrations
   */
  async getPartners(): Promise<Registration[]> {
    return this.getByRole('partner');
  }
};