import { createCRUDService } from '../../../lib/services/createCRUDService'
import type { Video } from '../types'

/**
 * Video service using generic CRUD factory
 * Reduces code duplication significantly
 */
const baseService = createCRUDService<Video>({
  tableName: 'videos',
  orderBy: 'order_number',
  orderDirection: 'asc'
})

// Export CRUD operations with custom names for backward compatibility
export const fetchVideos = async () => {
  try {
    const data = await baseService.fetchAll()
    return { data, error: null }
  } catch (err) {
    console.error('Error fetching videos:', err)
    return { data: [], error: err as Error }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addVideo = async (video: Omit<Video, 'id' | 'created_at' | 'updated_at'> | any) => {
  try {
    const data = await baseService.create(video)
    return { data, error: null }
  } catch (err) {
    console.error('Error adding video:', err)
    return { data: null, error: err as Error }
  }
}

export const updateVideo = async (videoId: string, updates: Partial<Video>) => {
  try {
    await baseService.update(videoId, updates)
    return { error: null }
  } catch (err) {
    console.error('Error updating video:', err)
    return { error: err as Error }
  }
}

export const deleteVideo = async (videoId: string) => {
  try {
    await baseService.delete(videoId)
    return { error: null }
  } catch (err) {
    console.error('Error deleting video:', err)
    return { error: err as Error }
  }
}

export const updateVideoOrder = async (videoId: string, newOrder: number) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await baseService.update(videoId, { order_number: newOrder } as any)
    return { error: null }
  } catch (err) {
    console.error('Error updating video order:', err)
    return { error: err as Error }
  }
}