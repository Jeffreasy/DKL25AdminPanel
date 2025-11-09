# Backend Migratie Analyse & Actiepunten

**Datum:** 2025-01-08  
**Status:** 🔴 **KRITIEKE ACTIE VEREIST**  
**Admin Panel:** DKL25 React Admin Panel  
**Backend:** Go/Fiber API op Render.com

---

## 📊 Executive Summary

Na grondig onderzoek van de backend documentatie en vergelijking met de huidige frontend implementatie zijn er **KRITIEKE DISCREPANTIES** gevonden die onmiddellijk aangepakt moeten worden.

### Belangrijkste Bevindingen

| Categorie | Status | Prioriteit | Impact |
|-----------|--------|------------|--------|
| **API Base URL** | 🔴 Incorrect | CRITICAL | App werkt niet |
| **Authentication Endpoints** | 🔴 Mismatch | CRITICAL | Login faalt |
| **Token Refresh** | 🔴 Missing | CRITICAL | Users uitgelogd |
| **WebSocket URLs** | 🔴 Incorrect | HIGH | Real-time broken |
| **Response Formats** | 🟡 Inconsistent | HIGH | Parsing errors |
| **RBAC Integration** | 🟡 Incomplete | MEDIUM | Permissions falen |

---

## 🚨 KRITIEKE PROBLEMEN

### 1. API Base URL - FOUT

**❌ Huidig:** [`src/config/api.config.ts:26`](../src/config/api.config.ts:26)
```typescript
return 'https://dklemailservice.onrender.com';
```

**✅ Moet zijn:** (volgens [`docs/backend Docs/api/README.md:9-14`](./backend Docs/api/README.md:9-14))
```typescript
return 'https://api.dklemailservice.com';
```

**Impact:** Alle API calls falen met 404/CORS errors

---

### 2. Login Endpoint - FOUT

**❌ Huidig:** [`src/api/client/auth.ts:54`](../src/api/client/auth.ts:54)
```typescript
const response = await fetch(`${API_BASE}/auth/login`, {
  body: JSON.stringify({
    email,
    wachtwoord: password  // Wrong field name!
  }),
```

**✅ Moet zijn:** (volgens [`docs/backend Docs/api/AUTHENTICATION.md:56`](./backend Docs/api/AUTHENTICATION.md:56))
```typescript
const response = await fetch(`${API_BASE}/api/auth/login`, {  // Add /api
  body: JSON.stringify({
    email,
    password: password  // Correct field name
  }),
```

**Impact:** Login werkt niet, app onbruikbaar

---

### 3. Token Refresh - ONTBREEKT

**❌ Huidig:** [`src/api/client/auth.ts:95-103`](../src/api/client/auth.ts:95-103)
```typescript
private async refreshToken() {
  try {
    // For now, we'll logout if token needs refresh
    this.logout();  // ❌ WRONG!
  }
}
```

**✅ Moet zijn:** (volgens [`docs/backend Docs/api/AUTHENTICATION.md:98-125`](./backend Docs/api/AUTHENTICATION.md:98-125))
```typescript
private async refreshToken() {
  const refreshToken = TokenManager.getRefreshToken();
  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  const { access_token, refresh_token } = await response.json();
  TokenManager.setTokens(access_token, refresh_token);
  this.scheduleRefresh();
}
```

**Impact:** Users uitgelogd na 24u, geen seamless experience

---

### 4. WebSocket URLs - FOUT

**❌ Huidig:** [`src/config/api.config.ts:38`](../src/config/api.config.ts:38)
```typescript
return 'wss://dklemailservice.onrender.com/api/chat/ws';
// Chat-specific URL als fallback voor alles!
```

**✅ Moet zijn:** (volgens [`docs/backend Docs/api/README.md:173-175`](./backend Docs/api/README.md:173-175))
```
Steps:   ws://localhost:8080/ws/steps
Notulen: ws://localhost:8080/api/ws/notulen
Chat:    ws://localhost:8080/api/chat/ws/:channel_id
```

**Impact:** Steps en Notulen WebSocket connecties falen

---

### 5. Response Format Mismatch

