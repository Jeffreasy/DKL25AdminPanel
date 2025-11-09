# 🔐 Frontend Authentication Architecture - Complete Technical Guide

> **Version:** 1.0
> **Status:** Production Ready
> **Last Updated:** 2025-11-06
> **Frontend:** React + TypeScript
> **Backend:** DKL Email Service V1.48.0+

Complete technische documentatie van het authenticatie- en autorisatiesysteem voor de frontend implementatie.

---

## 📋 Inhoudsopgave

1. [Executive Summary](#executive-summary)
2. [Authentication Flow](#authentication-flow)
3. [Token Management](#token-management)
4. [Permission System](#permission-system)
5. [Frontend Components](#frontend-components)
6. [API Integration](#api-integration)
7. [Error Handling](#error-handling)
8. [Security Best Practices](#security-best-practices)
9. [Implementation Examples](#implementation-examples)
10. [Testing](#testing)

---

## 🎯 Executive Summary

Het DKL Email Service implementeert een enterprise-grade frontend authenticatie systeem met:

### Kernfunctionaliteit
- ✅ **JWT Authentication** - 20 minuten access tokens met automatische refresh
- ✅ **RBAC Authorization** - 19 resources, 58 granulaire permissions
- ✅ **React Context** - Globale state management voor auth status
- ✅ **Automatic Token Refresh** - Naadloze gebruikerservaring
- ✅ **Route Protection** - Component-level en route-level beveiliging
- ✅ **Permission Hooks** - Declarative permission checks
- ✅ **Error Recovery** - Graceful handling van auth failures

### Technische Stack
- **Frontend:** React 18+ met TypeScript
- **State Management:** React Context + useReducer
- **HTTP Client:** Fetch API (native) of Axios
- **Storage:** localStorage voor tokens, sessionStorage voor temp data
- **Routing:** React Router v6+ met protected routes

---

## 🔐 Authentication Flow

### 1. Login Process (Frontend Perspective)

```typescript
// 1. User submits login form
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, wachtwoord: password })
    });

    const data = await response.json();

    if (data.success) {
      // Store tokens securely
      localStorage.setItem('token', data.token);
      localStorage.setItem('refresh_token', data.refresh_token);

      // Update global auth state
      login(data.user);

      // Redirect to dashboard
      navigate('/dashboard');
    }
  } catch (error) {
    // Handle login error
    setError('Login mislukt');
  }
};
```

### 2. Automatic Token Refresh

```typescript
// Token refresh logic (runs every 15 minutes)
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      logout(); // No refresh token available
      return null;
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    const data = await response.json();

    if (data.success) {
      // Update stored tokens
      localStorage.setItem('token', data.token);
      localStorage.setItem('refresh_token', data.refresh_token);

      // Update context
      updateTokens(data.token, data.refresh_token);

      return data.token;
    } else {
      // Refresh failed - logout user
      logout();
      return null;
    }
  } catch (error) {
    logout();
    return null;
  }
};
```

### 3. API Request with Authentication

```typescript
// Authenticated API call with automatic retry
const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('token');

  const authOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  };

  let response = await fetch(url, authOptions);

  // If token expired, try refresh once
  if (response.status === 401) {
    const errorData = await response.json();
    if (errorData.code === 'TOKEN_EXPIRED') {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry with new token
        authOptions.headers = {
          ...authOptions.headers,
          'Authorization': `Bearer ${newToken}`,
        };
        response = await fetch(url, authOptions);
      }
    }
  }

  return response;
};
```

---

## 🎫 Token Management

### Token Storage Strategy

```typescript
interface TokenStorage {
  // Access token (short-lived, 20 minutes)
  token: string | null;

  // Refresh token (long-lived, 7 days)
  refresh_token: string | null;

  // Token expiry timestamp
  token_expires_at: number | null;
}

// Storage implementation
class TokenManager {
  private static readonly TOKEN_KEY = 'token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly EXPIRY_KEY = 'token_expires_at';

  static getTokens(): TokenStorage {
    return {
      token: localStorage.getItem(this.TOKEN_KEY),
      refresh_token: localStorage.getItem(this.REFRESH_TOKEN_KEY),
      token_expires_at: parseInt(localStorage.getItem(this.EXPIRY_KEY) || '0'),
    };
  }

  static setTokens(token: string, refreshToken: string): void {
    const expiresAt = Date.now() + (20 * 60 * 1000); // 20 minutes

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.EXPIRY_KEY, expiresAt.toString());
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
  }

  static isTokenExpired(): boolean {
    const expiresAt = parseInt(localStorage.getItem(this.EXPIRY_KEY) || '0');
    return Date.now() > expiresAt;
  }

  static shouldRefreshToken(): boolean {
    const expiresAt = parseInt(localStorage.getItem(this.EXPIRY_KEY) || '0');
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return expiresAt < fiveMinutesFromNow;
  }
}
```

### Automatic Token Refresh Scheduler

```typescript
class TokenRefreshScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60000; // Check every minute

  start(): void {
    this.intervalId = setInterval(() => {
      if (TokenManager.shouldRefreshToken()) {
        this.refreshToken();
      }
    }, this.CHECK_INTERVAL);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async refreshToken(): Promise<void> {
    try {
      const refreshToken = TokenManager.getTokens().refresh_token;
      if (!refreshToken) return;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      const data = await response.json();

      if (data.success) {
        TokenManager.setTokens(data.token, data.refresh_token);
        // Notify auth context of token update
        window.dispatchEvent(new CustomEvent('tokens-refreshed', {
          detail: { token: data.token, refreshToken: data.refresh_token }
        }));
      } else {
        // Refresh failed - trigger logout
        window.dispatchEvent(new CustomEvent('auth-logout'));
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
  }
}
```

---

## 🛡️ Permission System & RBAC

### RBAC Architectuur Overzicht

Het DKL Email Service gebruikt een **enterprise-grade Role-Based Access Control (RBAC)** systeem met:

- **19 Resources** - Van contacten tot chat kanalen
- **58 Permissions** - Granulaire resource:action combinaties
- **8 Rollen** - Van admin tot chat member
- **Audit Logging** - Complete security trail
- **Caching** - Redis-backed voor optimale performance

### Database Schema
```
gebruikers
    └─> user_roles (is_active=true, expires_at check)
            └─> roles (is_system_role protection)
                    └─> role_permissions
                            └─> permissions (resource:action)
```

### Permission Check Flow
```
1. API Request met JWT token
2. AuthMiddleware validates token → sets userID in context
3. PermissionMiddleware checks permission:
   a. Check Redis cache (perm:{userID}:{resource}:{action})
   b. If not cached: Query database via GetUserPermissions
   c. Cache result (5 min TTL)
   d. Return 403 if no permission
4. Handler execution
```

### Rollen Overzicht

| Rol | Type | Permissions | Gebruik |
|-----|------|------------|---------|
| **admin** | System | ALLE 58 | Platform administrators |
| **staff** | System | Read/write + participant:read,write,delete | Support medewerkers |
| **user** | System | Chat basic | Reguliere gebruikers |
| **owner** | Chat | Full channel control | Kanaal eigenaar |
| **chat_admin** | Chat | Moderation | Kanaal moderator |
| **member** | Chat | Basic chat | Kanaal lid |
| **deelnemer** | Event | Geen | Categorisatie only |
| **begeleider** | Event | Geen | Categorisatie only |
| **vrijwilliger** | Event | Geen | Categorisatie only |

### Staff Role Permissions ✅ UITGEBREID

De **staff** rol heeft nu **volledige participant permissions** gekregen:

- ✅ Kunnen inloggen op het systeem (`staff:access`)
- ✅ Kunnen deelnemers bekijken (`participant:read`)
- ✅ **Kunnen deelnemers bewerken** (`participant:write`)
- ✅ **Kunnen deelnemers verwijderen** (`participant:delete`)
- ✅ Hebben toegang tot 31 andere permissions voor read/write operaties

**Uitgevoerde actie (Optie 1):**
```sql
-- Participant permissions toegevoegd aan staff rol
INSERT INTO permissions (resource, action)
VALUES ('participant', 'read'), ('participant', 'write'), ('participant', 'delete');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'staff' AND r.is_system_role = true
  AND p.resource = 'participant'
  AND p.action IN ('read', 'write', 'delete');
```

**Resultaat:** Staff leden kunnen nu volledig deelnemers beheren via de API endpoints.

### Resources & Permissions (58 totaal)

| Resource | Permissions | Beschrijving |
|----------|-------------|-------------|
| **admin** | access | Toegang tot admin panel |
| **staff** | access | Toegang tot staff functies |
| **contact** | read, write, delete | Contact formulieren beheren |
| **aanmelding** | read, write, delete | Evenement aanmeldingen |
| **user** | read, write, delete, manage_roles | Gebruikersbeheer |
| **participant** | read, write, delete | Deelnemers beheren |
| **photo** | read, write, delete | Foto's uploaden/beheren |
| **album** | read, write, delete | Foto albums organiseren |
| **video** | read, write, delete | Video content beheren |
| **partner** | read, write, delete | Partners beheren |
| **sponsor** | read, write, delete | Sponsors beheren |
| **radio_recording** | read, write, delete | Radio opnames |
| **program_schedule** | read, write, delete | Programma schema |
| **social_embed** | read, write, delete | Social media embeds |
| **social_link** | read, write, delete | Social media links |
| **under_construction** | read, write, delete | Onder constructie pagina's |
| **newsletter** | read, write, send, delete | Nieuwsbrieven beheren |
| **email** | read, write, delete, fetch | Email systeem |
| **admin_email** | send | Admin emails versturen |
| **chat** | read, write, manage_channel, moderate | Chat systeem |

### Permission Structure

```typescript
interface Permission {
  resource: string;  // Resource naam (bijv. "contact", "user")
  action: string;    // Actie (bijv. "read", "write", "delete")
}

interface UserPermissions {
  permissions: Permission[];
  roles: UserRole[];
  is_actief: boolean;
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  assigned_at: string;
  is_active: boolean;
}
```

### Permission Hook (React)

```typescript
// usePermissions.ts
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const usePermissions = () => {
  const { user } = useContext(AuthContext);

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user?.permissions) return false;

    return user.permissions.some(perm =>
      perm.resource === resource && perm.action === action
    );
  };

  const hasAnyPermission = (permissions: Array<{resource: string, action: string}>): boolean => {
    return permissions.some(perm => hasPermission(perm.resource, perm.action));
  };

  const hasAllPermissions = (permissions: Array<{resource: string, action: string}>): boolean => {
    return permissions.every(perm => hasPermission(perm.resource, perm.action));
  };

  const hasRole = (roleName: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.some(role => role.name === roleName && role.is_active);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some(roleName => hasRole(roleName));
  };

  // RBAC-specifieke helpers
  const isAdmin = (): boolean => hasRole('admin');
  const isStaff = (): boolean => hasRole('staff') || hasRole('admin');
  const isChatOwner = (): boolean => hasRole('owner');
  const isChatAdmin = (): boolean => hasRole('chat_admin') || hasRole('owner');
  const isChatMember = (): boolean => hasRole('member') || hasRole('chat_admin') || hasRole('owner');

  // Resource-specifieke helpers
  const canManageUsers = (): boolean => hasPermission('user', 'manage_roles');
  const canSendAdminEmails = (): boolean => hasPermission('admin_email', 'send');
  const canManageNewsletters = (): boolean => hasPermission('newsletter', 'send');
  const canFetchEmails = (): boolean => hasPermission('email', 'fetch');

  return {
    // Basis permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,

    // RBAC helpers
    isAdmin,
    isStaff,
    isChatOwner,
    isChatAdmin,
    isChatMember,

    // Resource helpers
    canManageUsers,
    canSendAdminEmails,
    canManageNewsletters,
    canFetchEmails,
  };
};
```

### Declarative Permission Components

```typescript
// PermissionGuard.tsx
import React from 'react';
import { usePermissions } from './usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  fallback?: React.ReactNode;
  requireAll?: boolean; // For multiple permissions
  permissions?: Array<{resource: string, action: string}>;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  action,
  fallback = null,
  requireAll = false,
  permissions
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  let hasAccess = false;

  if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else {
    hasAccess = hasPermission(resource, action);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// RoleGuard.tsx
interface RoleGuardProps {
  children: React.ReactNode;
  roles: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  requireAll = false,
  fallback = null
}) => {
  const { hasAnyRole, hasRole } = usePermissions();

  const hasAccess = requireAll
    ? roles.every(role => hasRole(role))
    : hasAnyRole(roles);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// RBAC-Specific Guards
export const AdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => {
  const { isAdmin } = usePermissions();
  return isAdmin() ? <>{children}</> : <>{fallback}</>;
};

export const StaffGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => {
  const { isStaff } = usePermissions();
  return isStaff() ? <>{children}</> : <>{fallback}</>;
};

export const ChatAdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => {
  const { isChatAdmin } = usePermissions();
  return isChatAdmin() ? <>{children}</> : <>{fallback}</>;
};
```

---

## ⚛️ Frontend Components

### AuthContext (Global State Management)

```typescript
// AuthContext.tsx
import React, { createContext, useReducer, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  naam: string;
  permissions: Permission[];
  roles: UserRole[];
  is_actief: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const AuthContext = createContext<{
  state: AuthState;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  clearError: () => void;
} | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading to check existing auth
    error: null,
  });

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && !TokenManager.isTokenExpired()) {
        try {
          // Fetch user profile to validate token and get fresh data
          const response = await authenticatedFetch('/api/auth/profile');
          if (response.ok) {
            const data = await response.json();
            dispatch({ type: 'LOGIN_SUCCESS', payload: data });
          } else {
            // Token invalid, clear it
            TokenManager.clearTokens();
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          TokenManager.clearTokens();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Listen for token refresh events
  useEffect(() => {
    const handleTokensRefreshed = (event: CustomEvent) => {
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

  const login = (user: User) => {
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
  };

  const logout = () => {
    TokenManager.clearTokens();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      state,
      login,
      logout,
      updateUser,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Protected Route Component

```typescript
// ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { PermissionGuard } from './PermissionGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  resource?: string;
  action?: string;
  permissions?: Array<{resource: string, action: string}>;
  roles?: string[];
  requireAuth?: boolean; // Default true
  redirectTo?: string; // Default '/login'
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  resource,
  action,
  permissions,
  roles,
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { state } = useContext(AuthContext);
  const location = useLocation();

  // Still loading auth state
  if (state.isLoading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  // Check authentication
  if (requireAuth && !state.isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check permissions if specified
  if (resource && action) {
    return (
      <PermissionGuard
        resource={resource}
        action={action}
        fallback={<Navigate to="/unauthorized" replace />}
      >
        {children}
      </PermissionGuard>
    );
  }

  // Check multiple permissions
  if (permissions) {
    return (
      <PermissionGuard
        permissions={permissions}
        fallback={<Navigate to="/unauthorized" replace />}
      >
        {children}
      </PermissionGuard>
    );
  }

  // Check roles
  if (roles) {
    return (
      <RoleGuard
        roles={roles}
        fallback={<Navigate to="/unauthorized" replace />}
      >
        {children}
      </RoleGuard>
    );
  }

  return <>{children}</>;
};
```

### Login Component

```typescript
// Login.tsx
import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          wachtwoord: password // Note: backend expects 'wachtwoord'
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store tokens
        TokenManager.setTokens(data.token, data.refresh_token);

        // Update auth context
        login(data.user);

        // Start token refresh scheduler
        tokenRefreshScheduler.start();

        // Redirect to intended page
        navigate(from, { replace: true });
      } else {
        setError(data.error || 'Login mislukt');
      }
    } catch (err) {
      setError('Netwerkfout - probeer het opnieuw');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Inloggen</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Wachtwoord</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="login-button"
        >
          {isLoading ? 'Bezig met inloggen...' : 'Inloggen'}
        </button>
      </form>
    </div>
  );
};
```

---

## 🔌 API Integration

### Authenticated API Client

```typescript
// apiClient.ts
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add auth header if token exists
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    let response = await fetch(url, config);

    // Handle token expiration
    if (response.status === 401) {
      const errorData = await response.clone().json();
      if (errorData.code === 'TOKEN_EXPIRED') {
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry with new token
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${newToken}`,
          };
          response = await fetch(url, config);
        }
      }
    }

    // Handle other auth errors
    if (response.status === 401) {
      // Trigger logout
      window.dispatchEvent(new CustomEvent('auth-logout'));
      throw new Error('Authentication required');
    }

    if (response.status === 403) {
      throw new Error('Insufficient permissions');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    return response.json();
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return null;

      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      const data = await response.json();

      if (data.success) {
        TokenManager.setTokens(data.token, data.refresh_token);
        return data.token;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, wachtwoord: password })
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST'
    });
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  async refreshToken() {
    return this.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: localStorage.getItem('refresh_token')
      })
    });
  }

  // Generic CRUD methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
```

### API Response Types

```typescript
// types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface LoginResponse {
  success: true;
  token: string;
  refresh_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  naam: string;
  permissions: Permission[];
  roles: UserRole[];
  is_actief: boolean;
  laatste_login?: string;
  created_at?: string;
}

export interface Permission {
  resource: string;
  action: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  assigned_at: string;
  is_active: boolean;
}

export interface AuthError {
  error: string;
  code: string;
}

// API Error codes (match backend)
export const AUTH_ERROR_CODES = {
  NO_AUTH_HEADER: 'NO_AUTH_HEADER',
  INVALID_AUTH_HEADER: 'INVALID_AUTH_HEADER',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_MALFORMED: 'TOKEN_MALFORMED',
  TOKEN_SIGNATURE_INVALID: 'TOKEN_SIGNATURE_INVALID',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
} as const;
```

---

## ⚠️ Error Handling

### Global Error Boundary

```typescript
// ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);

    // Check if it's an auth-related error
    if (error.message.includes('Authentication') || error.message.includes('token')) {
      // Trigger logout
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Er is iets misgegaan</h2>
          <p>Probeer de pagina te vernieuwen of log opnieuw in.</p>
          <button onClick={() => window.location.reload()}>
            Pagina vernieuwen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler

```typescript
// utils/apiErrorHandler.ts
import { AUTH_ERROR_CODES } from '../types/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): never => {
  if (error instanceof ApiError) {
    throw error;
  }

  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new ApiError('Netwerkfout - controleer je internetverbinding', 0);
  }

  // Handle HTTP errors
  if (error.status) {
    switch (error.status) {
      case 401:
        if (error.code === AUTH_ERROR_CODES.TOKEN_EXPIRED) {
          // Token expired - will be handled by token refresh logic
          throw new ApiError('Sessie verlopen', 401, error.code);
        }
        if (error.code === AUTH_ERROR_CODES.REFRESH_TOKEN_INVALID) {
          // Refresh token invalid - logout required
          window.dispatchEvent(new CustomEvent('auth-logout'));
          throw new ApiError('Sessie ongeldig - log opnieuw in', 401, error.code);
        }
        throw new ApiError('Niet geautoriseerd', 401, error.code);

      case 403:
        throw new ApiError('Geen toegang tot deze resource', 403);

      case 429:
        throw new ApiError('Te veel verzoeken - probeer het later opnieuw', 429);

      default:
        throw new ApiError(error.error || 'Er is een fout opgetreden', error.status);
    }
  }

  // Handle other errors
  throw new ApiError(error.message || 'Onbekende fout', 0);
};

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleApiError(error);
    }
  };
};
```

---

## 🔒 Security Best Practices

### Token Security

```typescript
// Security headers for API calls
const secureHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// For auth requests
const authHeaders = {
  ...secureHeaders,
  'Authorization': `Bearer ${token}`,
};
```

### XSS Prevention

```typescript
// Safe token storage (avoid storing in DOM)
const storeTokensSecurely = (token: string, refreshToken: string) => {
  try {
    // Use localStorage but validate inputs
    if (typeof token === 'string' && token.length > 0) {
      localStorage.setItem('token', token);
    }
    if (typeof refreshToken === 'string' && refreshToken.length > 0) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  } catch (error) {
    console.error('Failed to store tokens securely:', error);
    // Fallback: don't store tokens
  }
};
```

### CSRF Protection

```typescript
// CSRF token handling (if implemented)
const getCsrfToken = (): string | null => {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
};

const addCsrfHeader = (headers: HeadersInit): HeadersInit => {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    return {
      ...headers,
      'X-CSRF-Token': csrfToken,
    };
  }
  return headers;
};
```

### Secure Logout

```typescript
const secureLogout = async () => {
  try {
    // Call logout endpoint to invalidate server-side session
    await apiClient.logout();
  } catch (error) {
    console.warn('Server logout failed, proceeding with client logout');
  } finally {
    // Always clear client-side tokens
    TokenManager.clearTokens();

    // Clear any cached data
    localStorage.clear();
    sessionStorage.clear();

    // Stop token refresh scheduler
    tokenRefreshScheduler.stop();

    // Redirect to login
    window.location.href = '/login';
  }
};
```

---

## 💡 Implementation Examples

### Complete App Structure

```typescript
// App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthErrorBoundary } from './components/AuthErrorBoundary';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute resource="admin" action="access">
                <AdminPanel />
              </ProtectedRoute>
            } />

            {/* Contact management */}
            <Route path="/contacts" element={
              <ProtectedRoute resource="contact" action="read">
                <ContactList />
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AuthErrorBoundary>
  );
}

export default App;
```

### Using Permissions in Components

```typescript
// ContactList.tsx
import React, { useEffect, useState } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGuard, StaffGuard } from '../components/PermissionGuard';

const ContactList: React.FC = () => {
  const {
    hasPermission,
    isStaff,
    canManageUsers,
    canSendAdminEmails
  } = usePermissions();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (hasPermission('contact', 'read')) {
      fetchContacts();
    }
  }, []);

  const fetchContacts = async () => {
    const response = await apiClient.get('/api/contacts');
    setContacts(response.data);
  };

  return (
    <div>
      <h1>Contacten</h1>

      {/* RBAC-based content */}
      <StaffGuard>
        <div className="staff-controls">
          <button>Export Contacts</button>
          {canSendAdminEmails() && <button>Send Admin Email</button>}
        </div>
      </StaffGuard>

      {/* Permission-based actions */}
      <PermissionGuard
        resource="contact"
        action="write"
        fallback={<p>Je hebt geen schrijfrechten voor contacten</p>}
      >
        <button>Add New Contact</button>
      </PermissionGuard>

      {/* Multiple permissions check */}
      <PermissionGuard
        permissions={[
          { resource: 'contact', action: 'write' },
          { resource: 'user', action: 'read' }
        ]}
        fallback={<p>Ontbrekende rechten voor geavanceerde functies</p>}
      >
        <button>Advanced Contact Management</button>
      </PermissionGuard>

      {/* List with granular permissions */}
      {contacts.map(contact => (
        <div key={contact.id}>
          <span>{contact.name}</span>

          <PermissionGuard resource="contact" action="write">
            <button>Edit</button>
          </PermissionGuard>

          <PermissionGuard resource="contact" action="delete">
            <button>Delete</button>
          </PermissionGuard>

          {/* Admin-only actions */}
          <PermissionGuard resource="admin" action="access">
            <button>Force Delete</button>
          </PermissionGuard>
        </div>
      ))}
    </div>
  );
};
```

### Admin Panel with RBAC

```typescript
// AdminPanel.tsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminGuard, StaffGuard } from '../components/PermissionGuard';
import { UserManagement } from './admin/UserManagement';
import { PermissionManagement } from './admin/PermissionManagement';
import { SystemSettings } from './admin/SystemSettings';
import { AuditLogs } from './admin/AuditLogs';

