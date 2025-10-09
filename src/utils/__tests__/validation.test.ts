import { describe, it, expect } from 'vitest'
import {
  PASSWORD_REQUIREMENTS,
  strengthColors,
  strengthMessages,
  getPasswordStrength,
} from '../validation'

describe('validation', () => {
  describe('PASSWORD_REQUIREMENTS', () => {
    it('has 5 requirements', () => {
      expect(PASSWORD_REQUIREMENTS).toHaveLength(5)
    })

    it('validates minimum length', () => {
      const req = PASSWORD_REQUIREMENTS[0]
      expect(req.validator('short')).toBe(false)
      expect(req.validator('longenough')).toBe(true)
    })

    it('validates uppercase letter', () => {
      const req = PASSWORD_REQUIREMENTS[1]
      expect(req.validator('lowercase')).toBe(false)
      expect(req.validator('Uppercase')).toBe(true)
    })

    it('validates lowercase letter', () => {
      const req = PASSWORD_REQUIREMENTS[2]
      expect(req.validator('UPPERCASE')).toBe(false)
      expect(req.validator('lowercase')).toBe(true)
    })

    it('validates digit', () => {
      const req = PASSWORD_REQUIREMENTS[3]
      expect(req.validator('nodigits')).toBe(false)
      expect(req.validator('has1digit')).toBe(true)
    })

    it('validates special character', () => {
      const req = PASSWORD_REQUIREMENTS[4]
      expect(req.validator('nospecial')).toBe(false)
      expect(req.validator('has!special')).toBe(true)
    })
  })

  describe('strengthColors', () => {
    it('has colors for all strength levels', () => {
      expect(strengthColors.weak).toBe('bg-red-500')
      expect(strengthColors.medium).toBe('bg-yellow-500')
      expect(strengthColors.strong).toBe('bg-green-500')
    })
  })

  describe('strengthMessages', () => {
    it('has messages for all strength levels', () => {
      expect(strengthMessages.weak).toBe('Zwak wachtwoord')
      expect(strengthMessages.medium).toBe('Redelijk wachtwoord')
      expect(strengthMessages.strong).toBe('Sterk wachtwoord')
    })
  })

  describe('getPasswordStrength', () => {
    it('returns weak for passwords meeting 0-2 requirements', () => {
      expect(getPasswordStrength('')).toBe('weak')
      expect(getPasswordStrength('short')).toBe('weak')
      expect(getPasswordStrength('sh')).toBe('weak')
    })

    it('returns medium for passwords meeting 3-4 requirements', () => {
      expect(getPasswordStrength('Short1!')).toBe('medium')
      expect(getPasswordStrength('LongEnough1')).toBe('medium')
    })

    it('returns strong for passwords meeting all 5 requirements', () => {
      expect(getPasswordStrength('StrongPass1!')).toBe('strong')
      expect(getPasswordStrength('MyP@ssw0rd')).toBe('strong')
    })

    it('handles edge cases', () => {
      expect(getPasswordStrength('12345678')).toBe('weak')
      expect(getPasswordStrength('ABCDEFGH')).toBe('weak')
      expect(getPasswordStrength('abcdefgh')).toBe('weak')
    })

    it('validates complex passwords correctly', () => {
      expect(getPasswordStrength('abc')).toBe('weak') // Too short, only 1 requirement
      expect(getPasswordStrength('Abcdefgh1')).toBe('medium') // Missing special char (4 requirements)
      expect(getPasswordStrength('Abcdefgh1!')).toBe('strong') // All requirements
    })
  })
})