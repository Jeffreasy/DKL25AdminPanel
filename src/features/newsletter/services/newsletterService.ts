import { authManager } from '../../../lib/auth'
import { handleApiResponse, isPermissionError } from '../../../utils/apiErrorHandler'
import type { Newsletter, CreateNewsletterData, UpdateNewsletterData, NewsletterSendResponse } from '../types'

// API configuration - using the Go backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

// Helper function for auth headers with JWT
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Get JWT token from authManager
  const token = authManager.getToken()
  if (!token) {
    console.error('[newsletterService] No auth token found.')
    throw new Error('Geen actieve gebruikerssessie gevonden. Log opnieuw in.')
  }

  headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function fetchNewsletters(limit: number = 50, offset: number = 0): Promise<{ newsletters: Newsletter[], totalCount: number }> {
  try {
    const headers = getAuthHeaders()
    const url = `${API_BASE_URL}/api/newsletter?limit=${limit}&offset=${offset}`
    const response = await fetch(url, { headers })

    const data = await handleApiResponse<{ newsletters: Newsletter[], total: number }>(response)

    return {
      newsletters: data.newsletters || [],
      totalCount: data.total || 0
    }
  } catch (error) {
    console.error('Failed to fetch newsletters:', error)
    if (isPermissionError(error)) {
      throw new Error(`Geen toegang tot nieuwsbrieven. Vereiste permissie: ${error.requiredPermission}`)
    }
    throw error
  }
}

export async function createNewsletter(newsletterData: CreateNewsletterData): Promise<Newsletter> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/newsletter`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newsletterData)
    })

    const data = await handleApiResponse<Newsletter>(response)
    return data
  } catch (error) {
    console.error('Failed to create newsletter:', error)
    if (isPermissionError(error)) {
      throw new Error(`Geen toegang tot nieuwsbrief aanmaken. Vereiste permissie: ${error.requiredPermission}`)
    }
    throw error
  }
}

export async function updateNewsletter(id: string, updates: UpdateNewsletterData): Promise<Newsletter> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/newsletter/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    })

    const data = await handleApiResponse<Newsletter>(response)
    return data
  } catch (error) {
    console.error('Failed to update newsletter:', error)
    if (isPermissionError(error)) {
      throw new Error(`Geen toegang tot nieuwsbrief bewerken. Vereiste permissie: ${error.requiredPermission}`)
    }
    throw error
  }
}

export async function deleteNewsletter(id: string): Promise<void> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/api/newsletter/${id}`, {
      method: 'DELETE',
      headers
    })

    await handleApiResponse<void>(response)
  } catch (error) {
    console.error('Failed to delete newsletter:', error)
    if (isPermissionError(error)) {
      throw new Error(`Geen toegang tot nieuwsbrief verwijderen. Vereiste permissie: ${error.requiredPermission}`)
    }
    throw error
  }
}

export async function sendNewsletter(id: string): Promise<NewsletterSendResponse> {
  console.log('[sendNewsletter] Starting send for newsletter ID:', id)
  console.log('[sendNewsletter] API_BASE_URL:', API_BASE_URL)

  try {
    const headers = getAuthHeaders()
    const url = `${API_BASE_URL}/api/newsletter/${id}/send`
    console.log('[sendNewsletter] Making request to:', url)
    console.log('[sendNewsletter] Headers:', headers)

    const response = await fetch(url, {
      method: 'POST',
      headers
    })

    console.log('[sendNewsletter] Response status:', response.status)
    console.log('[sendNewsletter] Response headers:', Object.fromEntries(response.headers.entries()))

    const data = await handleApiResponse<NewsletterSendResponse>(response)
    console.log('[sendNewsletter] Success response:', data)
    return data
  } catch (error) {
    console.error('[sendNewsletter] Failed to send newsletter:', error)
    if (isPermissionError(error)) {
      throw new Error(`Geen toegang tot nieuwsbrief verzenden. Vereiste permissie: ${error.requiredPermission}`)
    }
    throw error
  }
}