# Lokale Development Setup

Deze guide helpt je om lokaal te ontwikkelen met de DKL Admin Panel zonder de productie configuratie te verliezen.

## 🎯 Quick Start

### 1. Controleer Environment Files

Je hebt nu **drie** environment files:

- **`.env.development`** → Wijst naar LOKALE backend (`http://localhost:8082`)
- **`.env.production`** → Wijst naar PRODUCTIE backend (`https://dklemailservice.onrender.com`)
- **`.env.example`** → Template voor nieuwe installaties

### 2. Start Backend Lokaal (Docker)

In de **backend directory** (`dklemailservice`):

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Dit start:
- PostgreSQL op `localhost:5433`
- Redis op `localhost:6380`
- Backend API op `http://localhost:8082`

### 3. Verifieer Backend

```bash
# Test health endpoint
curl http://localhost:8082/api/health

# Verwacht: {"status":"healthy",...}
```

### 4. Start Frontend

```bash
# In deze directory (DKL25AdminPanel)
npm run dev
```

Frontend draait nu op `http://localhost:5173` en gebruikt **automatisch** de lokale backend via [`.env.development`](.env.development:1).

## 🔄 Switchen tussen Lokaal en Productie

### Development Mode (Lokaal)

```bash
npm run dev
```

✅ Gebruikt [`.env.development`](.env.development:1)
✅ Backend: `http://localhost:8082/api`
✅ WebSocket: `ws://localhost:8082/api/chat/ws`

### Production Build

```bash
npm run build
```

✅ Gebruikt [`.env.production`](.env.production:1)
✅ Backend: `https://dklemailservice.onrender.com/api`
✅ WebSocket: `wss://dklemailservice.onrender.com/api/chat/ws`

### Preview Production Build Lokaal

```bash
npm run build
npm run preview
```

Dit bouwt in production mode maar draait lokaal voor testing.

## 📁 Nieuwe Bestanden

### [`src/config/api.config.ts`](src/config/api.config.ts:1)

Centraal configuratie bestand dat **automatisch** switcht tussen lokaal en productie:

```typescript
import { apiConfig, isDevelopment } from './config/api.config';

console.log('API Base URL:', apiConfig.baseURL);
// Development: http://localhost:8082/api
// Production:  https://dklemailservice.onrender.com/api
```

### [`src/services/api.client.ts`](src/services/api.client.ts:1)

Complete API client met alle endpoints:

```typescript
import { api } from './services/api.client';

// Login
const response = await api.auth.login('email@example.com', 'password');

// Get contacts
const contacts = await api.contacts.list();

// Create album
await api.albums.create({ title: 'Nieuw Album', visible: true });
```

## 🔧 Configuratie Details

### Environment Variabelen

| Variabele | Development | Production |
|-----------|------------|------------|
| `VITE_API_BASE_URL` | `http://localhost:8082/api` | `https://dklemailservice.onrender.com/api` |
| `VITE_WS_URL` | `ws://localhost:8082/api/chat/ws` | `wss://dklemailservice.onrender.com/api/chat/ws` |
| `VITE_ENV` | `development` | `production` |
| `VITE_APP_URL` | `http://localhost:5173` | `https://admin.dekoninklijkeloop.nl` |

### API Client Features

- ✅ **JWT Authenticatie**: Automatisch token toevoegen aan requests
- ✅ **Error Handling**: Vriendelijke error messages in Nederlands
- ✅ **Auto Logout**: Bij 401 errors automatisch uitloggen
- ✅ **Type Safety**: TypeScript types voor alle API calls
- ✅ **Environment Aware**: Automatisch switchen tussen dev/prod

## 📡 Backend API Endpoints

### Publiek (geen auth)

```typescript
// Health check
await api.health();

// Login
await api.auth.login(email, password);

// Publieke albums
await api.albums.listPublic();
```

### Admin (JWT vereist)

```typescript
// Contact formulieren
await api.contacts.list();
await api.contacts.getById(id);
await api.contacts.addReply(id, message);

// Aanmeldingen
await api.registrations.list();
await api.registrations.filterByRole('vrijwilliger');

// Albums beheer
await api.albums.listAll();
await api.albums.create(data);
await api.albums.update(id, data);

// Foto's
await api.photos.listAll();
await api.photos.create(data);

// Videos
await api.videos.listAll();
await api.videos.create(data);

// Sponsors
await api.sponsors.listAll();
await api.sponsors.create(data);

// Steps tracking
await api.steps.updateSteps(participantId, steps);
await api.steps.getParticipantDashboard(participantId);

// Gebruikersbeheer
await api.users.list();
await api.users.assignRole(userId, roleId);

// Newsletter
await api.newsletter.list();
await api.newsletter.send(id);
```

