import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '@/api/client/supabase'
import {
  fetchAllAlbums,
  fetchAlbumById,
  fetchPublicGalleryData,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addPhotosToAlbum,
  removePhotoFromAlbum,
  updatePhotoOrder,
  clearAlbumCache,
} from '../albumService'

vi.mock('@/api/client/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('albumService', () => {
  const mockFrom = vi.fn()
  const mockSelect = vi.fn()
  const mockOrder = vi.fn()
  const mockEq = vi.fn()
  const mockIn = vi.fn()
  const mockDelete = vi.fn()
  const mockUpdate = vi.fn()
  const mockInsert = vi.fn()
  const mockSingle = vi.fn()
  const mockLimit = vi.fn()
  const mockMatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    clearAlbumCache()
    ;(supabase.from as any) = mockFrom
  })

  describe('fetchAllAlbums', () => {
    it('fetches all albums with details', async () => {
      const mockAlbums = [
        { id: '1', title: 'Album 1', photos: [] },
        { id: '2', title: 'Album 2', photos: [] },
      ]

      mockFrom.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ order: mockOrder })
      mockOrder.mockResolvedValue({ data: mockAlbums, error: null })

      const result = await fetchAllAlbums()

      expect(result).toEqual(mockAlbums)
      expect(mockFrom).toHaveBeenCalledWith('albums')
    })

    it('handles errors', async () => {
      mockFrom.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ order: mockOrder })
      mockOrder.mockResolvedValue({ data: null, error: new Error('Fetch failed') })

      await expect(fetchAllAlbums()).rejects.toThrow('Fetch failed')
    })
  })

  describe('fetchAlbumById', () => {
    it('fetches single album by ID', async () => {
      const mockAlbum = { id: '1', title: 'Album 1', photos: [] }

      mockFrom.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ single: mockSingle })
      mockSingle.mockResolvedValue({ data: mockAlbum, error: null })

      const result = await fetchAlbumById('1')

      expect(result).toEqual(mockAlbum)
    })
  })

  describe('fetchPublicGalleryData', () => {
    it('fetches public gallery data', async () => {
      const mockAlbums = [{ id: '1', title: 'Album 1', description: 'Desc', visible: true }]
      const mockRelations = [{ album_id: '1', photo_id: 'p1', order_number: 1 }]
      const mockPhotos = [{ id: 'p1', url: 'url1', visible: true }]

      mockFrom
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ select: mockSelect })

      mockSelect
        .mockReturnValueOnce({ eq: mockEq })
        .mockReturnValueOnce({ in: mockIn })
        .mockReturnValueOnce({ in: mockIn })

      mockEq
        .mockReturnValueOnce({ order: mockOrder })

      mockOrder
        .mockReturnValueOnce({ data: mockAlbums, error: null })
        .mockReturnValueOnce({ data: mockRelations, error: null })

      mockIn
        .mockReturnValueOnce({ order: mockOrder })
        .mockReturnValueOnce({ eq: mockEq })

      mockEq.mockResolvedValueOnce({ data: mockPhotos, error: null })

      const result = await fetchPublicGalleryData(false)

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Album 1')
    })
  })

  describe('createAlbum', () => {
    it('creates album with order number', async () => {
      const mockMaxOrder = [{ order_number: 5 }]
      const newAlbum = { title: 'New Album', description: 'Desc' }
      const createdAlbum = { id: '1', ...newAlbum, order_number: 6 }

      mockFrom
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ insert: mockInsert })

      mockSelect
        .mockReturnValueOnce({ order: mockOrder })
        .mockReturnValueOnce({ single: mockSingle })
      
      mockOrder.mockReturnValue({ limit: mockLimit })
      mockLimit.mockResolvedValue({ data: mockMaxOrder })

      mockInsert.mockReturnValue({ select: mockSelect })
      mockSingle.mockResolvedValue({ data: createdAlbum, error: null })

      const result = await createAlbum(newAlbum)

      expect(result).toEqual(createdAlbum)
    })
  })

  describe('updateAlbum', () => {
    it('updates album successfully', async () => {
      const updates = { title: 'Updated Title' }
      const updatedAlbum = { id: '1', ...updates }

      mockFrom.mockReturnValue({ update: mockUpdate })
      mockUpdate.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })
      mockSingle.mockResolvedValue({ data: updatedAlbum, error: null })

      const result = await updateAlbum('1', updates)

      expect(result).toEqual(updatedAlbum)
      expect(mockFrom).toHaveBeenCalledWith('albums')
    })
  })

  describe('deleteAlbum', () => {
    it('deletes album successfully', async () => {
      mockFrom.mockReturnValue({ delete: mockDelete })
      mockDelete.mockReturnValue({ eq: mockEq })
      mockEq.mockResolvedValue({ error: null })

      await deleteAlbum('1')

      expect(mockFrom).toHaveBeenCalledWith('albums')
      expect(mockDelete).toHaveBeenCalled()
    })
  })

  describe('addPhotosToAlbum', () => {
    it('adds photos with correct order numbers', async () => {
      const mockMaxOrder = [{ order_number: 3 }]

      mockFrom
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ insert: mockInsert })

      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ order: mockOrder })
      mockOrder.mockReturnValue({ limit: mockLimit })
      mockLimit.mockResolvedValue({ data: mockMaxOrder })

      mockInsert.mockResolvedValue({ error: null })

      await addPhotosToAlbum('album-1', ['p1', 'p2'])

      expect(mockInsert).toHaveBeenCalled()
    })
  })

  describe('removePhotoFromAlbum', () => {
    it('removes photo from album', async () => {
      mockFrom.mockReturnValue({ delete: mockDelete })
      mockDelete.mockReturnValue({ match: mockMatch })
      mockMatch.mockResolvedValue({ error: null })

      await removePhotoFromAlbum('album-1', 'photo-1')

      expect(mockMatch).toHaveBeenCalledWith({
        album_id: 'album-1',
        photo_id: 'photo-1',
      })
    })
  })

  describe('updatePhotoOrder', () => {
    it('updates photo order in album', async () => {
      mockFrom
        .mockReturnValueOnce({ delete: mockDelete })
        .mockReturnValueOnce({ insert: mockInsert })

      mockDelete.mockReturnValue({ eq: mockEq })
      mockEq.mockResolvedValue({ error: null })
      mockInsert.mockResolvedValue({ error: null })

      await updatePhotoOrder('album-1', [
        { photo_id: 'p1', order_number: 1 },
        { photo_id: 'p2', order_number: 2 },
      ])

      expect(mockDelete).toHaveBeenCalled()
      expect(mockInsert).toHaveBeenCalled()
    })
  })
})