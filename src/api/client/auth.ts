const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com';

interface ApiError extends Error {
  status?: number;
  code?: string;
}

class AuthManager {
  private token: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Migration: Check for old jwtToken key and migrate to auth_token
    const oldToken = localStorage.getItem('jwtToken');
    if (oldToken && !localStorage.getItem('auth_token')) {
      localStorage.setItem('auth_token', oldToken);
      localStorage.removeItem('jwtToken');
      console.log('✅ Migrated token from jwtToken to auth_token');
    }
    
    this.token = localStorage.getItem('auth_token');
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
    localStorage.setItem('auth_token', token);
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
        await fetch(`${API_BASE}/api/auth/logout`, {
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
      localStorage.removeItem('auth_token');
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

    // Merge headers properly to avoid overwriting Authorization header
    const mergedHeaders = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const mergedOptions: RequestInit = {
      ...options,
      headers: mergedHeaders,
      credentials: 'include', // Include cookies for session management
    };

    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'API Error' }));
      
      // 401 UNAUTHORIZED - Token invalid/expired, force logout
      if (response.status === 401) {
        this.logout();
        throw new Error(error.error || 'Authentication expired');
      }
      
      // 403 FORBIDDEN - No permission, but token is valid, DON'T logout
      if (response.status === 403) {
        const forbiddenError: ApiError = new Error(error.error || 'Geen toegang tot deze resource');
        forbiddenError.status = 403;
        forbiddenError.code = error.code || 'FORBIDDEN';
        throw forbiddenError;
      }
      
      // Other errors
      const apiError: ApiError = new Error(error.error || 'API Error');
      apiError.status = response.status;
      apiError.code = error.code;
      throw apiError;
    }

    return response.json();
  }
}

export const authManager = new AuthManager();