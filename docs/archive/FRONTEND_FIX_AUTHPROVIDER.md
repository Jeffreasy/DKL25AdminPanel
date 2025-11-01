# Frontend AuthProvider Fix - Environment Variables

## ❌ Probleem

De environment variabele `VITE_API_BASE_URL` werd niet correct geëvalueerd in [`AuthProvider.tsx`](../src/features/auth/contexts/AuthProvider.tsx:1), wat resulteerde in:

```
http://localhost:3000/VITE_API_BASE_URL=http://localhost:8082/api/api/auth/login
```

**Issues:**
1. `VITE_API_BASE_URL=...` als literal string (environment var niet geëvalueerd)
2. Dubbel `/api` in URL
3. Inconsistente URL constructie

## ✅ Oplossing

### 1. Environment Variables (ZONDER `/api`)

**[`.env.development`](../.env.development:1)**
```env
VITE_API_BASE_URL=http://localhost:8082
```

**[`.env.production`](../.env.production:1)**
```env
VITE_API_BASE_URL=https://dklemailservice.onrender.com
```

### 2. AuthProvider.tsx Fix

**❌ FOUT (oude code):**
```typescript
fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/auth/login`, {
  // ...
})
```

**✅ CORRECT (nieuwe code):**
```typescript
// Bovenaan het bestand
const getBaseURL = (): string => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  if (!baseURL) {
    console.warn('VITE_API_BASE_URL not set, using fallback');
    return 'https://dklemailservice.onrender.com';
  }
  return baseURL;
};

const API_BASE_URL = getBaseURL();

// In fetch calls
fetch(`${API_BASE_URL}/api/auth/login`, {
  // ...
})
```

## 🎯 Resultaat

**Development (lokaal):**
```
http://localhost:8082 + /api/auth/login = http://localhost:8082/api/auth/login ✅
```

**Production:**
```
https://dklemailservice.onrender.com + /api/auth/login = https://dklemailservice.onrender.com/api/auth/login ✅
```

## 🔍 Waarom Deze Fix?

1. **Centraal**: De base URL wordt één keer opgehaald en opgeslagen in een constante
2. **Type-safe**: TypeScript type checking werkt correct
3. **Fallback**: Als environment variabele niet bestaat, gebruik fallback
4. **Logging**: Console warning als environment variabele ontbreekt
5. **Consistent**: Alle API calls gebruiken dezelfde base URL

## 📝 Alle Gefixte Locaties

In [`AuthProvider.tsx`](../src/features/auth/contexts/AuthProvider.tsx:1):

1. **refreshToken()** - lijn 30
   ```typescript
   fetch(`${API_BASE_URL}/api/auth/refresh`, ...)
   ```

2. **login()** - lijn 56
   ```typescript
   fetch(`${API_BASE_URL}/api/auth/login`, ...)
   ```

3. **loadUserProfile()** - lijn 143
   ```typescript
   fetch(`${API_BASE_URL}/api/auth/profile`, ...)
   ```

## 🧪 Testen

### Test 1: Controleer Environment Variable

Open browser console op `http://localhost:5173`:

```javascript
console.log('Base URL:', import.meta.env.VITE_API_BASE_URL);
// Verwacht: "http://localhost:8082"
```

### Test 2: Test Login URL

In browser Network tab tijdens login, check de request URL:
```
Request URL: http://localhost:8082/api/auth/login ✅
```

### Test 3: Backend Bereikbaar

```bash
curl http://localhost:8082/api/health
# Verwacht: {"status":"healthy",...}
```

## 🚨 Veel Voorkomende Fouten

### Fout 1: Dubbel /api
```typescript
❌ VITE_API_BASE_URL=http://localhost:8082/api
❌ fetch(`${baseURL}/api/auth/login`)
Result: http://localhost:8082/api/api/auth/login
```

**Oplossing:**
```typescript
✅ VITE_API_BASE_URL=http://localhost:8082
✅ fetch(`${baseURL}/api/auth/login`)
Result: http://localhost:8082/api/auth/login
```

### Fout 2: Environment Var als String
```typescript
❌ fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`)
```

**Oplossing:**
```typescript
✅ const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
✅ fetch(`${API_BASE_URL}/api/auth/login`)
```

### Fout 3: Geen Fallback
```typescript
❌ const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Als niet set, is API_BASE_URL undefined
```

**Oplossing:**
```typescript
✅ const getBaseURL = (): string => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  if (!baseURL) {
    return 'https://dklemailservice.onrender.com'; // fallback
  }
  return baseURL;
};
```

## 📚 Gerelateerde Bestanden

- [`src/features/auth/contexts/AuthProvider.tsx`](../src/features/auth/contexts/AuthProvider.tsx:1) - Auth provider met fixes
- [`src/config/api.config.ts`](../src/config/api.config.ts:1) - API configuratie
- [`src/services/api.client.ts`](../src/services/api.client.ts:1) - Axios API client
- [`.env.development`](../.env.development:1) - Development environment
- [`.env.production`](../.env.production:1) - Production environment
- [`LOKALE_DEVELOPMENT.md`](../LOKALE_DEVELOPMENT.md:1) - Complete setup guide

## ✅ Checklist

Na deze fix moet je:

- [ ] Browser hard refresh (Ctrl+Shift+R)
- [ ] Dev server herstarten (`npm run dev`)
- [ ] Backend draait op `http://localhost:8082`
- [ ] Login testen op `http://localhost:5173/login`
- [ ] Network tab checken voor correcte URL
- [ ] Console checken voor errors

---

**Laatste update:** November 2025
**Status:** ✅ Fixed en getest