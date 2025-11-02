# Steps Feature - Stappen Tracking Systeem

## Overzicht

Het Steps systeem is een volledig geïntegreerde feature voor het tracken van stappen en fondsenallocatie voor wandelevenementen. Deelnemers kunnen hun stappen bijwerken, voortgang volgen, en zien hoeveel fondsen er zijn toegewezen aan hun gekozen route.

## Architectuur

```
src/features/steps/
├── types.ts                    # TypeScript type definitions
├── hooks/
│   ├── useSteps.ts            # Main steps hook with data management
│   └── index.ts               # Hook exports
├── components/
│   ├── StatCard.tsx           # Reusable stat display card
│   ├── ProgressBar.tsx        # Progress bar component
│   ├── StepsTracker.tsx       # Main tracker component
│   └── index.ts               # Component exports
└── index.ts                   # Feature exports
```

## API Client

Het Steps systeem gebruikt de [`stepsClient`](../../../api/client/stepsClient.ts) voor alle backend communicatie:

```typescript
import { stepsClient } from '../api/client';

// User endpoints
await stepsClient.updateMySteps(1000);
await stepsClient.getMyDashboard();
await stepsClient.getTotalSteps();
await stepsClient.getFundsDistribution();

// Admin endpoints
await stepsClient.updateParticipantSteps(participantId, 500);
await stepsClient.getRouteFunds();
await stepsClient.createRouteFund('25 KM', 150);
```

## Componenten

### StepsTracker

Hoofd component voor stappen tracking met volledige functionaliteit:

```tsx
import { StepsTracker } from '../features/steps';

function ProfilePage() {
  return (
    <div>
      <h1>Profiel</h1>
      <StepsTracker />
    </div>
  );
}
```

**Features:**
- Persoonlijke stappen statistieken
- Toegewezen fondsen per route
- Totaal stappen van alle deelnemers
- Stappen toevoegen interface
- Voortgangs tracking
- Real-time updates
- Error handling
- Loading states

### StatCard

Herbruikbare card voor het tonen van statistieken:

```tsx
import { StatCard } from '../features/steps/components';

<StatCard
  icon="🚶"
  title="Jouw Stappen"
  value={stats.personalSteps.toLocaleString()}
  subtitle={`Route: ${dashboard.route}`}
/>
```

**Props:**
- `icon`: string - Emoji of icon character
- `title`: string - Card titel
- `value`: string | number - Hoofd waarde
- `subtitle?`: string - Optionele ondertitel
- `className?`: string - Extra CSS classes

### ProgressBar

Visuele voortgangsbalk component:

```tsx
import { ProgressBar } from '../features/steps/components';

<ProgressBar
  current={stats.personalSteps}
  goal={100000}
  label="Persoonlijk doel"
  showPercentage={true}
/>
```

**Props:**
- `current`: number - Huidige waarde
- `goal`: number - Doel waarde
- `label?`: string - Label tekst (default: 'Voortgang')
- `showPercentage?`: boolean - Toon percentage (default: true)
- `className?`: string - Extra CSS classes

## Hooks

### useSteps

Main hook voor steps functionaliteit:

```typescript
import { useSteps } from '../features/steps/hooks';

function MyComponent() {
  const {
    dashboard,        // ParticipantDashboard | null
    totalSteps,       // number
    fundsDistribution,// FundsDistribution | null
    stats,            // StepsStats | null
    loading,          // boolean
    error,            // string | null
    updateSteps,      // (deltaSteps: number) => Promise<void>
    refreshData       // () => Promise<void>
  } = useSteps();

  // Gebruik de data...
}
```

**Functionaliteit:**
- Automatisch dashboard data ophalen
- Totaal stappen tracking
- Fondsverdeling informatie
- Fout afhandeling
- Loading states
- Data refresh functie
- Optimistische updates

### useLiveTotalSteps

Hook voor auto-refreshing totaal stappen:

```typescript
import { useLiveTotalSteps } from '../features/steps/hooks';

function TotalStepsDisplay() {
  const { totalSteps, loading, error } = useLiveTotalSteps(30000); // Refresh elke 30s

  return (
    <div>
      <h3>Totaal Stappen</h3>
      <p>{totalSteps.toLocaleString()}</p>
    </div>
  );
}
```

**Parameters:**
- `refreshInterval`: number - Refresh interval in milliseconds (default: 30000)

**Returns:**
- `totalSteps`: number - Totaal aantal stappen
- `loading`: boolean - Loading state
- `error`: string | null - Error message

## Integraties

### Dashboard Page

Totaal stappen worden automatisch getoond in de [`OverviewTab`](../../features/dashboard/components/OverviewTab.tsx):

```tsx
import { useLiveTotalSteps } from '../../steps/hooks';

export function OverviewTab() {
  const { totalSteps, loading: stepsLoading } = useLiveTotalSteps(30000);
  
  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-700...">
      <h3>Totaal Gewand elde Stappen</h3>
      <p className="text-5xl">{totalSteps.toLocaleString('nl-NL')}</p>
    </div>
  );
}
```

### Profile Page

Volledige steps tracker is geïntegreerd in de [`ProfilePage`](../../pages/ProfilePage.tsx):

