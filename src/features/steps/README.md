# Steps Feature

De Steps feature biedt een complete oplossing voor het tracken van stappen van deelnemers, inclusief real-time updates via WebSocket, REST API integratie, en een admin interface.

## Structuur

```
src/features/steps/
├── components/          # UI componenten
│   ├── admin/          # Admin-specifieke componenten
│   │   ├── ParticipantStepsEditor.tsx
│   │   └── RouteFundsManager.tsx
│   ├── ProgressBar.tsx
│   ├── StatCard.tsx
│   └── StepsTracker.tsx
├── hooks/              # React hooks
│   ├── useSteps.ts             # REST API hook
│   └── useStepsWebSocket.ts    # WebSocket hook
├── services/           # Business logic
│   └── StepsWebSocketClient.ts # WebSocket client
├── types.ts            # TypeScript definities
├── index.ts            # Public exports
└── README.md           # Deze file
```

## REST API Gebruik

### useSteps Hook

Voor standaard REST API interacties:

```tsx
import { useSteps } from '@/features/steps';

function MyComponent() {
  const {
    dashboard,       // ParticipantDashboard | null
    totalSteps,      // number
    fundsDistribution, // FundsDistribution | null
    stats,           // StepsStats | null
    loading,         // boolean
    error,           // string | null
    updateSteps,     // (delta: number) => Promise<void>
    refreshData,     // () => Promise<void>
  } = useSteps();

  return (
    <div>
      <p>Mijn stappen: {dashboard?.steps || 0}</p>
      <button onClick={() => updateSteps(100)}>+100 stappen</button>
    </div>
  );
}
```

### useLiveTotalSteps Hook

Voor live updates van totale stappen (polling):

```tsx
import { useLiveTotalSteps } from '@/features/steps';

function TotalStepsDisplay() {
  const { totalSteps, loading, error } = useLiveTotalSteps(30000); // 30 sec interval
  
  return <p>Totaal: {totalSteps.toLocaleString()}</p>;
}
```

## WebSocket Gebruik

### useStepsWebSocket Hook

Voor real-time updates via WebSocket:

```tsx
import { useStepsWebSocket } from '@/features/steps';

function Dashboard() {
  const {
    connected,          // boolean
    connectionState,    // ConnectionState
    latestUpdate,       // StepUpdateMessage | null
    totalSteps,         // number
    leaderboard,        // LeaderboardUpdateMessage | null
    latestBadge,        // BadgeEarnedMessage | null
    subscribe,          // (channels: string[]) => void
    unsubscribe,        // (channels: string[]) => void
    reconnect,          // () => void
    disconnect,         // () => void
  } = useStepsWebSocket('user-123', 'participant-456', {
    debug: true,
    reconnectInterval: 1000,
  });

  useEffect(() => {
    if (connected) {
      subscribe(['step_updates', 'leaderboard_updates']);
    }
  }, [connected, subscribe]);

  return (
    <div>
      <p>Status: {connectionState}</p>
      <p>Stappen: {latestUpdate?.steps || 0}</p>
    </div>
  );
}
```

### Specialized Hooks

#### useParticipantDashboard

Auto-subscribed op participant relevante channels:

```tsx
import { useParticipantDashboard } from '@/features/steps';

function ParticipantView() {
  const dashboard = useParticipantDashboard(userId, participantId);
  // Auto-subscribed: step_updates, badge_earned
}
```

#### useLeaderboard

Voor publieke leaderboard views:

```tsx
import { useLeaderboard } from '@/features/steps';

function PublicLeaderboard() {
  const { leaderboard, totalSteps, connected } = useLeaderboard();
  // Auto-subscribed: total_updates, leaderboard_updates
}
```

#### useStepsMonitoring

Voor admin monitoring (alle channels):

```tsx
import { useStepsMonitoring } from '@/features/steps';

function AdminMonitor() {
  const monitoring = useStepsMonitoring(adminUserId);
  // Auto-subscribed: alle channels
}
```

## Components

### StepsTracker

Display van persoonlijke steps met progress indicator:

```tsx
import { StepsTracker } from '@/features/steps';

<StepsTracker 
  currentSteps={5000}
  goalSteps={10000}
  route="10 KM"
/>
```

### ProgressBar

Herbruikbare progress bar:

