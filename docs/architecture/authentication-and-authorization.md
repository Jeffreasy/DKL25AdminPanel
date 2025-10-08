# 🔐 Authentication & Authorization System

> **Versie:** 2.0 | **Status:** Production Ready | **Laatste Update:** 2025-01-08

Complete documentatie van het authenticatie en autorisatie systeem van het DKL25 Admin Panel.

---

## 📋 Inhoudsopgave

- [Overzicht](#-overzicht)
- [Architectuur](#-architectuur)
- [Authenticatie](#-authenticatie)
- [Autorisatie (RBAC)](#-autorisatie-rbac)
- [Frontend Implementatie](#-frontend-implementatie)
- [Backend Implementatie](#-backend-implementatie)
- [API Endpoints](#-api-endpoints)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)
- [Testing](#-testing)

---

## 🎯 Overzicht

Het DKL25 Admin Panel implementeert een volledig backend-gedreven authenticatie en autorisatie systeem met enterprise-grade security features.

### Kernfunctionaliteiten

- ✅ **JWT Authentication** - JSON Web Tokens met 20 minuten expiry
- ✅ **Refresh Tokens** - Automatische verlenging met 7 dagen expiry
- ✅ **RBAC** - Role-Based Access Control met granulaire permissies
- ✅ **Redis Caching** - Performance optimalisatie (5 minuten cache)
- ✅ **Token Rotation** - Extra beveiliging bij token refresh
- ✅ **Multi-level Checks** - Route, Component en API niveau

### Kernprincipes

| Principe | Beschrijving |
|----------|-------------|
| **Backend is Truth** | Alle permissies komen uit de database |
| **Defense in Depth** | Checks op UI, Route én API niveau |
| **Auto Session Management** | Token refresh en logout bij expiratie |
| **Granular Permissions** | Resource:Action based (bijv. `contact:write`) |
| **Token Rotation** | Oude refresh tokens worden ingetrokken |

---

## 🏗️ Architectuur

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────┤
│  AuthProvider → useAuth Hook → usePermissions Hook          │
│       ↓              ↓                  ↓                    │
│  Token Storage   Auth State      Permission Checks          │
│       ↓              ↓                  ↓                    │
│  AuthGuard    ProtectedRoute    Conditional Rendering       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (JWT Bearer Token)
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Go Fiber)                        │
├─────────────────────────────────────────────────────────────┤
│  Auth Endpoints → Permission Middleware → Permission Service│
│       ↓                   ↓                       ↓          │
│  JWT Generation    Permission Check         Redis Cache     │
│       ↓                   ↓                       ↓          │
│  Login/Refresh      403/401 Errors          Database Query  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Authenticatie

### Login Flow

```typescript
1. User Input
   ↓
2. Auto-append domain (@dekoninklijkeloop.nl)
   ↓
3. POST /api/auth/login
   ↓
4. Backend validates credentials
   ↓
5. Generate JWT (20 min) + Refresh Token (7 days)
   ↓
6. Store tokens in localStorage
   ↓
7. Load user profile with permissions
   ↓
8. Navigate to dashboard
```

### Token Management

**JWT Structure:**
```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "user_id": "uuid",
    "email": "admin@dekoninklijkeloop.nl",
    "role": "admin",
    "exp": 1234567890,
    "iat": 1234567890
  },
  "signature": "..."
}
```

**Token Lifecycle:**
- **Login:** Token generated (20 min expiry)
- **Storage:** localStorage (not cookies due to CORS)
- **Usage:** Authorization header for all API calls
- **Refresh:** Automatic 5 min before expiry
- **Logout:** All tokens cleared

### Automatic Token Refresh

```typescript
// Scheduled 5 minutes before expiry
private scheduleRefresh() {
  this.refreshTimer = setTimeout(
    () => this.refreshToken(), 
    15 * 60 * 1000  // 15 minutes
  )
}

// Refresh endpoint
POST /api/auth/refresh
Body: { "refresh_token": "..." }
Response: { "token": "new_token", "refresh_token": "new_refresh_token" }
```

---

## 🛡️ Autorisatie (RBAC)

### Permission Structure

```typescript
interface Permission {
  resource: string  // e.g., "contact", "user", "photo"
  action: string    // e.g., "read", "write", "delete"
}

// Formatted as: "resource:action"
// Examples: "contact:read", "user:manage_roles"
```

### Beschikbare Permissies

| Category | Permissions |
|----------|-------------|
| **Admin** | `admin:access` (volledige toegang) |
| **Staff** | `staff:access` (staff level) |
| **Contact** | `contact:read`, `contact:write`, `contact:delete` |
| **Users** | `user:read`, `user:write`, `user:delete`, `user:manage_roles` |
| **Media** | `photo/album/video:read/write/delete` |
| **Partners** | `partner/sponsor:read/write/delete` |
| **Newsletter** | `newsletter:read/write/send/delete` |
| **Email** | `email:read/write/delete/fetch`, `admin_email:send` |
| **Chat** | `chat:read/write/manage_channel/moderate` |
| **Aanmeldingen** | `aanmelding:read/write/delete` |

### Database Schema

```sql
-- Core RBAC tables
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    is_system_permission BOOLEAN DEFAULT FALSE,
    UNIQUE(resource, action)
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE
);
```

---

## 🎨 Frontend Implementatie

### Core Components

#### AuthProvider
**Locatie:** [`src/features/auth/contexts/AuthProvider.tsx`](../../src/features/auth/contexts/AuthProvider.tsx)

```typescript
// Provides authentication state
{
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email, password) => Promise<{success, error?}>
  logout: () => Promise<void>
  refreshToken: () => Promise<string | null>
}
```

#### useAuth Hook
**Locatie:** [`src/features/auth/hooks/useAuth.ts`](../../src/features/auth/hooks/useAuth.ts)

```typescript
const { user, isAuthenticated, login, logout } = useAuth()
```

#### usePermissions Hook
**Locatie:** [`src/hooks/usePermissions.ts`](../../src/hooks/usePermissions.ts)

```typescript
const { 
  hasPermission,      // (resource, action) => boolean
  hasAnyPermission,   // (...perms) => boolean
  hasAllPermissions   // (...perms) => boolean
} = usePermissions()
```

### Route Protection

```typescript
// Layout-level (authentication only)
<Route element={<AuthGuard><MainLayout /></AuthGuard>}>
  <Route path="/" element={<Dashboard />} />
</Route>

// Route-level (with permission check)
<Route 
  path="/contacts" 
  element={
    <ProtectedRoute requiredPermission="contact:read">
      <ContactManager />
    </ProtectedRoute>
  } 
/>

// Component-level (conditional rendering)
{hasPermission('contact', 'write') && <EditButton />}
```

---

## 🔧 Backend Implementatie

### API Endpoints

| Endpoint | Method | Auth | Beschrijving |
|----------|--------|------|--------------|
| `/api/auth/login` | POST | ❌ | Login met email + wachtwoord |
| `/api/auth/logout` | POST | ❌ | Logout (revokes refresh tokens) |
| `/api/auth/refresh` | POST | ❌ | Refresh access token |
| `/api/auth/profile` | GET | ✅ | User profiel + permissions |
| `/api/permissions` | GET | ✅ | Alle permissies ophalen |
| `/api/roles` | GET | ✅ | Alle rollen met permissies |
| `/api/roles/:id/permissions` | PUT | ✅ | Permissies toewijzen aan rol |
| `/api/users/:id/roles` | PUT | ✅ | Rollen toewijzen aan user |

### Permission Middleware

```javascript
function requirePermission(resource, action) {
  return async (req, res, next) => {
    const userPermissions = await getUserPermissions(req.user.id)
    
    const hasPermission = userPermissions.some(perm =>
      perm.resource === resource && perm.action === action
    )

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        required_permission: `${resource}:${action}`
      })
    }

    next()
  }
}
```

### Error Codes

| Code | HTTP | Beschrijving | Frontend Actie |
|------|------|--------------|----------------|
| `TOKEN_EXPIRED` | 401 | Access token verlopen | Trigger refresh |
| `TOKEN_MALFORMED` | 401 | Token format incorrect | Force logout |
| `PERMISSION_DENIED` | 403 | Geen permissie | Show error |
| `REFRESH_TOKEN_EXPIRED` | 401 | Refresh token verlopen | Force logout |

---

## 💡 Best Practices

### 1. Defense in Depth

```typescript
// ✅ GOED - Multi-level protection

// Route level
<ProtectedRoute requiredPermission="contact:write">
  <ContactEditor />
</ProtectedRoute>

// Component level
if (!hasPermission('contact', 'write')) {
  return <AccessDenied />
}

// API level (backend validates)
await api.put('/contacts/:id', data)
```

### 2. Graceful Degradation

```typescript
// ✅ GOED - Show what user can do
const canEdit = hasPermission('contact', 'write')
const canDelete = hasPermission('contact', 'delete')

return (
  <ContactItem 
    showEdit={canEdit}
    showDelete={canDelete}
  />
)
```

### 3. Security Considerations

```typescript
// ❌ FOUT - Frontend check alleen
if (hasPermission('admin', 'access')) {
  deleteAllUsers() // Kan omzeild worden!
}

// ✅ GOED - Backend valideert
if (hasPermission('admin', 'access')) {
  await api.delete('/users/all') // Backend checkt
}
```

---

## 🐛 Troubleshooting

### "Backend returned no permissions"

**Oorzaak:** Backend retourneert geen permissions array

**Oplossing:**
1. Check `/api/auth/profile` endpoint response
2. Verify database heeft `user_roles` en `role_permissions` records
3. Check backend logs
4. Verify user heeft rollen toegewezen
5. Check Redis connectie

### User heeft geen toegang

**Oplossing:**
1. Login als admin
2. Ga naar Admin → Permissies & Rollen
3. Wijs rollen toe aan gebruiker
4. User moet opnieuw inloggen

### 401 Unauthorized errors

**Oorzaken:**
- Token expired (refresh mechanisme zou dit moeten afhandelen)
- Invalid token (JWT_SECRET mismatch)
- Token not sent (check Authorization header)

### Permissies werken niet na wijziging

**Oorzaak:** Redis cache nog niet geïnvalideerd (5 min TTL)

**Oplossing:**
1. Wacht 5 minuten
2. Of: Logout en login opnieuw
3. Of: Backend cache invalidatie triggeren

---

## 🧪 Testing

### Backend API Tests

```bash
# Login test
curl -X POST https://api.dekoninklijkeloop.nl/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dekoninklijkeloop.nl","wachtwoord":"password"}'

# Profile test
curl https://api.dekoninklijkeloop.nl/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Refresh test
curl -X POST https://api.dekoninklijkeloop.nl/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"YOUR_REFRESH_TOKEN"}'
```

### Database Verificatie

```sql
-- Actieve refresh tokens
SELECT u.email, rt.token, rt.expires_at
FROM refresh_tokens rt
JOIN gebruikers u ON rt.user_id = u.id
WHERE rt.is_revoked = false
  AND rt.expires_at > NOW();

-- User permissions
SELECT u.email, r.name as role, p.resource, p.action
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'admin@dekoninklijkeloop.nl';
```

---

## 📈 Performance Metrics

| Metric | Target | Actueel |
|--------|--------|---------|
| Login Response Time | < 500ms | ~300ms |
| Token Refresh Time | < 200ms | ~150ms |
| Permission Check (cached) | < 5ms | ~2ms |
| Permission Check (uncached) | < 50ms | ~30ms |
| Cache Hit Rate | > 95% | ~97% |

### Caching Strategy

**Redis Cache:**
- Permission Cache: 5 minuten TTL
- Key Format: `perm:{userID}:{resource}:{action}`
- Hit Rate: ~97%

**LocalStorage:**
- Access Token: 20 minuten
- Refresh Token: 7 dagen
- User Data: Tot logout

---

## 🚀 Deployment

### Environment Variables

**Backend:**
```bash
JWT_SECRET=your-super-secret-key
JWT_TOKEN_EXPIRY=20m
REDIS_HOST=localhost
REDIS_PORT=6379
DATABASE_URL=postgresql://...
```

**Frontend:**
```bash
VITE_API_BASE_URL=https://api.dekoninklijkeloop.nl
```

### Deployment Checklist

**Pre-Deployment:**
- [x] Database migraties voorbereid
- [x] Environment variables geconfigureerd
- [x] JWT_SECRET ingesteld
- [x] Redis connectie getest

**Post-Deployment:**
- [x] Login endpoint getest
- [x] Refresh endpoint getest
- [x] Permission checks geverifieerd
- [x] Token rotation getest

---

## 📚 Gerelateerde Bestanden

### Frontend
- [`src/features/auth/contexts/AuthProvider.tsx`](../../src/features/auth/contexts/AuthProvider.tsx)
- [`src/features/auth/hooks/useAuth.ts`](../../src/features/auth/hooks/useAuth.ts)
- [`src/hooks/usePermissions.ts`](../../src/hooks/usePermissions.ts)
- [`src/components/auth/AuthGuard.tsx`](../../src/components/auth/AuthGuard.tsx)
- [`src/components/auth/ProtectedRoute.tsx`](../../src/components/auth/ProtectedRoute.tsx)

### Services
- [`src/features/users/services/userService.ts`](../../src/features/users/services/userService.ts)
- [`src/features/users/services/roleService.ts`](../../src/features/users/services/roleService.ts)
- [`src/features/users/services/permissionService.ts`](../../src/features/users/services/permissionService.ts)

---

## ✅ Samenvatting

Het auth systeem biedt:

### Authenticatie
- ✅ JWT tokens met automatische refresh
- ✅ Secure token storage
- ✅ Automatische logout bij expiratie
- ✅ Token rotation voor extra beveiliging

### Autorisatie
- ✅ Backend-gedreven RBAC
- ✅ Granulaire resource:action permissies
- ✅ Redis caching voor performance
- ✅ Multi-level permission checks

### Security
- ✅ Defense in Depth
- ✅ Backend als Single Source of Truth
- ✅ Automatic token validation
- ✅ Secure password handling

---

**⚠️ Belangrijk:** Frontend checks zijn voor UX, Backend checks zijn voor Security! 🔒

---

**Versie:** 2.0  
**Laatste Update:** 2025-01-08  
**Status:** Production Ready