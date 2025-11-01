const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com';

class AuthManager {
  private token: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.token = localStorage.getItem('jwtToken');
    if (this.token) {
      this.scheduleRefresh();
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          wachtwoord: password
        }),
        credentials: 'include' // Include cookies for session management
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      // Backend sets cookie automatically, but also returns token
      if (data.token) {
        this.setToken(data.token);
      }
      return { success: true, token: data.token };
    } catch {
      return { success: false, error: 'Login failed' };
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('jwtToken', token);
    this.scheduleRefresh();
  }

  private scheduleRefresh() {
    // Refresh token 5 minutes before it expires (assuming 20 minute expiry)
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => this.refreshToken(), 15 * 60 * 1000); // 15 minutes
  }

  private async refreshToken() {
    try {
      // For now, we'll logout if token needs refresh
      // In a full implementation, you'd have a refresh endpoint
      this.logout();
    } catch {
      this.logout();
    }
  }

  async logout() {
    try {
      // Call backend logout endpoint if token exists
      if (this.token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
          credentials: 'include',
        }).catch(() => {
          // Ignore logout endpoint errors - we still want to clear local state
        });
      }
    } finally {
      this.token = null;
      localStorage.removeItem('jwtToken');
      if (this.refreshTimer) clearTimeout(this.refreshTimer);
      window.location.href = '/login';
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/api/users/password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          throw new Error('Huidig wachtwoord is onjuist');
        }
        throw new Error(error.error || 'Wachtwoord wijzigen mislukt');
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Wachtwoord wijzigen mislukt'
      };
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session management
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error('Authentication expired');
      }
      const error = await response.json();
      throw new Error(error.error || 'API Error');
    }

    return response.json();
  }
}

export const authManager = new AuthManager();