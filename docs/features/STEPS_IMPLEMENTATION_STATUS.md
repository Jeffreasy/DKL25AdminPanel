
# Steps Feature - Implementation Status

## ✅ Frontend Implementatie Compleet

Alle frontend code is volledig geïmplementeerd volgens de Steps API documentatie en het design system.

## 📊 Status Overzicht

| Component | Status | Bestand |
|-----------|--------|---------|
| **Types** | ✅ Compleet | [`src/features/steps/types.ts`](../../src/features/steps/types.ts) |
| **API Client** | ✅ Compleet | [`src/api/client/stepsClient.ts`](../../src/api/client/stepsClient.ts) |
| **Hooks** | ✅ Compleet | [`src/features/steps/hooks/useSteps.ts`](../../src/features/steps/hooks/useSteps.ts) |
| **User Components** | ✅ Compleet | [`src/features/steps/components/`](../../src/features/steps/components/) |
| **Admin Components** | ✅ Compleet | [`src/features/steps/components/admin/`](../../src/features/steps/components/admin/) |
| **Dashboard Integratie** | ✅ Compleet | [`src/features/dashboard/components/OverviewTab.tsx`](../../src/features/dashboard/components/OverviewTab.tsx) |
| **Profile Integratie** | ✅ Compleet | [`src/pages/ProfilePage.tsx`](../../src/pages/ProfilePage.tsx) |
| **Admin Panel** | ✅ Compleet | [`src/pages/StepsAdminPage.tsx`](../../src/pages/StepsAdminPage.tsx) |
| **Routing** | ✅ Compleet | [`src/App.tsx`](../../src/App.tsx) |
| **Documentation** | ✅ Compleet | [`src/features/steps/README.md`](../../src/features/steps/README.md) |

## ⚠️ Backend API Vereist

De frontend is **volledig functioneel** en wacht op de backend API implementatie. De volgende endpoints moeten door de backend worden geïmplementeerd:

### Vereiste Backend Endpoints

#### 1. User Endpoints (Participant)

```http
POST /api/steps
Authorization: Bearer {token}
Content-Type: application/json
Body: { "steps": 1000 }
Response: Participant object met updated steps
```

```http
GET /api/participant/dashboard
Authorization: Bearer {token}
Response: {
  "steps": 5000,
  "route": "10 KM",
  "allocatedFunds": 75,
  "naam": "Jan Jansen",
  "email": "jan@example.com"
}
```

```http
GET /api/total-steps?year=2025
Authorization: Bearer {token}
Response: { "total_steps": 125000 }
```

```http
GET /api/funds-distribution
Authorization: Bearer {token}
Response: {
  "totalX": 10000,
  "routes": {
    "6 KM": 2500,
    "10 KM": 2500,
    "15 KM": 2500,
    "20 KM": 2500
  }
}
```

#### 2. Admin Endpoints

```http
POST /api/steps/{participant_id}
Authorization: Bearer {admin_token}
Content-Type: application/json
Body: { "steps": 1000 }
Response: Participant object
```

```http
GET /api/participant/{participant_id}/dashboard
Authorization: Bearer {admin_token}
Response: ParticipantDashboard object
```

```http
GET /api/steps/admin/route-funds
Authorization: Bearer {admin_token}
Response: Array of RouteFund objects
```

```http
POST /api/steps/admin/route-funds
Authorization: Bearer {admin_token}
Content-Type: application/json
Body: { "route": "25 KM", "amount": 150 }
Response: Created RouteFund object
```

```http
PUT /api/steps/admin/route-funds/{route}
Authorization: Bearer {admin_token}
Content-Type: application/json
Body: { "amount": 100 }
Response: Updated RouteFund object
```

```http
DELETE /api/steps/admin/route-funds/{route}
Authorization: Bearer {admin_token}
Response: { "success": true, "message": "..." }
```

#### 3. Database Schema Vereist

**Aanmeldingen tabel** moet `steps` kolom hebben:
```sql
ALTER TABLE aanmeldingen ADD COLUMN steps INTEGER DEFAULT 0;
CREATE INDEX idx_aanmeldingen_gebruiker_id ON aanmeldingen(gebruiker_id);
```

**Route Funds tabel** aanmaken:
```sql
CREATE TABLE route_funds (
  id UUID