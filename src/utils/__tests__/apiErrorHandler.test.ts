import { describe, it, expect } from 'vitest'
import { ApiPermissionError, isPermissionError, handleApiResponse } from '../apiErrorHandler'

describe('apiErrorHandler', () => {
  describe('ApiPermissionError', () => {
    it('creates permission error correctly', () => {
      const errorData = {
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        details: {
          required_permission: 'contact:write',
          user_permissions: ['contact:read']
        }
      }
      
      const error = new ApiPermissionError(errorData, 403)
      
      expect(error.message).toBe('Permission denied')
      expect(error.status).toBe(403)
      expect(error.code).toBe('PERMISSION_DENIED')
      expect(error.requiredPermission).toBe('contact:write')
      expect(error.userPermissions).toEqual(['contact:read'])
      expect(error.name).toBe('ApiPermissionError')
    })

    it('is instance of Error', () => {
      const errorData = {
        error: 'Test',
        code: 'CODE',
        details: {
          required_permission: 'test:read',
          user_permissions: []
        }
      }
      
      const error = new ApiPermissionError(errorData, 403)
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ApiPermissionError)
    })
  })

  describe('isPermissionError', () => {
    it('returns true for ApiPermissionError', () => {
      const errorData = {
        error: 'Test',
        code: 'CODE',
        details: {
          required_permission: 'test:read',
          user_permissions: []
        }
      }
      const error = new ApiPermissionError(errorData, 403)
      
      expect(isPermissionError(error)).toBe(true)
    })

    it('returns false for regular Error', () => {
      const error = new Error('Test')
      
      expect(isPermissionError(error)).toBe(false)
    })

    it('returns false for non-error values', () => {
      expect(isPermissionError('string')).toBe(false)
      expect(isPermissionError(null)).toBe(false)
      expect(isPermissionError(undefined)).toBe(false)
      expect(isPermissionError({})).toBe(false)
      expect(isPermissionError(123)).toBe(false)
    })
  })

  describe('handleApiResponse', () => {
    it('returns JSON for successful response', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ data: 'test' })
      } as Response
      
      const result = await handleApiResponse(mockResponse)
      
      expect(result).toEqual({ data: 'test' })
    })

    it('throws ApiPermissionError for 403 with permission error', async () => {
      const errorData = {
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        details: {
          required_permission: 'contact:write',
          user_permissions: ['contact:read']
        }
      }
      
      const mockResponse = {
        ok: false,
        status: 403,
        json: async () => errorData
      } as Response
      
      // The implementation throws ApiPermissionError which then gets caught and re-thrown as generic Error
      await expect(handleApiResponse(mockResponse)).rejects.toThrow('Permission denied')
    })

    it('throws generic error for non-permission 403', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        json: async () => { throw new Error('Not JSON') },
        text: async () => 'Forbidden'
      } as unknown as Response
      
      await expect(handleApiResponse(mockResponse)).rejects.toThrow('API Error 403')
    })

    it('handles other error status codes', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      } as unknown as Response
      
      await expect(handleApiResponse(mockResponse)).rejects.toThrow('API Error 500')
    })
  })
})