**Backend stuurt:** (volgens [`docs/backend Docs/api/README.md:85-107`](./backend Docs/api/README.md:85-107))
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Optional"
}
```

**Errors:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* optional */ }
}
```

**Impact:** Response parsing moet aangepast worden

---

## 📋 Concrete Actiepunten

### FASE 1: KRITIEKE FIXES (DOE NU!)

#### 1.1 Fix API Base URL
```typescript
// src/config/api.config.ts
const getAPIBaseURL = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return 'https://api.dklemailservice.com'; // ✅ CORRECT
};
```

#### 1.2 Fix Login Endpoint
```typescript
// src/api/client/auth.ts
async login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }), // ✅ CORRECT
  });
  // ... rest of implementation
}
```

#### 1.3 Implement Token Refresh
```typescript
// src/features/auth/utils/tokenRefresh.ts
export class TokenRefreshManager {
  private refreshTimeout: NodeJS.Timeout | null = null;

  startAutoRefresh() {
    // Refresh 5 minutes before expiry (24h - 5min = 23h55min)
    const refreshIn = (23 * 60 * 60 + 55 * 60) * 1000;
    this.refreshTimeout = setTimeout(() => this.refreshToken(), refreshIn);
  }

  async refreshToken(): Promise<void> {
    const { refreshToken } = TokenManager.getTokens();
    
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();
    TokenManager.setTokens(data.data.access_token, data.data.refresh_token);
    this.startAutoRefresh(); // Schedule next refresh
  }
}
```

#### 1.4 Fix WebSocket Configuration
```typescript
// src/config/websocket.config.ts
export const wsConfig = {
  getBaseURL(): string {
    const isSecure = apiConfig.baseURL.startsWith('https');
    const protocol = isSecure ? 'wss' : 'ws';
    const url = apiConfig.baseURL.replace(/^https?:\/\//, '');
    return `${protocol}://${url}`;
  },
  
  steps: (token: string) => 
    `${wsConfig.getBaseURL()}/ws/steps?token=${token}`,
  
  notulen: (token: string) => 
    `${wsConfig.getBaseURL()}/api/ws/notulen?token=${token}`,
  
  chat: (channelId: string, token: string) => 
    `${wsConfig.getBaseURL()}/api/chat/ws/${channelId}?token=${token}`,
};
```

#### 1.5 Update Error Handling
```typescript
// src/utils/apiErrorParser.ts
interface BackendError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export function parseApiError(error: unknown): string {
  if (error?.response?.data) {
    const data = error.response.data as BackendError;
    return data.error || 'An error occurred';
  }
  return 'Network error';
}
```

---

### FASE 2: API CLIENTS (Week 1-2)

#### Checklist API Clients
- [ ] Fix `src/api/client/auth.ts` - Add `/api` prefix to all endpoints
- [ ] Fix `src/api/client/rbacClient.ts` - Verify permission endpoints
- [ ] Fix `src/api/client/userClient.ts` - Verify CRUD endpoints
- [ ] Fix `src/api/client/emailClient.ts` - Verify mail management
- [ ] Fix `src/api/client/stepsClient.ts` - Add leaderboard/achievements
- [ ] Fix `src/api/client/notulenClient.ts` - Verify finalize endpoint
- [ ] Fix `src/api/client/albumClient.ts` - Verify Cloudinary integration
- [ ] Fix `src/api/client/videoClient.ts` - YouTube integration
- [ ] Fix `src/api/client/partnerClient.ts` - Logo upload
- [ ] Fix `src/api/client/sponsorClient.ts` - Multipart upload
- [ ] Create `src/api/client/eventClient.ts` - NEW (events CRUD)
- [ ] Create `src/api/client/notificationClient.ts` - NEW (notifications + SSE)
- [ ] Update `src/api/client/registrationClient.ts` - Status management

---

### FASE 3: WEBSOCKET (Week 2)

#### Steps WebSocket
- [ ] Update connection URL van `/ws/steps`
- [ ] Verify message types
- [ ] Add automatic reconnection
- [ ] Test real-time updates

#### Notulen WebSocket  
- [ ] Update connection URL naar `/api/ws/notulen`
- [ ] Handle version updates
- [ ] Test collaborative editing

#### Nieuwe WebSocket Clients
- [ ] Chat WebSocket (`/api/chat/ws/:channel_id`) - NEW
- [ ] Notifications SSE (`/api/notifications/sse`) - NEW

---

### FASE 4: RBAC (Week 2-3)

#### Permission System
- [ ] Create `usePermissions()` hook
- [ ] Create `<PermissionGuard>` component
- [ ] Implement permission caching
- [ ] Add UI permission checks voor:
  - [ ] Protected routes
  - [ ] Action buttons (edit/delete/create)
  - [ ] Menu items
  - [ ] Form fields

---

### FASE 5: NIEUWE FEATURES (Week 3-4)

#### Gamification (Backend heeft dit al!)
- [ ] Achievements UI
- [ ] Badges display (Bronze/Silver/Gold/Platinum)
- [ ] Leaderboards (daily/weekly/monthly)
- [ ] Real-time step updates

#### Event Management
- [ ] Event CRUD interface
- [ ] Registration management
- [ ] Geofencing visualization
- [ ] Event statistics

#### Notifications
- [ ] Notification center UI
- [ ] Real-time via SSE
- [ ] Mark read/unread
- [ ] Notification preferences

---

## 🔧 Environment Variabelen

### Update `.env`
```env
# API Configuration
VITE_API_BASE_URL=https://api.dklemailservice.com
VITE_WS_BASE_URL=wss://api.dklemailservice.com

