# 🚨 QUICK FIX - Environment Variables Not Loading

## Probleem
```
POST http://localhost:3000/VITE_API_BASE_URL=http://localhost:8082/api/api/auth/login 404
```

De environment variabele wordt als literal string gebruikt in plaats van de waarde.

## ✅ Oplossing in 3 Stappen

### Stap 1: Stop Development Server
```bash
# Druk Ctrl+C in je terminal om de server te stoppen
```

### Stap 2: Herstart Development Server
```bash
npm run dev
```

**BELANGRIJK:** Vite laadt `.env` files alleen bij **opstart**. Wijzigingen in `.env` files vereisen een herstart!

### Stap 3: Verifieer de Fix

Open browser console op `http://localhost:5173`:

```javascript
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
// ✅ Moet zijn: "http://localhost:8082"
// ❌ NIET: undefined of "VITE_API_BASE_URL=http://localhost:8082"
```

## 🔍 Extra Verificatie

### Check 1: Environment Variabele

In je code (bijv. in console):
```javascript
console.log('All env vars:', import.meta.env);
```

Je moet zien:
```javascript
{
  VITE_API_BASE_URL: "http://localhost:8082",
  VITE_WS_URL: "ws://localhost:8082/api/chat/ws",
  VITE_ENV: "development",
  // ...
}
```

### Check 2: Login URL

Open Developer Tools → Network tab en test login.

**✅ Correcte URL:**
```
POST http://localhost:8082/api/auth/login
```

**❌ Foute URL:**
```
POST http://localhost:3000/VITE_API_BASE_URL=http://localhost:8082/api/api/auth/login
```

## 🛠️ Als Het Nog Steeds Niet Werkt

### Optie 1: Hard Refresh Browser

```
Chrome/Edge: Ctrl + Shift + R
Firefox: Ctrl + F5
```

### Optie 2: Clear Cache en Herstart

```bash
# Stop server
Ctrl+C

# Clear node_modules cache (optioneel)
rm -rf node_modules/.vite

# Herstart
npm run dev
```

### Optie 3: Controleer .env.development Bestand

Open [`.env.development`](.env.development:1) en controleer:

```env
# ✅ CORRECT
VITE_API_BASE_URL=http://localhost:8082

# ❌ FOUT
VITE_API_BASE_URL=http://localhost:8082/api
```

### Optie 4: Controleer of Backend Draait

```bash
curl http://localhost:8082/api/health

# ✅ Moet returneren:
{"status":"healthy","timestamp":"..."}

# ❌ Als error:
# Start backend: docker-compose -f docker-compose.dev.yml up -d
```

## 🎯 Verwachte Resultaat

Na herstart moet login werken:

1. **URL**: `http://localhost:8082/api/auth/login` ✅
2. **Response**: `{token: "...", user: {...}}` ✅
3. **Console**: Geen "VITE_API_BASE_URL=" in URL ✅

## 📝 Belangrijke Opmerkingen

- **Vite laadt .env files ALLEEN bij opstart**
- **Browser cache kan oude code hebben**  
- **AuthProvider moet API_BASE_URL constant gebruiken**
- **Base URL is ZONDER /api** (wordt toegevoegd in code)

## 🔗 Gerelateerde Documentatie

- [`docs/FRONTEND_FIX_AUTHPROVIDER.md`](docs/FRONTEND_FIX_AUTHPROVIDER.md:1) - Complete fix documentatie
- [`LOKALE_DEVELOPMENT.md`](LOKALE_DEVELOPMENT.md:1) - Setup guide
- [`.env.development`](.env.development:1) - Development environment
- [`src/features/auth/contexts/AuthProvider.tsx`](src/features/auth/contexts/AuthProvider.tsx:1) - Auth provider

---

**Als het probleem aanhoudt:** Check of [`AuthProvider.tsx`](src/features/auth/contexts/AuthProvider.tsx:1) de `API_BASE_URL` constant gebruikt (regel 6-15).