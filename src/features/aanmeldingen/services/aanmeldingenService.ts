import { authManager } from '../../../lib/auth'
import type { Aanmelding, AanmeldingAntwoord } from '../types'

export async function fetchAanmeldingen(limit = 100, offset = 0): Promise<{ data: Aanmelding[], error: Error | null }> {
  try {
    const data = await authManager.makeAuthenticatedRequest(`/api/aanmelding?limit=${limit}&offset=${offset}`)
    return { data: data as Aanmelding[], error: null }
  } catch (err) {
    return { data: [], error: err as Error }
  }
}

export async function fetchAanmeldingDetails(id: string): Promise<{ data: Aanmelding | null, error: Error | null }> {
  try {
    const data = await authManager.makeAuthenticatedRequest(`/api/aanmelding/${id}`)
    return { data: data as Aanmelding, error: null }
  } catch (err) {
    return { data: null, error: err as Error }
  }
}

export async function fetchAanmeldingenByRol(rol: string): Promise<{ data: Aanmelding[], error: Error | null }> {
  try {
    const data = await authManager.makeAuthenticatedRequest(`/api/aanmelding/rol/${encodeURIComponent(rol)}`)
    return { data: data as Aanmelding[], error: null }
  } catch (err) {
    return { data: [], error: err as Error }
  }
}

export async function updateAanmelding(id: string, updates: Partial<Aanmelding>): Promise<{ data: Aanmelding | null, error: Error | null }> {
  try {
    const data = await authManager.makeAuthenticatedRequest(`/api/aanmelding/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
    return { data: data as Aanmelding, error: null }
  } catch (err) {
    return { data: null, error: err as Error }
  }
}

export async function addAanmeldingAntwoord(aanmeldingId: string, tekst: string): Promise<{ data: AanmeldingAntwoord | null, error: Error | null }> {
  try {
    const data = await authManager.makeAuthenticatedRequest(`/api/aanmelding/${aanmeldingId}/antwoord`, {
      method: 'POST',
      body: JSON.stringify({ tekst })
    })
    return { data: data as AanmeldingAntwoord, error: null }
  } catch (err) {
    return { data: null, error: err as Error }
  }
}

export async function deleteAanmelding(id: string): Promise<{ error: Error | null }> {
  try {
    await authManager.makeAuthenticatedRequest(`/api/aanmelding/${id}`, {
      method: 'DELETE'
    })
    return { error: null }
  } catch (err) {
    return { error: err as Error }
  }
}