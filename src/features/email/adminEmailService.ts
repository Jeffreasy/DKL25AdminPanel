import { supabase } from '../../api/client/supabase'
import type { AutoResponse, Email, PaginatedEmailResponse, EmailFetchResponse } from './types'
import type { Aanmelding } from '../aanmeldingen/types'

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

// API configuratie
const API_BASE_URL = import.meta.env.VITE_EMAIL_API_URL || 'https://dklemailservice.onrender.com';
const API_KEY = import.meta.env.VITE_EMAIL_API_KEY || '';

// Helper functie voor het toevoegen van de auth header
const getAuthHeaders = () => {
  // Basis headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  // Voeg Authorization header toe als API_KEY niet leeg is
  if (API_KEY && API_KEY.trim() !== '') {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  } else {
    console.warn('API key is leeg. Zorg ervoor dat VITE_EMAIL_API_KEY is ingesteld in de .env file.');
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

// Functie voor het versturen van bevestigingse-mails (behouden voor compatibiliteit)
async function sendEmail(url: string, aanmelding: Aanmelding): Promise<void> {
  try {
    console.log(`Attempting to send email via ${url}`)
    
    const payload = {
      to: aanmelding.email,
      naam: aanmelding.naam,
      rol: aanmelding.rol,
      afstand: aanmelding.afstand,
      ondersteuning: aanmelding.ondersteuning,
      bijzonderheden: aanmelding.bijzonderheden || ''
    }
    
    console.log('Request payload:', payload)
    
    const headers = getAuthHeaders();
    const response = await fetch(`${url}/api/email/send-confirmation`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    console.log(`Raw response from ${url}:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Response error text:', errorText)
      
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
    console.log('Parsed response data:', data)
    
    if (!data.success) {
      throw new Error(data.message || 'Email service returned failure status')
    }

  } catch (error) {
    console.error(`Failed to send email via ${url}:`, error)
    throw error
  }
}

// Behouden voor compatibiliteit
export async function sendConfirmationEmail(aanmelding: Aanmelding): Promise<void> {
  console.log('Starting email send process for:', aanmelding.email)

  let lastError: Error | null = null

  // Probeer eerst development
  try {
    const DEV_API_URL = import.meta.env.VITE_DEV_API_URL || 'http://localhost:5173'
    console.log('Attempting development server...')
    await sendEmail(DEV_API_URL, aanmelding)
    console.log('Successfully sent via development server')
    return
  } catch (error) {
    console.warn('Development server failed:', error)
    lastError = error as Error
  }
    
  // Probeer productie als fallback
  try {
    const PROD_API_URL = import.meta.env.VITE_APP_URL
    console.log('Attempting production server...')
    await sendEmail(PROD_API_URL, aanmelding)
    console.log('Successfully sent via production server')
    return
  } catch (error) {
    console.error('Production server also failed:', error)
    
    // Combineer de errors voor een betere error message
    throw new Error(
      'Kon geen verbinding maken met de email service. ' +
      `Development error: ${lastError?.message}. ` +
      `Production error: ${(error as Error).message}`
    )
  }
}


interface SendAdminMailPayload {
  to: string; // Comma-separated if multiple
  subject: string;
  body: string; // Assumed to be HTML
  from?: string; // Add optional from field
}

export const adminEmailService = {
  // N8N email functie - VERWIJDERD
  // async sendViaN8N(params: SendEmailParams) { ... }

  // Admin email versturen (nu via custom backend API)
  async sendAdminEmail(params: SendEmailParams): Promise<{ success: boolean; id?: string }> {
    try {
      // Aanroep naar de custom backend API
      const url = `${API_BASE_URL}/api/mail/send`; // Aanname: endpoint bestaat
      const headers = getAuthHeaders();
      
      const payload = {
          from: params.from,
          to: Array.isArray(params.to) ? params.to.join(',') : params.to,
          subject: params.subject,
        html: params.body || '', // Gebruik html ipv body? Of beide?
          replyTo: params.replyTo,
        template: params.template, // Ondersteunt backend templates?
        templateVariables: params.template_variables // Ondersteunt backend dit?
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to get error details');
        let errorMessage = `Error sending email via backend: ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch { /* Ignore parsing error */ }
        throw new Error(errorMessage);
      }

      const result = await response.json(); // Wat retourneert de backend?
      const emailId = result?.id || result?.messageId || undefined; // Probeer een ID te vinden voor logging

      // Log het event als het versturen succesvol leek
      await this.logEmailEvent({
        event_type: 'sent',
        from_email: params.from,
        to_email: Array.isArray(params.to) ? params.to.join(', ') : params.to,
        subject: params.subject,
        email_id: emailId || 'unknown' // Gebruik ID van backend response indien beschikbaar
      });

      return { success: true, id: emailId };

    } catch (error) {
      console.error('Failed to send admin email:', error);
      // Loggen dat het versturen mislukt is?
      // await this.logEmailEvent({ event_type: 'send_failed', ... });
      throw error; // Re-throw voor de UI
    }
  },

  // Autoresponse functies (blijven werken via aangepaste sendAdminEmail)
  async sendAutoResponse(triggerEvent: string, variables: Record<string, string>) {
    const { data: autoResponse } = await supabase
      .from('email_autoresponse')
      .select('*')
      .eq('trigger_event', triggerEvent)
      .eq('is_active', true)
      .single()

    if (!autoResponse) return

    // Roep de aangepaste sendAdminEmail aan
    return this.sendAdminEmail({
      to: variables.email,
      from: 'no-reply@dekoninklijkeloop.nl', // Moet dit configureerbaar zijn?
      subject: autoResponse.subject,
      template: autoResponse.name, // Backend moet dit ondersteunen
      template_variables: variables // Backend moet dit ondersteunen
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
        // Log de error maar laat de applicatie doordraaien
        console.error('Failed to log email event:', error)
        
        // Als de tabel niet bestaat, probeer deze aan te maken
        if (error.code === '42P01') {
          console.log('Email events table does not exist, application will continue')
        }
      }
    } catch (error) {
      // Vang alle errors op maar laat de applicatie doordraaien
      console.error('Error in logEmailEvent:', error)
    }
  },

  // Email verificatie - VERWIJDERD
  // async verifyEmailAddress(email: string) { ... }
  // async checkEmailVerification(email: string): Promise<boolean> { ... }

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

  /**
   * Haal alle emails op met paginering (niet gefilterd op account)
   * GET /api/mail?limit=:limit&offset=:offset
   * Komt overeen met PART 3 "Lijst Emails Ophalen (Paginated)"
   */
  async getAllEmails(
    limit: number = 10,
    offset: number = 0
  ): Promise<PaginatedEmailResponse> {
    console.log(`[getAllEmails] Fetching emails, limit=${limit}, offset=${offset}`)
    try {
      const url = `${API_BASE_URL}/api/mail?limit=${limit}&offset=${offset}`
      const headers = getAuthHeaders()
      const response = await fetch(url, { headers })
      
      console.log(`[getAllEmails] Response status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`Error fetching emails: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('[getAllEmails] Raw data received:', data)
      
      // Valideer response structuur
      if (!data || typeof data !== 'object' || !Array.isArray(data.emails) || typeof data.totalCount !== 'number') {
        console.error('[getAllEmails] Unexpected API response format:', data)
        throw new Error('Onverwacht formaat ontvangen van de email API')
      }

      // Map emails naar frontend interface
      const emails = data.emails.map(mapIncomingEmailToEmail)
      console.log('[getAllEmails] Mapped emails:', emails)

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
    console.log(`[getEmailsByAccount] Fetching for ${account}, limit=${limit}, offset=${offset}`)
    try {
      const url = `${API_BASE_URL}/api/mail/account/${account}?limit=${limit}&offset=${offset}`
      const headers = getAuthHeaders()
      const response = await fetch(url, { headers })
      
      console.log(`[getEmailsByAccount] Response status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`Error fetching emails: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('[getEmailsByAccount] Raw data received:', data)
      
      // Valideer response structuur
      if (!data || typeof data !== 'object' || !Array.isArray(data.emails) || typeof data.totalCount !== 'number') {
        console.error('[getEmailsByAccount] Unexpected API response format:', data)
        throw new Error('Onverwacht formaat ontvangen van de email API')
      }

      // Map emails naar frontend interface
      const emails = data.emails.map(mapIncomingEmailToEmail)
      console.log('[getEmailsByAccount] Mapped emails:', emails)

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
      const headers = getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/mail/${id}`, { headers })
      
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
      const headers = getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/mail/${id}/processed`, {
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
      const headers = getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/mail/unprocessed`, { headers })
      
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
      const headers = getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/mail/${id}`, {
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
      const headers = getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/api/mail/fetch`, {
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

  // NIEUW: Functie om email te versturen als ingelogde admin (via JWT)
  async sendMailAsAdmin(payload: SendAdminMailPayload): Promise<{ success: boolean }> {
    console.log('[sendMailAsAdmin] Attempting to send email:', payload);
    try {
      // 1. Haal de huidige Supabase sessie en token op
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[sendMailAsAdmin] Error getting session:', sessionError);
        throw new Error('Kon gebruikerssessie niet ophalen.');
      }
      if (!session) {
        console.error('[sendMailAsAdmin] No active session found.');
        throw new Error('Geen actieve gebruikerssessie gevonden. Log opnieuw in.');
      }
      const token = session.access_token;

      // 2. Haal de basis URL van de Vercel/Supabase backend op
      const apiUrl = import.meta.env.VITE_API_URL || '';
      if (!apiUrl) {
        console.error('[sendMailAsAdmin] VITE_API_URL is not configured.');
        throw new Error('API URL niet geconfigureerd.');
      }

      // 3. Bouw de headers met JWT
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // 4. Maak de API call naar het nieuwe endpoint
      const url = `${apiUrl}/api/admin/mail/send`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: payload.to, // Backend verwacht komma-gescheiden string
          subject: payload.subject,
          body: payload.body, // Backend verwacht HTML body
          from: payload.from // Pass the 'from' field to the backend API
        })
      });
      console.log(`[sendMailAsAdmin] Response status from ${url}: ${response.status}`);

      // 5. Handel de response af
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to get error details');
        let errorMessage = `Error sending email via ${url}: ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch { /* Ignore parsing error */ }
        console.error(`[sendMailAsAdmin] Error response: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      // Success
      console.log('[sendMailAsAdmin] Email sent successfully.');
      return { success: true };

    } catch (error) {
      console.error('[sendMailAsAdmin] Failed:', error);
      throw error; // Re-throw voor de UI laag om af te handelen
    }
  },

  // NIEUW: Haal unieke emailadressen op van aanmeldingen
  async fetchAanmeldingenEmails(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('aanmeldingen')
        .select('email')
        // .neq('email', '') // Optional: exclude empty emails if they can exist
        // .not('email', 'is', null); // Optional: exclude null emails

      if (error) {
        console.error('Error fetching aanmeldingen emails:', error);
        throw error;
      }

      // Haal unieke, niet-lege emails op
      const emails = data
        ?.map(item => item.email)
        .filter((email): email is string => !!email && email.trim() !== ''); 
        
      return [...new Set(emails)]; // Return unique emails

    } catch (error) {
      console.error('Failed in fetchAanmeldingenEmails:', error);
      return []; // Return empty array on failure
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
      // Haal Supabase sessie op voor JWT auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('[reprocessEmails] Error getting session:', sessionError)
        throw new Error('Kon gebruikerssessie niet ophalen')
      }
      if (!session) {
        console.error('[reprocessEmails] No active session found')
        throw new Error('Geen actieve gebruikerssessie gevonden. Log opnieuw in')
      }
      const token = session.access_token

      // Roep admin endpoint aan
      const url = `${API_BASE_URL}/api/admin/mail/reprocess`
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