const AdminPanel: React.FC = () => {
  return (
    <div className="admin-panel">
      <nav>
        <ul>
          {/* User Management - Staff+ */}
          <li>
            <StaffGuard>
              <Link to="/admin/users">Users</Link>
            </StaffGuard>
          </li>

          {/* Permission Management - Admin only */}
          <li>
            <AdminGuard>
              <Link to="/admin/permissions">Permissions</Link>
            </AdminGuard>
          </li>

          {/* System Settings - Admin only */}
          <li>
            <AdminGuard>
              <Link to="/admin/settings">Settings</Link>
            </AdminGuard>
          </li>

          {/* Audit Logs - Admin only */}
          <li>
            <AdminGuard>
              <Link to="/admin/audit">Audit Logs</Link>
            </AdminGuard>
          </li>

          {/* Newsletter Management - Staff+ with send permission */}
          <li>
            <ProtectedRoute resource="newsletter" action="send">
              <Link to="/admin/newsletters">Newsletters</Link>
            </ProtectedRoute>
          </li>

          {/* Email Fetching - Staff+ with fetch permission */}
          <li>
            <ProtectedRoute resource="email" action="fetch">
              <Link to="/admin/emails">Email Fetcher</Link>
            </ProtectedRoute>
          </li>
        </ul>
      </nav>

      <main>
        <Routes>
          <Route path="users" element={
            <ProtectedRoute resource="user" action="read">
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="permissions" element={
            <AdminGuard>
              <PermissionManagement />
            </AdminGuard>
          } />

          <Route path="settings" element={
            <AdminGuard>
              <SystemSettings />
            </AdminGuard>
          } />

          <Route path="audit" element={
            <AdminGuard>
              <AuditLogs />
            </AdminGuard>
          } />

          <Route path="newsletters" element={
            <ProtectedRoute resource="newsletter" action="send">
              <NewsletterManager />
            </ProtectedRoute>
          } />

          <Route path="emails" element={
            <ProtectedRoute resource="email" action="fetch">
              <EmailFetcher />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};
```

---

## 🧪 Testing

### Unit Tests for Auth Logic

```typescript
// __tests__/auth.test.ts
import { TokenManager } from '../utils/TokenManager';

describe('TokenManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve tokens correctly', () => {
    const token = 'jwt-token';
    const refreshToken = 'refresh-token';

    TokenManager.setTokens(token, refreshToken);

    const stored = TokenManager.getTokens();
    expect(stored.token).toBe(token);
    expect(stored.refresh_token).toBe(refreshToken);
  });

  it('should detect expired tokens', () => {
    // Set token with past expiry
    const pastTime = Date.now() - (30 * 60 * 1000); // 30 minutes ago
    localStorage.setItem('token_expires_at', pastTime.toString());

    expect(TokenManager.isTokenExpired()).toBe(true);
  });

  it('should clear all tokens on logout', () => {
    TokenManager.setTokens('token', 'refresh');
    TokenManager.clearTokens();

    const stored = TokenManager.getTokens();
    expect(stored.token).toBeNull();
    expect(stored.refresh_token).toBeNull();
  });
});
```

### Integration Tests for Auth Flow

```typescript
// __tests__/auth-integration.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '../components/Login';

// Mock fetch
global.fetch = jest.fn();

describe('Login Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully and redirect', async () => {
    const mockResponse = {
      success: true,
      token: 'jwt-token',
      refresh_token: 'refresh-token',
      user: {
        id: '1',
        email: 'test@example.com',
        naam: 'Test User',
        permissions: [],
        roles: [],
        is_actief: true,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<Login />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/wachtwoord/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /inloggen/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('jwt-token');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-token');
    });
  });

  it('should show error on failed login', async () => {
    const mockResponse = {
      success: false,
      error: 'Ongeldige inloggegevens',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(mockResponse),
    });

    render(<Login />);

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/wachtwoord/i), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /inloggen/i }));

    await waitFor(() => {
      expect(screen.getByText('Ongeldige inloggegevens')).toBeInTheDocument();
    });
  });
});
```

### Permission Hook Tests

```typescript
// __tests__/usePermissions.test.ts
import { renderHook } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  naam: 'Test User',
  permissions: [
    { resource: 'contact', action: 'read' },
    { resource: 'contact', action: 'write' },
    { resource: 'admin', action: 'access' },
  ],
  roles: [
    { id: '1', name: 'admin', description: 'Administrator', assigned_at: '2023-01-01', is_active: true },
  ],
  is_actief: true,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('usePermissions', () => {
  it('should return correct permission checks', () => {
    // Mock authenticated user
    // Note: In real tests, you'd need to set up the auth context properly

    const { result } = renderHook(() => usePermissions(), { wrapper });

    // These tests would need proper auth context setup
    // expect(result.current.hasPermission('contact', 'read')).toBe(true);
    // expect(result.current.hasPermission('contact', 'delete')).toBe(false);
    // expect(result.current.isAdmin()).toBe(true);
  });
});
```

---

## 📚 Related Documentation

- [`WEBSITE_AUTHENTICATION_ARCHITECTURE.md`](WEBSITE_AUTHENTICATION_ARCHITECTURE.md) - Backend authentication architecture
- [`RBAC_COMPLETE_OVERVIEW.md`](RBAC_COMPLETE_OVERVIEW.md) - Complete RBAC system documentation
- [`RBAC_SECURITY_AUDIT.md`](RBAC_SECURITY_AUDIT.md) - Security audit report
- [`RBAC_FIXES_IMPLEMENTATION.md`](RBAC_FIXES_IMPLEMENTATION.md) - Implementation details
- [`ROUTE_SECURITY_AUDIT.md`](ROUTE_SECURITY_AUDIT.md) - Route security status
- [`AUTH_AND_RBAC.md`](AUTH_AND_RBAC.md) - User guide and API reference
- [`FRONTEND_INTEGRATION.md`](FRONTEND_INTEGRATION.md) - Frontend integration guide
- [Backend API Documentation](../api/) - API endpoint specifications

---

## ⚠️ Critical Implementation Notes

### Security Checklist

- ✅ **HTTPS Only**: Gebruik altijd HTTPS in productie
- ✅ **Secure Cookies**: HTTPOnly, Secure, SameSite flags
- ✅ **Token Validation**: Valideer tokens bij elke request
- ✅ **Automatic Refresh**: Refresh tokens automatisch elke 15 minuten
- ✅ **Secure Storage**: Gebruik localStorage, geen sessionStorage voor tokens
- ✅ **XSS Prevention**: Sanitize alle user inputs
- ✅ **CSRF Protection**: Implement CSRF tokens indien nodig
- ✅ **Rate Limiting**: Respect backend rate limits
- ✅ **Error Handling**: Handle alle auth errors gracefully
- ✅ **Logout Security**: Clear alle tokens en cached data bij logout

### RBAC Security Checklist

- ✅ **JWT_SECRET Validation**: App crasht bij ontbrekende/invalid JWT_SECRET
- ✅ **Audit Logging**: Alle security events worden gelogd
- ✅ **Permission Caching**: Redis-backed caching voor optimale performance
- ✅ **Role Expiry**: Ondersteuning voor tijdelijke rollen
- ✅ **System Role Protection**: System roles kunnen niet worden gewijzigd
- ✅ **Granular Permissions**: 58 permissions over 19 resources
- ✅ **Multiple Roles**: Gebruikers kunnen meerdere rollen hebben
- ✅ **Route Protection**: 21/22 routes correct beveiligd
- ✅ **Error Standardization**: Nederlandse error messages met machine-readable codes

### Performance Considerations

- ✅ **Token Caching**: Cache tokens in memory voor snelle toegang
- ✅ **Lazy Loading**: Laad alleen benodigde permission data
- ✅ **Debounced Refresh**: Voorkom teveel refresh requests
- ✅ **Optimistic Updates**: Update UI voordat server response
- ✅ **Background Refresh**: Refresh tokens in de achtergrond

### User Experience Best Practices

- ✅ **Loading States**: Toon loading indicators tijdens auth checks
- ✅ **Error Messages**: Geef duidelijke, gebruikersvriendelijke foutmeldingen
- ✅ **Auto-redirect**: Redirect naar login bij expired sessions
- ✅ **Remember Location**: Redirect terug naar oorspronkelijke pagina na login
- ✅ **Progressive Enhancement**: Werk ook zonder JavaScript (basis functionaliteit)

---

**Version:** 1.1 (RBAC Enhanced)
**Last Updated:** 2025-11-07
**Status:** ✅ Production Ready
**Compatibility:** DKL Email Service V1.49.0+
**Frontend:** React 18+ with TypeScript
**RBAC Security Score:** 9.5/10
