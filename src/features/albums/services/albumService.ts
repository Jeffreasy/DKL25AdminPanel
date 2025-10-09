import { supabase } from '../../../api/client/supabase'
import type { Album, AlbumWithDetails } from '../types'
import type { Photo } from '../../photos/types'

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
 * Fetch all albums with their details
 */
export async function fetchAllAlbums(): Promise<AlbumWithDetails[]> {
  const { data, error } = await supabase
    .from('albums')
    .select(`
      *,
      cover_photo:photos!cover_photo_id(*),
      photos:album_photos(
        order_number,
        photo:photos(*)
      )
    `)
    .order('order_number', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Fetch a single album by ID with all details
 */
export async function fetchAlbumById(albumId: string): Promise<AlbumWithDetails | null> {
  const { data, error } = await supabase
    .from('albums')
    .select(`
      *,
      cover_photo:photos!cover_photo_id(*),
      photos:album_photos(
        order_number,
        photo:photos(*)
      )
    `)
    .eq('id', albumId)
    .single()

  if (error) throw error
  return data
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
  // Step 1: Fetch visible albums
  const { data: visibleAlbums, error: albumsError } = await supabase
    .from('albums')
    .select('id, title, description')
    .eq('visible', true)
    .order('order_number', { ascending: true })

  if (albumsError) throw albumsError
  if (!visibleAlbums || visibleAlbums.length === 0) return []

  const albumIds = visibleAlbums.map(a => a.id)

  // Step 2: Fetch album-photo relations
  const { data: albumPhotoRelations, error: relationsError } = await supabase
    .from('album_photos')
    .select('album_id, photo_id, order_number')
    .in('album_id', albumIds)
    .order('order_number', { ascending: true })

  if (relationsError) throw relationsError
  if (!albumPhotoRelations || albumPhotoRelations.length === 0) {
    // Return albums with no photos
    return visibleAlbums.map(album => ({
      id: album.id,
      title: album.title,
      description: album.description,
      photos: []
    }))
  }

  // Step 3: Fetch visible photos
  const uniquePhotoIds = [...new Set(albumPhotoRelations.map(rel => rel.photo_id))]
  if (uniquePhotoIds.length === 0) {
    return visibleAlbums.map(album => ({
      id: album.id,
      title: album.title,
      description: album.description,
      photos: []
    }))
  }

  const { data: photosData, error: photosError } = await supabase
    .from('photos')
    .select('id, url, thumbnail_url, alt_text, visible, created_at, updated_at, title, description, year')
    .in('id', uniquePhotoIds)
    .eq('visible', true)

  if (photosError) throw photosError
  if (!photosData || photosData.length === 0) {
    return visibleAlbums.map(album => ({
      id: album.id,
      title: album.title,
      description: album.description,
      photos: []
    }))
  }

  // Step 4: Map photos to albums
  const photosMap = new Map<string, Photo>(photosData.map(p => [p.id, p as Photo]))

  const populatedAlbums: PublicAlbumPreview[] = visibleAlbums.map(album => {
    const photosForThisAlbum = albumPhotoRelations
      .filter(rel => rel.album_id === album.id)
      .map(rel => photosMap.get(rel.photo_id))
      .filter((p): p is Photo => p !== undefined && p !== null)

    return {
      id: album.id,
      title: album.title,
      description: album.description,
      photos: photosForThisAlbum
    }
  }).filter(album => album.photos.length > 0)

  // Cache the result
  setCachedData(cacheKey, populatedAlbums)
  console.log('💾 Cached gallery data')

  return populatedAlbums
}

/**
 * Create a new album
 */
export async function createAlbum(albumData: {
  title: string
  description?: string
  visible?: boolean
}): Promise<Album> {
  // Get the highest order number
  const { data: maxOrderData } = await supabase
    .from('albums')
    .select('order_number')
    .order('order_number', { ascending: false })
    .limit(1)

  const nextOrderNumber = (maxOrderData?.[0]?.order_number || 0) + 1

  const { data, error } = await supabase
    .from('albums')
    .insert({
      ...albumData,
      order_number: nextOrderNumber,
      visible: albumData.visible ?? true
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update an album
 */
export async function updateAlbum(
  albumId: string,
  updates: Partial<Omit<Album, 'id' | 'created_at' | 'updated_at'>>
): Promise<Album> {
  const { data, error } = await supabase
    .from('albums')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', albumId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete an album
 */
export async function deleteAlbum(albumId: string): Promise<void> {
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('id', albumId)

  if (error) throw error
}

/**
 * Add photos to an album
 */
export async function addPhotosToAlbum(
  albumId: string,
  photoIds: string[]
): Promise<void> {
  // Get the highest order number for this album
  const { data: maxOrderData } = await supabase
    .from('album_photos')
    .select('order_number')
    .eq('album_id', albumId)
    .order('order_number', { ascending: false })
    .limit(1)

  let nextOrderNumber = (maxOrderData?.[0]?.order_number || 0) + 1

  const { error } = await supabase
    .from('album_photos')
    .insert(
      photoIds.map(photoId => ({
        album_id: albumId,
        photo_id: photoId,
        order_number: nextOrderNumber++
      }))
    )

  if (error) throw error
}

/**
 * Remove a photo from an album
 */
export async function removePhotoFromAlbum(
  albumId: string,
  photoId: string
): Promise<void> {
  const { error } = await supabase
    .from('album_photos')
    .delete()
    .match({
      album_id: albumId,
      photo_id: photoId
    })

  if (error) throw error
}

/**
 * Update photo order in an album
 */
export async function updatePhotoOrder(
  albumId: string,
  photoOrders: { photo_id: string; order_number: number }[]
): Promise<void> {
  // Delete existing relations
  const { error: deleteError } = await supabase
    .from('album_photos')
    .delete()
    .eq('album_id', albumId)

  if (deleteError) throw deleteError

  // Insert with new order
  const { error: insertError } = await supabase
    .from('album_photos')
    .insert(
      photoOrders.map(po => ({
        album_id: albumId,
        photo_id: po.photo_id,
        order_number: po.order_number
      }))
    )

  if (insertError) throw insertError
}