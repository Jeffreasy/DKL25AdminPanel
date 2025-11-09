import { newsletterClient } from '../../../api/client'
import { isPermissionError } from '../../../utils/apiErrorHandler'
import type { Newsletter, CreateNewsletterData, UpdateNewsletterData, NewsletterSendResponse } from '../types'

/**
 * Newsletter Service Layer
 *
 * Wraps newsletterClient with additional business logic and error handling.
 * Migrated from legacy authManager to modern newsletterClient.
 *
 * @see newsletterClient - Core API client
 */

export async function fetchNewsletters(limit: number = 50, offset: number = 0): Promise<{ newsletters: Newsletter[], totalCount: number }> {
  try {
    const newsletters = await newsletterClient.getAll(limit, offset)
    
    return {
      newsletters: newsletters || [],
      totalCount: newsletters.length
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
    const data = await newsletterClient.create(newsletterData)
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
    const data = await newsletterClient.update(id, updates)
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
    await newsletterClient.delete(id)
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

  try {
    const data = await newsletterClient.send(id)
    console.log('[sendNewsletter] Success response:', data)
    return data as NewsletterSendResponse
  } catch (error) {
    console.error('[sendNewsletter] Failed to send newsletter:', error)
    if (isPermissionError(error)) {
      throw new Error(`Geen toegang tot nieuwsbrief verzenden. Vereiste permissie: ${error.requiredPermission}`)
    }
    throw error
  }
}