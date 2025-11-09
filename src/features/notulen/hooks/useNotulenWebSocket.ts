import { useCallback } from 'react'
import { notulenWebSocketClient } from '../services/notulenWebSocketClient'
import type { Notulen } from '../types'

export function useNotulenWebSocket() {
  const connect = useCallback((notulenId?: string) => {
    notulenWebSocketClient.connect(notulenId)
  }, [])

  const disconnect = useCallback(() => {
    notulenWebSocketClient.disconnect()
  }, [])

  const sendUpdate = useCallback((notulenId: string, updates: Partial<Notulen>) => {
    notulenWebSocketClient.sendUpdate(notulenId, updates)
  }, [])

  const sendFinalize = useCallback((notulenId: string, reason?: string) => {
    notulenWebSocketClient.sendFinalize(notulenId, reason)
  }, [])

  const isConnected = useCallback(() => {
    return notulenWebSocketClient.isConnected()
  }, [])

  const ping = useCallback(() => {
    notulenWebSocketClient.ping()
  }, [])

  return {
    connect,
    disconnect,
    sendUpdate,
    sendFinalize,
    isConnected,
    ping
  }
}
