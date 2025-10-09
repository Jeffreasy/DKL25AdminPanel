import { describe, it, expect } from 'vitest'
import { keysToCamel, keysToSnake, snakeToCamel, camelToSnake } from '../caseConverter'

describe('caseConverter', () => {
  describe('snakeToCamel', () => {
    it('converts snake_case to camelCase', () => {
      expect(snakeToCamel('hello_world')).toBe('helloWorld')
      expect(snakeToCamel('user_name')).toBe('userName')
    })
  })

  describe('camelToSnake', () => {
    it('converts camelCase to snake_case', () => {
      // Note: camelToSnake adds underscore before capitals
      expect(camelToSnake('helloWorld')).toBe('hello_world')
      expect(camelToSnake('userName')).toBe('user_name')
    })
  })

  describe('keysToCamel', () => {
    it('converts object keys from snake_case to camelCase', () => {
      const input = {
        user_name: 'John',
        email_address: 'john@example.com',
      }

      const expected = {
        userName: 'John',
        emailAddress: 'john@example.com',
      }

      expect(keysToCamel(input)).toEqual(expected)
    })
  })

  describe('keysToSnake', () => {
    it('converts object keys from camelCase to snake_case', () => {
      const input = {
        userName: 'John',
        emailAddress: 'john@example.com',
      }

      const result = keysToSnake(input)
      
      // camelToSnake converts keys correctly without leading underscore in object context
      expect(result).toHaveProperty('user_name', 'John')
      expect(result).toHaveProperty('email_address', 'john@example.com')
    })
  })
})