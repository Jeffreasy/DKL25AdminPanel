import type { Album, AlbumWithDetails } from '../types'
import type { Photo } from '../../photos/types'
import { albumClient } from '../../../api/client'

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

/**
 * Custom error class for album-related errors
 */
export class AlbumServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AlbumServiceError'
  }
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, CacheEntry<unknown>>()

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
 * Handle API errors consistently
 */
function handleApiError(err: unknown, defaultMessage: string): never {
  if (err instanceof Error) {
    if (err.message.includes('Authentication expired')) {
      throw new AlbumServiceError('Authenticatie verlopen', 'AUTH_EXPIRED', 401)
    }
    if (err.message.includes('404')) {
      throw new AlbumServiceError('Niet gevonden', 'NOT_FOUND', 404)
    }
    throw new AlbumServiceError(err.message, 'API_ERROR')
  }
  throw new AlbumServiceError(defaultMessage, 'UNKNOWN_ERROR')
}

/**
 * Normalize album data to ensure photos_count is present
 */
function normalizeAlbum(album: AlbumWithDetails): Album {
  return {
    ...album,
    photos_count: album.photos_count || [{ count: album.photos?.length || 0 }]
  } as Album
}

/**
 * Fetch all albums with their details (admin endpoint)
 */
export async function fetchAllAlbums(): Promise<AlbumWithDetails[]> {
  try {
    const albums = await albumClient.getAlbumsAdmin() as AlbumWithDetails[]

    // Fetch photo counts for all albums in parallel
    const albumsWithCounts = await Promise.all(
      albums.map(async (album: AlbumWithDetails) => {
        try {
          // Get photos for this album
          const photos = await albumClient.getAlbumPhotos(album.id)
          return normalizeAlbum({
            ...album,
            photos_count: [{ count: photos.length }]
          })
        } catch (error) {
          console.warn(`Failed to get photo count for album ${album.id}:`, error)
          return normalizeAlbum(album)
        }
      })
    )

    return albumsWithCounts
  } catch (err) {
    handleApiError(err, 'Kon albums niet ophalen')
  }
}

/**
 * Fetch a single album by ID with all details including photos
 */
export async function fetchAlbumById(albumId: string): Promise<AlbumWithDetails | null> {
  try {
    // Fetch album and its photos in parallel
    const [album, photos] = await Promise.all([
      albumClient.getAlbum(albumId),
      albumClient.getAlbumPhotos(albumId)
    ])
    
    // Transform photos to AlbumPhoto format
    const albumPhotos = photos.map((photo, index) => ({
      album_id: albumId,
      photo_id: photo.id,
      order_number: index + 1,
      photo
    }))
    
    return {
      ...album,
      photos: albumPhotos,
      photos_count: [{ count: photos.length }]
    } as AlbumWithDetails
  } catch (err) {
    if (err instanceof Error && err.message.includes('404')) {
      return null
    }
    handleApiError(err, 'Kon album details niet ophalen')
  }
}

/**
 * Fetch public gallery data for preview
 * Returns only visible albums with their visible photos, ordered correctly
 * Results are cached for 5 minutes
 */
export async function fetchPublicGalleryData(useCache = true): Promise<PublicAlbumPreview[]> {
  const cacheKey = 'public_gallery_data'

  if (useCache) {
    const cached = getCachedData<PublicAlbumPreview[]>(cacheKey)
    if (cached) {
      return cached
    }
  }

  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'
    
    // Fetch visible albums
    const response = await fetch(`${API_BASE}/api/albums`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const albums = await response.json() as AlbumApiResponse[]
    
    // Fetch photos for each album in parallel
    const albumsWithPhotos = await Promise.all(
      (albums || []).map(async (album) => {
        try {
          const photosResponse = await fetch(`${API_BASE}/api/albums/${album.id}/photos`)
          if (photosResponse.ok) {
            const photos = await photosResponse.json()
            return {
              id: album.id,
              title: album.title,
              description: album.description,
              photos: photos || []
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch photos for album ${album.id}:`, error)
        }
        
        // Fallback to empty photos array
        return {
          id: album.id,
          title: album.title,
          description: album.description,
          photos: []
        }
      })
    )

    setCachedData(cacheKey, albumsWithPhotos)
    return albumsWithPhotos
  } catch (err) {
    handleApiError(err, 'Kon publieke galerij gegevens niet ophalen')
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
    const album = await albumClient.createAlbum({
      ...albumData,
      visible: albumData.visible ?? true
    })
    return normalizeAlbum(album as AlbumWithDetails)
  } catch (err) {
    handleApiError(err, 'Kon album niet aanmaken')
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
    const album = await albumClient.updateAlbum(albumId, updates)
    return normalizeAlbum(album as AlbumWithDetails)
  } catch (err) {
    handleApiError(err, 'Kon album niet bijwerken')
  }
}

/**
 * Delete an album
 */
export async function deleteAlbum(albumId: string): Promise<void> {
  try {
    await albumClient.deleteAlbum(albumId)
  } catch (err) {
    handleApiError(err, 'Kon album niet verwijderen')
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
    await albumClient.addPhotosToAlbum(albumId, photoIds)
  } catch (err) {
    handleApiError(err, 'Kon foto\'s niet toevoegen aan album')
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
    await albumClient.removePhotoFromAlbum(albumId, photoId)
  } catch (err) {
    handleApiError(err, 'Kon foto niet verwijderen uit album')
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
    await albumClient.reorderAlbumPhotos(albumId, photoOrders)
  } catch (err) {
    handleApiError(err, 'Kon foto volgorde niet bijwerken')
  }
}