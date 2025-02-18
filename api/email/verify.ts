import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.body
    const N8N_VERIFY_WEBHOOK_URL = process.env.N8N_VERIFY_WEBHOOK_URL

    if (!N8N_VERIFY_WEBHOOK_URL) {
      throw new Error('N8N verification webhook URL not configured')
    }

    const response = await fetch(N8N_VERIFY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    if (!response.ok) {
      throw new Error('Failed to verify email via N8N')
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Email verification error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to verify email' 
    })
  }
} 