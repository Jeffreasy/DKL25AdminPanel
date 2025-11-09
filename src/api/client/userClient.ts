import { apiClient } from '@/services/api.client'

export interface User {
  id: string;
  email: string;
  naam: string;
  role?: string;  // English field (legacy)
  rol?: string;   // Dutch field (actual backend field)
  avatar_url?: string;
  is_active: boolean;
  is_actief?: boolean; // Dutch field (actual backend field)
  created_at: string;
  updated_at: string;
}

export interface UserSearchResult {
  users: User[];
  total: number;
}

class UserClient {
  async searchUsers(query: string, limit = 10): Promise<User[]> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });

    const response = await apiClient.get(`/users?${params}`);
    return response.data.users || response.data;
  }

  async getUsers(limit = 50): Promise<User[]> {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    const response = await apiClient.get(`/users?${params}`);
    // Handle both array response and object with users property
    return Array.isArray(response.data) ? response.data : (response.data.users || []);
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  }

  /**
   * Change user password
   *
   * @param currentPassword - Current password for verification
   * @param newPassword - New password
   * @returns Success status and optional error message
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiClient.post('/users/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return { success: true };
    } catch (error: unknown) {
      const err = error as any;
      if (err.response?.status === 401) {
        return { success: false, error: 'Huidig wachtwoord is onjuist' };
      }
      return {
        success: false,
        error: err.response?.data?.error || 'Wachtwoord wijzigen mislukt'
      };
    }
  }
}

export const userClient = new UserClient();
