import type { Photo } from '../types'

export const fetchPhotosFromAPI = async (): Promise<{ data: Photo[], error: Error | null }> => {
  // Implementeer je nieuwe API call hier
  return { data: [], error: null }
}

export const deletePhotoFromAPI = async (photoId: string): Promise<void> => {
  // Implementeer je nieuwe API call hier
  console.log(`Deleting photo ${photoId}`)
} 