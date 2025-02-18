import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface EmailPayload {
  from: string
  to: string
  subject: string
  html: string
  replyTo?: string
  template?: string
  templateVariables?: Record<string, string>
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload = req.body as EmailPayload
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL

    if (!N8N_WEBHOOK_URL) {
      throw new Error('N8N webhook URL not configured')
    }

    // Forward to N8N
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!n8nResponse.ok) {
      throw new Error('Failed to send email via N8N')
    }

    // Log to Supabase
    const { error: dbError } = await supabase
      .from('email_events')
      .insert({
        event_type: 'sent',
        from_email: payload.from,
        to_email: payload.to,
        subject: payload.subject,
        timestamp: new Date().toISOString()
      })

    if (dbError) {
      console.error('Failed to log email event:', dbError)
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Email send error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    })
  }
} 