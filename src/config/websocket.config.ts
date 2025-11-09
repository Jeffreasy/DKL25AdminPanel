/**
 * WebSocket Configuration
 * Verschillende WebSocket endpoints voor verschillende features
 */

import { apiConfig } from './api.config';

/**
 * Get WebSocket base URL from API base URL
 */
function getWSBaseURL(): string {
  const baseURL = apiConfig.baseURL;
  const isSecure = baseURL.startsWith('https');
  const protocol = isSecure ? 'wss' : 'ws';
  const url = baseURL.replace(/^https?:\/\//, '');
  return `${protocol}://${url}`;
}

/**
 * WebSocket Configuration
 * Backend documentatie: docs/backend Docs/api/WEBSOCKET.md
 */
export const wsConfig = {
  /**
   * Base WebSocket URL (automatisch afgeleid van API URL)
   */
  baseURL: getWSBaseURL(),

  /**
   * Steps WebSocket - Real-time step tracking updates
   * Endpoint: /ws/steps
   * @param token JWT access token
   */
  steps: (token: string) => 
    `${getWSBaseURL()}/ws/steps?token=${encodeURIComponent(token)}`,

  /**
   * Notulen WebSocket - Real-time meeting notes collaboration
   * Endpoint: /api/ws/notulen
   * @param token JWT access token
   */
  notulen: (token: string) => 
    `${getWSBaseURL()}/api/ws/notulen?token=${encodeURIComponent(token)}`,

  /**
   * Chat WebSocket - Real-time chat messaging
   * Endpoint: /api/chat/ws/:channel_id
   * @param channelId Chat channel ID
   * @param token JWT access token
   */
  chat: (channelId: string, token: string) => 
    `${getWSBaseURL()}/api/chat/ws/${channelId}?token=${encodeURIComponent(token)}`,

  /**
   * WebSocket reconnection settings
   */
  reconnection: {
    /** Maximum number of reconnection attempts */
    maxAttempts: 5,
    /** Initial delay before first reconnection attempt (ms) */
    initialDelay: 1000,
    /** Maximum delay between reconnection attempts (ms) */
    maxDelay: 30000,
    /** Backoff multiplier for exponential backoff */
    backoffMultiplier: 2,
  },
};

/**
 * Log WebSocket configuration in development mode
 */
if (import.meta.env.DEV) {
  console.group('🔌 WebSocket Configuration');
  console.log('Base URL:', wsConfig.baseURL);
  console.log('Steps:', wsConfig.steps('TOKEN_EXAMPLE'));
  console.log('Notulen:', wsConfig.notulen('TOKEN_EXAMPLE'));
  console.log('Chat:', wsConfig.chat('channel-123', 'TOKEN_EXAMPLE'));
  console.log('Reconnection:', wsConfig.reconnection);
  console.groupEnd();
}

export default wsConfig;