# Development
# VITE_API_BASE_URL=http://localhost:8080
# VITE_WS_BASE_URL=ws://localhost:8080

# JWT
VITE_JWT_SECRET=your_secret_key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

---

## 📚 Backend Documentatie Referenties

### Belangrijkste Documenten
1. **[API Quick Reference](./backend Docs/api/QUICK_REFERENCE.md)** ⭐ - ALLE 100+ endpoints
2. **[Authentication](./backend Docs/api/AUTHENTICATION.md)** - Login, tokens, RBAC
3. **[Frontend Integration Guide](./backend Docs/guides/FRONTEND_INTEGRATION.md)** - Complete voorbeelden
4. **[WebSocket API](./backend Docs/api/WEBSOCKET.md)** - Real-time connecties
5. **[Permissions/RBAC](./backend Docs/api/PERMISSIONS.md)** - Permission systeem
6. **[Events](./backend Docs/api/EVENTS.md)** - Event management + geofencing
7. **[Steps/Gamification](./backend Docs/api/STEPS_GAMIFICATION.md)** - Achievements, badges, leaderboards
8. **[CMS](./backend Docs/api/CMS.md)** - Videos, partners, sponsors, albums
9. **[Notifications](./backend Docs/api/NOTIFICATIONS.md)** - User notifications + SSE

### Backend API Overzicht
- **100+ endpoints** volledig gedocumenteerd
- **30+ database tables** beschreven
- **3 WebSocket endpoints** (Steps, Notulen, Chat)
- **JWT + RBAC** authentication
- **Real-time updates** via WebSocket & SSE

---

## ✅ Success Criteria

### Fase 1 Compleet
- ✅ Users kunnen inloggen
- ✅ API calls werken
- ✅ Token refresh automatisch
- ✅ Errors correct afgehandeld

### Alle Fases Compleet
- ✅ Alle features werken
- ✅ Real-time updates werken
- ✅ RBAC volledig geïntegreerd
- ✅ Tests passeren (>80% coverage)
- ✅ Performance targets gehaald

---

## 🎯 Prioriteiten

### DO NOW (Kritiek!)
1. Fix API base URL
2. Fix login endpoint
3. Implement token refresh
4. Fix WebSocket URLs

### DO NEXT (High Priority)
5. Update all API clients
6. Implement error handling
7. Add RBAC integration
8. Test everything

### DO LATER (Medium Priority)
9. Integrate new features
10. Add missing UI components
11. Optimize performance
12. Write documentation

---

## 📞 Support

- **Backend Docs:** `docs/backend Docs/`
- **Frontend Team:** Jeffrey
- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Test:** `npm test`

---

**Last Updated:** 2025-01-08  
**Next Review:** TBD  
**Owner:** Jeffrey