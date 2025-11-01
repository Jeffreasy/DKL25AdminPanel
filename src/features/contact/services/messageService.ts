import { supabase } from '../../../api/client/supabase'
import type { ContactMessage, ContactStats, ContactStatus } from '../types'

export async function fetchMessages(): Promise<{ data: ContactMessage[], error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('contact_formulieren')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error fetching messages:', err)
    return { data: [], error: err as Error }
  }
}

export async function updateMessageStatus(id: string, status: ContactStatus) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    const updates = {
      status,
      ...(status === 'afgehandeld' ? {
        behandeld_door: user?.email,
        behandeld_op: new Date().toISOString()
      } : {})
    }

    const { error } = await supabase
      .from('contact_formulieren')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Update error:', error)
      throw error
    }
    
    return { error: null }
  } catch (err) {
    console.error('Error updating message:', err)
    return { error: err as Error }
  }
}

export async function updateMessageNotes(id: string, notities: string) {
  try {
    const { error } = await supabase
      .from('contact_formulieren')
      .update({ notities })
      .eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (err) {
    console.error('Error updating notes:', err)
    return { error: err as Error }
  }
}

export async function resendEmail(id: string): Promise<{ error: Error | null }> {
  try {
    const { data: message } = await supabase
      .from('contact_formulieren')
      .select('*')
      .eq('id', id)
      .single()

    if (!message) throw new Error('Message not found')

    // Hier email logica toevoegen
    
    const { error } = await supabase
      .from('contact_formulieren')
      .update({ 
        email_verzonden: true,
        email_verzonden_op: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (err) {
    console.error('Error resending email:', err)
    return { error: err as Error }
  }
}

export async function getContactStats(): Promise<{ data: ContactStats | null, error: Error | null }> {
  try {
    const { data: messages, error } = await supabase
      .from('contact_formulieren')
      .select('*')

    if (error) throw error

    // Calculate stats
    const stats: ContactStats = {
      counts: {
        total: messages.length,
        new: messages.filter(m => m.status === 'nieuw').length,
        inProgress: messages.filter(m => m.status === 'in_behandeling').length,
        handled: messages.filter(m => m.status === 'afgehandeld').length
      },
      avgResponseTime: calculateAvgResponseTime(messages),
      messagesByPeriod: calculateMessagesByPeriod(messages)
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