## 🐛 Troubleshooting

### Backend draait niet

```bash
# Check status
docker-compose -f docker-compose.dev.yml ps

# Start backend
docker-compose -f docker-compose.dev.yml up -d

# Check logs
docker-compose -f docker-compose.dev.yml logs -f app
```

### CORS Errors

De backend is al geconfigureerd voor:
- `http://localhost:3000` ✓
- `http://localhost:5173` ✓

Als je een andere poort gebruikt, voeg deze toe in de backend `.env`.

### Connection Refused

```bash
# Is backend actief?
curl http://localhost:8082/api/health

# Zo niet, start backend:
docker-compose -f docker-compose.dev.yml up -d
```

### 401 Unauthorized

```bash
# Check token in browser console
console.log(localStorage.getItem('auth_token'))

# Test login direct
const response = await fetch('http://localhost:8082/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@dekoninklijkeloop.nl',
    password: 'your_password'
  })
});
```

### Verkeerde API URL

```bash
# Check welke env file gebruikt wordt
console.log(import.meta.env.VITE_API_BASE_URL)
console.log(import.meta.env.MODE) // development of production
```

## ✅ Verifieer Setup

### Test 1: Backend Health

```bash
curl http://localhost:8082/api/health
# Verwacht: {"status":"healthy",...}
```

### Test 2: Frontend Verbinding

Open browser console op `http://localhost:5173` en run:

```javascript
// Check API config
console.log(window.location.href); // http://localhost:5173
console.log(import.meta.env.VITE_API_BASE_URL); // http://localhost:8082/api

// Test API call
fetch('http://localhost:8082/api/health')
  .then(r => r.json())
  .then(data => console.log('Backend response:', data));
```

### Test 3: Login Test

```javascript
// In browser console
const response = await fetch('http://localhost:8082/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@dekoninklijkeloop.nl',
    password: 'your_password'
  })
});

const data = await response.json();
console.log('Login response:', data);
// Moet token bevatten
```

## 📚 Extra Resources

- **Complete API Docs**: [`Backendinfo/FRONTEND_LOCAL_DEVELOPMENT.md`](Backendinfo/FRONTEND_LOCAL_DEVELOPMENT.md:1)
- **Quick Reference**: [`Backendinfo/FRONTEND_SETUP_QUICK.md`](Backendinfo/FRONTEND_SETUP_QUICK.md:1)
- **API Client Example**: [`Backendinfo/frontend-api-client-example.ts`](Backendinfo/frontend-api-client-example.ts:1)

## 💡 Tips

1. **Browser DevTools**: Check Network tab voor API calls
2. **React DevTools**: Inspect component state en props
3. **Backend Logs**: `docker-compose -f docker-compose.dev.yml logs -f app`
4. **Database Access**: `docker exec -it dkl-postgres psql -U postgres -d dklemailservice`

## 🚀 Development Workflow

```bash
# 1. Start backend (eenmalig bij opstart)
cd ../dklemailservice
docker-compose -f docker-compose.dev.yml up -d

# 2. Verifieer backend
curl http://localhost:8082/api/health

# 3. Start frontend (in deze directory)
cd ../DKL25AdminPanel
npm run dev

# 4. Open browser: http://localhost:5173

# 5. Develop & test...

# 6. Stop alles (aan het eind van de dag)
cd ../dklemailservice
docker-compose -f docker-compose.dev.yml down
```

## ⚠️ Belangrijk

- **NOOIT** `.env.development` of `.env.production` committen naar Git (staan in [`.gitignore`](.gitignore:1))
- **WEL** [`.env.example`](.env.example:1) committen voor documentatie
- Vul echte credentials in `.env.development` en `.env.production` voor gebruik
- Test grondig lokaal voordat je naar productie pushed

## 🔐 Security

- **Development**: HTTP toegestaan, zwakke secrets OK
- **Production**: HTTPS vereist, sterke secrets verplicht
- Tokens worden automatisch opgeslagen in `localStorage`
- Bij 401 errors wordt automatisch uitgelogd en geredirect naar login

---

**Laatste update**: November 2025
**Status**: ✅ Setup compleet - Ready for development!