```tsx
import { StepsTracker } from '../features/steps';

export function ProfilePage() {
  return (
    <div>
      {/* Profiel formulier */}
      
      {/* Steps Tracking Section */}
      <div className="mt-6">
        <h2>Stappen Tracking</h2>
        <StepsTracker />
      </div>
    </div>
  );
}
```

## Types

### ParticipantDashboard

```typescript
interface ParticipantDashboard {
  steps: number;           // Aantal gewandelde stappen
  route: string;           // Gekozen route (bijv. "10 KM")
  allocatedFunds: number;  // Toegewezen fondsen in euro's
  naam: string;            // Naam deelnemer
  email: string;           // Email deelnemer
}
```

### StepsStats

```typescript
interface StepsStats {
  personalSteps: number;      // Persoonlijke stappen
  totalSteps: number;         // Totaal alle deelnemers
  personalGoal: number;       // Persoonlijk doel
  progressPercentage: number; // Voortgang percentage
}
```

### FundsDistribution

```typescript
interface FundsDistribution {
  totalX: number;                    // Totaal beschikbaar bedrag
  routes: Record<string, number>;    // Bedrag per route
}
```

## Permissies

Het Steps systeem gebruikt de volgende permissies:

| Permissie | Beschrijving | Endpoints |
|-----------|--------------|-----------|
| `steps:read` | Eigen dashboard bekijken | `GET /api/participant/dashboard` |
| `steps:write` | Eigen stappen bijwerken | `POST /api/steps` |
| `steps:read_total` | Totaal stappen zien | `GET /api/total-steps` |
| `steps:write` (admin) | Stappen van anderen bijwerken | `POST /api/steps/:id` |
| `steps:read` (admin) | Fondsverdeling beheren | `GET /api/funds-distribution` |

## Error Handling

Het systeem heeft uitgebreide error handling:

```typescript
const { error, refreshData } = useSteps();

if (error) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p>{error}</p>
      <button onClick={refreshData}>Opnieuw proberen</button>
    </div>
  );
}
```

**Error Types:**
- Network errors (geen internet)
- Authentication errors (ongeldig token)
- Validation errors (ongeldige input)
- Server errors (backend problemen)

## Best Practices

### 1. Optimistische Updates

```typescript
const handleAddSteps = async (steps: number) => {
  // Update UI direct
  setLocalSteps(prev => prev + steps);
  
  try {
    await updateSteps(steps);
  } catch (error) {
    // Rollback bij fout
    setLocalSteps(prev => prev - steps);
  }
};
```

### 2. Auto-refresh

```typescript
// Gebruik useLiveTotalSteps voor auto-refreshing data
const { totalSteps } = useLiveTotalSteps(30000); // Elke 30 seconden
```

### 3. Loading States

```typescript
const { loading } = useSteps();

if (loading) {
  return <LoadingGrid count={3} variant="compact" />;
}
```

### 4. Error Recovery

```typescript
const { error, refreshData } = useSteps();

useEffect(() => {
  if (error && error.includes('network')) {
    const timer = setTimeout(() => refreshData(), 5000);
    return () => clearTimeout(timer);
  }
}, [error, refreshData]);
```

## Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { StepsTracker } from '../StepsTracker';

test('displays steps data', async () => {
  render(<StepsTracker />);
  
  await waitFor(() => {
    expect(screen.getByText(/Jouw Stappen/i)).toBeInTheDocument();
  });
});
```

## Styling

Het Steps systeem gebruikt het gedeelde [`cc`](../../../styles/shared.ts) styling systeem:

```typescript
import { cc } from '../../../styles/shared';

<div className={cc.form.input()}>
  <input type="number" />
</div>
```

**Utility Classes:**
- `cc.button.base({ color: 'primary' })` - Buttons
- `cc.form.input()` - Form inputs
- `cc.form.error()` - Error messages
- `cc.spacing.section.md` - Section spacing
- `cc.grid.threeCol()` - Grid layouts

## Performance

**Optimalisaties:**
1. **Memoization**: Hooks gebruiken `useCallback` voor functie memoization
2. **Auto-refresh**: Configureerbaar interval per use case
3. **Lazy Loading**: Components worden alleen geladen wanneer nodig
4. **Error Boundaries**: Fouten worden gelokaliseerd en afgehandeld

## Toekomstige Features

- [ ] Websocket real-time updates
- [ ] Fitness tracker integraties (Strava, Garmin)
- [ ] Leaderboard
- [ ] Team/groep functionaliteit
- [ ] Export naar CSV/Excel
- [ ] Grafische voortgangsrapportages
- [ ] Push notificaties voor mijlpalen
- [ ] Social sharing features

## Support

Voor vragen of problemen:
- **Backend API**: Zie [Backend API documentatie](../../../../docs/BACKEND_API_REQUIREMENTS.md)
- **Type Definitions**: Zie [types.ts](./types.ts)
- **API Client**: Zie [stepsClient.ts](../../../api/client/stepsClient.ts)

## Changelog

### v1.0.0 (2025-01-15)
- ✅ Basis stappen tracking
- ✅ Dashboard integratie
- ✅ Profile page integratie
- ✅ Real-time totaal stappen counter
- ✅ Fondsverdeling display
- ✅ Error handling
- ✅ Loading states
- ✅ TypeScript types
- ✅ Responsive design
- ✅ Dark mode support