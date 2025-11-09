import { handleApiResponse, isPermissionError } from '../../../utils/apiErrorHandler'
import type { Aanmelding, AanmeldingAntwoord, Participant, EventRegistration, ParticipantRegistration, ParticipantAntwoord } from '../types'

// Helper function for auth headers with JWT
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Get JWT token from localStorage
  const token = localStorage.getItem('auth_token')
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

    // Use the new participant API endpoint
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/participant?limit=${limit}&offset=${offset}`, { headers })

    const participants = await handleApiResponse<Participant[]>(response)
    // Transform participants to legacy Aanmelding format for backward compatibility
    const aanmeldingen: Aanmelding[] = participants.map(participant => ({
      id: participant.id,
      naam: participant.naam,
      email: participant.email,
      telefoon: participant.telefoon,
      rol: 'deelnemer', // Default role - will be overridden by registration data if available
      afstand: '5km',   // Default distance - will be overridden by registration data if available
      ondersteuning: null,
      bijzonderheden: null,
      status: 'nieuw', // Default status
      terms: participant.terms,
      test_mode: false,
      email_verzonden: false,
      email_verzonden_op: null,
      behandeld_door: null,
      behandeld_op: null,
      notities: null,
      created_at: participant.created_at,
      updated_at: participant.updated_at,
      gebruiker_id: participant.gebruiker_id,
      steps: participant.steps
    }))
    return { data: aanmeldingen, error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { data: [], error: new Error('Geen toegang tot aanmeldingen. Vereiste permissie: aanmelding:read') }
    }
    return { data: [], error }
  }
}

// New functions for the refactored API structure

export async function fetchParticipants(limit = 100, offset = 0): Promise<{ data: Participant[], error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/participant?limit=${limit}&offset=${offset}`, { headers })

    const data = await handleApiResponse<Participant[]>(response)
    return { data, error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { data: [], error: new Error('Geen toegang tot deelnemers. Vereiste permissie: participant:read') }
    }
    return { data: [], error }
  }
}

export async function fetchParticipantDetails(id: string): Promise<{ data: ParticipantRegistration | null, error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/participant/${id}`, { headers })

    const data = await handleApiResponse<ParticipantRegistration>(response)
    return { data, error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { data: null, error: new Error('Geen toegang tot deelnemer details. Vereiste permissie: participant:read') }
    }
    return { data: null, error }
  }
}

export async function addParticipantAntwoord(participantId: string, tekst: string): Promise<{ data: ParticipantAntwoord | null, error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/participant/${participantId}/antwoord`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tekst })
    })

    const data = await handleApiResponse<ParticipantAntwoord>(response)
    return { data, error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { data: null, error: new Error('Geen toegang tot antwoord toevoegen. Vereiste permissie: participant:write') }
    }
    return { data: null, error }
  }
}

export async function deleteParticipant(id: string): Promise<{ error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/participant/${id}`, {
      method: 'DELETE',
      headers
    })

    await handleApiResponse<void>(response)
    return { error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { error: new Error('Geen toegang tot deelnemer verwijderen. Vereiste permissie: participant:delete') }
    }
    return { error }
  }
}

export async function fetchRegistrationsByRole(rol: string): Promise<{ data: EventRegistration[], error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/registration/rol/${encodeURIComponent(rol)}`, { headers })

    const data = await handleApiResponse<EventRegistration[]>(response)
    return { data, error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { data: [], error: new Error('Geen toegang tot registraties filter. Vereiste permissie: participant:read') }
    }
    return { data: [], error }
  }
}

export async function fetchRegistrationDetails(id: string): Promise<{ data: EventRegistration | null, error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/registration/${id}`, { headers })

    const data = await handleApiResponse<EventRegistration>(response)
    return { data, error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { data: null, error: new Error('Geen toegang tot registratie details. Vereiste permissie: participant:read') }
    }
    return { data: null, error }
  }
}

export async function updateRegistration(id: string, updates: Partial<EventRegistration>): Promise<{ data: EventRegistration | null, error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/registration/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    })

    const data = await handleApiResponse<EventRegistration>(response)
    return { data, error: null }
  } catch (err) {
    const error = err as Error
    if (isPermissionError(error)) {
      return { data: null, error: new Error('Geen toegang tot registratie bijwerken. Vereiste permissie: participant:write') }
    }
    return { data: null, error }
  }
}

export async function fetchAanmeldingDetails(id: string): Promise<{ data: Aanmelding | null, error: Error | null }> {
  try {
    const headers = getAuthHeaders()
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/aanmeldingen/${id}`, { headers })

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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/aanmeldingen/rol/${encodeURIComponent(rol)}`, { headers })

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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/aanmeldingen/${id}`, {
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/aanmeldingen/${aanmeldingId}/antwoord`, {
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
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/aanmeldingen/${id}`, {
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