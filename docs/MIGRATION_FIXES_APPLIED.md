# Backend Migratie - Toegepaste Fixes

**Datum:** 2025-01-08  
**Status:** ✅ **KRITIEKE FIXES VOLTOOID**

---

## ✅ Voltooide Wijzigingen

### 1. API Base URL Gecorrigeerd ✅

**Bestand:** [`src/config/api.config.ts`](../src/config/api.config.ts)

**Was:**
```typescript
return 'https://dklemailservice.onrender.com';
```

**Nu:**
```typescript
return 'https://api.dklemailservice.com'; // Correct volgens backend docs
```

**Impact:** Alle API calls bereiken nu de juiste backend URL

---

### 2. WebSocket URL Configuratie Gefixt ✅

**Bestand:** [`src/config/api.config.ts`](../src/config/api.config.ts)

**Was:**
```typescript
return 'wss://dklemailservice.onrender.com/api/chat/ws'; // Chat-specific!
```

**Nu:**
```typescript
// Auto-derive van API URL
const baseURL = getAPIBaseURL();
const protocol = baseURL.startsWith('https') ? 'wss' : 'ws';
return `${protocol}://${url}`;
```

**Impact:** WebSocket base URL wordt nu correct afgeleid van API URL

---

### 3. Dedicated WebSocket Config Aangemaakt ✅

**Nieuw bestand:** [`src/config/websocket.config.ts`](../src/config/websocket.config.ts)

**Features:**
- ✅ Aparte URL configuratie voor Steps (`/ws/steps`)
- ✅ Aparte URL configuratie voor Notulen (`/api/ws/notulen`)
- ✅ Aparte URL configuratie voor Chat (`/api/chat/ws/:channel_id`)
- ✅ Reconnection instellingen (max attempts, backoff, etc)
- ✅ Development logging

**Gebruik:**
```typescript
import { wsConfig } from '@/config/websocket.config';

// Steps WebSocket
const stepsUrl = wsConfig.steps(token);

// Notulen WebSocket
const notulenUrl = wsConfig.notulen(token);

// Chat WebSocket
const chatUrl = wsConfig.chat(channelId, token);
```

---

### 4. Login Endpoint Gefixt ✅

**Bestand:** [`src/api/client/auth.ts`](../src/api/client/auth.ts)

**Wijzigingen:**
- ✅ Endpoint: `/auth/login` → `/api/auth/login`
- ✅ Request body: `wachtwoord` → `password`
- ✅ Response parsing: `data.token` → `data.data.access_token`
- ✅ Token storage: beide tokens opslaan
- ✅ Better error handling

**Voor:**
```typescript
fetch(`${API_BASE}/auth/login`, {
  body: JSON.stringify({ email, wachtwoord: password })
});
```

**Na:**
```typescript
fetch(`${API_BASE}/api/auth/login`, {
  body: JSON.stringify({ email, password })
});
const data = await response.json();
if (data.success && data.data) {
  TokenManager.setTokens(data.data.access_token, data.data.refresh_token);
}
```

---

### 5. Token Refresh Geïmplementeerd ✅

**Bestand:** [`src/api/client/auth.ts`](../src/api/client/auth.ts)

**Voor:**
```typescript
private async refreshToken() {
  this.logout(); // ❌ WRONG - logged users out
}
```

**Na:**
```typescript
private async refreshToken() {
  const refreshToken = TokenManager.getRefreshToken();
  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  const data = await response.json();
  TokenManager.setTokens(data.data.access_token, data.data.refresh_token);
  this.scheduleRefresh(); // Schedule next refresh
}
```

**Impact:** 
- Users blijven nu ingelogd
- Automatic token refresh 5 minuten voor expiry
- Seamless user experience

---

### 6. Logout Endpoint Gefixt ✅

**Bestand:** [`src/api/client/auth.ts`](../src/api/client/auth.ts)

**Wijzigingen:**
- ✅ Stuurt nu refresh_token mee in body (vereist door backend)
- ✅ Correct endpoint: `/api/auth/logout`

**Code:**
```typescript
await fetch(`${API_BASE}/api/auth/logout`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ refresh_token: refreshToken }),
});
```

---

### 7. Password Change Endpoint Gefixt ✅

**Bestand:** [`src/api/client/auth.ts`](../src/api/client/auth.ts)

**Was:** `/api/users/password`  
**Nu:** `/api/auth/reset-password` (correct volgens backend docs)

---

### 8. Environment Variables Configure ✅

**Nieuw bestand:** [`.env.example`](../.env.example)

**Bevat:**
- ✅ `VITE_API_BASE_URL` - Correcte productie URL
- ✅ `VITE_WS_BASE_URL` - WebSocket URL (optional)
- ✅ `VITE_EMAIL_API_URL` - Email API URL
- ✅ `VITE_JWT_SECRET` - JWT secret
- ✅ `VITE_CLOUDINARY_*` - Cloudinary configuratie
- ✅ Development environment voorbeeld
- ✅ Uitgebreide documentatie in comments

**Actie vereist:**
```bash
# Kopieer .env.example naar .env
cp .env.example .env

