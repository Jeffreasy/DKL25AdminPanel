/**
 * TokenManager - Unified token management for DKL Admin Panel
 * Handles JWT tokens, refresh tokens, and automatic expiry management
 */

interface TokenStorage {
  // Access token (short-lived, 20 minutes)
  token: string | null;

  // Refresh token (long-lived, 7 days)
  refresh_token: string | null;

  // Token expiry timestamp
  token_expires_at: number | null;
}

interface TokenClaims {
  exp: number;
  email?: string;
  role?: string; // Legacy field
  roles?: Array<{ id: string; name: string; description?: string }>;
  rbac_active?: boolean;
  isExpired: boolean;
}

class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly EXPIRY_KEY = 'token_expires_at';
  private static readonly LEGACY_TOKEN_KEY = 'jwtToken';

  /**
   * Get all stored tokens
   */
  static getTokens(): TokenStorage {
    // Migrate legacy token if exists
    const legacyToken = localStorage.getItem(this.LEGACY_TOKEN_KEY);
    if (legacyToken && !localStorage.getItem(this.TOKEN_KEY)) {
      console.log('🔄 Migrating legacy token from jwtToken to auth_token');
      localStorage.setItem(this.TOKEN_KEY, legacyToken);
      localStorage.removeItem(this.LEGACY_TOKEN_KEY);
    }

    return {
      token: localStorage.getItem(this.TOKEN_KEY),
      refresh_token: localStorage.getItem(this.REFRESH_TOKEN_KEY),
      token_expires_at: parseInt(localStorage.getItem(this.EXPIRY_KEY) || '0'),
    };
  }

  /**
   * Store tokens with automatic expiry calculation
   */
  static setTokens(token: string, refreshToken?: string): void {
    const expiresAt = Date.now() + (20 * 60 * 1000); // 20 minutes from now

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.EXPIRY_KEY, expiresAt.toString());

    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Clear all stored tokens
   */
  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
    localStorage.removeItem(this.LEGACY_TOKEN_KEY); // Clean up legacy
  }

  /**
   * Check if current token is expired
   */
  static isTokenExpired(): boolean {
    const expiresAt = parseInt(localStorage.getItem(this.EXPIRY_KEY) || '0');
    return Date.now() > expiresAt;
  }

  /**
   * Check if token should be refreshed (within 5 minutes of expiry)
   */
  static shouldRefreshToken(): boolean {
    const expiresAt = parseInt(localStorage.getItem(this.EXPIRY_KEY) || '0');
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return expiresAt < fiveMinutesFromNow;
  }

  /**
   * Parse JWT token claims
   */
  static parseTokenClaims(token: string): TokenClaims {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        exp: payload.exp,
        email: payload.email,
        role: payload.role, // Legacy field
        roles: payload.roles || [], // RBAC roles array
        rbac_active: payload.rbac_active || false,
        isExpired: payload.exp * 1000 < Date.now()
      };
    } catch {
      return { exp: 0, roles: [], rbac_active: false, isExpired: true };
    }
  }

  /**
   * Get current token if valid
   */
  static getValidToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token || this.isTokenExpired()) {
      return null;
    }
    return token;
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
}

export { TokenManager };
export type { TokenStorage, TokenClaims };