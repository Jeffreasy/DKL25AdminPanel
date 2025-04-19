import { supabase } from '../../lib/supabase'
import type { AutoResponse, Email } from './types'
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

// Helper functie om te mappen van backend model naar frontend model
function mapIncomingEmailToEmail(incomingEmail: any): Email {
  // Backend stuurt gedecodeerde/gesanitized body in 'html' veld
  const decodedContent = incomingEmail.html || ''; 

  return {
    // Voeg defaults toe voor robuustheid
    id: incomingEmail.id || incomingEmail.ID || '', 
    sender: incomingEmail.sender || '', 
    subject: incomingEmail.subject || incomingEmail.Subject || '(Geen onderwerp)', 
    // Sla gedecodeerde content op in beide velden, laat Detail renderen
    body: decodedContent, 
    html: decodedContent, 
    account: incomingEmail.account_type || incomingEmail.AccountType || 'info',
    message_id: incomingEmail.message_id || incomingEmail.MessageID || '',
    created_at: incomingEmail.received_at || incomingEmail.ReceivedAt || new Date().toISOString(),
    read: typeof incomingEmail.read === 'boolean' ? incomingEmail.read : false, 
    metadata: { // Voeg defaults toe
      'return-path': incomingEmail.sender || '',
      'delivered-to': incomingEmail.to || incomingEmail.To || '',
      'content-type': incomingEmail.content_type || incomingEmail.ContentType || '',
      'reply-to': incomingEmail.sender || ''
    },
    created_at_system: incomingEmail.created_at || incomingEmail.CreatedAt || new Date().toISOString(),
  };
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

interface FetchResponse {
  message: string;
  fetched_count: number;
  saved_count: number;
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
        } catch (e) { /* Ignore parsing error */ }
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

  // Haal emails op voor een specifiek account met paginering
  async getEmailsByAccount(account: 'info' | 'inschrijving', limit: number = 50, offset: number = 0): Promise<{ emails: Email[], totalCount: number }> { // Updated return type
    console.log(`[getEmailsByAccount] Fetching for ${account}, limit=${limit}, offset=${offset}`);
    try {
      // Backend endpoint met pagination parameters
      const url = `${API_BASE_URL}/api/mail/account/${account}?limit=${limit}&offset=${offset}`;
      
      const headers = getAuthHeaders();
      const response = await fetch(url, { headers });
      console.log(`[getEmailsByAccount] Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`Error fetching emails: ${response.statusText}`);
      }
      
      // Backend now returns an object { emails: [], totalCount: number }
      const data = await response.json(); 
      console.log('[getEmailsByAccount] Raw data received:', data);
      
      // Basic validation of the expected structure
      if (!data || typeof data !== 'object' || !Array.isArray(data.emails) || typeof data.totalCount !== 'number') {
          console.error("[getEmailsByAccount] API response is not in the expected format { emails: [], totalCount: number }:", data);
          throw new Error("Onverwacht formaat ontvangen van de email API.");
      }

      // Map the emails array
      const emailsArray = data.emails.map(mapIncomingEmailToEmail);
      console.log('[getEmailsByAccount] Mapped emailsArray:', emailsArray);

      // Return the structured data
      return {
        emails: emailsArray,
        totalCount: data.totalCount 
      };
    } catch (error) {
      console.error('[getEmailsByAccount] Failed to fetch emails:', error);
      throw error;
    }
  },

  async getEmailDetails(id: string): Promise<Email | null> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mail/${id}`, {
        headers
      });
      
      if (!response.ok) {
         if (response.status === 404) return null; // Handle not found gracefully
        throw new Error(`Error fetching email details: ${response.statusText}`);
      }
      
      const data = await response.json();
      return mapIncomingEmailToEmail(data);
    } catch (error) {
      console.error('Failed to fetch email details:', error);
      throw error;
    }
  },

  async markAsRead(id: string, read: boolean) {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mail/${id}/processed`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ processed: read })
      });
      
      if (!response.ok) {
        throw new Error(`Error marking email as read: ${response.statusText}`);
      }
      // Return success status
       return { success: true };
    } catch (error) {
      console.error('Failed to mark email as read:', error);
      throw error;
    }
  },

  async getUnreadCount() {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mail/unprocessed`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching unread emails: ${response.statusText}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data.length : 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      throw error;
    }
  },

  // Verwijder een email
  async deleteEmail(id: string): Promise<{ success: boolean }> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mail/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        // Probeer error message te parsen indien mogelijk
         const errorText = await response.text().catch(() => 'Failed to get error details');
         let errorMessage = `Error deleting email: ${response.statusText}`;
         try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorJson.message || errorMessage;
         } catch (e) { /* Ignore parsing error */ }
        throw new Error(errorMessage);
      }

      // Geen body verwacht bij succesvolle DELETE
      return { success: true };
    } catch (error) {
      console.error('Failed to delete email:', error);
      throw error; // Re-throw voor de UI laag
    }
  },

  // Trigger het ophalen van nieuwe emails
  async fetchNewEmails(): Promise<FetchResponse> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mail/fetch`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to get error details');
        let errorMessage = `Error fetching new emails: ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch (e) { /* Ignore parsing error */ }
        throw new Error(errorMessage);
      }

      const data: FetchResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to trigger email fetch:', error);
      throw error; // Re-throw voor de UI laag
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
        } catch (e) { /* Ignore parsing error */ }
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
  }
} 