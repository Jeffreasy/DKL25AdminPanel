import { type PasswordStrength } from '../types'

export const PASSWORD_REQUIREMENTS = [
  { 
    text: 'Minimaal 8 karakters',
    validator: (p: string) => p.length >= 8 
  },
  { 
    text: 'Minimaal één hoofdletter',
    validator: (p: string) => /[A-Z]/.test(p) 
  },
  { 
    text: 'Minimaal één kleine letter',
    validator: (p: string) => /[a-z]/.test(p) 
  },
  { 
    text: 'Minimaal één cijfer',
    validator: (p: string) => /[0-9]/.test(p) 
  },
  { 
    text: 'Minimaal één speciaal karakter',
    validator: (p: string) => /[^A-Za-z0-9]/.test(p) 
  }
]

export const strengthColors: Record<PasswordStrength, string> = {
  weak: 'bg-red-500',
  medium: 'bg-yellow-500',
  strong: 'bg-green-500'
}

export const strengthMessages: Record<PasswordStrength, string> = {
  weak: 'Zwak wachtwoord',
  medium: 'Redelijk wachtwoord',
  strong: 'Sterk wachtwoord'
}

export const getPasswordStrength = (password: string): PasswordStrength => {
  const meetsRequirements = PASSWORD_REQUIREMENTS.filter(req => 
    req.validator(password)
  ).length

  if (meetsRequirements <= 2) return 'weak'
  if (meetsRequirements <= 4) return 'medium'
  return 'strong'
} 