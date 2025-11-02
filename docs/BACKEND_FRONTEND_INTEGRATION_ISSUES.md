# Backend-Frontend Integration Issues

## ✅ ALL ISSUES RESOLVED (2025-11-02)

### Executive Summary

Alle gerapporteerde frontend errors zijn succesvol opgelost en de codebase is gestandaardiseerd:

| Issue | Status | Severity | Oplossing |
|-------|--------|----------|-----------|
| Logout endpoint fout | ✅ Fixed | High | `/auth/logout` → `/api/auth/logout` |
| Missing Authorization header | ✅ Verified | Medium | Al correct geïmplementeerd |
| 403 vs 401 error handling | ✅ Fixed | High | Proper distinction toegevoegd |
| Token storage inconsistency | ✅ Fixed | Medium | Alle files gebruiken nu `auth_token` |

### Samenvatting van Fixes

Alle drie de gerapporteerde errors waren **FRONTEND** issues en zijn nu opgelost:

#### 1. ✅ Error: Cannot POST /auth/logout
**Oorzaak**: Frontend riep `/auth/logout` aan in plaats van `/api/auth/logout`  
**Oplossing**: Updated [`auth.ts:70`](../src/api/client/auth.ts:70) om `/api/auth/logout` te gebruiken  
**Status**: ✅ Fixed

**Code Change**:
```typescript
// VOOR (INCORRECT):
await fetch(`${API_BASE}/auth/logout`, { ... })

// NA (CORRECT):
await fetch(`${API_BASE}/api/auth/logout`, { ... })
```

---

#### 2. ✅ Error: Missing Authorization Header
**Oorzaak**: Steps API client gebruikt al `authManager.makeAuthenticatedRequest()` die automatisch de Authorization header toevoegt  
**Oplossing**: Geen code changes nodig - implementatie is correct  
**Status**: ✅ Already Correct

**Verificatie**:
- [`auth.ts:141-144`](../src/api/client/auth.ts:141): Voegt `Authorization: Bearer ${token}` header toe
- [`stepsClient.ts:19-20`](../src/api/client/stepsClient.ts:19): Gebruikt `makeAuthenticatedRequest`

---

#### 3. ✅ Error Handling: 403 vs 401
**Oorzaak**: Frontend moest beter onderscheid maken tussen:
- **401 UNAUTHORIZED** = Token invalid/expired → **logout user**
- **403 FORBIDDEN** = No permission, token valid → **show error, DON'T logout**

**Oplossing**: Verbeterde error handling in twee bestanden:

**A. auth.ts - makeAuthenticatedRequest** ([`auth.ts:151-176`](../src/api/client/auth.ts:151))
```typescript
// 401 UNAUTHORIZED - Token invalid/expired, force logout
if (response.status === 401) {
  this.logout();
  throw new Error(error.error || 'Authentication expired');
}

// 403 FORBIDDEN - No permission, but token valid, DON'T logout
if (response.status === 403) {
  const forbiddenError: ApiError = new Error(error.error || 'Geen toegang tot deze resource');
  forbiddenError.status = 403;
  forbiddenError.code = error.code || 'FORBIDDEN';
  throw forbiddenError;
}
```

**B. api.client.ts - Axios Interceptor** ([`api.client.ts:45-67`](../src/services/api.client.ts:45))
```typescript
// 401 UNAUTHORIZED - Token invalid/expired, force logout
if (error.response?.status === 401) {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
}

// 403 FORBIDDEN - No permission, but token is valid, DON'T logout
// Just pass error through to component
```

**Status**: ✅ Fixed

---

## Frontend Error Handling Strategie

### Component Level Error Handling

Components moeten errors als volgt afhandelen:

```typescript
try {
  await someApiCall();
} catch (error) {
  // Check error status
  if (error.status === 403) {
    // FORBIDDEN - Show error message, DON'T logout
    toast.error('Je hebt geen toegang tot deze functie');
    return; // User blijft ingelogd
  }
  
  if (error.status === 401) {
    // UNAUTHORIZED - Already handled by interceptor
    // User wordt automatisch uitgelogd en doorgestuurd naar /login
    return;
  }
  
  // Other errors
  toast.error(error.message || 'Er ging iets mis');
}
```

### Backend Error Response Format

Backend stuurt errors in dit formaat:

```json
{
  "error": "User-friendly foutmelding",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    "required_permission": "albums.write",
    "user_permissions": ["albums.read"]
  }
}
```

