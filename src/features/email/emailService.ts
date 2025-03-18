import type { Aanmelding } from '../aanmeldingen/types'
import { Email } from './types'

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
  return {
    id: incomingEmail.id || incomingEmail.ID,
    sender: incomingEmail.from || incomingEmail.From,
    subject: incomingEmail.subject || incomingEmail.Subject,
    body: incomingEmail.body || incomingEmail.Body,
    html: (incomingEmail.content_type || incomingEmail.ContentType || '').includes('html')
      ? incomingEmail.body || incomingEmail.Body
      : '',
    account: incomingEmail.account_type || incomingEmail.AccountType,
    message_id: incomingEmail.message_id || incomingEmail.MessageID,
    created_at: incomingEmail.received_at || incomingEmail.ReceivedAt,
    read: incomingEmail.is_processed || incomingEmail.IsProcessed,
    metadata: {
      'return-path': incomingEmail.from || incomingEmail.From,
      'delivered-to': incomingEmail.to || incomingEmail.To,
      'content-type': incomingEmail.content_type || incomingEmail.ContentType,
      'reply-to': incomingEmail.from || incomingEmail.From
    },
    created_at_system: incomingEmail.created_at || incomingEmail.CreatedAt
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

export const emailService = {
  // Haal emails op voor een specifiek account
  async getEmails(account?: string) {
    try {
      const url = account 
        ? `${API_BASE_URL}/api/mail/account/${account}`
        : `${API_BASE_URL}/api/mail`;
      
      const headers = getAuthHeaders();
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`Error fetching emails: ${response.statusText}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) 
        ? data.map(email => mapIncomingEmailToEmail(email))
        : [];
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      throw error;
    }
  },

  // Alias voor getEmails met account parameter voor backwards compatibility
  async getEmailsByAccount(account: 'info' | 'inschrijving') {
    return this.getEmails(account);
  },

  // Markeer een email als gelezen/ongelezen
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
    } catch (error) {
      console.error('Failed to mark email as read:', error);
      throw error;
    }
  },

  // Haal het aantal ongelezen emails op
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

  // Haal een specifieke email op
  async getEmailById(id: string) {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/mail/${id}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching email details: ${response.statusText}`);
      }
      
      const data = await response.json();
      return mapIncomingEmailToEmail(data);
    } catch (error) {
      console.error('Failed to fetch email details:', error);
      throw error;
    }
  }
} 