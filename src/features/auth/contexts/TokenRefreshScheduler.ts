/**
 * TokenRefreshScheduler - Automatic token refresh management
 * Handles background token refresh to maintain user sessions
 */

class TokenRefreshScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60000; // Check every minute
  private readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh 5 minutes before expiry

  start(): void {
    this.stop(); // Clear any existing interval

    this.intervalId = setInterval(() => {
      this.checkAndRefreshToken();
    }, this.CHECK_INTERVAL);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkAndRefreshToken(): Promise<void> {
    try {
      // Import TokenManager here to avoid circular dependencies
      const { TokenManager } = await import('./TokenManager');

      if (TokenManager.shouldRefreshToken()) {
        await this.refreshToken();
      }
    } catch (error) {
      console.error('Token refresh check failed:', error);
    }
  }

  private async refreshToken(): Promise<void> {
    try {
      console.log('🔄 Attempting automatic token refresh...');

      // Get API base URL
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com';

      // Import TokenManager here to avoid circular dependencies
      const { TokenManager } = await import('./TokenManager');

      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        TokenManager.setTokens(data.token, data.refresh_token);
        console.log('✅ Token refreshed automatically');

        // Notify AuthProvider of token update
        window.dispatchEvent(new CustomEvent('tokens-refreshed', {
          detail: { token: data.token, refreshToken: data.refresh_token }
        }));
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Automatic token refresh failed:', error);
      // Trigger logout on refresh failure
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
  }
}

// Export singleton instance
export const tokenRefreshScheduler = new TokenRefreshScheduler();