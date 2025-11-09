/**
 * Participant interface - Personal data from participants table
 * Matches new backend API structure after refactoring
 */
export interface Participant {
  id: string
  naam: string
  email: string
  telefoon: string | null
  terms: boolean
  gebruiker_id: string | null       // Link naar gebruiker account
  steps: number
  created_at: string
  updated_at: string
  antwoorden?: ParticipantAntwoord[]
}

/**
 * EventRegistration interface - Event-specific data from event_registrations table
 * Matches new backend API structure after refactoring
 */
export interface EventRegistration {
  id: string
  event_id: string
  participant_id: string
  registered_at: string
  check_in_time: string | null
  start_time: string | null
  finish_time: string | null
  tracking_status: string | null
  steps: number
  test_mode: boolean
  ondersteuning: string | null
  bijzonderheden: string | null
  notities: string | null
  behandeld_door: string | null
  behandeld_op: string | null
  email_verzonden: boolean
  email_verzonden_op: string | null
  status_key: string | null
  distance_route: string | null
  participant_role_name: string | null
  participant?: Participant
  event?: Event
}

/**
 * Legacy Aanmelding interface - for backward compatibility
 * @deprecated Use Participant and EventRegistration separately
 */
export interface Aanmelding {
  id: string
  naam: string
  email: string
  telefoon: string | null
  rol: string                       // "deelnemer" of "vrijwilliger" (backend waarden)
  afstand: string                   // "5km", "10km", "15km" (backend waarden)
  ondersteuning: string | null      // Vrije tekst voor extra ondersteuning behoeften
  bijzonderheden: string | null     // Aanvullende opmerkingen
  status: string                    // "nieuw", "beantwoord", etc. (flexibel string type)
  terms: boolean
  test_mode: boolean
  email_verzonden: boolean
  email_verzonden_op: string | null
  behandeld_door: string | null
  behandeld_op: string | null
  notities: string | null
  created_at: string
  updated_at: string
  gebruiker_id: string | null       // Link naar gebruiker account
  antwoorden?: AanmeldingAntwoord[]
}

/**
 * ParticipantAntwoord interface - Communication from participant_antwoorden table
 * Matches new backend API structure after refactoring
 */
export interface ParticipantAntwoord {
  id: string
  participant_id: string
  tekst: string
  verzond_door: string
  email_verzonden: boolean
  verzonden_op: string
}

/**
 * Legacy AanmeldingAntwoord interface - for backward compatibility
 * @deprecated Use ParticipantAntwoord instead
 */
export interface AanmeldingAntwoord {
  id: string
  aanmelding_id: string
  tekst: string
  verzond_door: string
  email_verzonden: boolean
  created_at: string                // Backend gebruikt created_at, niet verzonden_op
}

/**
 * Event interface - Basic event information
 */
export interface Event {
  id: string
  name: string
  date: string
  location: string
}

/**
 * RegistrationStatus interface - Status information
 */
export interface RegistrationStatus {
  type: string
  description: string
}

/**
 * Distance interface - Distance/route information
 */
export interface Distance {
  route: string
  amount: number
  description: string
}

/**
 * ParticipantRole interface - Role information
 */
export interface ParticipantRole {
  name: string
  description: string
}

/**
 * Combined ParticipantRegistration interface - For UI components that need both
 */
export interface ParticipantRegistration {
  participant: Participant
  event_registrations: EventRegistration[]
}

/**
 * Type guards voor rol validatie
 */
export const isValidRol = (rol: string): boolean => {
  return ['deelnemer', 'vrijwilliger'].includes(rol.toLowerCase())
}

/**
 * Type guards voor afstand validatie
 */
export const isValidAfstand = (afstand: string): boolean => {
  return ['5km', '10km', '15km'].includes(afstand.toLowerCase())
}

/**
 * Helper types voor formulier validatie
 */
export type AanmeldingRol = 'deelnemer' | 'vrijwilliger'
export type AanmeldingAfstand = '5km' | '10km' | '15km'
export type AanmeldingStatus = 'nieuw' | 'beantwoord' | string  // Flexibel voor toekomstige statussen