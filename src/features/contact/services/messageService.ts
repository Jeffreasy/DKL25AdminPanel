import { contactClient } from '../../../api/client'
import type { ContactMessage, ContactStats, ContactStatus } from '../types'

export async function fetchMessages(): Promise<{ data: ContactMessage[], error: Error | null }> {
  try {
    const response = await contactClient.getMessages()
    // Map API response to feature types
    const mappedData: ContactMessage[] = (response as unknown as Record<string, unknown>[]).map((msg) => ({
      id: msg.id as string,
      naam: msg.naam as string,
      email: msg.email as string,
      onderwerp: (msg.telefoon as string) || '', // Map telefoon to onderwerp for compatibility
      bericht: msg.bericht as string,
      status: msg.status as ContactStatus,
      privacy_akkoord: msg.privacy_akkoord as boolean,
      email_verzonden: (msg.beantwoord as boolean) || false,
      email_verzonden_op: (msg.beantwoord_op as string) || null,
      created_at: msg.created_at as string,
      updated_at: msg.updated_at as string,
      behandeld_door: msg.behandeld_door as string,
      behandeld_op: msg.behandeld_op as string
    }))
    return { data: mappedData, error: null }
  } catch (err) {
    console.error('Error fetching messages:', err)
    return { data: [], error: err as Error }
  }
}

export async function updateMessageStatus(id: string, status: ContactStatus) {
  try {
    // Map status to API format
    const apiStatus = status === 'afgehandeld' ? 'gesloten' : status
    await contactClient.updateMessage(id, { status: apiStatus })

    return { error: null }
  } catch (err) {
    console.error('Error updating message:', err)
    return { error: err as Error }
  }
}

export async function updateMessageNotes(id: string, notities: string) {
  try {
    await contactClient.updateMessage(id, { notities })
    return { error: null }
  } catch (err) {
    console.error('Error updating notes:', err)
    return { error: err as Error }
  }
}

export async function resendEmail(id: string): Promise<{ error: Error | null }> {
  try {
    await contactClient.addAnswer(id, 'Email opnieuw verzonden')
    return { error: null }
  } catch (err) {
    console.error('Error resending email:', err)
    return { error: err as Error }
  }
}

export async function getContactStats(): Promise<{ data: ContactStats | null, error: Error | null }> {
  try {
    const messages = await contactClient.getMessages()

    // Calculate stats
    const stats: ContactStats = {
      counts: {
        total: messages.length,
        new: messages.filter(m => m.status === 'nieuw').length,
        inProgress: messages.filter(m => m.status === 'in_behandeling').length,
        handled: messages.filter(m => m.status === 'gesloten').length
      },
      avgResponseTime: calculateAvgResponseTime(messages as unknown as ContactMessage[]),
      messagesByPeriod: calculateMessagesByPeriod(messages as unknown as ContactMessage[])
    }

    return { data: stats, error: null }
  } catch (err) {
    console.error('Error fetching stats:', err)
    return { data: null, error: err as Error }
  }
}

// Helper functions
function calculateAvgResponseTime(messages: ContactMessage[]): number {
  // Filter messages that are handled AND have valid behandeld_op date
  const handledMessages = messages.filter(m => {
    if (m.status !== 'afgehandeld' || !m.behandeld_op) return false
    
    // Extra validation: check if dates are valid
    const createdDate = new Date(m.created_at)
    const handledDate = new Date(m.behandeld_op)
    
    if (isNaN(createdDate.getTime()) || isNaN(handledDate.getTime())) return false
    if (handledDate < createdDate) return false // Invalid: handled before created
    
    return true
  })
  
  if (handledMessages.length === 0) return 0

  const totalTime = handledMessages.reduce((sum, msg) => {
    const start = new Date(msg.created_at).getTime()
    const end = new Date(msg.behandeld_op!).getTime()
    const diff = end - start
    
    // Sanity check: max 30 days (in milliseconds)
    const maxTime = 30 * 24 * 60 * 60 * 1000
    return sum + Math.min(diff, maxTime)
  }, 0)

  // Convert to hours and round to 1 decimal
  const avgHours = totalTime / handledMessages.length / (1000 * 60 * 60)
  return Math.round(avgHours * 10) / 10
}

function calculateMessagesByPeriod(messages: ContactMessage[]) {
  const now = new Date()
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  return {
    daily: messages.filter(m => new Date(m.created_at) > dayAgo).length,
    weekly: messages.filter(m => new Date(m.created_at) > weekAgo).length,
    monthly: messages.filter(m => new Date(m.created_at) > monthAgo).length
  }
} 