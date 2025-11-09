import { useState, useEffect } from 'react'
import { emailClient } from '../../../api/client/emailClient'

export interface EmailStats {
  totalEmails: number
  unreadCount: number
  infoCount: number
  inschrijvingCount: number
  todayCount: number
  weekCount: number
  monthCount: number
}

/**
 * Hook to fetch email statistics for dashboard display
 */
export function useEmailStats(refreshInterval: number = 60000) {
  const [stats, setStats] = useState<EmailStats>({
    totalEmails: 0,
    unreadCount: 0,
    infoCount: 0,
    inschrijvingCount: 0,
    todayCount: 0,
    weekCount: 0,
    monthCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = async () => {
    try {
      // Fetch unprocessed emails count
      const unprocessed = await emailClient.getUnprocessedEmails()
      
      // Fetch info account emails
      const infoResponse = await emailClient.getEmailsByAccount('info', 1, 0)
      
      // Fetch inschrijving account emails
      const inschrijvingResponse = await emailClient.getEmailsByAccount('inschrijving', 1, 0)
      
      // Calculate totals
      const totalEmails = infoResponse.totalCount + inschrijvingResponse.totalCount
      
      setStats({
        totalEmails,
        unreadCount: unprocessed.length,
        infoCount: infoResponse.totalCount,
        inschrijvingCount: inschrijvingResponse.totalCount,
        // For period counts, we'd need backend support or fetch all emails
        // For now, using placeholders - can be enhanced later
        todayCount: 0,
        weekCount: 0,
        monthCount: 0
      })
      
      setError(null)
    } catch (err) {
      console.error('Failed to fetch email stats:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Set up interval for auto-refresh
    const intervalId = setInterval(fetchStats, refreshInterval)

    return () => clearInterval(intervalId)
  }, [refreshInterval])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}