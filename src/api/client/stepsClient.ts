import { authManager } from './auth';
import type {
  ParticipantDashboard,
  TotalStepsResponse,
  FundsDistribution,
  UpdateStepsRequest,
  RouteFund,
  CreateRouteFundRequest,
  UpdateRouteFundRequest,
  DeleteRouteFundResponse,
  Participant
} from '../../features/steps/types';

/**
 * Steps API Client
 * Handles all Steps-related API calls
 */
class StepsClient {
  private async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    return authManager.makeAuthenticatedRequest(endpoint, options);
  }

  // ============================================================================
  // USER ENDPOINTS - For authenticated participants
  // ============================================================================

  /**
   * Update own steps (delta)
   * @param deltaSteps - Number of steps to add (can be negative)
   */
  async updateMySteps(deltaSteps: number): Promise<Participant> {
    const data: UpdateStepsRequest = { steps: deltaSteps };
    return await this.makeAuthenticatedRequest('/api/steps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }) as Participant;
  }

  /**
   * Get own participant dashboard
   */
  async getMyDashboard(): Promise<ParticipantDashboard> {
    return await this.makeAuthenticatedRequest('/api/participant/dashboard') as ParticipantDashboard;
  }

  // ============================================================================
  // PUBLIC/AUTHENTICATED ENDPOINTS
  // ============================================================================

  /**
   * Get total steps for all participants
   * @param year - Year to filter (default: 2025)
   */
  async getTotalSteps(year: number = 2025): Promise<TotalStepsResponse> {
    const endpoint = `/api/total-steps?year=${year}`;
    return await this.makeAuthenticatedRequest(endpoint) as TotalStepsResponse;
  }

  /**
   * Get funds distribution across routes
   */
  async getFundsDistribution(): Promise<FundsDistribution> {
    return await this.makeAuthenticatedRequest('/api/funds-distribution') as FundsDistribution;
  }

  // ============================================================================
  // ADMIN ENDPOINTS - Require admin/staff permissions
  // ============================================================================

  /**
   * Update steps for a specific participant (Admin only)
   * @param participantId - ID of the participant
   * @param deltaSteps - Number of steps to add (can be negative)
   */
  async updateParticipantSteps(participantId: string, deltaSteps: number): Promise<Participant> {
    const data: UpdateStepsRequest = { steps: deltaSteps };
    return await this.makeAuthenticatedRequest(`/api/steps/${participantId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }) as Participant;
  }

  /**
   * Get dashboard for a specific participant (Admin only)
   * @param participantId - ID of the participant
   */
  async getParticipantDashboard(participantId: string): Promise<ParticipantDashboard> {
    return await this.makeAuthenticatedRequest(`/api/participant/${participantId}/dashboard`) as ParticipantDashboard;
  }

  /**
   * Get all route funds (Admin only)
   */
  async getRouteFunds(): Promise<RouteFund[]> {
    return await this.makeAuthenticatedRequest('/api/steps/admin/route-funds') as RouteFund[];
  }

  /**
   * Create a new route fund (Admin only)
   * @param route - Route name (e.g., "6 KM")
   * @param amount - Amount in euros
   */
  async createRouteFund(route: string, amount: number): Promise<RouteFund> {
    const data: CreateRouteFundRequest = { route, amount };
    return await this.makeAuthenticatedRequest('/api/steps/admin/route-funds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }) as RouteFund;
  }

  /**
   * Update an existing route fund (Admin only)
   * @param route - Route name (e.g., "6 KM")
   * @param amount - New amount in euros
   */
  async updateRouteFund(route: string, amount: number): Promise<RouteFund> {
    const data: UpdateRouteFundRequest = { amount };
    return await this.makeAuthenticatedRequest(`/api/steps/admin/route-funds/${route}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }) as RouteFund;
  }

  /**
   * Delete a route fund (Admin only)
   * @param route - Route name (e.g., "6 KM")
   */
  async deleteRouteFund(route: string): Promise<DeleteRouteFundResponse> {
    return await this.makeAuthenticatedRequest(`/api/steps/admin/route-funds/${route}`, {
      method: 'DELETE',
    }) as DeleteRouteFundResponse;
  }
}

export const stepsClient = new StepsClient();