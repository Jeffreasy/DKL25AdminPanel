export interface ValidationRule {
  test: (value: string) => boolean
  message: string
}

export const emailRules: ValidationRule[] = [
  {
    test: (email) => !!email,
    message: 'Email is verplicht'
  },
  {
    test: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    message: 'Voer een geldig emailadres in'
  }
]

export const passwordRules: ValidationRule[] = [
  {
    test: (password) => !!password,
    message: 'Wachtwoord is verplicht'
  },
  {
    test: (password) => password.length >= 6,
    message: 'Wachtwoord moet minimaal 6 karakters bevatten'
  }
]

export function validateField(value: string, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    if (!rule.test(value)) {
      return rule.message
    }
  }
  return null
} 