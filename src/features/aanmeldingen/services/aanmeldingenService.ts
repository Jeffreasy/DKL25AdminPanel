import { handleApiResponse, isPermissionError } from '../../../utils/apiErrorHandler'
import type { Aanmelding, AanmeldingAntwoord } from '../types'

// Helper function for auth headers with JWT
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Get JWT token from localStorage
  const token = localStorage.getItem('jwtToken')
  if (!token) {
    console.error('[aanmeldingenService] No auth token found.')
    throw new Error('Geen actieve gebruikerssessie gevonden. Log opnieuw in.')
  }

  headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function fetchAanmeldingen(limit = 100, offset = 0): Promise<{ data: Aanmelding[], error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/aanmelding?limit=${limit}&offset=${offset}`, { headers })

    const data = await handleApiResponse<Aanmelding[]>(response)
    return { data, error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { data: [], error: new Error('Geen toegang tot aanmeldingen. Vereiste permissie: aanmelding:read') }
    }
    return { data: [], error }
  }
}

export async function fetchAanmeldingDetails(id: string): Promise<{ data: Aanmelding | null, error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/aanmelding/${id}`, { headers })

    const data = await handleApiResponse<Aanmelding>(response)
    return { data, error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { data: null, error: new Error('Geen toegang tot aanmelding details. Vereiste permissie: aanmelding:read') }
    }
    return { data: null, error }
  }
}

export async function fetchAanmeldingenByRol(rol: string): Promise<{ data: Aanmelding[], error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/aanmelding/rol/${encodeURIComponent(rol)}`, { headers })

    const data = await handleApiResponse<Aanmelding[]>(response)
    return { data, error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { data: [], error: new Error('Geen toegang tot aanmeldingen filter. Vereiste permissie: aanmelding:read') }
    }
    return { data: [], error }
  }
}

export async function updateAanmelding(id: string, updates: Partial<Aanmelding>): Promise<{ data: Aanmelding | null, error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/aanmelding/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    })

    const data = await handleApiResponse<Aanmelding>(response)
    return { data, error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { data: null, error: new Error('Geen toegang tot aanmelding bijwerken. Vereiste permissie: aanmelding:write') }
    }
    return { data: null, error }
  }
}

export async function addAanmeldingAntwoord(aanmeldingId: string, tekst: string): Promise<{ data: AanmeldingAntwoord | null, error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/aanmelding/${aanmeldingId}/antwoord`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tekst })
    })

    const data = await handleApiResponse<AanmeldingAntwoord>(response)
    return { data, error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { data: null, error: new Error('Geen toegang tot antwoord toevoegen. Vereiste permissie: aanmelding:write') }
    }
    return { data: null, error }
  }
}

export async function deleteAanmelding(id: string): Promise<{ error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/aanmelding/${id}`, {
      method: 'DELETE',
      headers
    })

    await handleApiResponse<void>(response)
    return { error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { error: new Error('Geen toegang tot aanmelding verwijderen. Vereiste permissie: aanmelding:delete') }
    }
    return { error }
  }
}