**Error Codes**:
- `FORBIDDEN` - Geen permission (403)
- `UNAUTHORIZED` - Token invalid/expired (401)
- `VALIDATION_ERROR` - Input validation failed (400)
- etc.

---

## ✅ Token Storage Unified (2025-11-02)

### Probleem Opgelost
Alle bestanden gebruiken nu dezelfde token storage key: **`auth_token`**

### Vorige Situatie
- **auth.ts** gebruikte: `jwtToken`
- **api.client.ts** gebruikte: `auth_token`
- Dit veroorzaakte inconsistentie

### Huidige Situatie - ✅ Opgelost
Alle bestanden gebruiken nu: **`auth_token`**

**Gewijzigde bestanden:**
1. [`src/api/client/auth.ts`](../src/api/client/auth.ts) - AuthManager
2. [`src/api/client/albumClient.ts`](../src/api/client/albumClient.ts)
3. [`src/api/client/contactClient.ts`](../src/api/client/contactClient.ts)
4. [`src/api/client/rbacClient.ts`](../src/api/client/rbacClient.ts)
5. [`src/api/client/videoClient.ts`](../src/api/client/videoClient.ts)
6. [`src/api/client/partnerClient.ts`](../src/api/client/partnerClient.ts)
7. [`src/features/aanmeldingen/services/aanmeldingenService.ts`](../src/features/aanmeldingen/services/aanmeldingenService.ts)
8. [`src/features/albums/hooks/usePhotoSelection.ts`](../src/features/albums/hooks/usePhotoSelection.ts)

### Token Storage Standard
```typescript
// ✅ CORRECT - Consistent across alle files
const token = localStorage.getItem('auth_token');
localStorage.setItem('auth_token', token);
localStorage.removeItem('auth_token');

// ❌ OBSOLETE - Niet meer in gebruik
// localStorage.getItem('jwtToken')
```

---

## Testing Checklist

### ✅ Completed
- [x] Fix logout endpoint URL
- [x] Verify Authorization header implementation
- [x] Implement 401 vs 403 error handling
- [x] Standardize token storage keys
- [x] Update all client files to use `auth_token`
- [x] Update documentation

### 🔄 Pending (Backend Integration Testing)
- [ ] Test logout flow met daadwerkelijke backend
- [ ] Test actual 401 response triggert logout
- [ ] Test actual 403 response toont error maar loguit NIET
- [ ] Verify token expiry handling (20 min)
- [ ] Test token refresh mechanism (if implemented)
- [ ] End-to-end integration test

---

## Notes & Best Practices

### Token Management
- **Storage Key**: Altijd `auth_token` gebruiken (niet `jwtToken`)
- **JWT Expiry**: 20 minuten (backend setting)
- **Refresh Token**: Optioneel, stored as `refresh_token`

### API Routes
- **Login**: `/api/auth/login`
- **Logout**: `/api/auth/logout` ⚠️ NIET `/auth/logout`
- **Protected routes**: Altijd onder `/api/` prefix

### Error Handling Strategy
- **401 UNAUTHORIZED**: Token invalid/expired → **Force logout**
- **403 FORBIDDEN**: No permission → **Show error, keep user logged in**
- **Other errors**: Show appropriate error message

### Code Standards
```typescript
// ✅ CORRECT - Gebruik auth_token
const token = localStorage.getItem('auth_token');

// ✅ CORRECT - 403 vs 401 handling
if (error.status === 403) {
  toast.error('Geen toegang');
  // User blijft ingelogd
}
if (error.status === 401) {
  // Auto-logout by interceptor
}

// ❌ OBSOLETE - Gebruik deze NIET meer
// localStorage.getItem('jwtToken')
```

---

## Implementation Details

### Files Modified

1. **src/api/client/auth.ts**
   - Fixed logout endpoint: `/auth/logout` → `/api/auth/logout`
   - Added proper 403 vs 401 error handling
   - Added `ApiError` interface for typed errors

2. **src/services/api.client.ts**
   - Enhanced axios interceptor comments
   - Clarified 403 handling (don't logout)

### Error Flow

```
API Request
    ↓
Response Error?
    ↓
├─ 401 UNAUTHORIZED
│  ├─ auth.ts: calls logout()
│  ├─ api.client.ts: clears tokens + redirect /login
│  └─ User is logged out
│
├─ 403 FORBIDDEN  
│  ├─ Error thrown with status=403, code=FORBIDDEN
│  ├─ Component catches error
│  ├─ Shows error message
│  └─ User stays logged in
│
└─ Other errors
   └─ Normal error handling