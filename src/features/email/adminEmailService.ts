import { supabase } from '../../lib/supabase'
import type { AutoResponse, Email } from './types'
import { emailService } from './emailService'

interface SendEmailParams {
  to: string | string[]
  subject: string
  body?: string
  from: string
  replyTo?: string
  template?: string
  template_variables?: Record<string, string>
}

interface EmailEventData {
  event_type: string
  from_email: string
  to_email: string
  subject: string
  email_id: string
  timestamp?: string
}

export const adminEmailService = {
  // N8N email functie
  async sendViaN8N(params: SendEmailParams) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || ''
      
      if (!apiUrl) {
        throw new Error('API URL not configured')
      }

      const response = await fetch(`${apiUrl}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: params.from,
          to: Array.isArray(params.to) ? params.to.join(',') : params.to,
          subject: params.subject,
          html: params.body || '',
          replyTo: params.replyTo,
          template: params.template,
          templateVariables: params.template_variables
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email via N8N')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  },

  // Admin email versturen
  async sendAdminEmail(params: SendEmailParams) {
    try {
      const result = await this.sendViaN8N(params)
      await this.logEmailEvent({
        event_type: 'sent',
        from_email: params.from,
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

  // Autoresponse functies
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
      template_variables: variables
    })
  },

  // Database logging
  async logEmailEvent(event: EmailEventData) {
    try {
      const { error } = await supabase
        .from('email_events')
        .insert({
          ...event,
          timestamp: event.timestamp || new Date().toISOString(),
          metadata: {}
        })
      
      if (error) {
        console.error('Failed to log email event:', error)
      }
    } catch (error) {
      console.error('Error in logEmailEvent:', error)
    }
  },

  // Email verificatie
  async verifyEmailAddress(email: string) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || ''
      
      if (!apiUrl) {
        throw new Error('API URL not configured')
      }

      const response = await fetch(`${apiUrl}/api/email/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (!response.ok) {
        throw new Error('Failed to verify email via N8N')
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to verify email:', error)
      throw error
    }
  },

  async checkEmailVerification(email: string): Promise<boolean> {
    try {
      const result = await this.verifyEmailAddress(email)
      return result.success
    } catch (error) {
      console.error('Email verification check failed:', error)
      return false
    }
  },

  // Autoresponse management
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

  // Helper functie
  replaceTemplateVariables(template: string, variables: Record<string, string>) {
    return template.replace(/\{(\w+)\}/g, (match, key) => variables[key] || match)
  },

  async getEmailsByAccount(account: 'info' | 'inschrijving') {
    return emailService.getEmails(account)
  },

  async getEmailDetails(id: string): Promise<Email | null> {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
} 