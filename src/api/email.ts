import { supabase } from '../lib/supabase'

// Types voor emails in Supabase
export interface Email {
  id: number
  sender: string
  subject: string
  body: string
  html?: string
  account: 'info' | 'inschrijving'
  created_at: string
  read: boolean
  message_id?: string
  attachments?: {
    filename: string
    content_type: string
    size: number
    url?: string
  }[]
}

// Interface voor email queries
export interface EmailQueryParams {
  limit?: number
  offset?: number
  account?: 'info' | 'inschrijving'
  search?: string
  unread_only?: boolean
}

// Email service functies
export const emailService = {
  // Ophalen van emails uit Supabase
  async getEmails(params: {
    limit?: number
    offset?: number
    account?: 'info' | 'inschrijving'
    search?: string
    unread_only?: boolean
  } = {}) {
    let query = supabase
      .from('emails')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (params.account) {
      query = query.eq('account', params.account)
    }

    if (params.unread_only) {
      query = query.eq('read', false)
    }

    if (params.search) {
      query = query.or(`subject.ilike.%${params.search}%,body.ilike.%${params.search}%,sender.ilike.%${params.search}%`)
    }

    if (params.limit) {
      query = query.limit(params.limit)
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) throw error

    return {
      items: data as Email[],
      total: count || 0
    }
  },

  // Email als gelezen markeren
  async markAsRead(id: number) {
    const { error } = await supabase
      .from('emails')
      .update({ read: true })
      .eq('id', id)

    if (error) throw error
  },

  // Basis email verificatie
  verifyEmailAddress(email: string): boolean {
    const authorizedEmails = [
      'info@dekoninklijkeloop.nl',
      'inschrijving@dekoninklijkeloop.nl'
    ]
    return authorizedEmails.includes(email)
  }
}

// Export de verifyEmailAddress functie voor backward compatibility
export const verifyEmailAddress = emailService.verifyEmailAddress 