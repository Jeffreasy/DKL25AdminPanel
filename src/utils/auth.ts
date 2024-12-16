import { AuthError } from '../types/auth'

export const AUTH_ERRORS = {
  INVALID_LOGIN: 'Invalid login credentials',
  RATE_LIMITED: 'Too many login attempts',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN: 'An unknown error occurred'
} as const

export function normalizeAuthError(error: unknown): AuthError {
  if (error instanceof Error) {
    if (error.message.includes('Invalid login')) {
      return { message: 'Ongeldige inloggegevens' }
    }
    if (error.message.includes('rate limit')) {
      return { message: 'Te veel inlogpogingen. Probeer het later opnieuw.' }
    }
    return { message: error.message }
  }
  return { message: 'Er is een onbekende fout opgetreden' }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}

export const SESSION_STORAGE_KEY = 'auth_session'

export function getStoredSession(): string | null {
  return sessionStorage.getItem(SESSION_STORAGE_KEY)
}

export function setStoredSession(session: string): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, session)
}

export function clearStoredSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
} 