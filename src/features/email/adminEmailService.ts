import { apiConfig, emailConfig } from '../../config/api.config'
import type { AutoResponse, Email, PaginatedEmailResponse, EmailFetchResponse, ParticipantEmailsResponse } from './types'
import type { Aanmelding } from '../aanmeldingen/types'

// Email types for different SMTP configurations
export type EmailType = 'contact' | 'aanmelding' | 'newsletter' | 'wfc_order'

// SMTP configuration types
export interface SMTPConfig {
  host: string
  port: number
  username: string
  password: string
  from: string
  ssl?: boolean
}

// Email batching types
export interface EmailMessage {
  to: string
  subject: string
  body: string
  type: EmailType
}

// Rate limiting types
export interface RateLimitInfo {
  allowed: boolean
  remaining: number
  resetTime: number
}

// Email processing types
export interface EmailProcessingResult {
  success: boolean
  message: string
  processed: number
  failed: number
}


// Helper to get JWT token from localStorage
const getAuthToken = (): string | null => {
  try {
    // Match apiClient's token storage key
    const token = localStorage.getItem('auth_token')
    return token
  } catch {
    return null
  }
}

interface SendEmailParams {
  to: string | string[]
  subject: string
  body?: string
  from?: string
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

// Helper functie voor het toevoegen van de auth header
const getAuthHeaders = (useJWT: boolean = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (useJWT) {
    const token = getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  } else if (apiConfig.emailApiKey && apiConfig.emailApiKey.trim() !== '') {
    headers['Authorization'] = `Bearer ${apiConfig.emailApiKey}`;
  } else {
    console.warn('Email API key is niet ingesteld. Zorg ervoor dat VITE_EMAIL_API_KEY is ingesteld in de .env file.');
  }
  
  return headers;
};

/**
 * Helper functie om backend MailResponse te mappen naar frontend Email interface
 * Backend stuurt snake_case, wij gebruiken ook snake_case volgens PART 3 docs
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapIncomingEmailToEmail(incomingEmail: any): Email {
  return {
    id: incomingEmail.id || '',
    message_id: incomingEmail.message_id || '',
    sender: incomingEmail.sender || '',
    to: incomingEmail.to || '',
    subject: incomingEmail.subject || '(Geen onderwerp)',
    html: incomingEmail.html || '',
    content_type: incomingEmail.content_type || 'text/plain',
    received_at: incomingEmail.received_at || new Date().toISOString(),
    uid: incomingEmail.uid || '',
    account_type: (incomingEmail.account_type || 'info') as 'info' | 'inschrijving',
    read: typeof incomingEmail.read === 'boolean' ? incomingEmail.read : false,
    processed_at: incomingEmail.processed_at || null,
    created_at: incomingEmail.created_at || new Date().toISOString(),
    updated_at: incomingEmail.updated_at || new Date().toISOString()
  }
}

interface EmailResponse {
  success: boolean
  message?: string
  error?: string
}

// Functie voor het versturen van bevestigingse-mails (gebruikt unified send functie)
export async function sendConfirmationEmail(aanmelding: Aanmelding): Promise<void> {
  console.log('Starting email send process for:', aanmelding.email)

  try {
    const payload = {
      to: aanmelding.email,
      naam: aanmelding.naam,
      rol: aanmelding.rol,
      afstand: aanmelding.afstand,
      ondersteuning: aanmelding.ondersteuning,
      bijzonderheden: aanmelding.bijzonderheden || ''
    }

    const headers = getAuthHeaders(true)
    const response = await fetch(`${apiConfig.emailURL}/api/email/send-confirmation`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData: { message?: string }
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }
      
      throw new Error(
        errorData.message ||
        `Server responded with ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json() as EmailResponse
    if (!data.success) {
      throw new Error(data.message || 'Email service returned failure status')
    }

  } catch (error) {
    console.error('Failed to send confirmation email:', error)
    throw error
  }
}

export const adminEmailService = {
  /**
   * Unified email send functie
   * Gebruikt Go backend email API
   */
  async sendEmail(params: SendEmailParams): Promise<{ success: boolean; id?: string }> {
    try {
      // Check for JWT token
      const token = getAuthToken()
      const useAuthEndpoint = !!token
      
      // Use Go backend URL
      const url = `${apiConfig.emailURL}/api/mail/send`
      const headers = getAuthHeaders(useAuthEndpoint)
      
      const payload = {
        from: params.from || emailConfig.defaultFromAddress,
        to: Array.isArray(params.to) ? params.to.join(',') : params.to,
        subject: params.subject,
        body: params.body || '',
        html: params.body || '',
        replyTo: params.replyTo,
        template: params.template,
        templateVariables: params.template_variables
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to get error details')
        let errorMessage = `Error sending email: ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorJson.message || errorMessage
        } catch { /* Ignore parsing error */ }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      const emailId = result?.id || result?.messageId || undefined

      // Log het event
      await this.logEmailEvent({
        event_type: 'sent',
        from_email: params.from || emailConfig.defaultFromAddress,
        to_email: Array.isArray(params.to) ? params.to.join(', ') : params.to,
        subject: params.subject,
        email_id: emailId || 'unknown'
      })

      return { success: true, id: emailId }

    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  },

  /**
   * Get autoresponse templates from Go backend
   * GET /api/mail/autoresponse?trigger=:event&active=true
   */
  async sendAutoResponse(triggerEvent: string, variables: Record<string, string>) {
    try {
      const headers = getAuthHeaders(true)
      const response = await fetch(
        `${apiConfig.emailURL}/api/mail/autoresponse?trigger=${triggerEvent}&active=true`,
        { headers }
      )

      if (!response.ok) {
        console.error('Failed to fetch autoresponse template')
        return
      }

      const autoResponse = await response.json() as AutoResponse
      if (!autoResponse) return

      return this.sendEmail({
        to: variables.email,
        from: emailConfig.defaultFromAddress,
        subject: autoResponse.subject,
        template: autoResponse.name,
        template_variables: variables
      })
    } catch (error) {
      console.error('Error in sendAutoResponse:', error)
    }
  },

  /**
   * Log email events to Go backend
   * POST /api/mail/events
   */
  async logEmailEvent(event: EmailEventData) {
    try {
      const headers = getAuthHeaders(true)
      const response = await fetch(`${apiConfig.emailURL}/api/mail/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...event,
          timestamp: event.timestamp || new Date().toISOString(),
          metadata: {}
        })
      })

      if (!response.ok) {
        console.error('Failed to log email event:', await response.text())
      }
    } catch (error) {
      // Vang alle errors op maar laat de applicatie doordraaien
      console.error('Error in logEmailEvent:', error)
    }
  },

  // Email verificatie - VERWIJDERD
  // async verifyEmailAddress(email: string) { ... }
  // async checkEmailVerification(email: string): Promise<boolean> { ... }

  /**
   * Autoresponse management via Go backend
   */
  async getAutoResponses(): Promise<AutoResponse[]> {
    try {
      const headers = getAuthHeaders(true)
      const response = await fetch(`${apiConfig.emailURL}/api/mail/autoresponse`, { headers })
      
      if (!response.ok) {
        throw new Error('Failed to fetch autoresponses')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching autoresponses:', error)
      throw error
    }
  },

  async createAutoResponse(autoResponse: Omit<AutoResponse, 'id' | 'created_at' | 'updated_at'>): Promise<AutoResponse> {
    try {
      const headers = getAuthHeaders(true)
      const response = await fetch(`${apiConfig.emailURL}/api/mail/autoresponse`, {
        method: 'POST',
        headers,
        body: JSON.stringify(autoResponse)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create autoresponse')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating autoresponse:', error)
      throw error
    }
  },

  async updateAutoResponse(id: string, updates: Partial<AutoResponse>): Promise<AutoResponse> {
    try {
      const headers = getAuthHeaders(true)
      const response = await fetch(`${apiConfig.emailURL}/api/mail/autoresponse/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update autoresponse')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating autoresponse:', error)
      throw error
    }
  },

  async deleteAutoResponse(id: string): Promise<void> {
    try {
      const headers = getAuthHeaders(true)
      const response = await fetch(`${apiConfig.emailURL}/api/mail/autoresponse/${id}`, {
        method: 'DELETE',
        headers
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete autoresponse')
      }
    } catch (error) {
      console.error('Error deleting autoresponse:', error)
      throw error
    }
  },

  // Helper functie
  replaceTemplateVariables(template: string, variables: Record<string, string>) {
    return template.replace(/\{(\w+)\}/g, (match, key) => variables[key] || match)
  },

  /**
   * Haal alle emails op met paginering (niet gefilterd op account)
   * GET /api/mail?limit=:limit&offset=:offset
   * Komt overeen met PART 3 "Lijst Emails Ophalen (Paginated)"
   */
  async getAllEmails(
    limit: number = 10,
    offset: number = 0
  ): Promise<PaginatedEmailResponse> {
    try {
      const url = `${apiConfig.emailURL}/api/mail?limit=${limit}&offset=${offset}`
      const headers = getAuthHeaders(true)
      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error(`Error fetching emails: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Valideer response structuur
      if (!data || typeof data !== 'object' || !Array.isArray(data.emails) || typeof data.totalCount !== 'number') {
        console.error('[getAllEmails] Unexpected API response format:', data)
        throw new Error('Onverwacht formaat ontvangen van de email API')
      }

      // Map emails naar frontend interface
      const emails = data.emails.map(mapIncomingEmailToEmail)

      return {
        emails,
        totalCount: data.totalCount
      }
    } catch (error) {
      console.error('[getAllEmails] Failed to fetch emails:', error)
      throw error
    }
  },

  /**
   * Haal emails op voor specifiek account met paginering
   * GET /api/mail/account/:type?limit=:limit&offset=:offset
   * Komt overeen met PART 3 "Filter Op Account Type"
   */
  async getEmailsByAccount(
    account: 'info' | 'inschrijving',
    limit: number = 50,
    offset: number = 0
  ): Promise<PaginatedEmailResponse> {
    try {
      const url = `${apiConfig.emailURL}/api/mail/account/${account}?limit=${limit}&offset=${offset}`
      const headers = getAuthHeaders(true)
      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error(`Error fetching emails: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Valideer response structuur
      if (!data || typeof data !== 'object' || !Array.isArray(data.emails) || typeof data.totalCount !== 'number') {
        console.error('[getEmailsByAccount] Unexpected API response format:', data)
        throw new Error('Onverwacht formaat ontvangen van de email API')
      }

      // Map emails naar frontend interface
      const emails = data.emails.map(mapIncomingEmailToEmail)

      return {
        emails,
        totalCount: data.totalCount
      }
    } catch (error) {
      console.error('[getEmailsByAccount] Failed to fetch emails:', error)
      throw error
    }
  },

  /**
   * Haal specifieke email op
   * GET /api/mail/:id
   * Komt overeen met PART 3 "Specifieke Email Ophalen"
   */
  async getEmailDetails(id: string): Promise<Email | null> {
    try {
      const headers = getAuthHeaders(true)
      const response = await fetch(`${apiConfig.emailURL}/api/mail/${id}`, { headers })
      
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`Error fetching email details: ${response.statusText}`)
      }
      
      const data = await response.json()
      return mapIncomingEmailToEmail(data)
    } catch (error) {
      console.error('Failed to fetch email details:', error)
      throw error
    }
  },

  /**
   * Markeer email als verwerkt/gelezen
   * PUT /api/mail/:id/processed
   * Komt overeen met PART 3 "Markeer Als Verwerkt"
   * Let op: Backend endpoint accepteert geen body parameters
   */
  async markAsRead(id: string): Promise<{ success: boolean }> {
    try {
      const headers = getAuthHeaders(true)
      const response = await fetch(`${apiConfig.emailURL}/api/mail/${id}/processed`, {
        method: 'PUT',
        headers
      })
      
      if (!response.ok) {
        throw new Error(`Error marking email as read: ${response.statusText}`)
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to mark email as read:', error)
      throw error
    }
  },

  /**
   * Haal aantal onverwerkte emails op
   * GET /api/mail/unprocessed
   * Komt overeen met PART 3 "Onverwerkte Emails Ophalen"
   */
  async getUnreadCount(): Promise<number> {
    try {
      const headers = getAuthHeaders(true)
      const response = await fetch(`${apiConfig.emailURL}/api/mail/unprocessed`, { headers })
      
      if (!response.ok) {
        throw new Error(`Error fetching unread emails: ${response.statusText}`)
      }
      
      const data = await response.json()
      return Array.isArray(data) ? data.length : 0
    } catch (error) {
      console.error('Failed to get unread count:', error)
      throw error
    }
  },

  /**
   * Verwijder een email
   * DELETE /api/mail/:id
   * Komt overeen met PART 3 "Email Verwijderen"
   */
  async deleteEmail(id: string): Promise<{ success: boolean }> {
    try {
      const headers = getAuthHeaders(true)
      const response = await fetch(`${apiConfig.emailURL}/api/mail/${id}`, {
        method: 'DELETE',
        headers
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to get error details')
        let errorMessage = `Error deleting email: ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorJson.message || errorMessage
        } catch { /* Ignore parsing error */ }
        throw new Error(errorMessage)
      }

      return { success: true }
    } catch (error) {
      console.error('Failed to delete email:', error)
      throw error
    }
  },

  /**
   * Trigger manueel ophalen van nieuwe emails van mailserver
   * POST /api/mail/fetch
   * Komt overeen met PART 3 "Nieuwe Emails Ophalen (Manual Fetch)"
   */
  async fetchNewEmails(): Promise<EmailFetchResponse> {
    try {
      const headers = getAuthHeaders(true)
      const response = await fetch(`${apiConfig.emailURL}/api/mail/fetch`, {
        method: 'POST',
        headers
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to get error details')
        let errorMessage = `Error fetching new emails: ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorJson.message || errorMessage
        } catch { /* Ignore parsing error */ }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return {
        message: data.message || 'Emails opgehaald',
        fetchTime: data.fetchTime || new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to trigger email fetch:', error)
      throw error
    }
  },

  /**
   * Haal unieke emailadressen op van emails in de inboxen (info en inschrijving)
   * GET /api/mail (en filter unieke sender emails eruit)
   * Fallback naar participant emails als er geen inbox emails zijn
   * @deprecated Gebruik getParticipantEmails voor uitgebreide response
   */
  async fetchAanmeldingenEmails(): Promise<string[]> {
    try {
      // Haal emails op uit beide inboxen om sender emails te verzamelen
      const [infoEmails, inschrijvingEmails] = await Promise.all([
        this.getEmailsByAccount('info', 100, 0),
        this.getEmailsByAccount('inschrijving', 100, 0)
      ])

      // Verzamel alle unieke sender emails
      const allEmails = [
        ...infoEmails.emails.map(email => email.sender),
        ...inschrijvingEmails.emails.map(email => email.sender)
      ]

      // Filter geldige emails en verwijder duplicaten
      const uniqueEmails = allEmails
        .filter((email): email is string => !!email && email.trim() !== '' && email.includes('@'))
        .filter((email, index, arr) => arr.indexOf(email) === index) // unieke emails

      // Als er geen emails zijn uit de inboxen, gebruik participant emails als fallback
      if (uniqueEmails.length === 0) {
        const participantResult = await this.getParticipantEmails()
        return participantResult.all_emails || []
      }

      return uniqueEmails
    } catch (error) {
      console.error('Failed in fetchAanmeldingenEmails:', error)
      // Fallback naar participant emails bij error
      try {
        const participantResult = await this.getParticipantEmails()
        return participantResult.all_emails || []
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
        return []
      }
    }
  },

  /**
   * Haal uitgebreide email informatie op van deelnemers en systeem emails
   * GET /api/participant/emails
   * Retourneert participant_emails, system_emails, all_emails en counts
   */
  async getParticipantEmails(): Promise<ParticipantEmailsResponse> {
    try {
      const headers = getAuthHeaders(true)
      const response = await fetch(`${apiConfig.emailURL}/api/participant/emails`, { headers })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to get error details')
        let errorMessage = `Error fetching participant emails: ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorJson.message || errorMessage
        } catch { /* Ignore parsing error */ }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Valideer response structuur
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from participant emails API')
      }

      // Zorg ervoor dat alle velden aanwezig zijn met defaults
      const result: ParticipantEmailsResponse = {
        participant_emails: Array.isArray(data.participant_emails) ? data.participant_emails : [],
        system_emails: Array.isArray(data.system_emails) ? data.system_emails : [],
        all_emails: Array.isArray(data.all_emails) ? data.all_emails : [],
        counts: {
          participants: typeof data.counts?.participants === 'number' ? data.counts.participants : 0,
          system: typeof data.counts?.system === 'number' ? data.counts.system : 0,
          total: typeof data.counts?.total === 'number' ? data.counts.total : 0
        }
      }

      return result
    } catch (error) {
      console.error('Failed to fetch participant emails:', error)
      throw error
    }
  },

  /**
   * Reprocess alle bestaande emails met verbeterde decoder
   * POST /api/admin/mail/reprocess
   * 
   * Dit endpoint reprocessed alle emails in de database met de nieuwe
   * email decoder die:
   * - Quoted-printable encoding correct decodeert (=92, =85, etc.)
   * - Multipart MIME emails correct parseert
   * - Charset conversie uitvoert (Windows-1252, ISO-8859-1, etc.)
   * - MIME boundaries verwijdert
   * 
   * Gebruik dit na backend updates om oude emails schoon te maken
   */
  async reprocessEmails(): Promise<{
    success: boolean
    message: string
    processed: number
    failed: number
  }> {
    try {
      // Get JWT token
      const token = getAuthToken()
      
      if (!token) {
        console.error('[reprocessEmails] No auth token found')
        throw new Error('Geen actieve gebruikerssessie gevonden. Log opnieuw in')
      }

      // Roep Go backend endpoint aan
      const url = `${apiConfig.emailURL}/api/admin/mail/reprocess`
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }

      const response = await fetch(url, {
        method: 'POST',
        headers
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to get error details')
        let errorMessage = `Error reprocessing emails: ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorJson.message || errorMessage
        } catch { /* Ignore parsing error */ }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      return {
        success: result.success || true,
        message: result.message || 'Emails succesvol gereprocessed',
        processed: result.processed || 0,
        failed: result.failed || 0
      }
    } catch (error) {
      console.error('[reprocessEmails] Failed:', error)
      throw error
    }
  }
}