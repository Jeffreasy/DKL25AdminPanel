import { TokenManager } from '../../features/auth/contexts/TokenManager';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com';

interface ApiError extends Error {
  status?: number;
  code?: string;
}

/**
 * @deprecated FULLY DEPRECATED - DO NOT USE
 *
 * This class is deprecated and will be removed in v3.0.0
 *
 * **Migration Path:**
 * - Replace with `TokenManager` for token operations
 * - Use `AuthProvider` context via `useAuth()` hook for auth state
 * - Use modern API clients from `/src/api/client/` for API calls
 *
 * **Example Migration:**
 * ```typescript
 * // OLD (❌ Don't use)
 * import { authManager } from '@/api/client/auth';
 * authManager.login(email, password);
 *
 * // NEW (✅ Use this)
 * import { useAuth } from '@/features/auth/hooks/useAuth';
 * const { login } = useAuth();
 * await login(email, password);
 * ```
 *
 * @see TokenManager - For token storage/validation
 * @see AuthProvider - For authentication context
 * @see useAuth - For React hook usage
 */
class AuthManager {
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    console.warn(
      '⚠️ DEPRECATION WARNING: authManager is deprecated and will be removed in v3.0.0\n' +
      'Please migrate to TokenManager + AuthProvider.\n' +
      'See docs/TOKEN_MANAGEMENT.md for migration guide.'
    );
    
    // Migration is now handled by TokenManager
    if (TokenManager.getTokens().token) {
      this.scheduleRefresh();
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password  // Correct field name according to backend docs
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      // Backend response format: { success: true, data: { access_token, refresh_token, user, expires_in } }
      if (data.success && data.data) {
        TokenManager.setTokens(data.data.access_token, data.data.refresh_token);
        this.scheduleRefresh();
        return { success: true, token: data.data.access_token };
      }
      throw new Error('Invalid response format');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  setToken(token: string) {
    // For backward compatibility, delegate to TokenManager
    TokenManager.setTokens(token);
    this.scheduleRefresh();
  }

  private scheduleRefresh() {
    // Refresh token 5 minutes before it expires (assuming 20 minute expiry)
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => this.refreshToken(), 15 * 60 * 1000); // 15 minutes
  }

  private async refreshToken() {
    try {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      if (data.success && data.data) {
        TokenManager.setTokens(data.data.access_token, data.data.refresh_token);
        this.scheduleRefresh();
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
    }
  }

  async logout() {
    try {
      const token = TokenManager.getValidToken();
      const refreshToken = TokenManager.getRefreshToken();
      
      if (token && refreshToken) {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken
          }),
          credentials: 'include',
        }).catch(() => {
          // Ignore logout endpoint errors - we still want to clear local state
        });
      }
    } finally {
      TokenManager.clearTokens();
      if (this.refreshTimer) clearTimeout(this.refreshTimer);
      window.location.href = '/login';
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = TokenManager.getValidToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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

      const data = await response.json();
      return { success: data.success || true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Wachtwoord wijzigen mislukt'
      };
    }
  }

  getToken(): string | null {
    return TokenManager.getValidToken();
  }

  isAuthenticated(): boolean {
    return !!TokenManager.getValidToken();
  }

  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    const token = TokenManager.getValidToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    // Merge headers properly to avoid overwriting Authorization header
    const mergedHeaders = {
      'Authorization': `Bearer ${token}`,
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