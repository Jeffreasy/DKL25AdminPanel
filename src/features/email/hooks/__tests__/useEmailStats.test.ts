import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useEmailStats } from '../useEmailStats'
import { emailClient } from '../../../../api/client/emailClient'

// Mock emailClient
vi.mock('../../../../api/client/emailClient')

describe('useEmailStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch email statistics on mount', async () => {
    const mockUnprocessed = [
      { id: '1', read: false },
      { id: '2', read: false }
    ]
    const mockInfoResponse = {
      emails: [],
      totalCount: 10
    }
    const mockInschrijvingResponse = {
      emails: [],
      totalCount: 5
    }

    vi.mocked(emailClient.getUnprocessedEmails).mockResolvedValue(mockUnprocessed as any)
    vi.mocked(emailClient.getEmailsByAccount)
      .mockResolvedValueOnce(mockInfoResponse)
      .mockResolvedValueOnce(mockInschrijvingResponse)

    const { result } = renderHook(() => useEmailStats())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats.totalEmails).toBe(15)
    expect(result.current.stats.unreadCount).toBe(2)
    expect(result.current.stats.infoCount).toBe(10)
    expect(result.current.stats.inschrijvingCount).toBe(5)
  })

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Network error')
    vi.mocked(emailClient.getUnprocessedEmails).mockRejectedValue(mockError)

    const { result } = renderHook(() => useEmailStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.error?.message).toBe('Network error')
  })

  it('should allow manual refetch', async () => {
    const mockUnprocessed: any[] = []
    const mockInfoResponse = { emails: [], totalCount: 0 }
    const mockInschrijvingResponse = { emails: [], totalCount: 0 }

    vi.mocked(emailClient.getUnprocessedEmails).mockResolvedValue(mockUnprocessed as any)
    vi.mocked(emailClient.getEmailsByAccount)
      .mockResolvedValue(mockInfoResponse)
      .mockResolvedValue(mockInschrijvingResponse)

    const { result } = renderHook(() => useEmailStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear previous calls
    vi.clearAllMocks()

    // Trigger refetch
    result.current.refetch()

    await waitFor(() => {
      expect(emailClient.getUnprocessedEmails).toHaveBeenCalled()
    })
  })

  it('should set up auto-refresh interval', async () => {
    vi.useFakeTimers()

    const mockUnprocessed: any[] = []
    const mockResponse = { emails: [], totalCount: 0 }

    vi.mocked(emailClient.getUnprocessedEmails).mockResolvedValue(mockUnprocessed as any)
    vi.mocked(emailClient.getEmailsByAccount).mockResolvedValue(mockResponse)

    const { unmount } = renderHook(() => useEmailStats(1000)) // 1 second interval

    await waitFor(() => {
      expect(emailClient.getUnprocessedEmails).toHaveBeenCalledTimes(1)
    })

    // Clear and advance time
    vi.clearAllMocks()
    vi.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(emailClient.getUnprocessedEmails).toHaveBeenCalled()
    })

    unmount()
    vi.useRealTimers()
  })
})