```tsx
import { ProgressBar } from '@/features/steps';

<ProgressBar 
  progress={75}
  label="75% van doel"
  color="blue"
/>
```

### StatCard

Card voor het weergeven van statistieken:

```tsx
import { StatCard } from '@/features/steps';

<StatCard
  title="Totaal Stappen"
  value="15,234"
  icon={<StepsIcon />}
  trend="+12%"
/>
```

### Admin Components

#### RouteFundsManager

Admin interface voor het beheren van route fondsen:

```tsx
import { RouteFundsManager } from '@/features/steps/components/admin';

<RouteFundsManager />
```

#### ParticipantStepsEditor

Admin interface voor het bewerken van deelnemer stappen:

```tsx
import { ParticipantStepsEditor } from '@/features/steps/components/admin';

<ParticipantStepsEditor />
```

## Types

### REST API Types

```typescript
interface Participant {
  id: string;
  naam: string;
  email: string;
  steps: number;
  // ... meer fields
}

interface ParticipantDashboard {
  steps: number;
  route: string;
  allocatedFunds: number;
  naam: string;
  email: string;
}

interface RouteFund {
  id: string;
  route: string;
  amount: number;
  created_at: string;
  updated_at: string;
}
```

### WebSocket Types

```typescript
interface WebSocketStepUpdate {
  type: 'step_update';
  participant_id: string;
  naam: string;
  steps: number;
  delta: number;
  route: string;
  allocated_funds: number;
  timestamp: number;
}

interface WebSocketLeaderboardUpdate {
  type: 'leaderboard_update';
  top_n: number;
  entries: WebSocketLeaderboardEntry[];
  timestamp: number;
}

enum WebSocketConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  FAILED = 'FAILED',
}
```

## Configuration

### WebSocket Config

```typescript
interface WebSocketConfig {
  reconnectInterval?: number;      // Default: 1000ms
  maxReconnectInterval?: number;   // Default: 30000ms
  reconnectDecay?: number;          // Default: 1.5
  maxReconnectAttempts?: number;   // Default: Infinity
  pingInterval?: number;            // Default: 30000ms
  debug?: boolean;                  // Default: false
}
```

## API Client

De REST API client is beschikbaar via:

```typescript
import { stepsClient } from '@/api/client/stepsClient';

// User endpoints
await stepsClient.updateMySteps(100);
await stepsClient.getMyDashboard();

// Public endpoints
await stepsClient.getTotalSteps(2025);
await stepsClient.getFundsDistribution();

// Admin endpoints
await stepsClient.updateParticipantSteps('participant-id', 100);
await stepsClient.getRouteFunds();
await stepsClient.createRouteFund('6 KM', 500);
```

## Voorbeelden

Zie `docs/examples/` voor complete werkende voorbeelden:

- **StepsWebSocketDashboard.tsx** - Volledig dashboard met alle features
- **README.md** - Gedetailleerde uitleg en meer voorbeelden

## Testing

```bash
# Run tests
npm test src/features/steps

# Run with coverage
npm test -- --coverage src/features/steps
```

## Best Practices

1. **Gebruik WebSocket voor real-time updates**: Polling vermijden waar mogelijk
2. **Handle connection states**: Toon feedback aan gebruiker over verbindingsstatus
3. **Auto-reconnect**: De WebSocket client doet dit automatisch
4. **Cleanup**: De hooks cleanen automatisch op bij unmount
5. **Error handling**: Altijd error states afhandelen
6. **Debounce user input**: Bij manual step updates

## Troubleshooting

### WebSocket issues
- Check browser console met `debug: true`
- Verify backend WebSocket server is running
- Check authentication token validity

### Updates not showing
- Verify you're subscribed to correct channels
- Check connection state is CONNECTED
- Ensure backend is sending messages correctly

### Performance
- Use specialized hooks (useLeaderboard, etc.) waar mogelijk
- Implement debouncing voor frequent updates
- Consider pagination voor grote leaderboards

## Meer Informatie

- [Backend API Documentatie](../../../docs/BACKEND_API_REQUIREMENTS.md)
- [WebSocket Examples](../../../docs/examples/README.md)
- [Steps Implementation Status](../../../docs/features/STEPS_IMPLEMENTATION_STATUS.md)