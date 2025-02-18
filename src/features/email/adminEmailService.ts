import { supabase } from '../../lib/supabase'
import { MAILGUN_API_KEY, MAILGUN_DOMAIN } from '../../config'
import type { AutoResponse } from './types'
import { sendEmail } from './api'
import { verifyEmailAddress } from '../../api/email'
import { emailService } from '../../api/email'

const MAILGUN_BASE_URL = `https://api.eu.mailgun.net/v3/${MAILGUN_DOMAIN}`

// Add debug logging
console.log('Mailgun config:', {
  hasApiKey: !!MAILGUN_API_KEY,
  domain: MAILGUN_DOMAIN,
  baseUrl: MAILGUN_BASE_URL,
})

interface EmailStats {
  id: number
  total: number
  sent: number
  received: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  created_at: string
  updated_at: string
  confirmation_sent: number
}

interface TemplateVariables {
  [key: string]: string | number | boolean
}

interface SendEmailParams {
  to: string | string[]
  subject: string
  body?: string
  from: string
  replyTo?: string
  template?: string
  template_variables?: TemplateVariables
  attachments?: File[]
}

interface RawEmailEvent {
  type: string
  timestamp: string
  delivery_status?: {
    [key: string]: unknown
  }
  message?: {
    size?: number
    attachments?: unknown[]
    headers?: Record<string, string>
  }
  severity?: string
  flags?: string[]
  [key: string]: unknown
}

export interface EmailEvent {
  id: string
  event_type: string
  email_id: string
  from_email: string
  to_email: string
  subject: string
  raw_event?: RawEmailEvent
}

export const adminEmailService = {
  // Basis Mailgun functie
  async sendViaMailgun(params: SendEmailParams) {
    try {
      if (!MAILGUN_DOMAIN) {
        throw new Error('Mailgun configuration missing')
      }

      const result = await sendEmail({
        from: params.from || `DKL25 Admin <noreply@${MAILGUN_DOMAIN}>`,
        to: Array.isArray(params.to) ? params.to.join(',') : params.to,
        subject: params.subject,
        html: params.body || '',
        'h:Reply-To': params.replyTo
      })

      return result
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  },

  // Email statistieken ophalen via Mailgun
  async getEmailStats(): Promise<EmailStats> {
    const response = await fetch(`${MAILGUN_BASE_URL}/stats/total`, {
      headers: {
        'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch email stats')
    }

    const stats = await response.json()
    
    // Update lokale stats in Supabase
    await this.updateEmailStats(stats)

    return stats
  },

  // Email events ophalen via Mailgun
  async getEmailEvents(params: {
    limit?: number
    page?: number
    account?: 'info' | 'inschrijving'
  } = {}) {
    try {
      const { items, total } = await emailService.getEmails({
        limit: params.limit,
        offset: params.page ? (params.page - 1) * (params.limit || 50) : 0,
        account: params.account
      })

      return { items, total }
    } catch (error) {
      console.error('Failed to fetch emails:', error)
      throw new Error('Failed to fetch emails')
    }
  },

  // Email versturen via Admin Panel (nu via Mailgun)
  async sendAdminEmail(params: SendEmailParams) {
    try {
      const result = await this.sendViaMailgun(params)

      // Log success
      await this.logEmailEvent({
        event_type: 'sent',
        from_email: params.from || `noreply@${MAILGUN_DOMAIN}`,
        to_email: Array.isArray(params.to) ? params.to.join(', ') : params.to,
        subject: params.subject,
        email_id: result.id
      })

      return { success: true, id: result.id }
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  },

  // Autoresponse functies (nu met Mailgun templates)
  async sendAutoResponse(triggerEvent: string, variables: Record<string, string>) {
    const { data: autoResponse } = await supabase
      .from('email_autoresponse')
      .select('*')
      .eq('trigger_event', triggerEvent)
      .eq('is_active', true)
      .single()

    if (!autoResponse) return

    return this.sendAdminEmail({
      to: variables.email,
      from: 'no-reply@dekoninklijkeloop.nl',
      subject: autoResponse.subject,
      template: autoResponse.name,
      template_variables: variables,
      body: ''
    })
  },

  // Database helper functions blijven hetzelfde
  async logEmailEvent(event: Partial<RawEmailEvent>) {
    try {
      const timestamp = event.timestamp 
        ? new Date(Number(event.timestamp) * 1000).toISOString()
        : new Date().toISOString()

      const { error } = await supabase.from('email_events').insert({
        ...event,
        timestamp,
        metadata: {
          raw_event: event,
          delivery_status: event.delivery_status,
          message_details: {
            size: event.message?.size,
            attachments: event.message?.attachments,
            headers: event.message?.headers
          },
          severity: event.severity,
          flags: event.flags
        }
      })

      if (error) throw error
    } catch (err) {
      console.error('Error logging email event:', err)
      throw err
    }
  },

  async updateEmailStats(increment: Partial<Record<keyof EmailStats, number>>) {
    const { data: currentStats } = await supabase
      .from('email_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!currentStats) {
      // Create new stats record
      await supabase.from('email_stats').insert({
        ...increment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    } else {
      // Update existing stats
      await supabase
        .from('email_stats')
        .update({
          ...Object.entries(increment).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: currentStats[key] + value
          }), {}),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentStats.id)
    }
  },

  generateMailtoLink(params: SendEmailParams): string {
    const to = Array.isArray(params.to) ? params.to.join(',') : params.to
    const base = `mailto:${to}?subject=${encodeURIComponent(params.subject)}`
    
    const queryParams = []
    
    // Add body only if it exists
    if (params.body) {
      queryParams.push(`body=${encodeURIComponent(params.body)}`)
    }
    
    if (params.replyTo) {
      queryParams.push(`reply-to=${encodeURIComponent(params.replyTo)}`)
    }
    
    return queryParams.length ? `${base}&${queryParams.join('&')}` : base
  },

  // Autoresponse functies
  async getAutoResponses() {
    const { data, error } = await supabase
      .from('email_autoresponse')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as AutoResponse[]
  },

  async createAutoResponse(autoResponse: Omit<AutoResponse, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('email_autoresponse')
      .insert(autoResponse)
      .select()
      .single()

    if (error) throw error
    return data as AutoResponse
  },

  async updateAutoResponse(id: string, updates: Partial<AutoResponse>) {
    const { data, error } = await supabase
      .from('email_autoresponse')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as AutoResponse
  },

  async deleteAutoResponse(id: string) {
    const { error } = await supabase
      .from('email_autoresponse')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Helper functie om template variabelen te vervangen
  replaceTemplateVariables(template: string, variables: Record<string, string>) {
    return template.replace(/\{(\w+)\}/g, (match, key) => variables[key] || match)
  },

  // Add verification methods
  async verifyEmailAddress(email: string) {
    try {
      await verifyEmailAddress(email)
      return { success: true }
    } catch (error) {
      console.error('Failed to verify email:', error)
      throw error
    }
  },

  async checkEmailVerification(email: string): Promise<boolean> {
    return emailService.verifyEmailAddress(email)
  }
} 