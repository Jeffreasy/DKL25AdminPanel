import { photoApiClient } from '../../../api/client'
import type { Photo } from '../types'
// Import fetchAllAlbums from albumService to avoid duplication
export { fetchAllAlbums } from '../../albums/services/albumService'

interface FetchPhotosOptions {
  limit?: number
  offset?: number
  search?: string
  albumId?: string
}

export async function fetchPhotos(options: FetchPhotosOptions = {}): Promise<Photo[]> {
  const { limit, offset, search } = options

  // For now, we'll use the admin endpoint since it has more features
  // In the future, we might want to use public endpoint for non-admin users
  const response = await photoApiClient.getPhotosAdmin({
    limit,
    offset
  })

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch photos')
  }

  // Ensure response.data is an array
  let photos: Photo[] = Array.isArray(response.data) ? response.data : []

  if (search) {
    const searchLower = search.toLowerCase()
    photos = photos.filter((photo: Photo) =>
      photo.title?.toLowerCase().includes(searchLower) ||
      photo.description?.toLowerCase().includes(searchLower) ||
      photo.alt_text?.toLowerCase().includes(searchLower) ||
      photo.year?.toString().includes(searchLower)
    )
  }

  // Add album_photos relationship data (mock for now - this would come from a separate endpoint)
  // In a real implementation, we'd need an endpoint that returns photos with their album relationships
  photos = photos.map((photo: Photo) => ({
    ...photo,
    album_photos: [] // This would be populated from a separate API call
  }))

  return photos
}

// Keep backward compatibility
export async function fetchAllPhotos(): Promise<Photo[]> {
  return fetchPhotos()
}

export async function fetchPhotosCount(options: Omit<FetchPhotosOptions, 'limit' | 'offset'> = {}): Promise<number> {
  // For now, we'll fetch all and count - in a real implementation,
  // we'd have a dedicated count endpoint
  const photos = await fetchPhotos(options)
  return photos.length
}

export async function deletePhoto(photoId: string): Promise<void> {
  const response = await photoApiClient.deletePhoto(photoId)

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete photo')
  }
}

export async function updatePhotoVisibility(photoId: string, visible: boolean): Promise<void> {
  const response = await photoApiClient.updatePhoto(photoId, { visible })

  if (!response.success) {
    throw new Error(response.error || 'Failed to update photo visibility')
  }
}

export async function fetchPhotoAlbums(photoId: string): Promise<string[]> {
  // This would need a separate endpoint to get album relationships for a photo
  // For now, return empty array - could be implemented with GET /api/photos/:id/albums
  console.warn(`fetchPhotoAlbums not fully implemented for photo ${photoId}`)
  return []
}

// fetchAllAlbums is now exported from albumService above (line 5)
// This removes ~60 lines of duplicate code

export async function addPhotoToAlbum(photoId: string, albumId: string): Promise<void> {
  // Use the album photo relationship endpoint from albumService
  const { addPhotosToAlbum } = await import('../../albums/services/albumService')
  await addPhotosToAlbum(albumId, [photoId])
}

export async function addPhotosToAlbums(photoIds: string[], albumIds: string[]): Promise<void> {
  // Add photos to multiple albums
  const { addPhotosToAlbum } = await import('../../albums/services/albumService')
  for (const albumId of albumIds) {
    await addPhotosToAlbum(albumId, photoIds)
  }
}

export async function removePhotoFromAlbum(photoId: string, albumId: string): Promise<void> {
  // Use the album photo relationship endpoint from albumService
  const { removePhotoFromAlbum } = await import('../../albums/services/albumService')
  await removePhotoFromAlbum(albumId, photoId)
}

// Bulk operations
export async function bulkDeletePhotos(photoIds: string[]): Promise<void> {
  // Delete photos one by one - in a real implementation, we'd have a bulk delete endpoint
  for (const photoId of photoIds) {
    await deletePhoto(photoId)
  }
}

export async function bulkUpdatePhotoVisibility(photoIds: string[], visible: boolean): Promise<void> {
  // Update photos one by one - in a real implementation, we'd have a bulk update endpoint
  for (const photoId of photoIds) {
    await updatePhotoVisibility(photoId, visible)
  }
}

export async function bulkAddPhotosToAlbum(photoIds: string[], albumId: string): Promise<void> {
  // Use the album photo relationship endpoint
  const { addPhotosToAlbum } = await import('../../albums/services/albumService')
  await addPhotosToAlbum(albumId, photoIds)
}