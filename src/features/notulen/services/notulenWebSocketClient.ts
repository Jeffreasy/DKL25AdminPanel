import type { Notulen } from '../types'

export interface NotulenWebSocketMessage {
  type: 'notulen_updated' | 'notulen_finalized' | 'notulen_archived' | 'notulen_deleted' | 'welcome' | 'ping' | 'pong'
  notulenId?: string
  userId?: string
  data?: Notulen  // Voor 'notulen_updated' events
  timestamp: string
  message?: string // Voor 'welcome' messages
}

export interface NotulenWebSocketClientOptions {
  onMessage?: (message: NotulenWebSocketMessage) => void
  onError?: (error: Event) => void
  onClose?: (event: CloseEvent) => void
  onOpen?: (event: Event) => void
}

class NotulenWebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 1000 // Start with 1 second
  private options: NotulenWebSocketClientOptions
  private url: string
  private pingInterval: NodeJS.Timeout | null = null
  private getToken: () => string | null

  constructor(getToken: () => string | null, options: NotulenWebSocketClientOptions = {}) {
    this.getToken = getToken
    this.options = options
    this.url = '' // Will be set in connect()
  }

  connect(notulenId?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    try {
      // Build WebSocket URL with authentication and optional filters
      const token = this.getToken()
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'
      const params = new URLSearchParams()
      
      if (token) params.append('token', token)
      if (notulenId) params.append('notulen_id', notulenId)
      
      this.url = `${baseUrl.replace(/^http/, 'ws')}/api/ws/notulen${params.toString() ? '?' + params.toString() : ''}`
      
      this.ws = new WebSocket(this.url)

      this.ws.onopen = (event) => {
        console.log('Notulen WebSocket connected')
        this.reconnectAttempts = 0
        this.reconnectInterval = 1000
        this.startPingInterval()
        this.options.onOpen?.(event)
      }

      this.ws.onmessage = (event) => {
        try {
          const message: NotulenWebSocketMessage = JSON.parse(event.data)
          this.options.onMessage?.(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('Notulen WebSocket error:', error)
        this.options.onError?.(error)
      }

      this.ws.onclose = (event) => {
        console.log('Notulen WebSocket disconnected:', event.code, event.reason)
        this.stopPingInterval()
        this.options.onClose?.(event)

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect()
        }
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.attemptReconnect()
    }
  }

  private attemptReconnect(): void {
    this.reconnectAttempts++
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      this.connect() // Will reconnect without notulenId - consider storing it if needed
    }, this.reconnectInterval)

    // Exponential backoff
    this.reconnectInterval = Math.min(this.reconnectInterval * 2, 30000)
  }

  disconnect(): void {
    this.stopPingInterval()
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting')
      this.ws = null
    }
  }

  private startPingInterval(): void {
    // Send ping every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      this.ping()
    }, 30000)
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  ping(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }))
    }
  }

  sendUpdate(notulenId: string, updates: Partial<Notulen>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'update_notulen',
        notulenId,
        updates,
        timestamp: new Date().toISOString()
      }))
    } else {
      console.warn('WebSocket not connected, cannot send update')
    }
  }

  sendFinalize(notulenId: string, reason?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'finalize_notulen',
        notulenId,
        reason,
        timestamp: new Date().toISOString()
      }))
    } else {
      console.warn('WebSocket not connected, cannot send finalize')
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getConnectionState(): number | undefined {
    return this.ws?.readyState
  }
}

// Default instance - users can pass their own token getter
export const notulenWebSocketClient = new NotulenWebSocketClient(
  () => localStorage.getItem('auth_token')
)

// Factory function for custom instances
export const createNotulenWebSocketClient = (
  getToken: () => string | null,
  options?: NotulenWebSocketClientOptions
) => new NotulenWebSocketClient(getToken, options)
