import type { Album, AlbumWithDetails } from '../types'
import type { Photo } from '../../photos/types'
import { authManager } from '../../../api/client'

/**
 * Interface for public gallery data structure
 */
export interface PublicAlbumPreview {
  id: string
  title: string
  description: string | null
  photos: Photo[]
}

/**
 * Interface for album API response
 */
interface AlbumApiResponse {
  id: string
  title: string
  description: string | null
  photos?: Photo[]
}

/**
 * Simple in-memory cache for gallery data
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, CacheEntry<any>>()

function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}

export function clearAlbumCache(): void {
  cache.clear()
}

/**
 * Fetch all albums with their details (admin endpoint)
 */
export async function fetchAllAlbums(): Promise<AlbumWithDetails[]> {
  try {
    const data = await authManager.makeAuthenticatedRequest('/api/albums/admin') as AlbumWithDetails[]
    const albums = data || []

    // Albums don't include photos in list view, so we need to fetch photo counts separately
    // Make individual calls to get photo count for each album
    const albumsWithCounts = await Promise.all(
      albums.map(async (album: AlbumWithDetails) => {
        try {
          // Try to get album details which should include photos
          const detailData = await authManager.makeAuthenticatedRequest(`/api/albums/${album.id}`) as { photos?: unknown[] }
          const photoCount = Array.isArray(detailData.photos) ? detailData.photos.length : 0
          return {
            ...album,
            photos_count: [{ count: photoCount }]
          }
        } catch (error) {
          console.warn(`Failed to get photo count for album ${album.id}:`, error)
        }

        // Fallback: assume 0 photos if detail call fails
        return {
          ...album,
          photos_count: [{ count: 0 }]
        }
      })
    )

    return albumsWithCounts
  } catch (err) {
    const error = err as Error
    if (error.message.includes('Authentication expired')) {
      throw error
    }
    throw new Error('Kon albums niet ophalen')
  }
}

/**
 * Fetch a single album by ID with all details
 */
export async function fetchAlbumById(albumId: string): Promise<AlbumWithDetails | null> {
  try {
    const data = await authManager.makeAuthenticatedRequest(`/api/albums/${albumId}`) as AlbumWithDetails
    return data
  } catch (err) {
    const error = err as Error
    if (error.message.includes('Authentication expired')) {
      throw error
    }
    if (error.message.includes('404')) {
      return null
    }
    throw new Error('Kon album details niet ophalen')
  }
}

/**
 * Fetch public gallery data for preview
 * Returns only visible albums with their visible photos, ordered correctly
 * Results are cached for 5 minutes
 */
export async function fetchPublicGalleryData(useCache = true): Promise<PublicAlbumPreview[]> {
  const cacheKey = 'public_gallery_data'

  // Check cache first
  if (useCache) {
    const cached = getCachedData<PublicAlbumPreview[]>(cacheKey)
    if (cached) {
      console.log('📦 Using cached gallery data')
      return cached
    }
  }

  try {
    // Use public albums endpoint - may need to be updated when backend implements photo data
    const data = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'}/api/albums`).then(r => r.json())

    // Transform to expected format - this may need adjustment based on actual API response
    const transformedData = (data as AlbumApiResponse[] || []).map((album: AlbumApiResponse) => ({
      id: album.id,
      title: album.title,
      description: album.description,
      photos: album.photos || [] // Assuming photos are included in response
    }))

    // Cache the result
    setCachedData(cacheKey, transformedData)
    console.log('💾 Cached gallery data')

    return transformedData
  } catch (err) {
    console.error('Error fetching public gallery data:', err)
    throw new Error('Kon publieke galerij gegevens niet ophalen')
  }
}

/**
 * Create a new album
 */
export async function createAlbum(albumData: {
  title: string
  description?: string
  visible?: boolean
}): Promise<Album> {
  try {
    const data = await authManager.makeAuthenticatedRequest('/api/albums', {
      method: 'POST',
      body: JSON.stringify({
        ...albumData,
        visible: albumData.visible ?? true
      })
    }) as Album
    return data
  } catch (err) {
    const error = err as Error
    if (error.message.includes('Authentication expired')) {
      throw error
    }
    throw new Error('Kon album niet aanmaken')
  }
}

/**
 * Update an album
 */
export async function updateAlbum(
  albumId: string,
  updates: Partial<Omit<Album, 'id' | 'created_at' | 'updated_at'>>
): Promise<Album> {
  try {
    const data = await authManager.makeAuthenticatedRequest(`/api/albums/${albumId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }) as Album
    return data
  } catch (err) {
    const error = err as Error
    if (error.message.includes('Authentication expired')) {
      throw error
    }
    throw new Error('Kon album niet bijwerken')
  }
}

/**
 * Delete an album
 */
export async function deleteAlbum(albumId: string): Promise<void> {
  try {
    await authManager.makeAuthenticatedRequest(`/api/albums/${albumId}`, {
      method: 'DELETE'
    })
  } catch (err) {
    const error = err as Error
    if (error.message.includes('Authentication expired')) {
      throw error
    }
    throw new Error('Kon album niet verwijderen')
  }
}

/**
 * Add photos to an album
 */
export async function addPhotosToAlbum(
  albumId: string,
  photoIds: string[]
): Promise<void> {
  try {
    await authManager.makeAuthenticatedRequest(`/api/albums/${albumId}/photos`, {
      method: 'POST',
      body: JSON.stringify({ photo_ids: photoIds })
    })
  } catch (err) {
    const error = err as Error
    if (error.message.includes('Authentication expired')) {
      throw error
    }
    throw new Error('Kon foto\'s niet toevoegen aan album')
  }
}

/**
 * Remove a photo from an album
 */
export async function removePhotoFromAlbum(
  albumId: string,
  photoId: string
): Promise<void> {
  try {
    await authManager.makeAuthenticatedRequest(`/api/albums/${albumId}/photos/${photoId}`, {
      method: 'DELETE'
    })
  } catch (err) {
    const error = err as Error
    if (error.message.includes('Authentication expired')) {
      throw error
    }
    throw new Error('Kon foto niet verwijderen uit album')
  }
}

/**
 * Update photo order in an album
 */
export async function updatePhotoOrder(
  albumId: string,
  photoOrders: { photo_id: string; order_number: number }[]
): Promise<void> {
  try {
    await authManager.makeAuthenticatedRequest(`/api/albums/${albumId}/photos/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ photo_orders: photoOrders })
    })
  } catch (err) {
    const error = err as Error
    if (error.message.includes('Authentication expired')) {
      throw error
    }
    throw new Error('Kon foto volgorde niet bijwerken')
  }
}