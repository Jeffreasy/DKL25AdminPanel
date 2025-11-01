import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useVideos } from '../useVideos'
import * as videoService from '../../services/videoService'
import type { Video } from '../../types'

vi.mock('../../services/videoService')
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('useVideos', () => {
  const mockVideos: Video[] = [
    {
      id: '1',
      title: 'Test Video 1',
      description: 'Description 1',
      url: 'https://youtube.com/watch?v=test1',
      video_id: 'test1',
      thumbnail_url: null,
      visible: true,
      order_number: 0,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    },
    {
      id: '2',
      title: 'Test Video 2',
      description: 'Description 2',
      url: 'https://youtube.com/watch?v=test2',
      video_id: 'test2',
      thumbnail_url: null,
      visible: false,
      order_number: 1,
      created_at: '2024-01-02',
      updated_at: '2024-01-02'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads videos on mount', async () => {
    vi.mocked(videoService.fetchVideos).mockResolvedValue({
      data: mockVideos,
      error: null
    })

    const { result } = renderHook(() => useVideos())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.videos).toEqual(mockVideos)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch error', async () => {
    const error = new Error('Fetch failed')
    vi.mocked(videoService.fetchVideos).mockResolvedValue({
      data: [],
      error
    })

    const { result } = renderHook(() => useVideos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.videos).toEqual([])
    expect(result.current.error).toBeTruthy()
  })

  it('creates a new video', async () => {
    vi.mocked(videoService.fetchVideos)
      .mockResolvedValueOnce({ data: mockVideos, error: null })
      .mockResolvedValueOnce({ data: mockVideos, error: null })
      .mockResolvedValueOnce({ data: [...mockVideos, { ...mockVideos[0], id: '3' }], error: null })

    vi.mocked(videoService.addVideo).mockResolvedValue({
      data: { ...mockVideos[0], id: '3' },
      error: null
    })

    const { result } = renderHook(() => useVideos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.createVideo({
      title: 'New Video',
      description: 'New Description',
      url: 'https://youtube.com/watch?v=new',
      visible: true,
      order_number: 2
    })

    await waitFor(() => {
      expect(videoService.addVideo).toHaveBeenCalled()
    })
  })

  it('updates a video', async () => {
    vi.mocked(videoService.fetchVideos)
      .mockResolvedValueOnce({ data: mockVideos, error: null })
      .mockResolvedValueOnce({ data: mockVideos, error: null })

    vi.mocked(videoService.updateVideo).mockResolvedValue({ error: null })

    const { result } = renderHook(() => useVideos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.updateVideoData('1', { title: 'Updated Title' })

    await waitFor(() => {
      expect(videoService.updateVideo).toHaveBeenCalledWith('1', expect.objectContaining({
        title: 'Updated Title',
        updated_at: expect.any(String)
      }))
    })
  })

  it('deletes a video', async () => {
    vi.mocked(videoService.fetchVideos)
      .mockResolvedValueOnce({ data: mockVideos, error: null })
      .mockResolvedValueOnce({ data: [mockVideos[1]], error: null })

    vi.mocked(videoService.deleteVideo).mockResolvedValue({ error: null })

    const { result } = renderHook(() => useVideos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.removeVideo('1')

    await waitFor(() => {
      expect(videoService.deleteVideo).toHaveBeenCalledWith('1')
    })
  })

  it('deletes multiple videos', async () => {
    vi.mocked(videoService.fetchVideos)
      .mockResolvedValueOnce({ data: mockVideos, error: null })
      .mockResolvedValueOnce({ data: [], error: null })

    vi.mocked(videoService.deleteVideo).mockResolvedValue({ error: null })

    const { result } = renderHook(() => useVideos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.removeVideos(['1', '2'])

    await waitFor(() => {
      expect(videoService.deleteVideo).toHaveBeenCalledTimes(2)
    })
  })

  it('toggles video visibility', async () => {
    vi.mocked(videoService.fetchVideos)
      .mockResolvedValueOnce({ data: mockVideos, error: null })
      .mockResolvedValueOnce({ data: mockVideos, error: null })

    vi.mocked(videoService.updateVideo).mockResolvedValue({ error: null })

    const { result } = renderHook(() => useVideos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.toggleVisibility(mockVideos[0])

    await waitFor(() => {
      expect(videoService.updateVideo).toHaveBeenCalledWith('1', expect.objectContaining({
        visible: false,
        updated_at: expect.any(String)
      }))
    })
  })
})