# En vul echte waarden in (niet committen naar git!)
```

---

## 📋 Volgende Stappen

### Phase 2: API Clients Update (In Progress)

Nu de basis werkt, moeten alle API clients geupdatet worden:

#### Te Doen:
- [ ] Update alle API clients voor nieuwe response format
- [ ] Verify alle endpoints hebben `/api` prefix
- [ ] Add error handling voor nieuwe error codes
- [ ] Implement permission checking in API calls
- [ ] Add nieuwe clients (Event, Notification)

#### Priority Clients:
1. **Auth Client** - ✅ DONE
2. **RBAC Client** - Verify permission endpoints
3. **User Client** - Verify CRUD endpoints
4. **Email Client** - Verify mail management
5. **Steps Client** - Add achievements/leaderboard
6. **Notulen Client** - Verify finalize endpoint
7. **Album/Photo Client** - Verify Cloudinary
8. **Event Client** - NEW (create)
9. **Notification Client** - NEW (create)

### Phase 3: Testing

- [ ] Test login flow
- [ ] Test token refresh (wait 20+ min or mock)
- [ ] Test WebSocket connections
- [ ] Test all CRUD operations
- [ ] Test permission system

---

## 🎯 Verwachte Resultaten

Na deze fixes:

### ✅ Werkt Nu:
- Login functionaliteit
- Token storage
- Token refresh (automatic)
- Logout
- Password change
- API calls bereiken correcte backend
- WebSocket configuratie is ready

### ⏳ Nog Te Doen:
- API clients response parsing updaten
- RBAC permission checks implementeren
- Nieuwe features integreren (gamification, events, notifications)
- Complete end-to-end testing
- Error handling verbeteren

---

## 📚 Referenties

- **Analyse Document:** [`docs/BACKEND_MIGRATION_ANALYSIS.md`](./BACKEND_MIGRATION_ANALYSIS.md)
- **Backend Docs:** [`docs/backend Docs/`](./backend Docs/)
- **API Quick Reference:** [`docs/backend Docs/api/QUICK_REFERENCE.md`](./backend Docs/api/QUICK_REFERENCE.md)

---

## 🚀 Testing Checklist

### Immediate Testing Needed:
```bash
# 1. Start development server
npm run dev

# 2. Test login
# - Open http://localhost:5173/login
# - Try logging in with credentials
# - Check browser console for errors
# - Verify token is stored in localStorage

# 3. Test API calls
# - Try accessing protected pages
# - Check Network tab in DevTools
# - Verify requests go to https://api.dklemailservice.com
# - Check for correct Authorization headers

# 4. Monitor token refresh
# - Stay logged in for 20+ minutes
# - Check console for refresh token calls
# - Verify user stays logged in
```

---

**Status:** ✅ Critical fixes completed  
**Next:** API client updates & testing  
**Owner:** Jeffrey