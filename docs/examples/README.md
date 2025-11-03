# Steps WebSocket Voorbeelden

Deze directory bevat complete voorbeelden van hoe je de Steps WebSocket functionaliteit kunt gebruiken in je applicatie.

## Beschikbare Voorbeelden

### StepsWebSocketDashboard.tsx

Een volledig werkend dashboard component dat laat zien hoe je:
- Real-time step updates ontvangt via WebSocket
- Een leaderboard weergeeft met live rankings
- Badge notificaties toont
- Een connection status indicator implementeert
- Manual step input afhandelt

#### Gebruik

```tsx
import { StepsWebSocketDashboard } from './examples/StepsWebSocketDashboard';

function App() {
  return (
    <StepsWebSocketDashboard 
      userId="user-123" 
      participantId="participant-456" 
    />
  );
}
```

#### Features

- **Real-time Updates**: Automatische updates via WebSocket
- **Leaderboard**: Live rankings van deelnemers
- **Badge Notifications**: Popup notificaties voor verdiende badges
- **Connection Status**: Visuele indicator van WebSocket verbinding
- **Manual Input**: Formulier om handmatig stappen toe te voegen
- **Quick Actions**: Snelknoppen voor veelgebruikte aantallen

#### Styling

Het voorbeeld bevat ook CSS styles die je kunt gebruiken. Zie de `dashboardStyles` export in het bestand.

## Integratie in je Project

### 1. Gebruik de Hook

```tsx
import { useStepsWebSocket } from '../../src/features/steps/hooks/useStepsWebSocket';

function MyComponent() {
  const {
    connected,
    connectionState,
    latestUpdate,
    totalSteps,
    leaderboard,
    subscribe,
  } = useStepsWebSocket(userId, participantId, {
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
      <p>Steps: {latestUpdate?.steps || 0}</p>
      <p>Status: {connectionState}</p>
    </div>
  );
}
```

### 2. Specialized Hooks

Er zijn ook gespecialiseerde hooks voor verschillende use cases:

#### useParticipantDashboard
Voor deelnemer dashboards met auto-subscription:

```tsx
import { useParticipantDashboard } from '../../src/features/steps/hooks/useStepsWebSocket';

function ParticipantView() {
  const dashboard = useParticipantDashboard(userId, participantId);
  // Subscribed to: step_updates, badge_earned
}
```

#### useLeaderboard
Voor publieke leaderboard views:

```tsx
import { useLeaderboard } from '../../src/features/steps/hooks/useStepsWebSocket';

function PublicLeaderboard() {
  const { leaderboard, totalSteps } = useLeaderboard();
  // Subscribed to: total_updates, leaderboard_updates
}
```

#### useStepsMonitoring
Voor admin monitoring:

```tsx
import { useStepsMonitoring } from '../../src/features/steps/hooks/useStepsWebSocket';

function AdminMonitor() {
  const monitoring = useStepsMonitoring(adminUserId);
  // Subscribed to: all channels
}
```

## WebSocket Message Types

De WebSocket server stuurt verschillende types berichten:

### step_update
```typescript
{
  type: 'step_update',
  participant_id: string,
  naam: string,
  steps: number,
  delta: number,
  route: string,
  allocated_funds: number,
  timestamp: number
}
```

### total_update
```typescript
{
  type: 'total_update',
  total_steps: number,
  year: number,
  timestamp: number
}
```

### leaderboard_update
```typescript
{
  type: 'leaderboard_update',
  top_n: number,
  entries: LeaderboardEntry[],
  timestamp: number
}
```

### badge_earned
```typescript
{
  type: 'badge_earned',
  participant_id: string,
  badge_name: string,
  badge_icon: string,
  points: number,
  timestamp: number
}
```

## Configuration

Je kunt de WebSocket client configureren met de volgende opties:

```typescript
const config: StepsWebSocketConfig = {
  reconnectInterval: 1000,        // Start delay voor reconnect (ms)
  maxReconnectInterval: 30000,    // Max delay voor reconnect (ms)
  reconnectDecay: 1.5,             // Exponential backoff multiplier
  maxReconnectAttempts: Infinity,  // Max aantal reconnect pogingen
  pingInterval: 30000,             // Interval voor ping/pong (ms)
  debug: false,                    // Debug logging
};
```

## Troubleshooting

### WebSocket verbindt niet
- Controleer of de backend WebSocket server draait
- Verificeer de WebSocket URL (ws:// voor HTTP, wss:// voor HTTPS)
- Check of authentication token geldig is

### Geen updates ontvangen
- Zorg dat je gesubscribed bent op de juiste channels
- Check of de connection state CONNECTED is
- Bekijk de browser console met debug: true

### Reconnect problemen
- Verhoog maxReconnectInterval als je te vaak reconnect
- Verlaag reconnectDecay voor snellere reconnects
- Set maxReconnectAttempts als je een limiet wilt

## Meer Informatie

Voor meer details over de implementatie, zie:
- `src/features/steps/services/StepsWebSocketClient.ts` - Client implementatie
- `src/features/steps/hooks/useStepsWebSocket.ts` - React hook
- `src/features/steps/types.ts` - Type definities