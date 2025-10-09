import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as aanmeldingenService from '../aanmeldingenService'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock as any

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch as any

describe('aanmeldingenService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  describe('fetchAanmeldingen', () => {
    it('fetches all registrations successfully', async () => {
      const mockData = [
        {
          id: '1',
          naam: 'John Doe',
          email: 'john@example.com',
          telefoon: '1234567890',
          bericht: 'Test message',
          status: 'pending',
          created_at: '2024-01-01'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response)

      const result = await aanmeldingenService.fetchAanmeldingen()

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })

    it('handles fetch error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Fetch failed' })
      } as Response)

      const result = await aanmeldingenService.fetchAanmeldingen()

      expect(result.data).toEqual([])
      expect(result.error).toBeTruthy()
    })

    it('handles permission error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ message: 'Permission denied' })
      } as Response)

      const result = await aanmeldingenService.fetchAanmeldingen()

      expect(result.data).toEqual([])
      expect(result.error?.message).toContain('Geen toegang')
    })
  })

  describe('updateAanmelding', () => {
    it('updates registration successfully', async () => {
      const mockData = { id: '1', status: 'behandeld' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response)

      const result = await aanmeldingenService.updateAanmelding('1', { status: 'behandeld' })

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })

    it('handles update error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Update failed' })
      } as Response)

      const result = await aanmeldingenService.updateAanmelding('1', { status: 'in_behandeling' })

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('deleteAanmelding', () => {
    it('deletes registration successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      } as Response)

      const result = await aanmeldingenService.deleteAanmelding('1')

      expect(result.error).toBeNull()
    })

    it('handles delete error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Delete failed' })
      } as Response)

      const result = await aanmeldingenService.deleteAanmelding('1')

      expect(result.error).toBeTruthy()
    })
  })

  describe('fetchAanmeldingDetails', () => {
    it('fetches registration details successfully', async () => {
      const mockData = {
        id: '1',
        naam: 'John Doe',
        email: 'john@example.com'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response)

      const result = await aanmeldingenService.fetchAanmeldingDetails('1')

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })
  })

  describe('fetchAanmeldingenByRol', () => {
    it('fetches registrations by role successfully', async () => {
      const mockData = [{ id: '1', rol: 'loper' }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response)

      const result = await aanmeldingenService.fetchAanmeldingenByRol('loper')

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })
  })

  describe('addAanmeldingAntwoord', () => {
    it('adds answer to registration successfully', async () => {
      const mockData = { id: '1', tekst: 'Test answer' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response)

      const result = await aanmeldingenService.addAanmeldingAntwoord('1', 'Test answer')

      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })
  })
})