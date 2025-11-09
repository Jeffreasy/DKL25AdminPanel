# Token Management Guide - DKL25 Admin Panel

Complete gids voor JWT token management in het DKL25 Admin Panel.

## 📋 Overzicht

Het DKL25 Admin Panel gebruikt een moderne JWT-based authentication systeem met automatische token refresh. Dit document beschrijft de officiële token management strategie.

---

## 🔑 Token Types & Storage Keys

### Officiële Token Keys

| Token Type | LocalStorage Key | Expiry | Purpose |
|------------|-----------------|--------|---------|
| **Access Token** | `auth_token` | 20 minuten | API authenticatie |
| **Refresh Token** | `refresh_token` | 7 dagen | Token vernieuwing |
| **Expiry Timestamp** | `token_expires_at` | - | Expiry tracking |

### ⚠️ Legacy Keys (DEPRECATED)

| Legacy Key | Status | Migratie |
|------------|--------|----------|
| `jwtToken` | ❌ Deprecated | Auto-migratie naar `auth_token` |
| `access_token` | ❌ Never used | Documentatie fout |

**Belangrijk:** Gebruik **alleen** `auth_token`, nooit `access_token` of `jwtToken`!

---

## 🏗️ Architectuur

### Token Management Components

```
┌─────────────────────────────────────────────────────────────┐
│                      AuthProvider                            │
│  - User state management                                    │
│  - Login/Logout orchestration                               │
│  - Profile loading                                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├──────────────────────────────────────────┐
                  │                                          │
        ┌─────────▼──────────┐                    ┌─────────▼──────────┐
        │   TokenManager     │                    │ TokenRefreshScheduler│
        │                    │                    │                    │
        │ - Token storage    │◄───────────────────┤ - Auto refresh     │
        │ - Expiry tracking  │                    │ - 60s interval     │
        │ - Validation       │                    │ - 5min threshold   │
        └────────────────────┘                    └────────────────────┘
```

### Component Verantwoordelijkheden

#### 1. [`TokenManager`](../src/features/auth/contexts/TokenManager.ts)
**Purpose:** Centralized token storage & validation

**Methods:**
```typescript
TokenManager.setTokens(token, refreshToken?)  // Store tokens
TokenManager.getValidToken()                   // Get if not expired
TokenManager.isTokenExpired()                  // Check expiry
TokenManager.shouldRefreshToken()              // Check if refresh needed
TokenManager.clearTokens()                     // Logout cleanup
TokenManager.parseTokenClaims(token)          // Parse JWT payload
```

#### 2. [`TokenRefreshScheduler`](../src/features/auth/contexts/TokenRefreshScheduler.ts)
**Purpose:** Automatic background token refresh

**Behavior:**
- ✅ Checks every 60 seconds
- ✅ Refreshes when < 5 minutes until expiry
- ✅ Silent failures (logs maar triggered geen alerts)
- ✅ Auto-logout on refresh failure

#### 3. [`AuthProvider`](../src/features/auth/contexts/AuthProvider.tsx)
**Purpose:** React context voor auth state

**Features:**
- User profile management
- Login/Logout orchestration
- RBAC roles & permissions
- Token lifecycle coordination

---

## 🔄 Token Lifecycle

### 1. Login Flow

```typescript
User enters credentials
         │
         ▼
AuthProvider.login()
         │
         ├──► POST /api/auth/login
         │    Body: { email, wachtwoord }
         │
         ▼
Response: {
  token: "eyJ...",           // 20 min expiry
  refresh_token: "abc...",   // 7 day expiry
  user: { id, email, ... }
}
         │
         ▼
TokenManager.setTokens(token, refresh_token)
         │
         ├──► localStorage.setItem('auth_token', token)
         ├──► localStorage.setItem('refresh_token', refresh_token)
         └──► localStorage.setItem('token_expires_at', timestamp)
         │
         ▼
TokenRefreshScheduler.start()  // Begin auto-refresh
         │
         ▼
AuthProvider.loadUserProfile()  // Get permissions
```

### 2. Token Refresh Flow

```typescript
TokenRefreshScheduler (every 60s)
         │
         ▼
Check: shouldRefreshToken()?
         │
         ├─ NO ──► Continue
         │
         ├─ YES ─► POST /api/auth/refresh
                   Body: { refresh_token }
                   │
                   ▼
              Response: {
                token: "new_token",
                refresh_token: "new_refresh"
              }
                   │
                   ▼
              TokenManager.setTokens(...)
                   │
                   ▼
              Emit 'tokens-refreshed' event
```

### 3. Logout Flow

```typescript
User clicks logout
         │
         ▼
AuthProvider.logout()
         │
         ├──► TokenRefreshScheduler.stop()
         ├──► TokenManager.clearTokens()
         ├──► localStorage.removeItem('userId')
         ├──► setUser(null)
         └──► window.location.href = '/login'
```

---

## 💻 Implementation Examples

### Basic Usage

```typescript
import { TokenManager } from '@/features/auth/contexts/TokenManager';

// Check if authenticated
if (TokenManager.getValidToken()) {
  console.log('User is authenticated');
}

// Get token for API call
const token = TokenManager.getValidToken();
if (token) {
  fetch('/api/resource', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

// Parse token claims
const claims = TokenManager.parseTokenClaims(token);
console.log('Roles:', claims.roles);
console.log('Expires at:', new Date(claims.exp * 1000));
```

### Using AuthProvider Hook

```typescript
import { useAuth } from '@/features/auth/hooks/useAuth';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    const result = await login('user@example.com', 'password');
    if (result.success) {
      console.log('Logged in!');
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Making Authenticated API Calls

```typescript
import { apiClient } from '@/services/api.client';

// Axios interceptor automatically adds token
const response = await apiClient.get('/api/users');

