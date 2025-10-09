import { describe, it, expect, vi } from 'vitest'
import { fetchVideos, addVideo, updateVideo, deleteVideo, updateVideoOrder } from '../videoService'
import { supabase } from '@/api/client/supabase'

vi.mock('@/api/client/supabase')

describe('videoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchVideos returns data successfully', async () => {
    const mockData = [{ id: '1', title: 'Video 1', url: 'https://youtube.com/1', visible: true, order_number: 1, created_at: '2024-01-01', updated_at: '2024-01-01' }]
    
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

    const result = await fetchVideos()

    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
  })

  it('fetchVideos handles errors', async () => {
    const mockError = new Error('Fetch failed')
    const mockOrder = vi.fn().mockRejectedValue(mockError)
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

    const result = await fetchVideos()

    expect(result.data).toEqual([])
    expect(result.error).toBeInstanceOf(Error)
  })

  it('addVideo creates video successfully', async () => {
    const newVideo = { title: 'New Video', url: 'https://youtube.com/new', visible: true, order_number: 1 }
    const created = { id: '1', ...newVideo, created_at: '2024-01-01', updated_at: '2024-01-01' }

    const mockSingle = vi.fn().mockResolvedValue({ data: created, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

    const result = await addVideo(newVideo)

    expect(result.data).toEqual(created)
    expect(result.error).toBeNull()
  })

  it('updateVideo updates successfully', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: {}, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as any)

    const result = await updateVideo('1', { title: 'Updated' })

    expect(result.error).toBeNull()
  })

  it('deleteVideo deletes successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ delete: mockDelete } as any)

    const result = await deleteVideo('1')

    expect(result.error).toBeNull()
  })

  it('updateVideoOrder updates order', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: {}, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ update: mockUpdate } as any)

    const result = await updateVideoOrder('1', 5)

    expect(result.error).toBeNull()
  })
})