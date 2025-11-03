/**
 * Steps Feature Types
 * Based on Steps API Documentation and WebSocket Integration
 */

// ============================================================================
// REST API Types
// ============================================================================

/**
 * Participant/Aanmelding with steps tracking
 */
export interface Participant {
  id: string;
  naam: string;
  email: string;
  telefoon?: string;
  rol?: string;
  afstand: string; // "6 KM", "10 KM", "15 KM", "20 KM"
  ondersteuning?: string;
  bijzonderheden?: string;
  terms: boolean;
  status: string;
  steps: number;
  gebruiker_id?: string;
  created_at: string;
  updated_at: string;
  test_mode: boolean;
}

/**
 * Route Fund - Fondsen per route
 */
export interface RouteFund {
  id: string;
  route: string; // "6 KM", "10 KM", "15 KM", "20 KM"
  amount: number; // Bedrag in euro's
  created_at: string;
  updated_at: string;
}

/**
 * Dashboard Response voor deelnemer
 */
export interface ParticipantDashboard {
  steps: number;
  route: string;
  allocatedFunds: number;
  naam: string;
  email: string;
}

/**
 * Total Steps Response
 */
export interface TotalStepsResponse {
  total_steps: number;
}

/**
 * Funds Distribution Response
 */
export interface FundsDistribution {
  totalX: number;
  routes: Record<string, number>;
}

/**
 * Update Steps Request
 */
export interface UpdateStepsRequest {
  steps: number; // Delta: aantal stappen om toe te voegen (kan negatief zijn)
}

/**
 * Create Route Fund Request
 */
export interface CreateRouteFundRequest {
  route: string;
  amount: number;
}

/**
 * Update Route Fund Request
 */
export interface UpdateRouteFundRequest {
  amount: number;
}

/**
 * Route Fund Delete Response
 */
export interface DeleteRouteFundResponse {
  success: boolean;
  message: string;
}

/**
 * Available Routes
 */
export type RouteOption = '6 KM' | '10 KM' | '15 KM' | '20 KM' | '2.5 KM';

/**
 * Steps Statistics voor UI
 */
export interface StepsStats {
  personalSteps: number;
  totalSteps: number;
  personalGoal: number;
  progressPercentage: number;
}

/**
 * Password Strength voor validatie
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong';

// ============================================================================
// WebSocket Types
// ============================================================================

/**
 * WebSocket Message Types
 */
export type WebSocketMessageType =
  | 'step_update'
  | 'total_update'
  | 'leaderboard_update'
  | 'badge_earned'
  | 'subscribe'
  | 'unsubscribe'
  | 'ping'
  | 'pong';

/**
 * WebSocket Step Update Message
 */
export interface WebSocketStepUpdate {
  type: 'step_update';
  participant_id: string;
  naam: string;
  steps: number;
  delta: number;
  route: string;
  allocated_funds: number;
  timestamp: number;
}

/**
 * WebSocket Total Update Message
 */
export interface WebSocketTotalUpdate {
  type: 'total_update';
  total_steps: number;
  year: number;
  timestamp: number;
}

/**
 * WebSocket Leaderboard Entry
 */
export interface WebSocketLeaderboardEntry {
  rank: number;
  participant_id: string;
  naam: string;
  steps: number;
  achievement_points: number;
  total_score: number;
  route: string;
  badge_count: number;
}

/**
 * WebSocket Leaderboard Update Message
 */
export interface WebSocketLeaderboardUpdate {
  type: 'leaderboard_update';
  top_n: number;
  entries: WebSocketLeaderboardEntry[];
  timestamp: number;
}

/**
 * WebSocket Badge Earned Message
 */
export interface WebSocketBadgeEarned {
  type: 'badge_earned';
  participant_id: string;
  badge_name: string;
  badge_icon: string;
  points: number;
  timestamp: number;
}

/**
 * WebSocket Connection States
 */
export enum WebSocketConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  FAILED = 'FAILED',
}

/**
 * WebSocket Configuration
 */
export interface WebSocketConfig {
  reconnectInterval?: number;
  maxReconnectInterval?: number;
  reconnectDecay?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number;
  debug?: boolean;
}