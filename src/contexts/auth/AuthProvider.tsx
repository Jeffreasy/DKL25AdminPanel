import { useState, useEffect } from 'react'
import { authManager } from '../../lib/auth'
import { AuthContext, User } from './AuthContext'
import type { User as BackendUser, Permission } from '../../features/users/types'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Controleer token expiratie
  const isTokenExpired = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Automatische token refresh
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/auth/refresh`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/auth/login`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Backend MUST return permissions array: { id, email, naam, rol, permissions: [{resource, action}], roles: [{id, name, description}] }
        const permissions = userData.permissions || [];
        
        if (!permissions || permissions.length === 0) {
          console.error('❌ Backend returned no permissions! User will have no access.');
          console.error('Please ensure the backend /api/auth/profile endpoint returns a permissions array.');
        } else {
          console.log('✅ Backend permissions loaded:', permissions.length, 'permissions');
        }
        
        localStorage.setItem('userId', userData.id);
        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.rol || userData.role,
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
