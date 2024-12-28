import { MAILGUN_API_KEY, MAILGUN_DOMAIN } from '../config'

export async function sendEmail(params: {
  to: string
  from: string
  subject: string
  html: string
  'h:Reply-To'?: string
}) {
  const response = await fetch(`https://api.eu.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params)
  })

  if (!response.ok) {
    const text = await response.text()
    let error
    try {
      error = JSON.parse(text)
    } catch {
      error = { message: text }
    }
    throw new Error(error.message || `Failed to send email: ${response.status}`)
  }

  return response.json()
}

export async function verifyEmailAddress(email: string) {
  const response = await fetch(`https://api.eu.mailgun.net/v3/domains/${MAILGUN_DOMAIN}/credentials/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      login: email
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }

  return response.json()
} 