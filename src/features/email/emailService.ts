import type { Aanmelding } from '../aanmeldingen/types'
import { supabase } from '../../lib/supabase'

// URLs uit environment variables
const PROD_API_URL = import.meta.env.VITE_APP_URL
const DEV_API_URL = import.meta.env.VITE_DEV_API_URL || 'http://localhost:5173'

interface EmailResponse {
  success: boolean
  message?: string
  error?: string
}

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

    const response = await fetch(`${url}/api/email/send-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

export async function sendConfirmationEmail(aanmelding: Aanmelding): Promise<void> {
  console.log('Starting email send process for:', aanmelding.email)

  let lastError: Error | null = null

  // Probeer eerst development
  try {
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

interface EmailFilters {
  account?: 'info' | 'inschrijving'
  read?: boolean
  search?: string
  limit?: number
  offset?: number
}

interface Email {
  id: string
  sender: string
  subject: string
  body: string
  html: string
  account: 'info' | 'inschrijving'
  message_id: string
  attachments: Array<{
    filename: string
    content_type: string
    size: number
    url?: string
  }>
  read: boolean
  created_at: string
}

export const emailService = {
  async getEmails(filters: EmailFilters = {}) {
    try {
      let query = supabase
        .from('emails')
        .select('*', { count: 'exact' })

      if (filters.account) {
        query = query.eq('account', filters.account)
      }

      if (filters.read !== undefined) {
        query = query.eq('read', filters.read)
      }

      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,body.ilike.%${filters.search}%`)
      }

      query = query.order('created_at', { ascending: false })

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error, count } = await query

      if (error) throw error
      
      return {
        items: data as Email[],
        total: count || 0
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
      throw error
    }
  },

  async markAsRead(id: string, read: boolean = true) {
    const { error } = await supabase
      .from('emails')
      .update({ read, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  async getEmailById(id: string) {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Email
  }
} 