// Or manual approach
const token = TokenManager.getValidToken();
const response = await fetch('/api/resource', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🔒 Security Best Practices

### ✅ DO's

- ✅ Use `TokenManager` for all token operations
- ✅ Check `getValidToken()` before API calls
- ✅ Let `TokenRefreshScheduler` handle refresh automatically
- ✅ Clear tokens completely on logout
- ✅ Use HTTPS in production
- ✅ Validate token expiry client-side

### ❌ DON'Ts

- ❌ Don't access localStorage directly for tokens
- ❌ Don't use legacy key names (`jwtToken`, `access_token`)
- ❌ Don't manually refresh tokens (scheduler does it)
- ❌ Don't store tokens in sessionStorage or cookies
- ❌ Don't forget to call `TokenRefreshScheduler.stop()` on logout

---

## 🐛 Error Handling

### 401 Unauthorized - Token Invalid/Expired

**Behavior:** Auto-logout and redirect to login

```typescript
// In axios interceptor (api.client.ts)
if (error.response?.status === 401) {
  TokenManager.clearTokens();
  window.location.href = '/login';
}
```

**Cause:**
- Token expired and refresh failed
- Token signature invalid
- Token revoked by backend

### 403 Forbidden - No Permissions

**Behavior:** Show error but DON'T logout

```typescript
// Token is valid but user lacks permission
if (error.response?.status === 403) {
  // Show error message
  // User remains logged in
}
```

**Cause:**
- Valid token but insufficient permissions
- RBAC rule prevents access

---

## 🔄 Migration Guide

### From Legacy `jwtToken` to `auth_token`

**Automatisch:** [`TokenManager`](../src/features/auth/contexts/TokenManager.ts:37) migreert automatisch:

```typescript
// TokenManager.getTokens() doet dit automatisch:
const legacyToken = localStorage.getItem('jwtToken');
if (legacyToken && !localStorage.getItem('auth_token')) {
  localStorage.setItem('auth_token', legacyToken);
  localStorage.removeItem('jwtToken');
}
```

### From Old API Client to New System

**Voor:**
```typescript
// OLD - Direct localStorage access
const token = localStorage.getItem('jwtToken');
```

**Na:**
```typescript
// NEW - Via TokenManager
const token = TokenManager.getValidToken();
```

---

## 🧪 Testing

### Token Expiry Test

```typescript
describe('Token Management', () => {
  it('should auto-refresh before expiry', async () => {
    // Set token that expires in 4 minutes
    const expiry = Date.now() + (4 * 60 * 1000);
    localStorage.setItem('token_expires_at', expiry.toString());
    
    // Should trigger refresh (< 5 min threshold)
    expect(TokenManager.shouldRefreshToken()).toBe(true);
  });

  it('should logout on expired token', () => {
    // Set expired token
    const expiry = Date.now() - 1000;
    localStorage.setItem('token_expires_at', expiry.toString());
    
    expect(TokenManager.isTokenExpired()).toBe(true);
    expect(TokenManager.getValidToken()).toBeNull();
  });
});
```

---

## 📊 Token Configuration

### Environment Variables

```bash
# .env
VITE_API_BASE_URL=http://localhost:8082
```

### Token Expiry Settings

| Setting | Value | Configurable |
|---------|-------|--------------|
| Access Token | 20 minutes | Backend only |
| Refresh Token | 7 days | Backend only |
| Refresh Check Interval | 60 seconds | Frontend |
| Refresh Threshold | 5 minutes | Frontend |

**Wijzig niet** de expiry settings in frontend - deze worden door backend bepaald!

---

## 🔍 Debugging

### Check Token Status

```typescript
// Console output voor debugging
console.log('Token valid:', !!TokenManager.getValidToken());
console.log('Token expired:', TokenManager.isTokenExpired());
console.log('Should refresh:', TokenManager.shouldRefreshToken());

// Parse token claims
const token = localStorage.getItem('auth_token');
if (token) {
  const claims = TokenManager.parseTokenClaims(token);
  console.log('Claims:', claims);
  console.log('Expires at:', new Date(claims.exp * 1000));
}
```

### Common Issues

#### "Token refresh failed"
- Check backend is running
- Verify refresh token not expired (7 days)
- Check network connectivity
- Verify `/api/auth/refresh` endpoint works

#### "Stuck in login loop"
- Clear localStorage completely
- Check console for 401/403 errors
- Verify backend token validation
- Check CORS settings

#### "Permissions not loading"
- Check `/api/auth/profile` response
- Verify user has roles assigned
- Check RBAC is enabled in backend

---

## 📚 Related Documentation

- [`FRONTEND_INTEGRATION.md`](../FRONTEND_INTEGRATION.md) - API integration guide
- [`QUICK_REFERENCE.md`](../QUICK_REFERENCE.md) - API endpoints
- [`PERMISSIONS.md`](../PERMISSIONS.md) - RBAC & permissions

---

## 🎯 Summary

**Token Keys - The Law:**
```
✅ auth_token      - Use this!
✅ refresh_token   - Use this!
❌ access_token    - NO!
❌ jwtToken        - NO! (deprecated)
```

**Token Lifecycle:**
1. Login → Store tokens via `TokenManager`
2. API calls → Auto-add token via interceptor
3. Background → Auto-refresh via scheduler
4. Logout → Clear all tokens

**Key Classes:**
- [`TokenManager`](../src/features/auth/contexts/TokenManager.ts) - Storage & validation
- [`TokenRefreshScheduler`](../src/features/auth/contexts/TokenRefreshScheduler.ts) - Auto refresh
- [`AuthProvider`](../src/features/auth/contexts/AuthProvider.tsx) - React context

---

**Last Updated:** 2025-01-08  
**Version:** 1.0.0