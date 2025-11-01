import { useState, useCallback } from 'react'
import {
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addPhotosToAlbum,
  removePhotoFromAlbum,
  updatePhotoOrder
} from '../services/albumService'
import type { Album, AlbumWithDetails } from '../types'

interface UseAlbumMutationsReturn {
  creating: boolean
  updating: boolean
  deleting: boolean
  error: string | null
  create: (data: { title: string; description?: string; visible?: boolean }) => Promise<Album>
  update: (albumId: string, updates: Partial<Omit<Album, 'id' | 'created_at' | 'updated_at'>>) => Promise<Album>
  remove: (albumId: string) => Promise<void>
  addPhotos: (albumId: string, photoIds: string[]) => Promise<void>
  removePhoto: (albumId: string, photoId: string) => Promise<void>
  reorderPhotos: (albumId: string, photoOrders: { photo_id: string; order_number: number }[]) => Promise<void>
  updateCoverPhoto: (albumId: string, photoId: string) => Promise<Album>
  toggleVisibility: (album: AlbumWithDetails) => Promise<Album>
}

export function useAlbumMutations(): UseAlbumMutationsReturn {
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (data: { title: string; description?: string; visible?: boolean }) => {
    try {
      setCreating(true)
      setError(null)
      const album = await createAlbum(data)
      return album
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kon album niet aanmaken'
      setError(message)
      throw err
    } finally {
      setCreating(false)
    }
  }, [])

  const update = useCallback(async (
    albumId: string,
    updates: Partial<Omit<Album, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      setUpdating(true)
      setError(null)
      const album = await updateAlbum(albumId, updates)
      return album
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kon album niet bijwerken'
      setError(message)
      throw err
    } finally {
      setUpdating(false)
    }
  }, [])

  const remove = useCallback(async (albumId: string) => {
    try {
      setDeleting(true)
      setError(null)
      await deleteAlbum(albumId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kon album niet verwijderen'
      setError(message)
      throw err
    } finally {
      setDeleting(false)
    }
  }, [])

  const addPhotos = useCallback(async (albumId: string, photoIds: string[]) => {
    try {
      setUpdating(true)
      setError(null)
      await addPhotosToAlbum(albumId, photoIds)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kon foto\'s niet toevoegen'
      setError(message)
      throw err
    } finally {
      setUpdating(false)
    }
  }, [])

  const removePhoto = useCallback(async (albumId: string, photoId: string) => {
    try {
      setUpdating(true)
      setError(null)
      await removePhotoFromAlbum(albumId, photoId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kon foto niet verwijderen'
      setError(message)
      throw err
    } finally {
      setUpdating(false)
    }
  }, [])

  const reorderPhotos = useCallback(async (
    albumId: string,
    photoOrders: { photo_id: string; order_number: number }[]
  ) => {
    try {
      setUpdating(true)
      setError(null)
      await updatePhotoOrder(albumId, photoOrders)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kon volgorde niet bijwerken'
      setError(message)
      throw err
    } finally {
      setUpdating(false)
    }
  }, [])

  const updateCoverPhoto = useCallback(async (albumId: string, photoId: string) => {
    try {
      setUpdating(true)
      setError(null)
      const album = await updateAlbum(albumId, { cover_photo_id: photoId })
      return album
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kon cover foto niet bijwerken'
      setError(message)
      throw err
    } finally {
      setUpdating(false)
    }
  }, [])

  const toggleVisibility = useCallback(async (album: AlbumWithDetails) => {
    try {
      setUpdating(true)
      setError(null)
      const updated = await updateAlbum(album.id, { visible: !album.visible })
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kon zichtbaarheid niet wijzigen'
      setError(message)
      throw err
    } finally {
      setUpdating(false)
    }
  }, [])

  return {
    creating,
    updating,
    deleting,
    error,
    create,
    update,
    remove,
    addPhotos,
    removePhoto,
    reorderPhotos,
    updateCoverPhoto,
    toggleVisibility
  }
}