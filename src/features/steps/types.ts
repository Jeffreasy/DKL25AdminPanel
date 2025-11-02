/**
 * Steps Feature Types
 * Based on Steps API Documentation
 */

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