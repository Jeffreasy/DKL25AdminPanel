import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

interface EmailDraft {
  to: string
  subject: string
  body: string
  timestamp: number
}

const DRAFT_KEY = 'email_draft'
const AUTO_SAVE_DELAY = 2000 // 2 seconds

export function useEmailDraft() {
  const [draft, setDraft] = useLocalStorage<EmailDraft | null>(DRAFT_KEY, null)
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  // Save draft with debounce
  const saveDraft = useCallback((to: string, subject: string, body: string) => {
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }

    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      const draftData: EmailDraft = {
        to,
        subject,
        body,
        timestamp: Date.now()
      }
      setDraft(draftData)
    }, AUTO_SAVE_DELAY)

    setAutoSaveTimeout(timeout)
  }, [autoSaveTimeout, setDraft])

  // Clear draft
  const clearDraft = useCallback(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    setDraft(null)
  }, [autoSaveTimeout, setDraft])

  // Check if draft exists and is recent (less than 24 hours old)
  const hasDraft = useCallback(() => {
    if (!draft) return false
    const dayInMs = 24 * 60 * 60 * 1000
    return (Date.now() - draft.timestamp) < dayInMs
  }, [draft])

  // Get draft age in minutes
  const getDraftAge = useCallback(() => {
    if (!draft) return 0
    return Math.floor((Date.now() - draft.timestamp) / 60000)
  }, [draft])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
    }
  }, [autoSaveTimeout])

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft,
    getDraftAge
  }
}