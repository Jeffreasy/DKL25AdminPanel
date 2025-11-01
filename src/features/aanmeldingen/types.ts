/**
 * Aanmelding interface - komt overeen met backend API
 * Zie FRONTEND_BACKEND_API_REFERENCE.md PART 2 voor details
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
 * Aanmelding antwoord interface - komt overeen met backend API
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