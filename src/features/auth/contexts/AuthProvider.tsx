import { useState, useEffect } from 'react'
import { AuthContext, User } from './AuthContext'
import { TokenManager } from './TokenManager'
import { tokenRefreshScheduler } from './TokenRefreshScheduler'

// ✅ CORRECT: Haal base URL op zonder '/api' - die wordt in fetch toegevoegd
const getBaseURL = (): string => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  console.log('🔍 DEBUG: VITE_API_BASE_URL =', baseURL);
  console.log('🔍 DEBUG: All env vars =', import.meta.env);

  if (!baseURL) {
    console.warn('⚠️ VITE_API_BASE_URL not set, using fallback');
    return 'https://dklemailservice.onrender.com';
  }

  console.log('✅ Using API Base URL:', baseURL);
  return baseURL;
};

const API_BASE_URL = getBaseURL();
console.log('🎯 Final API_BASE_URL =', API_BASE_URL);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Use TokenManager for token operations

  // Automatische token refresh
  const refreshToken = async (): Promise<string | null> => {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        TokenManager.setTokens(data.token, data.refresh_token);
        return data.token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    // Redirect naar login als refresh faalt
    logout();
    throw new Error('Token refresh failed');
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, wachtwoord: password })
      });

      const data = await response.json();

      if (response.ok) {
        // Sla tokens op via TokenManager
        TokenManager.setTokens(data.token, data.refresh_token);

        // Sla user ID op voor API requests
        if (data.user?.id) {
          localStorage.setItem('userId', data.user.id);
        } else if (data.id) {
          // Fallback: user ID might be directly in response
          localStorage.setItem('userId', data.id);
        }

        // Parse token claims voor RBAC info
        const claims = TokenManager.parseTokenClaims(data.token);
        console.log('🔐 Login - Token claims:', {
          hasLegacyRole: !!claims.role,
          rbacRoles: claims.roles,
          rbacActive: claims.rbac_active
        });

        // Haal gebruikersinfo op inclusief permissies
        await loadUserProfile();

        // Start automatic token refresh scheduler
        tokenRefreshScheduler.start();

        return { success: true };
      } else {
        // Login failed - clear any existing tokens to prevent confusion
        TokenManager.clearTokens();
        setUser(null);
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('Login error:', err);
      // Network error - also clear tokens
      TokenManager.clearTokens();
      setUser(null);
      return { success: false, error: 'Netwerk fout' };
    }
  };

  const loadUserProfile = async () => {
    const token = TokenManager.getValidToken();
    if (!token) {
      throw new Error('No valid token available');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();

        // Backend returns: { id, email, naam, permissions: [{resource, action}], roles: [{id, name, description}] }
        const permissions = userData.permissions || [];
        const roles = userData.roles || []; // RBAC roles array - PRIMARY source

        console.log('🔐 Profile loaded:', {
          permissionsCount: permissions.length,
          rolesCount: roles.length,
          hasPermissions: permissions.length > 0,
          hasRoles: roles.length > 0
        });

        // Validate permissions structure
        if (!Array.isArray(permissions)) {
          console.warn('⚠️ Backend returned invalid permissions format, using empty array');
        }

        // Ensure permissions have correct structure
        const validPermissions = permissions.filter((perm: unknown) => {
          if (!perm || typeof perm !== 'object') return false;
          const p = perm as Record<string, unknown>;
          return typeof p.resource === 'string' && typeof p.action === 'string';
        });

        if (validPermissions.length !== permissions.length) {
          console.warn(`⚠️ Filtered out ${permissions.length - validPermissions.length} invalid permissions`);
        }

        // Legacy role field: use first role name for backward compatibility (DEPRECATED)
        const legacyRole = roles.length > 0 ? roles[0].name : undefined;

        localStorage.setItem('userId', userData.id);
        setUser({
          id: userData.id,
          email: userData.email,
          role: legacyRole, // DEPRECATED - only for backward compatibility
          roles, // RBAC roles - PRIMARY source
          permissions: validPermissions,
          user_metadata: { full_name: userData.naam || userData.name }
        });
        setLoading(false);
        return userData;
      } else if (response.status === 401) {
        // Token expired, try refresh
        try {
          const newToken = await refreshToken();
          if (newToken) {
            // TokenManager already updated in refreshToken
          }
          return await loadUserProfile();
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          logout();
          throw new Error('Authentication failed');
        }
      } else {
        // Profile endpoint failed
        throw new Error(`Profile fetch failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Profile loading failed:', error);
      logout();
      throw error;
    }
  };

  const logout = async () => {
    // Stop token refresh scheduler
    tokenRefreshScheduler.stop();

    // Clear all tokens via TokenManager
    TokenManager.clearTokens();
    localStorage.removeItem('userId');
    setUser(null);
    setLoading(false);
    window.location.href = '/login';
  };

  const signOut = async () => {
    await logout();
  };

  const signIn = async (email: string, password: string) => {
    const result = await login(email, password);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  // Controleer bij app start of gebruiker ingelogd is
  useEffect(() => {
    const checkAuth = async () => {
      const token = TokenManager.getValidToken();
      if (token) {
        // loadUserProfile now handles failures gracefully
        await loadUserProfile();
        // Start token refresh scheduler after successful auth check
        tokenRefreshScheduler.start();
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for token refresh events
  useEffect(() => {
    const handleTokensRefreshed = () => {
      console.log('🔄 Tokens refreshed, updating user context if needed');
      // Optionally update user data if needed
    };

    const handleLogout = () => {
      logout();
    };

    window.addEventListener('tokens-refreshed', handleTokensRefreshed as EventListener);
    window.addEventListener('auth-logout', handleLogout);

    return () => {
      window.removeEventListener('tokens-refreshed', handleTokensRefreshed as EventListener);
      window.removeEventListener('auth-logout', handleLogout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      signIn,
      signOut,
      logout,
      isAuthenticated: !!user,
      isLoading: loading,
      login,
      loadUserProfile,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}
