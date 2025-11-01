import { useState, useEffect } from 'react'
import { authManager } from '../../../api/client/auth'
import { AuthContext, User } from './AuthContext'

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

  // Controleer token expiratie en parse JWT claims
  const parseTokenClaims = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        exp: payload.exp,
        email: payload.email,
        role: payload.role, // Legacy field
        roles: payload.roles || [], // RBAC roles array
        rbac_active: payload.rbac_active || false, // RBAC indicator
        isExpired: payload.exp * 1000 < Date.now()
      };
    } catch {
      return { isExpired: true, roles: [], rbac_active: false };
    }
  };

  const isTokenExpired = (token: string) => {
    return parseTokenClaims(token).isExpired;
  };

  // Automatische token refresh
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
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
        localStorage.setItem('jwtToken', data.token);
        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
        }
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
        // Sla token op in localStorage
        localStorage.setItem('jwtToken', data.token);
        // CRITICAL: Update authManager with the new token
        authManager.setToken(data.token);

        // Sla refresh token op indien beschikbaar
        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
        }
        // Sla user ID op voor API requests
        if (data.user?.id) {
          localStorage.setItem('userId', data.user.id);
        } else if (data.id) {
          // Fallback: user ID might be directly in response
          localStorage.setItem('userId', data.id);
        }

        // Parse token claims voor RBAC info
        const claims = parseTokenClaims(data.token);
        console.log('🔐 Login - Token claims:', {
          hasLegacyRole: !!claims.role,
          rbacRoles: claims.roles,
          rbacActive: claims.rbac_active
        });

        // Haal gebruikersinfo op inclusief permissies
        await loadUserProfile();
        return { success: true };
      } else {
        // Login failed - clear any existing tokens to prevent confusion
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('Login error:', err);
      // Network error - also clear tokens
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      return { success: false, error: 'Netwerk fout' };
    }
  };

  const loadUserProfile = async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      throw new Error('No token available');
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      try {
        const newToken = await refreshToken();
        if (!newToken) {
          throw new Error('Failed to refresh token');
        }
        // Update authManager with refreshed token
        authManager.setToken(newToken);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        logout();
        throw refreshError;
      }
    } else {
      // Ensure authManager has the current token
      authManager.setToken(token);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Backend MUST return permissions array: { id, email, naam, rol, permissions: [{resource, action}], roles: [{id, name, description}] }
        const permissions = userData.permissions || [];
        const roles = userData.roles || []; // RBAC roles array

        // Parse token claims voor backward compatibility
        const token = localStorage.getItem('jwtToken');
        const claims = token ? parseTokenClaims(token) : { roles: [], rbac_active: false };

        console.log('🔐 Profile loaded:', {
          permissionsCount: permissions.length,
          rolesCount: roles.length,
          tokenRoles: claims.roles,
          rbacActive: claims.rbac_active,
          legacyRole: userData.rol || userData.role
        });

        // Enhanced permission loading with RBAC support
        if (!permissions || permissions.length === 0) {
          console.warn('⚠️ Backend returned no permissions! User will have limited access.');
          console.warn('This is normal during RBAC migration. Permissions will be loaded from roles.');

          // Try to load permissions from RBAC roles if available
          if (roles && roles.length > 0) {
            try {
              console.log('🔄 Attempting to load permissions from RBAC roles...');
              // Note: In a full implementation, you might want to fetch permissions
              // from the RBAC API based on roles, but for now we rely on backend
              // to provide permissions array
            } catch (error) {
              console.error('Failed to load permissions from roles:', error);
            }
          }
        } else {
          console.log('✅ Backend permissions loaded:', permissions.length, 'permissions');
        }

        localStorage.setItem('userId', userData.id);
        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.rol || userData.role, // Legacy field
          roles, // RBAC roles
          permissions,
          user_metadata: { full_name: userData.naam || userData.name }
        });
        setLoading(false);
        return userData;
      } else if (response.status === 401) {
        // Token expired, try refresh
        try {
          const newToken = await refreshToken();
          if (newToken) {
            authManager.setToken(newToken);
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
    // Clear all tokens
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('refreshToken');
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
      const token = localStorage.getItem('jwtToken');
      if (token) {
        // loadUserProfile now handles failures gracefully
        await loadUserProfile();
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
