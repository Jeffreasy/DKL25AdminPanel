import type { Aanmelding } from '../aanmeldingen/types'
import { supabase } from '../../lib/supabase'
import { Email } from './types'

// URLs uit environment variables
const PROD_API_URL = import.meta.env.VITE_APP_URL
const DEV_API_URL = import.meta.env.VITE_DEV_API_URL || 'http://localhost:5173'
const API_KEY = import.meta.env.VITE_N8N_API_KEY

// Helper functie voor het toevoegen van de API key
const addApiKey = (url: string) => {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}apikey=${API_KEY}`
}

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

    // Gebruik de helper functie om de API key toe te voegen
    const apiUrl = addApiKey(`${url}/api/email/send-confirmation`)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY
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

export const emailService = {
  async getEmails(account?: string) {
    let query = supabase
      .from('emails')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (account) {
      query = query.eq('account', account)
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching emails:', error)
      throw error
    }
    return data as Email[]
  },

  async markAsRead(id: string, read: boolean) {
    const { error } = await supabase
      .from('emails')
      .update({ read })
      .eq('id', id)

    if (error) throw error
  },

  async getUnreadCount() {
    const { count, error } = await supabase
      .from('emails')
      .select('*', { count: 'exact' })
      .eq('read', false)

    if (error) throw error
    return count || 0
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