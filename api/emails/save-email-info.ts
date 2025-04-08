import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// Initialiseer Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface EmailPayload {
  sender: string
  subject: string
  body: string
  html?: string
  account: 'info' | 'inschrijving'
  message_id?: string
  attachments?: {
    filename: string
    content_type: string
    size: number
    url?: string
  }[]
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
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

    // Valideer de payload
    if (!payload.sender || !payload.subject || !payload.body) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Sla op in Supabase
    const { data, error } = await supabase
      .from('emails')
      .insert({
        sender: payload.sender,
        subject: payload.subject,
        body: payload.body,
        html: payload.html,
        account: payload.account,
        message_id: payload.message_id,
        attachments: payload.attachments,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return res.status(200).json(data)
  } catch (error) {
    console.error('Error saving email:', error)
    return res.status(500).json({ error: 'Failed to save email' })
  }
} 